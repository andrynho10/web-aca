import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware simplificado - solo check básico
// La seguridad real se maneja en el cliente con getCurrentUser()
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Si está accediendo a /dashboard (cualquier ruta)
  if (pathname.startsWith('/dashboard')) {
    // Buscar cookies de autenticación de Supabase
    const allCookies = request.cookies.getAll()

    // Supabase guarda el token de acceso en cookies que empiezan con 'sb-'
    const hasAuthCookie = allCookies.some(cookie =>
      cookie.name.includes('sb-') &&
      (cookie.name.includes('-auth-token') || cookie.name.includes('access-token'))
    )

    // Si no hay cookie Y no viene de login, redirigir
    if (!hasAuthCookie) {
      const referer = request.headers.get('referer') || ''

      // Permitir acceso si viene de login (para dar tiempo a que se establezcan las cookies)
      // o si es una petición de _next (recursos estáticos)
      if (referer.includes('/login') || pathname.includes('/_next/')) {
        return NextResponse.next()
      }

      // Redirigir al login solo si no tiene cookies
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Configurar qué rutas deben pasar por el middleware
export const config = {
  matcher: [
    /*
     * Match todas las rutas excepto:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (archivos públicos)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}
