import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(password);

    if (success) {
      toast.success('Bienvenido al panel de administración');
      navigate('/admin');
    } else {
      toast.error('Contraseña incorrecta');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
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
          <p className="text-gray-500 mt-2">Panel de Administración</p>
        </div>

        {/* Login Form */}
        <div className="glass-strong rounded-3xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Acceso Administrativo</h1>
            <p className="text-gray-400 text-sm mt-1">Ingresá la contraseña para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl py-6 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full py-6 disabled:opacity-50"
            >
              {isLoading ? 'Verificando...' : 'Ingresar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-gray-500 hover:text-white transition-colors text-sm">
              ← Volver al sitio
            </a>
          </div>
        </div>

        {/* Hint */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Solo personal autorizado. Los intentos son registrados.
        </p>
      </motion.div>
    </div>
  );
}
