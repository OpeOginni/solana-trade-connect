import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { AnchorProvider, setProvider, Program } from "@project-serum/anchor";
const adminWallet = Keypair.fromSecretKey(Buffer.from(process.env.SOLANA_ADMIN_PRIVATE_KEY!, "base64"));

const connection = new Connection(process.env.SOLANA_DEVNET_RPC_URL!, "confirmed");

setProvider(AnchorProvider.env());

const idl = require("../lib/idl.json");
const programId = new PublicKey(process.env.SOLANA_PROGRAM_ID!);

const program = new Program(idl, programId);
export default program;
