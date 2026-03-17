import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, ArrowRight, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PERFILES, TESTIMONIALS, FAQS, FEATURES } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import type { Perfil } from '@/types';

// Navigation Component
function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-[#0B0F17]/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌅</span>
            <span className="font-bold text-white text-lg md:text-xl">
              Los que <span className="text-amber-400">Madrugan</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('como-funciona')} className="text-gray-300 hover:text-white transition-colors text-sm">
              Cómo funciona
            </button>
            <button onClick={() => scrollTo('precio')} className="text-gray-300 hover:text-white transition-colors text-sm">
              Precio
            </button>
            <button onClick={() => scrollTo('faq')} className="text-gray-300 hover:text-white transition-colors text-sm">
              FAQ
            </button>
            <a href="/empezar">
              <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full px-6">
                Unirme al club
              </Button>
            </a>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0B0F17] border-white/10 w-[280px]">
              <div className="flex flex-col gap-6 mt-8">
                <button onClick={() => scrollTo('como-funciona')} className="text-gray-300 hover:text-white transition-colors text-left">
                  Cómo funciona
                </button>
                <button onClick={() => scrollTo('precio')} className="text-gray-300 hover:text-white transition-colors text-left">
                  Precio
                </button>
                <button onClick={() => scrollTo('faq')} className="text-gray-300 hover:text-white transition-colors text-left">
                  FAQ
                </button>
                <a href="/empezar">
                  <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full w-full">
                    Unirme al club
                  </Button>
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

// Hero Section
function HeroSection({ onSelectPerfil }: { onSelectPerfil: (p: Perfil) => void }) {
  const [selectedPerfil, setSelectedPerfil] = useLocalStorage<Perfil | null>('perfil_seleccionado', null);

  const handleSelect = (perfil: Perfil) => {
    setSelectedPerfil(perfil);
    onSelectPerfil(perfil);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F17] via-[#0f172a] to-[#1e1b4b]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        {/* Stars */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="star absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                opacity: Math.random() * 0.5 + 0.2,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm mb-8"
          >
            <span className="animate-pulse">🔥</span>
            <span>Más de 500 emprendedores madrugando</span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight mb-6">
            No madrugues solo{' '}
            <span className="text-gradient">nunca más</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Frases diarias a las 6:00 AM para quienes abren el negocio mientras el mundo duerme. 
            Sin humo de &quot;ley de atracción&quot;, solo compañía real.
          </p>

          {/* Profile Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Seleccioná tu perfil</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
              {PERFILES.map((perfil) => (
                <button
                  key={perfil.id}
                  onClick={() => handleSelect(perfil.id)}
                  className={cn(
                    "p-4 md:p-6 rounded-2xl border transition-all duration-300 text-left group",
                    selectedPerfil === perfil.id
                      ? "bg-amber-500/10 border-amber-500/50 glow-amber-sm"
                      : "bg-white/5 border-white/10 hover:border-amber-500/30 hover:bg-white/[0.08]"
                  )}
                >
                  <span className="text-2xl md:text-3xl mb-2 block">{perfil.icon}</span>
                  <span className="text-white font-medium text-sm md:text-base">{perfil.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <a href="/empezar">
              <Button 
                size="lg" 
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg rounded-full px-8 py-6 glow-amber"
              >
                Empezar ahora - $19.9k/mes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section id="como-funciona" ref={ref} className="relative py-24 md:py-32 bg-[#0B0F17] noise-overlay">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div style={{ y }} className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Un mensaje. Cada mañana.{' '}
              <span className="text-amber-400">Hecho para vos.</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Sin spam. Sin frases genéricas. Solo una compañía real para quienes trabajan cuando el mundo duerme.
            </p>
            <a href="/empezar">
              <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full">
                Probar gratis 7 días
              </Button>
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-3xl p-6 hover:border-amber-500/30 transition-colors"
              >
                <span className="text-3xl mb-4 block">{feature.icon}</span>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Pricing Section
function PricingSection() {
  return (
    <section id="precio" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F17] via-[#1a1520] to-[#0B0F17]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-amber-400 text-sm uppercase tracking-wider">Precio</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
            Menos de un tinto y un pan de queso.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-[2rem] p-8 md:p-12 text-center"
        >
          <div className="mb-8">
            <span className="text-6xl md:text-7xl font-black text-white">$19.900</span>
            <span className="text-gray-400 text-xl ml-2">COP/mes</span>
          </div>

          <ul className="space-y-4 mb-10 max-w-md mx-auto text-left">
            {['Acceso inmediato', 'Cancelación instantánea', 'Soporte real'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300">
                <Check className="h-5 w-5 text-amber-500" />
                {item}
              </li>
            ))}
          </ul>

          <a href="/empezar">
            <Button 
              size="lg" 
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg rounded-full px-10 py-6 glow-amber w-full md:w-auto"
            >
              Quiero madrugar con apoyo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>

          <p className="text-gray-500 text-sm mt-6">
            🔒 Pago seguro · Cancelás cuando querás
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  return (
    <section className="relative py-24 md:py-32 bg-[#0B0F17]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Lo que dicen los que <span className="text-amber-400">madrugan</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-3xl p-8"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="h-5 w-5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 text-lg">&quot;{testimonial.quote}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-semibold">
                  {testimonial.author[0]}
                </div>
                <div>
                  <p className="text-white font-medium">{testimonial.author}</p>
                  <p className="text-gray-500 text-sm">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
        >
          {[
            { value: '500+', label: 'Suscriptores' },
            { value: '4.9/5', label: 'Rating' },
            { value: '7', label: 'Días de trial' },
            { value: '100%', label: 'Colombia' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-400">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  return (
    <section id="faq" className="relative py-24 md:py-32 bg-[#0B0F17] noise-overlay">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-gray-400">
            Todo lo que necesitás saber antes de sumarte.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {FAQS.map((faq) => (
              <AccordionItem 
                key={faq.id} 
                value={`item-${faq.id}`}
                className="glass rounded-2xl px-6 border-none"
              >
                <AccordionTrigger className="text-white text-left hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

// Final CTA Section
function FinalCTASection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F17] via-[#1a1520] to-[#0B0F17]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Unite al club.
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Frases para emprendedores a las 6:00 AM. Sin humo. Solo compañía.
          </p>
          <a href="/empezar">
            <Button 
              size="lg" 
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg rounded-full px-10 py-6 glow-amber"
            >
              Empezar ahora
            </Button>
          </a>
          <p className="mt-6 text-gray-500">
            <a href="mailto:hola@losquemadrugan.co" className="hover:text-amber-400 transition-colors">
              ¿Tenés dudas? Escribinos.
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="relative bg-[#0B0F17] border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌅</span>
              <span className="font-bold text-white text-xl">
                Los que <span className="text-amber-400">Madrugan</span>
              </span>
            </a>
            <p className="text-gray-500">Hecho con ☕ en Colombia.</p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Producto</h4>
            <ul className="space-y-2">
              <li><button onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-500 hover:text-white transition-colors">Cómo funciona</button></li>
              <li><button onClick={() => document.getElementById('precio')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-500 hover:text-white transition-colors">Precio</button></li>
              <li><button onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-500 hover:text-white transition-colors">FAQ</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-white transition-colors">Términos</a></li>
              <li><a href="#" className="text-gray-500 hover:text-white transition-colors">Privacidad</a></li>
              <li><a href="mailto:hola@losquemadrugan.co" className="text-gray-500 hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © 2024 Los que Madrugan. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 hover:text-amber-400 transition-colors">Instagram</a>
            <a href="#" className="text-gray-500 hover:text-amber-400 transition-colors">Twitter</a>
            <a href="#" className="text-gray-500 hover:text-amber-400 transition-colors">Telegram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page
export default function LandingPage() {
  const handleSelectPerfil = (_perfil: Perfil) => {
    setTimeout(() => {
      document.getElementById('precio')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17]">
      <Navigation />
      <HeroSection onSelectPerfil={handleSelectPerfil} />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
