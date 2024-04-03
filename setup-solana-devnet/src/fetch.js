import { fetchAllDigitalAssetByOwner } from "@metaplex-foundation/mpl-token-metadata";
import umi from "./umi.js";

async function main() {
  const owner = "BLLRB6T4ppJKvqbBH7ZvRA945CVVf2PWYTUtHyGNricy";
  const assets = await fetchAllDigitalAssetByOwner(umi, owner);

  console.log(assets);
}

main();
