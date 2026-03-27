// Script para enviar URLs a IndexNow manualmente
// Uso: node scripts/submit-urls.js [url1] [url2] ...

const CRON_SECRET = process.env.CRON_SECRET || 'tu-secret-aqui';
const BASE_URL = 'https://los-que-madrugan.vercel.app';

async function submitUrls(urls) {
  try {
    const response = await fetch(`${BASE_URL}/api/indexnow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRON_SECRET}`
      },
      body: JSON.stringify({
        urls: urls,
        source: 'manual-script'
      })
    });

    const data = await response.json();
    console.log('Resultado:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// URLs por defecto a enviar
const defaultUrls = [
  '/',
  '/empezar',
  '/pagar',
  '/blog',
  '/testimonios',
  '/para-tiendas',
  '/para-freelancers',
  '/para-startups',
  '/para-profesionales'
];

const urls = process.argv.slice(2).length > 0 ? process.argv.slice(2) : defaultUrls;
console.log('Enviando URLs:', urls);
submitUrls(urls);
