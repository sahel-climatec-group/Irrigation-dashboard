const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mqtt = require('mqtt');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- CONFIGURATION CLOUD ---
const MQTT_URL = 'mqtts://c86263fdc7524d05a78ad0b242b6aa79.s1.eu.hivemq.cloud:8883';
const options = { username: 'admin', password: 'Si12345678#', clean: true };

const mqttClient = mqtt.connect(MQTT_URL, options);

mqttClient.on('connect', () => {
    mqttClient.subscribe('jardin/+/humidite');
    mqttClient.subscribe('jardin/pompe');
    console.log("Connecté au HiveMQ Cloud");
});

mqttClient.on('message', (topic, message) => {
    const payload = message.toString();
    // On envoie la donnée au navigateur via WebSocket
    io.emit('mqtt_update', { topic, payload, time: new Date().toLocaleTimeString() });
});

// Réception des commandes du site web
// 2. GESTION SOCKET.IO (Réception depuis le Navigateur)
io.on('connection', (socket) => {
    console.log('🌐 Navigateur connecté au bridge');

    // Écoute les commandes envoyées par tes boutons (Démarrer/Arrêter)
    socket.on('mqtt_publish', (data) => {
        const { topic, payload } = data;
        
        // On publie sur le Cloud pour que l'ESP32 reçoive l'ordre
        mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
            if (err) {
                console.error(" Erreur de publication MQTT:", err);
            } else {
                console.log(` Commande envoyée au Cloud: ${topic} -> ${payload}`);
            }
        });
    });
});

// On indique à Express que les fichiers statiques (CSS, JS, Images) sont dans 'web'
app.use(express.static(path.join(__dirname, 'web')));

// On force l'envoi de l'index.html quand on arrive sur http://localhost:3000
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

server.listen(3000, () => console.log('Serveur lancé sur http://localhost:3000'));