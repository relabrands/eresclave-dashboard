"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { MentorDashboardSupabase } from "@/components/mentor-dashboard-supabase"
import { useSupabaseData } from "@/hooks/use-supabase-data"

export default function MentorDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { currentUser, loading } = useSupabaseData()

  useEffect(() => {
    if (status === "loading" || loading) {
      return
    }

    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (currentUser && currentUser.role !== "mentor") {
      if (currentUser.role === "solicitante") {
        router.push("/dashboard/solicitante")
      } else {
        router.push("/select-role")
      }
    }
  }, [session, status, router, currentUser, loading])

  if (status === "loading" || loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center eresclave-gradient">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    )
  }

  if (currentUser.role !== "mentor") {
    return (
      <div className="min-h-screen flex items-center justify-center eresclave-gradient">
        <div className="text-white text-lg">Redirigiendo...</div>
      </div>
    )
  }

  return <MentorDashboardSupabase />
}
