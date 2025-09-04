import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom'
import { useEmbajador } from '../context/EmbajadorContext'
import { EmbajadorBadge } from '../components/EmbajadorBadge'
import { Section2 } from '../components/Section2'
import { getReplicaById, updateReplica } from '../data/Replica'

export default function ReplicaEditPage() {
  const { embajador } = useEmbajador()
  const { id_replica } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [defaults, setDefaults] = useState<any | null>(null)

  //if (!embajador) return <Navigate to="/login" replace />

  useEffect(() => {
    const load = async () => {
        
      try {
        if(!embajador) return
        console.log(embajador,id_replica)
        if (!id_replica) throw new Error('Falta id de réplica')
        const rep = await getReplicaById(Number(id_replica))
        //if (!embajador) throw new Error('Falta embajador')
        console.log(rep, embajador)
        // Convert rep.fecha to 'YYYY-MM-DD' format for input[type="date"]
        if (rep.fecha) {
          rep.fecha = new Date(rep.fecha).toISOString().slice(0, 10)
          console.log("Fecha convertida:", rep.fecha)
        }
        if (rep.id_embajador !== embajador?.id) {
          setError('No es posible acceder a dicha réplica')
        } else {
          setDefaults({
            codigoModular: rep.codigo_modular || '',
            dre: rep.dre || '',
            ugel: rep.ugel || '',
            fecha: rep.fecha || '',
            horaInicio: rep.hora_inicio || '',
            horaFin: rep.hora_fin || '',
            fotosUrl: rep.enlace_fotografias || '',
          })
        }
      } catch (e: any) {
        setError(e?.message || 'Error cargando la réplica')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id_replica, embajador?.id])

  if (loading) return <div className="container">Cargando…</div>
  if (error) return <div className="container"><EmbajadorBadge /><div className="error">{error}</div></div>

  return (
    <div className="container">
      <div
        className="header"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
      >
        <h1 style={{ margin: 0 }}>Editar réplica #{id_replica}</h1>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link className="btn" to={`/registros/${id_replica}`}>Ir a registros</Link>
        </div>
      </div>
      <Section2
        defaultValues={defaults || undefined}
        submitLabel="Guardar"
        edition={true}
        onNext={async (val) => {
          try {
            const toISODateTime = (date?: string, time?: string) => {
              if (!date) return undefined
              const t = time && /^\d{2}:\d{2}$/.test(time) ? time : '00:00'
              return new Date(`${date}T${t}:00`).toISOString()
            }
            await updateReplica(Number(id_replica), {
              codigo_modular: val.codigoModular || undefined,
              dre: val.dre || undefined,
              ugel: val.ugel || undefined,
              fecha: toISODateTime(val.fecha, val.horaInicio),
              hora_inicio: val.horaInicio || undefined,
              hora_fin: val.horaFin || undefined,
              enlace_fotografias: val.fotosUrl || undefined,
            })
            alert('Réplica actualizada')
          } catch (e: any) {
            alert(e?.message || 'No se pudo actualizar la réplica')
          }
        }}
      />
      
    </div>
  )
}
