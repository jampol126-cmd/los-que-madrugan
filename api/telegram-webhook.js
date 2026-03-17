import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const body = req.body;
    const message = body.message?.text;
    const chatId = body.message?.chat?.id?.toString();
    const name = body.message?.chat?.first_name || 'madrugador';
    const callbackQuery = body.callback_query;

    if (!chatId && !callbackQuery?.message?.chat?.id) {
      return res.json({ ok: true });
    }

    const targetChatId = chatId || callbackQuery?.message?.chat?.id?.toString();
    const userName = name || callbackQuery?.message?.chat?.first_name || 'madrugador';

    // Función para enviar mensaje
    async function sendMessage(text, replyMarkup = null) {
      const payload = {
        chat_id: targetChatId,
        text: text,
        parse_mode: 'HTML'
      };
      if (replyMarkup) {
        payload.reply_markup = replyMarkup;
      }

      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    // COMANDO START
    if (message === '/start') {
      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('suscriptores')
        .select('*')
        .eq('telegram_chat_id', targetChatId)
        .single();

      if (!existing) {
        await supabase.from('suscriptores').insert({
          telegram_chat_id: targetChatId,
          nombre: userName,
          estado: 'prospecto',
          creado_en: new Date().toISOString()
        });
      }

      // Enviar selector de perfil
      await sendMessage(
        `🌅 <b>Bienvenido a Los que Madrugan</b>\n\n¿Qué tipo de madrugador sos?`,
        {
          inline_keyboard: [
            [
              { text: "🏪 Dueño de tienda", callback_data: "perfil_tienda" },
              { text: "💻 Freelancer", callback_data: "perfil_freelance" }
            ],
            [
              { text: "🚀 Startup", callback_data: "perfil_startup" },
              { text: "⚕️ Profesional", callback_data: "perfil_profesional" }
            ]
          ]
        }
      );

      return res.json({ ok: true });
    }

    // CALLBACKS (botones inline)
    if (callbackQuery) {
      const callbackData = callbackQuery.data;
      const messageId = callbackQuery.message.message_id;

      if (callbackData.startsWith('perfil_')) {
        const perfil = callbackData.replace('perfil_', '');

        await supabase
          .from('suscriptores')
          .update({ perfil })
          .eq('telegram_chat_id', targetChatId);

        // Editar mensaje original
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            message_id: messageId,
            text: `✅ <b>Perfil: ${perfil.toUpperCase()}</b>\n\n¿Querés probar 3 días gratis?`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[
                { text: "🚀 Sí, iniciar trial", callback_data: "iniciar_trial" }
              ]]
            }
          })
        });

        return res.json({ ok: true });
      }

      if (callbackData === 'iniciar_trial') {
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + 3);

        await supabase
          .from('suscriptores')
          .update({
            estado: 'trial',
            trial_fin: fechaFin.toISOString()
          })
          .eq('telegram_chat_id', targetChatId);

        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            message_id: messageId,
            text: `✅ <b>Trial activado por 3 días</b>\n\nTu primera frase llega mañana a las 6:00 AM.\n\n¿Listo para pagar? Escribí <b>PAGAR</b>`,
            parse_mode: 'HTML'
          })
        });

        return res.json({ ok: true });
      }
    }

    // COMANDO PAGAR
    if (message?.toUpperCase() === 'PAGAR') {
      const { data: user } = await supabase
        .from('suscriptores')
        .select('codigo_referido, perfil')
        .eq('telegram_chat_id', targetChatId)
        .single();

      const linkPago = `${process.env.NEXT_PUBLIC_URL}/pagar?chat_id=${targetChatId}&ref=${user?.codigo_referido || ''}&perfil=${user?.perfil || 'tienda'}`;

      await sendMessage(`💳 <b>Pagar suscripción</b>\n\n👉 <a href="${linkPago}">Click para pagar $19.900 COP/mes</a>\n\n🔒 Seguro vía Wompi (PSE, Tarjeta, Nequi)`);

      return res.json({ ok: true });
    }

    return res.json({ ok: true });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
