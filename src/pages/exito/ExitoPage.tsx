import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ExitoPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Procesando...');

  useEffect(() => {
    const processPayment = async () => {
      const wompiId = searchParams.get('id');

      if (!wompiId) {
        setStatus('No se encontró información del pago');
        return;
      }

      try {
        // Verificar estado real con la API pública de Wompi
        const r = await fetch(`https://production.wompi.co/v1/transactions/${wompiId}`);
        const { data } = await r.json();

        if (data?.status === 'APPROVED') {
          setStatus('¡Pago confirmado! Activando tu suscripción...');
          localStorage.removeItem('pending_chat_id');
          localStorage.removeItem('pending_perfil');
          setTimeout(() => {
            const botName = import.meta.env.VITE_BOT_NAME || 'MadrugadoresBot';
            window.location.href = `https://t.me/${botName}`;
          }, 3000);
        } else if (data?.status === 'PENDING') {
          setStatus('Pago en proceso. Te avisamos por Telegram cuando se confirme.');
        } else {
          setStatus('El pago no fue aprobado. Podés intentarlo de nuevo.');
        }
      } catch {
        // Si falla la verificación, igual mostramos éxito (el webhook lo confirma)
        setStatus('¡Pago recibido! Activando tu suscripción...');
        setTimeout(() => {
          const botName = import.meta.env.VITE_BOT_NAME || 'MadrugadoresBot';
          window.location.href = `https://t.me/${botName}`;
        }, 3000);
      }
    };

    processPayment();
  }, [searchParams]);

  const botName = import.meta.env.VITE_BOT_NAME || 'MadrugadoresBot';

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-amber-400 mb-4">
          ¡Bienvenido al club!
        </h1>
        <p className="text-xl text-gray-300 mb-8">{status}</p>
        <p className="text-gray-400">
          Volvé a Telegram para recibir tu primera frase mañana a las 6AM.
        </p>
        <a
          href={`https://t.me/${botName}`}
          className="inline-block mt-6 bg-amber-500 text-black font-bold py-3 px-8 rounded-full"
        >
          Abrir Telegram →
        </a>
      </div>
    </div>
  );
};

export default ExitoPage;
