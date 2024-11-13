'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { API_ENDPOINTS } from '@/endpoints/endpoint'

interface Thread {
  ID: string;
  Name: string;
  CreatedAt: string;
  UpdatedAt: string;
  UserID: string;
  OrgID: string;
  Email: string;
}

interface Message {
  CreatedAt: string;
  ThreadID: string;
  Content: string;
  MessageType: 'response' | 'query';
}

export default function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [threadName, setThreadName] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchThreads()
  }, [])

  useEffect(() => {
    if (selectedThreadId) {
      fetchMessages(selectedThreadId)
    }
  }, [selectedThreadId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchThreads = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.CHAT}/thread`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch threads');
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_ENDPOINTS.CHAT}/thread/${threadId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setThreadName(data.thread_name)
        setMessages(data.messages)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch messages')
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

  const createNewThread = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_ENDPOINTS.CHAT}/thread`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: threadName || 'New Chat' })
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedThreadId(data.threadId)
        await fetchThreads()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to create new thread')
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedThreadId) return

    const newMessage: Message = {
      CreatedAt: new Date().toISOString(),
      ThreadID: selectedThreadId,
      Content: input,
      MessageType: 'query'
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_ENDPOINTS.CHAT}/thread/${selectedThreadId}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: input })
      })

      if (response.ok) {
        const data = await response.json()
        const aiMessage: Message = {
          CreatedAt: new Date().toISOString(),
          ThreadID: selectedThreadId,
          Content: data.response,
          MessageType: 'response'
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to get AI response')
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

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-64px)] flex flex-col">
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle>Chat with AI</CardTitle>
          <p className="text-sm text-muted-foreground">Start a new conversation or continue an existing one</p>
          <div className="flex items-center space-x-2 mt-2">
            <Input
              value={threadName}
              onChange={(e) => setThreadName(e.target.value)}
              placeholder="Enter chat name"
              className="flex-grow"
            />
            <Button onClick={createNewThread} disabled={isLoading}>
              Start New Chat
            </Button>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Select a chat thread:</h3>
            <div className="flex flex-wrap gap-2">
              {threads.map((thread) => (
                <Button
                  key={thread.ID}
                  variant={selectedThreadId === thread.ID ? "secondary" : "outline"}
                  onClick={() => setSelectedThreadId(thread.ID)}
                >
                  {thread.Name}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="h-[calc(100vh-350px)] overflow-y-auto">
            <div className="space-y-4 p-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.MessageType === 'query' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end space-x-2 ${message.MessageType === 'query' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.MessageType === 'query' ? '/user-avatar.png' : '/ai-avatar.png'} />
                      <AvatarFallback>{message.MessageType === 'query' ? 'U' : 'AI'}</AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      message.MessageType === 'query' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <p className="text-sm">{message.Content}</p>
                      <p className="text-xs opacity-50 mt-1">
                        {new Date(message.CreatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading || !selectedThreadId}
            />
            <Button type="submit" disabled={isLoading || !selectedThreadId}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}