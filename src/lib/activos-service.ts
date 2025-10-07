import { supabase, Activo } from './supabase'

export type AgregadoDiarioActivo = {
  activo_id: number
  fecha: string
  total_inspecciones: number | null
  inspecciones_con_problemas: number | null
  horas_uso_total: number | null
  horometros_pendientes: number | null
  activo?: {
    nombre: string
  } | null
}

export type ResumenUsoActivo = {
  activoId: number
  nombre: string
  horasUso30: number
  horasUso7: number
  inspecciones30: number
  problemas30: number
  horometrosPendientes: number
}

export async function obtenerActivos() {
  try {
    const { data, error } = await supabase
      .from('activos')
      .select('*')
      .order('nombre', { ascending: true })
    
    if (error) throw error
    return data as Activo[]
  } catch (error) {
    console.error('Error obteniendo activos:', error)
    return []
  }
}

export async function cambiarEstadoActivo(
  activoId: number,
  esOperativa: boolean,
  usuarioId: string,
  motivo?: string
) {
  try {
    const { data, error } = await supabase.rpc('cambiar_estado_activo', {
      p_activo_id: activoId,
      p_es_operativa: esOperativa,
      p_usuario_id: usuarioId,
      p_motivo: motivo
    })
    
    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('Error cambiando estado:', error)
    return { success: false, error: error.message }
  }
}

export async function obtenerHistorialEstados(activoId: number) {
  try {
    const { data, error } = await supabase
      .from('historial_estados_activo')
      .select(`
        *,
        usuarios:usuario_cambio(nombre_completo)
      `)
      .eq('activo_id', activoId)
      .order('fecha_cambio', { ascending: false })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error obteniendo historial:', error)
    return []
  }
}

export async function obtenerAgregadosDiariosActivos(dias: number = 30) {
  type AgregadoDiarioRaw = {
    activo_id: number | null
    fecha: string | null
    total_inspecciones: number | null
    inspecciones_con_problemas: number | null
    horas_uso_total: number | null
    horometros_pendientes: number | null
    activo: { nombre: string | null } | { nombre: string | null }[] | null
  }

  try {
    const fechaDesde = new Date()
    fechaDesde.setDate(fechaDesde.getDate() - (dias - 1))
    const fechaDesdeStr = fechaDesde.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('agregados_diarios')
      .select(`
        activo_id,
        fecha,
        total_inspecciones,
        inspecciones_con_problemas,
        horas_uso_total,
        horometros_pendientes,
        activo:activos(nombre)
      `)
      .gte('fecha', fechaDesdeStr)

    if (error) throw error

    const parsed: AgregadoDiarioActivo[] = []

    for (const item of data ?? []) {
      const raw = item as AgregadoDiarioRaw

      if (raw.activo_id == null || !raw.fecha) {
        continue
      }

      const activoRel = Array.isArray(raw.activo)
        ? raw.activo[0] ?? null
        : raw.activo

      parsed.push({
        activo_id: raw.activo_id,
        fecha: raw.fecha,
        total_inspecciones: raw.total_inspecciones ?? null,
        inspecciones_con_problemas: raw.inspecciones_con_problemas ?? null,
        horas_uso_total: raw.horas_uso_total ?? null,
        horometros_pendientes: raw.horometros_pendientes ?? null,
        activo: activoRel
          ? { nombre: activoRel.nombre ?? 'Sin nombre' }
          : null
      })
    }

    return parsed
  } catch (error) {
    console.error('Error obteniendo agregados diarios:', error)
    return []
  }
}

export function construirResumenUsoActivos(
  agregados: AgregadoDiarioActivo[]
): ResumenUsoActivo[] {
  const resumenMap = new Map<number, ResumenUsoActivo>()
  const fechaLimite7 = new Date()
  fechaLimite7.setDate(fechaLimite7.getDate() - 6)

  agregados.forEach((item) => {
    const activoId = item.activo_id
    if (typeof activoId !== 'number') return

    const horasUso = Number(item.horas_uso_total ?? 0) || 0
    const totalInspecciones = Number(item.total_inspecciones ?? 0) || 0
    const totalProblemas = Number(item.inspecciones_con_problemas ?? 0) || 0
    const horometrosPend = Number(item.horometros_pendientes ?? 0) || 0

    const fechaItem = item.fecha ? new Date(item.fecha) : null
    const esUltimos7Dias =
      fechaItem instanceof Date &&
      !Number.isNaN(fechaItem.getTime()) &&
      fechaItem >= fechaLimite7

    if (!resumenMap.has(activoId)) {
      resumenMap.set(activoId, {
        activoId,
        nombre: item.activo?.nombre ?? 'Sin nombre',
        horasUso30: 0,
        horasUso7: 0,
        inspecciones30: 0,
        problemas30: 0,
        horometrosPendientes: 0
      })
    }

    const resumen = resumenMap.get(activoId)!
    resumen.horasUso30 += horasUso
    resumen.inspecciones30 += totalInspecciones
    resumen.problemas30 += totalProblemas
    resumen.horometrosPendientes += horometrosPend
    if (esUltimos7Dias) {
      resumen.horasUso7 += horasUso
    }
  })

  return Array.from(resumenMap.values()).map((resumen) => ({
    ...resumen,
    horasUso30: Number(resumen.horasUso30.toFixed(1)),
    horasUso7: Number(resumen.horasUso7.toFixed(1))
  }))
}
