import { v4 as uuidv4 } from "uuid";

import UserStore from "@redux/stores/user";
import AppStore from "@redux/stores/application";

import ContentScriptConnection from "@background/connection";
import CredentialsCollection from "@models/Credential/CredentialsCollection";
import AuthMiddleware from "@models/Connection/middlewares/AuthMiddleware";
import FractalWebpageMiddleware from "@models/Connection/middlewares/FractalWebpageMiddleware";
import ConnectionTypes from "@models/Connection/types";

import { getAccount } from "@redux/stores/user/reducers/wallet/selectors";
import {
  getAttestedClaims,
  getCredentials,
} from "@redux/stores/user/reducers/credentials/selectors";
import requestsActions from "@redux/stores/user/reducers/requests";
import credentialsActions from "@redux/stores/user/reducers/credentials";

import { getClaimsRegistryContractAddress } from "@redux/stores/application/reducers/app/selectors";
import { requestsWatcher } from "@redux/middlewares/watchers";

import {
  ERROR_CREDENTIAL_NOT_FOUND,
  ERROR_CREDENTIALS_NOT_FOUND,
} from "@background/Errors";

import {
  ERROR_VERIFICATION_REQUEST_INVALID_FIELDS,
  ERROR_VERIFICATION_REQUEST_TIME_OUT,
  ERROR_VERIFICATION_REQUEST_DECLINED,
  ERROR_VERIFICATION_REQUEST_WINDOW_OPEN,
} from "@background/Errors";

import WindowsService, { PopupSizes } from "@services/WindowsService";

import { IVerificationRequest } from "@pluginTypes/plugin";
import VerificationRequest from "@models/VerificationRequest";
import CredentialsVersions from "@models/Credential/versions";
import AttestedClaim from "@models/Credential/AttestedClaim";
import SelfAttestedClaim from "@models/Credential/SelfAttestedClaim";
import TransactionDetails from "@models/Transaction/TransactionDetails";
import CredentialsStatus from "@models/Credential/status";

export const credentialStore = (
  [serializedCredential]: [string],
  port: string,
) =>
  new Promise(async (resolve, reject) => {
    try {
      const address: string = getAccount(UserStore.getStore().getState());
      const claimsRegistryContractAddress: string =
        getClaimsRegistryContractAddress(AppStore.getStore().getState());

      // redirect request to the inpage fractal provider
      const serializedTransactionDetails = await ContentScriptConnection.invoke(
        ConnectionTypes.CREDENTIAL_STORE_INPAGE,
        [address, serializedCredential, claimsRegistryContractAddress],
        port,
      );

      // parse transaction details
      const parsedTransactionDetails = TransactionDetails.parse(
        serializedTransactionDetails,
      );

      // parse the string credential
      const parsedCredential = AttestedClaim.parse(serializedCredential);

      // update parsed credentials
      parsedCredential.transaction = parsedTransactionDetails;

      // store the credential
      await UserStore.getStore().dispatch(
        credentialsActions.addAttestedClaim(parsedCredential.serialize()),
      );

      resolve(serializedTransactionDetails);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });

export const getAttestationRequest = (
  [level, serializedProperties]: [string, string],
  port: string,
) =>
  new Promise(async (resolve, reject) => {
    try {
      const address: string = getAccount(UserStore.getStore().getState());

      // redirect request to the inpage fractal provider
      const serializedRequest = await ContentScriptConnection.invoke(
        ConnectionTypes.GET_ATTESTATION_REQUEST_INPAGE,
        [address, level, serializedProperties],
        port,
      );

      resolve(serializedRequest);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });

export const hasCredential = ([id]: [string, CredentialsVersions]) =>
  new Promise((resolve, reject) => {
    try {
      const credentials: CredentialsCollection = getAttestedClaims(
        UserStore.getStore().getState(),
      );

      const credential = credentials.getByField("id", id);

      resolve(credential !== undefined);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });

export const isCredentialValid = ([id]: [string], port: string) =>
  new Promise(async (resolve, reject) => {
    try {
      const credentials: CredentialsCollection = getAttestedClaims(
        UserStore.getStore().getState(),
      );

      const credential = credentials.getByField("id", id);

      if (!credential) {
        reject(ERROR_CREDENTIAL_NOT_FOUND(id));
        return;
      }

      if (credential.version === CredentialsVersions.VERSION_TWO) {
        resolve((credential as SelfAttestedClaim).revoked === false);
        return;
      }

      // check legacy credential status on blockchain
      const address: string = getAccount(UserStore.getStore().getState());

      const claimsRegistryContractAddress: string =
        getClaimsRegistryContractAddress(AppStore.getStore().getState());

      // redirect request to the inpage fractal provider
      const status = await ContentScriptConnection.invoke(
        ConnectionTypes.GET_CREDENTIAL_STATUS_INPAGE,
        [address, credential.serialize(), claimsRegistryContractAddress],
        port,
      );

      // update credential data
      await UserStore.getStore().dispatch(
        credentialsActions.setAttestedClaimStatus({ id, status }),
      );

      resolve(status === CredentialsStatus.VALID);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });

export const getVerificationRequest = ([
  level,
  requester,
  fields = {},
  version,
]: [string, string, Record<string, boolean>, CredentialsVersions]) =>
  new Promise(async (resolve, reject) => {
    try {
      // create verification request instance
      const verificationRequest = new VerificationRequest(level, fields);

      if (!verificationRequest.validate()) {
        reject(ERROR_VERIFICATION_REQUEST_INVALID_FIELDS());
        return;
      }

      // check if the user has any level credential
      const credentials: CredentialsCollection = getCredentials(
        UserStore.getStore().getState(),
      );

      const filteredCredentials = credentials.filter((credential) => {
        if (credential.level !== level) {
          return false;
        }

        if (
          credential.version === CredentialsVersions.VERSION_ONE &&
          !(credential as AttestedClaim).valid
        ) {
          return false;
        } else if (
          credential.version === CredentialsVersions.VERSION_ONE &&
          (credential as SelfAttestedClaim).revoked
        ) {
          return false;
        }

        if (version && credential.version !== version) {
          return false;
        }

        return true;
      });

      if (filteredCredentials.length === 0) {
        reject(ERROR_CREDENTIALS_NOT_FOUND());
        return;
      }

      // generate an id
      const id = uuidv4();

      // add request to store
      await UserStore.getStore().dispatch(
        requestsActions.addVerificationRequest({
          id,
          requester,
          request: verificationRequest.serialize(),
        }),
      );

      // open popup on a new window
      const window = await WindowsService.createPopup(PopupSizes.LARGE);

      if (!window) {
        reject(ERROR_VERIFICATION_REQUEST_WINDOW_OPEN());
        return;
      }

      const onAccepted = (verificationRequest: IVerificationRequest) => {
        // close request popup
        WindowsService.closeWindow(window.id);

        // resolve promise
        resolve(verificationRequest.serialize());
      };

      const onDeclined = () => {
        // close request popup
        WindowsService.closeWindow(window.id);

        // reject promise
        reject(ERROR_VERIFICATION_REQUEST_DECLINED());
      };

      const onTimeout = async () => {
        // close request popup
        WindowsService.closeWindow(window.id);

        await UserStore.getStore().dispatch(
          requestsActions.declineVerificationRequest({
            id,
            credential: filteredCredentials[0].serialize(),
          }),
        );

        reject(ERROR_VERIFICATION_REQUEST_TIME_OUT());
      };

      requestsWatcher.listenForRequest(id, onAccepted, onDeclined, onTimeout);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });

const Callbacks = {
  [ConnectionTypes.CREDENTIAL_STORE_BACKGROUND]: {
    callback: credentialStore,
    middlewares: [new FractalWebpageMiddleware(), new AuthMiddleware()],
  },
  [ConnectionTypes.GET_ATTESTATION_REQUEST_BACKGROUND]: {
    callback: getAttestationRequest,
    middlewares: [new FractalWebpageMiddleware(), new AuthMiddleware()],
  },
  [ConnectionTypes.HAS_CREDENTIAL_BACKGROUND]: {
    callback: hasCredential,
    middlewares: [new AuthMiddleware()],
  },
  [ConnectionTypes.IS_CREDENTIAL_VALID_BACKGROUND]: {
    callback: isCredentialValid,
    middlewares: [new AuthMiddleware()],
  },
  [ConnectionTypes.GET_VERIFICATION_REQUEST_BACKGROUND]: {
    callback: getVerificationRequest,
    middlewares: [new AuthMiddleware()],
  },
};

export default Callbacks;
