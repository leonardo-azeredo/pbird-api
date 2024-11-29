const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Envia uma mensagem de texto ao bot do Telegram
 * @param {string} message - Mensagem a ser enviada
 */
async function sendMessageToTelegram(message) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem para o Telegram:', error.message);
    throw new Error('Falha ao enviar mensagem para o Telegram.');
  }
}

module.exports = {
  sendMessageToTelegram,
};
