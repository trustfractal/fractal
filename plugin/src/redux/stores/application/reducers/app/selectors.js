import { createSelector } from "reselect";

export const isLaunched = createSelector(
  (state) => state.app,
  (app) => app.launched,
);

export const isSetup = createSelector(
  (state) => state.app,
  (app) => app.setup,
);

export const getTokensContractsAddresses = createSelector(
  (state) => state.app,
  (app) => app.addresses.staking,
);

export const getStakingContractsAddresses = createSelector(
  (state) => state.app,
  (app) => app.addresses.erc20,
);

export const getClaimsRegistryContractAddress = createSelector(
  (state) => state.app,
  (app) => app.addresses.claimsRegistry,
);

export const getNetwork = createSelector(
  (state) => state.app,
  (app) => app.addresses.network,
);

export const getAttesterAdddress = createSelector(
  (state) => state.app,
  (app) => app.addresses.issuerAddress,
);
