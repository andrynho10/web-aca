'use client'

import { useEffect, useState } from 'react'
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
  Calendar
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

function ReportesRecientesList() {
  const router = useRouter()
  const [reportesRecientes, setReportesRecientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarReportesRecientes()
  }, [])

  async function cargarReportesRecientes() {
    try {
      const { data, error } = await supabase
        .from('reportes_inspeccion')
        .select(`
          id,
          timestamp_completado,
          tiene_problemas,
          score_cumplimiento,
          activo:activos!inner(nombre),
          usuario:usuarios!inner(nombre_completo)
        `)
        .order('timestamp_completado', { ascending: false })
        .limit(10)

      if (error) throw error
      setReportesRecientes(data || [])
    } catch (error) {
      console.error('Error cargando reportes recientes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Cargando...</div>
  }

  if (reportesRecientes.length === 0) {
    return <div className="text-center py-4 text-gray-500">No hay reportes recientes</div>
  }

  return (
    <div className="space-y-2">
      {reportesRecientes.map((reporte) => {
        const fecha = new Date(reporte.timestamp_completado).toLocaleString('es-CL', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })

        return (
          <button
            key={reporte.id}
            onClick={() => router.push(`/dashboard/reportes/${reporte.id}`)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              {reporte.tiene_problemas ? (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{reporte.activo?.nombre}</p>
                <p className="text-xs text-gray-500">{reporte.usuario?.nombre_completo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{fecha}</span>
              <span className={`text-xs font-semibold ${
                reporte.tiene_problemas ? 'text-red-600' : 'text-green-600'
              }`}>
                {reporte.score_cumplimiento}%
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [usuario, setUsuario] = useState<any>(null)
  const [kpis, setKpis] = useState<KPIsDashboard | null>(null)
  const [tendencia, setTendencia] = useState<any[]>([])
  const [turnos, setTurnos] = useState<any>(null)
  const [topGruas, setTopGruas] = useState<any[]>([])
  const [topProblemas, setTopProblemas] = useState<any[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

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

  async function cargarDatos() {
    const [kpisData, tendenciaData, turnosData, gruasData, problemasData] = await Promise.all([
      obtenerKPIs(),
      obtenerTendenciaDiaria(30),
      obtenerAnalisisTurnos(30),
      obtenerTopGruasProblematicas(5, 30),
      obtenerTopProblemas()
    ])

    setKpis(kpisData)
    setTendencia(tendenciaData)
    setTurnos(turnosData)
    setTopGruas(gruasData)
    setTopProblemas(problemasData)
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Supervisor</h1>
              <p className="text-sm text-gray-600">TULSA S.A. - {usuario?.nombre_completo}</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Botón Gestión de Grúas */}
              <button
                onClick={() => router.push('/dashboard/gruas')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Forklift className="w-4 h-4 mr-2" />
                Gestión de Grúas
              </button>
              {/* Botón Heatmap */}
              <button
                onClick={() => router.push('/dashboard/heatmap')}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Heatmap
              </button>
              {/* Botón Horómetros */}
              <button
                onClick={() => router.push('/dashboard/horometros')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Timer className="w-4 h-4 mr-2" />
                Horómetros
              </button>
              {/* Botón Operadores */}
              <button
                onClick={() => router.push('/dashboard/operadores')}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Operadores
              </button>
              {/* Botón Cerrar Sesión */}
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendencia Diaria (Últimos 30 días)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tendencia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="score_promedio" stroke="#3b82f6" name="Score Promedio" />
              <Line yAxisId="right" type="monotone" dataKey="total_inspecciones" stroke="#10b981" name="Inspecciones" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Grid de 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Grúas Problemáticas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Grúas con Más Problemas</h2>
            <div className="space-y-3">
              {topGruas.map((grua, idx) => (
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
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Análisis por Turno */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Análisis por Turno</h2>
            {turnos && (
              <div className="space-y-4">
                {[1, 2, 3].map((turno) => {
                  const data = turnos[`turno_${turno}`]
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
        </div>

        {/* Top Problemas */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Problemas Más Frecuentes</h2>
          <div className="space-y-2">
            {topProblemas.map((problema, idx) => (
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
            ))}
          </div>
        </div>
        {/* Lista de Reportes Recientes */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Reportes Recientes</h2>
            <button
              onClick={() => router.push('/dashboard/reportes')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos →
            </button>
          </div>
          <ReportesRecientesList />
        </div>
      </main>
    </div>
  )
}