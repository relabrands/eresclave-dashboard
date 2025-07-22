import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      console.log("JWT Callback - trigger:", trigger, "token:", !!token, "user:", !!user)

      if (account && user) {
        token.id = user.id
        token.accessToken = account.access_token
        token.role = null // Se configurará después en select-role
        console.log("JWT - New token created for user:", user.email)
      }

      // Si se está actualizando la sesión (desde update()), actualizar el token
      if (trigger === "update" && session?.user?.role) {
        console.log("JWT - Updating token with role:", session.user.role)
        token.role = session.user.role
      }

      return token
    },
    async session({ session, token }) {
      console.log("Session Callback - session:", !!session, "token role:", token.role)

      if (session.user && token.id) {
        session.user.id = token.id as string
        session.user.role = token.role as "mentor" | "solicitante" | null
        console.log("Session - User ID:", session.user.id, "Role:", session.user.role)
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect Callback - url:", url, "baseUrl:", baseUrl)

      // Permitir URLs relativas
      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`
        console.log("Redirecting to relative URL:", redirectUrl)
        return redirectUrl
      }

      // Permitir URLs del mismo origen
      if (url.startsWith(baseUrl)) {
        console.log("Redirecting to same origin:", url)
        return url
      }

      // Para cualquier otra URL, redirigir al home
      console.log("Redirecting to baseUrl:", baseUrl)
      return baseUrl
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false, // Desactivar debug en producción
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
