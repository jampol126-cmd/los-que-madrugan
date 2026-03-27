import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export function applyCors(res, methods = 'GET, POST, PUT, DELETE, OPTIONS') {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function handleOptions(req, res, methods) {
  applyCors(res, methods);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

export function getAdminSecret() {
  return process.env.ADMIN_SECRET || process.env.CRON_SECRET || '';
}

export function isAdminAuthorized(req) {
  const expectedSecret = getAdminSecret();
  const authHeader = req.headers.authorization;
  return Boolean(expectedSecret) && authHeader === `Bearer ${expectedSecret}`;
}

export function requireAdminAuth(req, res) {
  if (!isAdminAuthorized(req)) {
    res.status(401).json({ error: 'No autorizado' });
    return false;
  }
  return true;
}

export async function sendTelegramMessage(chatId, text) {
  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });

  const result = await response.json();
  if (!result.ok) {
    throw new Error(result.description || 'No se pudo enviar el mensaje');
  }

  return result;
}

export function normalizeDateField(row) {
  if (!row) return row;
  return {
    ...row,
    creado_en: row.creado_en || row.created_at || null,
  };
}
