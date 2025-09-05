import { Navigate, useNavigate } from 'react-router-dom'
import { useEmbajador } from '../context/EmbajadorContext'
import { EmbajadorBadge } from '../components/EmbajadorBadge'
import { Section2 } from '../components/Section2'
import { fromSection2ToReplica } from '../model/Replica'
import { createReplica } from '../data/Replica'
import { useNotifications } from '../components/Notifications'

export default function ReplicaCreatePage() {
  const { embajador } = useEmbajador()
  const navigate = useNavigate()
  const { error } = useNotifications()
  if (!embajador) return <Navigate to="/login" replace />

  return (
    <div className="container">
      <div className="header"><h1>Crear réplica</h1></div>
      <Section2
        onNext={async (val) => {
          try {
            const created = await createReplica(fromSection2ToReplica(val, embajador.id!))
            navigate(`/registros/${created.id}`, { replace: true })
          } catch (e: any) {
            error(e?.message || 'No se pudo crear la réplica')
          }
        }}
      />
    </div>
  )
}
