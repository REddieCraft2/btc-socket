const WebSocket = require('ws');
const express = require('express');
const app = express();
const port = 3000;

let latestCandles = [];

// Binance WebSocket für BTC/USDT 1-Minuten-Kerzen
const binanceSocket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');

binanceSocket.on('open', () => {
    console.log('WebSocket Verbindung zu Binance hergestellt.');
});

binanceSocket.on('message', (data) => {
    const parsed = JSON.parse(data);
    if (parsed.k && parsed.k.x) {  // abgeschlossene Kerze
        const candle = {
            open: parsed.k.o,
            close: parsed.k.c,
            high: parsed.k.h,
            low: parsed.k.l,
            time: parsed.k.t,
        };
        latestCandles.push(candle);

        // Maximal 50 Kerzen speichern
        if (latestCandles.length > 50) {
            latestCandles.shift();  // älteste Kerze entfernen
        }
    }
});

binanceSocket.on('error', (error) => {
    console.error('WebSocket Fehler:', error);
});

binanceSocket.on('close', () => {
    console.log('WebSocket Verbindung zu Binance geschlossen.');
});

// Einfacher Status-Endpunkt
app.get('/', (req, res) => {
  res.send('Server ist online und läuft!');
});

// API-Endpunkt mit den letzten 50 Kerzen
app.get('/api/latest-candles', (req, res) => {
    res.json(latestCandles);
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
