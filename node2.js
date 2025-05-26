const WebSocket = require('ws');
const express = require('express');
const app = express();
const port = 3000;

let latestCandle = null;

const binanceSocket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');

binanceSocket.on('message', (data) => {
    const parsed = JSON.parse(data);
    if (parsed.k) {
        latestCandle = {
            open: parsed.k.o,
            close: parsed.k.c,
            high: parsed.k.h,
            low: parsed.k.l,
            time: parsed.k.t,
        };
    }
});

app.get('/api/latest-candle', (req, res) => {
    res.json(latestCandle || {});
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
