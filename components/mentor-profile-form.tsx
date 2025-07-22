"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Upload } from "lucide-react"
import { useMentorshipData, type MentorProfile } from "@/hooks/use-mentorship-data"
import { useToast } from "@/hooks/use-toast"

interface MentorProfileFormProps {
  onComplete: () => void
}

export function MentorProfileForm({ onComplete }: MentorProfileFormProps) {
  const { data: session } = useSession()
  const { getMentorProfile, updateMentorProfile } = useMentorshipData()
  const { toast } = useToast()

  const userId = session?.user?.id || ""
  const existingProfile = getMentorProfile(userId)

  const [profile, setProfile] = useState<MentorProfile>({
    id: userId,
    nombre: existingProfile?.nombre || session?.user?.name || "",
    email: existingProfile?.email || session?.user?.email || "",
    foto: existingProfile?.foto || session?.user?.image || "",
    areaExperiencia: existingProfile?.areaExperiencia || "",
    anosExperiencia: existingProfile?.anosExperiencia || 0,
    disponibilidad: existingProfile?.disponibilidad || [],
    descripcion: existingProfile?.descripcion || "",
  })

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  const handleDisponibilidadChange = (dia: string, checked: boolean) => {
    if (checked) {
      setProfile((prev) => ({
        ...prev,
        disponibilidad: [...prev.disponibilidad, dia],
      }))
    } else {
      setProfile((prev) => ({
        ...prev,
        disponibilidad: prev.disponibilidad.filter((d) => d !== dia),
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile.nombre || !profile.areaExperiencia || profile.anosExperiencia <= 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    updateMentorProfile(profile)
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
            <CardTitle>Perfil de Mentor</CardTitle>
            <CardDescription>Completa tu información para que los solicitantes puedan conocerte mejor</CardDescription>
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
                  onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="tu@email.com"
                  className="focus:ring-eresclave-teal focus:border-eresclave-teal"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="foto">Foto de Perfil (URL)</Label>
                <div className="flex gap-2">
                  <Input
                    id="foto"
                    value={profile.foto}
                    onChange={(e) => setProfile((prev) => ({ ...prev, foto: e.target.value }))}
                    placeholder="https://ejemplo.com/tu-foto.jpg"
                    className="focus:ring-eresclave-teal focus:border-eresclave-teal"
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Área de Experiencia *</Label>
                <Input
                  id="area"
                  value={profile.areaExperiencia}
                  onChange={(e) => setProfile((prev) => ({ ...prev, areaExperiencia: e.target.value }))}
                  placeholder="ej. Desarrollo Web, Marketing Digital, Diseño UX"
                  className="focus:ring-eresclave-teal focus:border-eresclave-teal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anos">Años de Experiencia *</Label>
                <Input
                  id="anos"
                  type="number"
                  min="1"
                  value={profile.anosExperiencia}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, anosExperiencia: Number.parseInt(e.target.value) || 0 }))
                  }
                  placeholder="5"
                  className="focus:ring-eresclave-teal focus:border-eresclave-teal"
                />
              </div>

              <div className="space-y-3">
                <Label>Disponibilidad Horaria</Label>
                <div className="grid grid-cols-2 gap-3">
                  {diasSemana.map((dia) => (
                    <div key={dia} className="flex items-center space-x-2">
                      <Checkbox
                        id={dia}
                        checked={profile.disponibilidad.includes(dia)}
                        onCheckedChange={(checked) => handleDisponibilidadChange(dia, checked as boolean)}
                      />
                      <Label htmlFor={dia} className="text-sm">
                        {dia}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción Personal</Label>
                <Textarea
                  id="descripcion"
                  value={profile.descripcion}
                  onChange={(e) => setProfile((prev) => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Cuéntanos sobre ti, tu experiencia y cómo puedes ayudar a otros..."
                  rows={4}
                  className="focus:ring-eresclave-teal focus:border-eresclave-teal"
                />
              </div>

              <Button type="submit" className="w-full btn-eresclave-secondary">
                Guardar Perfil
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
