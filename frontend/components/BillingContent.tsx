'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { format } from 'date-fns'
import { API_ENDPOINTS } from '@/endpoints/endpoint'
import { BillingDetailDialog } from './BillingDetailDialog'

interface UsageItem {
  dimension: string;
  total: number;
  startTime: string;
  endTime: string;
}

interface UsageData {
  usage: {
    usage: UsageItem[];
    startTime: string;
    endTime: string;
  }
}

export function BillingContent() {
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedDimension, setSelectedDimension] = useState('')
  const [selectedStartDate, setSelectedStartDate] = useState('')
  const [selectedEndDate, setSelectedEndDate] = useState('')
  
  const handleShowDetails = (dimension: string, startTime: string, endTime: string) => {
    setSelectedDimension(dimension)
    setSelectedStartDate(startTime)
    setSelectedEndDate(endTime)
    setDetailDialogOpen(true)
  }
  
  const handleDownloadCSV = (data: UsageData | null) => {
    if (!data || !data.usage || !Array.isArray(data.usage.usage) || data.usage.usage.length === 0) {
      return;
    }
    
    // Create CSV content
    const headers = ['Dimension', 'Total', 'Start Time', 'End Time'];
    const csvRows = [
      headers.join(','),
      ...data.usage.usage.map(item => 
        [
          `"${item.dimension}"`, 
          item.total,
          new Date(item.startTime).toISOString(),
          new Date(item.endTime).toISOString()
        ].join(',')
      )
    ];
    const csvContent = csvRows.join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Format date for filename
    const dateStr = data.usage.startTime ? 
      new Date(data.usage.startTime).toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0];
      
    // Set attributes and download
    link.setAttribute('href', url);
    link.setAttribute('download', `usage-report-${dateStr}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  useEffect(() => {
    const fetchUsageData = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication required')
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(API_ENDPOINTS.BILLING_USAGE, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          try {
            const data = await response.json()
            // Ensure data has the expected structure
            if (data && typeof data === 'object') {
              setUsageData(data)
            } else {
              setError('Invalid response format')
            }
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError)
            setError('Error parsing usage data')
          }
        } else {
          try {
            const errorData = await response.json()
            setError(errorData.message || 'Failed to fetch usage data')
          } catch (e) {
            setError(`Failed to fetch usage data: ${response.status}`)
          }
        }
      } catch (error) {
        console.error("Fetch error:", error)
        setError('An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsageData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6 shadow-apple">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="font-medium">Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground">Billing & Usage</h1>
      </div>
      
      {/* Detail Dialog */}
      <BillingDetailDialog 
        open={detailDialogOpen}
        setOpen={setDetailDialogOpen}
        dimension={selectedDimension}
        initialStartDate={selectedStartDate}
        initialEndDate={selectedEndDate}
      />
      
      {usageData ? (
        <div className="space-y-6">
          {/* Usage Overview Card */}
          <Card className="overflow-hidden shadow-apple border border-border/40 rounded-2xl bg-background">
            <CardHeader>
              <CardTitle className="text-xl">
                Usage Overview
              </CardTitle>
              <CardDescription>
                {usageData.usage && usageData.usage.startTime ? 
                  `Tracked since ${format(new Date(usageData.usage.startTime), 'MMMM d, yyyy')}` : 
                  'Current billing period'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {usageData.usage && Array.isArray(usageData.usage.usage) && 
                  usageData.usage.usage.map((item, index) => {                    
                    return (
                      <div 
                        key={index} 
                        className="bg-muted/30 p-5 rounded-xl border border-border/20 shadow-apple cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleShowDetails(
                          item.dimension, 
                          item.startTime,
                          item.endTime
                        )}
                      >
                        <p className="text-sm text-muted-foreground mb-1">{item.dimension}</p>
                        <p className="font-medium text-2xl text-foreground">
                          {item.total.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">Click for daily breakdown</p>
                      </div>
                    );
                  })
                }
              </div>
            </CardContent>
          </Card>
          
          {/* Usage Summary Card */}
          <Card className="overflow-hidden shadow-apple border border-border/40 rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">
                    Usage Details
                  </CardTitle>
                  <CardDescription>
                    {usageData.usage && usageData.usage.startTime && usageData.usage.endTime ? (
                      `${format(new Date(usageData.usage.startTime), 'MMM d, yyyy')} - ${format(new Date(usageData.usage.endTime), 'MMM d, yyyy')}`
                    ) : 'Current billing period'}
                  </CardDescription>
                </div>
                <div className="bg-muted px-3 py-1 rounded-full text-muted-foreground text-xs">
                  Updated hourly
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {usageData.usage && Array.isArray(usageData.usage.usage) && usageData.usage.usage.length > 0 ? (
                  usageData.usage.usage.map((item, index) => {                    
                    return (
                      <div 
                        key={index} 
                        className="p-5 rounded-xl border border-border/30 shadow-apple bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => handleShowDetails(
                          item.dimension, 
                          item.startTime,
                          item.endTime
                        )}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <p className="font-medium text-foreground/90">{item.dimension}</p>
                          <p className="text-xl font-semibold text-foreground">{item.total.toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            {item.startTime && typeof item.startTime === 'string' ? 
                              format(new Date(item.startTime), 'MMM d, yyyy') : 'N/A'} - 
                            {item.endTime && typeof item.endTime === 'string' ? 
                              format(new Date(item.endTime), 'MMM d, yyyy') : 'N/A'}
                          </p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-background text-muted-foreground border border-border/40">
                            {item.dimension.includes("Storage") ? "Storage" : 
                             item.dimension.includes("CPU") ? "Compute" : 
                             item.dimension.includes("Memory") ? "Memory" : "Resource"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">Click for daily breakdown</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-muted/20 p-6 rounded-xl border border-border/30 text-center">
                    <p className="text-muted-foreground mb-2">No usage data available</p>
                    <p className="text-xs text-muted-foreground/70">
                      Usage information will appear here once your account has activity.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="bg-muted/20 border-t border-border/30 py-4 px-6">
              <div className="w-full flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Usage data is updated hourly. For billing inquiries, please contact support.
                </p>
                <button 
                  onClick={() => handleDownloadCSV(usageData)}
                  className="text-xs px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1 bg-background border border-border hover:bg-muted"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Download CSV</span>
                </button>
              </div>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <Alert className="shadow-apple bg-background/80 backdrop-blur-sm border border-border/40">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-medium">No Usage Data</AlertTitle>
          <AlertDescription>Unable to retrieve usage data.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}