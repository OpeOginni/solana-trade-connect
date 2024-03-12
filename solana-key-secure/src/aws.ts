// biome-ignore lint/style/useImportType:
import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
// biome-ignore lint/style/useImportType:
import {
  KMSClient,
  EncryptCommand,
  DecryptCommand,
  ReEncryptCommand,
  EncryptCommandInput,
  EncryptCommandOutput,
  DecryptCommandInput,
  DecryptCommandOutput,
  ReEncryptCommandInput,
  ReEncryptCommandOutput,
} from "@aws-sdk/client-kms";
// biome-ignore lint/style/useImportType:
import { Credentials } from "./types";

export default class SolanaAWSKeySecure {
  private credentials: Credentials;
  private keyId: string;
  private ksmClient: KMSClient;

  constructor(config: Credentials) {
    this.credentials = config;
    this.ksmClient = new KMSClient({
      region: this.credentials.AWS_REGION,
      // serviceId: this.credentials.KMS_KEY_ID,
      credentials: {
        accessKeyId: this.credentials.AWS_ACCESS_KEY_ID,
        secretAccessKey: this.credentials.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.keyId = this.credentials.KMS_KEY_ID;
  }

  async createWallet(): Promise<{ publicKey: PublicKey; encodedPrivateKey: string } | undefined> {
    try {
      const { publicKey, secretKey } = Keypair.generate();

      const input: EncryptCommandInput = {
        KeyId: this.keyId,
        Plaintext: secretKey,
      };

      const encryptCommand = new EncryptCommand(input);

      const encryptResult: EncryptCommandOutput = await this.ksmClient.send(encryptCommand);

      if (!Buffer.isBuffer(encryptResult.CiphertextBlob)) {
        throw new Error("Mayday Mayday");
      }
      return {
        publicKey,
        encodedPrivateKey: Buffer.from(encryptResult.CiphertextBlob).toString("base64"),
      };
    } catch (err) {
      console.error(err);
    }
  }

  async decryptPrivateKey(encodedPrivateKey: string): Promise<Buffer | undefined> {
    try {
      const input: DecryptCommandInput = {
        CiphertextBlob: Buffer.from(encodedPrivateKey, "base64"),
      };

      const decryptCommand = new DecryptCommand(input);

      const decryptResult: DecryptCommandOutput = await this.ksmClient.send(decryptCommand);

      if (!Buffer.isBuffer(decryptResult.Plaintext)) {
        throw new Error("Mayday Mayday");
      }
      return decryptResult.Plaintext;
    } catch (err) {
      console.error(err);
    }
  }

  async reEncryptPrivateKey(
    encodedPrivateKey: string,
    newKMSKeyId: string
  ): Promise<{ reEncryptedPrivateKey: string; newKMSKeyId?: string } | undefined> {
    try {
      const input: ReEncryptCommandInput = {
        CiphertextBlob: Buffer.from(encodedPrivateKey, "base64"),
        SourceKeyId: this.keyId,
        DestinationKeyId: newKMSKeyId,
      };

      const reEncryptCommand = new ReEncryptCommand(input);

      const reEncryptResult: ReEncryptCommandOutput = await this.ksmClient.send(reEncryptCommand);

      if (!Buffer.isBuffer(reEncryptResult.CiphertextBlob)) {
        throw new Error("Mayday Mayday");
      }
      return {
        reEncryptedPrivateKey: Buffer.from(reEncryptResult.CiphertextBlob).toString("base64"),
        newKMSKeyId: reEncryptResult.KeyId,
      };
    } catch (err) {
      console.error(err);
    }
  }

  async signTransaction(
    encodedPrivateKey: string,
    connection: Connection,
    transaction: Transaction
  ): Promise<string | undefined> {
    const privateKey = await this.decryptPrivateKey(encodedPrivateKey);

    if (!privateKey) throw new Error("Private key not found");

    const wallet = Keypair.fromSecretKey(privateKey);
    const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);

    console.log("SIGNATURE", signature);
    return signature;
  }
}
