// RSS Feed para notificaciones de nuevo contenido
// Compatible con lectores RSS y crawlers

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SITE_URL = process.env.NEXT_PUBLIC_URL || 'https://los-que-madrugan.vercel.app';

export default async function handler(req, res) {
  try {
    // Obtener artículos del blog desde Supabase (si tenemos tabla)
    // Por ahora usamos URLs estáticas conocidas
    const blogPosts = [
      {
        title: 'Cómo madrugar sin sentirte cansado',
        url: '/blog/como-madrugar-sin-sentirte-cansado',
        date: '2025-03-15',
        description: 'Consejos prácticos para levantarte temprano sin sacrificar descanso.'
      },
      {
        title: 'Hábitos de emprendedores exitosos en Colombia',
        url: '/blog/habitos-emprendedores-exitosos-colombia',
        date: '2025-03-10',
        description: 'Aprende de los mejores emprendedores colombianos y sus rutinas matutinas.'
      },
      {
        title: 'Por qué 6 AM es la hora de oro para emprendedores',
        url: '/blog/por-que-6am-hora-oro-emprendedores',
        date: '2025-03-05',
        description: 'Descubre por qué los emprendedores más exitosos madrugan.'
      },
      {
        title: 'Frases motivacionales vs acción',
        url: '/blog/frases-motivacionales-vs-accion',
        date: '2025-02-28',
        description: 'La diferencia entre la motivación pasiva y la acción real.'
      },
      {
        title: 'Cómo mantener la motivación como emprendedor',
        url: '/blog/como-mantener-motivacion-emprendedor',
        date: '2025-02-20',
        description: 'Estrategias para mantenerte motivado en el día a día emprendedor.'
      }
    ];

    // Generar RSS XML
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Los Que Madrugan - Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Frases motivacionales diarias para emprendedores colombianos</description>
    <language>es-CO</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/favicon.ico</url>
      <title>Los Que Madrugan</title>
      <link>${SITE_URL}</link>
    </image>
    ${blogPosts.map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}${post.url}</link>
      <guid isPermaLink="true">${SITE_URL}${post.url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>
    `).join('')}
  </channel>
</rss>`;

    // Configurar headers
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache 1 hora
    
    return res.status(200).send(rss);

  } catch (error) {
    console.error('Error RSS:', error);
    return res.status(500).json({ error: error.message });
  }
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}
