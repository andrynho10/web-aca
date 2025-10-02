'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Timer, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Activity,
  Gauge
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { 
  obtenerCorrelacionHorometroProblemas,
  obtenerEficienciaHorometro,
  obtenerEstadoHorometros,
  CorrelacionHorometro,
  EficienciaHorometro,
  EstadoHorometro
} from '@/lib/horometros-service'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'

export default function HorometrosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [correlacion, setCorrelacion] = useState<CorrelacionHorometro[]>([])
  const [eficiencia, setEficiencia] = useState<EficienciaHorometro[]>([])
  const [estado, setEstado] = useState<EstadoHorometro[]>([])
  const [dias, setDias] = useState(90)

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  async function checkAuthAndLoad() {
    const user = await getCurrentUser()
    
    if (!user || user.rol !== 'SUPERVISOR') {
      router.push('/login')
      return
    }

    await cargarDatos()
    setLoading(false)
  }

  async function cargarDatos() {
    setLoading(true)
    const [correlacionData, eficienciaData, estadoData] = await Promise.all([
      obtenerCorrelacionHorometroProblemas(dias),
      obtenerEficienciaHorometro(dias),
      obtenerEstadoHorometros()
    ])

    setCorrelacion(correlacionData)
    setEficiencia(eficienciaData)
    setEstado(estadoData)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando análisis...</p>
        </div>
      </div>
    )
  }

  // Preparar datos para gráfico de correlación
  const dataCorrelacion = correlacion.map(c => ({
    nombre: c.activo_nombre,
    horas: c.total_horas_uso,
    problemas: c.porcentaje_problemas
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Análisis de Horómetros</h1>
              <p className="text-sm text-gray-600">Uso, eficiencia y correlación con problemas</p>
            </div>

            {/* Selector de período */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Período:</label>
              <select
                value={dias}
                onChange={(e) => {
                  setDias(parseInt(e.target.value))
                  setTimeout(() => cargarDatos(), 100)
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="30">Últimos 30 días</option>
                <option value="60">Últimos 60 días</option>
                <option value="90">Últimos 90 días</option>
                <option value="180">Últimos 6 meses</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Estado Actual de Horómetros */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Estado Actual de Horómetros</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grúa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horómetro Actual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última Actualización</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días Sin Datos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {estado.map((item) => {
                  const alerta = item.dias_sin_actualizacion > 7
                  
                  return (
                    <tr key={item.activo_id} className={alerta ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.activo_nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.horometro_actual ? `${item.horometro_actual}h` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.fecha_ultimo_reporte 
                          ? new Date(item.fecha_ultimo_reporte).toLocaleDateString('es-CL')
                          : 'Sin reportes'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${alerta ? 'text-yellow-700' : 'text-gray-600'}`}>
                          {item.dias_sin_actualizacion}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.ultima_grua_operativa 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.ultima_grua_operativa ? 'Operativa' : 'Inactiva'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Correlación: Horas Uso vs Problemas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Correlación: Horas de Uso vs Problemas Detectados
            </h2>
          </div>
          
          {correlacion.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay datos suficientes para mostrar correlación
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataCorrelacion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="horas" fill="#3b82f6" name="Horas Uso" />
                  <Bar yAxisId="right" dataKey="problemas" fill="#ef4444" name="% Problemas" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {correlacion.slice(0, 3).map((item) => (
                  <div key={item.activo_id} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.activo_nombre}</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        Horas uso: <span className="font-semibold text-gray-900">{item.total_horas_uso}h</span>
                      </p>
                      <p className="text-gray-600">
                        Inspecciones: <span className="font-semibold text-gray-900">{item.total_inspecciones}</span>
                      </p>
                      <p className="text-gray-600">
                        Con problemas: <span className="font-semibold text-red-600">{item.inspecciones_con_problemas}</span>
                      </p>
                      <p className="text-gray-600">
                        % Problemas: <span className="font-semibold text-red-600">{item.porcentaje_problemas}%</span>
                      </p>
                      <p className="text-gray-600">
                        Promedio h/inspección: <span className="font-semibold text-gray-900">{item.promedio_horas_por_inspeccion}h</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Eficiencia: Horómetro vs Tiempo Calendario */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Eficiencia: Utilización vs Tiempo Disponible
            </h2>
          </div>

          {eficiencia.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay datos suficientes para mostrar eficiencia
            </div>
          ) : (
            <div className="space-y-4">
              {eficiencia.map((item) => (
                <div key={item.activo_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{item.activo_nombre}</h3>
                    <span className={`text-2xl font-bold ${
                      item.porcentaje_utilizacion > 50 ? 'text-green-600' :
                      item.porcentaje_utilizacion > 25 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {item.porcentaje_utilizacion}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Horas Uso</p>
                      <p className="font-semibold text-gray-900">{item.horas_uso_total}h</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Horas Disponibles</p>
                      <p className="font-semibold text-gray-900">{item.horas_disponibles_teoricas}h</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Promedio h/día</p>
                      <p className="font-semibold text-gray-900">{item.promedio_horas_dia}h</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Período</p>
                      <p className="font-semibold text-gray-900">{item.dias_periodo} días</p>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.porcentaje_utilizacion > 50 ? 'bg-green-500' :
                          item.porcentaje_utilizacion > 25 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(item.porcentaje_utilizacion, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Insights y Recomendaciones</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Grúas con alta utilización (&gt;50%) requieren monitoreo más frecuente</li>
                <li>• Grúas con baja utilización (&lt;25%) pueden indicar subutilización o problemas operacionales</li>
                <li>• Mayor cantidad de horas no siempre correlaciona con más problemas - depende del mantenimiento</li>
                <li>• Grúas sin actualización de horómetro por más de 7 días requieren atención</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}