import environment from "@environment/index";

import appActions, { appTypes } from "@redux/stores/application/reducers/app";

import GoldfishService from "@services/GoldfishService";
import RPCProviderService from "@services/EthereumProviderService/RPCProviderService";

import StakingDetailsPolling from "@models/Polling/StakingDetailsPolling";
import CredentialsValidityPolling from "@models/Polling/CredentialsValidityPolling";

export const startup = () => {
  return async (dispatch) => {
    // setup addresses
    const {
      fclContract,
      fclUniswapContract,
      stackingFclContract,
      stackingFclUniswapContract,
      didContract,
      ethereumNetwork,
      issuerAddress,
    } = await GoldfishService.getAddresses();

    dispatch(
      appActions.setAddresses({
        staking: {
          FCL: fclContract,
          FCL_ETH_LP: fclUniswapContract,
        },
        erc20: {
          FCL: stackingFclContract,
          FCL_ETH_LP: stackingFclUniswapContract,
        },
        claimsRegistry: didContract,
        ethereumNetwork,
        issuerAddress,
      }),
    );

    // setup rpc provider
    await RPCProviderService.init(
      environment.ETHEREUM_RPC_URL,
      ethereumNetwork,
    );

    // start staking details polling
    new StakingDetailsPolling().start();

    // start credentials validity polling
    new CredentialsValidityPolling().start();

    dispatch(appActions.setLaunched(true));
  };
};

const Aliases = {
  [appTypes.STARTUP]: startup,
};

export default Aliases;
