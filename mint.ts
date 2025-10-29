import * as anchor from "@coral-xyz/anchor";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  Connection,
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createInitializeMintInstruction,
  getAccount,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import IDL from "./IDL/ecom_dapp.json";
import { EcomDapp } from "./IDL/ecom_dapp";
import { AnchorProvider } from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import React, { Provider } from "react";

const local = "http://127.0.0.1:8899";
const devnet = "https://api.devnet.solana.com";

const connection = new Connection(devnet);

const ECOM_PROGRAM_ID = "FYo4gi69vTJZJMnNxj2mZz2Q9CbUu12rQDVtHNUFQ2o7";

function createProvider(wallet: any) {
  const walletConnection = wallet.connection || connection;

  console.log(
    "Creating provider with connection:",
    walletConnection.rpcEndpoint
  );

  return new anchor.AnchorProvider(walletConnection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
}

// ==================== ESCROW FUNCTIONS ====================

export class Escrow {
  private provider: anchor.AnchorProvider;
  private program: anchor.Program<EcomDapp>;
  private connection: Connection;
  constructor(walletAdapter: any) {
    this.provider = createProvider(walletAdapter);
    anchor.setProvider(this.provider);
    this.program = new anchor.Program<EcomDapp>(IDL as EcomDapp, this.provider);
    this.connection = connection;
  }
  async initMint(
    walletAdapter: AnchorWallet,
    buyerPubkey: PublicKey,
    sellerPubkey: PublicKey
  ): Promise<
    | {
        success: true;
        mint: string;
        escrowPda: string;
        userAta: string;
        buyerAta: string;
        sellerAta: string;
        escrowAta: string;
      }
    | { success: false; error: string }
  > {
    console.log("Create Mint started...");
    console.log(`
      From SDK..
      seller pubkey: ${sellerPubkey.toBase58()},
      buyer pubkey: ${buyerPubkey.toBase58()}
      walletAdapter: ${walletAdapter}
    `);

    let mint: anchor.web3.PublicKey;
    let escrowAta: anchor.web3.PublicKey;
    let sellerAta: anchor.web3.PublicKey;
    let buyerAta: anchor.web3.PublicKey;
    let userAta: anchor.web3.PublicKey;

    if (!walletAdapter || !walletAdapter.publicKey) {
      throw new Error("Wallet not connected or publicKey not available!");
    }

    if (!buyerPubkey || !sellerPubkey) {
      throw new Error("Buyer or seller PublicKey is missing!");
    }

    const provider = createProvider(walletAdapter);
    anchor.setProvider(provider);

    async function waitForAccount(connection: Connection, pubkey: PublicKey) {
      for (let i = 0; i < 5; i++) {
        try {
          await connection.getAccountInfo(pubkey);
          return true;
        } catch (e) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
      throw new Error("Account not found after retries");
    }

    console.log(`
      From Inner 
      seller pubkey: ${sellerPubkey.toBase58()}, 
      wallet Adapter publicKey: ${walletAdapter.publicKey.toBase58()},
      buyer pubkey: ${buyerPubkey.toBase58()}
    `);

    try {
      const mintKp = anchor.web3.Keypair.generate();
      const lamports = await provider.connection.getMinimumBalanceForRentExemption(82);

      const createMintTx = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: walletAdapter.publicKey,
          newAccountPubkey: mintKp.publicKey,
          space: 82,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKp.publicKey,
          9,
          walletAdapter.publicKey,
          null,
          TOKEN_PROGRAM_ID
        )
      );

      createMintTx.recentBlockhash = (
        await provider.connection.getLatestBlockhash()
      ).blockhash;
      createMintTx.feePayer = walletAdapter.publicKey;
      createMintTx.sign(mintKp);

      mint = mintKp.publicKey;
      console.log("Mint Address: ", mint.toBase58());

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), walletAdapter.publicKey.toBuffer()],
        new PublicKey(ECOM_PROGRAM_ID)
      );
      console.log("escrowPda", escrowPda.toBase58());

      userAta = getAssociatedTokenAddressSync(mint, walletAdapter.publicKey);
      buyerAta = getAssociatedTokenAddressSync(mint, buyerPubkey);
      sellerAta = getAssociatedTokenAddressSync(mint, sellerPubkey);
      escrowAta = getAssociatedTokenAddressSync(mint, escrowPda, true);

      // 1) Create the mint on-chain first
      // @ts-ignore
      await safeSend(provider, createMintTx, [mintKp]);
      // Wait for mint account to exist
      await waitForAccount(provider.connection, mint);

      // 2) Collect ATA creation instructions in a single transaction
      const ataTx = new Transaction();

      // Escrow ATA (PDA owner) — always attempt to create if missing
      try {
        await getAccount(provider.connection, escrowAta);
      } catch {
        ataTx.add(
          createAssociatedTokenAccountInstruction(
            walletAdapter.publicKey, // payer
            escrowAta,               // ata
            escrowPda,               // owner (escrow PDA)
            mint,                    // mint
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      const addAtaIfMissing = async (ata: PublicKey, owner: PublicKey) => {
        try {
          await getAccount(provider.connection, ata);
          console.log(`ATA ${ata.toBase58()} already exists`);
        } catch (error: any) {
          console.log(`Creating ATA ${ata.toBase58()}`);
          ataTx.add(
            createAssociatedTokenAccountInstruction(
              walletAdapter.publicKey, // payer
              ata,                      // ata
              owner,                    // owner
              mint,                     // mint
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            )
          );
        }
      };

      await addAtaIfMissing(userAta, walletAdapter.publicKey);
      console.log("User ATA: ", userAta.toBase58());

      await addAtaIfMissing(sellerAta, sellerPubkey);
      console.log("Seller ATA: ", sellerAta.toBase58());

      console.log("User Ata: ", userAta.toString());
      console.log("Escrow Ata (derived): ", escrowAta.toString());

      if (!buyerPubkey.equals(walletAdapter.publicKey)) {
        console.log("Buyer Ata: ", buyerAta.toString());
      } else {
        console.log("Buyer Ata: Same as User Ata");
      }

      if (!sellerPubkey.equals(walletAdapter.publicKey)) {
        console.log("Seller Ata: ", sellerAta.toString());
      } else {
        console.log("Seller Ata: Same as User Ata");
      }

      // 3) Send ATA creations if any were added
      if (ataTx.instructions.length > 0) {
        // @ts-ignore
        await safeSend(provider, ataTx, []);
      }

      // 4) Mint some tokens to the user ATA (example amount)
      const amount = new BN(200).mul(new BN(10 ** 9));
      const mintTx = new Transaction().add(
        createMintToInstruction(
          mint,
          userAta,
          walletAdapter.publicKey,
          Number(amount)
        )
      );
      // @ts-ignore
      await safeSend(provider, mintTx, []);

      async function safeSend(provider: AnchorProvider, tx: any, signers = []) {
        for (let i = 0; i < 3; i++) {
          try {
            const sig = await provider.sendAndConfirm(tx, signers);
            console.log(`Succeeded on ${i} try..`);

            return sig;
          } catch (err) {
            if ((err as Error).message.includes("Node is unhealthy")) {
              console.warn("Retrying due to unhealthy node...");
              await new Promise((r) => setTimeout(r, 1000));
              continue;
            }
            throw err;
          }
        }
        throw new Error("Failed after multiple retries");
      }

      // (moved mint creation earlier)

      return {
        success: true,
        mint: mint.toBase58(),
        escrowPda: escrowPda.toBase58(),
        userAta: userAta.toBase58(),
        buyerAta: buyerAta.toBase58(),
        sellerAta: sellerAta.toBase58(),
        escrowAta: escrowAta.toBase58(),
      };
    } catch (error: any) {
      console.error("Failed to create mint:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  async initCreatePayment(walletAdapter: AnchorWallet, totalAmount: number) {
    try {
      const [paymentPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("payment"), walletAdapter.publicKey.toBuffer()],
        new PublicKey(ECOM_PROGRAM_ID)
      );

      try {
        const existingAccount = await this.provider.connection.getAccountInfo(
          paymentPda
        );
        if (existingAccount) {
          console.log("Payment account already exists, skipping creation");
          return {
            success: true,
            transaction: "Account already exists",
            payment: paymentPda.toString(),
          };
        }
      } catch (checkError) {}

      const tx = await this.program.methods
        .createPayment(new BN(totalAmount), paymentPda, null)
        .accounts({
          signer: walletAdapter.publicKey,
          payment: paymentPda,
          system_program: SystemProgram.programId,
        } as any)
        .rpc({
          skipPreflight: false,
          preflightCommitment: "confirmed",
          commitment: "confirmed",
        });
      return {
        success: true,
        transaction: tx,
        payment: paymentPda.toString(),
      };
    } catch (error) {
      console.error("Something went wrong...", error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async initEscrow(
    walletAdapter: AnchorWallet,
    buyerPubkey: PublicKey,
    seller: PublicKey
  ) {
    const provider = createProvider(walletAdapter);
    anchor.setProvider(provider);

    if (!walletAdapter) {
      new Error("Wallet not connected..");
    }
    if (!buyerPubkey && !seller) {
      new Error("Buyer or Seller pubkey missing..");
    }

    console.log("SDK");
    console.log("Wallet");
  }

  async initEscrowDeposite(productId: string) {}

  async initEscrowwithdraw(productId: string) {}
}
