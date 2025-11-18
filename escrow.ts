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
import bytesToUuid from "./utils/uuidConverter";

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

export class Escrow {
  private provider: anchor.AnchorProvider;
  private program: anchor.Program<EcomDapp>;
  private escrowPda: anchor.web3.PublicKey;
  private paymentPda: anchor.web3.PublicKey;
  private vaultPda: anchor.web3.PublicKey;
  private orderPda: anchor.web3.PublicKey;
  private vaultState: anchor.web3.PublicKey;
  constructor(walletAdapter: any) {
    this.provider = createProvider(walletAdapter);
    anchor.setProvider(this.provider);

    this.program = new anchor.Program<EcomDapp>(IDL as EcomDapp, this.provider);

    this.escrowPda = anchor.web3.PublicKey.default;
    this.paymentPda = anchor.web3.PublicKey.default;
    this.vaultPda = anchor.web3.PublicKey.default;
    this.orderPda = anchor.web3.PublicKey.default;
    this.vaultState = anchor.web3.PublicKey.default;
  }

  async initPayment(walletAdapter: AnchorWallet, totalAmount: number) {
    try {
      const owner = walletAdapter.publicKey;
      const amount = new BN(totalAmount);

      console.log("Amount: ",totalAmount);
      this.paymentPda = PublicKey.findProgramAddressSync(
        [Buffer.from("payment"), owner.toBuffer()],
        new PublicKey(ECOM_PROGRAM_ID)
      )[0];
      this.escrowPda = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), owner.toBuffer()],
        new PublicKey(ECOM_PROGRAM_ID)
      )[0];
      this.vaultState = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("state"), walletAdapter.publicKey.toBuffer()],
        new PublicKey(ECOM_PROGRAM_ID)
      )[0];
      this.vaultPda = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), this.vaultState.toBytes()],
        new PublicKey(ECOM_PROGRAM_ID)
      )[0];
      
      console.log("Intialized Pda's: ");

      const info = await this.program.provider.connection.getAccountInfo(this.paymentPda);
      if (info) {
        const paymentDetails = await this.program.account.payment.fetch(this.paymentPda);
        console.log("Payment Status: ",paymentDetails.paymentStatus);
        console.log("Payment PDA created", this.paymentPda);
        console.log("Payment Status: ",paymentDetails.paymentStatus);
        
        return {
          success: true,
          payment: this.paymentPda.toString(),
        };
      };
      const tx = await this.program.methods
        .createPayment(amount, this.paymentPda, null)
        .accounts({
          signer: owner,
          payments: this.paymentPda,
          systemProgram: SystemProgram.programId,
        }as any)
        .rpc();
        
      const paymentDetails = await this.program.account.payment.fetch(this.paymentPda);
      console.log("Payment Status: ",paymentDetails.paymentStatus);
      console.log("Payment PDA created", this.paymentPda);
      console.log("Payment Status: ",paymentDetails.paymentStatus);
      
      return {
        success: true,
        transaction: tx,
        payment: this.paymentPda.toString(),
      };
    } catch (error) {
      console.error("Something went wrong...", error);
      await this.closeAccounts(walletAdapter,this.escrowPda,this.paymentPda,this.vaultState,this.vaultPda);
      console.log("Payment Closed!");
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async initEscrow(
    walletAdapter: AnchorWallet,
    seller: PublicKey,
    totalAmount: number,
  ) {
    if (!walletAdapter) {
      new Error("Wallet not connected..");
    }
    if (!seller) {
      new Error("Buyer or Seller pubkey missing..");
    }
    const owner = walletAdapter.publicKey;
    const existingAccount = await this.provider.connection.getAccountInfo(this.escrowPda);
    if (existingAccount) {
      console.log("Escrow account already exists, skipping creation");

      console.log("---Balances---");
      const userDetails = await this.provider.connection.getBalance(owner);

      console.log("User Balance: ",userDetails);
      return {
        success: true,
        transaction: "Account already exists",
        escrow: this.escrowPda.toString(),
      };
    }

    try {
      console.log("---CREATE ESCROW---");
      await this.program.methods
        .createEscrow(
          walletAdapter.publicKey,
          seller,
          new anchor.BN(totalAmount)
        )
        .accounts({
          owner: walletAdapter.publicKey,
          escrow: this.escrowPda,
          payment: this.paymentPda,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc({
          skipPreflight: false,
          preflightCommitment: "confirmed",
          commitment: "confirmed",
        });
  
      return {
        success: true,
        transaction: "Escrow created",
        escrow: this.escrowPda.toString(),
      };
    } catch (error) {
      console.error("Failed to create escrow:", error);
      if (
        this.paymentPda &&
        !this.paymentPda.equals(anchor.web3.PublicKey.default)
      ) {
        try {
          await this.closeAccounts(walletAdapter,this.escrowPda,this.paymentPda,this.vaultState,this.vaultPda);
        } catch (closeErr) {
          console.warn(
            "Unable to close payment account while rolling back escrow:",
            (closeErr as Error).message
          );
        }
      }
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async initEscrowDeposite(
    walletAdapter:AnchorWallet,
  ) {
    if (!walletAdapter) {
      new Error("Wallet not connected..");
    }

    try {
      const owner = walletAdapter.publicKey;
      console.log("----DEPOSITE ESCROW----");

      const vaultRent = await this.provider.connection.getMinimumBalanceForRentExemption(100);
      const depositAmount = 1 * anchor.web3.LAMPORTS_PER_SOL;
      const transferIx = anchor.web3.SystemProgram.transfer({
        fromPubkey: owner,
        toPubkey: this.vaultPda,
        lamports: depositAmount + vaultRent,
      });

      await this.program.methods
      .depositEscrow(1)
      .accounts({
        owner: owner,
        escrow: this.escrowPda,
        payment: this.paymentPda,
        vaultState: this.vaultState,
        vault:this.vaultPda,
        escrowAccount:this.escrowPda,
        user:owner,
        systemProgram: SystemProgram.programId,
      }as any)
      .preInstructions([transferIx])
      .rpc();

      const payment = (await this.program.account.payment.fetch(this.paymentPda));
      console.log("Payment Details: ",payment);

      const userDetails = await this.provider.connection.getBalance(owner);
      const vaultDetails = await this.provider.connection.getBalance(this.vaultPda);
      console.log("---Balances---");
      console.log("User Balance: ",userDetails);
      console.log("Vault Balance: ",vaultDetails);

      return{
        success:true,
        payment:this.paymentPda.toBase58(),
        escrow:this.escrowPda,
        vaultState: this.vaultState.toBase58(),
        vault:this.vaultPda.toBase58(),
      };
    
    } catch (error) {
      console.log("Failed to deposit escrow:", error);
      await this.closeAccounts(walletAdapter,this.escrowPda,this.paymentPda,this.vaultState,this.vaultPda);
      return{
        success:false,
        error:(error as Error).message
      };
    }
  }

  async initEscrowWithdraw(
    productId: number,
    walletAdapter:AnchorWallet,
    seller:PublicKey,
  ) {
    if (!walletAdapter) {
      new Error("Wallet not connected..");
    }
    try {
      const owner = walletAdapter.publicKey;

      console.log("---WITHDRAW ESCROW---");
      await this.program.methods.withdrawEscrow(
        productId
      ).accounts({
        owner: owner,
        escrow: this.escrowPda,
        payment: this.paymentPda,
        vaultState:this.vaultState,
        vault:this.vaultPda,
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
      await this.closeAccounts(walletAdapter,this.escrowPda,this.paymentPda,this.vaultState,this.vaultPda);
      console.log("Failed to withdraw escrow:", error);
      return{
        success:false,
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
    const orderId = bytesToUuid(existingOrder.orderId);
    console.log({orderId});

    if (existingOrder){
      return{
        success:true,
        orderId: orderId,
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
        const orderId = (await this.program.account.order.fetch(this.orderPda)).orderId;
        console.log({orderId});
        
        return{
          success:true,
          orderId: orderId,
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
        order:this.orderPda,
        systemProgram:SystemProgram.programId
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

  async closeAccounts(walletAdapter:AnchorWallet,paymentPda:PublicKey,escrowPda:PublicKey,vaultState:PublicKey,vaultPda:PublicKey){
    try {
      console.log("Escrow Pda: ",escrowPda.toString());
      console.log("Payment Pda: ",paymentPda.toString());
      console.log("Vault State Pda: ",vaultState.toString());
      console.log("Vault Pda: ",vaultPda.toString());
      if(!paymentPda || !escrowPda || !vaultState || !vaultPda ) new Error("payment or escrow or vault pda not found")
      
      const owner = walletAdapter.publicKey;
      await this.program.methods.closeAll().accounts({
        signer: owner,
        escrow: escrowPda,
        payments: paymentPda,
        vaultState: vaultState,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      }as any).rpc();

      console.log("Existing payment pda closed successfully..");
      console.log(`Payment Account(${paymentPda}) Closed Successfully! `);
      console.log(`Escrow Account(${escrowPda}) Closed Successfully! `);
      console.log(`Vault Account(${vaultPda}) Closed Successfully! `);
      console.log(`Vault State Account(${vaultState}) Closed Successfully! `);
      
      return {
        success: true,
        closedAccounts: {
          escrow: escrowPda.toBase58(),    
          payment: paymentPda.toBase58(),
          vaultState: vaultState.toBase58(),
          vault: vaultPda.toBase58(),
        }
      };
    } catch (error) {
      return{
        success:false,
        error:(error as Error).message
      };
    }
  }
}
