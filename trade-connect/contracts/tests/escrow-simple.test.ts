import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EscrowProgram } from "../target/types/escrow_program";

import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new anchor.web3.PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

describe("Escrow Program Unit Tests", () => {

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.EscrowProgram as Program<EscrowProgram>;

  
  // anchor.web3.PublicKey.createProgramAddressSync();

  // to get pda and bump needed to index the data we want on-chain
  const [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('seed'), provider.wallet.publicKey.toBuffer()], 
    program.programId
  );

  it("Escrow is initialized!", async () => {
    const escrow_keypair = (program.provider as anchor.AnchorProvider).wallet

    const admin = anchor.web3.Keypair.generate();
    const trader_a = anchor.web3.Keypair.generate();
    const trader_b = anchor.web3.Keypair.generate();

    const payload = {
      company_id: "company-id",
      trader_a: trader_a.publicKey,
      trader_b: trader_b.publicKey,
      trader_a_tokens: [trader_a.publicKey, trader_b.publicKey],
      trader_b_tokens: [trader_b.publicKey, trader_a.publicKey],
    };

    // Add your test here.
    const tx = await program.methods.initialize(
      payload.company_id,
      payload.trader_a,
      payload.trader_b,
      payload.trader_a_tokens,
      payload.trader_b_tokens,
    )
    .accounts({
      escrowAccount: escrow_keypair.publicKey,
      admin: admin.publicKey,
    })
    .signers([admin])
    .rpc();
    
    console.log("Your transaction signature", tx);
  });
});