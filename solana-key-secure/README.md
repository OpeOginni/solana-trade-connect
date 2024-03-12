# Solana AWS KeySecure

Solana AWS KeySecure is a TypeScript library designed to provide secure management of private keys for Solana wallets using AWS Key Management Service (KMS). It offers encryption and decryption functionalities to ensure the safety of sensitive information while interacting with the Solana blockchain.

## Installation

You can install Solana AWS KeySecure via npm:

```bash
npm install solana-aws-keysecure
```

## Features

- **Secure Key Management**: Safely store and manage private keys for Solana wallets using AWS KMS.
- **Encryption and Decryption**: Encrypt and decrypt private keys to protect sensitive information.
- **AWS Integration**: Seamlessly integrate with AWS services for robust security.
- **Easy-to-Use**: Simple and straightforward API for developers to implement.

## Usage

To get started, import the SolanaAWSKeySecure class from the package and initialize it with your AWS credentials:

```typescript
import { AWSKeySecure } from "solana-aws-keysecure";

// Initialize AWSKeySecure with your AWS credentials
const keySecure = new AWSKeySecure({
  AWS_ACCESS_KEY_ID: "your-access-key-id",
  AWS_SECRET_ACCESS_KEY: "your-secret-access-key",
  AWS_REGION: "your-aws-region",
  KMS_KEY_ID: "your-kms-key-id",
});

// Example usage: Create wallet
const walletInfo = await keySecure.createWallet();
console.log("Wallet created:", walletInfo);

// Example usage: Decrypt private key
const encodedPrivateKey = "your-encoded-private-key";
const decryptedPrivateKey = await keySecure.decryptPrivateKey(encodedPrivateKey);
console.log("Decrypted private key:", decryptedPrivateKey.toString("base64"));
```

### Available Methods

---

### `createWallet()`

Creates a new Solana wallet, encrypts the private key using AWS KMS, and returns the public key and encrypted private key.

### `decryptPrivateKey(encodedPrivateKey: string)`

Decrypts the provided encoded private key using AWS KMS and returns the decrypted private key.

### `reEncryptPrivateKey(encodedPrivateKey: string, newKMSKeyId: string)`

Re-encrypts the provided encoded private key with a new AWS KMS key ID and returns the re-encrypted private key and new KMS key ID. (In case you need to change encryption code)

### `signTransaction(encodedPrivateKey: string, connection: Connection, transaction: Transaction)`

Decrypts the provided encoded private key using AWS KMS, signs the transaction using the decrypted private key, and returns the transaction signature.

## Additional Cloud Providers

Solana AWS KeySecure currently supports AWS KMS for key management. However, support for other cloud providers and their respective KMS services, such as Google Cloud KMS, is coming soon. Stay tuned for updates!

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvement, please open an issue or submit a pull request on the GitHub repository.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/your-username/solana-aws-keysecure/blob/main/LICENSE) file for details.
