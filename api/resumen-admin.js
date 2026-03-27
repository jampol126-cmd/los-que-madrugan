import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_CHAT_ID = '1758647248';

export default async function handler(req, res) {
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const hoy = new Date().toISOString().split('T')[0];
    const hoyColombia = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota', day: 'numeric', month: 'long' });
    
    // Estadísticas del día
    const { data: nuevosHoy } = await supabase
      .from('suscriptores')
      .select('*', { count: 'exact' })
      .gte('creado_en', hoy + 'T00:00:00');
    
    const { data: pagosHoy } = await supabase
      .from('suscriptores')
      .select('*')
      .gte('ultimo_pago', hoy + 'T00:00:00');
    
    const { data: cancelacionesHoy } = await supabase
      .from('suscriptores')
      .select('*')
      .eq('estado', 'cancelado')
      .gte('updated_at', hoy + 'T00:00:00');
    
    const { count: totalActivos } = await supabase
      .from('suscriptores')
      .select('*', { count: 'exact' })
      .eq('estado', 'activo');
    
    const { count: totalTrial } = await supabase
      .from('suscriptores')
      .select('*', { count: 'exact' })
      .eq('estado', 'trial');

    const ingresosHoy = (pagosHoy?.length || 0) * 9900;
    const mrr = (totalActivos || 0) * 9900;

    // Mensaje más cercano y conversacional
    let mensaje = `📊 <b>Cierre del día - ${hoyColombia}</b>\n\n`;
    
    if (ingresosHoy > 0) {
      mensaje += `💰 <b>Ventas hoy:</b> $${ingresosHoy.toLocaleString()} COP (${pagosHoy?.length} pagos)\n`;
    } else {
      mensaje += `💰 Hoy no hubo ventas, pero tranqui, mañana es otro día 🙂\n`;
    }
    
    if (nuevosHoy?.length > 0) {
      mensaje += `📝 <b>Nuevos registros:</b> ${nuevosHoy.length}\n`;
    }
    
    if (cancelacionesHoy?.length > 0) {
      mensaje += `😢 <b>Cancelaciones:</b> ${cancelacionesHoy.length}\n`;
    }
    
    mensaje += `\n📈 <b>Números generales:</b>\n`;
    mensaje += `• Activos: ${totalActivos || 0}\n`;
    mensaje += `• En trial: ${totalTrial || 0}\n`;
    mensaje += `• MRR: $${mrr.toLocaleString()} COP/mes\n\n`;
    
    mensaje += `🌅 Mañana 6 AM: ${(totalActivos || 0) + (totalTrial || 0)} personas reciben frases\n\n`;
    
    if (ingresosHoy > 0) {
      mensaje += `💪 ¡Buen día! Seguimos sumando.`;
    } else {
      mensaje += `🤷‍♂️ Hoy fue tranqui. Mañana se sale.`;
    }

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: mensaje,
        parse_mode: 'HTML'
      })
    });

    return res.json({ exito: true, mensaje: 'Resumen enviado' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
