import { supabase, KPIsDashboard } from './supabase'

export async function obtenerKPIs(): Promise<KPIsDashboard | null> {
  try {
    const { data, error } = await supabase.rpc('obtener_kpis_dashboard')
    
    if (error) throw error
    return data as KPIsDashboard
  } catch (error) {
    console.error('Error obteniendo KPIs:', error)
    return null
  }
}

export async function obtenerTendenciaDiaria(dias: number = 30) {
  try {
    const { data, error } = await supabase.rpc('obtener_tendencia_diaria', { dias })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error obteniendo tendencia:', error)
    return []
  }
}

export async function obtenerAnalisisTurnos(dias: number = 30) {
  try {
    const { data, error } = await supabase.rpc('obtener_analisis_turnos', { dias })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error obteniendo análisis de turnos:', error)
    return null
  }
}

export async function obtenerTopGruasProblematicas(limite: number = 5, dias: number = 30) {
  try {
    const { data, error } = await supabase.rpc('obtener_top_gruas_problematicas', { 
      limite, 
      dias 
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error obteniendo top grúas:', error)
    return []
  }
}

export async function obtenerHeatmapGruas(dias: number = 30) {
  try {
    const { data, error } = await supabase.rpc('obtener_heatmap_gruas', { dias })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error obteniendo heatmap:', error)
    return []
  }
}

export async function obtenerTopProblemas(dias: number = 30) {
  try {
    const { data, error } = await supabase.rpc('obtener_top_problemas_dinamico', { dias })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error obteniendo top problemas:', error)
    return []
  }
}