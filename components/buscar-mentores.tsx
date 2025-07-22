"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Search, User, Clock, Send } from "lucide-react"
import { useMentorshipData } from "@/hooks/use-mentorship-data"
import { useToast } from "@/hooks/use-toast"

interface BuscarMentoresProps {
  onBack: () => void
}

export function BuscarMentores({ onBack }: BuscarMentoresProps) {
  const { data: session } = useSession()
  const { mentores, createSolicitud } = useMentorshipData()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const mentoresFiltrados = mentores.filter(
    (mentor) =>
      mentor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.areaExperiencia.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSendSolicitud = () => {
    if (!selectedMentor || !mensaje.trim() || !session?.user?.id) return

    createSolicitud({
      solicitanteId: session.user.id,
      mentorId: selectedMentor,
      mensaje: mensaje.trim(),
    })

    toast({
      title: "Solicitud enviada",
      description: "Tu solicitud ha sido enviada al mentor seleccionado",
    })

    setIsDialogOpen(false)
    setSelectedMentor(null)
    setMensaje("")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-eresclave-teal hover:bg-eresclave-teal hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Buscar Mentores</h1>
          <p className="text-gray-600">Encuentra el mentor perfecto para tu área de interés</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o área de experiencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus:ring-eresclave-teal focus:border-eresclave-teal"
            />
          </div>
        </div>

        {mentoresFiltrados.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron mentores</h3>
              <p className="text-gray-600">Intenta con otros términos de búsqueda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentoresFiltrados.map((mentor) => (
              <Card key={mentor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    {mentor.foto ? (
                      <img
                        src={mentor.foto || "/placeholder.svg"}
                        alt={mentor.nombre}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{mentor.nombre}</CardTitle>
                      <CardDescription>{mentor.areaExperiencia}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {mentor.anosExperiencia} años
                    </Badge>
                  </div>

                  {mentor.disponibilidad && mentor.disponibilidad.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Disponibilidad:</p>
                      <div className="flex flex-wrap gap-1">
                        {mentor.disponibilidad.slice(0, 3).map((dia) => (
                          <Badge key={dia} variant="outline" className="text-xs">
                            {dia}
                          </Badge>
                        ))}
                        {mentor.disponibilidad.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{mentor.disponibilidad.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {mentor.descripcion && <p className="text-sm text-gray-600 line-clamp-3">{mentor.descripcion}</p>}

                  <Dialog open={isDialogOpen && selectedMentor === mentor.id} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full btn-eresclave-primary" onClick={() => setSelectedMentor(mentor.id)}>
                        <Send className="h-4 w-4 mr-2" />
                        Solicitar Mentoría
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Solicitar Mentoría</DialogTitle>
                        <DialogDescription>Envía un mensaje personalizado a {mentor.nombre}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-900 mb-1">Mentor seleccionado:</h4>
                          <p className="text-blue-700">{mentor.nombre}</p>
                          <p className="text-sm text-blue-600">{mentor.areaExperiencia}</p>
                        </div>

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

                        <div className="flex gap-3">
                          <Button
                            onClick={handleSendSolicitud}
                            disabled={!mensaje.trim()}
                            className="btn-eresclave-primary flex-1"
                          >
                            Enviar Solicitud
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsDialogOpen(false)
                              setSelectedMentor(null)
                              setMensaje("")
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
