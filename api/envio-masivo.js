// Sistema de envío masivo de frases - Versión estable
// Este endpoint reemplaza a enviar-diario.js con mejor manejo de errores y logging

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const frasesPorPerfil = {
  tienda: [
    '🏪 Hoy no es un día más, hoy es el día que un cliente fiel decide volver.',
    '☕ El local está frío a las 6am, pero tu actitud lo calienta todo.',
    '💪 Otro día de inventario y proveedores. Y sos tan libre que elegís esto.',
    '🌅 La competencia duerme, vos ya estás acomodando la vitrina.'
  ],
  freelance: [
    '💻 No hay jefe que te controle, solo deadlines que te persiguen. Hoy los domás.',
    '⏰ Procrastinar es tentador, pero el café está caliente y el cliente espera.',
    '💼 Cobrarle al difícil es arte. Hoy lo practicás con elegancia.',
    '🎯 Tu valor no es el tiempo que sentás, es el problema que resolvés.'
  ],
  startup: [
    '🚀 Pivotar no es rendirse, es encontrar el ángulo correcto.',
    '💌 El inversor no te respondió. No importa, hay 20 más que mandar.',
    '📊 El burn rate te preocupa a las 3am. Hoy tomás decisiones para bajarlo.',
    '🎯 El producto perfecto no existe, pero el que vende sí. Shipeá hoy.'
  ],
  profesional: [
    '⚖️ Otro día salvando vidas. Tu expertise es el escudo de otros.',
    '🏆 La carrera te agota, pero tu reputación te sustenta. Cuidala hoy.',
    '📚 Estudiaste años para este momento. No es rutina, es maestría.',
    '🤝 Tu ética profesional es tu verdadero curriculum. Protegela.'
  ]
};

function obtenerFrase(perfil, dia, nombre) {
  const frases = frasesPorPerfil[perfil] || frasesPorPerfil.tienda;
  const frase = frases[dia % frases.length];
  return nombre ? `${nombre}, ${frase.toLowerCase()}` : frase;
}

function generarLinkPago(user) {
  const baseUrl = process.env.NEXT_PUBLIC_URL;
  const chatId = user.telegram_chat_id;
  const ref = user.codigo_referido || '';
  const perfil = user.perfil || 'tienda';

  return `${baseUrl}/pagar?chat_id=${chatId}&ref=${ref}&perfil=${perfil}`;
}

export default async function handler(req, res) {
  // Aceptar GET y POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth: Vercel Cron usa Authorization: Bearer <CRON_SECRET>.
  // Para ejecuciones manuales aceptamos el mismo secreto por query string.
  const authHeader = req.headers.authorization;
  const { key } = req.query;

  const expectedSecret = process.env.CRON_SECRET;
  const isAuthorized =
    Boolean(expectedSecret) &&
    (authHeader === `Bearer ${expectedSecret}` || key === expectedSecret);
  
  if (!isAuthorized) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const logs = [];
  const addLog = (msg) => {
    console.log(msg);
    logs.push(msg);
  };

  try {
    // Fecha de Colombia
    const ahora = new Date();
    const hoyColombia = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    const hoyStr = hoyColombia.toISOString().split('T')[0];
    const diaDelMes = hoyColombia.getDate();
    const en3Dias = new Date(hoyColombia);
    en3Dias.setDate(en3Dias.getDate() + 3);
    const en3DiasStr = en3Dias.toISOString().split('T')[0];
    const en1Dia = new Date(hoyColombia);
    en1Dia.setDate(en1Dia.getDate() + 1);
    const en1DiaStr = en1Dia.toISOString().split('T')[0];
    const ayer = new Date(hoyColombia);
    ayer.setDate(ayer.getDate() - 1);
    const ayerStr = ayer.toISOString().split('T')[0];

    addLog(`🚀 Iniciando envío masivo - ${hoyStr} ${hoyColombia.toLocaleTimeString('es-CO')}`);

    // 1. OBTENER USUARIOS ACTIVOS
    addLog('📊 Consultando usuarios activos...');
    const { data: activos, error: errorActivos } = await supabase
      .from('suscriptores')
      .select('*')
      .eq('estado', 'activo');

    if (errorActivos) {
      addLog(`❌ Error consultando activos: ${errorActivos.message}`);
      return res.status(500).json({ error: errorActivos.message, logs });
    }

    addLog(`✅ Activos encontrados: ${activos?.length || 0}`);

    // 2. OBTENER TRIALS VÁLIDOS
    addLog('📊 Consultando trials...');
    const { data: trials, error: errorTrials } = await supabase
      .from('suscriptores')
      .select('*')
      .eq('estado', 'trial');

    if (errorTrials) {
      addLog(`❌ Error consultando trials: ${errorTrials.message}`);
      return res.status(500).json({ error: errorTrials.message, logs });
    }

    // Filtrar trials válidos
    const trialsValidos = trials?.filter(user => {
      if (!user.trial_fin) return false;
      const finTrial = new Date(user.trial_fin);
      const hoyColombiaDate = new Date(hoyStr + 'T23:59:59');
      return finTrial >= hoyColombiaDate;
    }) || [];

    addLog(`✅ Trials válidos: ${trialsValidos.length} de ${trials?.length || 0}`);

    // 3. COMBINAR USUARIOS
    const usuariosParaEnviar = [...(activos || []), ...trialsValidos];
    addLog(`📦 Total usuarios para enviar: ${usuariosParaEnviar.length}`);

    // 4. ENVIAR FRASES
    let enviados = 0;
    let fallidos = 0;
    let trialsPorVencerHoy = 0;
    let recordatorios3Dias = 0;
    let recordatorios1Dia = 0;
    let recordatoriosVenceHoy = 0;
    let reactivacionesVencidos = 0;

    for (const user of usuariosParaEnviar) {
      try {
        // Verificar que tenga chat_id
        if (!user.telegram_chat_id) {
          addLog(`⚠️ Usuario ${user.id} sin telegram_chat_id, saltando`);
          fallidos++;
          continue;
        }

        // Aplicar mes gratis si corresponde (solo activos)
        if (user.estado === 'activo' && 
            user.proximo_cobro && 
            new Date(user.proximo_cobro) <= hoyColombia && 
            user.meses_gratis_acumulados > 0) {
          
          const nuevaFecha = new Date(hoyColombia.getTime() + 30 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0];
          
          await supabase.from('suscriptores').update({
            meses_gratis_acumulados: user.meses_gratis_acumulados - 1,
            proximo_cobro: nuevaFecha
          }).eq('id', user.id);

          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: user.telegram_chat_id,
              text: `🎁 Usaste 1 mes gratis. Quedan ${user.meses_gratis_acumulados - 1}.`,
              parse_mode: 'HTML'
            }),
          });
          
          addLog(`🎁 Mes gratis aplicado a ${user.nombre || user.telegram_chat_id}`);
        }

        // Preparar y enviar frase
        const frase = obtenerFrase(user.perfil || 'tienda', diaDelMes, user.nombre);
        const fechaFormateada = hoyColombia.toLocaleDateString('es-CO', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        });

        const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: user.telegram_chat_id,
            text: `🌅 <b>${fechaFormateada}</b>\n\n${frase}\n\n— Los que Madrugan`,
            parse_mode: 'HTML',
          }),
        });

        const result = await response.json();

        if (result.ok) {
          // Actualizar último envío
          await supabase.from('suscriptores').update({
            frases_enviadas: (user.frases_enviadas || 0) + 1,
            ultimo_envio: hoyColombia.toISOString()
          }).eq('id', user.id);

          enviados++;
          addLog(`✅ Enviado a ${user.nombre || user.telegram_chat_id}`);
        } else {
          fallidos++;
          addLog(`❌ Error Telegram a ${user.telegram_chat_id}: ${result.description}`);
        }
      } catch (e) {
        fallidos++;
        addLog(`❌ Error enviando a ${user.telegram_chat_id}: ${e.message}`);
      }
    }

    // 5. RECORDATORIOS DE TRIAL Y RENOVACION
    addLog('📣 Procesando recordatorios de trial y renovación...');

    const { data: trialsVencenHoy, error: errorTrialsVencenHoy } = await supabase
      .from('suscriptores')
      .select('*')
      .eq('estado', 'trial')
      .gte('trial_fin', `${hoyStr}T00:00:00`)
      .lte('trial_fin', `${hoyStr}T23:59:59`);

    if (errorTrialsVencenHoy) {
      addLog(`❌ Error consultando trials por vencer hoy: ${errorTrialsVencenHoy.message}`);
    } else {
      for (const user of trialsVencenHoy || []) {
        try {
          const linkPago = generarLinkPago(user);
          const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: user.telegram_chat_id,
              text:
                `⏰ <b>Tu trial termina hoy</b>\n\n` +
                `¿Te gustó madrugar con nosotros?\n\n` +
                `✅ <b>Seguí recibiendo frases todas las mañanas</b>\n\n` +
                `<s>$19.900 COP/mes</s>\n` +
                `<b>🎉 $9.900 COP/mes - 50% OFF</b>\n\n` +
                `👉 <a href="${linkPago}">Activar suscripción ahora</a>\n\n` +
                `🔒 Seguro vía Wompi`,
              parse_mode: 'HTML'
            }),
          });

          const result = await response.json();
          if (result.ok) {
            trialsPorVencerHoy++;
          } else {
            addLog(`⚠️ Error recordatorio trial ${user.telegram_chat_id}: ${result.description}`);
          }
        } catch (e) {
          addLog(`⚠️ Error recordatorio trial ${user.telegram_chat_id}: ${e.message}`);
        }
      }
    }

    const enviarRecordatorios = async (fechaStr, etiqueta, textoBuilder, onSuccess = null) => {
      const { data: usuarios, error } = await supabase
        .from('suscriptores')
        .select('*')
        .eq('estado', 'activo')
        .gte('proximo_cobro', `${fechaStr}T00:00:00`)
        .lte('proximo_cobro', `${fechaStr}T23:59:59`);

      if (error) {
        addLog(`❌ Error consultando ${etiqueta}: ${error.message}`);
        return 0;
      }

      let enviadosCategoria = 0;

      for (const user of usuarios || []) {
        try {
          const linkPago = generarLinkPago(user);
          const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: user.telegram_chat_id,
              text: textoBuilder(linkPago),
              parse_mode: 'HTML'
            }),
          });

          const result = await response.json();
          if (result.ok) {
            enviadosCategoria++;
            if (onSuccess) {
              await onSuccess(user);
            }
          } else {
            addLog(`⚠️ Error ${etiqueta} ${user.telegram_chat_id}: ${result.description}`);
          }
        } catch (e) {
          addLog(`⚠️ Error ${etiqueta} ${user.telegram_chat_id}: ${e.message}`);
        }
      }

      return enviadosCategoria;
    };

    recordatorios3Dias = await enviarRecordatorios(
      en3DiasStr,
      'recordatorio 3 días',
      (linkPago) =>
        `⏰ <b>Tu suscripción vence en 3 días</b>\n\n` +
        `No pierdas la rutina de madrugar con apoyo.\n\n` +
        `👉 <a href="${linkPago}">Renovar ahora - $9.900 COP/mes</a>\n\n` +
        `🔒 Seguro vía Wompi`
    );

    recordatorios1Dia = await enviarRecordatorios(
      en1DiaStr,
      'recordatorio 1 día',
      (linkPago) =>
        `⏰ <b>Tu suscripción vence mañana</b>\n\n` +
        `Último día para renovar sin perder la continuidad.\n\n` +
        `👉 <a href="${linkPago}">Renovar ahora - $9.900 COP/mes</a>\n\n` +
        `🔒 Seguro vía Wompi`
    );

    recordatoriosVenceHoy = await enviarRecordatorios(
      hoyStr,
      'recordatorio vence hoy',
      (linkPago) =>
        `⚠️ <b>Tu suscripción vence hoy</b>\n\n` +
        `Renová ahora para no perder la continuidad.\n\n` +
        `👉 <a href="${linkPago}">Renovar urgente - $9.900 COP/mes</a>\n\n` +
        `🔒 Seguro vía Wompi\n\n` +
        `💡 Si ya pagaste, ignorá este mensaje.`
    );

    reactivacionesVencidos = await enviarRecorditoriosVencidosAyer();

    async function enviarRecorditoriosVencidosAyer() {
      return enviarRecordatorios(
        ayerStr,
        'reactivación vencidos',
        (linkPago) =>
          `😢 <b>Tu suscripción venció ayer</b>\n\n` +
          `No pierdas el ritmo de madrugar con apoyo. Reactivá ahora y seguís donde dejaste.\n\n` +
          `👉 <a href="${linkPago}">Reactivar suscripción - $9.900 COP/mes</a>\n\n` +
          `🔒 Seguro vía Wompi`,
        async (user) => {
          await supabase.from('suscriptores').update({ estado: 'vencido' }).eq('id', user.id);
        }
      );
    }

    // Notificar al admin
    try {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: '1758647248',
          text: `📊 <b>Resumen de envío</b>\n\n` +
                `📅 Fecha: ${hoyStr}\n` +
                `✅ Enviados: ${enviados}\n` +
                `❌ Fallidos: ${fallidos}\n` +
                `📦 Total: ${usuariosParaEnviar.length}\n\n` +
                `⏰ Trials vencen hoy: ${trialsPorVencerHoy}\n` +
                `🔁 Renovación en 3 días: ${recordatorios3Dias}\n` +
                `🔁 Renovación mañana: ${recordatorios1Dia}\n` +
                `🚨 Vencen hoy: ${recordatoriosVenceHoy}\n` +
                `♻️ Reactivación vencidos: ${reactivacionesVencidos}`,
          parse_mode: 'HTML'
        }),
      });
    } catch (e) {
      addLog(`⚠️ No se pudo notificar al admin: ${e.message}`);
    }

    addLog(`🏁 Envío completado: ${enviados} exitosos, ${fallidos} fallidos`);

    return res.json({
      success: true,
      fecha: hoyStr,
      hora_colombia: hoyColombia.toISOString(),
      total_usuarios: usuariosParaEnviar.length,
      enviados,
      fallidos,
      trials_por_vencer_hoy: trialsPorVencerHoy,
      recordatorios_3_dias: recordatorios3Dias,
      recordatorios_1_dia: recordatorios1Dia,
      recordatorios_vence_hoy: recordatoriosVenceHoy,
      reactivaciones_vencidos: reactivacionesVencidos,
      logs
    });

  } catch (error) {
    addLog(`🔥 Error fatal: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      logs 
    });
  }
}
