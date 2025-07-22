"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import { useMentorshipData, type SolicitanteProfile } from "@/hooks/use-mentorship-data"
import { useToast } from "@/hooks/use-toast"

interface SolicitanteProfileFormProps {
  onComplete: () => void
}

export function SolicitanteProfileForm({ onComplete }: SolicitanteProfileFormProps) {
  const { data: session } = useSession()
  const { getSolicitanteProfile, updateSolicitanteProfile } = useMentorshipData()
  const { toast } = useToast()

  const userId = session?.user?.id || ""
  const existingProfile = getSolicitanteProfile(userId)

  const [profile, setProfile] = useState<SolicitanteProfile>({
    id: userId,
    nombre: existingProfile?.nombre || session?.user?.name || "",
    email: existingProfile?.email || session?.user?.email || "",
    edad: existingProfile?.edad || 0,
    areaInteres: existingProfile?.areaInteres || "",
    descripcion: existingProfile?.descripcion || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile.nombre || !profile.areaInteres || profile.edad <= 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    updateSolicitanteProfile(profile)
    toast({
      title: "Perfil actualizado",
      description: "Tu información ha sido guardada correctamente",
    })
    onComplete()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={onComplete}
          className="mb-6 text-eresclave-teal hover:bg-eresclave-teal hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Perfil de Solicitante</CardTitle>
            <CardDescription>Completa tu información para encontrar el mentor ideal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={profile.nombre}
                  onChange={(e) => setProfile((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Tu nombre completo"
                  className="focus:ring-eresclave-teal focus:border-eresclave-teal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  placeholder="tu@email.com"
                  className="focus:ring-eresclave-teal focus:border-eresclave-teal"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edad">Edad *</Label>
                <Input
                  id="edad"
                  type="number"
                  min="16"
                  max="100"
                  value={profile.edad}
                  onChange={(e) => setProfile((prev) => ({ ...prev, edad: Number.parseInt(e.target.value) || 0 }))}
                  placeholder="25"
                  className="focus:ring-eresclave-teal focus:border-eresclave-teal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Área de Interés *</Label>
                <Input
                  id="area"
                  value={profile.areaInteres}
                  onChange={(e) => setProfile((prev) => ({ ...prev, areaInteres: e.target.value }))}
                  placeholder="ej. Desarrollo Web, Marketing Digital, Diseño UX"
                  className="focus:ring-eresclave-teal focus:border-eresclave-teal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción Personal</Label>
                <Textarea
                  id="descripcion"
                  value={profile.descripcion}
                  onChange={(e) => setProfile((prev) => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Cuéntanos sobre tus objetivos, experiencia actual y qué esperas de la mentoría..."
                  rows={4}
                  className="focus:ring-eresclave-teal focus:border-eresclave-teal"
                />
              </div>

              <Button type="submit" className="w-full btn-eresclave-primary">
                Guardar Perfil
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
