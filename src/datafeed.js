import { makeApiRequest, generateSymbol, parseFullSymbol } from './helpers.js';
let url = new URL(window.location.href);
let token = url.searchParams.get('token');

// DatafeedConfiguration implementation
const configurationData = {
    // Represents the resolutions for bars supported by your datafeed
    supported_resolutions: ['1D', '1W', '1M'],
    // The `exchanges` arguments are used for the `searchSymbols` method if a user selects the exchange
    exchanges: [
        // { value: 'Bitfinex', name: 'Bitfinex', desc: 'Bitfinex'},
        // { value: 'Kraken', name: 'Kraken', desc: 'Kraken bitcoin exchange'},
        { value: 'NSECM', name: 'NSECM', desc: 'NSECM'},
    ],
    // The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
    symbols_types: [
        { name: 'stock', value: 'stock'}
        // { name: 'crypto', value: 'crypto'}
    ]
};

async function getFormattedYesterday() {
    // Create a new Date object for the current date
    const today = new Date();

    // Subtract one day (24 hours)
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Define options for formatting
    const options = { month: 'short', day: '2-digit', year: 'numeric' };
    
    // Format the date to "MMM dd yyyy"
    const formattedDate = yesterday.toLocaleDateString('en-US', options).replace(',', '');

    // Combine the formatted date and time
    return `${formattedDate}`;
}

// Obtains all symbols for all exchanges supported by CryptoCompare API
async function getAllSymbols() {
    const data = await makeApiRequest('data/v3/all/exchanges');
    let allSymbols = [];
    
    for (const exchange of data?.data) {
        allSymbols.push(
            {
                symbol: exchange.name,
                ticker: exchange.name,
                description: exchange.name,
                exchange: exchange.exchangeInstrumentID,
                type: 'stock',
            }
        );
    }
    // console.log("allSymbols-----------",allSymbols);

    // for (const exchange of configurationData.exchanges) {
    //     const pairs = data.Data[exchange.value].pairs;

    //     for (const leftPairPart of Object.keys(pairs)) {
    //         const symbols = pairs[leftPairPart].map(rightPairPart => {
    //             const symbol = generateSymbol(exchange.value, leftPairPart, rightPairPart);
    //             return {
    //                 symbol: symbol.short,
    //                 ticker: symbol.full,
    //                 description: symbol.short,
    //                 exchange: exchange.value,
    //                 // type: 'crypto',
    //             };
    //         });
    //         allSymbols = [...allSymbols, ...symbols];
    //     }
    // }

    // console.log("allSymbols-----------",allSymbols)
    return allSymbols;
}

export default {
    onReady: (callback) => {
        console.log('[onReady]: Method call');
        setTimeout(() => callback(configurationData));
    },

    searchSymbols: async (
        userInput,
        exchange,
        symbolType,
        onResultReadyCallback
    ) => {
        console.log('[searchSymbols]: Method call');
        const symbols = await getAllSymbols();
        // console.log("userInput-----------",userInput)
        // console.log("exchange-----------",exchange)
        // console.log("symbolType-----------",symbolType)
        
        const newSymbols = symbols.filter(symbol => {
            const isExchangeValid = exchange === '' || symbol.type === symbolType;
            // const isExchangeValid = exchange === '' || symbol.exchange === exchange;
            const isFullSymbolContainsInput = symbol.ticker
                .toLowerCase()
                .indexOf(userInput.toLowerCase()) !== -1;
            // console.log("isFullSymbolContainsInput-----------",isFullSymbolContainsInput)
            return isExchangeValid && isFullSymbolContainsInput;
        });
        onResultReadyCallback(newSymbols);
    },

    resolveSymbol: async (
        symbolName,
        onSymbolResolvedCallback,
        onResolveErrorCallback,
        extension
    ) => {
        console.log('[resolveSymbol]: Method call', symbolName);
        const symbols = await getAllSymbols();
        // console.log('getAllSymbols--------------------', symbols);
        const symbolItem = symbols.find(({ ticker }) => ticker === symbolName);
        if (!symbolItem) {
            console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
            onResolveErrorCallback('Cannot resolve symbol');
            return;
        }
        console.log('Found--------------------');
        // Symbol information object
        const symbolInfo = {
            ticker: symbolItem.ticker,
            name: symbolItem.symbol,
            description: symbolItem.description,
            type: symbolItem.type,
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: symbolItem.exchange,
            minmov: 1,
            pricescale: 100,
            has_intraday: false,
            visible_plots_set: 'ohlc',
            has_weekly_and_monthly: false,
            supported_resolutions: configurationData.supported_resolutions,
            volume_precision: 2,
            data_status: 'streaming',
        };
        console.log('[resolveSymbol]: Symbol resolved', symbolName);
        onSymbolResolvedCallback(symbolInfo);
    },

    getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
        const { from, to, firstDataRequest } = periodParams;
        // console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
        // console.log('from----------------------', from);
        // console.log('to-------------------------', to);
        // console.log('exchange-------------------------', symbolInfo?.exchange);
        // const parsedSymbol = parseFullSymbol(symbolInfo.ticker);
        // const urlParameters = {
        //     e: parsedSymbol.exchange,
        //     fsym: parsedSymbol.fromSymbol,
        //     tsym: parsedSymbol.toSymbol,
        //     toTs: to,
        //     limit: 2000,
        // };
        // const query = Object.keys(urlParameters)
        //     .map(name => `${name}=${encodeURIComponent(urlParameters[name])}`)
        //         .join('&');
        try {
            // const data = await makeApiRequest(`data/histoday?${query}`);

            let yesterday = await getFormattedYesterday();

            const url = `https://ttblaze.iifl.com/apimarketdata/instruments/ohlc?exchangeSegment=1&exchangeInstrumentID=${symbolInfo?.exchange}&startTime=Jan 01 1990 090000&endTime=${yesterday} 153000&compressionValue=60`;

            const options = {
                method: 'GET',
                headers: { 
                    'Authorization': token
                }
            };
            
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            
            // if (data.Response && data.Response === 'Error' || data.Data.length === 0) {
                //     // "noData" should be set if there is no data in the requested period
                //     onHistoryCallback([], { noData: true });
                //     return;
                // }
                let bars = [];
                
                const rawData = data?.result?.dataReponse;
                
                if (rawData) {

                    const records = rawData.split(',').filter(record => record.trim() !== '');
                
                    records.forEach(record => {
                        // Split each record by the pipe delimiter
                        const values = record.split('|');
                        // console.log("values---------------------",values);
                        
                        if (values.length >= 7) { // Ensure there are enough values
                            const [epochTime, open, high, low, close, volume, oi] = values;
                
                            // Convert epoch time from string to number and create the bar object
                            bars.push({
                                time: Number(epochTime) * 1000, // Convert to milliseconds
                                open: Number(open),
                                high: Number(high),
                                low: Number(low),
                                close: Number(close),
                                volume: Number(volume),
                                oi: Number(oi) // Optional: open interest
                            });
                        }
                    });
                }

                console.log("bars---------------------",bars);

                // data.Data.forEach(bar => {
                //     if (bar.time >= from && bar.time < to) {
                //         bars = [...bars, {
                //             time: bar.time * 1000,
                //             low: bar.low,
                //             high: bar.high,
                //             open: bar.open,
                //             close: bar.close,
                //         }];
                //     }
                // });
                // console.log(`[getBars]: returned ${bars.length} bar(s)`);
            onHistoryCallback(bars, { noData: false });
        } catch (error) {
            console.log('[getBars]: Get error', error);
            onErrorCallback(error);
        }
    },

    subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) => {
        console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID);
    },
    unsubscribeBars: (subscriberUID) => {
        console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
    },
};
