"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Home, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Registrar el error en un servicio de monitoreo
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center eresclave-gradient p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <CardTitle className="text-2xl font-bold">Algo salió mal</CardTitle>
          <CardDescription>Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-800 text-sm">
            {error.message || "Error desconocido"}
            {error.digest && <p className="mt-2 text-xs text-red-600">ID de error: {error.digest}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Button>
          <Button onClick={() => reset()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Intentar de nuevo
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
