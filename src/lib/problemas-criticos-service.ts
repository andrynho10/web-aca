import { supabase } from './supabase'

export interface ProblemaCritico {
  pregunta_id: number
  texto_pregunta: string
  total_evaluaciones: number
  total_fallos: number
  porcentaje_fallo: number
  afecta_activos: number
  ultima_ocurrencia: string
  tendencia: 'EMPEORANDO' | 'MEJORANDO' | 'ESTABLE'
  criticidad: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA'
  fotos_evidencia: number
}

export interface ProblemaPorActivo {
  pregunta_id: number
  texto_pregunta: string
  total_evaluaciones: number
  total_fallos: number
  porcentaje_fallo: number
  ultima_ocurrencia: string
  fotos_evidencia: number
}

export interface EvolucionProblema {
  fecha: string
  total_evaluaciones: number
  total_fallos: number
  porcentaje_fallo: number
}

export interface ActivoAfectado {
  activo_id: number
  activo_nombre: string
  total_evaluaciones: number
  total_fallos: number
  porcentaje_fallo: number
  ultima_ocurrencia: string
}

export async function obtenerAnalisisProblemasCriticos(dias: number = 30) {
  try {
    const { data, error } = await supabase.rpc('obtener_analisis_problemas_criticos', { 
      dias_periodo: dias 
    })
    
    if (error) throw error
    return data as ProblemaCritico[]
  } catch (error) {
    console.error('Error obteniendo problemas críticos:', error)
    return []
  }
}

export async function obtenerProblemasPorActivo(activoId: number, dias: number = 30) {
  try {
    const { data, error } = await supabase.rpc('obtener_problemas_por_activo', { 
      activo_id_param: activoId,
      dias_periodo: dias 
    })
    
    if (error) throw error
    return data as ProblemaPorActivo[]
  } catch (error) {
    console.error('Error obteniendo problemas por activo:', error)
    return []
  }
}

export async function obtenerEvolucionProblema(preguntaId: number, dias: number = 90) {
  try {
    const { data, error } = await supabase.rpc('obtener_evolucion_problema', { 
      pregunta_id_param: preguntaId,
      dias_periodo: dias 
    })
    
    if (error) throw error
    return data as EvolucionProblema[]
  } catch (error) {
    console.error('Error obteniendo evolución de problema:', error)
    return []
  }
}

export async function obtenerActivosAfectadosPorProblema(preguntaId: number, dias: number = 30) {
  try {
    const { data, error } = await supabase.rpc('obtener_activos_afectados_por_problema', { 
      pregunta_id_param: preguntaId,
      dias_periodo: dias 
    })
    
    if (error) throw error
    return data as ActivoAfectado[]
  } catch (error) {
    console.error('Error obteniendo activos afectados:', error)
    return []
  }
}