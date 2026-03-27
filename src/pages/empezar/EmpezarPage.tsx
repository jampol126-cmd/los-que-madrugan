import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, MessageCircle, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PERFILES } from '@/types';
import { cn } from '@/lib/utils';
import { EmpezarPageSEO } from '@/components/SEO';
import type { Perfil } from '@/types';

const TOTAL_STEPS = 2;

export default function EmpezarPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPerfil, setSelectedPerfil] = useLocalStorage<Perfil>('perfil_seleccionado', 'tienda');

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      window.history.back();
    }
  };

  const selectedPerfilData = PERFILES.find(p => p.id === selectedPerfil);

  const getBotLink = () => {
    const botName = import.meta.env.VITE_BOT_NAME || 'MadrugadoresBot';
    return `https://t.me/${botName}?start=REF_${selectedPerfil}`;
  };

  return (
    <>
      <EmpezarPageSEO />
      <div className="min-h-screen bg-[#0B0F17] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl">🌅</span>
            <span className="font-bold text-white">
              Los que <span className="text-amber-400">Madrugan</span>
            </span>
          </a>
          <span className="text-gray-500 text-sm">Paso {currentStep} de {TOTAL_STEPS}</span>
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 py-4">
        <div className="max-w-md mx-auto">
          <Progress value={progress} className="h-1 bg-white/10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Profile */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-amber-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">¿Qué tipo de madrugador sos?</h1>
                  <p className="text-gray-400">Seleccioná el perfil que mejor te represente.</p>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {PERFILES.map((perfil) => (
                    <button
                      key={perfil.id}
                      onClick={() => setSelectedPerfil(perfil.id)}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all duration-200",
                        selectedPerfil === perfil.id
                          ? "bg-amber-500/10 border-amber-500/50"
                          : "bg-white/5 border-white/10 hover:border-amber-500/30 hover:bg-white/[0.08]"
                      )}
                    >
                      <span className="text-2xl mb-2 block">{perfil.icon}</span>
                      <span className="text-white font-medium text-sm">{perfil.label}</span>
                      <p className="text-gray-500 text-xs mt-1">{perfil.description}</p>
                    </button>
                  ))}
                </div>

                <Button 
                  onClick={handleNext}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full py-6"
                >
                  Continuar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Go to Telegram */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-amber-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">Todo listo</h1>
                  <p className="text-gray-400">Abrí el bot de Telegram para activar tu trial de 3 días.</p>
                </div>

                {/* Summary */}
                <div className="glass rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Perfil</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedPerfilData?.icon}</span>
                      <span className="text-white font-medium">{selectedPerfilData?.label}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-gray-400">Precio</span>
                    <div className="text-right">
                      <span className="text-base text-gray-500 line-through mr-2">$19.900</span>
                      <span className="text-xl font-bold text-amber-400">$9.900/mes</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-gray-400">Trial gratis</span>
                    <span className="text-emerald-400 font-medium">3 días</span>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-amber-400 text-xs font-bold">1</span>
                    </div>
                    <p className="text-gray-300 text-sm">Abrí el bot y tocá <b>Start</b></p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-amber-400 text-xs font-bold">2</span>
                    </div>
                    <p className="text-gray-300 text-sm">Seleccioná tu perfil y activá el trial</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-amber-400 text-xs font-bold">3</span>
                    </div>
                    <p className="text-gray-300 text-sm">Recibí tu primera frase mañana a las 6 AM</p>
                  </div>
                </div>

                {/* CTA Button */}
                <a href={getBotLink()} target="_blank" rel="noopener noreferrer" className="block">
                  <Button 
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-full py-6 glow-amber"
                  >
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Abrir bot de Telegram
                  </Button>
                </a>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 border-white/10 text-white hover:bg-white/5 rounded-full py-6"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Volver
                  </Button>
                </div>

                <p className="text-center text-gray-500 text-sm">
                  ¿Ya tenés el bot abierto? Escribí <b>MI CUENTA</b> para ver tu estado.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </>
  );
}
