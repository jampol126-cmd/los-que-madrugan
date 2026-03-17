import { supabase } from './supabase'

export async function obtenerFrasePersonalizada(
  perfil: string,
  diaDelMes: number,
  nombre?: string | null
): Promise<string> {
  const { data } = await supabase
    .from('frases_banco')
    .select('texto')
    .eq('perfil', perfil)
    .eq('activa', true)

  const frases = data?.map(f => f.texto) ?? []

  if (frases.length === 0) {
    return '🌅 ¡Buen día! Hoy es un gran día para madrugadores.'
  }

  const frase = frases[diaDelMes % frases.length]
  return nombre ? `${nombre}, ${frase.toLowerCase()}` : frase
}

export function generarCodigoReferido(nombre: string): string {
  const limpio = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const base = limpio.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 6)
  const random = Math.floor(100 + Math.random() * 900)
  return `${base}${random}`
}
