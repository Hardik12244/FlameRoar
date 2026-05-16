import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key — set VITE_CLERK_PUBLISHABLE_KEY in .env")
}

const localizationOverride = {
  socialButtonsBlockButton: 'Sign in with {{provider|titleize}}',
  signIn: {
    start: {
      title: 'Sign in to FlameRoar',
      subtitle: 'Continue your adventure',
      actionText: 'New here?',
      actionLink: 'Sign up'
    }
  },
  signUp: {
    start: {
      title: 'Create your Hero',
      subtitle: 'Join FlameRoar and start your adventure',
      actionText: 'Already a hero?',
      actionLink: 'Sign in'
    }
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      signInUrl="/auth"
      signUpUrl="/auth"
      localization={localizationOverride}
      appearance={{
        layout: {
          applicationName: 'FlameRoar',
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
