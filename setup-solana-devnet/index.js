import { createV1, mintV1, TokenStandard, createNft } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
import fs from "fs";
import path from "path";
import umi from "./src/umi.js";
// const umi = require("./src/umi").default;

const nfts = [
  {
    name: "Trade Connect NFT 3",
    description: "This is NFT 3",
    imageFile: "./images/nft_1.jpg",
    destination: "9qdhXAAAbjDejBKSJPv7vYdSvxTn7KVkEHo3pVvQ4ssB",
    alreadySavedURI: "",
  },
  {
    name: "Trade Connect NFT 4",
    description: "This is NFT 4",
    imageFile: "./images/nft_2.jpg",
    destination: "9qdhXAAAbjDejBKSJPv7vYdSvxTn7KVkEHo3pVvQ4ssB",
    alreadySavedURI: "",
  },
];
const __dirname = path.resolve();

async function main() {
  let mintAddresses = "";

  for (const nft of nfts) {
    const imageFile = fs.readFileSync(path.resolve(__dirname, nft.imageFile));
    console.log(imageFile);
    const [imageUri] = await umi.uploader.upload([imageFile]);
    const uri = await umi.uploader.uploadJson({
      name: nft.name,
      description: nft.description,
      image: imageUri,
    });

    const mint = generateSigner(umi);
    await createNft(umi, {
      mint,
      name: nft.name,
      uri: uri,
      sellerFeeBasisPoints: percentAmount(5.5),
      tokenOwner: nft.destination,
    }).sendAndConfirm(umi);
    mintAddresses += `NFT Name: ${nft.name}, Mint Address: ${mint.publicKey.toString()}\n`;

    console.log(`Sent NFT: ${mint.publicKey} to ${nft.destination}`);
  }
  fs.writeFileSync("mintAddresses.txt", mintAddresses);
}
main();

// https://developers.metaplex.com/token-metadata/mint
