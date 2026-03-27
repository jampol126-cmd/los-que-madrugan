import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: event } = req.body;

    if (!event || !event.transaction) {
      return res.json({ received: true });
    }

    const transaction = event.transaction;

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

    // Verificar que el usuario exista
    const { data: user, error: userError } = await supabase
      .from('suscriptores')
      .select('id, nombre, referido_por, codigo_referido, telegram_chat_id, perfil, estado, referidos_procesados, meses_gratis_acumulados')
      .eq('telegram_chat_id', chatId)
      .single();

    if (userError || !user) {
      console.error('Usuario no encontrado:', chatId);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si ya se procesó este pago (evitar duplicados)
    const referidosProcesados = user.referidos_procesados || [];
    const transactionId = transaction.id;
    
    if (referidosProcesados.includes(transactionId)) {
      return res.json({ received: true, message: 'Pago ya procesado' });
    }

    const proximoCobro = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const esProductHunt = transaction.reference?.includes('_PH_') || false;
    const montoPagado = transaction.amount_in_cents / 100;

    // Activar suscripción
    const updateData = {
      estado: 'activo',
      email: transaction.customer_email,
      telefono: transaction.customer_phone,
      proximo_cobro: proximoCobro,
      ultimo_pago: new Date().toISOString(),
      referidos_procesados: [...referidosProcesados, transactionId]
    };

    if (esProductHunt) {
      updateData.metadata = { 
        fuente: 'producthunt', 
        descuento: 'PH2025',
        monto_pagado: montoPagado 
      };
    }

    await supabase.from('suscriptores').update(updateData).eq('id', user.id);

    // ========== SISTEMA DE REFERIDOS MEJORADO ==========
    if (user.referido_por) {
      // 1. Verificar que el invitador exista
      const { data: invitador } = await supabase
        .from('suscriptores')
        .select('id, telegram_chat_id, meses_gratis_acumulados, amigos_invitados, codigo_referido')
        .eq('codigo_referido', user.referido_por)
        .single();

      if (invitador) {
        const { data: referralLog } = await supabase
          .from('referidos_log')
          .select('id, estado')
          .eq('invitador_id', invitador.id)
          .eq('invitado_id', user.id)
          .maybeSingle();

        const estadoLog = referralLog?.estado || null;
        const recompensaYaAplicada =
          estadoLog === 'pago_confirmado' || estadoLog === 'recompensa_aplicada';

        // 2. ANTI-CÍRCULO: Verificar que el invitador no sea el mismo usuario
        // y que el invitador no haya sido referido por este usuario
        const { data: relacionCircular } = await supabase
          .from('suscriptores')
          .select('referido_por')
          .eq('telegram_chat_id', invitador.telegram_chat_id)
          .single();

        const esCircular = relacionCircular?.referido_por === user.codigo_referido;
        
        if (!esCircular && invitador.telegram_chat_id !== chatId && !recompensaYaAplicada) {
          // 3. LÍMITE DE MESES: Máximo 12 meses gratis acumulados
          const mesesActuales = invitador.meses_gratis_acumulados || 0;
          const nuevosMeses = Math.min(mesesActuales + 1, 12);

          await supabase.from('suscriptores').update({
            meses_gratis_acumulados: nuevosMeses,
            amigos_invitados: (invitador.amigos_invitados || 0) + 1
          }).eq('id', invitador.id);

          // Notificar al invitador
          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: invitador.telegram_chat_id,
              text: `🎉 <b>¡Ganaste 1 mes gratis!</b>\n\n` +
                    `${user.nombre || 'Tu amigo'} acaba de pagar su suscripción.\n\n` +
                    `📊 Total meses acumulados: ${nuevosMeses}/12\n\n` +
                    `Tu próximo mes es gratis 🎁`,
              parse_mode: 'HTML'
            })
          });

          // 4. El que pagó TAMBIÉN gana 1 mes gratis (si fue referido)
          const mesesUsuarioActual = user.meses_gratis_acumulados || 0;
          const nuevosMesesUsuario = Math.min(mesesUsuarioActual + 1, 12);
          
          await supabase.from('suscriptores').update({
            meses_gratis_acumulados: nuevosMesesUsuario
          }).eq('id', user.id);

          if (referralLog?.id) {
            await supabase
              .from('referidos_log')
              .update({ estado: 'recompensa_aplicada' })
              .eq('id', referralLog.id);
          } else {
            await supabase.from('referidos_log').insert({
              invitador_id: invitador.id,
              invitado_id: user.id,
              estado: 'recompensa_aplicada',
              creado_en: new Date().toISOString(),
            });
          }

          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `🎉 <b>¡Ganaste 1 mes gratis!</b>\n\n` +
                    `Por venir referido, tenés un mes extra de suscripción.\n\n` +
                    `📊 Total meses acumulados: ${nuevosMesesUsuario}/12`,
              parse_mode: 'HTML'
            })
          });
        }
      }
    }

    // Notificar al nuevo pagador
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🎉 <b>¡Ya estás dentro del club, ${user.nombre || 'madrugador'}!</b>\n\n` +
              `Gracias por confiar en nos. Tu pago se confirmó todo bien.\n\n` +
              `✅ Suscripción activa\n` +
              `📅 Próximo cobro: ${new Date(proximoCobro).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}\n\n` +
              `🌅 <b>Mañana 6 AM</b> te mando tu primera frase.\n\n` +
              `Un par de comandos útiles:\n` +
              `• MI CUENTA - Ver tu estado\n` +
              `• REFERIDOS - Invitá amigos y ganen meses gratis\n` +
              `• AYUDA - Si tenés alguna duda\n\n` +
              `Nos vemos mañana temprano ☕`,
        parse_mode: 'HTML'
      })
    });

    // Notificar al admin
    const ADMIN_CHAT_ID = '1758647248';
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: `💰 ¡Nuevo pago!\n\n` +
              `👤 ${user.nombre || 'Alguien'} acaba de pagar\n` +
              `💵 $${montoPagado.toLocaleString()} COP${esProductHunt ? ' (Product Hunt 50% OFF)' : ''}\n` +
              `🏷️ ${user.perfil || 'Sin perfil'}\n` +
              `${user.referido_por ? '👥 Vino por referido' : esProductHunt ? '🐱 Product Hunt' : '👀 Orgánico'}\n\n` +
              `🎉 ¡Sigue creciendo el club!`,
        parse_mode: 'HTML'
      })
    });

    return res.json({ received: true, activated: true, user: user.id });

  } catch (error) {
    console.error('Error webhook:', error);
    return res.status(500).json({ error: error.message });
  }
}
