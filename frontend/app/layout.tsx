import '@/styles/globals.css'
import './animations.css'
import localFont from 'next/font/local'

// Load local SF Pro font
const sfPro = localFont({
  src: [
    {
      path: '../app/fonts/sf-pro-display-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../app/fonts/sf-pro-display-medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../app/fonts/sf-pro-display-semibold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../app/fonts/sf-pro-display-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sf-pro',
})

export const metadata = {
  title: 'AI Chat App',
  description: 'Chat with AI using our advanced platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={sfPro.variable}>
      <body className="font-sf-pro">{children}</body>
    </html>
  )
}