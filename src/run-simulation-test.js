import { EsunTrade, Order } from "esun-trade";
import { readEsunConfig, readIniValue } from "./config.js";

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

const esun = new EsunTrade({ config: readEsunConfig(configPath) });
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
let result;
try {
  result = await esun.placeOrder(order);
} catch (err) {
  if (String(err?.message || err).includes("AGA0008")) {
    console.error("SIMULATION_ORDER_SCOPE_ERROR");
    console.error(
      [
        "Esun rejected the simulation order with AGA0008: Invalid Scope.",
        "This API key can log in and query account data, but it is not allowed to call placeOrder().",
        "The official Esun simulation prerequisite requires a simulation order, so use the Esun API key site to create/download a simulation trading key with order scope.",
        "If you intentionally only applied for account inquiry, skip this simulation order test and keep using the dashboard in read-only mode."
      ].join("\n")
    );
  }
  throw err;
}

console.log("SIMULATION_ORDER_RESULT");
console.log(JSON.stringify(result ?? { ok: true }, null, 2));
console.log("If this succeeded, Esun should later send the official API key application notice.");
