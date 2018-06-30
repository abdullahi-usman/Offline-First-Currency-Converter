# Offline-First-Currency-Converter
A Currency Converter that works even when offline.

```
npm install
npm start
```

Open Chrome browser and go to `http://localhost:8778/` or `127.0.0.1:8778`

When Converting currencies, Offline First Currency Converter first tries to fetch the lastest conversion rates 
from network, if that fails, it uses local cache from previous conversions if available.
