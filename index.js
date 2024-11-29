require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const birdController = require('./controllers/birdController');
const telegramController = require('./controllers/telegramController'); // Novo controller

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '10mb' })); // Suporte para imagens grandes

// Rota para identificar a ave
app.post('/identify-bird', birdController.identifyBird);

// Rota para identificar a ave e enviar ao Telegram
app.post('/identify-bird-telegram', telegramController.identifyBirdTelegram); // Nova rota

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
