import { Navigate, Link } from 'react-router-dom'
import { useEmbajador } from '../context/EmbajadorContext'
import { Embajador } from '../components/Embajador'
import { toSection1Defaults } from '../model/Embajador'
import { getEmbajadorById, updateEmbajador, updateEmbajadorFromSection1 } from '../data/Embajador'
import { EmbajadorBadge } from '../components/EmbajadorBadge'
import { useNotifications } from '../components/Notifications'

export default function EmbajadorPage() {
  const { embajador, setEmbajador } = useEmbajador()
  const { success, error } = useNotifications()
  if (!embajador) return <Navigate to="/create_embajador" replace />

  return (
    <div className="container">
      
      <div className="header"><h1>Datos del embajador</h1></div>
      <Embajador
        mode="update"
        defaultValues={toSection1Defaults(embajador)}
        onUpdate={async (val) => {
          try {
            const updated = await updateEmbajadorFromSection1(embajador.id!, val)
            const updated_embajador = await getEmbajadorById(embajador.id!)
            setEmbajador(updated_embajador)
            success('Datos actualizados')
          } catch (e: any) {
            error(e?.message || 'No se pudo actualizar al embajador')
          }
        }}
        onPartialUpdate={async (partial) => {
          try {
            //console.log("Editando")
            //console.log("Partial update", partial)
            if (Object.keys(partial).length === 0) return
            
            const updated = await updateEmbajador(embajador.id!, partial)
            const updated_embajador = await getEmbajadorById(embajador.id!)
            setEmbajador(updated_embajador)
            success('Cambios actualizados')
          } catch (e: any) {
            error(e?.message || 'No se pudo actualizar parcialmente al embajador')
          }
        }}
        onNext={() => {}}
      />
      
    </div>
  )
}
/*
<div className="actions" style={{ marginTop: 12 }}>
        <Link className="btn" to="/replica">Ir a crear réplica</Link>
      </div>
*/