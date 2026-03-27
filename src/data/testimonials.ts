export interface Testimonial {
  id: string;
  name: string;
  role: string;
  business: string;
  location: string;
  image?: string;
  quote: string;
  rating: number;
  date: string;
  results?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "María Fernanda Gutiérrez",
    role: "Dueña de tienda",
    business: "MiniMarket La 15",
    location: "Bogotá",
    quote: "Antes me costaba levantarme temprano para abrir la tienda. Ahora a las 5:50 AM ya estoy lista esperando la frase. Es mi ritual. En 6 meses dupliqué mis ventas matutinas.",
    rating: 5,
    date: "2025-02-15",
    results: "Ventas matutinas duplicadas en 6 meses"
  },
  {
    id: "2",
    name: "Carlos Eduardo Ramírez",
    role: "Freelancer",
    business: "Diseño Digital CR",
    location: "Medellín",
    quote: "Trabajo desde casa y la procrastinación me mataba. Las frases de Los que Madrugan me dan ese empujón para empezar el día productivo. Mis clientes notaron la diferencia.",
    rating: 5,
    date: "2025-02-10",
    results: "Productividad aumentada 40%"
  },
  {
    id: "3",
    name: "Ana Lucía Martínez",
    role: "Fundadora",
    business: "Startup TechLatam",
    location: "Cali",
    quote: "Como founder, los días son una montaña rusa. La frase de las 6 AM es mi ancla emocional. Me recuerda por qué empecé esto cuando todo parece ir mal.",
    rating: 5,
    date: "2025-01-28",
    results: "Levantó $200M COP en inversión seed"
  },
  {
    id: "4",
    name: "Jorge Andrés López",
    role: "Abogado",
    business: "Consultora Jurídica López",
    location: "Barranquilla",
    quote: "Llevaba 10 años queriendo madrugar para estudiar casos antes de que empiece el día. Nunca lo logré hasta que encontré este servicio. Ahora estudio 2 horas antes de abrir el consultorio.",
    rating: 5,
    date: "2025-01-20",
    results: "Aumentó ingresos 35% por mayor preparación"
  },
  {
    id: "5",
    name: "Diana Patricia Castro",
    role: "Dueña de cafetería",
    business: "Café del Barrio",
    location: "Cartagena",
    quote: "La frase 'La competencia duerme, vos ya estás acomodando la vitrina' me motivó tanto que la tengo impresa en la cocina. Mis empleados también se contagiaron de la energía.",
    rating: 5,
    date: "2025-01-15",
    results: "Abrió segunda sucursal"
  },
  {
    id: "6",
    name: "Luis Fernando Torres",
    role: "Consultor",
    business: "Torres Consulting",
    location: "Bucaramanga",
    quote: "Pensé que era una boludez pagar por frases motivacionales. Me equivoqué. Es la inversión con mejor ROI que hice este año. Mi mindset cambió completamente.",
    rating: 5,
    date: "2025-01-08",
    results: "Triplicó cartera de clientes"
  },
  {
    id: "7",
    name: "Carmen Elena Vargas",
    role: "Emprendedora",
    business: "Moda Carmencita",
    location: "Pereira",
    quote: "Durante la pandemia perdí el 80% de mis ingresos. Estaba deprimida y quería cerrar. Las frases me ayudaron a levantarme cada día y reinventar mi negocio online.",
    rating: 5,
    date: "2024-12-20",
    results: "Recuperó y superó ingresos pre-pandemia"
  },
  {
    id: "8",
    name: "Ricardo José Morales",
    role: "Dueño de ferretería",
    business: "Ferretería El Constructor",
    location: "Manizales",
    quote: "Soy de los que dudaba mucho antes de tomar decisiones. Las frases me empujan a la acción. Ahora lanzo promociones sin tanto análisis parálisis y me va mejor.",
    rating: 5,
    date: "2024-12-10",
    results: "Ventas aumentaron 25% por promociones más ágiles"
  },
  {
    id: "9",
    name: "Paola Andrea Ríos",
    role: "Agente inmobiliaria",
    business: "Inmobiliaria Ríos",
    location: "Cúcuta",
    quote: "El negocio inmobiliario es de altibajos. Cuando no vendo por semanas, la frase de la mañana me recuerda que es temporal y que debo seguir prospectando.",
    rating: 5,
    date: "2024-11-28",
    results: "Cerró 3 ventas grandes tras mes de sequía"
  },
  {
    id: "10",
    name: "Miguel Ángel Sánchez",
    role: "Técnico",
    business: "Sánchez Reparaciones",
    location: "Ibagué",
    quote: "Trabajo por cuenta propia reparando electrodomésticos. Antes me levantaba tarde y perdía clientes. Ahora a las 6 AM ya estoy organizando los pedidos del día.",
    rating: 5,
    date: "2024-11-15",
    results: "Atiende 50% más clientes por día"
  },
  {
    id: "11",
    name: "Lucía Fernanda Peña",
    role: "Coach",
    business: "Coaching Empresarial LP",
    location: "Villavicencio",
    quote: "Como coach debo dar ejemplo. Las frases de Los que Madrugan me dan material para compartir con mis clientes y me mantienen enfocada en mis propias metas.",
    rating: 5,
    date: "2024-11-05",
    results: "Duplicó clientes de coaching ejecutivo"
  },
  {
    id: "12",
    name: "Andrés Felipe Gil",
    role: "Programador",
    business: "Freelance Developer",
    location: "Armenia",
    quote: "El código no se escribe solo. Necesito concentración y las mañanas son sagradas. La frase de las 6 AM es mi señal de que empieza mi tiempo de trabajo profundo.",
    rating: 5,
    date: "2024-10-22",
    results: "Entrega proyectos 30% más rápido"
  }
];

export function getTestimonials(): Testimonial[] {
  return testimonials;
}

export function getTestimonialsByRating(rating: number): Testimonial[] {
  return testimonials.filter(t => t.rating === rating);
}
