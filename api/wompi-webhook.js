import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: event } = req.body;

    // Wompi envía el evento con la transacción
    if (!event || !event.transaction) {
      return res.json({ received: true });
    }

    const transaction = event.transaction;

    // Solo procesar si está aprobada
    if (transaction.status !== 'APPROVED') {
      return res.json({ received: true, status: transaction.status });
    }

    // Extraer chat_id de la referencia (formato: madrugador_CHATID_timestamp)
    const referenceParts = transaction.reference?.split('_');
    const chatId = referenceParts?.[1];

    if (!chatId) {
      console.error('No chatId en referencia:', transaction.reference);
      return res.status(400).json({ error: 'No chatId' });
    }

    // Activar suscripción por 30 días
    const { data: user } = await supabase
      .from('suscriptores')
      .update({
        estado: 'activo',
        email: transaction.customer_email,
        telefono: transaction.customer_phone,
        proximo_cobro: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ultimo_pago: new Date().toISOString()
      })
      .eq('telegram_chat_id', chatId)
      .select('id, nombre, referido_por, telegram_chat_id')
      .single();

    if (!user) {
      console.error('Usuario no encontrado:', chatId);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Procesar referido si existe
    if (user.referido_por) {
      const { data: invitador } = await supabase
        .from('suscriptores')
        .select('id, telegram_chat_id, meses_gratis_acumulados, amigos_invitados')
        .eq('codigo_referido', user.referido_por)
        .single();

      if (invitador) {
        await supabase.from('suscriptores').update({
          meses_gratis_acumulados: invitador.meses_gratis_acumulados + 1,
          amigos_invitados: (invitador.amigos_invitados || 0) + 1
        }).eq('id', invitador.id);

        // Notificar al invitador
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: invitador.telegram_chat_id,
            text: `🎉 ¡Ganaste 1 mes gratis!\n\n${user.nombre || 'Tu amigo'} acaba de pagar su suscripción.`,
            parse_mode: 'HTML'
          })
        });
      }
    }

    // Notificar al nuevo pagador
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🎉 ¡Bienvenido oficial al club!\n\nTu pago fue confirmado. Mañana a las 6:00 AM recibís tu primera frase personalizada.\n\n¿Querés invitar amigos y ganar meses gratis? Escribí REFERIDOS`,
        parse_mode: 'HTML'
      })
    });

    return res.json({ received: true, activated: true, user: user.id });

  } catch (error) {
    console.error('Error webhook:', error);
    return res.status(500).json({ error: error.message });
  }
}
