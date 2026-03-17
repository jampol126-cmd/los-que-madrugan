const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function sendTelegramMessage(chatId: string, text: string) {
  if (!BOT_TOKEN) {
    console.error('Falta TELEGRAM_BOT_TOKEN')
    return null
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })

    if (!res.ok) {
      const error = await res.json()
      console.error('Error Telegram:', error)
      return null
    }

    return res.json()
  } catch (e) {
    console.error('Error enviando a Telegram:', e)
    return null
  }
}

export async function setWebhook(vercelUrl: string) {
  if (!BOT_TOKEN) return
  const webhookUrl = `${vercelUrl}/api/telegram/webhook`
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl }),
  })
  return res.json()
}
