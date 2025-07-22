"use client"

import { signOut, useSession } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Calendar, User, Settings, MessageSquare } from "lucide-react"
import { useMentorshipData } from "@/hooks/use-mentorship-data"
import { MentorProfileForm } from "./mentor-profile-form"
import { SolicitudesRecibidas } from "./solicitudes-recibidas"
import { ProximasSesiones } from "./proximas-sesiones"

export function MentorDashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("dashboard")
  const { getSolicitudesByMentor, getSesionesByUser, getMentorProfile, loading } = useMentorshipData()

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center eresclave-gradient">
        <div className="text-white text-lg">Cargando dashboard...</div>
      </div>
    )
  }

  const userId = session?.user?.id || ""
  const solicitudesPendientes = getSolicitudesByMentor(userId).filter((s) => s.estado === "pendiente")
  const sesionesProximas = getSesionesByUser(userId).filter((s) => s.estado === "programada")
  const mentorProfile = getMentorProfile(userId)
  const totalSolicitudes = getSolicitudesByMentor(userId).length

  if (activeTab === "perfil") {
    return <MentorProfileForm onComplete={() => setActiveTab("dashboard")} />
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
              <p className="text-white/90">Bienvenido, {mentorProfile?.nombre || session?.user?.name}</p>
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
                      <p className="text-sm text-gray-500">{mentorProfile ? "Completo" : "Incompleto"}</p>
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
                            <p className="font-medium">{solicitud.nombreSolicitante}</p>
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
                            <p className="font-medium">{sesion.nombreSolicitante}</p>
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
            <SolicitudesRecibidas />
          </TabsContent>

          <TabsContent value="sesiones">
            <ProximasSesiones />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
