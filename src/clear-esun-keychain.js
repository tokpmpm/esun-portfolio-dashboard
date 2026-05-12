import keytar from "keytar";
import fs from "fs";

const config = fs.readFileSync("../secret/config.ini", "utf8");
const account = config.match(/^\s*Account\s*=\s*(.+?)\s*$/m)?.[1];

if (!account) {
  console.error("Cannot find [User] Account in ../secret/config.ini");
  process.exit(1);
}

for (const service of ["EsunTrade.Node.Password", "EsunTrade.Node.CertPass"]) {
  const ok = await keytar.deletePassword(service, account);
  console.log(`${service} / ${account}: ${ok ? "deleted" : "not found"}`);
}
