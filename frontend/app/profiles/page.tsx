'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { API_ENDPOINTS } from '@/endpoints/endpoint'
import { NavBar } from '@/components/NavBar'

interface User {
  createdAt: string
  email: string
  id: string
  lastModifiedAt: string
  name: string
  orgDescription: string
  orgFavIconURL: string
  orgId: string
  orgLogoURL: string
  orgName: string
  orgPrivacyPolicy: string
  orgSupportEmail: string
  orgTermsOfUse: string
  orgURL: string
  planName: string
  roleType: string
}

interface ProfileData {
  user: User
}

export default function ProfilesPage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      try {
        const response = await fetch(API_ENDPOINTS.PROFILE, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data: ProfileData = await response.json()
          setProfileData(data)
        } else {
          const errorData = await response.json()
          setError(errorData.message || 'Failed to fetch profile')
          if (response.status === 401) {
            localStorage.removeItem('token')
            router.push('/')
          }
        }
      } catch (error) {
        setError('An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  // No longer needed as we have a nav link for chat

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-semibold mb-6 text-foreground">User Profile</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-6 shadow-apple">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-medium">Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {profileData ? (
          <Card className="overflow-hidden shadow-apple-lg border border-border/40 rounded-2xl">
            <div className="bg-primary/5 p-8 pb-16 relative">
              <div className="absolute h-40 w-40 bg-primary/10 rounded-full -top-20 -right-20 backdrop-blur-md"></div>
              <div className="absolute h-20 w-20 bg-accent/10 rounded-full -bottom-10 -left-10 backdrop-blur-md"></div>
            </div>
            
            <CardHeader className="-mt-12 relative">
              <div className="flex items-center">
                <Avatar className="w-20 h-20 border-4 border-background shadow-apple">
                  <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${profileData.user.name}`} alt={profileData.user.name} />
                  <AvatarFallback className="text-xl font-semibold">{profileData.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <CardTitle className="text-2xl font-semibold">{profileData.user.name}</CardTitle>
                  <CardDescription className="text-base">{profileData.user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-muted/40 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground mb-1">Organization</p>
                  <p className="font-medium">{profileData.user.orgName || 'Not Provided'}</p>
                </div>
                
                <div className="bg-muted/40 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <p className="font-medium">{profileData.user.roleType || 'Not Provided'}</p>
                </div>
                
                <div className="bg-muted/40 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground mb-1">Plan</p>
                  <p className="font-medium">{profileData.user.planName || 'Not Provided'}</p>
                </div>
                
                {profileData.user.orgURL && (
                  <div className="bg-muted/40 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-sm text-muted-foreground mb-1">Website</p>
                    <a href={profileData.user.orgURL} target="_blank" rel="noopener noreferrer" 
                      className="font-medium text-primary hover:underline">
                      {profileData.user.orgURL.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </div>
                )}
              </div>
              
              {profileData.user.orgDescription && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">About Organization</h3>
                  <p className="text-muted-foreground">{profileData.user.orgDescription}</p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="bg-muted/20 border-t border-border/30 py-4 px-6">
              <p className="text-sm text-muted-foreground">
                Use the navigation menu to access chat features and other sections of the application.
              </p>
            </CardFooter>
          </Card>
        ) : (
          <Alert className="shadow-apple bg-background/80 backdrop-blur-sm border border-border/40">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-medium">No Profile Data</AlertTitle>
            <AlertDescription>Unable to retrieve user profile data.</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}