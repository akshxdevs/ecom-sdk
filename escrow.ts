import * as anchor from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
  Connection,
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import IDL from "./IDL/blockbazzar.json";
import { EcomDapp } from "./IDL/blockbazzar";
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
        [Buffer.from("vault"), this.vaultState.toBuffer()],
        new PublicKey(ECOM_PROGRAM_ID)
      )[0];
      console.log(this.paymentPda.toBase58());
      console.log(this.escrowPda.toBase58());
      console.log(this.vaultPda.toBase58());
      console.log(this.vaultState.toBase58());
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
    vaultState:PublicKey,
    vault:PublicKey
  ) {
    if (!walletAdapter) {
      new Error("Wallet not connected..");
    }
    try {
      const owner = walletAdapter.publicKey;
      
      console.log("---WITHDRAW ESCROW---");
        this.paymentPda = PublicKey.findProgramAddressSync(
          [Buffer.from("payment"), owner.toBuffer()],
          new PublicKey(ECOM_PROGRAM_ID)
        )[0]; console.log(this.paymentPda);
        
        this.escrowPda = PublicKey.findProgramAddressSync(
          [Buffer.from("escrow"), owner.toBuffer()],
          new PublicKey(ECOM_PROGRAM_ID)
        )[0];console.log(this.escrowPda);

      await this.program.methods.withdrawEscrow(
        productId
      ).accounts({
        owner: owner,
        escrow: this.escrowPda,
        payment: this.paymentPda,
        vaultState:vaultState,
        vault:vault,
        sellerAccount:seller,
        systemProgram: SystemProgram.programId,
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
        escrowPda:this.escrowPda.toBase58(),
        paymentPda:this.paymentPda.toBase58()
      };
      
    } catch (error) {
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
    
    // Check if order account exists and is valid
    const orderAccountInfo = await this.program.provider.connection.getAccountInfo(this.orderPda);
    
    // Try to fetch existing order to see if it's properly initialized
    try {
      const existingOrder = await this.program.account.order.fetch(this.orderPda);
      console.log("Existing Order Details: ",existingOrder);
      console.log("Order ID: ", bytesToUuid(existingOrder.orderId));
      console.log("Order Status: ",existingOrder.orderStatus);
      console.log("Order Tracking: ",existingOrder.orderTracking);
      const orderId = bytesToUuid(existingOrder.orderId);
      console.log({orderId});

      return{
        success:true,
        orderId: orderId,
        order:this.orderPda
      };
    } catch (fetchError) {
      // Order account exists but is uninitialized/corrupted - close it first
      if (orderAccountInfo) {
        console.log("Order account exists but is uninitialized/corrupted. Closing it first...");
        try {
          await this.program.methods.closeOrder().accounts({
            order:this.orderPda,
            signer:walletAdapter.publicKey,
            systemProgram:SystemProgram.programId
          }as any).rpc();
          console.log("Corrupted order account closed successfully");
        } catch (closeError) {
          // If closing fails, it might be because account is truly uninitialized
          // Try to continue with creation anyway
          console.log("Could not close order account (may be uninitialized), proceeding with creation...");
        }
      }
    }
    
    // Create new order (either doesn't exist or was just closed)
    console.log("Creating new order...");
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
      console.log("Order created successfully. Order ID: ", bytesToUuid(orderId));
      
      return{
        success:true,
        orderId: bytesToUuid(orderId),
        order:this.orderPda,
        payment:this.paymentPda
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      const errorMessage = (error as Error).message;
      
      // If account already exists error, try closing and retrying once
      if (errorMessage.includes("already in use") || errorMessage.includes("AccountNotInitialized")) {
        console.log("Retrying after closing account...");
        try {
          await this.program.methods.closeOrder().accounts({
            order:this.orderPda,
            signer:walletAdapter.publicKey,
            systemProgram:SystemProgram.programId
          }as any).rpc();
          
          // Retry creation
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
          console.log("Order created successfully after retry. Order ID: ", bytesToUuid(orderId));
          
          return{
            success:true,
            orderId: bytesToUuid(orderId),
            order:this.orderPda,
            payment:this.paymentPda
          }
        } catch (retryError) {
          console.error("Failed to create order after retry:", retryError);
          return{
            success:false,
            error:(retryError as Error).message
          };
        }
      }
      
      return{
        success:false,
        error:errorMessage
      };
    }
  }

  async updateOrder(walletAdapter:AnchorWallet,updateStatus:string){
    if (!walletAdapter) new Error("Wallet not connected..");
    [this.orderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("order"),walletAdapter.publicKey.toBuffer()],
      new PublicKey(ECOM_PROGRAM_ID)
    );
    console.log("Order PDA: ",this.orderPda.toBase58());
    try {
      await this.program.methods.updateOrder(
        updateStatus,
      ).accounts({
        signer:walletAdapter.publicKey,
        order:this.orderPda,
        systemProgram:SystemProgram.programId
      }as any).rpc();
      console.log("Order Updated successfully..");
      const orderDetails = (await this.program.account.order.fetch(this.orderPda));
      console.log("Order created successfully after retry. Order ID: ", orderDetails);
      return{
        success:true,
        orderDetails:orderDetails,
        orderPda:this.orderPda
      };
    } catch (err) {
      console.error("Update failed error:", err);
      console.error("err.logs:", (err as any).logs || (err as any).errorLogs);
      return{
        success:false,
        error:(err as Error).message
      };
    }
  }

  async closeOrder(walletAdapter:AnchorWallet) {
    if (!walletAdapter) new Error("Wallet not connected..");
    const [orderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("order"),walletAdapter.publicKey.toBuffer()],
      new PublicKey(ECOM_PROGRAM_ID)
    );
    console.log("Order PDA: ", orderPda.toBase58());
    try {
      const orderInfo = await this.program.provider.connection.getAccountInfo(orderPda);
      if (!orderInfo) {
        console.log("Order account does not exist, nothing to close");
        return {
          success: true,
          message: "Order account does not exist, nothing to close",
          orderPda: orderPda.toBase58()
        };
      }
      try {
        await this.program.account.order.fetch(orderPda);
      } catch (fetchError) {
        console.log("Order account exists but is not properly initialized");
        return {
          success: true,
          message: "Order account is not initialized, nothing to close",
          orderPda: orderPda.toBase58()
        };
      }

      await this.program.methods.closeOrder().accounts({
        order:orderPda,
        signer:walletAdapter.publicKey,
        systemProgram:SystemProgram.programId
      }as any).rpc();
      console.log("Order Closed successfully..");

      return{
        success:true,
        orderPda:orderPda.toBase58()
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes("AccountNotInitialized") || errorMessage.includes("3012")) {
        console.log("Order account is not initialized, nothing to close");
        return {
          success: true,
          message: "Order account is not initialized, nothing to close",
          orderPda: orderPda.toBase58()
        };
      }
      console.log("Close Order Failed",(error as Error).cause);
      console.error(error);
      return{
        success:false,
        error:errorMessage
      };
    }
  }

  async fetchOrderStatus(walletAdapter:AnchorWallet){
    if (!walletAdapter) new Error("Wallet not connected..");
    [this.orderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("order"),walletAdapter.publicKey.toBuffer()],
      new PublicKey(ECOM_PROGRAM_ID)
    );
    try {
      if(!this.orderPda) new Error("order pda not found..")
      const orderStatus = (await this.program.account.order.fetch(this.orderPda)).orderStatus;
      const orderTracking = await (await this.program.account.order.fetch(this.orderPda)).orderTracking;
      console.log("Order status fetched successfully..");
      const orderDetails = await this.program.account.order.fetch(this.orderPda);
      console.log("Order Details: ",orderDetails);
      return{
        success:true,
        orderDetails:orderDetails,
        orderStatus:orderStatus,
        orderTracking:orderTracking,
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
        escrow: this.escrowPda || escrowPda,
        payments: this.paymentPda || paymentPda,
        vaultState: this.vaultState || vaultState,
        vault: this.vaultPda || vaultPda,
        systemProgram:SystemProgram.programId
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
