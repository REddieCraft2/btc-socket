const WebSocket = require('ws');
const express = require('express');
const app = express();
const port = 3000;

let latestCandles = [];
let latestPrice = null;

// WebSocket für 1-Minuten-Kerzen (kline)
const binanceKlineSocket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');

binanceKlineSocket.on('open', () => {
    console.log('Kline-WebSocket verbunden');
});

binanceKlineSocket.on('message', (data) => {
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

        if (latestCandles.length > 50) {
            latestCandles.shift(); // Älteste Kerze entfernen
        }
    }
});

binanceKlineSocket.on('error', (error) => {
    console.error('Kline-WebSocket Fehler:', error);
});

binanceKlineSocket.on('close', () => {
    console.log('Kline-WebSocket geschlossen');
});

// WebSocket für Trade-Ticks (Live-Preis)
const binanceTradeSocket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

binanceTradeSocket.on('open', () => {
    console.log('Trade-WebSocket verbunden');
});

binanceTradeSocket.on('message', (data) => {
    const parsed = JSON.parse(data);
    latestPrice = {
        price: parsed.p,    // aktueller Trade-Preis
        quantity: parsed.q, // Menge
        time: parsed.T     // Zeitstempel
    };
});

binanceTradeSocket.on('error', (error) => {
    console.error('Trade-WebSocket Fehler:', error);
});

binanceTradeSocket.on('close', () => {
    console.log('Trade-WebSocket geschlossen');
});

// Einfacher Status-Endpunkt
app.get('/', (req, res) => {
    res.send('Server läuft und liefert Kerzen und Tickdaten!');
});

// API-Endpunkt für die letzten 50 Kerzen
app.get('/api/latest-candles', (req, res) => {
    res.json(latestCandles);
});

// API-Endpunkt für den aktuellen Tickpreis
app.get('/api/latest-price', (req, res) => {
    res.json(latestPrice || {});
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
