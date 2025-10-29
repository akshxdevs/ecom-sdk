import bs58 from "bs58";

// Your raw byte array (from id.json)
const bytes = [225,52,225,183,58,68,41,251,252,28,29,49,232,159,2,49,226,163,208,84,252,123,11,18,41,166,110,127,6,75,99,145,25,63,249,136,125,16,55,215,124,160,222,34,119,233,29,205,42,222,67,150,233,168,245,223,238,86,13,4,9,17,167,110];

// Convert the array directly to Uint8Array
const privateKeyBytes = Uint8Array.from(bytes);

// Encode to base58
const privateKeyBase58 = bs58.encode(privateKeyBytes);

console.log('Your Solana Private Key (base58):');
console.log(privateKeyBase58);