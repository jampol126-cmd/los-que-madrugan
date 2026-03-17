import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, DollarSign, Zap, Clock, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getMetrics, getSuscriptores } from '@/lib/api';
import type { MetricasAPI, SuscriptorAPI } from '@/lib/api';
import { toast } from 'sonner';

const PERFIL_COLORS: Record<string, string> = {
  tienda: '#3b82f6',
  freelance: '#a855f7',
  startup: '#f59e0b',
  profesional: '#10b981',
};

const PERFIL_LABELS: Record<string, string> = {
  tienda: 'Tienda',
  freelance: 'Freelance',
  startup: 'Startup',
  profesional: 'Profesional',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTimeAgo(date: string): string {
  const diffInHours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return 'hace minutos';
  if (diffInHours === 1) return 'hace 1 hora';
  if (diffInHours < 24) return `hace ${diffInHours} horas`;
  return `hace ${Math.floor(diffInHours / 24)} días`;
}

function estadoToActivityType(estado: string): 'registro' | 'pago' | 'cancelacion' | 'trial' {
  if (estado === 'activo') return 'pago';
  if (estado === 'trial') return 'trial';
  if (estado === 'cancelado') return 'cancelacion';
  return 'registro';
}

function getActivityIcon(tipo: string) {
  const icons: Record<string, typeof TrendingUp> = {
    trial: Clock,
    pago: DollarSign,
    cancelacion: TrendingDown,
    registro: Users,
  };
  return icons[tipo] || Activity;
}

function getActivityColor(tipo: string): string {
  const colors: Record<string, string> = {
    trial: 'text-amber-400 bg-amber-500/10',
    pago: 'text-emerald-400 bg-emerald-500/10',
    cancelacion: 'text-red-400 bg-red-500/10',
    registro: 'text-blue-400 bg-blue-500/10',
  };
  return colors[tipo] || 'text-gray-400 bg-gray-500/10';
}

function getActivityMessage(estado: string): string {
  if (estado === 'activo') return 'pagó suscripción';
  if (estado === 'trial') return 'activó trial';
  if (estado === 'cancelado') return 'canceló suscripción';
  return 'se registró';
}

export default function AdminDashboard() {
  const [metricas, setMetricas] = useState<MetricasAPI | null>(null);
  const [actividad, setActividad] = useState<SuscriptorAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMetrics(), getSuscriptores()])
      .then(([m, sus]) => {
        setMetricas(m);
        // Actividad reciente: los 5 suscriptores más nuevos
        const recientes = [...sus]
          .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime())
          .slice(0, 5);
        setActividad(recientes);
      })
      .catch(() => toast.error('Error al cargar métricas'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    );
  }

  const chartData = (metricas?.por_perfil ?? []).map((p) => ({
    name: PERFIL_LABELS[p.perfil] ?? p.perfil,
    value: Number(p.count),
    color: PERFIL_COLORS[p.perfil] ?? '#6b7280',
  }));

  const tasaConversion =
    metricas && metricas.total_usuarios > 0
      ? Math.round((metricas.activos / metricas.total_usuarios) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'MRR (Ingresos mensuales)',
            value: formatCurrency(metricas?.mrr_cop ?? 0),
            icon: DollarSign,
            positive: true,
          },
          {
            label: 'Suscriptores Activos',
            value: String(metricas?.activos ?? 0),
            icon: Users,
            positive: true,
          },
          {
            label: 'En Trial',
            value: String(metricas?.en_trial ?? 0),
            icon: Zap,
            positive: true,
          },
          {
            label: 'Tasa Conversión',
            value: `${tasaConversion}%`,
            icon: TrendingUp,
            positive: tasaConversion > 0,
          },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metric.positive ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                <metric.icon className={`h-5 w-5 ${metric.positive ? 'text-emerald-400' : 'text-amber-400'}`} />
              </div>
            </div>
            <p className="text-gray-400 text-sm">{metric.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart and Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-white font-semibold mb-6">Suscriptores por perfil</h3>
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Sin datos de perfil aún
            </div>
          )}
        </motion.div>

        {/* Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-white font-semibold mb-6">Actividad reciente</h3>
          {actividad.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500">
              Sin actividad reciente
            </div>
          ) : (
            <div className="space-y-4">
              {actividad.map((sus) => {
                const tipo = estadoToActivityType(sus.estado);
                const Icon = getActivityIcon(tipo);
                return (
                  <div key={sus.id} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getActivityColor(tipo)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        <span className="font-medium">{sus.nombre ?? 'Anónimo'}</span>{' '}
                        <span className="text-gray-400">{getActivityMessage(sus.estado)}</span>
                      </p>
                      <p className="text-gray-500 text-xs">{formatTimeAgo(sus.creado_en)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
