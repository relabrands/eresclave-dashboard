"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Search, User, Clock } from "lucide-react"

interface SolicitudMentoriaFormProps {
  onComplete: () => void
}

export function SolicitudMentoriaForm({ onComplete }: SolicitudMentoriaFormProps) {
  const { user, users, createSolicitud } = useAuth()
  const { toast } = useToast()
  const [selectedMentor, setSelectedMentor] = useState<string>("")
  const [mensaje, setMensaje] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const mentores = users.filter((u) => u.role === "mentor" && u.profile)
  const mentoresFiltrados = mentores.filter(
    (mentor) =>
      mentor.profile?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.profile?.areaExperiencia?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMentor || !mensaje.trim()) {
      toast({
        title: "Error",
        description: "Por favor selecciona un mentor y escribe un mensaje",
        variant: "destructive",
      })
      return
    }

    createSolicitud({
      solicitanteId: user!.id,
      mentorId: selectedMentor,
      mensaje: mensaje.trim(),
    })

    toast({
      title: "Solicitud enviada",
      description: "Tu solicitud ha sido enviada al mentor seleccionado",
    })

    onComplete()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={onComplete}
          className="mb-6 text-eresclave-teal hover:bg-eresclave-teal hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lista de Mentores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Mentores
              </CardTitle>
              <CardDescription>Encuentra el mentor perfecto para tu área de interés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre o área..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus:ring-eresclave-teal focus:border-eresclave-teal"
                  />
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {mentoresFiltrados.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No se encontraron mentores</p>
                  ) : (
                    mentoresFiltrados.map((mentor) => (
                      <div
                        key={mentor.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedMentor === mentor.id
                            ? "border-eresclave-orange bg-orange-50"
                            : "border-gray-200 hover:border-eresclave-teal"
                        }`}
                        onClick={() => setSelectedMentor(mentor.id)}
                      >
                        <div className="flex items-start gap-3">
                          {mentor.profile?.foto ? (
                            <img
                              src={mentor.profile.foto || "/placeholder.svg"}
                              alt={mentor.profile.nombre}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-400" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900">{mentor.profile?.nombre}</h4>
                            <p className="text-sm text-gray-600 mb-2">{mentor.profile?.areaExperiencia}</p>

                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                {mentor.profile?.anosExperiencia} años
                              </Badge>
                            </div>

                            {mentor.profile?.disponibilidad && mentor.profile.disponibilidad.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {mentor.profile.disponibilidad.slice(0, 3).map((dia) => (
                                  <Badge key={dia} variant="outline" className="text-xs">
                                    {dia}
                                  </Badge>
                                ))}
                                {mentor.profile.disponibilidad.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{mentor.profile.disponibilidad.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {mentor.profile?.descripcion && (
                              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{mentor.profile.descripcion}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de Solicitud */}
          <Card>
            <CardHeader>
              <CardTitle>Enviar Solicitud</CardTitle>
              <CardDescription>Escribe un mensaje personalizado para el mentor</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {selectedMentor && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-1">Mentor seleccionado:</h4>
                    <p className="text-blue-700">{mentores.find((m) => m.id === selectedMentor)?.profile?.nombre}</p>
                    <p className="text-sm text-blue-600">
                      {mentores.find((m) => m.id === selectedMentor)?.profile?.areaExperiencia}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="mensaje">Mensaje para el Mentor *</Label>
                  <Textarea
                    id="mensaje"
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Hola, me interesa mucho tu experiencia en... Me gustaría aprender sobre... ¿Podrías ayudarme con...?"
                    rows={6}
                    className="resize-none focus:ring-eresclave-teal focus:border-eresclave-teal"
                  />
                  <p className="text-xs text-gray-500">
                    Sé específico sobre lo que quieres aprender y por qué elegiste a este mentor.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full btn-eresclave-primary"
                  disabled={!selectedMentor || !mensaje.trim()}
                >
                  Enviar Solicitud de Mentoría
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
