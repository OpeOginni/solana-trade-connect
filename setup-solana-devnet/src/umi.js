import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { nftStorageUploader } from "@metaplex-foundation/umi-uploader-nft-storage";
import { createSignerFromKeypair, keypairIdentity } from "@metaplex-foundation/umi";
import base58 from "bs58";

import dotenv from "dotenv";

dotenv.config();
// Use the RPC endpoint of your choice.

const DEVNET_RPC_URL = process.env.ALCHEMY_DEVNET_RPC_URL;
const DEVNET_SECRET_KEY = process.env.DEVNET_SECRET_KEY;

const secret = base58.decode(DEVNET_SECRET_KEY);

const umi = createUmi(DEVNET_RPC_URL).use(mplTokenMetadata());

const myKeypair = umi.eddsa.createKeypairFromSecretKey(secret);
const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);
umi.use(keypairIdentity(myKeypairSigner));

umi.use(nftStorageUploader({ token: process.env.NFT_STORAGE_API_TOKEN }));

export default umi;
