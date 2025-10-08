'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Forklift,
  TrendingUp,
  Users,
  Timer,
  Calendar,
  RefreshCw,
  Menu,
  X
} from 'lucide-react'
import { KPICard } from '@/components/KPICard'
import { getCurrentUser } from '@/lib/auth'
import { 
  obtenerKPIs, 
  obtenerTendenciaDiaria,
  obtenerAnalisisTurnos,
  obtenerTopGruasProblematicas,
  obtenerTopProblemas
} from '@/lib/dashboard-service'
import { KPIsDashboard } from '@/lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { supabase } from '@/lib/supabase'
import { obtenerResumenUsoActivosRPC, ResumenUsoActivo } from '@/lib/activos-service'

type ReporteReciente = {
  id: string
  timestamp_completado: string
  tiene_problemas: boolean
  score_cumplimiento: number
  activo_nombre: string
  operador_nombre: string
}

async function cargarReportesRecientes() {
  try {
    const { error: refreshError } = await supabase.rpc('refresh_mv_reportes_recientes')

    if (refreshError && refreshError.code !== '55P03' && refreshError.code !== '55P02') {
      throw refreshError
    }

    const { data, error } = await supabase
      .from('mv_reportes_recientes')
      .select(`
        id,
        timestamp_completado,
        tiene_problemas,
        score_cumplimiento,
        activo_nombre,
        operador_nombre
      `)
      .order('timestamp_completado', { ascending: false })
      .limit(10)

    if (error) throw error
    return (data ?? []) as ReporteReciente[]
  } catch (error) {
    console.error('Error cargando reportes recientes:', error)
    return []
  }
}

function ReportesRecientesSidebar({ reportes, loading, actualizando }: { reportes: ReporteReciente[], loading: boolean, actualizando: boolean }) {
  const router = useRouter()

  const calcularTiempoRelativo = (timestamp: string) => {
    const ahora = new Date()
    const fecha = new Date(timestamp)
    const diffMs = ahora.getTime() - fecha.getTime()
    const diffMin = Math.floor(diffMs / 60000)

    if (diffMin < 1) return 'Hace instantes'
    if (diffMin === 1) return 'Hace 1 min'
    if (diffMin < 60) return `Hace ${diffMin} min`

    const diffHoras = Math.floor(diffMin / 60)
    if (diffHoras === 1) return 'Hace 1 hora'
    if (diffHoras < 24) return `Hace ${diffHoras} horas`

    return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
  }

  const reportesMostrar = reportes.slice(0, 5)

  return (
    <div className="hidden xl:block xl:sticky xl:top-4 bg-white rounded-lg shadow-lg border-2 border-blue-100">
      {/* Header con badge EN VIVO */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900">Actividad Reciente</h3>
          <div className="flex items-center gap-2">
            {actualizando && (
              <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
            )}
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              EN VIVO
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-600">Actualizaciones automáticas</p>
      </div>

      {/* Lista de reportes */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-blue-500" />
            Cargando...
          </div>
        ) : reportesMostrar.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No hay reportes recientes</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reportesMostrar.map((reporte, index) => {
              const tiempoRelativo = calcularTiempoRelativo(reporte.timestamp_completado)
              const esReciente = new Date().getTime() - new Date(reporte.timestamp_completado).getTime() < 120000 // < 2 min

              return (
                <button
                  key={reporte.id}
                  onClick={() => router.push(`/dashboard/reportes/${reporte.id}`)}
                  className={`w-full p-3 hover:bg-blue-50 text-left transition-all duration-200 ${
                    esReciente ? 'bg-blue-50/50' : ''
                  } ${index === 0 ? 'animate-fade-in' : ''}`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {reporte.tiene_problemas ? (
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {reporte.activo_nombre || 'Activo desconocido'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {reporte.operador_nombre || 'Operador desconocido'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className={`font-semibold px-2 py-0.5 rounded ${
                      reporte.tiene_problemas
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {reporte.score_cumplimiento}%
                    </span>
                    <span className={`text-xs ${esReciente ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                      {tiempoRelativo}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => router.push('/dashboard/reportes')}
          className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
        >
          Ver todos los reportes →
        </button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [actualizando, setActualizando] = useState(false)
  const [usuario, setUsuario] = useState<any>(null)
  const [kpis, setKpis] = useState<KPIsDashboard | null>(null)
  const [tendencia, setTendencia] = useState<any[]>([])
  const [turnos, setTurnos] = useState<any>(null)
  const [topGruas, setTopGruas] = useState<any[]>([])
  const [topProblemas, setTopProblemas] = useState<any[]>([])
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date())
  const [resumenUsoActivos, setResumenUsoActivos] = useState<ResumenUsoActivo[]>([])
  const [reportesRecientes, setReportesRecientes] = useState<ReporteReciente[]>([])
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)

  const tendenciaDataset = useMemo(() => {
    return tendencia.map((item) => {
      const totalInspecciones = Number((item as any)?.total_inspecciones ?? 0) || 0
      const rawProblemas =
        Number(
          (item as any)?.inspecciones_con_problemas ??
          (item as any)?.reportes_con_problemas ??
          (item as any)?.total_con_problemas ??
          0
        ) || 0
      const porcentajeProblemas =
        totalInspecciones > 0
          ? Number(((rawProblemas / totalInspecciones) * 100).toFixed(1))
          : 0

      return {
        ...item,
        total_inspecciones: totalInspecciones,
        score_promedio: Number((item as any)?.score_promedio ?? 0) || 0,
        porcentaje_problemas: porcentajeProblemas,
        inspecciones_con_problemas: rawProblemas
      }
    })
  }, [tendencia])

  const topUso = useMemo(() => {
    return [...resumenUsoActivos]
      .filter((item) => item.horasUso30 > 0 || item.horasUso7 > 0)
      .sort((a, b) => b.horasUso30 - a.horasUso30)
      .slice(0, 5)
  }, [resumenUsoActivos])

  useEffect(() => {
    checkAuth()
  }, [])

  // ========================================
  // REALTIME SUBSCRIPTION (Actualización Instantánea)
  // ========================================
  useEffect(() => {
    if (!usuario) return

    console.log('Conectando a Realtime...')

    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reportes_inspeccion'
        },
        (payload) => {
          console.log('Nuevo reporte detectado:', payload.new)
          cargarDatos(true) // Actualización silenciosa
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reportes_inspeccion'
        },
        (payload) => {
          console.log('Reporte actualizado:', payload.new)
          cargarDatos(true)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Conectado a Realtime')
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Error en canal Realtime')
        }
      })

    return () => {
      console.log('Desconectando Realtime...')
      supabase.removeChannel(channel)
    }
  }, [usuario])

  // ========================================
  // POLLING DE RESPALDO (cada 2 minutos)
  // ========================================
  useEffect(() => {
    if (!usuario) return

    console.log('Iniciando polling de respaldo (cada 2 minutos)')

    const intervalo = setInterval(() => {
      console.log('Polling: Actualizando datos...')
      cargarDatos(true)
    }, 120000) // 2 minutos

    return () => {
      console.log('â±ï¸ Deteniendo polling')
      clearInterval(intervalo)
    }
  }, [usuario])

  async function checkAuth() {
    const user = await getCurrentUser()
    
    if (!user || user.rol !== 'SUPERVISOR') {
      router.push('/login')
      return
    }

    setUsuario(user)
    await cargarDatos()
    setLoading(false)
  }

  async function cargarDatos(silencioso: boolean = false) {
    if (!silencioso) {
      setLoading(true)
    } else {
      setActualizando(true)
    }

    try {
      const [
        kpisData,
        tendenciaData,
        turnosData,
        gruasData,
        problemasData,
        resumenUsoData,
        reportesData
      ] = await Promise.all([
        obtenerKPIs(),
        obtenerTendenciaDiaria(30),
        obtenerAnalisisTurnos(30),
        obtenerTopGruasProblematicas(5, 30),
        obtenerTopProblemas(30),
        obtenerResumenUsoActivosRPC(30),
        cargarReportesRecientes()
      ])

      setKpis(kpisData)
      setTendencia(tendenciaData)
      setTurnos(turnosData)
      setTopGruas(gruasData)
      setTopProblemas(problemasData)
      setResumenUsoActivos(resumenUsoData)
      setReportesRecientes(reportesData)
      setUltimaActualizacion(new Date())
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      if (!silencioso) {
        setLoading(false)
      } else {
        setActualizando(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow relative z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Layout con 3 secciones: izquierda, centro, derecha */}
          <div className="flex items-center justify-between lg:grid lg:grid-cols-[300px_1fr_auto] lg:gap-4">
            {/* Sección Izquierda: Título e Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Supervisor</h1>
              <p className="text-sm text-gray-600">TULSA S.A. - {usuario?.nombre_completo}</p>

              {/* Indicador de Última Actualización */}
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-400">
                  Última Actualización: {ultimaActualizacion.toLocaleTimeString('es-CL')}
                </p>
                <button
                  onClick={() => cargarDatos()}
                  disabled={actualizando}
                  className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${actualizando ? 'animate-spin' : ''}`} />
                  {actualizando ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </div>

            {/* Sección Centro: Botones de Navegación (solo desktop) */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="flex items-center gap-3">
                {/* Botón de Gestión de Grúas */}
                <button
                  onClick={() => router.push('/dashboard/gruas')}
                  className="flex items-center justify-center w-[160px] px-4 py-2 bg-blue-600 text-white text-base font-normal rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Forklift className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Gestión de Grúas</span>
                </button>
                {/* Botón Heatmap */}
                <button
                  onClick={() => router.push('/dashboard/heatmap')}
                  className="flex items-center justify-center w-[160px] px-4 py-2 bg-purple-600 text-white text-base font-normal rounded-md hover:bg-purple-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Heatmap</span>
                </button>
                {/* Botón Horómetros */}
                <button
                  onClick={() => router.push('/dashboard/horometros')}
                  className="flex items-center justify-center w-[160px] px-4 py-2 bg-green-600 text-white text-base font-normal rounded-md hover:bg-green-700 transition-colors"
                >
                  <Timer className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Horómetros</span>
                </button>
                {/* Botón Operadores */}
                <button
                  onClick={() => router.push('/dashboard/operadores')}
                  className="flex items-center justify-center w-[160px] px-4 py-2 bg-orange-600 text-white text-base font-normal rounded-md hover:bg-orange-700 transition-colors"
                >
                  <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Operadores</span>
                </button>
                {/* Botón Problemas Críticos */}
                <button
                  onClick={() => router.push('/dashboard/problemas-criticos')}
                  className="flex items-center justify-center w-[180px] px-4 py-2 bg-red-600 text-white text-base font-normal rounded-md hover:bg-red-700 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Problemas Críticos</span>
                </button>
              </div>
            </div>

            {/* Sección Derecha: Botón Cerrar Sesión y Hamburguesa */}
            <div className="flex items-center justify-end gap-3">
              {/* Botón Cerrar Sesión (solo desktop) */}
              <button
                onClick={() => router.push('/login')}
                className="hidden lg:block px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cerrar Sesión
              </button>

              {/* Botón Hamburguesa (solo móvil/tablet) */}
              <button
                onClick={() => setMenuMovilAbierto(true)}
                className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                aria-label="Abrir menú"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Contenido Principal */}
          <div className="flex-1 min-w-0">
        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Reportes Hoy"
            value={kpis?.total_reportes_hoy || 0}
            subtitle={`${kpis?.total_reportes_semana || 0} esta semana`}
            icon={BarChart3}
            clickable={true}
            onClick={() => router.push('/dashboard/reportes')}
          />
          <KPICard
            title="Score Promedio"
            value={`${kpis?.score_promedio_global || 0}%`}
            subtitle="Últimos 30 días"
            icon={TrendingUp}
            clickable={true}
            onClick={() => router.push('/dashboard/heatmap')}
          />
          <KPICard
            title="Reportes con Problemas"
            value={kpis?.reportes_con_problemas || 0}
            subtitle={`${kpis?.porcentaje_con_problemas || 0}% del total`}
            icon={AlertTriangle}
            clickable={true}
            onClick={() => router.push('/dashboard/reportes?problemas=true')}
          />
          <KPICard
            title="Horómetros Pendientes"
            value={kpis?.horometros_pendientes || 0}
            subtitle="Por cerrar"
            icon={Clock}
            clickable={true}
            onClick={() => router.push('/dashboard/horometros#pendientes')}
          />
        </div>

        {/* Gráfico de Tendencia */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendencia Diaria (Últimos)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tendenciaDataset}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="score_promedio" stroke="#3b82f6" name="Score Promedio" />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="porcentaje_problemas"
                stroke="#f97316"
                strokeDasharray="5 5"
                dot={false}
                name="% con Problemas"
              />
              <Line yAxisId="right" type="monotone" dataKey="total_inspecciones" stroke="#10b981" name="Inspecciones" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bloques comparativos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Top Grúas Problemáticas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Grúas con Más Problemas</h2>
            <div className="space-y-3">
              {topGruas.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No hay datos suficientes</p>
              ) : (
                topGruas.map((grua, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <Forklift className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{grua.activo_nombre}</p>
                        <p className="text-sm text-gray-500">{grua.total_reportes} reportes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">{grua.reportes_con_problemas} Reportes con Problemas</p>
                      <p className="text-sm text-gray-500">{grua.porcentaje_problemas}%</p>
                      <button
                        onClick={() => {
                          const activoId = grua.activo_id ?? grua.id
                          if (activoId) {
                            router.push(`/dashboard/reportes?activo=${activoId}&problemas=true`)
                          }
                        }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ver reportes
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Uso de Grúas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Uso de Grúas (30 días)</h2>
            <div className="space-y-3">
              {topUso.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Aún no hay datos de uso registrados</p>
              ) : (
                topUso.map((item, idx) => (
                  <div key={item.activoId} className="p-3 bg-gray-50 rounded">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {idx + 1}. {item.nombre}
                        </p>
                        <p className="text-xs text-gray-500">Inspecciones 30d: {item.inspecciones30}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {item.horasUso30.toLocaleString('es-CL', { minimumFractionDigits: 1 })} h
                        </p>
                        <p className="text-xs text-gray-500">
                          Últimos 7 días: {item.horasUso7.toLocaleString('es-CL', { minimumFractionDigits: 1 })} h
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/dashboard/reportes?activo=${item.activoId}`)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Ver reportes
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Análisis por Turno */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Análisis por Turno</h2>
            <button
              onClick={() => router.push('/dashboard/reportes?problemas=true')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver reportes con problemas
            </button>
          </div>
          {turnos && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((turno) => {
                const data = turnos[`turno_${turno}`]
                if (!data) return null
                return (
                  <div key={turno} className="p-4 bg-gray-50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">Turno {turno}</h3>
                      <span className="text-sm text-gray-500">{data.total_inspecciones} inspecciones</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Score</p>
                        <p className="font-semibold">{data.score_promedio}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Reportes con Problemas</p>
                        <p className="font-semibold text-red-600">{data.con_problemas}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Horas Uso</p>
                        <p className="font-semibold">{data.horas_uso}h</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        {/* Top Problemas */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top 10 Problemas Más Frecuentes</h2>
            <button
              onClick={() => router.push('/dashboard/problemas-criticos')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver análisis completo
            </button>
          </div>
          <div className="space-y-2">
            {topProblemas.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No hay problemas detectados</p>
            ) : (
              topProblemas.map((problema, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{problema.texto_pregunta}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className="text-sm text-gray-500">{problema.total_fallo} fallos</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${problema.porcentaje_fallo}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-red-600 w-12 text-right">
                      {problema.porcentaje_fallo}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

          </div>

          {/* Sidebar de Reportes Recientes */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <ReportesRecientesSidebar
              reportes={reportesRecientes}
              loading={loading}
              actualizando={actualizando}
            />
          </div>
        </div>
      </main>

      {/* Menú Móvil Lateral */}
      {menuMovilAbierto && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity"
            onClick={() => setMenuMovilAbierto(false)}
          />

          {/* Sidebar Menú */}
          <div className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
            {/* Header del Menú */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
              <h2 className="text-lg font-bold text-white">Navegación</h2>
              <button
                onClick={() => setMenuMovilAbierto(false)}
                className="p-2 text-white hover:bg-white/20 rounded-md transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links de Navegación */}
            <nav className="flex flex-col p-4 space-y-3">
              <button
                onClick={() => {
                  router.push('/dashboard/gruas')
                  setMenuMovilAbierto(false)
                }}
                className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Forklift className="w-5 h-5 mr-3" />
                <span className="font-medium">Gestión de Grúas</span>
              </button>

              <button
                onClick={() => {
                  router.push('/dashboard/heatmap')
                  setMenuMovilAbierto(false)
                }}
                className="flex items-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                <span className="font-medium">Heatmap</span>
              </button>

              <button
                onClick={() => {
                  router.push('/dashboard/horometros')
                  setMenuMovilAbierto(false)
                }}
                className="flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Timer className="w-5 h-5 mr-3" />
                <span className="font-medium">Horómetros</span>
              </button>

              <button
                onClick={() => {
                  router.push('/dashboard/operadores')
                  setMenuMovilAbierto(false)
                }}
                className="flex items-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Users className="w-5 h-5 mr-3" />
                <span className="font-medium">Operadores</span>
              </button>

              <button
                onClick={() => {
                  router.push('/dashboard/problemas-criticos')
                  setMenuMovilAbierto(false)
                }}
                className="flex items-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <AlertTriangle className="w-5 h-5 mr-3" />
                <span className="font-medium">Problemas Críticos</span>
              </button>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    router.push('/login')
                    setMenuMovilAbierto(false)
                  }}
                  className="w-full flex items-center px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}





