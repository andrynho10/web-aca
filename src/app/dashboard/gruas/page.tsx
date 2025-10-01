'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, Power, PowerOff, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { obtenerActivos, cambiarEstadoActivo } from '@/lib/activos-service'
import { Activo } from '@/lib/supabase'

export default function GruasPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [usuario, setUsuario] = useState<any>(null)
  const [activos, setActivos] = useState<Activo[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [selectedActivo, setSelectedActivo] = useState<Activo | null>(null)
  const [motivo, setMotivo] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

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
    const data = await obtenerActivos()
    setActivos(data)
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

  const activasCount = activos.filter(a => a.es_operativa).length
  const inactivasCount = activos.filter(a => !a.es_operativa).length

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-50 rounded-full p-3">
                <Truck className="w-6 h-6 text-blue-600" />
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
        </div>

        {/* Lista de Grúas */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Lista de Grúas</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {activos.map((activo) => (
              <div key={activo.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`rounded-full p-3 ${
                      activo.es_operativa ? 'bg-green-50' : 'bg-gray-100'
                    }`}>
                      <Truck className={`w-6 h-6 ${
                        activo.es_operativa ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {activo.nombre}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">
                          Modelo: {activo.modelo}
                        </span>
                        <span className="text-sm text-gray-500">
                          Tipo: {activo.tipo}
                        </span>
                        {activo.horometro_actual !== null && (
                          <span className="text-sm text-gray-500">
                            Horómetro: {activo.horometro_actual}h
                          </span>
                        )}
                      </div>
                      
                      {/* Estado Badge */}
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          activo.es_operativa 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
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
                          <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Standby
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botón de Acción */}
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
            ))}
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