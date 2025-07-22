"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  supabase,
  testSupabaseConnection,
  updateUserRole as updateSupabaseUserRole,
  type User,
  type MentorProfile,
  type SolicitanteProfile,
  type SolicitudWithProfiles,
  type SesionWithProfiles,
} from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface UserData {
  id: string
  email: string
  name: string | null
  image: string | null
  role: "mentor" | "solicitante" | null
}

export function useSupabaseData() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentMentorProfile, setCurrentMentorProfile] = useState<MentorProfile | null>(null)
  const [currentSolicitanteProfile, setCurrentSolicitanteProfile] = useState<SolicitanteProfile | null>(null)
  const [mentores, setMentores] = useState<(MentorProfile & { user: User })[]>([])

  // Verificar conexión
  const checkConnection = useCallback(async () => {
    try {
      console.log("🔍 Verificando conexión a Supabase...")
      const isConnected = await testSupabaseConnection()

      if (isConnected) {
        setConnectionStatus("connected")
        setError(null)
        return true
      } else {
        setConnectionStatus("error")
        setError("No se pudo conectar a Supabase")
        return false
      }
    } catch (error) {
      console.error("❌ Error de conexión:", error)
      setConnectionStatus("error")
      setError("Error de conexión a la base de datos")
      return false
    }
  }, [])

  useEffect(() => {
    async function syncUser() {
      if (status === "loading") return

      if (!session?.user?.email) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Buscar usuario existente
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("email", session.user.email)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError
        }

        let user = existingUser

        // Si no existe, crear usuario
        if (!user) {
          const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert({
              email: session.user.email,
              name: session.user.name,
              image: session.user.image,
              role: null,
            })
            .select()
            .single()

          if (insertError) throw insertError
          user = newUser
        } else {
          // Actualizar datos del usuario existente
          const { data: updatedUser, error: updateError } = await supabase
            .from("users")
            .update({
              name: session.user.name,
              image: session.user.image,
            })
            .eq("id", user.id)
            .select()
            .single()

          if (updateError) throw updateError
          user = updatedUser
        }

        setUserData(user)
        setCurrentUser(user)
      } catch (err) {
        console.error("Error syncing user:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    syncUser()
  }, [session, status])

  // Actualizar rol del usuario
  const updateUserRole = useCallback(
    async (role: "mentor" | "solicitante") => {
      if (!userData) {
        console.error("No hay usuario actual para actualizar")
        return false
      }

      try {
        console.log("🔄 Actualizando rol del usuario:", role)
        const updatedUser = await updateSupabaseUserRole(userData.id, role)

        if (updatedUser) {
          setUserData(updatedUser)
          setCurrentUser(updatedUser)

          console.log("✅ Rol actualizado correctamente")
          return true
        }

        return false
      } catch (error) {
        console.error("❌ Error actualizando rol:", error)
        toast({
          title: "Error",
          description: "No se pudo actualizar el rol",
          variant: "destructive",
        })
        return false
      }
    },
    [userData, toast],
  )

  // Cargar mentores
  const loadMentores = useCallback(async () => {
    try {
      console.log("📋 Cargando mentores...")
      const { data, error } = await supabase
        .from("mentor_profiles")
        .select(`
          *,
          user:users(*)
        `)
        .eq("activo", true)

      if (error) throw error

      console.log("✅ Mentores cargados:", data?.length || 0)
      setMentores(data || [])
      return data
    } catch (error) {
      console.error("❌ Error cargando mentores:", error)
      return []
    }
  }, [])

  // Cargar perfil del usuario actual
  const loadCurrentUserProfile = useCallback(async (userId: string, role: string) => {
    try {
      console.log("📋 Cargando perfil del usuario:", userId, role)

      if (role === "mentor") {
        const { data, error } = await supabase.from("mentor_profiles").select("*").eq("user_id", userId).single()

        if (error && error.code !== "PGRST116") throw error

        setCurrentMentorProfile(data || null)
        console.log("✅ Perfil de mentor cargado:", !!data)
        return data
      } else if (role === "solicitante") {
        const { data, error } = await supabase.from("solicitante_profiles").select("*").eq("user_id", userId).single()

        if (error && error.code !== "PGRST116") throw error

        setCurrentSolicitanteProfile(data || null)
        console.log("✅ Perfil de solicitante cargado:", !!data)
        return data
      }

      return null
    } catch (error) {
      console.error("❌ Error cargando perfil:", error)
      return null
    }
  }, [])

  // CRUD para perfiles de mentor
  const upsertMentorProfile = useCallback(
    async (profile: Omit<MentorProfile, "id" | "created_at" | "updated_at">) => {
      try {
        console.log("💾 Guardando perfil de mentor...")
        const { data, error } = await supabase
          .from("mentor_profiles")
          .upsert(profile, { onConflict: "user_id" })
          .select()
          .single()

        if (error) throw error

        setCurrentMentorProfile(data)
        await loadMentores() // Recargar lista
        console.log("✅ Perfil de mentor guardado")
        return data
      } catch (error) {
        console.error("❌ Error guardando perfil de mentor:", error)
        toast({
          title: "Error",
          description: "No se pudo guardar el perfil",
          variant: "destructive",
        })
        return null
      }
    },
    [loadMentores, toast],
  )

  // CRUD para perfiles de solicitante
  const upsertSolicitanteProfile = useCallback(
    async (profile: Omit<SolicitanteProfile, "id" | "created_at" | "updated_at">) => {
      try {
        console.log("💾 Guardando perfil de solicitante...")
        const { data, error } = await supabase
          .from("solicitante_profiles")
          .upsert(profile, { onConflict: "user_id" })
          .select()
          .single()

        if (error) throw error

        setCurrentSolicitanteProfile(data)
        console.log("✅ Perfil de solicitante guardado")
        return data
      } catch (error) {
        console.error("❌ Error guardando perfil de solicitante:", error)
        toast({
          title: "Error",
          description: "No se pudo guardar el perfil",
          variant: "destructive",
        })
        return null
      }
    },
    [toast],
  )

  // Obtener solicitudes por mentor
  const getSolicitudesByMentor = useCallback(async (mentorId: string): Promise<SolicitudWithProfiles[]> => {
    try {
      const { data, error } = await supabase
        .from("solicitudes")
        .select(`
          *,
          solicitante_profile:solicitante_profiles!inner(id, user_id, nombre, area_interes),
          solicitante_user:users!inner(id, name, email, image)
        `)
        .eq("mentor_id", mentorId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("❌ Error obteniendo solicitudes:", error)
      return []
    }
  }, [])

  // Obtener solicitudes por solicitante
  const getSolicitudesBySolicitante = useCallback(async (solicitanteId: string): Promise<SolicitudWithProfiles[]> => {
    try {
      const { data, error } = await supabase
        .from("solicitudes")
        .select(`
          *,
          mentor_profile:mentor_profiles!inner(id, user_id, nombre, area_experiencia),
          mentor_user:users!inner(id, name, email, image)
        `)
        .eq("solicitante_id", solicitanteId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("❌ Error obteniendo solicitudes:", error)
      return []
    }
  }, [])

  // Crear solicitud
  const createSolicitud = useCallback(
    async (solicitudData: {
      solicitante_id: string
      mentor_id: string
      mensaje: string
    }) => {
      try {
        const { data, error } = await supabase
          .from("solicitudes")
          .insert({
            ...solicitudData,
            estado: "pendiente",
          })
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error) {
        console.error("❌ Error creando solicitud:", error)
        toast({
          title: "Error",
          description: "No se pudo enviar la solicitud",
          variant: "destructive",
        })
        return null
      }
    },
    [toast],
  )

  // Actualizar solicitud
  const updateSolicitud = useCallback(async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase.from("solicitudes").update(updates).eq("id", id).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("❌ Error actualizando solicitud:", error)
      return null
    }
  }, [])

  // Aceptar solicitud
  const acceptSolicitud = useCallback(async (id: string, fechaSesion: string) => {
    try {
      const enlaceMeet = `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`

      // Actualizar solicitud
      const { data: solicitud, error: solicitudError } = await supabase
        .from("solicitudes")
        .update({
          estado: "aceptada",
          enlace_meet: enlaceMeet,
          fecha_sesion: fechaSesion,
        })
        .eq("id", id)
        .select()
        .single()

      if (solicitudError) throw solicitudError

      // Crear sesión
      const { data: sesion, error: sesionError } = await supabase
        .from("sesiones")
        .insert({
          solicitud_id: id,
          mentor_id: solicitud.mentor_id,
          solicitante_id: solicitud.solicitante_id,
          fecha: fechaSesion,
          enlace_meet: enlaceMeet,
          estado: "programada",
        })
        .select()
        .single()

      if (sesionError) throw sesionError

      return { solicitud, sesion }
    } catch (error) {
      console.error("❌ Error aceptando solicitud:", error)
      return null
    }
  }, [])

  // Obtener sesiones por usuario
  const getSesionesByUser = useCallback(async (userId: string): Promise<SesionWithProfiles[]> => {
    try {
      const { data, error } = await supabase
        .from("sesiones")
        .select(`
          *,
          mentor_profile:mentor_profiles!inner(id, user_id, nombre),
          solicitante_profile:solicitante_profiles!inner(id, user_id, nombre),
          mentor_user:users!inner(id, name, email, image),
          solicitante_user:users!inner(id, name, email, image)
        `)
        .or(`mentor_id.eq.${userId},solicitante_id.eq.${userId}`)
        .order("fecha", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("❌ Error obteniendo sesiones:", error)
      return []
    }
  }, [])

  return {
    // Estado
    userData,
    loading,
    error,
    connectionStatus,
    isAuthenticated: status === "authenticated",
    hasRole: !!userData?.role,

    // Funciones de usuario
    updateUserRole,

    // Funciones de perfiles
    upsertMentorProfile,
    upsertSolicitanteProfile,
    loadCurrentUserProfile,

    // Funciones de solicitudes
    createSolicitud,
    getSolicitudesByMentor,
    getSolicitudesBySolicitante,
    updateSolicitud,
    acceptSolicitud,

    // Funciones de sesiones
    getSesionesByUser,

    // Utilidades
    loadMentores,
    checkConnection,
  }
}
