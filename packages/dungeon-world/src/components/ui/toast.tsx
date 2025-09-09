import React from 'react'
import { Toaster, toast } from 'sonner'
import './toast.css'

export function HUDToaster() {
  return (
    <div role="status" data-testid="toaster-root" className="hud-toaster-root">
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
  warning: (msg: string) =>
    typeof (toast as any).warning === 'function'
      ? (toast as any).warning(msg)
      : toast(msg),
}