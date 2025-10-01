'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Forklift,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Image as ImageIcon,
  Timer
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { obtenerReporteDetalle, ReporteDetalle } from '@/lib/reportes-service'

export default function ReporteDetallePage() {
  const router = useRouter()
  const params = useParams()
  const reporteId = params.id as string

  const [loading, setLoading] = useState(true)
  const [reporte, setReporte] = useState<ReporteDetalle | null>(null)
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndLoad()
  }, [reporteId])

  async function checkAuthAndLoad() {
    const user = await getCurrentUser()
    
    if (!user || user.rol !== 'SUPERVISOR') {
      router.push('/login')
      return
    }

    await cargarReporte()
    setLoading(false)
  }

  async function cargarReporte() {
    const data = await obtenerReporteDetalle(reporteId)
    setReporte(data)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reporte...</p>
        </div>
      </div>
    )
  }

  if (!reporte) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reporte no encontrado</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  const fecha = new Date(reporte.timestamp_completado).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Agrupar respuestas por categoría
  const respuestasPorCategoria = reporte.respuestas.reduce((acc, resp) => {
    const categoria = resp.pregunta.categoria.nombre
    if (!acc[categoria]) {
      acc[categoria] = []
    }
    acc[categoria].push(resp)
    return acc
  }, {} as Record<string, typeof reporte.respuestas>)

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
          <h1 className="text-2xl font-bold text-gray-900">Detalle de Inspección</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información General */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Información General</h2>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                reporte.tiene_problemas 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {reporte.tiene_problemas ? (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Con Problemas
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Sin Problemas
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Forklift className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Grúa</p>
                <p className="font-semibold text-gray-900">{reporte.activo.nombre}</p>
                <p className="text-sm text-gray-500">{reporte.activo.modelo}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Operador</p>
                <p className="font-semibold text-gray-900">{reporte.usuario.nombre_completo}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Fecha y Hora</p>
                <p className="font-semibold text-gray-900">{fecha}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Timer className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Duración</p>
                <p className="font-semibold text-gray-900">{reporte.duracion_minutos} minutos</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Turno</p>
                <p className="font-semibold text-gray-900">
                  {reporte.turno ? `Turno ${reporte.turno}` : 'No especificado'}
                </p>
              </div>
            </div>

            {reporte.horometro_inicial !== null && (
              <div className="flex items-start space-x-3">
                <Timer className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Horómetro</p>
                  <p className="font-semibold text-gray-900">
                    Inicial: {reporte.horometro_inicial}h
                  </p>
                  {reporte.horometro_final && (
                    <p className="text-sm text-gray-500">
                      Final: {reporte.horometro_final}h ({reporte.horas_uso}h uso)
                    </p>
                  )}
                  {reporte.horometro_pendiente && (
                    <span className="inline-block mt-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                      Pendiente de cierre
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Resultado</h3>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{reporte.score_cumplimiento}%</p>
              <p className="text-sm text-gray-500">Score de Cumplimiento</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{reporte.total_respuestas}</p>
              <p className="text-sm text-gray-500">Total Items</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {reporte.total_respuestas - reporte.respuestas_malas}
              </p>
              <p className="text-sm text-green-600">Buenos</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{reporte.respuestas_malas}</p>
              <p className="text-sm text-red-600">Malos</p>
            </div>
          </div>
        </div>

        {/* Respuestas por Categoría */}
        <div className="space-y-6">
          {Object.entries(respuestasPorCategoria).map(([categoria, respuestas]) => (
            <div key={categoria} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{categoria}</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {respuestas
                  .sort((a, b) => a.pregunta.orden - b.pregunta.orden)
                  .map((resp) => (
                    <div key={resp.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium mb-2">{resp.pregunta.texto}</p>
                          
                          {resp.comentario && (
                            <div className="mt-2 flex items-start space-x-2 text-sm">
                              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <p className="text-gray-600 italic">{resp.comentario}</p>
                            </div>
                          )}

                          {resp.fotos && resp.fotos.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {resp.fotos.map((foto, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setImagenAmpliada(foto.url_storage)}
                                  className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
                                >
                                  <img
                                    src={foto.url_storage}
                                    alt={`Foto ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center transition-opacity">
                                    <ImageIcon className="w-5 h-5 text-white opacity-0 hover:opacity-100" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <span className={`ml-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${
                          resp.respuesta 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {resp.respuesta ? 'BUENO' : 'MALO'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal de Imagen Ampliada */}
      {imagenAmpliada && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setImagenAmpliada(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-xl font-bold hover:text-gray-300"
            onClick={() => setImagenAmpliada(null)}
          >
            ✕
          </button>
          <img
            src={imagenAmpliada}
            alt="Imagen ampliada"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  )
}