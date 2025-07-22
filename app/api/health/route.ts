import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Verificar conexión a Supabase
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Error conectando a Supabase",
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    // Verificar tablas
    const tables = ["users", "mentor_profiles", "solicitante_profiles", "solicitudes", "sesiones"]
    const tableStatus = {}

    for (const table of tables) {
      try {
        const { count, error: tableError } = await supabase.from(table).select("*", { count: "exact", head: true })

        if (tableError) {
          tableStatus[table] = { status: "error", error: tableError.message }
        } else {
          tableStatus[table] = { status: "ok", count }
        }
      } catch (err) {
        tableStatus[table] = { status: "error", error: err.message }
      }
    }

    return NextResponse.json({
      status: "ok",
      message: "Sistema funcionando correctamente",
      database: {
        connected: true,
        tables: tableStatus,
      },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "missing",
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "configured" : "missing",
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "configured" : "missing",
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Error interno del servidor",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
