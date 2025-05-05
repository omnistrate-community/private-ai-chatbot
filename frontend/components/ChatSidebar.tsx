'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { PlusCircle, MessageSquare } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Thread {
  ID: string;
  Name: string;
  CreatedAt: string;
  UpdatedAt: string;
  UserID: string;
  OrgID: string;
  Email: string;
}

interface ChatSidebarProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
  isLoading: boolean;
  threadName: string;
  setThreadName: (name: string) => void;
  chatDescription: string;
  setChatDescription: (description: string) => void;
}

export function ChatSidebar({
  threads,
  selectedThreadId,
  onSelectThread,
  onNewChat,
  isLoading,
  threadName,
  setThreadName,
  chatDescription,
  setChatDescription
}: ChatSidebarProps) {
  const [open, setOpen] = useState(false)
  
  const handleCreateChat = () => {
    onNewChat()
    setOpen(false)
  }
  
  function renderThreads() {
    return threads.map((thread, index) => {
      return (
        <React.Fragment key={thread.ID}>
          <Button
            variant={selectedThreadId === thread.ID ? "default" : "ghost"}
            className={cn(
              "w-full justify-start text-left font-normal",
              selectedThreadId === thread.ID 
                ? "bg-black text-white hover:bg-black/90" 
                : "hover:bg-accent/50"
            )}
            onClick={() => onSelectThread(thread.ID)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span className="truncate">{thread.Name}</span>
          </Button>
          {index < threads.length - 1 && (
            <div className="h-px bg-border/40 mx-1" />
          )}
        </React.Fragment>
      );
    });
  }
  
  function renderEmptyState() {
    if (threads.length === 0 && !isLoading) {
      return (
        <div className="py-6 text-center text-muted-foreground text-sm">
          No chat threads yet.
        </div>
      );
    }
    return null;
  }
  
  function renderNewChatButton() {
    return (
      <>
        <div className="h-[2px] bg-border/70 mx-1 my-2" />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button 
              disabled={isLoading}
              className="bg-[#0A84FF] text-white hover:bg-[#0A84FF]/80 h-9 w-full py-2 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center cursor-pointer disabled:opacity-50 transition-colors"
              onClick={() => setOpen(true)}
            >
              <PlusCircle className="mr-1 h-3.5 w-3.5" />
              New Chat
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Chat</DialogTitle>
              <DialogDescription>
                Give your chat a name and description to help AI understand the context.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="chat-name">Chat Name</Label>
                <Input
                  id="chat-name"
                  placeholder="e.g., Project Brainstorming, Technical Support"
                  value={threadName}
                  onChange={(e) => setThreadName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="chat-description">
                  Description (optional)
                </Label>
                <Textarea
                  id="chat-description"
                  placeholder="Describe what this chat is about. This will be used as context for the AI."
                  value={chatDescription}
                  onChange={(e) => setChatDescription(e.target.value)}
                  className="col-span-3 min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  This description will be used as context in the AI system prompt.
                </p>
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button variant="secondary" onClick={() => {
                setThreadName('')
                setChatDescription('')
              }}>
                Reset
              </Button>
              <Button 
                type="submit" 
                onClick={handleCreateChat}
                disabled={isLoading || !threadName.trim()}
                className="bg-[#0A84FF] text-white hover:bg-[#0A84FF]/90 py-1.5 px-2.5 text-sm font-medium rounded-md"
                style={{ backgroundColor: '#0A84FF' }}
              >
                Create Chat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  return (
    <div className="w-64 border-r border-border h-[calc(100vh-56px)] flex flex-col bg-card">      
      <ScrollArea className="flex-1 p-4 pb-0">
        <div className="space-y-2">
          {renderThreads()}
          {renderEmptyState()}
          {renderNewChatButton()}
        </div>
      </ScrollArea>
    </div>
  );
}