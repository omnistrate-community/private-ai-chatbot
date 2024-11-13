'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { API_ENDPOINTS } from '@/endpoints/endpoint'

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

  const handleChatClick = () => {
    router.push('/chat')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {profileData ? (
        <Card>
          <CardHeader>
            <Avatar className="w-12 h-12">
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${profileData.user.name}`} alt={profileData.user.name} />
              <AvatarFallback>{profileData.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle>{profileData.user.name}</CardTitle>
            <CardDescription>{profileData.user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Organization:</strong> {profileData.user.orgName}</p>
              <p><strong>Role:</strong> {profileData.user.roleType}</p>
              <p><strong>Plan:</strong> {profileData.user.planName}</p>
              {profileData.user.orgDescription && (
                <p><strong>Organization Description:</strong> {profileData.user.orgDescription}</p>
              )}
              {profileData.user.orgURL && (
                <p><strong>Organization URL:</strong> <a href={profileData.user.orgURL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{profileData.user.orgURL}</a></p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleChatClick}>Chat with AI</Button>
          </CardFooter>
        </Card>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Profile Data</AlertTitle>
          <AlertDescription>Unable to retrieve user profile data.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}