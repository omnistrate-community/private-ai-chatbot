'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from "lucide-react"
import { API_ENDPOINTS } from '@/endpoints/endpoint'
import { NavBar } from '@/components/NavBar'
import { ProfileSidebar } from '@/components/ProfileSidebar'
import { ProfileContent } from '@/components/ProfileContent'
import { BillingContent } from '@/components/BillingContent'

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
  const [activeTab, setActiveTab] = useState('profile')
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

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileContent profileData={profileData} error={error} />
      case 'billing':
        return <BillingContent />
      default:
        return <ProfileContent profileData={profileData} error={error} />
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar />
      <div className="flex flex-1">
        <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}