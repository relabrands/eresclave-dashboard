import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  console.log("Middleware - Processing:", pathname)

  // Permitir acceso a rutas públicas sin verificación
  if (isPublicRoute(pathname)) {
    console.log("Middleware - Public route, allowing access")
    return NextResponse.next()
  }

  try {
    // Obtener el token JWT de NextAuth
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    console.log("Middleware - Token exists:", !!token, "Role:", token?.role, "Path:", pathname)

    // Si no hay token, redirigir a login
    if (!token) {
      console.log("Middleware - No token, redirecting to login")
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Si está en la página principal, dejar que la página maneje la redirección
    if (pathname === "/") {
      console.log("Middleware - Home page, allowing access")
      return NextResponse.next()
    }

    // Si está en select-role y ya tiene rol, redirigir al dashboard
    if (pathname === "/select-role" && token.role) {
      const dashboardUrl =
        token.role === "mentor" ? new URL("/dashboard/mentor", req.url) : new URL("/dashboard/solicitante", req.url)
      console.log("Middleware - Has role, redirecting from select-role to:", dashboardUrl.toString())
      return NextResponse.redirect(dashboardUrl)
    }

    // Si está intentando acceder a un dashboard sin rol, redirigir a select-role
    if (pathname.startsWith("/dashboard") && !token.role) {
      console.log("Middleware - No role, redirecting to select-role")
      return NextResponse.redirect(new URL("/select-role", req.url))
    }

    // Proteger rutas específicas por rol
    if (pathname.startsWith("/dashboard/mentor") && token.role !== "mentor") {
      console.log("Middleware - Wrong role for mentor dashboard, redirecting")
      if (token.role === "solicitante") {
        return NextResponse.redirect(new URL("/dashboard/solicitante", req.url))
      } else {
        return NextResponse.redirect(new URL("/select-role", req.url))
      }
    }

    if (pathname.startsWith("/dashboard/solicitante") && token.role !== "solicitante") {
      console.log("Middleware - Wrong role for solicitante dashboard, redirecting")
      if (token.role === "mentor") {
        return NextResponse.redirect(new URL("/dashboard/mentor", req.url))
      } else {
        return NextResponse.redirect(new URL("/select-role", req.url))
      }
    }

    console.log("Middleware - Allowing access to:", pathname)
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // En caso de error, permitir el acceso
    return NextResponse.next()
  }
}

function isPublicRoute(pathname: string): boolean {
  const publicRoutes = ["/login", "/api/auth", "/api/health", "/favicon.ico", "/_next", "/robots.txt", "/sitemap.xml"]
  return publicRoutes.some((route) => pathname.startsWith(route))
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
