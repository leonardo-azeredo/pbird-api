const axios = require('axios');
const fs = require('fs'); // Adicione o módulo de sistema de arquivos
const FormData = require('form-data'); // Para envio multipart/form-data


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Envia uma mensagem de texto ao bot do Telegram
 * @param {string} message - Mensagem a ser enviada
 */
async function sendMessageToTelegram(message) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(
      url,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao enviar mensagem para o Telegram:', error.response?.data || error.message);
    throw new Error('Falha ao enviar mensagem para o Telegram.');
  }
}

/**
 * Envia uma foto com legenda ao bot do Telegram
 * @param {string} photoPath - Caminho ou URL da foto a ser enviada
 * @param {string} caption - Legenda da foto
 */
async function sendPhotoToTelegram(photoPath, caption) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('caption', caption);
    formData.append('photo', fs.createReadStream(photoPath)); // Lê o arquivo local como stream

    await axios.post(url, formData, {
      headers: formData.getHeaders(),
    });
  } catch (error) {
    console.error('Erro ao enviar foto para o Telegram:', error.response?.data || error.message);
    throw new Error('Falha ao enviar foto para o Telegram.');
  }
}

module.exports = {
  sendMessageToTelegram,
  sendPhotoToTelegram,
};
