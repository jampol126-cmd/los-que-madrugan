import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, ExternalLink, ArrowLeft, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PERFILES } from '@/types';
import { PagarPageSEO } from '@/components/SEO';

export default function PagarPage() {
  const [searchParams] = useSearchParams();

  const chatId = searchParams.get('chat_id') || '';
  const perfil = searchParams.get('perfil') || 'tienda';
  const refCode = searchParams.get('ref');
  const perfilData = PERFILES.find(p => p.id === perfil);
  
  // Detectar si viene de Product Hunt
  const isProductHunt = localStorage.getItem('utm_source') === 'producthunt' || 
                        localStorage.getItem('ph_discount') === 'PH2025';

  const handlePagar = () => {
    if (!chatId) {
      alert('Error: No se encontró tu usuario');
      return;
    }

    localStorage.setItem('pending_chat_id', chatId);
    localStorage.setItem('pending_perfil', perfil);

    // Agregar indicador de Product Hunt si aplica
    const phSuffix = isProductHunt ? '_PH_' : '_';
    const referencia = `madrugador_${chatId}${phSuffix}${Date.now()}`;
    window.location.href = `https://checkout.wompi.co/l/PvmnGn?reference=${referencia}`;
  };

  if (!chatId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0B0F17] via-[#1a1520] to-[#0B0F17] flex items-center justify-center p-4">
        <div className="glass-strong rounded-3xl p-8 max-w-md w-full text-center">
          <p className="text-red-400 mb-4">Falta el ID de Telegram. Iniciá el proceso desde el bot.</p>
          <a href="/" className="text-amber-400 hover:underline">Volver al inicio</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <PagarPageSEO />
      <div className="min-h-screen bg-gradient-to-b from-[#0B0F17] via-[#1a1520] to-[#0B0F17] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🌅</span>
            <span className="font-bold text-white text-xl">
              Los que <span className="text-amber-400">Madrugan</span>
            </span>
          </a>
        </div>

        {/* Main Card */}
        <div className="glass-strong rounded-3xl p-6 md:p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-6">
            Unite al club
          </h1>

          {/* Summary */}
          <div className="bg-white/5 rounded-2xl p-4 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Perfil</span>
              <div className="flex items-center gap-2">
                <span className="text-lg">{perfilData?.icon}</span>
                <span className="text-white font-medium">{perfilData?.label}</span>
              </div>
            </div>
            {isProductHunt && (
              <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 text-sm font-medium">
                  Descuento Product Hunt aplicado: 50% OFF
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-gray-400">Total mensual</span>
              <div className="text-right">
                {isProductHunt ? (
                  <>
                    <span className="text-lg text-gray-500 line-through mr-2">$9.900</span>
                    <span className="text-2xl font-bold text-orange-400">$4.950 COP</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg text-gray-500 line-through mr-2">$19.900</span>
                    <span className="text-2xl font-bold text-amber-400">$9.900 COP</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Referral Message */}
          {refCode && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <p className="text-amber-400 text-sm text-center">
                🎉 ¡Venías invitado! Ambos ganan <strong>1 mes gratis</strong> al pagar.
              </p>
            </div>
          )}

          {/* Pay Button */}
          <Button
            onClick={handlePagar}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-full py-6 glow-amber"
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            {isProductHunt ? 'Pagar $4.950 con Wompi' : 'Pagar $9.900 con Wompi'}
          </Button>

          <p className="text-gray-500 text-xs text-center mt-3">
            Serás redirigido de forma segura al checkout de Wompi
          </p>

          {/* Security Badges */}
          <div className="flex items-center justify-center gap-4 mt-4 text-gray-500 text-xs">
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span>Encriptado 256-bit</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Wompi Colombia</span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a
            href="/empezar"
            className="inline-flex items-center text-gray-500 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver a empezar
          </a>
        </div>
      </motion.div>
    </div>
    </>
  );
}
