import { supabase } from './supabase'

export interface CorrelacionHorometro {
  activo_id: number
  activo_nombre: string
  total_horas_uso_registradas: number
  total_horas_uso_omitidas: number
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
  horas_uso_registradas: number
  horas_uso_omitidas: number
  horas_uso_total: number
  horas_disponibles_teoricas: number
  porcentaje_utilizacion: number
  promedio_horas_dia: number
  reportes_con_horometro: number
  reportes_sin_horometro: number
}

export interface EstadoHorometro {
  activo_id: number
  activo_nombre: string
  horometro_actual: number
  fecha_ultimo_reporte: string
  dias_sin_actualizacion: number
  ultima_grua_operativa: boolean
}

export interface OperadorHorometroPendiente {
  usuario_id: string
  usuario_nombre: string
  usuario_rut: string
  total_pendientes: number
  reportes_pendientes: Array<{
    reporte_id: string
    activo_nombre: string
    activo_id: number
    horometro_inicial: number
    turno: number
    timestamp_inicio: string
    timestamp_completado: string
    dias_pendiente: number
  }>
}

export async function obtenerCorrelacionHorometroProblemas(dias: number = 90) {
  try {
    const { data, error } = await supabase.rpc('obtener_correlacion_horometro_problemas_v2', { p_dias: dias })

    if (error) throw error
    return data as CorrelacionHorometro[]
  } catch (error) {
    console.error('Error obteniendo correlación:', error)
    return []
  }
}

export async function obtenerEficienciaHorometro(dias: number = 90) {
  try {
    const { data, error } = await supabase.rpc('obtener_eficiencia_horometro_v2', { p_dias: dias })

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

export async function obtenerOperadoresHorometrosPendientes() {
  try {
    const { data, error } = await supabase.rpc('obtener_operadores_horometros_pendientes')
    if (error) {
      throw error
    }
    return data as OperadorHorometroPendiente[]
  } catch (error) {
    return []
  }
}

export interface ResumenHorasActivo {
  activo_id: number
  activo_nombre: string
  horas_registradas: number
  horas_omitidas: number
  total_horas: number
  porcentaje_omitidas: number
  reportes_completos: number
  reportes_omitidos: number
  total_reportes: number
}

export async function obtenerResumenHorasActivo(activoId?: number, dias: number = 90) {
  try {
    const { data, error } = await supabase.rpc('obtener_resumen_horas_activo', {
      p_activo_id: activoId || null,
      p_dias: dias
    })

    if (error) throw error
    return data as ResumenHorasActivo[]
  } catch (error) {
    console.error('Error obteniendo resumen horas activo:', error)
    return []
  }
}

export async function recalcularHorasOmitidasActivo(activoId: number) {
  try {
    const { data, error } = await supabase.rpc('recalcular_horas_omitidas_activo', {
      p_activo_id: activoId
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error recalculando horas omitidas:', error)
    throw error
  }
}

export async function recalcularTodasHorasOmitidas() {
  try {
    const { data, error } = await supabase.rpc('recalcular_todas_horas_omitidas')

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error recalculando todas las horas omitidas:', error)
    throw error
  }
}
