require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Configuración de CORS más completa
/* 🌍 CORS ABIERTO */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept'
  ]
}));

// Middleware para permitir respuestas a preflight requests
app.options('*', cors());

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