# Offline-First-Currency-Converter
A Currency Converter that works even when offline.

```
git clone https://github.com/dahham/Offline-First-Currency-Converter
cd Offline-First-Currency-Converter

npm install
npm start
```

Then open Chrome browser and go to `http:127.0.0.1:8778` or `http://127.0.0.1:8778/`

or

Alternatively you can goto [`https://dahham.github.io/Offline-First-Currency-Converter`](https://dahham.github.io/Offline-First-Currency-Converter)

When Converting currencies, Offline First Currency Converter first tries to fetch the lastest conversion rates 
from network, if that fails, it uses local cache from previous conversions if available.


## Credits
 
### Jake Archibald
[Jake Archibald's IndexedDB script](https://github.com/jakearchibald/idb/blob/master/lib/idb.js)

This project use the IndexedDB(`idb.js`) script, written by Jake Archibald.