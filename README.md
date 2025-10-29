# webaca - Dashboard Web de Gestión de Inspecciones

<div align="center">

**Panel de Control en Tiempo Real para Supervisor**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC.svg)](https://tailwindcss.com/)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Capturas de Pantalla](#capturas-de-pantalla)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Rutas y Páginas](#rutas-y-páginas)
- [Servicios](#servicios)
- [Desarrollo](#desarrollo)
- [Build y Deployment](#build-y-deployment)
- [Exportación de Datos](#exportación-de-datos)
- [Troubleshooting](#troubleshooting)
- [Contribuir](#contribuir)
- [Sistema Completo](#sistema-completo)

---

## 🖥️ Descripción

**webaca** es el dashboard web del **Sistema de Gestión de Inspección de Grúas Horquilla**. Proporciona a los supervisores una interfaz completa para visualizar, analizar y exportar datos de inspecciones en tiempo real.

Este dashboard consume datos de Supabase y se actualiza automáticamente mediante subscripciones Realtime, permitiendo a los supervisores monitorear las inspecciones a medida que ocurren.

### Componentes del Sistema

webaca es parte de un sistema completo que incluye:
- **[AppACA](../AppACA)**: Aplicación móvil para operadores
- **webaca** (este repositorio): Dashboard web para supervisores
- **Supabase Backend**: Base de datos, autenticación, storage y edge functions

---

## ✨ Características

### 🔐 Autenticación
- Login exclusivo para usuarios con rol **SUPERVISOR**
- Validación automática de permisos
- Sesión persistente con cookies seguras
- Redirección automática si no está autenticado

### 📊 Dashboard Principal en Tiempo Real
- **KPIs Dinámicos:**
  - Total de reportes del día
  - Reportes con problemas detectados
  - Actualización automática cada 2 minutos

- **Gráfico de Tendencia (30 días):**
  - Score promedio de cumplimiento
  - Porcentaje de inspecciones con problemas
  - Total de inspecciones realizadas
  - Visualización interactiva con Recharts

- **Top 10 Grúas Problemáticas:**
  - Ranking por porcentaje de problemas
  - Score promedio por grúa
  - Identificación rápida de activos críticos

- **Top 20 Grúas por Uso:**
  - Horas de uso últimos 30 días
  - Horas de uso últimos 7 días
  - Comparativa de utilización

- **Análisis por Turno:**
  - Score promedio por turno (1, 2, 3)
  - % de inspecciones con problemas
  - Total de horas de uso por turno

- **Top 10 Problemas Detectados:**
  - Ítems de checklist más fallados
  - % de ocurrencia de cada problema
  - Tendencia de problemas críticos

- **Sidebar "EN VIVO":**
  - Últimas 5 inspecciones en tiempo real
  - Badge "NUEVO" para reportes recientes
  - Actualización automática con Supabase Realtime

### 🏗️ Gestión de Grúas
- Listado completo de activos
- CRUD de grúas (Crear, Leer, Actualizar, Eliminar)
- Cambio de estado (operativa/inactiva/standby)
- Visualización de historial de cambios
- Tiempo transcurrido desde desactivación
- Generación de códigos QR para grúas

### 📋 Análisis de Reportes
- **Filtros Avanzados:**
  - Rango de fechas personalizado
  - Filtro por grúa específica
  - Filtro por operador
  - Solo reportes con problemas
  - Filtro por turno (1, 2, 3)

- **Vista de Detalle:**
  - Información completa del reporte
  - Datos del operador (nombre, RUT, cargo, antigüedad)
  - Estadísticas (score, problemas, duración)
  - Lista de respuestas MALO con comentarios
  - Lista de respuestas BUENO
  - Galería de fotos con zoom
  - Información de horómetro (inicial, final, horas de uso)

- **Exportación:**
  - **Excel** con 6 hojas (Reportes, KPIs, Grúas, Problemas, Operadores, Horómetros)
  - **CSV** de reportes
  - **PDF** individual por reporte
  - Últimos 90 días de datos

### 🗺️ Heatmap de Problemas
- Mapa de calor visual por grúa
- Identificación de zonas de riesgo
- Análisis temporal (últimos 30 días)
- Gradiente de colores según criticidad

### ⏱️ Análisis de Horómetros
- **Correlación Horas-Problemas:**
  - Relación entre horas de uso y problemas detectados
  - Gráfico de dispersión interactivo

- **Eficiencia de Utilización:**
  - % de horómetros completados vs omitidos
  - Tabla de eficiencia por grúa

- **Estado Actual:**
  - Horómetros pendientes de cierre
  - Horas omitidas por activo
  - Alertas de horómetros sin completar

- **Operadores con Horómetros Pendientes:**
  - Lista de operadores con cierres pendientes
  - Cantidad de horómetros por cerrar

- **Resumen por Activo:**
  - Total de horas de uso
  - Horas omitidas
  - % de completitud
  - Función de recálculo de horas omitidas

### 👥 Panel de Operadores
- Rendimiento individual de cada operador
- Score promedio de cumplimiento
- Total de inspecciones realizadas
- Duración promedio de inspecciones
- Última inspección realizada
- Ranking de operadores

### ⚠️ Problemas Críticos
- Listado de ítems de checklist más fallados
- % de ocurrencia de cada problema
- Grúas más afectadas por problema
- Tendencia histórica
- Priorización por criticidad

### 🔄 Sistema de Actualización en Tiempo Real
- Subscripción a tabla `reportes_inspeccion` con Supabase Realtime
- Actualización automática en INSERT/UPDATE
- Polling de respaldo cada 2 minutos
- Indicadores visuales de actualización
- Notificaciones de nuevos reportes

---

## 📸 Capturas de Pantalla

<div align="center">
<table>
  <tr>
    <td><b>Login</b></td>
    <td><b>Dashboard</b></td>
    <td><b>Gráficos</b></td>
  </tr>
  <tr>
    <td><i>Autenticación supervisores</i></td>
    <td><i>KPIs en tiempo real</i></td>
    <td><i>Tendencias y análisis</i></td>
  </tr>
  <tr>
    <td><b>Reportes</b></td>
    <td><b>Detalle</b></td>
    <td><b>Heatmap</b></td>
  </tr>
  <tr>
    <td><i>Lista de inspecciones</i></td>
    <td><i>Vista completa</i></td>
    <td><i>Mapa de calor</i></td>
  </tr>
</table>
</div>

---

## 📋 Requisitos

### Requisitos del Sistema

- **Navegador:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Resolución:** Mínimo 1280x720 (recomendado 1920x1080)
- **Conexión:** Estable a internet (para Realtime)

### Requisitos de Desarrollo

- **Node.js:** 20.x o superior
- **npm:** 10.x o superior (o pnpm 8.x)
- **Git:** Para control de versiones
- **Editor:** VS Code recomendado

### Dependencias del Backend

- **Cuenta de Supabase:** Para base de datos, auth y realtime
- **Resend Account:** Para envío de emails (Edge Functions)

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/yourorg/webaca.git
cd webaca
```

### 2. Instalar Dependencias

```bash
# Usando npm
npm install

# O usando pnpm (más rápido)
pnpm install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> ⚠️ **IMPORTANTE:** Nunca commitear `.env.local` al repositorio. Este archivo ya está en `.gitignore`.

Copiar desde ejemplo:
```bash
cp .env.example .env.local
# Editar con tus credenciales
```

### 4. Ejecutar en Modo Desarrollo

```bash
npm run dev
# o
pnpm dev
```

Dashboard disponible en: **http://localhost:3000**

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# .env.local

# Supabase (requerido)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Opcional: Para analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Next.js Config

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['your-project.supabase.co'], // Para imágenes de Storage
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Para upload de archivos
    },
  },
}

export default nextConfig
```

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados del sistema
      },
    },
  },
  plugins: [],
}
```

---

## 🏗️ Arquitectura

### Arquitectura Next.js App Router

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA WEBACA                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│   Client Browser    │
│   (React 19)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Next.js 15        │
│   (App Router)      │
│                     │
│  - Server Components│
│  - Client Components│
│  - API Routes       │
│  - Middleware       │
└──────────┬──────────┘
           │
           ├──────────────┬──────────────┐
           ▼              ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Pages/Routes │  │ Components   │  │ Services     │
│              │  │              │  │              │
│ - Dashboard  │  │ - KPICard    │  │ - dashboard- │
│ - Reportes   │  │ - Charts     │  │   service    │
│ - Grúas      │  │ - Tables     │  │ - reportes-  │
│ - etc.       │  │ - Forms      │  │   service    │
│              │  │              │  │ - activos-   │
│              │  │              │  │   service    │
└──────────────┘  └──────────────┘  └──────┬───────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │  Supabase       │
                                  │                 │
                                  │ - PostgreSQL    │
                                  │ - Auth          │
                                  │ - Realtime      │
                                  │ - Storage       │
                                  └─────────────────┘
```

### Patrón de Diseño

- **Server Components**: Para datos estáticos y SEO
- **Client Components**: Para interactividad y estado
- **Services Layer**: Abstracción de lógica de negocio
- **Supabase Client**: Cliente singleton para DB

---

## 🛠️ Tecnologías

### Core

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 15.5.4 | Framework React con SSR |
| React | 19.1.0 | Librería UI |
| TypeScript | 5 | Tipado estático |

### Estilos y UI

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Tailwind CSS | 4 | Framework CSS utilitario |
| Lucide React | 0.544.0 | Iconografía |
| clsx | 2.1.1 | Utilidad para clases CSS |
| tailwind-merge | 3.3.1 | Merge de clases Tailwind |

### Backend y Datos

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Supabase JS | 2.58.0 | Cliente Supabase |
| @supabase/ssr | 0.7.0 | SSR para Supabase |

### Gráficos y Visualización

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Recharts | 3.2.1 | Gráficos interactivos |
| html2canvas | 1.4.1 | Captura de gráficos |

### Exportación

| Tecnología | Versión | Uso |
|------------|---------|-----|
| jsPDF | 3.0.3 | Generación de PDFs |
| xlsx | (integrado) | Exportación Excel |

---

## 📁 Estructura del Proyecto

```
webaca/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Layout principal
│   │   ├── page.tsx                      # Redirect a /dashboard
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx                 # Página de login
│   │   │
│   │   └── dashboard/
│   │       ├── page.tsx                 # Dashboard principal (1175 líneas)
│   │       │
│   │       ├── gruas/
│   │       │   └── page.tsx            # Gestión de grúas
│   │       │
│   │       ├── reportes/
│   │       │   ├── page.tsx            # Listado de reportes (669 líneas)
│   │       │   └── [id]/
│   │       │       └── page.tsx        # Detalle de reporte
│   │       │
│   │       ├── heatmap/
│   │       │   └── page.tsx            # Mapa de calor
│   │       │
│   │       ├── horometros/
│   │       │   └── page.tsx            # Análisis de horómetros
│   │       │
│   │       ├── operadores/
│   │       │   └── page.tsx            # Panel de operadores
│   │       │
│   │       └── problemas-criticos/
│   │           └── page.tsx            # Problemas detectados
│   │
│   ├── components/
│   │   ├── KPICard.tsx                  # Tarjeta de KPI
│   │   ├── Heatmap.tsx                  # Componente heatmap
│   │   ├── ExportButton.tsx             # Botón exportación
│   │   └── [Otros componentes UI]
│   │
│   └── lib/
│       ├── supabase.ts                  # Cliente Supabase + tipos
│       ├── auth.ts                      # Autenticación
│       ├── dashboard-service.ts         # KPIs y análisis
│       ├── reportes-service.ts          # Gestión de reportes
│       ├── activos-service.ts           # Gestión de activos
│       ├── horometros-service.ts        # Análisis horómetros
│       ├── operadores-service.ts        # Análisis operadores
│       ├── problemas-criticos-service.ts # Problemas críticos
│       ├── export-utils.ts              # Exportación Excel/CSV
│       ├── pdf-export-utils.ts          # Exportación PDF
│       └── utils.ts                     # Utilidades generales
│
├── public/
│   ├── logo.svg
│   └── [Assets estáticos]
│
├── supabase/                             # ⚠️ Local (puede estar desactualizado)
│   ├── migrations/                      # Migraciones SQL (desarrollo)
│   ├── functions/                       # Edge Functions (desarrollo)
│   └── [Archivos de configuración]
│
├── .env.example                         # Ejemplo de variables de entorno
├── .env.local                           # ⚠️ NO COMMITEAR
├── next.config.ts                       # Configuración de Next.js
├── tsconfig.json                        # Configuración de TypeScript
├── tailwind.config.js                   # Configuración de Tailwind
├── postcss.config.js                    # Configuración de PostCSS
├── package.json                         # Dependencias
├── pnpm-lock.yaml                       # Lock file (si usas pnpm)
└── README.md                            # Este archivo
```

**Total:** 25+ archivos TypeScript/TSX

---

## 🗺️ Rutas y Páginas

### Rutas Públicas

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/page.tsx` | Redirect a `/dashboard` |
| `/login` | `app/login/page.tsx` | Login de supervisores |

### Rutas Protegidas (Dashboard)

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/dashboard` | `app/dashboard/page.tsx` | Dashboard principal con KPIs |
| `/dashboard/gruas` | `app/dashboard/gruas/page.tsx` | Gestión de grúas (CRUD) |
| `/dashboard/reportes` | `app/dashboard/reportes/page.tsx` | Listado de reportes |
| `/dashboard/reportes/[id]` | `app/dashboard/reportes/[id]/page.tsx` | Detalle de reporte |
| `/dashboard/heatmap` | `app/dashboard/heatmap/page.tsx` | Mapa de calor de problemas |
| `/dashboard/horometros` | `app/dashboard/horometros/page.tsx` | Análisis de horómetros |
| `/dashboard/operadores` | `app/dashboard/operadores/page.tsx` | Panel de operadores |
| `/dashboard/problemas-criticos` | `app/dashboard/problemas-criticos/page.tsx` | Problemas críticos |

### Middleware

```typescript
// middleware.ts
// Protege rutas /dashboard/* solo para supervisores autenticados
```

---

## 🔧 Servicios

### dashboard-service.ts

Funciones para KPIs y análisis general:

```typescript
obtenerKPIs()                           // KPIs generales
obtenerTendenciaDiaria(dias: number)   // Gráfico de tendencia
obtenerAnalisisTurnos(dias: number)    // Análisis por turno
obtenerTopGruasProblematicas(limite: number, dias: number)
obtenerHeatmapGruas(dias: number)      // Mapa de calor
obtenerTopProblemas(dias: number)      // Top problemas
```

### reportes-service.ts

Gestión de reportes con filtros:

```typescript
obtenerReporteDetalle(reporteId: string)
obtenerReportesConFiltros({
  fechaDesde?: string,
  fechaHasta?: string,
  activoId?: number,
  soloConProblemas?: boolean,
  operadorId?: string,
  turno?: number
})
```

### activos-service.ts

Gestión de grúas:

```typescript
obtenerActivos()
crearActivo(input: ActivoInput)
actualizarActivo(id: number, input: ActivoInput)
eliminarActivo(id: number)
cambiarEstadoActivo(id: number, estado: EstadoActivo)
obtenerActivosConTiempoDesactivada()
obtenerResumenUsoActivosRPC()
```

### horometros-service.ts

Análisis de horómetros:

```typescript
obtenerCorrelacionHorometroProblemas(dias: number)
obtenerEficienciaHorometro()
obtenerEstadoHorometros()
obtenerOperadoresHorometrosPendientes()
obtenerResumenHorasActivo(activoId: number)
recalcularHorasOmitidasActivo(activoId: number)
```

---

## 💻 Desarrollo

### Comandos Útiles

```bash
# Desarrollo con hot reload
npm run dev

# Build de producción
npm run build

# Ejecutar producción localmente
npm start

# Lint (ESLint)
npm run lint

# Type check (TypeScript)
npm run type-check

# Format (Prettier)
npm run format
```

### Agregar Nueva Página

1. Crear archivo en `src/app/dashboard/`:
```typescript
// src/app/dashboard/nueva-pagina/page.tsx
'use client'

export default function NuevaPagina() {
  return (
    <div>
      <h1>Nueva Página</h1>
    </div>
  )
}
```

2. Agregar al menú de navegación (si aplica)

### Agregar Nuevo Servicio

1. Crear archivo en `src/lib/`:
```typescript
// src/lib/nuevo-service.ts
import { supabase } from './supabase'

export async function obtenerDatos() {
  const { data, error } = await supabase
    .from('tabla')
    .select('*')

  if (error) throw error
  return data
}
```

2. Usar en componente:
```typescript
import { obtenerDatos } from '@/lib/nuevo-service'

const datos = await obtenerDatos()
```

### Configurar Realtime

```typescript
// Subscribirse a cambios en tiempo real
useEffect(() => {
  const channel = supabase
    .channel('reportes-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'reportes_inspeccion'
    }, (payload) => {
      console.log('Cambio detectado:', payload)
      // Actualizar estado
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

---

## 📦 Build y Deployment

### Build Local

```bash
# Build de producción
npm run build

# Output en: .next/
# Archivos estáticos en: .next/static/
```

### Deployment en Vercel (Recomendado)

1. **Conectar Repositorio:**
   - Ir a https://vercel.com
   - "Import Project"
   - Conectar con GitHub

2. **Configurar Variables de Entorno:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

3. **Deploy:**
   - Push a `main` branch
   - Deploy automático en cada push

### Deployment en Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Deployment en VPS (Ubuntu)

```bash
# 1. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clonar repositorio
git clone https://github.com/yourorg/webaca.git
cd webaca

# 3. Instalar dependencias
npm install

# 4. Build
npm run build

# 5. Ejecutar con PM2
npm install -g pm2
pm2 start npm --name "webaca" -- start
pm2 save
pm2 startup
```

---

## 📊 Exportación de Datos

### Excel (6 hojas)

```typescript
// Uso
import { exportarExcel } from '@/lib/export-utils'

await exportarExcel({
  reportes,
  kpis,
  gruas,
  problemas,
  operadores,
  horometros
})
```

**Hojas generadas:**
1. **Reportes**: Todos los reportes con todos los campos
2. **KPIs**: Resumen general de métricas
3. **Grúas**: Top problemáticas + uso
4. **Problemas**: Top ítems fallados
5. **Operadores**: Rendimiento individual
6. **Horómetros**: Estado actual

### CSV

```typescript
// Solo reportes
import { exportarCSV } from '@/lib/export-utils'

await exportarCSV(reportes)
```

### PDF

```typescript
// PDF individual por reporte
import { generarPDFReporte } from '@/lib/pdf-export-utils'

const pdf = await generarPDFReporte(reporte)
pdf.save(`reporte-${reporteId}.pdf`)
```

---

## 🔧 Troubleshooting

### Problema: Dashboard no carga datos

**Diagnóstico:**
```bash
# Verificar variables de entorno
cat .env.local

# Verificar conexión a Supabase
curl https://your-project.supabase.co/rest/v1/
```

**Solución:**
- Verificar que SUPABASE_URL y SUPABASE_ANON_KEY estén correctos
- Verificar que usuario tenga rol SUPERVISOR en tabla `usuarios`
- Revisar consola del navegador para errores

### Problema: Realtime no funciona

**Diagnóstico:**
- Verificar en consola del navegador si hay errores de WebSocket
- Verificar que Supabase Realtime esté habilitado

**Solución:**
```typescript
// Verificar estado de conexión
const channel = supabase.channel('test')
channel.subscribe((status) => {
  console.log('Realtime status:', status)
})
```

### Problema: Build falla

**Diagnóstico:**
```bash
# Ver errores completos
npm run build 2>&1 | tee build.log
```

**Soluciones comunes:**
- Limpiar caché: `rm -rf .next node_modules && npm install`
- Verificar versiones de Node: `node -v` (debe ser 20+)
- Type check: `npm run type-check`

### Problema: Exportación a Excel no funciona

**Diagnóstico:**
- Verificar límite de filas (Excel max: 1,048,576)
- Verificar memoria disponible

**Solución:**
```typescript
// Limitar cantidad de reportes
const reportes = await obtenerReportesConFiltros({
  fechaDesde: '2024-01-01',
  fechaHasta: '2024-12-31'
})
```

---

## 🤝 Contribuir

### Guía de Contribución

1. Fork el proyecto
2. Crear branch feature: `git checkout -b feature/nueva-funcionalidad`
3. Hacer commits: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push al branch: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Convención de Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato de código
refactor: refactorización
test: agregar tests
chore: tareas de mantenimiento
perf: mejoras de performance
```

### Estilo de Código

- Seguir [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- Usar Prettier para formateo
- Mantener componentes pequeños (< 200 líneas)
- Documentar funciones complejas con JSDoc

### Code Review

- Asegurarse que el build pasa: `npm run build`
- Verificar tipos: `npm run type-check`
- Lint: `npm run lint`
- Probar en local antes de PR

---

## 📚 Sistema Completo

webaca es parte del **Sistema ACA** completo. Para entender cómo se integra con los demás componentes:

### Documentación Relacionada

- **[README Principal](../README.md)**: Documentación completa del sistema
- **[AppACA README](../AppACA/README.md)**: Aplicación móvil para operadores
- **[Supabase Setup](../README.md#instalación-y-configuración)**: Configuración del backend

### Arquitectura del Sistema

```
┌──────────────┐          ┌──────────────┐
│   AppACA     │          │   webaca     │
│   (Mobile)   │          │   (Web)      │
│              │          │              │
│  Operadores  │          │ Supervisores │
└──────┬───────┘          └──────┬───────┘
       │                         │
       │    ┌────────────────┐   │
       └────►   SUPABASE     ◄───┘
            │   (Backend)    │
            │                │
            │ - PostgreSQL   │
            │ - Auth         │
            │ - Realtime     │
            │ - Storage      │
            │ - Edge Funcs   │
            └────────────────┘
```

### Flujo de Datos

1. **Operador** crea inspección en AppACA
2. **AppACA** sincroniza con Supabase
3. **Supabase Realtime** notifica a webaca
4. **webaca** actualiza dashboard automáticamente
5. **Supervisor** visualiza y analiza en tiempo real
6. **webaca** permite exportar a Excel/PDF/CSV

### Edge Functions

**⚠️ IMPORTANTE:** Las Edge Functions están desplegadas en Supabase Cloud, no en este repositorio.

**Función Principal:**
- `enviar-reporte-email`: Genera PDF y envía por email automáticamente al completar inspección

---

## 📧 Contacto

Para soporte técnico o consultas:

- **Email:** andresamaya.06@gmail.com
- **Issues:** [GitHub Issues](https://github.com/yourorg/webaca/issues)

---

## 📝 Changelog

### v1.0.3 (Actual)
- Dashboard en tiempo real con Realtime
- Exportación a Excel con 6 hojas
- Análisis de horómetros completo
- Heatmap de problemas
- Panel de operadores

### v1.0.2
- Mejoras de performance en gráficos
- Optimización de queries
- Corrección de bugs de exportación

### v1.0.1
- Primera versión estable
- Dashboard básico con KPIs

---

<div align="center">

[⬆ Volver arriba](#webaca---dashboard-web-de-gestión-de-inspecciones)

</div>
