import {
  ICredential,
  ITransactionDetails,
  ISerializable,
} from "@fractalwallet/types";

import { AttestedClaim as SDKAttestedClaim } from "@fractalwallet/sdk";
import TransactionDetails from "@models/Transaction/TransactionDetails";

export default class Credential
  extends SDKAttestedClaim
  implements ICredential, ISerializable {
  public level: string;
  public transaction?: ITransactionDetails;
  public valid: boolean;

  public constructor(
    credential: SDKAttestedClaim,
    level: string,
    transaction?: ITransactionDetails,
    valid: boolean = false,
  ) {
    super({
      claim: credential.claim,
      rootHash: credential.rootHash,
      attestedClaimHash: credential.attestedClaimHash,
      attestedClaimSignature: credential.attestedClaimSignature,
      attesterAddress: credential.attesterAddress,
      attesterSignature: credential.attesterSignature,
      claimerAddress: credential.claimerAddress,
      claimerSignature: credential.claimerSignature,
      claimTypeHash: credential.claimTypeHash,
      claimHashTree: credential.claimHashTree,
    });
    this.level = level;
    this.transaction = transaction;
    this.valid = valid;
  }

  public serialize(): string {
    return JSON.stringify({
      claim: this.claim,
      rootHash: this.rootHash,
      attestedClaimHash: this.attestedClaimHash,
      attestedClaimSignature: this.attestedClaimSignature,
      attesterAddress: this.attesterAddress,
      attesterSignature: this.attesterSignature,
      claimerAddress: this.claimerAddress,
      claimerSignature: this.claimerSignature,
      claimTypeHash: this.claimTypeHash,
      claimHashTree: this.claimHashTree,
      level: this.level,
      transaction: this.transaction?.serialize(),
      valid: this.valid,
    });
  }

  public static parse(str: string): ICredential {
    const {
      claim,
      rootHash,
      attestedClaimHash,
      attestedClaimSignature,
      attesterAddress,
      attesterSignature,
      claimerAddress,
      claimerSignature,
      claimTypeHash,
      claimHashTree,
      level,
      transaction,
      valid,
    } = JSON.parse(str);

    const attestedCLaim = new SDKAttestedClaim({
      claim,
      rootHash,
      attestedClaimHash,
      attestedClaimSignature,
      attesterAddress,
      attesterSignature,
      claimerAddress,
      claimerSignature,
      claimTypeHash,
      claimHashTree,
    });

    let transactionInstance;

    if (transaction) {
      transactionInstance = TransactionDetails.parse(transaction);
    }

    return new Credential(attestedCLaim, level, transactionInstance, valid);
  }
}
