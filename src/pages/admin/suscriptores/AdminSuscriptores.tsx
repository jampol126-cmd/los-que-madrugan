import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, MoreHorizontal, MessageSquare, XCircle, Eye, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { Suscriptor } from '@/types';
import { PERFILES } from '@/types';
import { getPerfilColor, getEstadoColor, getInitials, formatDate } from '@/lib/utils';
import { getSuscriptores, cancelarSuscriptor, darMesGratis, enviarMensajeAdmin, exportarCSV } from '@/lib/api';
import type { SuscriptorAPI } from '@/lib/api';

function toSuscriptor(s: SuscriptorAPI): Suscriptor {
  return {
    id: s.id,
    nombre: s.nombre ?? 'Sin nombre',
    email: s.email ?? '',
    chatId: s.telegram_chat_id,
    perfil: (s.perfil as Suscriptor['perfil']) ?? 'tienda',
    estado: (s.estado as Suscriptor['estado']) ?? 'prospecto' as Suscriptor['estado'],
    fechaRegistro: s.creado_en.split('T')[0],
    fechaPago: s.ultimo_pago ? s.ultimo_pago.split('T')[0] : undefined,
    referidos: s.amigos_invitados ?? 0,
  };
}

type FiltroEstado = 'todos' | 'activo' | 'trial' | 'cancelado';

export default function AdminSuscriptores() {
  const [suscriptores, setSuscriptores] = useState<Suscriptor[]>([]);
  const [filteredSuscriptores, setFilteredSuscriptores] = useState<Suscriptor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FiltroEstado>('todos');
  const [selectedSuscriptor, setSelectedSuscriptor] = useState<Suscriptor | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSuscriptores()
      .then((data) => {
        const mapped = data.map(toSuscriptor);
        setSuscriptores(mapped);
        setFilteredSuscriptores(mapped);
      })
      .catch(() => toast.error('Error al cargar suscriptores'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    let filtered = suscriptores;
    if (activeTab !== 'todos') {
      filtered = filtered.filter(s => s.estado === activeTab);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.nombre.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.chatId.includes(q)
      );
    }
    setFilteredSuscriptores(filtered);
  }, [suscriptores, activeTab, searchQuery]);

  const handleExportCSV = async () => {
    try {
      const blob = await exportarCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `madrugadores_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exportado correctamente');
    } catch {
      toast.error('Error al exportar CSV');
    }
  };

  const handleCancelar = async (suscriptor: Suscriptor) => {
    if (!confirm(`¿Cancelar suscripción de ${suscriptor.nombre}?`)) return;
    try {
      await cancelarSuscriptor(suscriptor.chatId);
      setSuscriptores(prev => prev.map(s =>
        s.id === suscriptor.id ? { ...s, estado: 'cancelado' as const } : s
      ));
      toast.success('Suscripción cancelada');
      setIsDetailOpen(false);
    } catch {
      toast.error('Error al cancelar suscripción');
    }
  };

  const handleEnviarMensaje = async (suscriptor: Suscriptor) => {
    const mensaje = prompt(`Escribí el mensaje para ${suscriptor.nombre}:`);
    if (!mensaje) return;
    try {
      await enviarMensajeAdmin(suscriptor.chatId, mensaje);
      toast.success(`Mensaje enviado a ${suscriptor.nombre}`);
    } catch {
      toast.error('Error al enviar mensaje');
    }
  };

  const handleMesGratis = async (suscriptor: Suscriptor) => {
    if (!confirm(`¿Dar 1 mes gratis a ${suscriptor.nombre}?`)) return;
    try {
      await darMesGratis(suscriptor.chatId);
      toast.success(`Mes gratis otorgado a ${suscriptor.nombre}`);
    } catch {
      toast.error('Error al dar mes gratis');
    }
  };

  const openDetail = (suscriptor: Suscriptor) => {
    setSelectedSuscriptor(suscriptor);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Suscriptores</h2>
          <p className="text-gray-400">Gestioná los usuarios del servicio.</p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="border-white/10 text-white hover:bg-white/5"
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar por nombre, email o chat ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FiltroEstado)}>
        <TabsList className="bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="todos" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-400 rounded-full">
            Todos ({suscriptores.length})
          </TabsTrigger>
          <TabsTrigger value="activo" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black text-gray-400 rounded-full">
            Activos ({suscriptores.filter(s => s.estado === 'activo').length})
          </TabsTrigger>
          <TabsTrigger value="trial" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-400 rounded-full">
            Trial ({suscriptores.filter(s => s.estado === 'trial').length})
          </TabsTrigger>
          <TabsTrigger value="cancelado" className="data-[state=active]:bg-red-500 data-[state=active]:text-black text-gray-400 rounded-full">
            Cancelados ({suscriptores.filter(s => s.estado === 'cancelado').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Desktop Table */}
          <div className="hidden md:block glass rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left text-gray-400 font-medium text-sm py-4 px-6">Nombre</th>
                  <th className="text-left text-gray-400 font-medium text-sm py-4 px-6">Perfil</th>
                  <th className="text-left text-gray-400 font-medium text-sm py-4 px-6">Estado</th>
                  <th className="text-left text-gray-400 font-medium text-sm py-4 px-6">Registro</th>
                  <th className="text-left text-gray-400 font-medium text-sm py-4 px-6">Referidos</th>
                  <th className="text-right text-gray-400 font-medium text-sm py-4 px-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSuscriptores.map((suscriptor) => (
                  <tr key={suscriptor.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">
                          {getInitials(suscriptor.nombre)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{suscriptor.nombre}</p>
                          <p className="text-gray-500 text-sm">{suscriptor.email || suscriptor.chatId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/5">
                        <span className={`w-2 h-2 rounded-full ${getPerfilColor(suscriptor.perfil)}`} />
                        {PERFILES.find(p => p.id === suscriptor.perfil)?.label ?? suscriptor.perfil}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(suscriptor.estado)}/20 ${getEstadoColor(suscriptor.estado).replace('bg-', 'text-')}`}>
                        <span className={`w-2 h-2 rounded-full ${getEstadoColor(suscriptor.estado)}`} />
                        {suscriptor.estado.charAt(0).toUpperCase() + suscriptor.estado.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
                      {formatDate(suscriptor.fechaRegistro)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-white font-medium">{suscriptor.referidos}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1e293b] border-white/10">
                          <DropdownMenuItem onClick={() => openDetail(suscriptor)} className="text-white hover:bg-white/5">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEnviarMensaje(suscriptor)} className="text-white hover:bg-white/5">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Enviar mensaje
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMesGratis(suscriptor)} className="text-white hover:bg-white/5">
                            <Gift className="mr-2 h-4 w-4" />
                            Dar mes gratis
                          </DropdownMenuItem>
                          {suscriptor.estado !== 'cancelado' && (
                            <DropdownMenuItem onClick={() => handleCancelar(suscriptor)} className="text-red-400 hover:bg-red-500/10">
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancelar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredSuscriptores.map((suscriptor) => (
              <motion.div
                key={suscriptor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">
                      {getInitials(suscriptor.nombre)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{suscriptor.nombre}</p>
                      <p className="text-gray-500 text-sm">{suscriptor.email || suscriptor.chatId}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(suscriptor.estado)}/20 ${getEstadoColor(suscriptor.estado).replace('bg-', 'text-')}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getEstadoColor(suscriptor.estado)}`} />
                    {suscriptor.estado}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{PERFILES.find(p => p.id === suscriptor.perfil)?.label}</span>
                  <span className="text-gray-500">{formatDate(suscriptor.fechaRegistro)}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDetail(suscriptor)}
                    className="flex-1 border-white/10 text-white hover:bg-white/5"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEnviarMensaje(suscriptor)}
                    className="flex-1 border-white/10 text-white hover:bg-white/5"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Mensaje
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredSuscriptores.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-gray-400">No se encontraron suscriptores</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-[#1e293b] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Suscriptor</DialogTitle>
          </DialogHeader>
          {selectedSuscriptor && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white text-xl font-medium">
                  {getInitials(selectedSuscriptor.nombre)}
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">{selectedSuscriptor.nombre}</p>
                  <p className="text-gray-400">{selectedSuscriptor.email || 'Sin email'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-500 text-sm">Chat ID</p>
                  <p className="text-white font-mono text-sm">{selectedSuscriptor.chatId}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-500 text-sm">Perfil</p>
                  <p className="text-white">{PERFILES.find(p => p.id === selectedSuscriptor.perfil)?.label}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-500 text-sm">Estado</p>
                  <p className={`font-medium ${getEstadoColor(selectedSuscriptor.estado).replace('bg-', 'text-')}`}>
                    {selectedSuscriptor.estado.charAt(0).toUpperCase() + selectedSuscriptor.estado.slice(1)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-500 text-sm">Referidos</p>
                  <p className="text-white font-medium">{selectedSuscriptor.referidos}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-500 text-sm mb-2">Historial</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Registro</span>
                    <span className="text-white">{formatDate(selectedSuscriptor.fechaRegistro)}</span>
                  </div>
                  {selectedSuscriptor.fechaPago && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Último pago</span>
                      <span className="text-white">{formatDate(selectedSuscriptor.fechaPago)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleMesGratis(selectedSuscriptor)}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold"
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Dar mes gratis
                </Button>
                {selectedSuscriptor.estado !== 'cancelado' && (
                  <Button
                    variant="outline"
                    onClick={() => handleCancelar(selectedSuscriptor)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
