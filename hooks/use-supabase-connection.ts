"use client"

import { useState, useEffect } from "react"
import { testConnection, verifyDatabaseStructure } from "@/lib/supabase-config"

export function useSupabaseConnection() {
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting")
  const [error, setError] = useState<string | null>(null)
  const [databaseStructure, setDatabaseStructure] = useState<any[]>([])

  useEffect(() => {
    const checkConnection = async () => {
      console.log("🚀 Iniciando verificación de Supabase...")

      try {
        // Test de conexión
        const connectionResult = await testConnection()

        if (!connectionResult.success) {
          setConnectionStatus("error")
          setError(connectionResult.error || "Error de conexión")
          return
        }

        // Verificar estructura
        const structure = await verifyDatabaseStructure()
        setDatabaseStructure(structure)

        // Verificar si todas las tablas están OK
        const allTablesOk = structure.every((table) => table.status === "ok")

        if (allTablesOk) {
          setConnectionStatus("connected")
          setError(null)
          console.log("✅ Supabase configurado correctamente")
        } else {
          setConnectionStatus("error")
          setError("Algunas tablas no están configuradas correctamente")
          console.error("❌ Problemas con la estructura de base de datos:", structure)
        }
      } catch (err) {
        console.error("❌ Error en verificación:", err)
        setConnectionStatus("error")
        setError(err instanceof Error ? err.message : "Error desconocido")
      }
    }

    checkConnection()
  }, [])

  const retry = () => {
    setConnectionStatus("connecting")
    setError(null)
    // Recargar la página para reiniciar la verificación
    window.location.reload()
  }

  return {
    connectionStatus,
    error,
    databaseStructure,
    retry,
  }
}
