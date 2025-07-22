"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

export function useUserRole() {
  const { data: session, update } = useSession()
  const [role, setRole] = useState<"mentor" | "solicitante" | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      // Primero verificar el rol en la sesión
      if (session.user.role) {
        setRole(session.user.role)
        setLoading(false)
        return
      }

      // Si no hay rol en la sesión, verificar localStorage
      try {
        const savedRole = localStorage.getItem(`user_role_${session.user.id}`)
        if (savedRole && (savedRole === "mentor" || savedRole === "solicitante")) {
          setRole(savedRole as "mentor" | "solicitante")
          // Actualizar la sesión con el rol encontrado
          update({
            ...session,
            user: {
              ...session.user,
              role: savedRole as "mentor" | "solicitante",
            },
          })
        }
      } catch (error) {
        console.warn("Error accessing localStorage:", error)
      }
    }
    setLoading(false)
  }, [session]) // Updated dependency array to include session

  const updateRole = async (newRole: "mentor" | "solicitante") => {
    if (!session?.user?.id) return false

    try {
      // Guardar en localStorage
      localStorage.setItem(`user_role_${session.user.id}`, newRole)
      setRole(newRole)

      // Actualizar la sesión de NextAuth
      await update({
        ...session,
        user: {
          ...session.user,
          role: newRole,
        },
      })

      return true
    } catch (error) {
      console.error("Error updating role:", error)
      return false
    }
  }

  return {
    role,
    loading,
    updateRole,
  }
}
