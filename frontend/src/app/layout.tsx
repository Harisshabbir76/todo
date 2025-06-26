
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        
        <main className="pt-20 min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
          <Toaster
            position="top-center"
            gutter={12}
            containerStyle={{
              marginTop: '80px' // Prevents overlap with navbar
            }}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'white',
                padding: '16px 24px',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                fontSize: '15px',
                maxWidth: '500px'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: 'white',
                },
                style: {
                  borderLeft: '4px solid #10b981',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: 'white',
                },
                style: {
                  borderLeft: '4px solid #ef4444',
                },
              },
              loading: {
                style: {
                  borderLeft: '4px solid #0ea5e9',
                }
              }
            }}
          />
        </main>
      </body>
    </html>
  );
}