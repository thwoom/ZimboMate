import React from 'react'
import { Toaster, toast } from 'sonner'

export function HUDToaster() {
  return (
    <div role="status" data-testid="toaster-root" style={{ width: 1, height: 1, position: 'fixed', top: 0, left: 0, pointerEvents: 'none' }}>
      <Toaster
        position="top-right"
        richColors
        theme="system"
        closeButton
        toastOptions={{ className: 'rounded-[--radius] shadow' }}
      />
    </div>
  )
}

export const hudToast = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  info: (msg: string) => toast(msg),
  warning: (msg: string) => toast.warning ? (toast as any).warning(msg) : toast(msg),
}


    