'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { API_ENDPOINTS } from '@/endpoints/endpoint'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('signin')
  const router = useRouter()
  const formContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const slider = document.querySelector('.slider') as HTMLElement
    const activeTabElement = document.querySelector(`[data-state="active"]`) as HTMLElement

    if (slider && activeTabElement) {
      slider.style.left = `${activeTabElement.offsetLeft}px`
      slider.style.width = `${activeTabElement.offsetWidth}px`
    }

    if (formContainerRef.current) {
      const activeForm = formContainerRef.current.querySelector('[data-state="active"]') as HTMLElement
      if (activeForm) {
        formContainerRef.current.style.height = `${activeForm.offsetHeight}px`
      }
    }
  }, [activeTab])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const isSignup = formData.get('action') === 'signup'

    const endpoint = isSignup ? API_ENDPOINTS.SIGNUP : API_ENDPOINTS.SIGNIN
    const body = isSignup
      ? {
          name: formData.get('name'),
          email: formData.get('email'),
          password: formData.get('password'),
          company_description: formData.get('company_description'),
          company_url: formData.get('company_url'),
          legal_company_name: formData.get('legal_company_name'),
        }
      : {
          email: formData.get('email'),
          password: formData.get('password'),
        }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        router.push('/profiles')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Authentication failed')
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle>Welcome to AI Chat App</CardTitle>
          <CardDescription>Login or create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Tabs defaultValue="signin" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4 relative">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <div className="slider absolute bottom-0 h-[2px] bg-primary transition-all duration-300 ease-in-out" />
            </TabsList>
            <div ref={formContainerRef} className="relative overflow-hidden transition-all duration-300 ease-in-out">
              <TabsContent value="signin" className="absolute top-0 left-0 w-full">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="hidden" name="action" value="signin" />
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" name="password" type="password" required />
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup" className="absolute top-0 left-0 w-full">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="hidden" name="action" value="signup" />
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input id="signup-name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" name="password" type="password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_description">Company Description</Label>
                    <Input id="company_description" name="company_description" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_url">Company URL</Label>
                    <Input id="company_url" name="company_url" type="url" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legal_company_name">Legal Company Name</Label>
                    <Input id="legal_company_name" name="legal_company_name" />
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? 'Signing Up...' : 'Sign Up'}
                  </Button>
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}