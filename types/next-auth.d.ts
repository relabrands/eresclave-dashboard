declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: "mentor" | "solicitante" | null
    }
  }

  interface User {
    id: string
    role?: "mentor" | "solicitante" | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: "mentor" | "solicitante" | null
  }
}
