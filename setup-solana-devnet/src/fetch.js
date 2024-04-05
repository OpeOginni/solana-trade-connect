import { fetchAllDigitalAssetByOwner } from "@metaplex-foundation/mpl-token-metadata";
import umi from "./umi.js";

async function main() {
  const owner = "24fvDahwXfPsVBZS8bVZsPYgVRZXAXUtmdHAkeTHqNza";
  const assets = await fetchAllDigitalAssetByOwner(umi, owner);

  console.log(assets);
}

main();
