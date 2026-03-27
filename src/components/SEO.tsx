import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  pathname?: string;
  image?: string;
  type?: string;
  schema?: Record<string, unknown>;
}

const defaultTitle = 'Los que Madrugan | Frases diarias para emprendedores a las 6 AM';
const defaultDescription = 'Frases motivacionales todos los días a las 6:00 AM para emprendedores que abren su negocio mientras el mundo duerme. Sin humo, solo compañía real.';
const siteUrl = 'https://los-que-madrugan.vercel.app';
const defaultImage = 'https://los-que-madrugan.vercel.app/og-image.jpg';

// Schema base de Organization + LocalBusiness para Google My Business
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness'],
  name: 'Los Que Madrugan',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bogotá',
    addressRegion: 'Cundinamarca',
    addressCountry: 'CO'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '4.7110',
    longitude: '-74.0721'
  },
  telephone: '+57-310-4548534',
  email: 'hola@losquemadrugan.co',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '06:00',
    closes: '20:00'
  },
  sameAs: [
    'https://t.me/MadrugadoresBot',
    'https://instagram.com/losquemadrugan'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hola@losquemadrugan.co',
    contactType: 'customer support',
    availableLanguage: ['Spanish'],
    areaServed: 'CO'
  }
};

// Schema de Product/Servicio
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Los Que Madrugan - Suscripción',
  image: defaultImage,
  description: 'Frases motivacionales diarias para emprendedores via Telegram',
  brand: {
    '@type': 'Brand',
    name: 'Los Que Madrugan'
  },
  offers: {
    '@type': 'Offer',
    url: `${siteUrl}/empezar`,
    price: '9900',
    priceCurrency: 'COP',
    availability: 'https://schema.org/InStock',
    priceValidUntil: '2025-12-31',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Planes de suscripción',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Trial Gratis',
            description: '3 días de prueba gratuita'
          },
          price: '0',
          priceCurrency: 'COP'
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Suscripción Mensual',
            description: 'Frases diarias durante 30 días'
          },
          price: '9900',
          priceCurrency: 'COP'
        }
      ]
    }
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '500'
  }
};

export function SEO({ 
  title = defaultTitle, 
  description = defaultDescription,
  pathname = '',
  image = defaultImage,
  type = 'website',
  schema
}: SEOProps) {
  const url = `${siteUrl}${pathname}`;
  
  const defaultSchema = pathname === '/empezar' || pathname === '/pagar' 
    ? productSchema 
    : pathname === '/' 
    ? [organizationSchema, productSchema] 
    : organizationSchema;
  
  const finalSchema = schema || defaultSchema;
  
  return (
    <Helmet>
      {/* Básicos */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>
      
      {/* RSS Feed */}
      <link rel="alternate" type="application/rss+xml" title="Los Que Madrugan Blog" href={`${siteUrl}/api/rss.xml`} />
      
      {/* Bing Webmaster Tools Verification - descomentar cuando tengas el código */}
      {/* <meta name="msvalidate.01" content="PENDIENTE-COPIAR-DE-BING" /> */}
    </Helmet>
  );
}

// SEO específico para cada página
export const LandingPageSEO = () => (
  <SEO 
    title="Los que Madrugan | Frases diarias para emprendedores a las 6 AM"
    description="Frases motivacionales todos los días a las 6:00 AM para emprendedores que abren su negocio mientras el mundo duerme. Prueba 3 días gratis."
    pathname="/"
  />
);

export const EmpezarPageSEO = () => (
  <SEO 
    title="Empezar | Los que Madrugan - Suscripción $9.900 COP"
    description="Activa tu suscripción a Los que Madrugan. 3 días de prueba gratis, luego $9.900 COP/mes. Frases motivacionales todos los días a las 6 AM."
    pathname="/empezar"
  />
);

export const PagarPageSEO = () => (
  <SEO 
    title="Pagar Suscripción | Los que Madrugan - $9.900 COP"
    description="Completa tu pago seguro vía Wompi. Suscripción mensual $9.900 COP (antes $19.900). Cancelá cuando quieras."
    pathname="/pagar"
  />
);

export const ReferidosPageSEO = () => (
  <SEO 
    title="Programa de Referidos | Gana meses gratis"
    description="Invita amigos a Los que Madrugan y ganen 1 mes gratis cada uno. Acumula hasta 12 meses gratis."
    pathname="/referidos"
  />
);
