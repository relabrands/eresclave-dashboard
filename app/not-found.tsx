import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center eresclave-gradient p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="text-6xl font-bold text-eresclave-teal mb-4">404</div>
          <CardTitle className="text-2xl font-bold">Página no encontrada</CardTitle>
          <CardDescription>La página que estás buscando no existe o ha sido movida.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">Verifica la URL o regresa a la página de inicio para continuar navegando.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
