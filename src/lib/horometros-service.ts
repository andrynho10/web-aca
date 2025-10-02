import { supabase } from './supabase'

export interface CorrelacionHorometro {
  activo_id: number
  activo_nombre: string
  total_horas_uso: number
  total_inspecciones: number
  inspecciones_con_problemas: number
  porcentaje_problemas: number
  promedio_horas_por_inspeccion: number
}

export interface EficienciaHorometro {
  activo_id: number
  activo_nombre: string
  dias_periodo: number
  horas_uso_total: number
  horas_disponibles_teoricas: number
  porcentaje_utilizacion: number
  promedio_horas_dia: number
}

export interface EstadoHorometro {
  activo_id: number
  activo_nombre: string
  horometro_actual: number
  fecha_ultimo_reporte: string
  dias_sin_actualizacion: number
  ultima_grua_operativa: boolean
}

export async function obtenerCorrelacionHorometroProblemas(dias: number = 90) {
  try {
    const { data, error } = await supabase.rpc('obtener_correlacion_horometro_problemas', { dias })
    
    if (error) throw error
    return data as CorrelacionHorometro[]
  } catch (error) {
    console.error('Error obteniendo correlación:', error)
    return []
  }
}

export async function obtenerEficienciaHorometro(dias: number = 90) {
  try {
    const { data, error } = await supabase.rpc('obtener_eficiencia_horometro', { dias })
    
    if (error) throw error
    return data as EficienciaHorometro[]
  } catch (error) {
    console.error('Error obteniendo eficiencia:', error)
    return []
  }
}

export async function obtenerEstadoHorometros() {
  try {
    const { data, error } = await supabase.rpc('obtener_estado_horometros')
    
    if (error) throw error
    return data as EstadoHorometro[]
  } catch (error) {
    console.error('Error obteniendo estado horómetros:', error)
    return []
  }
}