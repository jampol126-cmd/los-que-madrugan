import { motion } from 'framer-motion';
import { ArrowLeft, Store, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';

const frasesEjemplo = [
  { dia: "Lunes", frase: "🏪 Hoy no es un día más, hoy es el día que un cliente fiel decide volver." },
  { dia: "Martes", frase: "☕ El local está frío a las 6am, pero tu actitud lo calienta todo." },
  { dia: "Miércoles", frase: "💪 Otro día de inventario y proveedores. Y sos tan libre que elegís esto." },
  { dia: "Jueves", frase: "🌅 La competencia duerme, vos ya estás acomodando la vitrina." },
];

const beneficios = [
  "Frases sobre retail y atención al cliente",
  "Tips para aumentar ventas matutinas",
  "Motivación para días de inventario",
  "Recordatorios de tareas del negocio"
];

export default function TiendaPage() {
  return (
    <>
      <SEO 
        title="Frases para Dueños de Tienda | Madrugá con Propósito"
        description="Frases motivacionales específicas para dueños de tienda y negocios retail. Aumentá tus ventas matutinas con la rutina de los que madrugan."
        pathname="/para-tiendas"
      />
      
      <div className="min-h-screen bg-[#0B0F17]">
        {/* Header */}
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

        {/* Hero */}
        <section className="px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
                <Store className="h-5 w-5 text-amber-400" />
                <span className="text-amber-400">Perfil: Dueño de Tienda</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Abrí tu tienda con <span className="text-amber-400">energía</span> todos los días
              </h1>
              
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                Frases motivacionales diseñadas específicamente para dueños de negocios retail. 
                Desde abrir la cortina hasta cerrar la caja, acompañamos tu día.
              </p>

              <a href="/empezar">
                <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full px-8 py-6 text-lg">
                  Empezar trial gratis
                </Button>
              </a>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 py-8 border-y border-white/5">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-amber-400">40%</div>
              <div className="text-gray-500 text-sm">más ventas matutinas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400">200+</div>
              <div className="text-gray-500 text-sm">tiendas en Colombia</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400">5:30 AM</div>
              <div className="text-gray-500 text-sm">hora promedio</div>
            </div>
          </div>
        </section>

        {/* Frases de Ejemplo */}
        <section className="px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Así son las frases para tu perfil</h2>
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

        {/* Beneficios */}
        <section className="px-4 py-16 bg-gradient-to-b from-transparent to-amber-500/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">¿Qué recibís como dueño de tienda?</h2>
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

        {/* CTA */}
        <section className="px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Tu tienda merece un dueño motivado</h2>
            <p className="text-gray-400 mb-8">Probá 3 días gratis. Cancelá cuando quieras.</p>
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
