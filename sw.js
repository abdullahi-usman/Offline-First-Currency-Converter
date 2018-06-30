const cacheName = 'currency-converter-v1';
const api = 'https://free.currencyconverterapi.com/api/v5'
const apiCountries = api + '/countries';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(['./', 'main.js', 'index.html', 'idb.js', 'countries-offline-default.json']);
        })
    );

});

self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    if (requestUrl.pathname === new URL(apiCountries).pathname) {

        event.respondWith(caches.match(apiCountries).then(response => {

            if (response && response.ok) {
                return response;
            } else {

                return fetch(apiCountries).then(response => {

                    if (response && response.ok) {

                        caches.open(cacheName).then(cache => {
                            cache.put(apiCountries, response);
                        });

                        return response.clone();
                    } else {
                        return caches.match('countries-offline-default.json');
                    }

                }).catch(reason => {
                    console.log("Received error from network while getting list of countries' currencies: " + reason);
                    return caches.match('countries-offline-default.json');
                })

            }

        }));

    } else {
        event.respondWith(caches.match(event.request).then(response => {
            return response || fetch(event.request.url);
        }));
    }

});

self.addEventListener('message', (event) => {

    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }

});