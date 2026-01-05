require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

/* 🚨 FORZAR CORS A NIVEL BAJO (ANTES DE TODO) */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Accept'
    );

    // Responder inmediatamente el preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

/* CORS (backup, pero ya no crítico) */
app.use(cors({ origin: '*' }));

// Middleware para parsear JSON
app.use(express.json());

// Configuración del puerto
const PORT = process.env.PORT || 4000;
app.set('port', PORT);

console.log(`🚀 Puerto configurado: ${PORT}`);

// Rutas de la API
app.use('/api', require('./routes'));

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ SERVER ON PORT ${PORT}`);
});