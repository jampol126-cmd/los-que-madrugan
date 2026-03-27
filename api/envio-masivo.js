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
                `📦 Total: ${usuariosParaEnviar.length}`,
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
