import { createV1, mintV1, TokenStandard, createNft } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
import fs from "fs";
import path from "path";
import umi from "./src/umi.js";
// const umi = require("./src/umi").default;

const nfts = [
  {
    name: "Trade Connect NFT 1",
    description: "This is NFT 1",
    imageFile: "./images/nft_1.jpg",
    destination: "24fvDahwXfPsVBZS8bVZsPYgVRZXAXUtmdHAkeTHqNza",
    alreadySavedURI: "",
  },
  {
    name: "Trade Connect NFT 2",
    description: "This is NFT 2",
    imageFile: "./images/nft_2.jpg",
    destination: "ERaTx7xhUwZWeyQDjJ4jUJTtai3DutFDZuG2nUBY8F1Y",
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
// OR

// for (const nft of nfts) {
//   const mint = generateSigner(umi);
//   await createNft(umi, {
//     mint,
//     name: nft.name,
//     tokenOwner: nft.destination,
//     uri: nft.alreadySavedURI,
//     sellerFeeBasisPoints: percentAmount(5.5),
//   }).sendAndConfirm(umi);
// }
