// Componente para generar Schema.org FAQPage
// Mejora la visibilidad en Google AI Overviews y motores de IA

import { Helmet } from 'react-helmet-async';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
}

// FAQs predefinidas para el sitio
export const defaultFAQs: FAQItem[] = [
  {
    question: '¿Qué es Los Que Madrugan?',
    answer: 'Los Que Madrugan es un servicio de suscripción que envía frases motivacionales diarias a las 6:00 AM a emprendedores colombianos via Telegram. Es compañía real para quienes abren su negocio mientras el mundo duerme.'
  },
  {
    question: '¿Cuánto cuesta la suscripción?',
    answer: 'La suscripción cuesta $9.900 COP mensuales (promoción de $19.900). Incluye 3 días de prueba gratis sin necesidad de tarjeta de crédito.'
  },
  {
    question: '¿A qué hora llegan las frases?',
    answer: 'Las frases llegan todos los días a las 6:00 AM hora de Colombia (UTC-5), perfecto para cuando estás abriendo tu negocio.'
  },
  {
    question: '¿Puedo cancelar cuando quiera?',
    answer: 'Sí, puedes cancelar tu suscripción en cualquier momento sin penalización. Escribe BAJA o CANCELAR al bot y se cancela inmediatamente.'
  },
  {
    question: '¿Cómo funciona el programa de referidos?',
    answer: 'Por cada amigo que invites y pague, ambos ganan 1 mes gratis. Puedes acumular hasta 12 meses gratis en el programa de referidos.'
  },
  {
    question: '¿Las frases son para mi tipo de emprendimiento?',
    answer: 'Sí, tenemos 4 perfiles: dueños de tienda, freelancers, startups y profesionales. Puedes cambiar tu perfil en cualquier momento según tu necesidad.'
  }
];

// FAQs específicas para página de pago
export const pagarFAQs: FAQItem[] = [
  {
    question: '¿Es seguro pagar?',
    answer: 'Sí, usamos Wompi, la pasarela de pagos de Bancolombia. Aceptamos PSE, tarjetas de crédito/débito y Nequi. Tu información está protegida con encriptación SSL.'
  },
  {
    question: '¿Cuándo se activa mi suscripción?',
    answer: 'Tu suscripción se activa inmediatamente después de confirmar el pago. Recibirás tu primera frase al día siguiente a las 6 AM.'
  },
  {
    question: '¿Puedo probar antes de pagar?',
    answer: '¡Claro! Tienes 3 días de prueba gratis. Solo escribe al bot @MadrugadoresBot y selecciona tu perfil para empezar.'
  }
];
