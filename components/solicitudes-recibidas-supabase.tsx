"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, User, MessageSquare } from "lucide-react"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { useToast } from "@/hooks/use-toast"
import type { SolicitudWithProfiles } from "@/lib/supabase"

interface SolicitudesRecibidasSupabaseProps {
  solicitudes: SolicitudWithProfiles[]
  onUpdate: () => void
}

export function SolicitudesRecibidasSupabase({ solicitudes, onUpdate }: SolicitudesRecibidasSupabaseProps) {
  const { updateSolicitud, acceptSolicitud } = useSupabaseData()
  const { toast } = useToast()
  const [selectedSolicitud, setSelectedSolicitud] = useState<string | null>(null)
  const [fechaSesion, setFechaSesion] = useState("")
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false)

  const handleAcceptSolicitud = async () => {
    if (!selectedSolicitud || !fechaSesion) return

    const result = await acceptSolicitud(selectedSolicitud, fechaSesion)

    if (result) {
      toast({
        title: "Solicitud aceptada",
        description: "Se ha programado la sesión y se ha enviado el enlace de Google Meet",
      })

      setIsAcceptDialogOpen(false)
      setSelectedSolicitud(null)
      setFechaSesion("")
      onUpdate()
    }
  }

  const handleRejectSolicitud = async (id: string) => {
    const result = await updateSolicitud(id, { estado: "rechazada" })

    if (result) {
      toast({
        title: "Solicitud rechazada",
        description: "La solicitud ha sido rechazada",
        variant: "destructive",
      })
      onUpdate()
    }
  }

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
          <h2 className="text-2xl font-bold">Solicitudes de Mentoría</h2>
          <p className="text-gray-600">Gestiona las solicitudes recibidas</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {solicitudes.filter((s) => s.estado === "pendiente").length} pendientes
        </Badge>
      </div>

      {solicitudes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes</h3>
            <p className="text-gray-600">Aún no has recibido solicitudes de mentoría</p>
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
                      <CardTitle className="text-lg">
                        {solicitud.solicitante_profile?.nombre || solicitud.solicitante_user?.name}
                      </CardTitle>
                      <CardDescription>
                        Solicitud enviada el {new Date(solicitud.created_at).toLocaleDateString("es-ES")}
                      </CardDescription>
                      {solicitud.solicitante_profile?.area_interes && (
                        <p className="text-sm text-gray-500">Interés: {solicitud.solicitante_profile.area_interes}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(solicitud.estado)}>{getStatusText(solicitud.estado)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Mensaje:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{solicitud.mensaje}</p>
                </div>

                {solicitud.estado === "aceptada" && solicitud.enlace_meet && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Sesión Programada</h4>
                    <p className="text-green-700 mb-2">
                      Fecha:{" "}
                      {solicitud.fecha_sesion
                        ? new Date(solicitud.fecha_sesion).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Por definir"}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-green-700">Enlace de Google Meet:</span>
                      <a
                        href={solicitud.enlace_meet}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Unirse a la reunión
                      </a>
                    </div>
                  </div>
                )}

                {solicitud.estado === "pendiente" && (
                  <div className="flex gap-3">
                    <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="btn-eresclave-primary flex-1"
                          onClick={() => setSelectedSolicitud(solicitud.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aceptar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Programar Sesión de Mentoría</DialogTitle>
                          <DialogDescription>
                            Selecciona la fecha y hora para la sesión con{" "}
                            {solicitud.solicitante_profile?.nombre || solicitud.solicitante_user?.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="fecha">Fecha y Hora de la Sesión</Label>
                            <Input
                              id="fecha"
                              type="datetime-local"
                              value={fechaSesion}
                              onChange={(e) => setFechaSesion(e.target.value)}
                              min={new Date().toISOString().slice(0, 16)}
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={handleAcceptSolicitud}
                              disabled={!fechaSesion}
                              className="btn-eresclave-primary flex-1"
                            >
                              Confirmar y Crear Sesión
                            </Button>
                            <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleRejectSolicitud(solicitud.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
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
