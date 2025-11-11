import * as anchor from "@coral-xyz/anchor";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Connection,
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

import IDL from "./IDL/ecom_dapp.json";
import { EcomDapp } from "./IDL/ecom_dapp";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import bytesToUuid from "@/app/utils/uuidConverter";

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
  private escrowPda: anchor.web3.PublicKey;
  private paymentPda: anchor.web3.PublicKey;
  private vaultPda: anchor.web3.PublicKey;
  private orderPda: anchor.web3.PublicKey;

  constructor(walletAdapter: any) {
    this.provider = createProvider(walletAdapter);
    anchor.setProvider(this.provider);

    this.program = new anchor.Program<EcomDapp>(IDL as EcomDapp, this.provider);

    this.escrowPda = anchor.web3.PublicKey.default;
    this.paymentPda = anchor.web3.PublicKey.default;
    this.vaultPda = anchor.web3.PublicKey.default;
    this.orderPda = anchor.web3.PublicKey.default;

  }
  // async initMint(
  //   walletAdapter: AnchorWallet,
  //   buyerPubkey: PublicKey,
  //   sellerPubkey: PublicKey
  // ): Promise<
  //   | {
  //       success: true;
  //       mint: string;
  //       escrowPda: string;
  //       userAta: string;
  //       buyerAta: string;
  //       sellerAta: string;
  //       escrowAta: string;
  //     }
  //   | { success: false; error: string }
  // > {
  //   console.log("Create Mint started...");
  //   console.log(`
  //     From SDK..
  //     seller pubkey: ${sellerPubkey.toBase58()},
  //     buyer pubkey: ${buyerPubkey.toBase58()}
  //     walletAdapter: ${walletAdapter}
  //   `);
    
  //   if (!walletAdapter || !walletAdapter.publicKey) {
  //     throw new Error("Wallet not connected or publicKey not available!");
  //   }

  //   if (!buyerPubkey || !sellerPubkey) {
  //     throw new Error("Buyer or seller PublicKey is missing!");
  //   }

  //   const provider = createProvider(walletAdapter);
  //   anchor.setProvider(provider);

  //   async function waitForAccount(connection: Connection, pubkey: PublicKey) {
  //     for (let i = 0; i < 5; i++) {
  //       try {
  //         await connection.getAccountInfo(pubkey);
  //         return true;
  //       } catch (e) {
  //         await new Promise((r) => setTimeout(r, 500));
  //       }
  //     }
  //     throw new Error("Account not found after retries");
  //   }

  //   console.log(`
  //     From Inner 
  //     seller pubkey: ${sellerPubkey.toBase58()}, 
  //     wallet Adapter publicKey: ${walletAdapter.publicKey.toBase58()},
  //     buyer pubkey: ${buyerPubkey.toBase58()}
  //   `);

  //   try {
  //     const mintKp = anchor.web3.Keypair.generate();
  //     const lamports = await provider.connection.getMinimumBalanceForRentExemption(82);
  //     const blockhash = await connection.getLatestBlockhash("finalized");
  //     const createMintTx = new Transaction({recentBlockhash:blockhash.blockhash}).add(
  //       SystemProgram.createAccount({
  //         fromPubkey: walletAdapter.publicKey,
  //         newAccountPubkey: mintKp.publicKey,
  //         space: 82,
  //         lamports,
  //         programId: TOKEN_PROGRAM_ID,
  //       }),
  //       createInitializeMintInstruction(
  //         mintKp.publicKey,
  //         9,
  //         walletAdapter.publicKey,
  //         null,
  //         TOKEN_PROGRAM_ID
  //       )
  //     );

  //     createMintTx.recentBlockhash = (
  //       await provider.connection.getLatestBlockhash()
  //     ).blockhash;
  //     createMintTx.feePayer = walletAdapter.publicKey;
  //     createMintTx.sign(mintKp);

  //     this.mint = mintKp.publicKey;
  //     console.log("Mint Address: ", this.mint.toBase58());

  //     [this.escrowPda] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("escrow"), walletAdapter.publicKey.toBuffer()],
  //       new PublicKey(ECOM_PROGRAM_ID)
  //     );
  //     console.log("escrowPda", this.escrowPda.toBase58());

  //     this.userAta = getAssociatedTokenAddressSync(this.mint, walletAdapter.publicKey);
  //     this.buyerAta = getAssociatedTokenAddressSync(this.mint, buyerPubkey);
  //     this.sellerAta = getAssociatedTokenAddressSync(this.mint, sellerPubkey);
  //     this.escrowAta = getAssociatedTokenAddressSync(this.mint, this.escrowPda, true);

  //     // @ts-ignore
  //     await safeSend(provider, createMintTx, [mintKp]);
  //     await waitForAccount(provider.connection, this.mint);

  //     const newBlockHash = await connection.getLatestBlockhash("finalized");
  //     const ataTx = new Transaction({recentBlockhash:newBlockHash.blockhash});

  //     try {
  //       await getAccount(provider.connection, this.escrowAta);
  //     } catch {
  //       ataTx.add(
  //         createAssociatedTokenAccountInstruction(
  //           walletAdapter.publicKey, 
  //           this.escrowAta,               
  //           this.escrowPda,               
  //           this.mint,                   
  //           TOKEN_PROGRAM_ID,
  //           ASSOCIATED_TOKEN_PROGRAM_ID
  //         )
  //       );
  //     }

  //     const addAtaIfMissing = async (ata: PublicKey, owner: PublicKey) => {
  //       try {
  //         await getAccount(provider.connection, ata);
  //         console.log(`ATA ${ata.toBase58()} already exists`);
  //       } catch (error: any) {
  //         console.log(`Creating ATA ${ata.toBase58()}`);
  //         ataTx.add(
  //           createAssociatedTokenAccountInstruction(
  //             walletAdapter.publicKey, 
  //             ata,                      
  //             owner,                    
  //             this.mint,                    
  //             TOKEN_PROGRAM_ID,
  //             ASSOCIATED_TOKEN_PROGRAM_ID
  //           )
  //         );
  //       }
  //     };

  //     await addAtaIfMissing(this.userAta, walletAdapter.publicKey);
  //     console.log("User ATA: ", this.userAta.toBase58());

  //     await addAtaIfMissing(this.sellerAta, sellerPubkey);
  //     console.log("Seller ATA: ", this.sellerAta.toBase58());

  //     console.log("User Ata: ", this.userAta.toString());
  //     console.log("Escrow Ata (derived): ", this.escrowAta.toString());

  //     if (!buyerPubkey.equals(walletAdapter.publicKey)) {
  //       console.log("Buyer Ata: ", this.buyerAta.toString());
  //     } else {
  //       console.log("Buyer Ata: Same as User Ata");
  //     }

  //     if (!sellerPubkey.equals(walletAdapter.publicKey)) {
  //       console.log("Seller Ata: ", this.sellerAta.toString());
  //     } else {
  //       console.log("Seller Ata: Same as User Ata");
  //     }

  //     if (ataTx.instructions.length > 0) {
  //       // @ts-ignore
  //       await safeSend(provider, ataTx, []);
  //     }

  //     const amount = new BN(200).mul(new BN(10 ** 9));
  //     const latestBlockhash = await connection.getLatestBlockhash("finalized");
  //     const mintTx = new Transaction({recentBlockhash:latestBlockhash.blockhash}).add(
  //       createMintToInstruction(
  //         this.mint,
  //         this.userAta,
  //         walletAdapter.publicKey,
  //         Number(amount)
  //       )
  //     );
  //     // @ts-ignore
  //     await safeSend(provider, mintTx, []);

  //     async function safeSend(provider: AnchorProvider, tx: any, signers = []) {
  //       for (let i = 0; i < 3; i++) {
  //         try {
  //           const sig = await provider.sendAndConfirm(tx, signers);
  //           console.log(`Succeeded on ${i} try..`);

  //           return sig;
  //         } catch (err) {
  //           if ((err as Error).message.includes("Node is unhealthy")) {
  //             console.warn("Retrying due to unhealthy node...");
  //             await new Promise((r) => setTimeout(r, 1000));
  //             continue;
  //           }
  //           throw err;
  //         }
  //       }
  //       throw new Error("Failed after multiple retries");
  //     }

  //     return {
  //       success: true,
  //       mint: this.mint.toBase58(),
  //       escrowPda: this.escrowPda.toBase58(),
  //       userAta: this.userAta.toBase58(),
  //       buyerAta: this.buyerAta.toBase58(),
  //       sellerAta: this.sellerAta.toBase58(),
  //       escrowAta: this.escrowAta.toBase58(),
  //     };
  //   }catch (error) {
  //     console.error("Something went wrong...", error);
  //     return {
  //       success: false,
  //       error: (error as Error).message,
  //     };
  //   }
  // }

  async initPayment(walletAdapter: AnchorWallet, totalAmount: number) {
    try {
      [this.paymentPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("payment"), walletAdapter.publicKey.toBuffer()],
        new PublicKey(ECOM_PROGRAM_ID)
      );

      try {
        const existingAccount = await this.provider.connection.getAccountInfo(this.paymentPda);
        const paymentDetails = await this.program.account.payment.fetch(this.paymentPda);
        console.log("Payment Details: ",paymentDetails);
        
        if (existingAccount) {
          console.log("Payment account already exists, skipping creation",existingAccount);          
          return {
            success: true,
            transaction: "Account already exists",
            payment: this.paymentPda.toString(),
          };
        }
      } catch (error) {
        const err = error as Error
        console.error("Payment Failed!",err.message);
      }

      const tx = await this.program.methods
        .createPayment(new BN(totalAmount), this.paymentPda, null)
        .accounts({
          signer: walletAdapter.publicKey,
          payment: this.paymentPda,
          system_program: SystemProgram.programId,
        } as any)
        .rpc({
          skipPreflight: false,
          preflightCommitment: "confirmed",
          commitment: "confirmed",
        });
        const newPaymentAccount = await this.provider.connection.getAccountInfo(this.paymentPda);
        console.log("New payment intialized: ",newPaymentAccount);
        
      return {
        success: true,
        transaction: tx,
        payment: this.paymentPda.toString(),
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
    seller: PublicKey,
    totalAmount: number,
  ) {
    if (!walletAdapter) {
      new Error("Wallet not connected..");
    }
    if (!buyerPubkey && !seller) {
      new Error("Buyer or Seller pubkey missing..");
    }
    
    try {
      const owner = walletAdapter.publicKey;
      [this.escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), owner.toBuffer()],
        new PublicKey(ECOM_PROGRAM_ID)
      );
      [this.paymentPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("payment"), owner.toBuffer()],
        new PublicKey(ECOM_PROGRAM_ID)
      );

      const payment = (await this.program.account.payment.fetch(this.paymentPda));
      console.log("Payment Details: ",payment);
      console.log("Payment method: ",payment.paymentMethod);
      console.log("Payment Status: ",payment.paymentStatus);

      const existingAccount = await this.provider.connection.getAccountInfo(this.escrowPda);
        if (existingAccount) {
          console.log("Escrow account already exists, skipping creation");
          const escow = (await this.program.account.escrow.fetch(this.escrowPda));
          console.log("Payment Details: ",escow);
          console.log("Payment method: ",escow.escrowStatus);
          console.log("Payment Status: ",escow.releaseFund);
          return {
            success: true,
            transaction: "Account already exists",
            escrow: this.escrowPda.toString(),
          };
        }    
      } catch (error) {}

    try {

      console.log("---CREATE ESCROW---");
      await this.program.methods.createEscrow(
        buyerPubkey,
        seller,
        new anchor.BN(totalAmount)
      ).accounts({
        owner: walletAdapter.publicKey,
        escrow: this.escrowPda,
        payment: this.paymentPda,
        systemProgram:SystemProgram.programId
      }as any).rpc({
        skipPreflight:false,
        preflightCommitment:"confirmed",
        commitment:"confirmed"
      })
      
      const escow = (await this.program.account.escrow.fetch(this.escrowPda));

      console.log("Payment Details: ",escow);
      console.log("Payment method: ",escow.escrowStatus);
      console.log("Payment Status: ",escow.releaseFund);

      return{
        success:true,
        escrowPda:this.escrowPda,
      };
    } catch (error) {
      return{
        sucess:false,
        error:(error as Error).message
      }
    }
  }

  async initEscrowDeposite(
    productId: number,
    walletAdapter:AnchorWallet,
  ) {
    if (!walletAdapter) {
      new Error("Wallet not connected..");
    }
    try {
      const owner = walletAdapter.publicKey;
      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), owner.toBuffer()],
        new PublicKey(ECOM_PROGRAM_ID)
      );
      const [paymentPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("payment"), owner.toBuffer()],
        new PublicKey(ECOM_PROGRAM_ID)
      );
      console.log("----DEPOSITE ESCROW----");
      await this.program.methods.depositEscrow(
        productId
      ).accounts({
        owner: owner,
        escrow: escrowPda,
        payment: paymentPda,
        vaultAccount:this.vaultPda,
        userAccount:owner,
        systemProgram:SystemProgram.programId
      }as any).rpc({
        skipPreflight:false,
        preflightCommitment:"confirmed",
        commitment:"confirmed"
      })

      const payment = (await this.program.account.payment.fetch(paymentPda));
      console.log("Payment Details: ",payment);
      console.log("Payment method: ",payment.paymentMethod);
      console.log("Payment Status: ",payment.paymentStatus);

      console.log("---Balances---");
      const userDetails = await this.provider.connection.getBalance(owner);
      const vaultDetails = await this.provider.connection.getBalance(this.vaultPda);

      console.log("User Balance: ",userDetails);
      console.log("Vault Balance: ",vaultDetails);
      return{
        success:true,
        data:escrowPda
      };
    
    } catch (error) {
      return{
        sucess:false,
        error:(error as Error).message
      };
    }
  }

  async initEscrowWithdraw(
    productId: number,
    walletAdapter:AnchorWallet,
    seller:PublicKey,
    mint: PublicKey,
  ) {
    if (!walletAdapter) {
      new Error("Wallet not connected..");
    }
    try {
      const owner = walletAdapter.publicKey;
      [this.escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), owner.toBuffer()],
        new PublicKey(ECOM_PROGRAM_ID)
      );
      [this.paymentPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("payment"), owner.toBuffer()],
        new PublicKey(ECOM_PROGRAM_ID)
      );

      console.log("---WITHDRAW ESCROW---");
      await this.program.methods.withdrawEscrow(
        productId
      ).accounts({
        owner: owner,
        escrow: this.escrowPda,
        payment: this.paymentPda,
        vaultAccount:this.vaultPda,
        sellerAccount:seller,
        systemProgram:SystemProgram.programId
      }as any).rpc({
        skipPreflight:false,
        preflightCommitment:"confirmed",
        commitment:"confirmed"
      })
      const payment = (await this.program.account.payment.fetch(this.paymentPda));
      console.log("Payment Details: ",payment);
      console.log("Payment method: ",payment.paymentMethod);
      console.log("Payment Status: ",payment.paymentStatus);

      const userBal = await this.provider.connection.getBalance(owner);
      const vaultBal = await this.provider.connection.getBalance(this.vaultPda);
      
        
      console.log("Account Balances:");
      console.log(`Vault (${this.escrowPda.toString()}): ${vaultBal} SOL`);
      console.log(`User (${owner.toString()}): ${userBal} SOL`);

      return{
        success:true,
        escrowPda:this.escrowPda,
      };
    } catch (error) {
      return{
        sucess:false,
        error:(error as Error).message
      };
    }
  }
  async initOrder(walletAdapter:AnchorWallet){

    if (!walletAdapter) {
      new Error("Wallet not connected..");
    }
    [this.orderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("order"),walletAdapter.publicKey.toBuffer()],
      new PublicKey(ECOM_PROGRAM_ID)
    );
    console.log("Order PDA: ",this.orderPda.toBase58());
    
    const payment = (await this.program.account.payment.fetch(this.paymentPda));
    console.log("Payment Details: ",payment);
    
    const existingOrder = await this.program.account.order.fetch(this.orderPda);
    console.log("Existing Order Details: ",existingOrder);
    console.log("Order ID: ", bytesToUuid(existingOrder.orderId));
    console.log("Order Status: ",existingOrder.orderStatus);
    console.log("Order Tracking: ",existingOrder.orderTracking);
    if (existingOrder && this.orderPda){
      return{
        success:true,
        order:this.orderPda
      };
    }
    try {
        await this.program.methods.createOrder(
          String(bytesToUuid(payment.paymentId))
        ).accounts({
          signer:walletAdapter.publicKey,
          orderPda:this.orderPda,
          paymentPda:this.paymentPda,
          systemProgram:SystemProgram.programId
        }as any).rpc({
          skipPreflight:false,
          commitment:"confirmed",
          preflightCommitment:"confirmed"
        });
        return{
          success:true,
          order:this.orderPda,
          payment:this.paymentPda
        }
      } catch (error) {
      return{
        success:false,
        error:(error as Error).message
      };
    }
  }

  async updateOrder(walletAdapter:AnchorWallet,updateStatus:string){
    if (!walletAdapter) new Error("Wallet not connected..");
    
    try {
      if(!this.orderPda) new Error("order pda not found..")
      await this.program.methods.updateOrder(
        updateStatus,
      ).accounts({
        signer:walletAdapter.publicKey,
        order:this.orderPda
      }as any).rpc();
      console.log("Order Updated successfully..");

      const orderDetails = await this.program.account.order.fetch(this.orderPda);
      console.log("Updated OrderStatus: ",orderDetails.orderStatus);

      return{
        success:true,
        orderStatus:orderDetails,
        orderPda:this.orderPda
      };
    } catch (error) {
      console.log("Updation Failed",(error as Error).message);
      return{
        success:false,
        error:(error as Error).message
      };
    }
  }

  async closeAccounts(walletAdapter:AnchorWallet){
    console.log(`Deleting Account Pda (${this.paymentPda.toBase58()}) of ${walletAdapter.toString()}`);
    const payment = this.paymentPda
    try {
      if(this.paymentPda) new Error("payment pda not found")
      await this.program.methods.closePayment().accounts({
        signer: walletAdapter.publicKey,
        payments: this.paymentPda,
      }as any).rpc();
      console.log(`Account -> ${payment} Closed Successfully...`);

      if (!this.escrowPda) new Error("Escrow pda not found") 
      await this.program.methods.closeEscrow().accounts({
        signer:walletAdapter.publicKey,
        escrow:this.escrowPda,
      }as any).rpc();
      console.log(`Account -> ${payment} Closed Successfully...`);
      
      return{
        success:true,
        closedAccountPda:this.paymentPda
      };
    } catch (error) {
      return{
        success:false,
        error:(error as Error).message
      };
    }
  }
}
