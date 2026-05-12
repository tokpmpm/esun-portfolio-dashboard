import { EsunTrade } from "esun-trade";
import { readEsunConfig } from "./config.js";

const esun = new EsunTrade({ config: readEsunConfig("../secret/config.ini") });
const today = new Date().toISOString().slice(0, 10);

console.log("today =", today);
await esun.login();

console.log("inventories", await esun.getInventories());
console.log("settlements", await esun.getSettlements());
console.log("transactions", await esun.getTransactions({ startDate: today, endDate: today }));
console.log("balance", await esun.getBalance());
