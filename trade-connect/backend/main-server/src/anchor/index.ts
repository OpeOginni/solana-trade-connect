import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { AnchorProvider, setProvider, Program, Wallet } from "@project-serum/anchor";
import dotenv from "dotenv";
import IDL from "./IDL";

dotenv.config();

const secretKey = process.env.SOLANA_SECRET_KEY!;

const secretKeyArray = JSON.parse(secretKey);

let adminSecretKey = Uint8Array.from(secretKeyArray);

let adminKeyPair = Keypair.fromSecretKey(adminSecretKey);
// const adminKeyPair = Keypair.fromSecretKey(Buffer.from(process.env.SOLANA_ADMIN_PRIVATE_KEY!, "base64"));

export const adminWallet = new Wallet(adminKeyPair);

const connection = new Connection(process.env.SOLANA_DEVNET_RPC_URL!, "confirmed");

const provider = new AnchorProvider(connection, adminWallet, AnchorProvider.defaultOptions());
const idl = IDL;

const programId = process.env.SOLANA_PROGRAM_ID!;

export const program = new Program(idl, programId, provider);
