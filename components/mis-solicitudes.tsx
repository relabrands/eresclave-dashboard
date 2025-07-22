"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, User, ExternalLink, Calendar } from "lucide-react"
import { useMentorshipData } from "@/hooks/use-mentorship-data"

export function MisSolicitudes() {
  const { data: session } = useSession()
  const { getSolicitudesBySolicitante } = useMentorshipData()

  const userId = session?.user?.id || ""
  const solicitudes = getSolicitudesBySolicitante(userId)

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "aceptada":
        return "bg-green-100 text-green-800"
      case "rechazada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "Pendiente"
      case "aceptada":
        return "Aceptada"
      case "rechazada":
        return "Rechazada"
      default:
        return estado
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mis Solicitudes</h2>
          <p className="text-gray-600">Estado de tus solicitudes de mentoría</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {solicitudes.length} total
        </Badge>
      </div>

      {solicitudes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes</h3>
            <p className="text-gray-600">Aún no has enviado solicitudes de mentoría</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {solicitudes.map((solicitud) => (
            <Card key={solicitud.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{solicitud.nombreMentor}</CardTitle>
                      <CardDescription>{solicitud.areaMentor}</CardDescription>
                      <p className="text-sm text-gray-500 mt-1">
                        Enviada el {new Date(solicitud.fecha).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(solicitud.estado)}>{getStatusText(solicitud.estado)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Tu mensaje:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{solicitud.mensaje}</p>
                </div>

                {solicitud.estado === "aceptada" && solicitud.enlaceMeet && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Sesión Programada
                    </h4>
                    <p className="text-green-700 mb-2">
                      Fecha:{" "}
                      {solicitud.fechaSesion
                        ? new Date(solicitud.fechaSesion).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Por definir"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-700">Enlace de Google Meet:</span>
                      <Button asChild size="sm" className="btn-eresclave-primary">
                        <a
                          href={solicitud.enlaceMeet}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Unirse a la reunión
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {solicitud.estado === "rechazada" && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-1">Solicitud Rechazada</h4>
                    <p className="text-red-700 text-sm">
                      El mentor no pudo aceptar tu solicitud en este momento. Puedes intentar con otros mentores.
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
