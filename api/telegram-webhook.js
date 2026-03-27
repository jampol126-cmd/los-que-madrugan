import { createClient } from '@supabase/supabase-js';

const ADMIN_CHAT_ID = '1758647248';

function generarCodigoReferido(nombre = 'madrugador', chatId = '') {
  const limpio = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const base = limpio.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6) || 'MADRU';
  const suffix = (chatId || `${Date.now()}`).replace(/\D/g, '').slice(-4).padStart(4, '0');
  return `${base}${suffix}`;
}

export default async function handler(req, res) {
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
    
    const startParam = body.message?.text?.split(' ')[1] || '';

    if (!chatId && !callbackQuery?.message?.chat?.id) {
      return res.json({ ok: true });
    }

    const targetChatId = chatId || callbackQuery?.message?.chat?.id?.toString();
    const userName = name || callbackQuery?.message?.chat?.first_name || 'madrugador';

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

    async function ensureReferralCode(user, fallbackName = userName) {
      if (!user) return null;
      if (user.codigo_referido) return user.codigo_referido;

      const codigoReferido = generarCodigoReferido(user.nombre || fallbackName, user.telegram_chat_id || targetChatId);
      await supabase
        .from('suscriptores')
        .update({ codigo_referido: codigoReferido })
        .eq('telegram_chat_id', user.telegram_chat_id || targetChatId);

      return codigoReferido;
    }

    async function sendReferralSummary() {
      const { data: user } = await supabase
        .from('suscriptores')
        .select('telegram_chat_id, nombre, codigo_referido, amigos_invitados, meses_gratis_acumulados')
        .eq('telegram_chat_id', targetChatId)
        .single();

      if (!user) {
        await sendMessage(`Primero tenés que registrarte. Escribí /start y elegí tu perfil 🙂`);
        return;
      }

      const codigoReferido = await ensureReferralCode(user);
      const linkReferido = `https://t.me/${process.env.NEXT_PUBLIC_BOT_NAME || 'MadrugadoresBot'}?start=REF_${codigoReferido}`;

      await sendMessage(
        `🎁 <b>Tus referidos</b>\n\n` +
        `👥 Amigos invitados: ${user.amigos_invitados || 0}\n` +
        `🎉 Meses gratis acumulados: ${user.meses_gratis_acumulados || 0}\n\n` +
        `<b>Tu código:</b> <code>${codigoReferido}</code>\n\n` +
        `<b>Tu link para invitar:</b>\n` +
        `<code>${linkReferido}</code>\n\n` +
        `💡 <b>¿Cómo funciona?</b>\n` +
        `Compartí ese link con amigos emprendedores. Si se suscriben y pagan, ambos ganan <b>1 mes gratis</b>.\n\n` +
        `Máximo acumulado: <b>12 meses gratis</b>.`
      );
    }

    // COMANDO START
    if (message?.startsWith('/start')) {
      const { data: existing } = await supabase
        .from('suscriptores')
        .select('*')
        .eq('telegram_chat_id', targetChatId)
        .single();

      let referidoPor = null;
      if (!existing && startParam?.startsWith('REF_')) {
        const codigoReferido = startParam.replace('REF_', '');
        const { data: invitador } = await supabase
          .from('suscriptores')
          .select('codigo_referido, telegram_chat_id')
          .eq('codigo_referido', codigoReferido)
          .single();
        
        if (invitador && invitador.telegram_chat_id !== targetChatId) {
          referidoPor = codigoReferido;
        }
      }

      if (!existing) {
        const codigoReferidoNuevo = generarCodigoReferido(userName, targetChatId);
        const { data: nuevoUsuario, error: insertError } = await supabase.from('suscriptores').insert({
          telegram_chat_id: targetChatId,
          nombre: userName,
          estado: 'prospecto',
          codigo_referido: codigoReferidoNuevo,
          referido_por: referidoPor,
          trial_usado: false,
          creado_en: new Date().toISOString()
        }).select('id').single();

        if (insertError) {
          throw insertError;
        }

        if (referidoPor && nuevoUsuario?.id) {
          const { data: invitadorRef } = await supabase
            .from('suscriptores')
            .select('id')
            .eq('codigo_referido', referidoPor)
            .single();

          if (invitadorRef?.id) {
            const { data: existingLog } = await supabase
              .from('referidos_log')
              .select('id')
              .eq('invitador_id', invitadorRef.id)
              .eq('invitado_id', nuevoUsuario.id)
              .maybeSingle();

            if (!existingLog) {
              await supabase.from('referidos_log').insert({
                invitador_id: invitadorRef.id,
                invitado_id: nuevoUsuario.id,
                estado: 'registrado',
                creado_en: new Date().toISOString(),
              });
            }
          }
        }
      } else if (!existing.codigo_referido) {
        await ensureReferralCode(existing);
      }

      if (!existing) {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            text: `📝 Alguien nuevo llegó: ${userName} (Chat: ${targetChatId})${referidoPor ? ` por referido ${referidoPor}` : ''}`,
            parse_mode: 'HTML'
          })
        });

        if (referidoPor) {
          const { data: invitador } = await supabase
            .from('suscriptores')
            .select('telegram_chat_id')
            .eq('codigo_referido', referidoPor)
            .single();
          
          if (invitador) {
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: invitador.telegram_chat_id,
                text: `👋 <b>¡Buenas noticias!</b>\n\n${userName} se registró con tu link de referido.\n\nCuando pague, ambos ganan 1 mes gratis 🎉`,
                parse_mode: 'HTML'
              })
            });
          }
        }
      }

      await sendMessage(
        `🌅 <b>¡Qué bueno que estés acá, ${userName}!</b>\n\n` +
        `Soy el bot de <b>Los que Madrugan</b>. Mi trabajo es acompañarte cada mañana con una frase que te impulse a seguir adelante con tu negocio.\n\n` +
        `Primero contame: <b>¿qué tipo de emprendedor sos?</b> 👇`,
        {
          inline_keyboard: [
            [
              { text: "🏪 Tengo una tienda/local", callback_data: "perfil_tienda" },
              { text: "💻 Soy freelancer", callback_data: "perfil_freelance" }
            ],
            [
              { text: "🚀 Tengo una startup", callback_data: "perfil_startup" },
              { text: "⚕️ Soy profesional", callback_data: "perfil_profesional" }
            ]
          ]
        }
      );

      return res.json({ ok: true });
    }

    // COMANDO AYUDA
    if (message?.toUpperCase() === 'AYUDA' || message?.toUpperCase() === '/AYUDA' || message?.toUpperCase() === 'HELP') {
      await sendMessage(
        `🆘 <b>¿En qué te puedo ayudar?</b>\n\n` +
        `Elegí una opción y te explico todo 👇`,
        {
          inline_keyboard: [
            [{ text: "🤔 ¿Cómo funciona esto?", callback_data: "ayuda_como_funciona" }],
            [{ text: "💰 ¿Cuánto cuesta?", callback_data: "ayuda_precio" }],
            [{ text: "🎁 Ver mis referidos", callback_data: "ayuda_referidos" }],
            [{ text: "🔄 Cambiar mi perfil", callback_data: "cambiar_perfil" }],
            [{ text: "💳 Quiero pagar", callback_data: "ayuda_pagar" }],
            [{ text: "👨‍💼 Quiero hablar con una persona", callback_data: "ayuda_hablar_humano" }]
          ]
        }
      );
      return res.json({ ok: true });
    }

    // COMANDO MI CUENTA
    if (message?.toUpperCase() === 'MI CUENTA' || message?.toUpperCase() === '/MICUENTA') {
      const { data: user } = await supabase
        .from('suscriptores')
        .select('*')
        .eq('telegram_chat_id', targetChatId)
        .single();

      if (!user) {
        await sendMessage(`👋 <b>Hola!</b>\n\nVeo que todavía no tenés cuenta. Querés probar 3 días gratis? Escribí /start y arrancamos 🙂`);
        return res.json({ ok: true });
      }

      let mensaje = `👤 <b>Tu cuenta</b>\n\n`;
      mensaje += `📍 <b>Estado:</b> ${user.estado === 'activo' ? 'Activo ✅' : user.estado === 'trial' ? 'En prueba 🎁' : 'Prospecto 👀'}\n`;
      
      if (user.estado === 'trial' && user.trial_fin) {
        const dias = Math.ceil((new Date(user.trial_fin) - new Date()) / (1000 * 60 * 60 * 24));
        mensaje += `⏳ <b>Trial:</b> Te quedan ${dias} días\n\n`;
        mensaje += `💡 Cuando termine el trial, si querés seguir, escribí PAGAR.\n`;
      } else if (user.estado === 'activo' && user.proximo_cobro) {
        mensaje += `📅 <b>Próximo cobro:</b> ${new Date(user.proximo_cobro).toLocaleDateString('es-CO')}\n`;
        if (user.meses_gratis_acumulados > 0) {
          mensaje += `🎁 <b>Meses gratis acumulados:</b> ${user.meses_gratis_acumulados}\n`;
        }
      }
      
      mensaje += `\n🎯 <b>Perfil:</b> ${user.perfil || 'Sin definir'}\n`;
      mensaje += `📊 <b>Frases recibidas:</b> ${user.frases_enviadas || 0}\n`;

      if (user.estado === 'trial' || user.estado === 'prospecto') {
        mensaje += `\n💳 Escribí <b>PAGAR</b> para suscribirte.`;
      }

      await sendMessage(mensaje);
      return res.json({ ok: true });
    }

    // COMANDO REFERIDOS
    if (message?.toUpperCase() === 'REFERIDOS') {
      await sendReferralSummary();
      return res.json({ ok: true });
    }

    // COMANDO PAGAR
    if (message?.toUpperCase() === 'PAGAR') {
      const { data: user } = await supabase
        .from('suscriptores')
        .select('codigo_referido, perfil')
        .eq('telegram_chat_id', targetChatId)
        .single();

      const linkPago = `${process.env.NEXT_PUBLIC_URL}/pagar?chat_id=${targetChatId}&ref=${user?.codigo_referido || ''}&perfil=${user?.perfil || 'tienda'}`;

      await sendMessage(
        `💳 <b>Pagar suscripción</b>\n\n` +
        `Acá tenés el link seguro:\n\n` +
        `<s>$19.900 COP/mes</s>\n` +
        `<b>🎉 $9.900 COP/mes - 50% OFF</b>\n\n` +
        `👉 <a href="${linkPago}">Click acá para pagar</a>\n\n` +
        `Si tenés alguna duda antes de pagar, escribime sin problema 🙂`
      );
      return res.json({ ok: true });
    }

    // COMANDO CAMBIAR PERFIL
    if (message?.toUpperCase() === 'CAMBIAR PERFIL' || message?.toUpperCase() === 'PERFIL') {
      await sendMessage(
        `🔄 <b>Cambiar perfil</b>\n\n` +
        `¿Querés que te envíe frases de otro tipo de emprendedor?\n\n` +
        `Elegí el que más te represente ahora 👇`,
        {
          inline_keyboard: [
            [
              { text: "🏪 Dueño de tienda", callback_data: "cambiar_a_tienda" },
              { text: "💻 Freelancer", callback_data: "cambiar_a_freelance" }
            ],
            [
              { text: "🚀 Startup", callback_data: "cambiar_a_startup" },
              { text: "⚕️ Profesional", callback_data: "cambiar_a_profesional" }
            ],
            [{ text: "⬅️ Volver al menú de ayuda", callback_data: "volver_ayuda" }]
          ]
        }
      );
      return res.json({ ok: true });
    }

    // COMANDO BAJA/CANCELAR
    if (message?.toUpperCase() === 'BAJA' || message?.toUpperCase() === 'CANCELAR' || message?.toUpperCase() === '/CANCELAR') {
      await supabase.from('suscriptores').update({ estado: 'cancelado' }).eq('telegram_chat_id', targetChatId);
      
      await sendMessage(
        `❌ <b>Suscripción cancelada</b>\n\n` +
        `Lamento que te vayas. Si en algún momento querés volver, solo escribime <b>/start</b> y reactivamos todo.\n\n` +
        `Una última cosa: si tenés un segundo, contame por qué te vas. Me ayuda a mejorar 🙂`
      );

      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: `⚠️ ${userName} (Chat: ${targetChatId}) canceló su suscripción.`,
          parse_mode: 'HTML'
        })
      });
      
      return res.json({ ok: true });
    }

    // CALLBACKS (botones inline)
    if (callbackQuery) {
      const callbackData = callbackQuery.data;
      const messageId = callbackQuery.message.message_id;

      if (callbackData.startsWith('perfil_')) {
        const perfil = callbackData.replace('perfil_', '');
        await supabase.from('suscriptores').update({ perfil }).eq('telegram_chat_id', targetChatId);

        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            message_id: messageId,
            text: `✅ <b>¡Perfecto!</b> Perfil guardado: ${perfil.toUpperCase()}\n\n` +
                  `Ahora te propongo algo: probá el servicio <b>3 días gratis</b>. Sin tarjeta, sin compromiso.\n\n` +
                  `¿Arrancamos? 🚀`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[{ text: "🎁 Sí, quiero probar gratis", callback_data: "iniciar_trial" }]]
            }
          })
        });
        return res.json({ ok: true });
      }

      if (callbackData === 'iniciar_trial') {
        const { data: user } = await supabase
          .from('suscriptores')
          .select('trial_usado, estado')
          .eq('telegram_chat_id', targetChatId)
          .single();

        if (user?.trial_usado || user?.estado === 'activo') {
          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: targetChatId,
              message_id: messageId,
              text: `⚠️ <b>Ya usaste tu trial</b>\n\n` +
                    `Recordá que el trial es solo una vez por usuario.\n\n` +
                    `¿Querés suscribirte? Son $9.900 COP/mes.`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [[{ text: "💳 Suscribirme ahora", callback_data: "quiero_pagar" }]]
              }
            })
          });
          return res.json({ ok: true });
        }

        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + 3);

        await supabase.from('suscriptores').update({ 
          estado: 'trial', 
          trial_fin: fechaFin.toISOString(),
          trial_usado: true
        }).eq('telegram_chat_id', targetChatId);

        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            message_id: messageId,
            text: `🎉 <b>¡Listo, ${userName}!</b>\n\n` +
                  `Tu trial de 3 días está activo.\n` +
                  `📅 Tu primera frase llega <b>mañana a las 6:00 AM</b>.`,
            parse_mode: 'HTML'
          })
        });
        return res.json({ ok: true });
      }

      if (callbackData === 'quiero_pagar' || callbackData === 'ayuda_pagar') {
        const { data: user } = await supabase
          .from('suscriptores')
          .select('codigo_referido, perfil')
          .eq('telegram_chat_id', targetChatId)
          .single();

        const linkPago = `${process.env.NEXT_PUBLIC_URL}/pagar?chat_id=${targetChatId}&ref=${user?.codigo_referido || ''}&perfil=${user?.perfil || 'tienda'}`;

        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: `💳 <b>Perfecto, vamos allá</b>\n\n` +
                  `👉 <a href="${linkPago}">Click acá para pagar $9.900 COP/mes</a>`,
            parse_mode: 'HTML'
          })
        });
        return res.json({ ok: true });
      }

      if (callbackData === 'ayuda_como_funciona') {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: `🤔 <b>¿Cómo funciona?</b>\n\n` +
                  `1️⃣ Te suscribís (3 días gratis o pagando)\n` +
                  `2️⃣ Cada mañana a las 6 AM te llega una frase\n` +
                  `3️⃣ La frase es según tu perfil\n` +
                  `4️⃣ Si te gusta, seguís. Si no, cancelás cuando querás.`,
            parse_mode: 'HTML'
          })
        });
        return res.json({ ok: true });
      }

      if (callbackData === 'ayuda_precio') {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: `💰 <b>Precio</b>\n\n` +
                  `• <b>Trial:</b> 3 días gratis\n` +
                  `• <b>Suscripción:</b> $9.900 COP/mes\n` +
                  `• <b>Promo:</b> Antes $19.900, ahora $9.900\n\n` +
                  `💡 Si invitás un amigo y paga, ambos ganan 1 mes gratis.`,
            parse_mode: 'HTML'
          })
        });
        return res.json({ ok: true });
      }

      if (callbackData === 'ayuda_referidos') {
        await sendReferralSummary();
        return res.json({ ok: true });
      }

      if (callbackData === 'ayuda_hablar_humano') {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: `👨‍💼 <b>Hablar con una persona</b>\n\n` +
                  `👉 Escribile a <b>@kindjay</b> (Javier)\n` +
                  `📧 O por email: hola@losquemadrugan.co`,
            parse_mode: 'HTML'
          })
        });
        return res.json({ ok: true });
      }

      if (callbackData === 'cambiar_perfil' || callbackData === 'ayuda_cambiar_perfil') {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: `🔄 <b>Cambiar perfil</b>\n\nElegí:`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "🏪 Tienda", callback_data: "cambiar_a_tienda" },
                  { text: "💻 Freelance", callback_data: "cambiar_a_freelance" }
                ],
                [
                  { text: "🚀 Startup", callback_data: "cambiar_a_startup" },
                  { text: "⚕️ Profesional", callback_data: "cambiar_a_profesional" }
                ]
              ]
            }
          })
        });
        return res.json({ ok: true });
      }

      if (callbackData.startsWith('cambiar_a_')) {
        const nuevoPerfil = callbackData.replace('cambiar_a_', '');
        await supabase.from('suscriptores').update({ perfil: nuevoPerfil }).eq('telegram_chat_id', targetChatId);
        
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: `✅ <b>Listo!</b>\n\nCambié tu perfil a: <b>${nuevoPerfil}</b>\n\nA partir de mañana recibís frases para este perfil.`,
            parse_mode: 'HTML'
          })
        });
        return res.json({ ok: true });
      }
    }

    // RESPUESTA PARA MENSAJES NO RECONOCIDOS
    // Si llegó acá es porque no coincidió con ningún comando anterior
    if (message && !callbackQuery) {
      await sendMessage(
        `🤔 <b>No entendí eso</b>\n\n` +
        `¿Querés que te ayude? Escribí:\n\n` +
        `• <b>AYUDA</b> - Ver opciones de ayuda\n` +
        `• <b>MI CUENTA</b> - Ver tu estado\n` +
        `• <b>REFERIDOS</b> - Ver tu código y link\n` +
        `• <b>/start</b> - Empezar de nuevo\n\n` +
        `O contame qué necesitás 🙂`
      );
      return res.json({ ok: true });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Error webhook:', error);
    return res.status(200).json({ ok: true });
  }
}
