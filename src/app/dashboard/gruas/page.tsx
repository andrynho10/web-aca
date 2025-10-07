'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Forklift, Power, PowerOff, Clock, AlertCircle, CheckCircle, Timer, BarChart3 } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { 
  obtenerActivos, 
  cambiarEstadoActivo, 
  obtenerAgregadosDiariosActivos,
  construirResumenUsoActivos,
  ResumenUsoActivo
} from '@/lib/activos-service'
import { Activo } from '@/lib/supabase'

export default function GruasPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [usuario, setUsuario] = useState<any>(null)
  const [activos, setActivos] = useState<Activo[]>([])
  const [resumenUso, setResumenUso] = useState<ResumenUsoActivo[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [selectedActivo, setSelectedActivo] = useState<Activo | null>(null)
  const [motivo, setMotivo] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const resumenPorActivo = useMemo(() => {
    const map = new Map<number, ResumenUsoActivo>()
    resumenUso.forEach((item) => {
      map.set(item.activoId, item)
    })
    return map
  }, [resumenUso])

  const totalesUso = useMemo(() => {
    return resumenUso.reduce(
      (acc, item) => {
        acc.horasUso7 += item.horasUso7
        acc.horasUso30 += item.horasUso30
        acc.problemas30 += item.problemas30
        acc.horometrosPendientes += item.horometrosPendientes
        return acc
      },
      { horasUso7: 0, horasUso30: 0, problemas30: 0, horometrosPendientes: 0 }
    )
  }, [resumenUso])

  const formatHoras = (valor: number) =>
    valor > 0
      ? valor.toLocaleString('es-CL', { minimumFractionDigits: 1 })
      : '0'

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
    await cargarActivos()
    setLoading(false)
  }

  async function cargarActivos() {
    const [activosData, agregadosData] = await Promise.all([
      obtenerActivos(),
      obtenerAgregadosDiariosActivos(30)
    ])

    setActivos(activosData)
    setResumenUso(construirResumenUsoActivos(agregadosData))
  }

  async function handleCambiarEstado(activo: Activo, nuevoEstado: boolean) {
    setSelectedActivo(activo)
    setShowDialog(true)
  }

  async function confirmarCambio() {
    if (!selectedActivo || !usuario) return

    setActionLoading(true)
    const result = await cambiarEstadoActivo(
      selectedActivo.id,
      !selectedActivo.es_operativa,
      usuario.id,
      motivo || undefined
    )

    if (result.success) {
      await cargarActivos()
      setShowDialog(false)
      setMotivo('')
      setSelectedActivo(null)
    } else {
      alert('Error al cambiar estado: ' + result.error)
    }

    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando grúas...</p>
        </div>
      </div>
    )
  }

  const activasCount = activos.filter((a) => a.es_operativa).length
  const inactivasCount = activos.filter((a) => !a.es_operativa).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Grúas</h1>
              <p className="text-sm text-gray-600">
                {activasCount} operativas | {inactivasCount} inactivas
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-50 rounded-full p-3">
                <Forklift className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Grúas</p>
                <p className="text-2xl font-bold text-gray-900">{activos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-50 rounded-full p-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Operativas</p>
                <p className="text-2xl font-bold text-green-600">{activasCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-red-50 rounded-full p-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Inactivas</p>
                <p className="text-2xl font-bold text-red-600">{inactivasCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-50 rounded-full p-3">
                <Timer className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Horas de uso (30 días)</p>
                <p className="text-2xl font-bold text-gray-900">{formatHoras(totalesUso.horasUso30)} h</p>
                <p className="text-xs text-gray-500 mt-1">timos 7 días: {formatHoras(totalesUso.horasUso7)} h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-50 rounded-full p-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Horómetros pendientes</p>
                <p className="text-2xl font-bold text-purple-600">{totalesUso.horometrosPendientes}</p>
                <p className="text-xs text-gray-500 mt-1">Problemas detectados 30d: {totalesUso.problemas30}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Grúas */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Lista de Grúas</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {activos.map((activo) => {
              const resumen = resumenPorActivo.get(activo.id)
              const horasUso7 = resumen?.horasUso7 ?? 0
              const horasUso30 = resumen?.horasUso30 ?? 0
              const inspecciones30 = resumen?.inspecciones30 ?? 0
              const problemas30 = resumen?.problemas30 ?? 0
              const horometrosPend = resumen?.horometrosPendientes ?? 0

              return (
                <div key={activo.id} className="p-6 hover:bg-gray-50">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-full p-3 ${
                        activo.es_operativa ? 'bg-green-50' : 'bg-gray-100'
                      }`}>
                        <Forklift className={`w-6 h-6 ${
                          activo.es_operativa ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{activo.nombre}</h3>
                        <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                          <span>Modelo: {activo.modelo}</span>
                          <span>Tipo: {activo.tipo}</span>
                          {activo.horometro_actual !== null && (
                            <span>Horómetro: {activo.horometro_actual}h</span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            activo.es_operativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {activo.es_operativa ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Operativa
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Fuera de Servicio
                              </>
                            )}
                          </span>

                          {activo.es_standby && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Standby
                            </span>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Horas uso 7d</p>
                            <p className="font-semibold text-gray-900">{formatHoras(horasUso7)} h</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Horas uso 30d</p>
                            <p className="font-semibold text-gray-900">{formatHoras(horasUso30)} h</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Inspecciones 30d</p>
                            <p className="font-semibold text-gray-900">{inspecciones30}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Problemas 30d</p>
                            <p className={`font-semibold ${problemas30 > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                              {problemas30}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Horómetros pendientes</p>
                            <p className={`font-semibold ${horometrosPend > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                              {horometrosPend}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCambiarEstado(activo, !activo.es_operativa)}
                      className={`flex items-center px-4 py-2 rounded-md font-medium ${
                        activo.es_operativa
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {activo.es_operativa ? (
                        <>
                          <PowerOff className="w-4 h-4 mr-2" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-2" />
                          Activar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* Dialog de Confirmación */}
      {showDialog && selectedActivo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedActivo.es_operativa ? 'Desactivar' : 'Activar'} Grúa
            </h3>
            
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que quieres {selectedActivo.es_operativa ? 'desactivar' : 'activar'} la grúa <strong>{selectedActivo.nombre}</strong>?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo (opcional)
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ej: Mantenimiento programado, falla mecánica, etc."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDialog(false)
                  setMotivo('')
                  setSelectedActivo(null)
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCambio}
                disabled={actionLoading}
                className={`flex-1 px-4 py-2 rounded-md text-white font-medium disabled:opacity-50 ${
                  selectedActivo.es_operativa
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionLoading ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}







