import { EsunTrade } from "esun-trade";
import fs from "fs";

const configPath = "../secret/config.ini";
const text = fs.readFileSync(configPath, "utf8");

function readIniValue(section, key) {
  const lines = text.split(/\r?\n/);
  let inSection = false;
  for (const line of lines) {
    const sectionMatch = line.match(/^\s*\[([^\]]+)\]\s*$/);
    if (sectionMatch) {
      inSection = sectionMatch[1].trim().toLowerCase() === section.toLowerCase();
      continue;
    }
    if (!inSection) continue;
    const valueMatch = line.match(new RegExp(`^\\s*${key}\\s*=\\s*(.*?)\\s*$`, "i"));
    if (valueMatch) return valueMatch[1];
  }
  return "";
}

function mask(value) {
  if (!value) return "";
  return value.length <= 4 ? "****" : `${value.slice(0, 2)}****${value.slice(-2)}`;
}

const account = readIniValue("User", "Account");
const environment = readIniValue("Core", "Environment");
const entry = readIniValue("Core", "Entry");
const certPath = readIniValue("Cert", "Path");

console.log("CONFIG_CHECK");
console.log(
  JSON.stringify(
    {
      account: mask(account),
      environment,
      entry,
      certPathExists: certPath ? fs.existsSync(certPath) : false
    },
    null,
    2
  )
);

const esun = new EsunTrade({ configPath });
await esun.login();

const balance = await esun.getBalance();
const inventories = await esun.getInventories();
const settlements = await esun.getSettlements();

console.log("API_CHECK");
console.log(
  JSON.stringify(
    {
      balance,
      inventoryCount: Array.isArray(inventories) ? inventories.length : null,
      inventories,
      settlementCount: Array.isArray(settlements) ? settlements.length : null,
      settlements
    },
    null,
    2
  )
);

if (Array.isArray(inventories) && inventories.length === 0) {
  console.log("DIAGNOSIS");
  console.log(
    [
      "getInventories() returned an empty array.",
      "The SDK call itself is working, so this is usually one of:",
      "1. config.ini points to a different securities account than the one shown in the holdings screenshot.",
      "2. config.ini is using a simulation/test environment.",
      "3. The API permission/account has not been enabled for inventory inquiry.",
      "4. Esun web/app holdings page and API account are not the same backend account.",
      "Keep manual-positions.json enabled until Esun support confirms why API inventory is empty."
    ].join("\n")
  );
}
