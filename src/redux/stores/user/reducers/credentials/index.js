import mirrorCreator from "mirror-creator";
import { createActions, handleActions } from "redux-actions";

import CredentialsCollection from "@models/Credential/CredentialsCollection";

const types = mirrorCreator([
  "SET_CREDENTIALS",
  "SET_VERIFICATION_CASES",
  "FETCH_CREDENTIALS_AND_VERIFICATION_CASES",
]);

const creators = createActions(
  types.SET_CREDENTIALS,
  types.SET_VERIFICATION_CASES,
  types.FETCH_CREDENTIALS_AND_VERIFICATION_CASES,
);

const initialState = {
  credentials: "[]",
  verificationCases: "[]",
};

export const reducer = handleActions(
  {
    [types.SET_CREDENTIALS]: (state, { payload: credentials }) => {
      if (!(credentials instanceof CredentialsCollection)) {
        credentials = CredentialsCollection.fromArray(credentials);
      }
      return Object.freeze({
        ...state,
        credentials: credentials.serialize(),
      });
    },
    [types.SET_VERIFICATION_CASES]: (state, { payload: verificationCases }) =>
      Object.freeze({
        ...state,
        verificationCases: verificationCases.serialize(),
      }),
  },
  initialState,
);

export async function restore(state = {}) {
  return {
    ...initialState,
    ...state,
  };
}

export async function store(state) {
  return {
    credentials: state.credentials,
    verificationCases: state.verificationCases,
  };
}

export const credentialsTypes = types;

export default creators;
