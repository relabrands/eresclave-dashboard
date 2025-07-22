"use client"

import { signOut, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogOut, Calendar, User, Settings, MessageSquare, AlertCircle, RefreshCw } from "lucide-react"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { MentorProfileFormSupabase } from "./mentor-profile-form-supabase"
import { SolicitudesRecibidasSupabase } from "./solicitudes-recibidas-supabase"
import { ProximasSesionesSupabase } from "./proximas-sesiones-supabase"
import type { SolicitudWithProfiles, SesionWithProfiles } from "@/lib/supabase"

export function MentorDashboardSupabase() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [solicitudes, setSolicitudes] = useState<SolicitudWithProfiles[]>([])
  const [sesiones, setSesiones] = useState<SesionWithProfiles[]>([])
  const {
    loading,
    error,
    connectionStatus,
    currentUser,
    currentMentorProfile,
    getSolicitudesByMentor,
    getSesionesByUser,
    checkConnection,
  } = useSupabaseData()

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  const handleRetry = async () => {
    console.log("Retrying connection...")
    await checkConnection()
    window.location.reload()
  }

  // Cargar datos específicos del mentor
  useEffect(() => {
    const loadMentorData = async () => {
      if (currentUser?.id && connectionStatus === "connected") {
        console.log("Loading mentor-specific data...")
        try {
          const [solicitudesData, sesionesData] = await Promise.all([
            getSolicitudesByMentor(currentUser.id),
            getSesionesByUser(currentUser.id),
          ])
          setSolicitudes(solicitudesData)
          setSesiones(sesionesData)
          console.log("Mentor data loaded successfully")
        } catch (error) {
          console.error("Error loading mentor data:", error)
        }
      }
    }

    if (!loading && currentUser && connectionStatus === "connected") {
      loadMentorData()
    }
  }, [currentUser, loading, connectionStatus, getSolicitudesByMentor, getSesionesByUser])

  // Mostrar error de conexión
  if (connectionStatus === "error" || error) {
    return (
      <div className="min-h-screen flex items-center justify-center eresclave-gradient p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-2xl font-bold">Error de Conexión</CardTitle>
            <CardDescription>No se pudo conectar a la base de datos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || "Error de conexión a Supabase"}</AlertDescription>
            </Alert>
            <div className="text-center text-sm text-gray-600">
              <p>Posibles causas:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Problemas de conectividad</li>
                <li>Configuración de Supabase</li>
                <li>Variables de entorno faltantes</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRetry} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
              <Button onClick={handleSignOut} variant="outline" className="flex-1 bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading || connectionStatus === "connecting") {
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
            {connectionStatus === "connecting" ? "Conectando a la base de datos..." : "Cargando dashboard..."}
          </p>
        </div>
      </div>
    )
  }

  const solicitudesPendientes = solicitudes.filter((s) => s.estado === "pendiente")
  const sesionesProximas = sesiones.filter((s) => s.estado === "programada" && new Date(s.fecha) > new Date())
  const totalSolicitudes = solicitudes.length

  if (activeTab === "perfil") {
    return <MentorProfileFormSupabase onComplete={() => setActiveTab("dashboard")} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="eresclave-gradient shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">eresclave</h1>
                <Badge className="bg-eresclave-orange text-white">Mentor</Badge>
              </div>
              <p className="text-white/90">Bienvenido, {currentMentorProfile?.nombre || currentUser?.name}</p>
              <p className="text-white/70 text-sm">Tú eres la clave del cambio</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="border-white text-white hover:bg-white hover:text-eresclave-teal bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="solicitudes">
              Solicitudes
              {solicitudesPendientes.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">{solicitudesPendientes.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sesiones">Sesiones</TabsTrigger>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
                      <p className="text-2xl font-bold text-eresclave-orange">{solicitudesPendientes.length}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-eresclave-orange" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Solicitudes</p>
                      <p className="text-2xl font-bold text-eresclave-teal">{totalSolicitudes}</p>
                    </div>
                    <User className="h-8 w-8 text-eresclave-teal" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Próximas Sesiones</p>
                      <p className="text-2xl font-bold text-eresclave-teal">{sesionesProximas.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-eresclave-orange" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Perfil</p>
                      <p className="text-sm text-gray-500">{currentMentorProfile ? "Completo" : "Incompleto"}</p>
                    </div>
                    <Settings className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumen rápido */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Solicitudes Recientes
                  </CardTitle>
                  <CardDescription>Últimas solicitudes de mentoría recibidas</CardDescription>
                </CardHeader>
                <CardContent>
                  {solicitudesPendientes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No tienes solicitudes pendientes</p>
                  ) : (
                    <div className="space-y-3">
                      {solicitudesPendientes.slice(0, 3).map((solicitud) => (
                        <div key={solicitud.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">
                              {solicitud.solicitante_profile?.nombre || solicitud.solicitante_user?.name}
                            </p>
                            <p className="text-sm text-gray-600 truncate max-w-xs">{solicitud.mensaje}</p>
                          </div>
                          <Badge variant="outline">Pendiente</Badge>
                        </div>
                      ))}
                      {solicitudesPendientes.length > 3 && (
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => setActiveTab("solicitudes")}
                        >
                          Ver todas las solicitudes
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Próximas Sesiones
                  </CardTitle>
                  <CardDescription>Sesiones de mentoría programadas</CardDescription>
                </CardHeader>
                <CardContent>
                  {sesionesProximas.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No tienes sesiones programadas</p>
                  ) : (
                    <div className="space-y-3">
                      {sesionesProximas.slice(0, 3).map((sesion) => (
                        <div key={sesion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">
                              {sesion.solicitante_profile?.nombre || sesion.solicitante_user?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(sesion.fecha).toLocaleDateString("es-ES", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Programada</Badge>
                        </div>
                      ))}
                      {sesionesProximas.length > 3 && (
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => setActiveTab("sesiones")}
                        >
                          Ver todas las sesiones
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="solicitudes">
            <SolicitudesRecibidasSupabase
              solicitudes={solicitudes}
              onUpdate={() => {
                // Recargar solicitudes después de una actualización
                if (currentUser?.id) {
                  getSolicitudesByMentor(currentUser.id).then(setSolicitudes)
                  getSesionesByUser(currentUser.id).then(setSesiones)
                }
              }}
            />
          </TabsContent>

          <TabsContent value="sesiones">
            <ProximasSesionesSupabase sesiones={sesiones} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
