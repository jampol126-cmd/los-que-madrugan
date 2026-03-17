import { useState, useEffect, useCallback } from 'react'
import { verifyAdminToken } from '@/lib/api'

const AUTH_KEY = 'admin_token'

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_KEY)
    if (!storedToken) {
      setIsLoading(false)
      return
    }
    verifyAdminToken(storedToken).then((valid) => {
      if (valid) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem(AUTH_KEY)
      }
      setIsLoading(false)
    })
  }, [])

  const login = useCallback(async (password: string): Promise<boolean> => {
    const valid = await verifyAdminToken(password)
    if (valid) {
      localStorage.setItem(AUTH_KEY, password)
      setIsAuthenticated(true)
    }
    return valid
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
  }, [])

  return { isAuthenticated, isLoading, login, logout }
}
