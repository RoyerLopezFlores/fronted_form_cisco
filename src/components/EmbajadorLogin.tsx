import { useEffect, useState } from 'react'
import { getEmbajadorByDocumento, liberarEmbajadorByDocumento } from '../data/Embajador'
import type { Embajador } from '../model/Embajador'

const STORAGE_KEY = 'embajador.actual'

type Props = {
  onAuthChange?: (emb: Embajador | null) => void
  title?: string
}

export function EmbajadorLogin({ onAuthChange, title = 'Acceso Embajador' }: Props) {
  const [numero, setNumero] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emb, setEmb] = useState<Embajador | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Embajador
        setEmb(parsed)
        onAuthChange?.(parsed)
      } catch {}
    }
  }, [])

  const guardarLocal = (e: Embajador | null) => {
    setEmb(e)
    if (e) localStorage.setItem(STORAGE_KEY, JSON.stringify(e))
    else localStorage.removeItem(STORAGE_KEY)
  onAuthChange?.(e)
  }

  const buscar = async () => {
    setLoading(true); setError(null)
    try {
      const data = await getEmbajadorByDocumento(numero.trim())
      if (!data) { setError('No se encontró el embajador'); guardarLocal(null) }
      else guardarLocal(data)
    } catch (err: any) {
      setError(err?.message || 'Error al buscar')
    } finally { setLoading(false) }
  }

  const liberar = async () => {
    setLoading(true); setError(null)
    try {
      const doc = emb?.numero_de_documento_de_identificacion || numero.trim() || ''
      await liberarEmbajadorByDocumento(doc)
      guardarLocal(null)
    } catch (err: any) {
      setError(err?.message || 'Error al liberar')
    } finally { setLoading(false) }
  }

  return (
    <div className="container" style={{ marginBottom: 16 }}>
  <h2 className="section-title">{title}</h2>
      <div>
        <div className="field" style={{ marginBottom: 12 }}>
          <label>Número de documento</label>
          <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Número de documento" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="btn" type="button" onClick={buscar} disabled={loading || !numero.trim()}>Ingresar</button>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {emb && (
        <div style={{ marginTop: 12, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{emb.nombre} {emb.apellido}</div>
              <div className="muted">{emb.perfil}</div>
            </div>
            <div>
              <button className="btn ghost" type="button" onClick={liberar} disabled={loading}>Liberar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
