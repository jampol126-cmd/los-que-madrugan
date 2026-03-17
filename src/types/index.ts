export type Perfil = 'tienda' | 'freelance' | 'startup' | 'profesional';

export interface PerfilOption {
  id: Perfil;
  label: string;
  icon: string;
  description: string;
}

export interface Testimonial {
  id: number;
  quote: string;
  author: string;
  location: string;
  rating: number;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export interface Suscriptor {
  id: string;
  nombre: string;
  email: string;
  chatId: string;
  perfil: Perfil;
  estado: 'activo' | 'trial' | 'cancelado';
  fechaRegistro: string;
  fechaPago?: string;
  referidos: number;
}

export interface Frase {
  id: string;
  texto: string;
  perfil: Perfil;
  activa: boolean;
  orden: number;
}

export interface Metricas {
  mrr: number;
  suscriptoresActivos: number;
  enTrial: number;
  tasaConversion: number;
}

export interface Actividad {
  id: string;
  tipo: 'registro' | 'pago' | 'cancelacion' | 'trial';
  usuario: string;
  fecha: string;
  mensaje: string;
}

export const PERFILES: PerfilOption[] = [
  { id: 'tienda', label: 'Dueño de tienda / local', icon: '🏪', description: 'Frases para quienes abren su local cada mañana' },
  { id: 'freelance', label: 'Freelancer / Agencia', icon: '💻', description: 'Para quienes trabajan desde casa o su estudio' },
  { id: 'startup', label: 'Startup / Fundador', icon: '🚀', description: 'Construyendo el futuro, una madrugada a la vez' },
  { id: 'profesional', label: 'Profesional independiente', icon: '⚕️', description: 'Médicos, abogados, consultores y más' },
];

export const TESTIMONIALS: Testimonial[] = [
  { id: 1, quote: 'Antes pagaba psicólogo por ansiedad del negocio. Ahora tengo compañía real cada mañana.', author: 'Andrés', location: 'Bogotá', rating: 5 },
  { id: 2, quote: 'El café a las 5am sabe diferente cuando sabés que no estás solo.', author: 'Laura', location: 'Medellín', rating: 5 },
  { id: 3, quote: 'No es motivación barata. Es comprensión real de lo que vivimos los emprendedores.', author: 'Carlos', location: 'Cali', rating: 5 },
];

export const FAQS: FAQItem[] = [
  { id: 1, question: '¿Llega todos los días?', answer: 'Sí, cada mañana a las 6:00 AM recibirás una frase personalizada según tu perfil de negocio. Incluso los fines de semana, porque los emprendedores no descansan.' },
  { id: 2, question: '¿Cómo cancelo?', answer: 'Podés cancelar en cualquier momento desde tu cuenta de Telegram con el comando /cancelar. No hay compromisos ni penalizaciones.' },
  { id: 3, question: '¿Puedo cambiar de perfil?', answer: 'Sí, podés cambiar tu perfil cuando quieras desde el menú de configuración. Las frases se adaptarán automáticamente a tu nuevo perfil.' },
  { id: 4, question: '¿Es solo para Colombia?', answer: 'Por ahora sí. El servicio está optimizado para la hora de Colombia (GMT-5) y el precio está en pesos colombianos.' },
  { id: 5, question: '¿Qué pasa si no uso Telegram?', answer: 'Necesitás Telegram para recibir las frases. La app es gratuita y funciona en todos los dispositivos.' },
];

export const FEATURES: Feature[] = [
  { id: 1, title: 'Frase diaria a las 6:00 AM', description: 'Cada mañana, una frase hecha para tu tipo de negocio.', icon: '☕' },
  { id: 2, title: 'Perfiles de negocio', description: 'Tienda, freelance, startup o profesional. Elegí el tuyo.', icon: '🎯' },
  { id: 3, title: 'Cancelás cuando querás', description: 'Sin contratos. Sin letra chica. Cancelá con un comando.', icon: '⚡' },
  { id: 4, title: 'Soporte real', description: '¿Tenés dudas? Escribinos. Respondemos de verdad.', icon: '📱' },
];
