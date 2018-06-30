function getCountries() {
    let countries = new URL('/api/v5/countries', 'https://free.currencyconverterapi.com');
    countries.protocol = 'https';

    fetch(countries.href).then((response) => {

        if (response.ok) {

            response.json().then(json => {
                if (!json) return;

                const array = []

                let i = 0;

                for (const currency in json.results) {

                    array[i++] = json.results[currency].currencyId + ' (' + json.results[currency].name + ')';

                }

                array.sort((a, b) => {
                    return a.toString() > b.toString() ? 1 : -1;
                });

                let currenciesFrom = '';
                let currenciesTo = '';

                array.forEach(element => {
                    currenciesFrom += '<li role="presentation"><a role="menuitem" href="javascript:currencySelectedFrom(\'' + element + '\')">' + element + '</a></li>';
                    currenciesTo += '<li role="presentation"><a role="menuitem" href="javascript:currencySelectedTo(\'' + element + '\')">' + element + '</a></li>';
                });



                document.getElementById('currencies-from').innerHTML = currenciesFrom;
                document.getElementById('currencies-to').innerHTML = currenciesTo;
            });
        }
    });
}

function registerServiceWorker() {
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.register('sw.js').then((reg) => {
        if (!navigator.serviceWorker.controller) return;
        
        console.log('service worker registered successfully...!' );

        if (reg.installing) {
            trackInstalling(reg.installing);
            return;
        }

        if (reg.waiting) {
            trackWaiting(reg.waiting);
            return;
        }

        addEventListener('updatefound', () => {
            trackInstalling(reg.installing);
        });


    }).catch(reason => {
        console.log ('Failed to register service worker :',  reason);
    });

    self.trackInstalling = function (worker) {
        worker.addEventListener('statechange', () => {
            if (worker.state == 'installed') {
                updateReady(worker);
            }
        });
    };

    self.trackWaiting = function (worker) {
        updateReady(worker);
    };

    self.updateReady = function (worker) {
        worker.postMessage({
            action: 'skipWaiting'
        });
    };

    let refreshing;
    addEventListener('controllerchange', () => {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
    });


    self.openDb = function () {

        return idb.open('currency.db', 1, upgradeDb => {
            const currenciesStore = upgradeDb.createObjectStore('currencies');
        });
    };

    this.idbPromised = openDb();
    getCountries();
}

registerServiceWorker();

function convertCurrencies() {

    let fromCurrency = document.getElementById('currencies-from-label').innerHTML;
    let toCurrency = document.getElementById('currencies-to-label').innerHTML;

    const message = document.getElementById('message');

    if (!fromCurrency || !toCurrency) {
        message.setAttribute('class', 'error');
        message.innerHTML = 'Please select currencies';
        return;
    }

    fromCurrency = fromCurrency.substr(0, fromCurrency.indexOf('(')).trim();
    toCurrency = toCurrency.substr(0, toCurrency.indexOf('(')).trim();

    const convertedCurrencySymbol = toCurrency;
    toCurrency = toCurrency + '_' + fromCurrency;
    fromCurrency = fromCurrency + '_' + convertedCurrencySymbol;

    const input = parseFloat(document.getElementById('amount').value);
    const result = document.getElementById('result');

    if (!input) {
        message.setAttribute('class', 'error');
        message.innerHTML = 'Please write conversion amount';
        return;
    }

    self.fetchFromLocal = function () {
        this.idbPromised.then(db => {
            db.transaction('currencies', 'readwrite').objectStore('currencies').get(fromCurrency).then(amount => {

                if (amount) {
                    message.setAttribute('class', 'info');
                    message.innerHTML = 'Result fetch successfully from cache!';
                    result.innerHTML = convertedCurrencySymbol + ' ' + (amount * input);
                    return;
                }

            });
        });
    };

    message.setAttribute('class', 'message');
    message.innerHTML = 'Fetching result from network... please wait!';

    const convertButton = document.getElementById('convert')
    convertButton.setAttribute('disabled', 'disabled');

    const url = "https://free.currencyconverterapi.com/api/v5/convert?q=" + fromCurrency + ',' + toCurrency + "&compact=ultra";

    fetch(url).then(response => {
        console.log(response);

        convertButton.removeAttribute('disabled');

        if (!response.ok) {
            message.setAttribute('class', 'error');
            message.innerHTML = 'Error trying to fetch result from network.';
            fetchFromLocal();
            return;
        }

        response.json().then(json => {

            if (!json) {
                fetchFromLocal();
            }

            console.log(json);

            const cur1 = json[fromCurrency];
            const cur2 = json[toCurrency];

            this.idbPromised.then(db => {
                const store = db.transaction('currencies', 'readwrite').objectStore('currencies');
                store.put(cur1, fromCurrency);
                store.put(cur2, toCurrency);
            });

            amount = cur1;

            message.setAttribute('class', 'info');
            message.innerHTML = 'Result fetch successfully from network!';

            result.innerHTML = convertedCurrencySymbol + ' ' + (amount * input);
        });
    }).catch(reason => {
        convertButton.removeAttribute('disabled');
        message.setAttribute('class', 'error');
        message.innerHTML = 'Error trying to fetch result from network.';

        fetchFromLocal();
    });

}

function currencySelectedFrom(currency) {
    document.getElementById('currencies-from-label').innerHTML = currency;
}

function currencySelectedTo(currency) {
    document.getElementById('currencies-to-label').innerHTML = currency;
}