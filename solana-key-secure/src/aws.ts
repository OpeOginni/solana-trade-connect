import { Keypair } from "@solana/web3.js";
import {
  KMSClient,
  ListAliasesCommand,
  EncryptCommand,
  DecryptCommand,
  ReEncryptCommand,
} from "@aws-sdk/client-kms";

interface AWSCredentials {
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  KMS_KEY_ID: string;
}

export class SolanaAWSKeySecure {
  private credentials: AWSCredentials;
  private ksmClient: KMSClient;

  constructor(config: AWSCredentials) {
    this.credentials = config;
    this.ksmClient = new KMSClient({
      region: this.credentials.AWS_REGION,
      // serviceId: this.credentials.KMS_KEY_ID,
      credentials: {
        accessKeyId: this.credentials.AWS_ACCESS_KEY_ID,
        secretAccessKey: this.credentials.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async createWallet() {
    const { publicKey, secretKey } = Keypair.generate();

    this.ksmClient.send;
  }
}
