import ContentScriptConnection from "@background/connection";

import ConnectionTypes from "@models/Connection/types";
import FractalWebpageMiddleware from "@models/Connection/middlewares/FractalWebpageMiddleware";
import StakingStatus from "@models/Staking/status";
import StakingDetails from "@models/Staking/StakingDetails";

import UserStore from "@redux/stores/user";
import {
  getAccount,
  getStakingAllowedAmount,
  getStakingStatus,
} from "@redux/stores/user/reducers/wallet/selectors";
import walletActions, { walletTypes } from "@redux/stores/user/reducers/wallet";

import AppStore from "@redux/stores/application";
import authActions from "@redux/stores/application/reducers/auth";
import credentialsActions from "@redux/stores/user/reducers/credentials";
import appActions from "@redux/stores/application/reducers/app";
import {
  getTokensContractsAddresses,
  getStakingContractsAddresses,
} from "@redux/stores/application/reducers/app/selectors";

import {
  ERROR_NO_ACCOUNT,
  ERROR_NOT_ON_FRACTAL,
  ERROR_USER_NOT_LOGGED_IN,
} from "@models/Connection/Errors";
import TokenTypes from "@models/Token/types";
export const connectWallet = () => {
  return async (dispatch) => {
    dispatch(walletActions.connectWalletPending());

    try {
      // ensure that the active port is on the fractal domain
      await new FractalWebpageMiddleware().apply();

      // get active connected chrome port
      const fractalPort = await ContentScriptConnection.getConnectedPort();

      if (!fractalPort) throw ERROR_NOT_ON_FRACTAL();

      // get megalodon session
      const sessions = await ContentScriptConnection.invoke(
        ConnectionTypes.GET_BACKEND_SESSIONS_INPAGE,
        [],
        fractalPort.id,
      );

      if (!sessions.megalodon) throw ERROR_USER_NOT_LOGGED_IN();

      // get ethereumm wallet account address
      const account = await ContentScriptConnection.invoke(
        ConnectionTypes.GET_ACCOUNT_ADDRESS_INPAGE,
        [],
        fractalPort.id,
      );

      if (!account) throw ERROR_NO_ACCOUNT();

      // save app setup flag
      AppStore.getStore().dispatch(appActions.setSetup(true));

      // save session
      AppStore.getStore().dispatch(authActions.setBackendSessions(sessions));

      // get user's self attested claims
      dispatch(credentialsActions.fetchCredentialsList());

      // save wallet address on the redux store
      dispatch(walletActions.setAccount(account));
      dispatch(walletActions.connectWalletSuccess());

      dispatch(walletActions.fetchStakingDetails());
    } catch (error) {
      console.error(error);
      dispatch(walletActions.connectWalletFailed(error.message));
    }
  };
};

function getNextStakingStatus(previousStakingStatus, details) {
  if (details.userStakedAmount.isZero()) {
    if (previousStakingStatus === StakingStatus.STAKING_PENDING) {
      return StakingStatus.STAKING_PENDING;
    }

    if (previousStakingStatus === StakingStatus.APPROVAL_PENDING) {
      const allowedAmount = getStakingAllowedAmount(
        UserStore.getStore().getState(),
      );

      if (details.stakingAllowedAmount.gte(allowedAmount)) {
        return StakingStatus.APPROVED;
      }

      return StakingStatus.APPROVAL_PENDING;
    }

    if (previousStakingStatus === StakingStatus.APPROVED) {
      return StakingStatus.APPROVED;
    }

    return StakingStatus.START;
  }

  if (previousStakingStatus === StakingStatus.WITHDRAW_PENDING) {
    return StakingStatus.WITHDRAW_PENDING;
  }

  return StakingStatus.STAKED;
}

export const fetchTokenStakingDetails = ({ payload: token }) => {
  return async (dispatch, getState) => {
    const account = getAccount(getState());

    // get staking contracts
    const tokenContractAddress = getTokensContractsAddresses(
      AppStore.getStore().getState(),
    )[token];
    const stakingContractAddress = getStakingContractsAddresses(
      AppStore.getStore().getState(),
    )[token];

    const activeTab = await ContentScriptConnection.getActiveConnectionPort();
    if (activeTab === undefined) {
      return;
    }

    // fetch staking details
    const serializedStakingDetails = await ContentScriptConnection.invoke(
      ConnectionTypes.GET_STAKING_DETAILS_INPAGE,
      [account, tokenContractAddress, stakingContractAddress],
      activeTab.id,
    );

    // parse staking details
    const stakingDetails = StakingDetails.parse(serializedStakingDetails);

    // update wallet staking details
    await dispatch(
      walletActions.updateStakingDetails({
        details: stakingDetails,
        token: token,
      }),
    );
  };
};

export const fetchStakingDetails = () => {
  return async (dispatch) => {
    // check if the user is connected
    const account = getAccount(UserStore.getStore().getState());
    if (account.length === 0) {
      return;
    }

    dispatch(walletActions.fetchTokenStakingDetails(TokenTypes.FCL));
    dispatch(walletActions.fetchTokenStakingDetails(TokenTypes.FCL_ETH_LP));
  };
};

export const updateStakingDetails = ({ payload: { details, token } }) => {
  return async (dispatch, getState) => {
    // update wallet staking details
    await dispatch(
      walletActions.setStakingDetails({
        details: details,
        token: token,
      }),
    );

    // update staking status
    const previousStakingStatus = getStakingStatus(getState())[token];
    const nextStakingStatus = getNextStakingStatus(
      previousStakingStatus,
      details,
    );

    await dispatch(
      walletActions.setStakingStatus({
        status: nextStakingStatus,
        token: token,
      }),
    );

    await dispatch(walletActions.setStakingLastUpdated(new Date().getTime()));
  };
};

const Aliases = {
  [walletTypes.CONNECT_WALLET_REQUEST]: connectWallet,
  [walletTypes.FETCH_TOKEN_STAKING_DETAILS]: fetchTokenStakingDetails,
  [walletTypes.FETCH_STAKING_DETAILS]: fetchStakingDetails,
  [walletTypes.UPDATE_STAKING_DETAILS]: updateStakingDetails,
};

export default Aliases;
