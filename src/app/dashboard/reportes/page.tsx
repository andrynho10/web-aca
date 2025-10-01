'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Forklift,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { obtenerReportesConFiltros } from '@/lib/reportes-service'
import { obtenerActivos } from '@/lib/activos-service'
import { Activo, supabase } from '@/lib/supabase'

export default function ReportesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reportes, setReportes] = useState<any[]>([])
  const [activos, setActivos] = useState<Activo[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  
  // Filtros
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [activoSeleccionado, setActivoSeleccionado] = useState<number | undefined>()
  const [operadorSeleccionado, setOperadorSeleccionado] = useState<string | undefined>()
  const [soloProblemas, setSoloProblemas] = useState(false)
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<number | undefined>()
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  async function checkAuthAndLoad() {
    const user = await getCurrentUser()
    
    if (!user || user.rol !== 'SUPERVISOR') {
      router.push('/login')
      return
    }

    await Promise.all([
      cargarReportes(),
      cargarActivos(),
      cargarUsuarios()
    ])
    
    setLoading(false)
  }

  async function cargarReportes() {
    let data = await obtenerReportesConFiltros(
      fechaDesde || undefined,
      fechaHasta || undefined,
      activoSeleccionado,
      soloProblemas
    )
    
    // Filtrar por operador si está seleccionado
    if (operadorSeleccionado) {
      data = data.filter(r => r.usuario_id === operadorSeleccionado)
    }
    
    // Filtrar por turno localmente si está seleccionado
    if (turnoSeleccionado) {
      data = data.filter(r => r.turno === turnoSeleccionado)
    }
    
    setReportes(data)
  }

  async function cargarActivos() {
    const data = await obtenerActivos()
    setActivos(data)
  }

  async function cargarUsuarios() {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre_completo, rol')
        .eq('rol', 'OPERADOR')
        .order('nombre_completo', { ascending: true })
      
      if (error) throw error
      setUsuarios(data || [])
    } catch (error) {
      console.error('Error cargando usuarios:', error)
    }
  }

  async function aplicarFiltros() {
    setLoading(true)
    await cargarReportes()
    setLoading(false)
  }

  function limpiarFiltros() {
    setFechaDesde('')
    setFechaHasta('')
    setActivoSeleccionado(undefined)
    setOperadorSeleccionado(undefined)
    setTurnoSeleccionado(undefined)
    setSoloProblemas(false)
    setBusqueda('')
  }

  // Filtrar por búsqueda local
  const reportesFiltrados = reportes.filter(reporte => {
    if (!busqueda) return true
    
    const searchLower = busqueda.toLowerCase()
    return (
      reporte.activo?.nombre?.toLowerCase().includes(searchLower) ||
      reporte.usuario?.nombre_completo?.toLowerCase().includes(searchLower) ||
      reporte.id.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reportes...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Lista de Reportes</h1>
              <p className="text-sm text-gray-600">{reportesFiltrados.length} reportes encontrados</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Búsqueda
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Grúa, operador, ID..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Fecha Desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Fecha Hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Grúa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grúa
              </label>
              <select
                value={activoSeleccionado || ''}
                onChange={(e) => setActivoSeleccionado(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas</option>
                {activos.map(activo => (
                  <option key={activo.id} value={activo.id}>
                    {activo.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Segunda fila: Turno y Operador */}
          <div className="flex gap-4">
            {/* Turno */}
            <div className="w-70">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turno
              </label>
              <select
                value={turnoSeleccionado || ''}
                onChange={(e) => setTurnoSeleccionado(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="1">Turno 1 (Noche)</option>
                <option value="2">Turno 2 (Mañana)</option>
                <option value="3">Turno 3 (Tarde)</option>
              </select>
            </div>

            {/* Operador */}
            <div className="w-72">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operador
              </label>
              <select
                value={operadorSeleccionado || ''}
                onChange={(e) => setOperadorSeleccionado(e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre_completo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Solo con problemas */}
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="soloProblemas"
              checked={soloProblemas}
              onChange={(e) => setSoloProblemas(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="soloProblemas" className="ml-2 text-sm text-gray-700">
              Solo mostrar reportes con problemas
            </label>
          </div>

          {/* Botones */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={aplicarFiltros}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={() => {
                limpiarFiltros()
                aplicarFiltros()
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Lista de Reportes */}
        <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {reportesFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron reportes con los filtros aplicados</p>
            </div>
          ) : (
            reportesFiltrados.map((reporte) => {
              const fecha = new Date(reporte.timestamp_completado).toLocaleString('es-CL', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })

              return (
                <button
                  key={reporte.id}
                  onClick={() => router.push(`/dashboard/reportes/${reporte.id}`)}
                  className="w-full p-6 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Icono Estado */}
                      <div className={`rounded-full p-3 ${
                        reporte.tiene_problemas ? 'bg-red-50' : 'bg-green-50'
                      }`}>
                        {reporte.tiene_problemas ? (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>

                      {/* Info Principal */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {reporte.activo?.nombre || 'Grúa Desconocida'}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            reporte.tiene_problemas 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            Score: {reporte.score_cumplimiento}%
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {reporte.usuario?.nombre_completo || 'Operador Desconocido'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {fecha}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {reporte.duracion_minutos} min
                          </span>
                          {reporte.turno && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                              Turno {reporte.turno}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500">Items</p>
                        <p className="font-semibold text-gray-900">{reporte.total_respuestas}</p>
                      </div>
                      {reporte.respuestas_malas > 0 && (
                        <div className="text-center">
                          <p className="text-gray-500">Problemas</p>
                          <p className="font-semibold text-red-600">{reporte.respuestas_malas}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}