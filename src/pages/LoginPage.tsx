import { Navigate } from 'react-router-dom'
import { EmbajadorLogin } from '../components/EmbajadorLogin'
import { useEmbajador } from '../context/EmbajadorContext'

export default function LoginPage() {
  const { embajador, setEmbajador } = useEmbajador()
  if (embajador) return <Navigate to="/dashboard" replace />
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <div style={{ maxWidth: 520, width: '100%', padding: 24, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <EmbajadorLogin title="Bienvenido embajador" onAuthChange={setEmbajador} />
      </div>
    </div>
  )
}
