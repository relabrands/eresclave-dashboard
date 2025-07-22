"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export interface MentorProfile {
  id: string
  nombre: string
  foto?: string
  areaExperiencia: string
  anosExperiencia: number
  disponibilidad: string[]
  descripcion?: string
  email: string
}

export interface SolicitanteProfile {
  id: string
  nombre: string
  edad: number
  areaInteres: string
  descripcion?: string
  email: string
}

export interface Solicitud {
  id: string
  solicitanteId: string
  mentorId: string
  estado: "pendiente" | "aceptada" | "rechazada"
  fecha: string
  mensaje: string
  enlaceMeet?: string
  fechaSesion?: string
  nombreSolicitante?: string
  nombreMentor?: string
  areaMentor?: string
}

export interface Sesion {
  id: string
  solicitudId: string
  mentorId: string
  solicitanteId: string
  fecha: string
  enlaceMeet: string
  estado: "programada" | "completada" | "cancelada"
  nombreMentor?: string
  nombreSolicitante?: string
}

export function useMentorshipData() {
  const { data: session } = useSession()
  const [mentores, setMentores] = useState<MentorProfile[]>([])
  const [solicitantes, setSolicitantes] = useState<SolicitanteProfile[]>([])
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [loading, setLoading] = useState(true)

  // Load data from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const savedMentores = localStorage.getItem("mentores")
      const savedSolicitantes = localStorage.getItem("solicitantes")
      const savedSolicitudes = localStorage.getItem("solicitudes")
      const savedSesiones = localStorage.getItem("sesiones")

      if (savedMentores) setMentores(JSON.parse(savedMentores))
      if (savedSolicitantes) setSolicitantes(JSON.parse(savedSolicitantes))
      if (savedSolicitudes) setSolicitudes(JSON.parse(savedSolicitudes))
      if (savedSesiones) setSesiones(JSON.parse(savedSesiones))

      // Add some sample data if empty
      if (!savedMentores) {
        const sampleMentores: MentorProfile[] = [
          {
            id: "mentor-1",
            nombre: "Ana García",
            email: "ana@example.com",
            areaExperiencia: "Desarrollo Web",
            anosExperiencia: 8,
            disponibilidad: ["Lunes", "Miércoles", "Viernes"],
            descripcion:
              "Desarrolladora Full Stack con experiencia en React, Node.js y bases de datos. Me apasiona ayudar a otros a crecer en tecnología.",
            foto: "/placeholder.svg?height=100&width=100",
          },
          {
            id: "mentor-2",
            nombre: "Carlos Rodríguez",
            email: "carlos@example.com",
            areaExperiencia: "Marketing Digital",
            anosExperiencia: 6,
            disponibilidad: ["Martes", "Jueves", "Sábado"],
            descripcion:
              "Especialista en marketing digital y growth hacking. He ayudado a más de 50 startups a crecer.",
            foto: "/placeholder.svg?height=100&width=100",
          },
          {
            id: "mentor-3",
            nombre: "María López",
            email: "maria@example.com",
            areaExperiencia: "Diseño UX/UI",
            anosExperiencia: 5,
            disponibilidad: ["Lunes", "Martes", "Jueves"],
            descripcion:
              "Diseñadora UX/UI con experiencia en productos digitales. Me enfoco en crear experiencias centradas en el usuario.",
            foto: "/placeholder.svg?height=100&width=100",
          },
        ]
        setMentores(sampleMentores)
        localStorage.setItem("mentores", JSON.stringify(sampleMentores))
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save data to localStorage
  const saveData = (key: string, data: any) => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving ${key}:`, error)
    }
  }

  // Mentor functions
  const updateMentorProfile = (profile: MentorProfile) => {
    const updatedMentores = mentores.map((m) => (m.id === profile.id ? profile : m))
    const existingMentor = mentores.find((m) => m.id === profile.id)

    if (!existingMentor) {
      updatedMentores.push(profile)
    }

    setMentores(updatedMentores)
    saveData("mentores", updatedMentores)
  }

  // Solicitante functions
  const updateSolicitanteProfile = (profile: SolicitanteProfile) => {
    const updatedSolicitantes = solicitantes.map((s) => (s.id === profile.id ? profile : s))
    const existingSolicitante = solicitantes.find((s) => s.id === profile.id)

    if (!existingSolicitante) {
      updatedSolicitantes.push(profile)
    }

    setSolicitantes(updatedSolicitantes)
    saveData("solicitantes", updatedSolicitantes)
  }

  // Solicitud functions
  const createSolicitud = (solicitudData: Omit<Solicitud, "id" | "fecha" | "estado">) => {
    const mentor = mentores.find((m) => m.id === solicitudData.mentorId)
    const solicitante = solicitantes.find((s) => s.id === solicitudData.solicitanteId)

    const newSolicitud: Solicitud = {
      ...solicitudData,
      id: `solicitud-${Date.now()}`,
      fecha: new Date().toISOString(),
      estado: "pendiente",
      nombreMentor: mentor?.nombre,
      nombreSolicitante: solicitante?.nombre,
      areaMentor: mentor?.areaExperiencia,
    }

    const updatedSolicitudes = [...solicitudes, newSolicitud]
    setSolicitudes(updatedSolicitudes)
    saveData("solicitudes", updatedSolicitudes)
    return newSolicitud
  }

  const updateSolicitud = (id: string, updates: Partial<Solicitud>) => {
    const updatedSolicitudes = solicitudes.map((s) => (s.id === id ? { ...s, ...updates } : s))
    setSolicitudes(updatedSolicitudes)
    saveData("solicitudes", updatedSolicitudes)
  }

  const acceptSolicitud = (id: string, fechaSesion: string) => {
    const enlaceMeet = `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`

    updateSolicitud(id, {
      estado: "aceptada",
      enlaceMeet,
      fechaSesion,
    })

    // Create session
    const solicitud = solicitudes.find((s) => s.id === id)
    if (solicitud) {
      const newSesion: Sesion = {
        id: `sesion-${Date.now()}`,
        solicitudId: id,
        mentorId: solicitud.mentorId,
        solicitanteId: solicitud.solicitanteId,
        fecha: fechaSesion,
        enlaceMeet,
        estado: "programada",
        nombreMentor: solicitud.nombreMentor,
        nombreSolicitante: solicitud.nombreSolicitante,
      }

      const updatedSesiones = [...sesiones, newSesion]
      setSesiones(updatedSesiones)
      saveData("sesiones", updatedSesiones)
    }
  }

  // Get functions
  const getMentorProfile = (id: string) => mentores.find((m) => m.id === id)
  const getSolicitanteProfile = (id: string) => solicitantes.find((s) => s.id === id)
  const getSolicitudesByMentor = (mentorId: string) => solicitudes.filter((s) => s.mentorId === mentorId)
  const getSolicitudesBySolicitante = (solicitanteId: string) =>
    solicitudes.filter((s) => s.solicitanteId === solicitanteId)
  const getSesionesByUser = (userId: string) =>
    sesiones.filter((s) => s.mentorId === userId || s.solicitanteId === userId)

  return {
    // Data
    mentores,
    solicitantes,
    solicitudes,
    sesiones,
    loading,

    // Functions
    updateMentorProfile,
    updateSolicitanteProfile,
    createSolicitud,
    updateSolicitud,
    acceptSolicitud,

    // Getters
    getMentorProfile,
    getSolicitanteProfile,
    getSolicitudesByMentor,
    getSolicitudesBySolicitante,
    getSesionesByUser,
  }
}
