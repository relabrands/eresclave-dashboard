import { createClient } from "@supabase/supabase-js"

// Configuración de Supabase - ACTUALIZAR CON TUS CREDENCIALES
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validación de variables de entorno
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Variables de entorno de Supabase faltantes:")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅" : "❌")
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅" : "❌")
  throw new Error("Variables de entorno de Supabase no configuradas")
}

console.log("🔧 Configurando Supabase...")
console.log("URL:", supabaseUrl)
console.log("Key configurada:", !!supabaseAnonKey)

// Cliente de Supabase con configuración optimizada
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // No persistir sesión (usamos NextAuth)
    autoRefreshToken: false, // No refrescar token automáticamente
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
  db: {
    schema: "public",
  },
})

// Función para verificar la conexión
export const testConnection = async () => {
  try {
    console.log("🔍 Probando conexión a Supabase...")

    // Test básico de conexión
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      console.error("❌ Error en test de conexión:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ Conexión a Supabase exitosa")
    return { success: true, data }
  } catch (error) {
    console.error("❌ Error de conexión:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

// Función para verificar estructura de base de datos
export const verifyDatabaseStructure = async () => {
  try {
    console.log("🔍 Verificando estructura de base de datos...")

    const tables = ["users", "mentor_profiles", "solicitante_profiles", "solicitudes", "sesiones"]
    const results = []

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(1)

        if (error) {
          results.push({ table, status: "error", error: error.message })
        } else {
          results.push({ table, status: "ok", count: data?.length || 0 })
        }
      } catch (err) {
        results.push({ table, status: "error", error: "Tabla no existe" })
      }
    }

    console.log("📊 Estructura de base de datos:", results)
    return results
  } catch (error) {
    console.error("❌ Error verificando estructura:", error)
    return []
  }
}

// Tipos de TypeScript para la base de datos
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          image: string | null
          role: "mentor" | "solicitante" | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          image?: string | null
          role?: "mentor" | "solicitante" | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          image?: string | null
          role?: "mentor" | "solicitante" | null
          created_at?: string
          updated_at?: string
        }
      }
      mentor_profiles: {
        Row: {
          id: string
          user_id: string
          nombre: string
          foto: string | null
          area_experiencia: string
          anos_experiencia: number
          disponibilidad: string[]
          descripcion: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nombre: string
          foto?: string | null
          area_experiencia: string
          anos_experiencia: number
          disponibilidad?: string[]
          descripcion?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nombre?: string
          foto?: string | null
          area_experiencia?: string
          anos_experiencia?: number
          disponibilidad?: string[]
          descripcion?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // ... otros tipos de tablas
    }
  }
}
