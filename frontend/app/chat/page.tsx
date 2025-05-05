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
import { NavBar } from "@/components/NavBar"
import { ChatSidebar } from "@/components/ChatSidebar"

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
  const [chatDescription, setChatDescription] = useState('')
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
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
        body: JSON.stringify({ 
          name: threadName || 'New Chat',
          description: chatDescription || ''
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedThreadId(data.threadId)
        await fetchThreads()
        // Reset the form values
        setThreadName('')
        setChatDescription('')
        setShowNewChatDialog(false)
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
    
    // Build context from previous messages
    const conversationHistory = messages.map(msg => 
      `${msg.MessageType === 'query' ? 'User' : 'Assistant'}: ${msg.Content}`
    ).join('\n\n');
    
    // Include thread description as context if available
    const contextPrefix = chatDescription 
      ? `Context for this conversation: ${chatDescription}\n\n` 
      : '';
    
    // Combine everything for the complete context
    const fullContext = conversationHistory 
      ? `${contextPrefix}Previous conversation:\n${conversationHistory}\n\nUser: ${input}`
      : input;

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_ENDPOINTS.CHAT}/thread/${selectedThreadId}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: input,
          context: fullContext 
        })
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

  useEffect(() => {
    // Fix message container scrolling when selecting a thread
    if (selectedThreadId && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedThreadId, messages.length]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar 
          threads={threads}
          selectedThreadId={selectedThreadId}
          onSelectThread={(threadId) => setSelectedThreadId(threadId)}
          onNewChat={createNewThread}
          isLoading={isLoading}
          threadName={threadName}
          setThreadName={setThreadName}
          chatDescription={chatDescription}
          setChatDescription={setChatDescription}
        />
        
        <div className="flex-1 p-4">
          <Card className="h-[calc(100vh-72px)] flex flex-col">
            <CardHeader>
              <CardTitle>{selectedThreadId ? threadName || 'Chat with AI' : 'Select a chat or start a new one'}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedThreadId ? 'Continue your conversation with AI' : 'Choose a thread from the sidebar or click the New Chat button to create a new conversation'}
              </p>
            </CardHeader>
        <CardContent className="flex-grow overflow-hidden flex flex-col">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex-grow overflow-y-auto custom-scrollbar messages-container">
            {selectedThreadId ? (
              <div className="space-y-4 px-4 pb-8 pt-2">
                {messages.length > 0 ? (
                  <>
                    
                    {messages.map((message, index) => (
                      <div key={index} className={`flex ${message.MessageType === 'query' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end space-x-3 ${message.MessageType === 'query' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <Avatar className="w-8 h-8 border-2 border-background shadow-sm">
                            <AvatarImage src={message.MessageType === 'query' ? '/user-avatar.png' : '/ai-avatar.png'} />
                            <AvatarFallback className="font-medium">{message.MessageType === 'query' ? 'U' : 'AI'}</AvatarFallback>
                          </Avatar>
                          <div 
                            className={`max-w-[75%] px-4 py-3 shadow-sm message-bubble ${
                              message.MessageType === 'query' 
                                ? 'bg-[#0A84FF] text-white rounded-t-2xl rounded-bl-2xl rounded-br-md' 
                                : 'bg-[#F1F1F1] dark:bg-zinc-800 text-foreground rounded-t-2xl rounded-br-2xl rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm font-normal leading-relaxed whitespace-pre-wrap break-words">{message.Content}</p>
                            <p className={`text-xs mt-1.5 ${message.MessageType === 'query' ? 'text-blue-100' : 'text-muted-foreground'}`}>
                              {new Date(message.CreatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Reference for auto-scrolling */}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center max-w-md mx-auto">
                  <h3 className="text-xl font-medium mb-2">Welcome to AI Chat</h3>
                  <p>Select an existing conversation from the sidebar or start a new chat.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading || !selectedThreadId}
              className="bg-background/80 backdrop-blur-sm focus-visible:ring-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !selectedThreadId}
              variant="default"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
            </Button>
          </form>
        </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}