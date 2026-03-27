import { motion } from 'framer-motion';
import { ArrowLeft, Rocket, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';

const frasesEjemplo = [
  { dia: "Lunes", frase: "🚀 Pivotar no es rendirse, es encontrar el ángulo correcto." },
  { dia: "Martes", frase: "💌 El inversor no te respondió. No importa, hay 20 más que mandar." },
  { dia: "Miércoles", frase: "📊 El burn rate te preocupa a las 3am. Hoy tomás decisiones para bajarlo." },
  { dia: "Jueves", frase: "🎯 El producto perfecto no existe, pero el que vende sí. Shipeá hoy." },
];

const beneficios = [
  "Frases sobre resiliencia emprendedora",
  "Tips para gestión de inversores",
  "Motivación para días de pivoteo",
  "Recordatorios de métricas importantes"
];

export default function StartupPage() {
  return (
    <>
      <SEO 
        title="Frases para Startups | Resiliencia y Crecimiento"
        description="Frases motivacionales para founders y equipos de startups. Mantené el foco mientras construís el futuro."
        pathname="/para-startups"
      />
      
      <div className="min-h-screen bg-[#0B0F17]">
        <header className="border-b border-white/5 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl">🌅</span>
              <span className="font-bold text-white">Los que <span className="text-amber-400">Madrugan</span></span>
            </a>
            <a href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />Volver
              </Button>
            </a>
          </div>
        </header>

        <section className="px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
                <Rocket className="h-5 w-5 text-amber-400" />
                <span className="text-amber-400">Perfil: Startup</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Construí el futuro con <span className="text-amber-400">resiliencia</span>
              </h1>
              
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                El camino del founder es una montaña rusa. Nuestras frases te mantienen 
                centrado cuando el burn rate sube y los inversores no responden.
              </p>

              <a href="/empezar">
                <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full px-8 py-6 text-lg">
                  Empezar trial gratis
                </Button>
              </a>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-8 border-y border-white/5">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-amber-400">50+</div>
              <div className="text-gray-500 text-sm">startups acompañadas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400">$2M</div>
              <div className="text-gray-500 text-sm">USD en funding conseguido</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400">5:00 AM</div>
              <div className="text-gray-500 text-sm">hora de trabajo profundo</div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Frases para días de founder</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {frasesEjemplo.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="text-amber-400 text-sm font-medium mb-2">{item.dia} 6:00 AM</div>
                  <p className="text-white text-lg">{item.frase}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 bg-gradient-to-b from-transparent to-amber-500/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">¿Qué recibís como founder?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {beneficios.map((beneficio, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-amber-400" />
                  </div>
                  <p className="text-gray-300 text-lg">{beneficio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Ship it. Aprendé. Repetí.</h2>
            <p className="text-gray-400 mb-8">Probá 3 días gratis. Sin compromiso.</p>
            <a href="/empezar">
              <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg rounded-full px-10 py-6 glow-amber">
                Empezar ahora - $9.900/mes
              </Button>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
