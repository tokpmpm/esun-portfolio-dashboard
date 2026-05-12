import { EsunTrade } from "esun-trade";

const esun = new EsunTrade({ configPath: "../secret/config.ini" });
const today = new Date().toISOString().slice(0, 10);

console.log("today =", today);
await esun.login();

console.log("inventories", await esun.getInventories());
console.log("settlements", await esun.getSettlements());
console.log("transactions", await esun.getTransactions({ startDate: today, endDate: today }));
console.log("balance", await esun.getBalance());
