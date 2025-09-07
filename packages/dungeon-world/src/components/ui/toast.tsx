import React from 'react'
import { Toaster, toast } from 'sonner'

export function HUDToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      theme="system"
      closeButton
      toastOptions={{ className: 'rounded-[--radius] shadow' }}
    />
  )
}

export const hudToast = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  info: (msg: string) => toast(msg),
  warning: (msg: string) => toast.warning ? (toast as any).warning(msg) : toast(msg),
}


