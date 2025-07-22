"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("LoginPage - status:", status, "session:", !!session)

    if (status === "loading") {
      return
    }

    if (status === "authenticated" && session?.user) {
      console.log("Already authenticated, redirecting to home")
      router.replace("/")
    }
  }, [session, status, router])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Starting Google sign in...")

      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/",
      })

      console.log("Sign in result:", result)

      if (result?.error) {
        console.error("Sign in error:", result.error)
        setError("Error al iniciar sesión con Google. Por favor, intenta de nuevo.")
      } else if (result?.ok) {
        console.log("Sign in successful, redirecting...")
        router.replace("/")
      }
    } catch (error) {
      console.error("Sign in exception:", error)
      setError("Error inesperado al iniciar sesión. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center eresclave-gradient">
        <div className="text-white text-lg">Verificando sesión...</div>
      </div>
    )
  }

  if (status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center eresclave-gradient">
        <div className="text-white text-lg">Redirigiendo...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center eresclave-gradient p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-eresclave-teal">eresclave</CardTitle>
          <CardDescription className="text-gray-600">Red de Mentoría Social</CardDescription>
          <p className="text-sm text-gray-500 mt-2">
            Conectamos voluntarios con jóvenes, madres solteras, desempleados y emprendedores
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Tú eres la clave del cambio</h2>
            <p className="text-gray-600 text-sm">Inicia sesión para comenzar tu experiencia de mentoría</p>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full btn-eresclave-primary flex items-center justify-center gap-3 py-3"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Iniciando sesión...
              </>
            ) : (
              <>
                <Chrome className="h-5 w-5" />
                Iniciar sesión con Google
              </>
            )}
          </Button>

          <div className="text-center text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad
          </div>

          {/* Debug info en desarrollo */}
          {process.env.NODE_ENV === "development" && (
            <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
              <p>Debug: Status = {status}</p>
              <p>NEXTAUTH_URL = {process.env.NEXTAUTH_URL || "Not set"}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
