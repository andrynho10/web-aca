import jsPDF from 'jspdf'
import { formatearFechaExcel } from './export-utils'
import { ReporteDetalle } from './reportes-service'

/**
 * Calcula la antigüedad en años y meses desde una fecha de ingreso
 */
function calcularAntiguedadOperador(fechaIngreso: string): string {
  const fecha = new Date(fechaIngreso)

  if (isNaN(fecha.getTime())) return '-'

  const ahora = new Date()
  const diffMs = ahora.getTime() - fecha.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)

  if (years === 0 && months === 0) return 'Menos de 1 mes'
  if (years === 0) return `${months} ${months === 1 ? 'mes' : 'meses'}`
  if (months === 0) return `${years} ${years === 1 ? 'año' : 'años'}`

  return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`
}

/**
 * Convierte una URL de imagen a base64
 */
async function imagenUrlABase64(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remover el prefijo data:image/...;base64,
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error convirtiendo imagen a base64:', error)
    throw error
  }
}

/**
 * Función para agregar texto con salto de línea automático
 */
function agregarTextoConSalto(
  pdf: jsPDF,
  texto: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 7
): number {
  const lines = pdf.splitTextToSize(texto, maxWidth)
  pdf.text(lines, x, y)
  return y + (lines.length * lineHeight)
}

/**
 * Exporta un reporte enfocado en preguntas incorrectas con fotos incrustadas en PDF
 */
export async function exportarReporteConFotos(reporte: ReporteDetalle): Promise<void> {
  if (!reporte) {
    alert('No hay reporte para exportar')
    return
  }

  try {
    // Crear documento PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - 2 * margin
    let yPosition = margin

    // Función para agregar nueva página si es necesario
    const agregarPaginaSiNecesario = (espacioRequerido: number) => {
      if (yPosition + espacioRequerido > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }
    }

    // Filtrar solo respuestas incorrectas (MALAS)
    const respuestasIncorrectas = reporte.respuestas.filter(resp => !resp.respuesta)
    const respuestasConFotos = respuestasIncorrectas.filter(resp => resp.fotos && resp.fotos.length > 0)

    // === PORTADA ===
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('REPORTE DE INSPECCIÓN', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Grúa: ${reporte.activo.nombre}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    pdf.text(`Fecha: ${formatearFechaExcel(reporte.timestamp_completado)}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('DATOS DEL OPERADOR', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')

    // Calcular antigüedad
    const antiguedad = reporte.usuario.fecha_ingreso ? calcularAntiguedadOperador(reporte.usuario.fecha_ingreso) : '-'

    pdf.text(`${reporte.usuario.nombre_completo}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 8
    pdf.text(`RUT: ${reporte.usuario.rut || '-'}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 8
    pdf.text(`Cargo: ${reporte.usuario.cargo || '-'}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 8
    pdf.text(`Centro de Costo: ${reporte.usuario.centro_costo || '-'}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 8
    pdf.text(`Fecha Ingreso: ${reporte.usuario.fecha_ingreso || '-'}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 8
    pdf.text(`Antigüedad: ${antiguedad}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20

    // === ESTADÍSTICAS SIMPLES ===
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('ESTADÍSTICAS', margin, yPosition)
    yPosition += 10

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')

    const totalPreguntas = reporte.total_respuestas
    const totalMalas = reporte.respuestas_malas
    const totalBuenas = totalPreguntas - totalMalas

    pdf.text(`Total de preguntas: ${totalPreguntas}`, margin, yPosition)
    yPosition += 8
    pdf.text(`Preguntas incorrectas: ${totalMalas} de ${totalPreguntas}`, margin, yPosition)
    yPosition += 8
    pdf.text(`Preguntas incorrectas con fotos: ${respuestasConFotos.length}`, margin, yPosition)
    yPosition += 15

    // === LISTA DE TODAS LAS PREGUNTAS INCORRECTAS ===
    agregarPaginaSiNecesario(20)

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`RESPUESTAS MALO (${respuestasIncorrectas.length} de ${totalPreguntas})`, margin, yPosition)
    yPosition += 15

    // Listar todas las preguntas incorrectas primero
    if (respuestasIncorrectas.length > 0) {
      for (let index = 0; index < respuestasIncorrectas.length; index++) {
        const respuesta = respuestasIncorrectas[index]
        agregarPaginaSiNecesario(25)

        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${index + 1}. Pregunta:`, margin, yPosition)
        yPosition += 10

        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')

        // Texto de la pregunta
        yPosition = agregarTextoConSalto(
          pdf,
          respuesta.pregunta.texto,
          margin + 5,
          yPosition,
          contentWidth - 5
        )

        // Comentario si existe
        if (respuesta.comentario) {
          yPosition += 5
          yPosition = agregarTextoConSalto(
            pdf,
            `Comentario: ${respuesta.comentario}`,
            margin + 5,
            yPosition,
            contentWidth - 5
          )
        }

        // Indicar si tiene fotos
        if (respuesta.fotos && respuesta.fotos.length > 0) {
          yPosition += 5
          pdf.setFont('helvetica', 'bold')
          pdf.text(`${respuesta.fotos.length} foto(s) adjunta(s)`, margin + 5, yPosition)
          yPosition += 8
        }

        yPosition += 5
      }
    } else {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text('No hay preguntas incorrectas en este reporte', margin, yPosition)
      yPosition += 15
    }

    // === SECCIÓN DE FOTOS (SOLO SI HAY) ===
    if (respuestasConFotos.length > 0) {
      agregarPaginaSiNecesario(30)

      pdf.addPage()
      yPosition = margin

      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('FOTOS DE PREGUNTAS INCORRECTAS', margin, yPosition)
      yPosition += 15

      // Procesar cada respuesta con fotos
      for (let index = 0; index < respuestasConFotos.length; index++) {
        const respuesta = respuestasConFotos[index]
        agregarPaginaSiNecesario(60)

        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        yPosition = agregarTextoConSalto(
          pdf,
          `${index + 1}. Pregunta: ${respuesta.pregunta.texto}`,
          margin,
          yPosition,
          contentWidth
        )

        if (respuesta.comentario) {
          yPosition += 5
          pdf.setFont('helvetica', 'normal')
          yPosition = agregarTextoConSalto(
            pdf,
            `Comentario: ${respuesta.comentario}`,
            margin,
            yPosition,
            contentWidth
          )
        }

        yPosition += 10

        // Agregar fotos en grid
        for (let fotoIndex = 0; fotoIndex < respuesta.fotos.length; fotoIndex++) {
          const foto = respuesta.fotos[fotoIndex]
          try {
            agregarPaginaSiNecesario(80)

            // Descargar y convertir imagen
            const imagenBase64 = await imagenUrlABase64(foto.url_storage)

            // Posición: 2 columnas
            const imagenWidth = 80
            const imagenHeight = 60
            const imagenX = margin + (fotoIndex % 2 === 0 ? 0 : contentWidth - imagenWidth)

            pdf.setFont('helvetica', 'normal')
            pdf.text(`Foto ${fotoIndex + 1}:`, imagenX, yPosition)
            yPosition += 5

            pdf.addImage(
              `data:image/jpeg;base64,${imagenBase64}`,
              'JPEG',
              imagenX,
              yPosition,
              imagenWidth,
              imagenHeight
            )

            yPosition += imagenHeight + 10

            // Salto de línea después de la segunda columna
            if (fotoIndex % 2 === 1) {
              yPosition += 10
            }
          } catch (error) {
            console.error(`Error procesando foto ${fotoIndex + 1}:`, error)
            pdf.setFont('helvetica', 'normal')
            pdf.text(`Error al cargar foto ${fotoIndex + 1}`, margin, yPosition)
            yPosition += 10
          }
        }

        yPosition += 15
      }
    }

    // === PIE DE PÁGINA ===
    // Obtenemos el número total de páginas accediendo a la información interna
    const totalPages = (pdf.internal as any).pages?.length - 1 || 1
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
      pdf.text(
        `Generado el ${formatearFechaExcel(new Date())}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      )
    }

    // Guardar el PDF
    const ahora = new Date()
    const fecha = ahora.toISOString().split('T')[0].replace(/-/g, '')
    const hora = ahora.toTimeString().split(' ')[0].replace(/:/g, '')
    const nombreArchivo = `reporte_${reporte.activo.nombre}_con_fotos_${reporte.id.substring(0, 8)}_${fecha}_${hora}.pdf`
    pdf.save(nombreArchivo)

  } catch (error) {
    console.error('Error generando PDF:', error)
    alert('Error al generar el PDF. Por favor, intente nuevamente.')
  }
}