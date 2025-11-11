/* yellowstoneClient.ts */
import pkg from "@triton-one/yellowstone-grpc";
const { Client } = pkg as any;
import type {
  SubscribeRequest,
  SubscribeUpdate,
  SubscribeRequestFilterAccounts,
} from "@triton-one/yellowstone-grpc";

import { PublicKey } from "@solana/web3.js";
import {
  AccountLayout,
  MintLayout,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Buffer } from "buffer";

// -----------------------------------------------------------------------------
// 1. Fix Buffer for Node / browser environments
// -----------------------------------------------------------------------------
if (typeof globalThis.Buffer === "undefined") {
  (globalThis as any).Buffer = Buffer;
}

// -----------------------------------------------------------------------------
// 2. Client & ATA
// -----------------------------------------------------------------------------
const client = new Client("https://grpc.triton.one:443", {
  "grpc.keepalive_time_ms": 15000,
});

const USER_ATA = "F6uN6k5zQyX8mFxgHzp2uqCp5eCBFj9Emc44uvxSLfJ3";

// -----------------------------------------------------------------------------
// 3. Helper: decode base64 or raw Uint8Array → Buffer
// -----------------------------------------------------------------------------
function toBuffer(data: string | Uint8Array): Buffer {
  if (typeof data === "string") {
    return Buffer.from(data, "base64");
  }
  return Buffer.from(data);
}

// -----------------------------------------------------------------------------
// 4. Main subscription
// -----------------------------------------------------------------------------
async function main() {
  const stream = await client.subscribe();

  // -------------------------------------------------------------------------
  // 5. Data handler – parse SPL-Token account manually
  // -------------------------------------------------------------------------
  stream.on("data", async (data: SubscribeUpdate) => {
    if (!data.account?.account?.pubkey || !data.account.account?.data) return;

    try {
      const pubkeyStr = new PublicKey(data.account.account.pubkey).toBase58();
      if (pubkeyStr !== USER_ATA) return;

      const buffer = toBuffer(data.account.account.data);

      // ---- Parse Token Account (amount) -----------------------------------
      const account = AccountLayout.decode(buffer);
      const rawAmount = account.amount; // bigint
      const amount = Number(rawAmount);

      // ---- Parse Mint (decimals) -----------------------------------------
      // NOTE: Mint address is stored in the token account layout
      const mintPubkey = new PublicKey(account.mint);
      // In a real app you would cache the mint → decimals map.
      // Here we just fetch the mint layout from the same buffer (it works for
      // token accounts because the data slice contains the whole account).
      const mintBuffer = buffer; // same buffer – mint layout is at offset 0
      const mint = MintLayout.decode(mintBuffer);
      const decimals = mint.decimals;

      const uiAmount = amount / Math.pow(10, decimals);
      console.log("Updated ATA balance:", uiAmount);
    } catch (err: any) {
      console.error("Failed to parse account data:", err?.message ?? err);
    }
  });

  // -------------------------------------------------------------------------
  // 6. Subscribe request – correct shape for Triton gRPC
  // -------------------------------------------------------------------------
  const accountsFilter: Record<string, SubscribeRequestFilterAccounts> = {
    userAta: {
      owner: [TOKEN_PROGRAM_ID.toBase58()], // <-- array, not string
      account: [USER_ATA],
      filters: [], // ← Required field
    },
  };

  const subscribeRequest: SubscribeRequest = {
    accounts: accountsFilter,
    slots: {},
    transactions: {},
    transactionsStatus: {},
    blocks: {},
    blocksMeta: {},
    entry: {},
    accountsDataSlice: [],
  };

  stream.write(subscribeRequest);

  // -------------------------------------------------------------------------
  // 7. Stream lifecycle
  // -------------------------------------------------------------------------
  stream.on("error", (err: any) => console.error("Stream error:", err));
  stream.on("close", () => console.log("Stream closed"));
}

// -----------------------------------------------------------------------------
// 8. Run
// -----------------------------------------------------------------------------
main().catch((err) => console.error("Fatal error:", err));