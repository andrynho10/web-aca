import { supabase, Activo } from './supabase'

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