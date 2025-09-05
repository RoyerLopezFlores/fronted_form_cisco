import { Navigate, useNavigate } from 'react-router-dom'
import { useEmbajador } from '../context/EmbajadorContext'
import { Embajador } from '../components/Embajador'
import { submitEmbajadorFromSection1 } from '../data/Embajador'
import { useNotifications } from '../components/Notifications'

export default function CreateEmbajadorPage() {
  const { embajador, setEmbajador } = useEmbajador()
  const navigate = useNavigate()
  const { error } = useNotifications()
  if (embajador) return <Navigate to="/embajador" replace />

  return (
    <div className="container">
      <h1>Crear embajador</h1>
      <Embajador
        mode="create"
        onNext={async (val) => {
          try {
            const created = await submitEmbajadorFromSection1(val)
            setEmbajador(created)
            navigate('/embajador', { replace: true })
          } catch (e: any) {
            error(e?.message || 'No se pudo crear el embajador')
          }
        }}
      />
    </div>
  )
}
