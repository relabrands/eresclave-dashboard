import { createClient } from "@supabase/supabase-js"

// Credenciales actualizadas de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log("🔧 Configurando Supabase...")
console.log("URL:", supabaseUrl)
console.log("Key configurada:", !!supabaseAnonKey)

// Cliente de Supabase optimizado
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Cliente para operaciones del servidor
export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Función para verificar la conexión
export const testSupabaseConnection = async () => {
  try {
    console.log("🔍 Probando conexión a Supabase...")
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      console.error("❌ Error en conexión:", error)
      return false
    }

    console.log("✅ Conexión exitosa")
    return true
  } catch (error) {
    console.error("❌ Error de conexión:", error)
    return false
  }
}

// Función para sincronizar usuario con base de datos
export const syncUserWithDatabase = async (sessionUser: any) => {
  if (!sessionUser?.email) {
    console.log("No hay usuario para sincronizar")
    return null
  }

  try {
    console.log("🔄 Sincronizando usuario:", sessionUser.email)

    // Buscar usuario existente
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", sessionUser.email)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError
    }

    if (existingUser) {
      console.log("✅ Usuario encontrado:", existingUser.id, "Rol:", existingUser.role)
      return existingUser
    } else {
      // Crear nuevo usuario
      console.log("➕ Creando nuevo usuario")
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          email: sessionUser.email,
          name: sessionUser.name || "",
          image: sessionUser.image || "",
          role: null, // Se asignará en select-role
        })
        .select()
        .single()

      if (insertError) throw insertError

      console.log("✅ Usuario creado:", newUser.id)
      return newUser
    }
  } catch (error) {
    console.error("❌ Error sincronizando usuario:", error)
    return null
  }
}

// Función para actualizar rol del usuario
export const updateUserRole = async (userId: string, role: "mentor" | "solicitante") => {
  try {
    console.log("🔄 Actualizando rol:", userId, "->", role)

    const { data, error } = await supabase.from("users").update({ role }).eq("id", userId).select().single()

    if (error) throw error

    console.log("✅ Rol actualizado correctamente")
    return data
  } catch (error) {
    console.error("❌ Error actualizando rol:", error)
    return null
  }
}

// Tipos actualizados
export interface User {
  id: string
  email: string
  name?: string
  image?: string
  role?: "mentor" | "solicitante"
  created_at: string
  updated_at: string
}

export interface MentorProfile {
  id: string
  user_id: string
  nombre: string
  foto?: string
  area_experiencia: string
  anos_experiencia: number
  disponibilidad: string[]
  descripcion?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface SolicitanteProfile {
  id: string
  user_id: string
  nombre: string
  edad: number
  area_interes: string
  descripcion?: string
  created_at: string
  updated_at: string
}

export interface Solicitud {
  id: string
  solicitante_id: string
  mentor_id: string
  estado: "pendiente" | "aceptada" | "rechazada"
  mensaje: string
  enlace_meet?: string
  fecha_sesion?: string
  created_at: string
  updated_at: string
}

export interface Sesion {
  id: string
  solicitud_id: string
  mentor_id: string
  solicitante_id: string
  fecha: string
  enlace_meet: string
  estado: "programada" | "completada" | "cancelada"
  notas?: string
  created_at: string
  updated_at: string
}

// Tipos extendidos con joins
export interface SolicitudWithProfiles extends Solicitud {
  mentor_profile?: MentorProfile
  solicitante_profile?: SolicitanteProfile
  mentor_user?: User
  solicitante_user?: User
}

export interface SesionWithProfiles extends Sesion {
  mentor_profile?: MentorProfile
  solicitante_profile?: SolicitanteProfile
  mentor_user?: User
  solicitante_user?: User
}
