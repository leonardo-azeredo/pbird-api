require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '10mb' })); // Suporte para imagens grandes

// Configuração da API Google Drive
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON),
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});
const drive = google.drive({ version: 'v3', auth });

// Rota para receber a imagem e interagir com a OpenAI
app.post('/identify-bird', async (req, res) => {
  const { base64Image } = req.body;

  if (!base64Image) {
    return res.status(400).json({ error: 'Imagem em base64 é obrigatória.' });
  }

  try {
    // Passo 1: Enviar para a OpenAI
    const prompt =
      'Isto é uma foto de um passáro, identifique qual ave é e me responda apenas a raça da ave. Exemplo, bem-te-vi.';
    const openAiResponse = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt: `Dado o base64 da imagem: ${base64Image}. ${prompt}`,
        max_tokens: 50,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const birdName = openAiResponse.data.choices[0].text.trim();

    // Passo 2: Salvar a imagem no Google Drive
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${birdName}-${timestamp}.jpg`;
    const filePath = path.join(__dirname, fileName);

    // Decodificar a imagem base64 e salvá-la temporariamente
    const imageBuffer = Buffer.from(base64Image, 'base64');
    fs.writeFileSync(filePath, imageBuffer);

    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };
    const media = {
      mimeType: 'image/jpeg',
      body: fs.createReadStream(filePath),
    };

    await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    // Remover o arquivo temporário
    fs.unlinkSync(filePath);

    // Resposta ao cliente
    res.json({ message: 'Imagem salva com sucesso!', birdName });
  } catch (error) {
    console.error('Erro:', error.message);
    res.status(500).json({ error: 'Erro ao processar a imagem.' });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
