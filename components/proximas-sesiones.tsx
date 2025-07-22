"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ExternalLink, User, Clock } from "lucide-react"
import { useMentorshipData } from "@/hooks/use-mentorship-data"

export function ProximasSesiones() {
  const { data: session } = useSession()
  const { getSesionesByUser } = useMentorshipData()

  const userId = session?.user?.id || ""
  const sesiones = getSesionesByUser(userId)

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "programada":
        return "bg-blue-100 text-blue-800"
      case "completada":
        return "bg-green-100 text-green-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (estado: string) => {
    switch (estado) {
      case "programada":
        return "Programada"
      case "completada":
        return "Completada"
      case "cancelada":
        return "Cancelada"
      default:
        return estado
    }
  }

  const isUpcoming = (fecha: string) => {
    return new Date(fecha) > new Date()
  }

  const sortedSesiones = [...sesiones].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sesiones de Mentoría</h2>
          <p className="text-gray-600">Gestiona tus sesiones programadas</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {sesiones.filter((s) => s.estado === "programada").length} programadas
        </Badge>
      </div>

      {sortedSesiones.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sesiones</h3>
            <p className="text-gray-600">Aún no tienes sesiones programadas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {sortedSesiones.map((sesion) => (
            <Card key={sesion.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {userId === sesion.mentorId ? sesion.nombreSolicitante : sesion.nombreMentor}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date(sesion.fecha).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isUpcoming(sesion.fecha) && <Badge className="bg-orange-100 text-orange-800">Próxima</Badge>}
                    <Badge className={getStatusColor(sesion.estado)}>{getStatusText(sesion.estado)}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Google Meet</h4>
                      <p className="text-blue-700 text-sm">Enlace de la reunión</p>
                    </div>
                    <Button asChild size="sm" className="btn-eresclave-primary">
                      <a
                        href={sesion.enlaceMeet}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Unirse
                      </a>
                    </Button>
                  </div>
                </div>

                {isUpcoming(sesion.fecha) && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">Recordatorio:</p>
                    <p>
                      La sesión comenzará en{" "}
                      {Math.ceil((new Date(sesion.fecha).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}{" "}
                      días
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
