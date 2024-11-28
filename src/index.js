require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '10mb' })); // Suporte para imagens grandes

const GOOGLE_API_FOLDER_ID = '1WbeHEXyj0ga5OicDqXogCEwHgcF7R85o';

// Função para fazer upload da imagem para o Google Drive
async function uploadFileToGoogleDrive(filePath, fileName) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: './googlekey.json',
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const driveService = google.drive({
      version: 'v3',
      auth,
    });

    const fileMetaData = {
      name: fileName,
      parents: [GOOGLE_API_FOLDER_ID],
    };

    const media = {
      mimeType: 'image/jpg',
      body: fs.createReadStream(filePath),
    };

    const response = await driveService.files.create({
      resource: fileMetaData,
      media: media,
      fields: 'id',
    });

    return response.data.id;
  } catch (err) {
    console.log('Erro ao fazer upload para o Google Drive:', err);
  }
}

// Rota para receber a imagem e interagir com a OpenAI
app.post('/identify-bird', async (req, res) => {
  const { base64Image } = req.body;

  if (!base64Image) {
    return res.status(400).json({ error: 'Imagem em base64 é obrigatória.' });
  }

  try {
    // Passo 1: Enviar para a OpenAI
    const openAiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Isto é uma foto de um passáro, identifique qual ave é e me responda apenas a raça da ave. Exemplo, bem-te-vi.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const birdName = openAiResponse.data.choices[0].message.content.trim();

    // Passo 2: Salvar a imagem no diretório temporário
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${birdName}-${timestamp}.jpg`;
    const filePath = path.join(__dirname, 'temp', fileName); // Diretório temporário

    // Certifique-se de que o diretório 'temp' existe
    if (!fs.existsSync(path.join(__dirname, 'temp'))) {
      fs.mkdirSync(path.join(__dirname, 'temp'));
    }

    // Decodificar a imagem base64 e salvá-la temporariamente
    const imageBuffer = Buffer.from(base64Image, 'base64');
    fs.writeFileSync(filePath, imageBuffer);

    // Passo 3: Fazer o upload para o Google Drive
    const fileId = await uploadFileToGoogleDrive(filePath, fileName);

    // Resposta ao cliente com o ID do arquivo no Google Drive
    res.json({
      message: 'Imagem salva e enviada para o Google Drive com sucesso!',
      birdName,
      googleDriveFileId: fileId,
    });
  } catch (error) {
    console.error('Erro:', error.message);
    res.status(500).json({ error: 'Erro ao processar a imagem.' });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
