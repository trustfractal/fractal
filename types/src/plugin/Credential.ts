import { ISerializable } from "./Common";

import { IAttestedClaim as ISDKAttestedClaim } from "@fractalwallet/sdk";
import { ITransactionDetails } from "./Transaction";

export interface ICredential extends ISDKAttestedClaim, ISerializable {
  level: string;
  transaction?: ITransactionDetails;
  valid: boolean;
}
