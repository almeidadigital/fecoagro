import { Component, ErrorInfo, ReactNode } from 'react'

interface State {
  hasError: boolean
}

export class AuthErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: false }
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    const msg = String(error?.message || '')
    if (
      msg.includes('Invalid Refresh Token') ||
      msg.includes('Refresh Token Not Found') ||
      msg.includes('AuthApiError')
    ) {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (key.startsWith('sb-') && key.includes('auth-token')) {
            localStorage.removeItem(key)
          }
        })
      } catch {
        // ignore
      }
    }
  }

  render() {
    return this.props.children
  }
}
