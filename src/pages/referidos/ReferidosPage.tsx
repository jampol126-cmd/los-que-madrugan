import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Share2, Gift, Users, Check, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getUsuarioReferidos } from '@/lib/api';
import type { UsuarioReferidosAPI } from '@/lib/api';
import { toast } from 'sonner';

const BOT_NAME = import.meta.env.VITE_BOT_NAME || 'MadrugadoresBot';

function getEstadoBadge(estado: string) {
  const configs: Record<string, { text: string; className: string }> = {
    registrado: { text: 'Registrado', className: 'bg-blue-500/20 text-blue-400' },
    trial_activado: { text: 'Trial activo', className: 'bg-amber-500/20 text-amber-400' },
    pago_confirmado: { text: 'Pagó', className: 'bg-emerald-500/20 text-emerald-400' },
    recompensa_aplicada: { text: 'Mes otorgado', className: 'bg-purple-500/20 text-purple-400' },
  };
  const config = configs[estado] ?? configs.registrado;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.text}
    </span>
  );
}

export default function ReferidosPage() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<UsuarioReferidosAPI | null>(null);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const chatId = searchParams.get('chat_id') || localStorage.getItem('chat_id_temp') || '';

  useEffect(() => {
    if (!chatId) {
      setError('No se encontró tu ID de Telegram. Abrí el link desde el bot.');
      setIsLoading(false);
      return;
    }

    getUsuarioReferidos(chatId)
      .then((d) => {
        setData(d);
        setReferralLink(
          `https://t.me/${BOT_NAME}?start=REF_${d.codigo_referido}`
        );
      })
      .catch(() => setError('Error al cargar tus referidos. Intentá de nuevo.'))
      .finally(() => setIsLoading(false));
  }, [chatId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copiado al portapapeles');
  };

  const handleShareWhatsApp = () => {
    const text = `Mira esto: me uní a Los que Madrugan, frases para emprendedores a las 6am. Usá mi link y ganamos 1 mes gratis: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = `Me uní a Los que Madrugan. Frases para emprendedores a las 6am. Usá mi link y ganamos 1 mes gratis:`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <a href="/" className="text-amber-400 hover:underline">Volver al inicio</a>
        </div>
      </div>
    );
  }

  const mesesGratis = data?.meses_gratis_acumulados ?? 0;
  const invitados = data?.referidos ?? [];
  const progreso = Math.min((mesesGratis / 12) * 100, 100);

  return (
    <div className="min-h-screen bg-[#0B0F17]">
      {/* Header */}
      <header className="border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl">🌅</span>
            <span className="font-bold text-white">
              Los que <span className="text-amber-400">Madrugan</span>
            </span>
          </a>
          <a href="/" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Gift className="h-10 w-10 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Ganá meses gratis invitando madrugadores
          </h1>
          <p className="text-gray-400">
            Por cada amigo que se una y pague, ambos ganan 1 mes gratis.
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Meses gratis acumulados</p>
              <p className="text-4xl font-bold text-amber-400">{mesesGratis}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Amigos invitados</p>
              <p className="text-2xl font-bold text-white">{data?.amigos_invitados ?? 0}</p>
            </div>
          </div>

          <Progress value={progreso} className="h-2 bg-white/10 mb-2" />

          <p className="text-gray-500 text-sm text-center">
            {mesesGratis < 12
              ? `Invitá ${12 - mesesGratis} amigo(s) más para llegar a 12 meses gratis`
              : '¡Alcanzaste 12 meses gratis! Sos un referidor top 🏆'}
          </p>
        </motion.div>

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-amber-400" />
            Compartí tu link
          </h3>

          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-sm text-gray-400 truncate font-mono">
              {referralLink}
            </div>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="border-white/10 hover:bg-white/5"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleShareWhatsApp}
              variant="outline"
              className="border-white/10 hover:bg-white/5"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            <Button
              onClick={handleShareTelegram}
              variant="outline"
              className="border-white/10 hover:bg-white/5"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Telegram
            </Button>
          </div>
        </motion.div>

        {/* Invitados List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-400" />
            Tus invitados
          </h3>

          {invitados.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aún no has invitado a nadie</p>
              <p className="text-gray-600 text-sm mt-1">¡Compartí tu link para empezar!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitados.map((invitado) => (
                <div
                  key={invitado.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">
                      {(invitado.nombre ?? '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{invitado.nombre ?? 'Anónimo'}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(invitado.fecha_registro).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </div>
                  {getEstadoBadge(invitado.estado)}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Preview Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 glass rounded-2xl p-6"
        >
          <p className="text-gray-500 text-sm mb-2">Así se verá tu mensaje:</p>
          <div className="bg-white/5 rounded-xl p-4 text-gray-300 text-sm italic">
            &quot;Me uní a Los que Madrugan. Frases para emprendedores a las 6am.
            Usá mi link y ganamos 1 mes gratis: {referralLink}&quot;
          </div>
        </motion.div>
      </div>
    </div>
  );
}
