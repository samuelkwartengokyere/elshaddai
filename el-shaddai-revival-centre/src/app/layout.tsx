// Using system fonts instead of Google Fonts to avoid build-time network dependency
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ClientLayout from '@/components/ClientLayout'

export const metadata = {
  title: 'The Church Of Pentecost - Welcome Home',
  description: 'A community of faith, hope, and love. Welcome to The Church Of Pentecost, El-Shaddai Revival Centre.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ClientLayout>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </ClientLayout>
      </body>
    </html>
  )
}

