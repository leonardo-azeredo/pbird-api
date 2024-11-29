const { processBirdImage } = require('../services/openaiService');
const { saveImageToDrive } = require('../services/googleDriveService');
const { saveImageLocally } = require('../utils/imageUtils');
const { sendPhotoToTelegram } = require('../services/telegramService');

async function identifyBirdTelegram(req, res) {
  const { base64Image } = req.body;

  if (!base64Image) {
    return res.status(400).json({ error: 'Imagem em base64 é obrigatória.' });
  }

  try {
    // Passo 1: Processar a imagem e identificar a ave
    const birdName = await processBirdImage(base64Image);

    // Passo 2: Salvar a imagem localmente
    const filePath = await saveImageLocally(base64Image, birdName);

    // Passo 3: Fazer upload da imagem para o Google Drive
    const fileId = await saveImageToDrive(filePath, birdName);

    // Passo 4: Enviar os detalhes e a imagem ao Telegram
    const caption = `🐦 Ave Identificada:\n\nNome: ${birdName}`;
    await sendPhotoToTelegram(filePath, caption);

    // Resposta ao cliente
    res.json({
      message: 'Imagem salva, enviada para o Google Drive e enviada ao Telegram com sucesso!',
      birdName,
      googleDriveFileId: fileId,
    });
  } catch (error) {
    console.error('Erro ao processar a imagem ou enviar ao Telegram:', error.message);
    res.status(500).json({ error: 'Erro ao processar a imagem ou enviar ao Telegram.' });
  }
}

module.exports = { identifyBirdTelegram };
