'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  Award,
  Building2,
  Calendar,
  Briefcase,
  IdCard,
  Clock
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { 
  obtenerAnalisisOperadores,
  obtenerAnalisisCentroCosto,
  AnalisisOperador,
  AnalisisCentroCosto
} from '@/lib/operadores-service'

export default function OperadoresPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [operadores, setOperadores] = useState<AnalisisOperador[]>([])
  const [centrosCosto, setCentrosCosto] = useState<AnalisisCentroCosto[]>([])
  const [dias, setDias] = useState(90)
  const [ordenamiento, setOrdenamiento] = useState<'inspecciones' | 'score' | 'problemas'>('inspecciones')

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
    const [operadoresData, centrosData] = await Promise.all([
      obtenerAnalisisOperadores(dias),
      obtenerAnalisisCentroCosto(dias)
    ])

    setOperadores(operadoresData)
    setCentrosCosto(centrosData)
    setLoading(false)
  }

  // Ordenar operadores
  const operadoresOrdenados = [...operadores].sort((a, b) => {
    switch (ordenamiento) {
      case 'inspecciones':
        return b.total_inspecciones - a.total_inspecciones
      case 'score':
        return b.score_promedio - a.score_promedio
      case 'problemas':
        return a.porcentaje_problemas - b.porcentaje_problemas
      default:
        return 0
    }
  })

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
              <h1 className="text-2xl font-bold text-gray-900">Análisis de Operadores</h1>
              <p className="text-sm text-gray-600">Performance y datos de identificación</p>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-3">
              <select
                value={dias}
                onChange={(e) => {
                  setDias(parseInt(e.target.value))
                  setTimeout(() => cargarDatos(), 100)
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="30">Últimos 30 días</option>
                <option value="60">Últimos 60 días</option>
                <option value="90">Últimos 90 días</option>
                <option value="180">Últimos 6 meses</option>
              </select>

              <select
                value={ordenamiento}
                onChange={(e) => setOrdenamiento(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="inspecciones">Más Inspecciones</option>
                <option value="score">Mejor Score</option>
                <option value="problemas">Menos Problemas</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Operadores</p>
                <p className="text-2xl font-bold text-gray-900">{operadores.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Score Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {operadores.length > 0 
                    ? (operadores.reduce((sum, op) => sum + op.score_promedio, 0) / operadores.length).toFixed(1)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Inspecciones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {operadores.reduce((sum, op) => sum + op.total_inspecciones, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Centros de Costo</p>
                <p className="text-2xl font-bold text-gray-900">{centrosCosto.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Análisis por Centro de Costo */}
        {centrosCosto.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">Performance por Centro de Costo</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Centro Costo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operadores</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspecciones</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Con Problemas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Problemas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score Promedio</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {centrosCosto.map((centro) => (
                    <tr key={centro.centro_costo}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {centro.centro_costo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {centro.total_operadores}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {centro.total_inspecciones}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {centro.inspecciones_con_problemas}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-semibold ${
                          centro.porcentaje_problemas < 10 ? 'text-green-600' :
                          centro.porcentaje_problemas < 20 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {centro.porcentaje_problemas}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {centro.score_promedio}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabla Detallada de Operadores */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Ranking de Operadores</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Centro Costo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspecciones</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Problemas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última Inspección</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {operadoresOrdenados.map((operador, index) => {
                  const antiguedad = operador.fecha_ingreso 
                    ? Math.floor((Date.now() - new Date(operador.fecha_ingreso).getTime()) / (1000 * 60 * 60 * 24 * 365))
                    : null

                  return (
                    <tr key={operador.usuario_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {operador.nombre_completo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {operador.rut || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {operador.centro_costo || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {operador.total_inspecciones}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-semibold ${
                          operador.score_promedio >= 95 ? 'text-green-600' :
                          operador.score_promedio >= 85 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {operador.score_promedio}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-semibold ${
                          operador.porcentaje_problemas < 10 ? 'text-green-600' :
                          operador.porcentaje_problemas < 20 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {operador.porcentaje_problemas}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {operador.dias_desde_ultima === 0 
                          ? 'Hoy'
                          : `Hace ${Math.floor(operador.dias_desde_ultima)} días`
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}