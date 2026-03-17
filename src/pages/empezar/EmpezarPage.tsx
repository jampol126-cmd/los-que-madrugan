import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, MessageCircle, User, CreditCard, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PERFILES } from '@/types';
import { cn } from '@/lib/utils';
import type { Perfil } from '@/types';

const TOTAL_STEPS = 3;

export default function EmpezarPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPerfil, setSelectedPerfil] = useLocalStorage<Perfil>('perfil_seleccionado', 'tienda');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [botStarted, setBotStarted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      // El pago se inicia desde el bot: el usuario escribe PAGAR y recibe el link con su chat_id
      const botName = import.meta.env.VITE_BOT_NAME || 'MadrugadoresBot';
      window.open(`https://t.me/${botName}`, '_blank');
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
            {/* Step 1: Confirm Profile */}
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
                  <h1 className="text-2xl font-bold text-white mb-2">Confirmá tu perfil</h1>
                  <p className="text-gray-400">Elegí el tipo de negocio que mejor te represente.</p>
                </div>

                {/* Selected Profile Card */}
                <div className="glass rounded-2xl p-6 text-center">
                  <span className="text-4xl mb-3 block">{selectedPerfilData?.icon}</span>
                  <h3 className="text-white font-semibold text-lg">{selectedPerfilData?.label}</h3>
                  <p className="text-gray-400 text-sm mt-1">{selectedPerfilData?.description}</p>
                </div>

                {/* Change Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/[0.08] transition-colors"
                  >
                    <span>Cambiar perfil</span>
                    <ChevronDown className={cn("h-5 w-5 transition-transform", isDropdownOpen && "rotate-180")} />
                  </button>
                  
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-10"
                    >
                      {PERFILES.map((perfil) => (
                        <button
                          key={perfil.id}
                          onClick={() => {
                            setSelectedPerfil(perfil.id);
                            setIsDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors",
                            selectedPerfil === perfil.id && "bg-amber-500/10"
                          )}
                        >
                          <span className="text-xl">{perfil.icon}</span>
                          <div>
                            <p className={cn("text-sm font-medium", selectedPerfil === perfil.id ? "text-amber-400" : "text-white")}>
                              {perfil.label}
                            </p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                <Button 
                  onClick={handleNext}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full py-6"
                >
                  Confirmar y continuar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Connect Telegram */}
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
                  <h1 className="text-2xl font-bold text-white mb-2">Conectá Telegram</h1>
                  <p className="text-gray-400">Recibirás las frases directamente en Telegram.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Tu número de WhatsApp/Telegram</label>
                    <Input
                      type="tel"
                      placeholder="+57 300 000 0000"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl py-6"
                    />
                  </div>

                  <a
                    href={getBotLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button 
                      variant="outline"
                      className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-full py-6"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Abrir bot de Telegram
                    </Button>
                  </a>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                    <Checkbox
                      id="bot-started"
                      checked={botStarted}
                      onCheckedChange={(checked) => setBotStarted(checked as boolean)}
                      className="mt-1 border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:text-black"
                    />
                    <label htmlFor="bot-started" className="text-sm text-gray-300 cursor-pointer">
                      Ya inicié el bot y recibí el mensaje de confirmación ✓
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 border-white/10 text-white hover:bg-white/5 rounded-full py-6"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Volver
                  </Button>
                  <Button 
                    onClick={handleNext}
                    disabled={!botStarted}
                    className="flex-[2] bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full py-6 disabled:opacity-50"
                  >
                    Continuar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Summary */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-amber-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">Resumen</h1>
                  <p className="text-gray-400">Revisá los detalles antes de pagar.</p>
                </div>

                <div className="glass rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <span className="text-gray-400">Perfil seleccionado</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{selectedPerfilData?.icon}</span>
                      <span className="text-white font-medium">{selectedPerfilData?.label}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <span className="text-gray-400">Horario de envío</span>
                    <span className="text-white font-medium">6:00 AM todos los días</span>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <span className="text-gray-400">Plataforma</span>
                    <span className="text-white font-medium">Telegram</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-gray-400">Precio mensual</span>
                    <span className="text-2xl font-bold text-amber-400">$19.900 COP</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-emerald-400">
                    Cancelás cuando querás. Sin contratos ni letra chica.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <MessageCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-300">
                    Al hacer click vas al bot. Una vez ahí escribí <strong>PAGAR</strong> y te mandamos el link de pago con tu cuenta vinculada.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 border-white/10 text-white hover:bg-white/5 rounded-full py-6"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Volver
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-[2] bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full py-6 glow-amber"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Ir al bot a pagar
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
