import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Star, Clock, MessageCircle, Gift } from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function ProductHuntPage() {
  // Detectar si viene de Product Hunt
  useEffect(() => {
    // Guardar que vino de PH para el checkout
    localStorage.setItem('utm_source', 'producthunt');
    localStorage.setItem('ph_discount', 'PH2025');
  }, []);

  const openBot = () => {
    const discount = 'PH2025';
    const botUrl = `https://t.me/MadrugadoresBot?start=PH_${discount}`;
    window.open(botUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F17] via-[#0f1623] to-[#0B0F17]">
      <SEO 
        title="Los que Madrugan - Especial Product Hunt | 50% OFF"
        description="Oferta especial para Product Hunt: 50% OFF tu primer mes. Frases motivacionales a las 6 AM para emprendedores."
        pathname="/ph"
      />
      
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌅</span>
            <span className="font-bold text-white">
              Los que <span className="text-amber-400">Madrugan</span>
            </span>
          </div>
          <div className="flex items-center gap-2 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">
            <span>🐱</span>
            <span>Product Hunt Special</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 px-4 py-2 rounded-full text-sm mb-6 border border-orange-500/30">
          <Gift className="w-4 h-4" />
          <span>Oferta exclusiva para Product Hunters</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Frases motivacionales a las <span className="text-amber-400">6 AM</span>
        </h1>
        
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Para emprendedores que abren su negocio mientras el mundo duerme. 
          Sin humo, solo compañía real.
        </p>

        {/* Precio */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-gray-500 line-through text-lg">$9.900 COP</span>
            <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm font-bold">-50%</span>
          </div>
          <div className="text-5xl font-bold text-white mb-2">
            $4.950 <span className="text-lg text-gray-400 font-normal">COP/mes</span>
          </div>
          <p className="text-gray-400 text-sm mb-6">Primer mes con código PH2025</p>
          
          <Button 
            onClick={openBot}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-6 text-lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Empezar con 50% OFF
          </Button>
          
          <p className="text-gray-500 text-xs mt-4">
            3 días de prueba gratis incluidos
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <Clock className="w-8 h-8 text-amber-400 mb-3 mx-auto" />
            <h3 className="text-white font-semibold mb-2">Todos los días a las 6 AM</h3>
            <p className="text-gray-400 text-sm">Hora Colombia. Directo a tu Telegram.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <Check className="w-8 h-8 text-green-400 mb-3 mx-auto" />
            <h3 className="text-white font-semibold mb-2">Personalizado para vos</h3>
            <p className="text-gray-400 text-sm">4 perfiles: tienda, freelance, startup, profesional.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <Star className="w-8 h-8 text-orange-400 mb-3 mx-auto" />
            <h3 className="text-white font-semibold mb-2">Sin compromiso</h3>
            <p className="text-gray-400 text-sm">Cancelá cuando quieras. Sin letra chica.</p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="border-t border-white/10 pt-16">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-white ml-2 font-semibold">4.9/5</span>
          </div>
          <p className="text-gray-400 mb-8">
            Más de 500 emprendedores madrugan con nosotros
          </p>
          
          {/* Testimonios */}
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-gray-300 text-sm mb-3">"Recibir la frase a las 6 AM se convirtió en mi ritual. Me ayuda a empezar el día con energía."</p>
              <p className="text-gray-500 text-xs">— María, dueña de tienda en Bogotá</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-gray-300 text-sm mb-3">"Probé 3 apps de motivación antes. Esta es la única que no suena a copy genérico."</p>
              <p className="text-gray-500 text-xs">— Carlos, freelancer</p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="mt-16">
          <Button 
            onClick={openBot}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-6 px-8 text-lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Unirme con 50% OFF
          </Button>
          <p className="text-gray-500 text-sm mt-4">
            Oferta válida por tiempo limitado para la comunidad Product Hunt
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-8 text-center">
        <p className="text-gray-500 text-sm">
          Hecho con ☕ en Colombia · <a href="https://t.me/MadrugadoresBot" className="text-amber-400 hover:underline">@MadrugadoresBot</a>
        </p>
      </div>
    </div>
  );
}
