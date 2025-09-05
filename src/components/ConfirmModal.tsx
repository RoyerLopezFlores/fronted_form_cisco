import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'

type Props = {
  open: boolean
  title?: string
  message?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  destructive?: boolean
}

export function ConfirmModal({
  open,
  title = 'Confirmación',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  destructive = false,
}: Props) {
  const [submitting, setSubmitting] = useState(false)
  const confirmRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel?.() }
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => confirmRef.current?.focus(), 0)
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(t); setSubmitting(false) }
  }, [open, onCancel])

  if (!open) return null

  const body = (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        {title && <h3 className="modal-title">{title}</h3>}
        {message && <div className="modal-content">{message}</div>}
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onCancel} disabled={submitting}>{cancelLabel}</button>
          <button ref={confirmRef} type="button" className={`btn ${destructive ? 'danger' : ''}`} onClick={async () => { try { setSubmitting(true); await onConfirm() } finally { setSubmitting(false) } }} disabled={submitting}>
            {submitting ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )

  return ReactDOM.createPortal(body, document.body)
}

export default ConfirmModal
