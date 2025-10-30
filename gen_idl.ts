import fs from "fs";
import path from "path";

const programName = "ecom_dapp";

// source: where Anchor puts the TS file
const src = path.join("target", "types", `${programName}.ts`);

// destination: your sdk folder
const dest = path.join("sdk", "IDL", `${programName}.ts`);

if (!fs.existsSync(src)) {
  console.error(`❌ Source file not found: ${src}`);
  process.exit(1);
}

// copy the generated TS file
fs.copyFileSync(src, dest);

console.log(`✅ Copied ${src} → ${dest}`);
