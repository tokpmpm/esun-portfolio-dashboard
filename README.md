# Esun Portfolio Dashboard

Local, read-only dashboard for Esun account data.

This repository intentionally does not include secrets or certificates.

Expected local layout:

```text
/Users/pmpmpm/Antigravity/Stock/Esun/
  secret/
    config.ini
    E123009962_20270512.p12
  vendor/
    esun-trade-2.2.0.tgz
  dashboard/
    package.json
```

Run:

```bash
cd /Users/pmpmpm/Antigravity/Stock/Esun/dashboard
npm install
npm run sync
npm run dev
```

Open:

```text
http://localhost:8787
```

No order APIs are used.

## Simulation Test

Before applying for official production keys, Esun requires a simulation order
test. This command refuses to run unless `secret/config.ini` is set to
`Environment = SIMULATION`.

```bash
npm run simulation:test
```

The script follows Esun's official example: buy `2884` x `1` at limit-down in
the simulation environment.

## Manual Positions

Esun API only returns positions held in the Esun account. If your stocks are at
another broker, keep them in:

```text
manual-positions.json
```

`npm run sync` combines:

- Esun cash from `getBalance()`
- Esun positions from `getInventories()`
- manual positions from `manual-positions.json`
