const BASE_URL = import.meta.env.VITE_API_URL || ''
const AUTH_KEY = 'admin_token'

function getStoredToken() {
  return localStorage.getItem(AUTH_KEY) || ''
}

function adminHeaders(token?: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token ?? getStoredToken()}`,
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: adminHeaders(token),
    })
    return res.ok
  } catch {
    return false
  }
}

// ─── Métricas ────────────────────────────────────────────────────────────────

export interface MetricasAPI {
  total_usuarios: number
  activos: number
  en_trial: number
  mrr_cop: number
  por_perfil: Array<{ perfil: string; count: number }>
}

export async function getMetrics(): Promise<MetricasAPI> {
  const res = await fetch(`${BASE_URL}/api/admin/metrics`, { headers: adminHeaders() })
  if (!res.ok) throw new Error('No autorizado o error al obtener métricas')
  return res.json()
}

// ─── Frases ──────────────────────────────────────────────────────────────────

export interface FraseAPI {
  id: string
  perfil: string
  texto: string
  activa: boolean
  usos_count: number
}

export async function getFrases(perfil: string): Promise<FraseAPI[]> {
  const res = await fetch(`${BASE_URL}/api/admin/frases?perfil=${perfil}`, {
    headers: adminHeaders(),
  })
  if (!res.ok) throw new Error('Error al cargar frases')
  const data = await res.json()
  return data.frases ?? []
}

export async function addFrase(perfil: string, texto: string): Promise<FraseAPI> {
  const res = await fetch(`${BASE_URL}/api/admin/frases`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ perfil, texto }),
  })
  if (!res.ok) throw new Error('Error al agregar frase')
  const data = await res.json()
  return data.frase
}

export async function updateFrase(
  id: string,
  updates: { texto?: string; activa?: boolean }
): Promise<FraseAPI> {
  const res = await fetch(`${BASE_URL}/api/admin/frases`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ id, ...updates }),
  })
  if (!res.ok) throw new Error('Error al actualizar frase')
  const data = await res.json()
  return data.frase
}

export async function deleteFrase(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/admin/frases?id=${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  })
  if (!res.ok) throw new Error('Error al eliminar frase')
}

// ─── Suscriptores ────────────────────────────────────────────────────────────

export interface SuscriptorAPI {
  id: string
  telegram_chat_id: string
  nombre: string | null
  email: string | null
  telefono: string | null
  perfil: string
  estado: string
  trial_fin: string | null
  proximo_cobro: string | null
  ultimo_pago: string | null
  frases_enviadas: number
  amigos_invitados: number
  meses_gratis_acumulados: number
  creado_en: string
}

export async function getSuscriptores(): Promise<SuscriptorAPI[]> {
  const res = await fetch(`${BASE_URL}/api/admin/suscriptores`, { headers: adminHeaders() })
  if (!res.ok) throw new Error('Error al cargar suscriptores')
  const data = await res.json()
  return data.suscriptores ?? []
}

export async function cancelarSuscriptor(chatId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/admin/cancelar-suscriptor`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ chat_id: chatId }),
  })
  if (!res.ok) throw new Error('Error al cancelar suscripción')
}

export async function darMesGratis(chatId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/admin/dar-mes-gratis`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ chat_id: chatId }),
  })
  if (!res.ok) throw new Error('Error al dar mes gratis')
}

export async function enviarMensajeAdmin(chatId: string, mensaje: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/admin/enviar-mensaje`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ chat_id: chatId, mensaje }),
  })
  if (!res.ok) throw new Error('Error al enviar mensaje')
}

export async function exportarCSV(): Promise<Blob> {
  const res = await fetch(`${BASE_URL}/api/admin/export`, { headers: adminHeaders() })
  if (!res.ok) throw new Error('Error al exportar CSV')
  return res.blob()
}

// ─── Usuario / Referidos ─────────────────────────────────────────────────────

export interface UsuarioReferidosAPI {
  codigo_referido: string
  meses_gratis_acumulados: number
  amigos_invitados: number
  referidos: Array<{
    id: string
    nombre: string | null
    estado: string
    fecha_registro: string
  }>
}

export async function getUsuarioReferidos(chatId: string): Promise<UsuarioReferidosAPI> {
  const res = await fetch(`${BASE_URL}/api/usuario/referidos?chat_id=${encodeURIComponent(chatId)}`)
  if (!res.ok) throw new Error('Error al cargar referidos')
  return res.json()
}
