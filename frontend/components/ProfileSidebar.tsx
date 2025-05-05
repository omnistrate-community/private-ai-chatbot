'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { User, CreditCard } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ProfileSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileSidebar({
  activeTab,
  onTabChange,
}: ProfileSidebarProps) {
  const tabs = [
    {
      id: 'profile',
      name: 'Profile',
      icon: User
    },
    {
      id: 'billing',
      name: 'Billing & Usage',
      icon: CreditCard
    }
  ]
  
  return (
    <div className="w-64 border-r border-border h-[calc(100vh-56px)] flex flex-col bg-card">      
      <ScrollArea className="flex-1 p-4 pb-0">
        <div className="space-y-2">
          {tabs.map((tab, index) => (
            <React.Fragment key={tab.id}>
              <Button
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  activeTab === tab.id 
                    ? "bg-black text-white hover:bg-black/90" 
                    : "hover:bg-accent/50"
                )}
                onClick={() => onTabChange(tab.id)}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                <span className="truncate">{tab.name}</span>
              </Button>
              {index < tabs.length - 1 && (
                <div className="h-px bg-border/40 mx-1" />
              )}
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}