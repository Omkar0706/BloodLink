'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <Card className="p-8 w-full max-w-md">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <Card className="p-8 w-full max-w-md">
          <div className="text-center space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to BloodLink</h1>
              <p className="text-gray-600">You are successfully signed in!</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                {session.user?.image && (
                  <img 
                    src={session.user.image} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div className="text-left">
                  <p className="font-medium text-gray-900">{session.user?.name}</p>
                  <p className="text-sm text-gray-600">{session.user?.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Go to Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => signOut()}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <Card className="p-8 w-full max-w-md">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">BloodLink</h1>
            <p className="text-gray-600">AI-Powered Blood Donation Platform</p>
          </div>

          <div className="space-y-4">
            <div className="text-left space-y-2">
              <h3 className="font-semibold text-gray-900">Features:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Live donor tracking with GPS</li>
                <li>• AI-powered blood demand predictions</li>
                <li>• Smart donor-hospital matching</li>
                <li>• Real-time emergency alerts</li>
              </ul>
            </div>

            <Button 
              onClick={() => signIn('google')}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="white"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="white"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="white"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="white"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </Card>
    </div>
  )
}
