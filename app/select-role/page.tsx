"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, Loader2 } from "lucide-react"
import { useSupabaseData } from "@/hooks/use-supabase-data"

export default function SelectRolePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { userData, loading, updateUserRole, hasRole } = useSupabaseData()
  const [selectedRole, setSelectedRole] = useState<"mentor" | "solicitante" | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (hasRole && userData?.role) {
      // Si ya tiene rol, redirigir al dashboard correspondiente
      router.push(`/dashboard/${userData.role}`)
    }
  }, [status, hasRole, userData?.role, router])

  const handleRoleSelection = async (role: "mentor" | "solicitante") => {
    if (!userData) return

    setIsUpdating(true)
    setSelectedRole(role)

    try {
      const success = await updateUserRole(role)

      if (success) {
        // Redirigir al dashboard correspondiente
        router.push(`/dashboard/${role}`)
      } else {
        setSelectedRole(null)
      }
    } catch (error) {
      console.error("Error selecting role:", error)
      setSelectedRole(null)
    } finally {
      setIsUpdating(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido, {session.user?.name}!</h1>
          <p className="text-gray-600">Selecciona tu rol para comenzar tu experiencia de mentoría</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Opción Mentor */}
          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRole === "mentor" ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Soy Mentor</CardTitle>
              <CardDescription>
                Quiero compartir mi experiencia y ayudar a otros a crecer profesionalmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Comparte tu experiencia profesional</li>
                <li>• Ayuda a otros a alcanzar sus metas</li>
                <li>• Gestiona tus sesiones de mentoría</li>
                <li>• Construye una red de contactos</li>
              </ul>
              <Button className="w-full" onClick={() => handleRoleSelection("mentor")} disabled={isUpdating}>
                {isUpdating && selectedRole === "mentor" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Configurando...
                  </>
                ) : (
                  "Ser Mentor"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Opción Solicitante */}
          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRole === "solicitante" ? "ring-2 ring-green-500" : ""
            }`}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Busco Mentoría</CardTitle>
              <CardDescription>
                Quiero aprender de profesionales experimentados y acelerar mi crecimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Encuentra mentores expertos</li>
                <li>• Acelera tu desarrollo profesional</li>
                <li>• Recibe orientación personalizada</li>
                <li>• Amplía tu red profesional</li>
              </ul>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleRoleSelection("solicitante")}
                disabled={isUpdating}
              >
                {isUpdating && selectedRole === "solicitante" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Configurando...
                  </>
                ) : (
                  "Buscar Mentor"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">Podrás cambiar tu rol más tarde desde tu perfil</p>
        </div>
      </div>
    </div>
  )
}
