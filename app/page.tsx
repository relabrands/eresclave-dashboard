"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("HomePage - status:", status, "session:", !!session, "redirecting:", redirecting)

    // Evitar múltiples redirecciones
    if (redirecting) return

    if (status === "loading") {
      return
    }

    if (status === "unauthenticated") {
      console.log("Not authenticated, redirecting to login")
      setRedirecting(true)
      router.replace("/login")
      return
    }

    if (status === "authenticated" && session?.user) {
      console.log("Authenticated user:", session.user.email, "role:", session.user.role)

      // Verificar rol en la sesión primero
      let userRole = session.user.role

      // Si no hay rol en la sesión, verificar localStorage
      if (!userRole && session.user.id) {
        try {
          userRole = localStorage.getItem(`user_role_${session.user.id}`) as "mentor" | "solicitante" | null
          console.log("Role from localStorage:", userRole)
        } catch (e) {
          console.warn("Error accessing localStorage:", e)
        }
      }

      setRedirecting(true)

      // Redirigir según el rol
      if (userRole === "mentor") {
        console.log("Redirecting to mentor dashboard")
        router.replace("/dashboard/mentor")
      } else if (userRole === "solicitante") {
        console.log("Redirecting to solicitante dashboard")
        router.replace("/dashboard/solicitante")
      } else {
        console.log("No role found, redirecting to select-role")
        router.replace("/select-role")
      }
    }
  }, [session, status, router, redirecting])

  const handleRetry = () => {
    setError(null)
    setRedirecting(false)
    window.location.reload()
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center eresclave-gradient p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
            <CardTitle className="text-2xl font-bold">Error de Navegación</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center eresclave-gradient">
      <div className="text-white text-center">
        <div
          className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"
          role="status"
        >
          <span className="sr-only">Cargando...</span>
        </div>
        <p className="text-lg">
          {status === "loading" ? "Verificando sesión..." : redirecting ? "Redirigiendo..." : "Cargando..."}
        </p>
        <p className="text-sm text-white/70 mt-2">Estado: {status}</p>
      </div>
    </div>
  )
}
