import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import ConfirmModal from './ConfirmModal'

type ToastKind = 'info' | 'success' | 'warning' | 'error'

export type ToastOptions = {
  id?: string
  message: string
  kind?: ToastKind
  duration?: number
}

type ConfirmOptions = {
  title?: string
  message?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

type Ctx = {
  // toasts
  show: (opts: ToastOptions) => string
  dismiss: (id: string) => void
  info: (message: string, duration?: number) => string
  success: (message: string, duration?: number) => string
  warning: (message: string, duration?: number) => string
  error: (message: string, duration?: number) => string
  // confirm
  confirm: (opts: ConfirmOptions) => Promise<boolean>
}

const NotificationsCtx = createContext<Ctx | null>(null)

type ToastState = Required<ToastOptions>

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([])
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    opts: ConfirmOptions
    resolver?: (v: boolean) => void
  }>({ open: false, opts: {} })

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const show = useCallback((opts: ToastOptions) => {
    const id = opts.id ?? Math.random().toString(36).slice(2)
    const toast: ToastState = {
      id,
      message: opts.message,
      kind: opts.kind ?? 'info',
      duration: opts.duration ?? 1000,
    }
    setToasts((prev) => [...prev, toast])
    if (toast.duration > 0) setTimeout(() => dismiss(id), toast.duration)
    return id
  }, [dismiss])

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ open: true, opts, resolver: resolve })
    })
  }, [])

  const api = useMemo<Ctx>(() => ({
    show,
    dismiss,
    info: (m, d) => show({ message: m, kind: 'info', duration: d }),
    success: (m, d) => show({ message: m, kind: 'success', duration: d }),
    warning: (m, d) => show({ message: m, kind: 'warning', duration: d }),
    error: (m, d) => show({ message: m, kind: 'error', duration: d }),
    confirm,
  }), [show, dismiss, confirm])

  return (
    <NotificationsCtx.Provider value={api}>
      {children}
      {/* Toasts */}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.kind}`}>
            <span className="toast-message">{t.message}</span>
            <button className="btn ghost toast-close" onClick={() => dismiss(t.id)}>✕</button>
          </div>
        ))}
      </div>
      {/* Confirm */}
      <ConfirmModal
        open={confirmState.open}
        title={confirmState.opts.title}
        message={confirmState.opts.message}
        confirmLabel={confirmState.opts.confirmLabel}
        cancelLabel={confirmState.opts.cancelLabel}
        destructive={confirmState.opts.destructive}
        onConfirm={() => { confirmState.resolver?.(true); setConfirmState({ open: false, opts: {} }) }}
        onCancel={() => { confirmState.resolver?.(false); setConfirmState({ open: false, opts: {} }) }}
      />
    </NotificationsCtx.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsCtx)
  if (!ctx) throw new Error('useNotifications must be used within <NotificationsProvider>')
  return ctx
}
