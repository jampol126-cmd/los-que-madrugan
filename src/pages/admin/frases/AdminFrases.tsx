import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, GripVertical, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Frase, Perfil } from '@/types';
import { PERFILES } from '@/types';
import { getFrases, addFrase, updateFrase, deleteFrase } from '@/lib/api';
import type { FraseAPI } from '@/lib/api';

function toFrase(f: FraseAPI, index: number): Frase {
  return { id: f.id, texto: f.texto, perfil: f.perfil as Perfil, activa: f.activa, orden: index + 1 };
}

export default function AdminFrases() {
  const [frases, setFrases] = useState<Record<Perfil, Frase[]>>({
    tienda: [], freelance: [], startup: [], profesional: [],
  });
  const [loadedTabs, setLoadedTabs] = useState<Set<Perfil>>(new Set());
  const [activeTab, setActiveTab] = useState<Perfil>('tienda');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFrase, setEditingFrase] = useState<Frase | null>(null);
  const [newFraseText, setNewFraseText] = useState('');
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadTab = useCallback(async (perfil: Perfil) => {
    if (loadedTabs.has(perfil)) return;
    setIsTabLoading(true);
    try {
      const data = await getFrases(perfil);
      setFrases(prev => ({ ...prev, [perfil]: data.map(toFrase) }));
      setLoadedTabs(prev => new Set(prev).add(perfil));
    } catch {
      toast.error('Error al cargar frases');
    } finally {
      setIsTabLoading(false);
    }
  }, [loadedTabs]);

  useEffect(() => {
    loadTab('tienda');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (perfil: Perfil) => {
    setActiveTab(perfil);
    loadTab(perfil);
  };

  const handleAddFrase = async () => {
    if (!newFraseText.trim()) {
      toast.error('La frase no puede estar vacía');
      return;
    }
    setIsSaving(true);
    try {
      const created = await addFrase(activeTab, newFraseText.trim());
      setFrases(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], toFrase(created, prev[activeTab].length)],
      }));
      setNewFraseText('');
      setIsDialogOpen(false);
      toast.success('Frase agregada correctamente');
    } catch {
      toast.error('Error al agregar frase');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditFrase = async () => {
    if (!editingFrase || !newFraseText.trim()) return;
    setIsSaving(true);
    try {
      const updated = await updateFrase(editingFrase.id, { texto: newFraseText.trim() });
      setFrases(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(f =>
          f.id === editingFrase.id ? { ...f, texto: updated.texto } : f
        ),
      }));
      setEditingFrase(null);
      setNewFraseText('');
      setIsDialogOpen(false);
      toast.success('Frase actualizada correctamente');
    } catch {
      toast.error('Error al actualizar frase');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFrase = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta frase?')) return;
    try {
      await deleteFrase(id);
      setFrases(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(f => f.id !== id),
      }));
      toast.success('Frase eliminada correctamente');
    } catch {
      toast.error('Error al eliminar frase');
    }
  };

  const handleToggleActiva = async (frase: Frase) => {
    try {
      await updateFrase(frase.id, { activa: !frase.activa });
      setFrases(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(f =>
          f.id === frase.id ? { ...f, activa: !f.activa } : f
        ),
      }));
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  const openAddDialog = () => {
    setEditingFrase(null);
    setNewFraseText('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (frase: Frase) => {
    setEditingFrase(frase);
    setNewFraseText(frase.texto);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Editor de Frases</h2>
          <p className="text-gray-400">Gestioná las frases para cada perfil de negocio.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openAddDialog}
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar frase
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1e293b] border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingFrase ? 'Editar frase' : 'Nueva frase'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Perfil: {PERFILES.find(p => p.id === activeTab)?.label}
                </label>
                <Textarea
                  value={newFraseText}
                  onChange={(e) => setNewFraseText(e.target.value)}
                  placeholder="Escribí la frase personalizada..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 min-h-[120px]"
                />
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-2">Preview:</p>
                <p className="text-sm text-gray-300">
                  Buenos días, [nombre]. {newFraseText || '...'}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 border-white/10 text-white hover:bg-white/5"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={editingFrase ? handleEditFrase : handleAddFrase}
                  disabled={isSaving}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold"
                >
                  <Check className="mr-2 h-4 w-4" />
                  {isSaving ? 'Guardando...' : editingFrase ? 'Guardar cambios' : 'Guardar frase'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as Perfil)}>
        <TabsList className="bg-white/5 border border-white/10 p-1 flex-wrap h-auto gap-1">
          {PERFILES.map((perfil) => (
            <TabsTrigger
              key={perfil.id}
              value={perfil.id}
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-400 rounded-full px-4"
            >
              <span className="mr-2">{perfil.icon}</span>
              {perfil.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {PERFILES.map((perfil) => (
          <TabsContent key={perfil.id} value={perfil.id} className="mt-6">
            {isTabLoading && activeTab === perfil.id ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
              </div>
            ) : frases[perfil.id].length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-white font-semibold mb-2">No hay frases aún</h3>
                <p className="text-gray-400 mb-4">Agregá la primera frase para este perfil.</p>
                <Button
                  onClick={openAddDialog}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar frase
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {frases[perfil.id].map((frase, index) => (
                  <motion.div
                    key={frase.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass rounded-2xl p-4 flex items-start gap-4"
                  >
                    <div className="mt-1 text-gray-500">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    <div className="flex-1">
                      <p className="text-white">{frase.texto}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          frase.activa
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          {frase.activa ? 'Activa' : 'Pausada'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={frase.activa}
                        onCheckedChange={() => handleToggleActiva(frase)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(frase)}
                        className="text-gray-400 hover:text-white hover:bg-white/5"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFrase(frase.id)}
                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
