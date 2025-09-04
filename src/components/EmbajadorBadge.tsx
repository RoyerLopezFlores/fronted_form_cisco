import { Link, useNavigate } from 'react-router-dom'
import { useEmbajador } from '../context/EmbajadorContext'

type Props = { variant?: 'card' | 'inline' }

export function EmbajadorBadge({ variant = 'card' }: Props) {
  const { embajador, logout } = useEmbajador()
  const navigate = useNavigate()
  const onLogout = () => {
    logout()
    navigate('/login')
  }

  if (!embajador) return null
  const isInline = variant === 'inline'
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isInline ? 8 : 12,
        border: isInline ? 'none' : '1px solid #e5e7eb',
        borderRadius: isInline ? 0 : 12,
        padding: isInline ? 0 : 12,
        marginBottom: isInline ? 0 : 12,
      }}
    >
      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontWeight: 600, fontSize: isInline ? 14 : 16 }}>
          {embajador.nombre} {embajador.apellido}
        </div>
        <div className="muted" style={{ fontSize: isInline ? 12 : 14 }}>{embajador.perfil}</div>
      </div>
  <div className="badge-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/embajador" className="btn ghost">Ver Datos</Link>
        <Link to="/replica" className="btn ghost">Crear réplica</Link>
  <button className="btn danger" onClick={onLogout}>Salir</button>
      </div>
    </div>
  )
}
