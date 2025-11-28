import Client, {
  CommitmentLevel,
} from "@triton-one/yellowstone-grpc";
import { PublicKey } from "@solana/web3.js"
import dotenv from "dotenv";
dotenv.config();

const USER = new PublicKey("2hZmn6pHMPP8N2QXyhWn2tHXbM4kc3QJ4Agj57HWtYkD");
const ESCROW = new PublicKey("GXrTGkUU17MGwpMW7fqgh65xWECvtNtXeaBkEFeeb42s");
const ENDPOINT = process.env.ENDPOINT;

async function main() {
  const client = new Client(ENDPOINT as string,undefined,undefined);

  const stream = await client.subscribe();

  const request = {
    accounts: {
      account: {
        accounts: [USER, ESCROW],
      },
    },
    commitment: CommitmentLevel.FINALIZED,
  };

  stream.write(request as any);

  console.log("Subscribed to USER + ESCROW accounts.\n");

  stream.on("data", (data) => {
    const accUpdate = data?.account;

    if (!accUpdate) return;

    const pubkey = accUpdate.pubkey;
    const value = accUpdate.account;

    if (!value) return;

    if (pubkey === USER) {
      const lamports = value.lamports;
      console.log(`USER SOL balance: ${lamports / 1e9} SOL`);

      // If it's a token account
      if (value?.data?.data) {
        const buf = Buffer.from(value.data.data[0], "base64");
        const amount = buf.readBigUInt64LE(64);
        console.log(`USER token balance: ${amount.toString()}`);
      }
    }

    if (pubkey === ESCROW) {
      const lamports = value.lamports;
      console.log(`ESCROW SOL balance: ${lamports / 1e9} SOL`);

      if (value?.data?.data) {
        const buf = Buffer.from(value.data.data[0], "base64");
        const amount = buf.readBigUInt64LE(64);
        console.log(`ESCROW token balance: ${amount.toString()}`);
      }
    }
  });

  stream.on("error", (err) => console.error("Stream error:", err));
  stream.on("end", () => console.log("Stream ended"));
}

main();