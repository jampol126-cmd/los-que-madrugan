-- Crear tabla de suscriptores
CREATE TABLE IF NOT EXISTS suscriptores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_chat_id TEXT UNIQUE,
  nombre TEXT,
  email TEXT,
  telefono TEXT,
  perfil TEXT DEFAULT 'tienda',
  estado TEXT DEFAULT 'prospecto',
  trial_fin TIMESTAMPTZ,
  proximo_cobro DATE,
  meses_gratis_acumulados INTEGER DEFAULT 0,
  amigos_invitados INTEGER DEFAULT 0,
  frases_enviadas INTEGER DEFAULT 0,
  ultimo_envio TIMESTAMPTZ,
  ultimo_pago TIMESTAMPTZ,
  codigo_referido TEXT UNIQUE,
  referido_por TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_suscriptores_estado ON suscriptores(estado);
CREATE INDEX IF NOT EXISTS idx_suscriptores_telefono ON suscriptores(telefono);
CREATE INDEX IF NOT EXISTS idx_suscriptores_nombre ON suscriptores(nombre);

-- Crear tabla de log de referidos
CREATE TABLE IF NOT EXISTS referidos_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitador_id UUID REFERENCES suscriptores(id),
  invitado_id UUID REFERENCES suscriptores(id),
  estado TEXT DEFAULT 'registrado',
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar usuario de prueba (Kindjay)
INSERT INTO suscriptores (
  telegram_chat_id, 
  nombre, 
  estado, 
  perfil, 
  trial_fin,
  telefono,
  codigo_referido
) VALUES (
  '1758647248', 
  'Kindjay', 
  'trial', 
  'tienda', 
  NOW() + INTERVAL '3 days',
  '+573104548534',
  'KINDJAY' || substr(md5(random()::text), 1, 4)
)
ON CONFLICT (telegram_chat_id) DO UPDATE SET
  estado = 'trial',
  trial_fin = NOW() + INTERVAL '3 days',
  telefono = '+573104548534';
