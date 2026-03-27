// API para IndexNow - Notifica a Bing, Yandex y otros motores de nuevo contenido
// También incluye auto-submit integrado
// https://www.indexnow.org/documentation

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'losquemadrugan-indexnow-key-2025';
const SITE_URL = process.env.NEXT_PUBLIC_URL || 'https://los-que-madrugan.vercel.app';
const HOST = new URL(SITE_URL).hostname;

// Endpoints de IndexNow
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow'
];

export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verificación de la clave (archivo .txt)
  if (req.method === 'GET' && req.query.key === INDEXNOW_KEY) {
    return res.status(200).send(INDEXNOW_KEY);
  }

  // Solo aceptar POST para enviar URLs
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Verificar autorización (usar CRON_SECRET o similar)
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.CRON_SECRET || process.env.INDEXNOW_SECRET;
  
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const { url, urls, source } = req.body;
    
    // Preparar lista de URLs
    let urlList = [];
    if (urls && Array.isArray(urls)) {
      urlList = urls.map(u => u.startsWith('http') ? u : `${SITE_URL}${u}`);
    } else if (url) {
      urlList = [url.startsWith('http') ? url : `${SITE_URL}${url}`];
    } else {
      return res.status(400).json({ error: 'Se requiere url o urls' });
    }

    // Limitar a 10,000 URLs por request (límite de IndexNow)
    if (urlList.length > 10000) {
      urlList = urlList.slice(0, 10000);
    }

    // Payload de IndexNow
    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      urlList: urlList
    };

    // Enviar a todos los endpoints
    const results = await Promise.allSettled(
      INDEXNOW_ENDPOINTS.map(async (endpoint) => {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        return {
          endpoint,
          status: response.status,
          ok: response.ok
        };
      })
    );

    // Procesar resultados
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.ok);
    const failed = results.filter(r => r.status === 'rejected' || !r.value.ok);

    // Log para debugging
    console.log(`[IndexNow] URLs: ${urlList.length}, Source: ${source || 'manual'}`, {
      successful: successful.length,
      failed: failed.length
    });

    return res.status(200).json({
      success: true,
      urlsSubmitted: urlList.length,
      source: source || 'manual',
      results: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason }),
      summary: {
        successful: successful.length,
        failed: failed.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error IndexNow:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
