import { NextResponse } from "next/server"
import { testConnection, verifyDatabaseStructure } from "@/lib/supabase-config"

export async function GET() {
  try {
    console.log("🔍 Iniciando diagnóstico completo de Supabase...")

    // Información de configuración
    const config = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      environment: process.env.NODE_ENV,
    }

    // Test de conexión
    const connectionResult = await testConnection()

    // Verificar estructura
    const structure = await verifyDatabaseStructure()

    // Estadísticas
    const stats = {
      totalTables: structure.length,
      tablesOk: structure.filter((t) => t.status === "ok").length,
      tablesWithErrors: structure.filter((t) => t.status === "error").length,
    }

    const isHealthy = connectionResult.success && stats.tablesWithErrors === 0

    return NextResponse.json(
      {
        status: isHealthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        config,
        connection: connectionResult,
        structure,
        stats,
        recommendations: isHealthy
          ? []
          : [
              "Ejecutar el script setup-complete-database.sql",
              "Verificar variables de entorno",
              "Revisar permisos de Supabase",
            ],
      },
      {
        status: isHealthy ? 200 : 500,
      },
    )
  } catch (error) {
    console.error("❌ Error en diagnóstico:", error)

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Error desconocido",
        config: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
      },
      { status: 500 },
    )
  }
}
