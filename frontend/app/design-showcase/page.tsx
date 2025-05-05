'use client'

import { Button } from "@/components/ui/button"
import { AppleCard } from "@/components/ui/apple-card"
import { NavBar } from "@/components/NavBar"

export default function DesignShowcase() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto py-10 px-4 sm:px-6 space-y-10">
        <section>
          <h1 className="text-3xl font-semibold text-foreground mb-6">Apple-Inspired Design System</h1>
          <p className="text-muted-foreground mb-6">This page showcases the Apple-inspired design elements and components for our AI Chat application.</p>
        </section>
        
        <section className="space-y-6">
          <h2 className="text-2xl font-medium text-foreground">Typography</h2>
          <div className="grid gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Heading 1</h1>
              <p className="text-muted-foreground">SF Pro Display Bold - 36px</p>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold">Heading 2</h2>
              <p className="text-muted-foreground">SF Pro Display Semibold - 30px</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-medium">Heading 3</h3>
              <p className="text-muted-foreground">SF Pro Display Medium - 24px</p>
            </div>
            <div className="space-y-2">
              <p className="text-base">Body Text</p>
              <p className="text-muted-foreground">SF Pro Display Regular - 16px</p>
            </div>
          </div>
        </section>
        
        <section className="space-y-6">
          <h2 className="text-2xl font-medium text-foreground">Colors</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="h-20 w-full rounded-xl bg-primary"></div>
              <p className="text-sm font-medium">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 w-full rounded-xl bg-secondary"></div>
              <p className="text-sm font-medium">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 w-full rounded-xl bg-accent"></div>
              <p className="text-sm font-medium">Accent</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 w-full rounded-xl bg-muted"></div>
              <p className="text-sm font-medium">Muted</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 w-full rounded-xl bg-destructive"></div>
              <p className="text-sm font-medium">Destructive</p>
            </div>
          </div>
        </section>
        
        <section className="space-y-6">
          <h2 className="text-2xl font-medium text-foreground">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Default Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="pill">Pill Button</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        </section>
        
        <section className="space-y-6">
          <h2 className="text-2xl font-medium text-foreground">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AppleCard>
              <h3 className="text-lg font-medium mb-2">Standard Card</h3>
              <p className="text-muted-foreground">This is a standard card with subtle shadow and border.</p>
            </AppleCard>
            
            <AppleCard hover>
              <h3 className="text-lg font-medium mb-2">Hover Card</h3>
              <p className="text-muted-foreground">This card has a hover effect. Try hovering over it!</p>
            </AppleCard>
            
            <AppleCard gradient hover>
              <h3 className="text-lg font-medium mb-2">Gradient Card</h3>
              <p className="text-muted-foreground">This card has both gradient and hover effects.</p>
            </AppleCard>
          </div>
        </section>
      </main>
    </div>
  )
}