"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface User {
  id: string
  email: string
  role: "mentor" | "solicitante"
  profile?: MentorProfile | SolicitanteProfile
}

export interface MentorProfile {
  nombre: string
  foto?: string
  areaExperiencia: string
  anosExperiencia: number
  disponibilidad: string[]
  descripcion?: string
}

export interface SolicitanteProfile {
  nombre: string
  edad: number
  areaInteres: string
  descripcion?: string
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
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: "mentor" | "solicitante") => Promise<boolean>
  register: (email: string, password: string, role: "mentor" | "solicitante") => Promise<boolean>
  logout: () => void
  updateProfile: (profile: MentorProfile | SolicitanteProfile) => void
  users: User[]
  solicitudes: Solicitud[]
  createSolicitud: (solicitud: Omit<Solicitud, "id" | "fecha" | "estado">) => void
  updateSolicitud: (id: string, updates: Partial<Solicitud>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])

  useEffect(() => {
    // Cargar datos del localStorage
    const savedUser = localStorage.getItem("currentUser")
    const savedUsers = localStorage.getItem("users")
    const savedSolicitudes = localStorage.getItem("solicitudes")

    if (savedUser) setUser(JSON.parse(savedUser))
    if (savedUsers) setUsers(JSON.parse(savedUsers))
    if (savedSolicitudes) setSolicitudes(JSON.parse(savedSolicitudes))
  }, [])

  const login = async (email: string, password: string, role: "mentor" | "solicitante"): Promise<boolean> => {
    const existingUser = users.find((u) => u.email === email && u.role === role)
    if (existingUser) {
      setUser(existingUser)
      localStorage.setItem("currentUser", JSON.stringify(existingUser))
      return true
    }
    return false
  }

  const register = async (email: string, password: string, role: "mentor" | "solicitante"): Promise<boolean> => {
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) return false

    const newUser: User = {
      id: Date.now().toString(),
      email,
      role,
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    setUser(newUser)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
    localStorage.setItem("currentUser", JSON.stringify(newUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  const updateProfile = (profile: MentorProfile | SolicitanteProfile) => {
    if (!user) return

    const updatedUser = { ...user, profile }
    const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u))

    setUser(updatedUser)
    setUsers(updatedUsers)
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  const createSolicitud = (solicitudData: Omit<Solicitud, "id" | "fecha" | "estado">) => {
    const newSolicitud: Solicitud = {
      ...solicitudData,
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      estado: "pendiente",
    }

    const updatedSolicitudes = [...solicitudes, newSolicitud]
    setSolicitudes(updatedSolicitudes)
    localStorage.setItem("solicitudes", JSON.stringify(updatedSolicitudes))
  }

  const updateSolicitud = (id: string, updates: Partial<Solicitud>) => {
    const updatedSolicitudes = solicitudes.map((s) => (s.id === id ? { ...s, ...updates } : s))
    setSolicitudes(updatedSolicitudes)
    localStorage.setItem("solicitudes", JSON.stringify(updatedSolicitudes))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        users,
        solicitudes,
        createSolicitud,
        updateSolicitud,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
