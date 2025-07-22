"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { UserCheck, Users } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState<"mentor" | "solicitante">("solicitante")
  const { login, register } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    const success = isLogin ? await login(email, password, role) : await register(email, password, role)

    if (success) {
      toast({
        title: isLogin ? "Bienvenido" : "Registro exitoso",
        description: isLogin ? "Has iniciado sesión correctamente" : "Tu cuenta ha sido creada",
      })
    } else {
      toast({
        title: "Error",
        description: isLogin ? "Credenciales incorrectas" : "El email ya está registrado",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center eresclave-gradient p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-eresclave-teal">eresclave</CardTitle>
          <CardDescription className="text-gray-600">
            Red de Mentoría Social - Conectamos voluntarios con jóvenes, madres solteras, desempleados y emprendedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? "login" : "register"} onValueChange={(v) => setIsLogin(v === "login")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={role === "solicitante" ? "default" : "outline"}
                    onClick={() => setRole("solicitante")}
                    className={`flex items-center gap-2 ${
                      role === "solicitante"
                        ? "btn-eresclave-primary"
                        : "border-eresclave-teal text-eresclave-teal hover:bg-eresclave-teal hover:text-white"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Necesito mentoría
                  </Button>
                  <Button
                    type="button"
                    variant={role === "mentor" ? "default" : "outline"}
                    onClick={() => setRole("mentor")}
                    className={`flex items-center gap-2 ${
                      role === "mentor"
                        ? "btn-eresclave-secondary"
                        : "border-eresclave-orange text-eresclave-orange hover:bg-eresclave-orange hover:text-white"
                    }`}
                  >
                    <UserCheck className="h-4 w-4" />
                    Quiero ser mentor
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="focus:ring-eresclave-teal focus:border-eresclave-teal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="focus:ring-eresclave-teal focus:border-eresclave-teal"
                  />
                </div>

                <Button type="submit" className="w-full btn-eresclave-primary">
                  Iniciar Sesión
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={role === "solicitante" ? "default" : "outline"}
                    onClick={() => setRole("solicitante")}
                    className={`flex items-center gap-2 ${
                      role === "solicitante"
                        ? "btn-eresclave-primary"
                        : "border-eresclave-teal text-eresclave-teal hover:bg-eresclave-teal hover:text-white"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Necesito mentoría
                  </Button>
                  <Button
                    type="button"
                    variant={role === "mentor" ? "default" : "outline"}
                    onClick={() => setRole("mentor")}
                    className={`flex items-center gap-2 ${
                      role === "mentor"
                        ? "btn-eresclave-secondary"
                        : "border-eresclave-orange text-eresclave-orange hover:bg-eresclave-orange hover:text-white"
                    }`}
                  >
                    <UserCheck className="h-4 w-4" />
                    Quiero ser mentor
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="focus:ring-eresclave-teal focus:border-eresclave-teal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="focus:ring-eresclave-teal focus:border-eresclave-teal"
                  />
                </div>

                <Button type="submit" className="w-full btn-eresclave-primary">
                  Crear Cuenta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
