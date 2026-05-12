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
