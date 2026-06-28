import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const FECOAGRO_LOGO =
  'https://www.fecoagro.coop.br/wp-content/uploads/2021/10/logo-top.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        toast.error('Erro ao entrar. Verifique suas credenciais.')
      } else {
        toast.success('Login realizado com sucesso!')
        navigate('/')
      }
    } catch {
      toast.error('Ocorreu um erro inesperado.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F8F5] p-4">
      <Card className="w-full max-w-md shadow-elevation">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img
              src={FECOAGRO_LOGO}
              alt="Fecoagro"
              className="h-12 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            Gestão Contábil
          </CardTitle>
          <CardDescription className="text-center">
            Digite seu e-mail e senha para acessar sua conta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
            <div className="text-sm text-center text-gray-500">
              Não tem uma conta?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Cadastrar
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
