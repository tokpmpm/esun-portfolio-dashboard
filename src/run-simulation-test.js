import { EsunTrade, Order } from "esun-trade";
import { readIniValue } from "./config.js";

const configPath = "../secret/config.ini";
const environment = readIniValue(configPath, "Core", "Environment");
const entry = readIniValue(configPath, "Core", "Entry");

if (environment !== "SIMULATION") {
  console.error("Refusing to place simulation test order because config is not SIMULATION.");
  console.error(JSON.stringify({ environment, entry }, null, 2));
  process.exit(1);
}

console.log("SIMULATION config confirmed.");
console.log(JSON.stringify({ environment, entry }, null, 2));

const esun = new EsunTrade({ configPath });
await esun.login();

const order = new Order({
  buySell: Order.Side.Buy,
  price: "",
  stockNo: "2884",
  quantity: 1,
  apCode: Order.ApCode.Common,
  priceFlag: Order.PriceFlag.LimitDown,
  bsFlag: Order.BsFlag.ROD,
  trade: Order.Trade.Cash
});

console.log("Placing official-doc simulation order: buy 2884 x 1 at limit-down.");
const result = await esun.placeOrder(order);

console.log("SIMULATION_ORDER_RESULT");
console.log(JSON.stringify(result ?? { ok: true }, null, 2));
console.log("If this succeeded, Esun should later send the official API key application notice.");
