import EthereumProviderService from "@services/EthereumProviderService/Web3ProviderService";

import ConnectionTypes from "@models/Connection/types";

const MEGALODON_SESSION_KEY = "megalodon_token";

export const getBackendSession = () =>
  localStorage.getItem(MEGALODON_SESSION_KEY);

export const getAccountAddress = () =>
  EthereumProviderService.getAccountAddress();

export const getStakingDetails = ([
  address,
  tokenContractAddress,
  stakingTokenContractAddress,
]: [string, string, string]) =>
  EthereumProviderService.getStakingDetails(
    address,
    tokenContractAddress,
    stakingTokenContractAddress,
  );

export const getSignedNonce = ([nonce, address]: [string, string]) =>
  EthereumProviderService.getSignedNonce(nonce, address);

export const approveStake = ([
  address,
  amount,
  tokenContractAddress,
  stakingTokenContractAddress,
]: [string, string, string, string, string]) =>
  EthereumProviderService.approveStake(
    address,
    amount,
    tokenContractAddress,
    stakingTokenContractAddress,
  );

export const stake = ([
  address,
  amount,
  serializedCredential,
  tokenContractAddress,
  stakingTokenContractAddress,
]: [string, string, string, string, string]) =>
  EthereumProviderService.stake(
    address,
    amount,
    serializedCredential,
    tokenContractAddress,
    stakingTokenContractAddress,
  );

export const withdraw = ([address, stakingTokenContractAddress]: [
  string,
  string,
]) => EthereumProviderService.withdraw(address, stakingTokenContractAddress);

const Callbacks = {
  [ConnectionTypes.GET_BACKEND_SESSION_INPAGE]: { callback: getBackendSession },
  [ConnectionTypes.GET_ACCOUNT_ADDRESS_INPAGE]: { callback: getAccountAddress },
  [ConnectionTypes.GET_STAKING_DETAILS_INPAGE]: { callback: getStakingDetails },
  [ConnectionTypes.GET_SIGNED_NONCE_INPAGE]: { callback: getSignedNonce },
  [ConnectionTypes.APPROVE_STAKE_INPAGE]: { callback: approveStake },
  [ConnectionTypes.STAKE_INPAGE]: { callback: stake },
  [ConnectionTypes.WITHDRAW_INPAGE]: { callback: withdraw },
};

export default Callbacks;
