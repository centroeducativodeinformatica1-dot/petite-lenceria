// src/pages/_app.js
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../hooks/useAuth'
import { CartProvider } from '../hooks/useCart'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Component {...pageProps} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'DM Sans, sans-serif',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#e06aa3', secondary: '#fff' },
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  )
}
