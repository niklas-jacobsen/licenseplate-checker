'use client'

import { useState, useEffect, Suspense } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/auth-context'
import { zUserScheme } from '@shared/validators'
import SimpleNavBar from '@/components/nav-bar-simple'
import LoginRedirectHandler from '@/components/login-redirect-handler'

export default function LogInPage() {
  const router = useRouter()
  const { logIn, user } = useAuth()

  const [redirect, setRedirect] = useState('/')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof zUserScheme>>({
    resolver: zodResolver(zUserScheme),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof zUserScheme>) {
    setIsLoading(true)
    setError(null)

    try {
      await logIn(values.email, values.password)
      router.push(redirect)
    } catch (err) {
      setError('Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      router.replace(redirect)
    }
  }, [user, router, redirect])

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <SimpleNavBar />
      <Suspense>
        <LoginRedirectHandler onResolve={setRedirect} />
      </Suspense>
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Log In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@example.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="**************"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Log In
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link
                href="/auth/register"
                className="text-blue-600 hover:underline"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
