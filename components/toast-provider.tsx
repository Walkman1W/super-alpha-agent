'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Toast, ToastContainer, ToastType } from './ui/toast'

interface ToastData {
  id: number
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showWarning: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

/**
 * Toast Provider组件
 * 提供全局的Toast通知功能
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((type: ToastType, message: string, duration = 5000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, message, duration }])
  }, [])

  const showSuccess = useCallback((message: string, duration?: number) => {
    showToast('success', message, duration)
  }, [showToast])

  const showError = useCallback((message: string, duration?: number) => {
    showToast('error', message, duration)
  }, [showToast])

  const showWarning = useCallback((message: string, duration?: number) => {
    showToast('warning', message, duration)
  }, [showToast])

  const showInfo = useCallback((message: string, duration?: number) => {
    showToast('info', message, duration)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <ToastContainer>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  )
}

/**
 * useToast Hook
 * 在组件中使用Toast通知功能
 * 
 * @example
 * const { showSuccess, showError } = useToast()
 * showSuccess('操作成功！')
 * showError('操作失败，请重试')
 */
export function useToast() {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  
  return context
}
