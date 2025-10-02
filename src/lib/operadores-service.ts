import { supabase } from './supabase'

export interface AnalisisOperador {
  usuario_id: string
  nombre_completo: string
  rut: string | null
  id_alternativo: string | null
  centro_costo: string | null
  fecha_ingreso: string | null
  cargo: string | null
  total_inspecciones: number
  inspecciones_con_problemas: number
  porcentaje_problemas: number
  score_promedio: number
  duracion_promedio_minutos: number
  ultima_inspeccion: string
  dias_desde_ultima: number
}

export interface AnalisisCentroCosto {
  centro_costo: string
  total_operadores: number
  total_inspecciones: number
  inspecciones_con_problemas: number
  porcentaje_problemas: number
  score_promedio: number
}

export async function obtenerAnalisisOperadores(dias: number = 90) {
  try {
    const { data, error } = await supabase.rpc('obtener_analisis_operadores', { dias })
    
    if (error) throw error
    return data as AnalisisOperador[]
  } catch (error) {
    console.error('Error obteniendo análisis operadores:', error)
    return []
  }
}

export async function obtenerAnalisisCentroCosto(dias: number = 90) {
  try {
    const { data, error } = await supabase.rpc('obtener_analisis_centro_costo', { dias })
    
    if (error) throw error
    return data as AnalisisCentroCosto[]
  } catch (error) {
    console.error('Error obteniendo análisis centro costo:', error)
    return []
  }
}