import { supabase } from './supabase'

export interface ReporteDetalle {
  id: string
  activo_id: number
  usuario_id: string
  plantilla_id: number
  timestamp_inicio: string
  timestamp_completado: string
  duracion_minutos: number
  tiene_problemas: boolean
  total_respuestas: number
  respuestas_malas: number
  score_cumplimiento: number
  turno: number | null
  horometro_inicial: number | null
  horometro_final: number | null
  horometro_pendiente: boolean
  horas_uso: number | null
  activo: {
    nombre: string
    modelo: string
    tipo: string
  }
  usuario: {
    nombre_completo: string
  }
  respuestas: Array<{
    id: number
    pregunta_id: number
    respuesta: boolean
    comentario: string | null
    pregunta: {
      texto: string
      orden: number
      categoria: {
        nombre: string
      }
    }
    fotos: Array<{
      url_storage: string
    }>
  }>
}

export async function obtenerReporteDetalle(reporteId: string): Promise<ReporteDetalle | null> {
  try {
    const { data, error } = await supabase
      .from('reportes_inspeccion')
      .select(`
        *,
        activo:activos!inner(nombre, modelo, tipo),
        usuario:usuarios!inner(nombre_completo),
        respuestas:respuestas_reporte(
          id,
          pregunta_id,
          respuesta,
          comentario,
          pregunta:preguntas_plantilla!inner(
            texto,
            orden,
            categoria:categorias_plantilla!inner(nombre)
          ),
          fotos:fotos_respuesta(url_storage)
        )
      `)
      .eq('id', reporteId)
      .single()

    if (error) throw error
    return data as any
  } catch (error) {
    console.error('Error obteniendo detalle del reporte:', error)
    return null
  }
}

export async function obtenerReportesConFiltros(
  fechaDesde?: string,
  fechaHasta?: string,
  activoId?: number,
  soloConProblemas?: boolean,
  operadorId?: string,
  turno?: number,
  cargarTodo?: boolean
) {
  try {
    let query = supabase
      .from('reportes_inspeccion')
      .select(`
        *,
        activo:activos!inner(nombre, modelo),
        usuario:usuarios!inner(nombre_completo)
      `)
      .order('timestamp_completado', { ascending: false })

    // Si no se especifica fecha y no se pide cargar todo, limitar a últimos 30 días
    if (!fechaDesde && !fechaHasta && !cargarTodo) {
      const fecha30DiasAtras = new Date()
      fecha30DiasAtras.setDate(fecha30DiasAtras.getDate() - 30)
      query = query.gte('timestamp_completado', fecha30DiasAtras.toISOString())
    } else {
      if (fechaDesde) {
        query = query.gte('timestamp_completado', fechaDesde)
      }

      if (fechaHasta) {
        query = query.lte('timestamp_completado', fechaHasta)
      }
    }

    if (activoId) {
      query = query.eq('activo_id', activoId)
    }

    if (soloConProblemas) {
      query = query.eq('tiene_problemas', true)
    }

    if (operadorId) {
      query = query.eq('usuario_id', operadorId)
    }

    if (turno !== undefined) {
      query = query.eq('turno', turno)
    }

    // Límite de seguridad: máximo 1000 reportes
    if (!cargarTodo) {
      query = query.limit(1000)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error obteniendo reportes:', error)
    return []
  }
}