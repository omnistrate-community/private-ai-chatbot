'use client'

import { useState, useEffect } from 'react'
import { format, parse, isValid, parseISO, addDays } from 'date-fns'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, BarChart3 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { API_ENDPOINTS } from '@/endpoints/endpoint'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface UsageDetailItem {
  dimension: string;
  startTime: string;
  endTime: string;
  total: number;
}

interface UsageDetailData {
  dimension: string;
  details: UsageDetailItem[];
}

interface BillingDetailDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  dimension: string;
  initialStartDate: string;
  initialEndDate: string;
}

export function BillingDetailDialog({ 
  open, 
  setOpen, 
  dimension,
  initialStartDate,
  initialEndDate
}: BillingDetailDialogProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [detailData, setDetailData] = useState<UsageDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Format date for display (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      if (isValid(date)) {
        return format(date, 'yyyy-MM-dd')
      }
    } catch (e) {
      // Return empty string if parsing fails
    }
    return ''
  }
  
  // Format date for API (RFC3339)
  const formatDateForAPI = (dateString: string) => {
    try {
      // Parse the YYYY-MM-DD format
      const date = parse(dateString, 'yyyy-MM-dd', new Date())
      if (isValid(date)) {
        // Format as RFC3339
        return date.toISOString()
      }
    } catch (e) {
      // Return empty string if parsing fails
    }
    return ''
  }
  
  // Initialize dates when dialog opens
  useEffect(() => {
    if (open) {
      setStartDate(formatDateForInput(initialStartDate))
      setEndDate(formatDateForInput(initialEndDate))
      fetchDetailData(initialStartDate, initialEndDate)
    }
  }, [open, initialStartDate, initialEndDate])
  
  const fetchDetailData = async (start: string, end: string) => {
    setIsLoading(true)
    setError(null)
    setDetailData(null)
    
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Authentication required')
      setIsLoading(false)
      return
    }

    try {
      const apiStart = formatDateForAPI(start) || initialStartDate
      const apiEnd = formatDateForAPI(end) || initialEndDate
      
      const url = `${API_ENDPOINTS.BILLING_USAGE}/range/${encodeURIComponent(apiStart)}/${encodeURIComponent(apiEnd)}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        // Process the data to extract the relevant dimension
        if (data && data.usage && Array.isArray(data.usage.usage)) {
          // Filter usage items for the specific dimension
          const filteredItems = data.usage.usage.filter((item: any) => 
            item.dimension === dimension
          )
          
          if (filteredItems && filteredItems.length > 0) {
            // Sort by startTime
            const sortedItems = [...filteredItems].sort((a, b) => 
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            )
            
            setDetailData({
              dimension: dimension,
              details: sortedItems
            })
          } else {
            setDetailData({
              dimension: dimension,
              details: []
            })
          }
        } else {
          setDetailData({
            dimension: dimension,
            details: []
          })
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch detailed usage data')
      }
    } catch (error) {
      console.error("Error fetching detail data:", error)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleApplyDates = () => {
    fetchDetailData(startDate, endDate)
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        <DialogHeader>
          <div className="flex items-center mb-1">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{
                backgroundColor: 
                  dimension.includes("Storage") ? "#0A84FF" : 
                  dimension.includes("CPU") ? "#FF9500" : 
                  dimension.includes("Memory") ? "#5856D6" : "#999999"
              }}
            ></div>
            <DialogTitle>{dimension} - Daily Usage</DialogTitle>
          </div>
          <DialogDescription>
            View a breakdown of usage by day for the selected date range.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex space-x-4 items-end">
            <div className="grid gap-2 flex-1 relative">
              <Label htmlFor="start-date">Start Date</Label>
              <div className="relative">
                {/* Custom date input with better clickability */}
                <div 
                  className="relative flex items-center border border-input rounded-md shadow-sm focus-within:ring-1 focus-within:ring-ring hover:bg-muted/10 cursor-pointer"
                  onClick={() => {
                    // Create a synthetic mouse event to click on the date input
                    const dateInput = document.getElementById('start-date-hidden');
                    if (dateInput) {
                      dateInput.showPicker();
                    }
                  }}
                >
                  <div className="p-2 px-3 flex-1">
                    {startDate ? format(parse(startDate, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy') : 'Select date'}
                  </div>
                  <div className="pr-3 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                      <line x1="16" x2="16" y1="2" y2="6"></line>
                      <line x1="8" x2="8" y1="2" y2="6"></line>
                      <line x1="3" x2="21" y1="10" y2="10"></line>
                    </svg>
                  </div>
                  <input
                    id="start-date-hidden"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="sr-only"
                    aria-label="Start Date"
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2 flex-1 relative">
              <Label htmlFor="end-date">End Date</Label>
              <div className="relative">
                {/* Custom date input with better clickability */}
                <div 
                  className="relative flex items-center border border-input rounded-md shadow-sm focus-within:ring-1 focus-within:ring-ring hover:bg-muted/10 cursor-pointer"
                  onClick={() => {
                    // Create a synthetic mouse event to click on the date input
                    const dateInput = document.getElementById('end-date-hidden');
                    if (dateInput) {
                      dateInput.showPicker();
                    }
                  }}
                >
                  <div className="p-2 px-3 flex-1">
                    {endDate ? format(parse(endDate, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy') : 'Select date'}
                  </div>
                  <div className="pr-3 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                      <line x1="16" x2="16" y1="2" y2="6"></line>
                      <line x1="8" x2="8" y1="2" y2="6"></line>
                      <line x1="3" x2="21" y1="10" y2="10"></line>
                    </svg>
                  </div>
                  <input
                    id="end-date-hidden"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="sr-only"
                    aria-label="End Date"
                  />
                </div>
              </div>
            </div>
            <Button 
              onClick={handleApplyDates}
              disabled={isLoading || !startDate || !endDate}
              className="mb-px transition-all bg-primary/90 hover:bg-primary text-white hover:shadow-sm"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Apply
            </Button>
          </div>
          
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!isLoading && !error && detailData && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-3">Daily Usage</h3>
              
              {detailData.details.length > 0 ? (
                <div className="space-y-8">
                  {/* Chart View */}
                  <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-black/10 dark:to-black/5 p-6 pt-8 rounded-xl border border-border/30 shadow-inner">
                    <Bar 
                      data={{
                        labels: detailData.details.map(item => format(parseISO(item.startTime), 'MMM d')),
                        datasets: [
                          {
                            label: dimension,
                            data: detailData.details.map(item => item.total),
                            backgroundColor: context => {
                              const ctx = context.chart.ctx;
                              const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                              
                              if (dimension.includes("Storage")) {
                                gradient.addColorStop(0, 'rgba(10, 132, 255, 0.8)');
                                gradient.addColorStop(1, 'rgba(10, 132, 255, 0.2)');
                              } else if (dimension.includes("CPU")) {
                                gradient.addColorStop(0, 'rgba(255, 149, 0, 0.8)');
                                gradient.addColorStop(1, 'rgba(255, 149, 0, 0.2)');
                              } else if (dimension.includes("Memory")) {
                                gradient.addColorStop(0, 'rgba(88, 86, 214, 0.8)');
                                gradient.addColorStop(1, 'rgba(88, 86, 214, 0.2)');
                              } else {
                                gradient.addColorStop(0, 'rgba(153, 153, 153, 0.8)');
                                gradient.addColorStop(1, 'rgba(153, 153, 153, 0.2)');
                              }
                              
                              return gradient;
                            },
                            borderColor: 
                              dimension.includes("Storage") ? "rgba(10, 132, 255, 0.8)" : 
                              dimension.includes("CPU") ? "rgba(255, 149, 0, 0.8)" : 
                              dimension.includes("Memory") ? "rgba(88, 86, 214, 0.8)" : 
                              "rgba(153, 153, 153, 0.8)",
                            borderWidth: 1,
                            borderRadius: 6,
                            hoverBackgroundColor: 
                              dimension.includes("Storage") ? "rgba(10, 132, 255, 1)" : 
                              dimension.includes("CPU") ? "rgba(255, 149, 0, 1)" : 
                              dimension.includes("Memory") ? "rgba(88, 86, 214, 1)" : 
                              "rgba(153, 153, 153, 1)",
                            hoverBorderColor:
                              dimension.includes("Storage") ? "rgba(10, 132, 255, 1)" : 
                              dimension.includes("CPU") ? "rgba(255, 149, 0, 1)" : 
                              dimension.includes("Memory") ? "rgba(88, 86, 214, 1)" : 
                              "rgba(153, 153, 153, 1)",
                            hoverBorderWidth: 2,
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: {
                          duration: 800,
                          easing: 'easeOutQuart'
                        },
                        plugins: {
                          legend: {
                            position: 'top' as const,
                            labels: {
                              usePointStyle: true,
                              pointStyle: 'circle',
                              padding: 20,
                              font: {
                                family: 'SF Pro, system-ui, sans-serif',
                                size: 12
                              }
                            }
                          },
                          title: {
                            display: false,
                          },
                          tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            titleColor: '#000',
                            bodyColor: '#000',
                            bodyFont: {
                              family: 'SF Pro, system-ui, sans-serif',
                              size: 14
                            },
                            titleFont: {
                              family: 'SF Pro, system-ui, sans-serif',
                              size: 14,
                              weight: 'bold'
                            },
                            padding: 12,
                            cornerRadius: 8,
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                            borderWidth: 1,
                            displayColors: true,
                            callbacks: {
                              label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                  label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                  label += context.parsed.y.toLocaleString();
                                }
                                return label;
                              },
                              // Add more details in the tooltip
                              afterLabel: function(context) {
                                // Get the corresponding data item
                                const dataIndex = context.dataIndex;
                                const item = detailData.details[dataIndex];
                                if (item) {
                                  return 'Period: ' + format(parseISO(item.startTime), 'MMM d') + 
                                    ' - ' + format(parseISO(item.endTime), 'MMM d, yyyy');
                                }
                                return '';
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: 'rgba(0, 0, 0, 0.05)',
                              drawBorder: false,
                            },
                            border: {
                              display: false
                            },
                            ticks: {
                              padding: 10,
                              callback: function(value) {
                                if (typeof value === 'number') {
                                  return value.toLocaleString();
                                }
                                return value;
                              },
                              font: {
                                family: 'SF Pro, system-ui, sans-serif',
                                size: 11
                              },
                              color: 'rgba(0, 0, 0, 0.6)'
                            }
                          },
                          x: {
                            grid: {
                              display: false
                            },
                            ticks: {
                              padding: 8,
                              font: {
                                family: 'SF Pro, system-ui, sans-serif',
                                size: 11
                              },
                              color: 'rgba(0, 0, 0, 0.6)'
                            }
                          }
                        },
                        layout: {
                          padding: {
                            top: 10,
                            right: 16,
                            bottom: 16,
                            left: 8,
                          }
                        },
                        interaction: {
                          mode: 'index' as const,
                          intersect: false,
                        },
                      }}
                      height={320}
                    />
                  </div>
                  
                  {/* Data Table */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Detailed Data</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {detailData.details.map((item, index) => (
                        <Card key={index} className="shadow-sm border-l-4" style={{
                          borderLeftColor: 
                            item.dimension.includes("Storage") ? "#0A84FF" : 
                            item.dimension.includes("CPU") ? "#FF9500" : 
                            item.dimension.includes("Memory") ? "#5856D6" : "#999999"
                        }}>
                          <CardContent className="p-4 flex justify-between items-center">
                            <div className="font-medium">
                              {format(parseISO(item.startTime), 'MMM d')} - {format(parseISO(item.endTime), 'MMM d, yyyy')}
                            </div>
                            <div className="text-lg font-semibold">{item.total.toLocaleString()}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-6">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p>No daily usage data available for this period.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}