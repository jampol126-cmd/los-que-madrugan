import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, MessageCircle, Loader2, Gift, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PERFILES } from '@/types';
import confetti from 'canvas-confetti';

export default function ExitoPage() {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPerfil] = useLocalStorage<string>('perfil_seleccionado', 'tienda');
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);

  const perfilData = PERFILES.find(p => p.id === selectedPerfil);
  const chatId = searchParams.get('chat_id') || '123456';

  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#ffffff'],
    });

    // Generate referral link
    setReferralLink(`${window.location.origin}/empezar?ref=${chatId}`);

    // Simulate activation steps
    const timer1 = setTimeout(() => setCurrentStep(2), 2000);
    const timer2 = setTimeout(() => setCurrentStep(3), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [chatId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Mira esto: me uní a Los que Madrugan, frases para emprendedores a las 6am. Usá mi link y ganamos 1 mes gratis: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const botLink = `https://t.me/MadrugadoresBot?start=success_${chatId}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F17] via-[#1a1520] to-[#0B0F17] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        {/* Success Icon */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
          >
            <Check className="h-12 w-12 text-emerald-400" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            🌅 ¡Bienvenido al club!
          </h1>
          <p className="text-gray-400">
            Tu pago fue confirmado. Tu perfil <span className="text-amber-400">{perfilData?.label}</span> está activo.
          </p>
        </div>

        {/* Timeline */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium">Pago confirmado</p>
                <p className="text-gray-500 text-sm">$19.900 COP procesado</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                currentStep >= 2 ? "bg-emerald-500/20" : "bg-white/10"
              )}>
                {currentStep >= 2 ? (
                  <Check className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
                )}
              </div>
              <div>
                <p className={cn("font-medium", currentStep >= 2 ? "text-white" : "text-gray-400")}>
                  Activando Telegram...
                </p>
                <p className="text-gray-500 text-sm">Conectando con el bot</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                currentStep >= 3 ? "bg-emerald-500/20" : "bg-white/10"
              )}>
                {currentStep >= 3 ? (
                  <Check className="h-5 w-5 text-emerald-400" />
                ) : (
                  <span className="text-gray-500">🚀</span>
                )}
              </div>
              <div>
                <p className={cn("font-medium", currentStep >= 3 ? "text-white" : "text-gray-400")}>
                  Listo para mañana 6am
                </p>
                <p className="text-gray-500 text-sm">Recibirás tu primera frase</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <a href={botLink} target="_blank" rel="noopener noreferrer">
          <Button 
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg rounded-full py-6 glow-amber mb-6"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Abrir Telegram y recibir mi primera frase
          </Button>
        </a>

        {/* Referral Bonus */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Gift className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">¿Sabías que podés ganar meses gratis?</h3>
              <p className="text-gray-400 text-sm">Invitá 1 amigo = 1 mes gratis</p>
            </div>
          </div>

          {/* Share Link */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-sm text-gray-400 truncate">
              {referralLink}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              className="border-white/10 hover:bg-white/5"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShareWhatsApp}
              className="border-white/10 hover:bg-white/5"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {copied && (
            <p className="text-emerald-400 text-sm text-center">¡Link copiado!</p>
          )}

          {/* Preview Message */}
          <div className="bg-white/5 rounded-xl p-4 text-sm text-gray-400">
            <p className="italic">
              &quot;Mira esto: me uní a Los que Madrugan, frases para emprendedores a las 6am. 
              Usá mi link y ganamos 1 mes gratis: [LINK]&quot;
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
