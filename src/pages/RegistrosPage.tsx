import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useEmbajador } from '../context/EmbajadorContext'
import { EmbajadorBadge } from '../components/EmbajadorBadge'
import { getReplicaById } from '../data/Replica'
import { Section3 } from '../components/Section3'
import { fromSection3ToRegistro } from '../model/Registro'
import { createRegistro, getRegistrosByReplica } from '../data/Registro'
import { useNotifications } from '../components/Notifications'

export default function RegistrosPage() {
  const { embajador } = useEmbajador()
  const { id_replica } = useParams()
  const navigate= useNavigate()
  const { error: notifyError, success, confirm } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replicaInfo, setReplicaInfo] = useState<any | null>(null)
  const [registros, setRegistros] = useState<any[]>([])
  const [skip, setSkip] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const PAGE_SIZE = 5

  if (!embajador) return <Navigate to="/login" replace />

  useEffect(() => {
    const load = async () => {
      try {
        if (!id_replica) throw new Error('Falta id de réplica')
        const rep = await getReplicaById(Number(id_replica))
        if (rep.id_embajador !== embajador.id) {
          setError('No es posible acceder a dicha réplica')
        } else {
          setReplicaInfo(rep)
        }
      } catch (e: any) {
        setError(e?.message || 'Error cargando réplica')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id_replica, embajador?.id])

  const reload = async (newSkip = 0) => {
    if (!id_replica) return
    // Fetch one extra to determine if there's a next page
    const page = await getRegistrosByReplica(Number(id_replica), PAGE_SIZE + 1, newSkip)
    const items = page.items || []
    setHasMore(items.length > PAGE_SIZE)
    setRegistros(items.slice(0, PAGE_SIZE))
    setSkip(newSkip)
  }

  useEffect(() => { if (replicaInfo) reload(0) }, [replicaInfo])

  if (loading) return <div className="container">Cargando…</div>
  if (error) return <div className="container"><EmbajadorBadge /><div className="error">{error}</div></div>

  return (
    <div className="container">
    <div className="header">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h1>Registros de réplica #{id_replica}</h1>
      <button
        className="btn primary"
        type="button"
        onClick={async () => {
          const ok = await confirm({
            title: 'Finalizar',
            message: '¿Deseas finalizar?',
            confirmLabel: 'Sí, finalizar',
            cancelLabel: 'Cancelar'
          })
          if (ok) {
            navigate('/replicas/crear')
          }
        }}
      >
        Finalizar
      </button>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '0 16px' }}>
      <div className="muted">
        Fecha: {replicaInfo?.fecha ? new Date(replicaInfo.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
      </div>
      <div className="muted">
        Inicio: {replicaInfo?.hora_inicio || '-'}
      </div>
      <div className="muted">
        Fin: {replicaInfo?.hora_fin || '-'}
      </div>
      <div className="muted">Código modular: {replicaInfo?.codigo_modular || '-'}</div>

    </div>
    </div>
  <Section3
        showBack={false}
        submitLabel="Agregar"
        onSubmit={async (val) => {
          try {
            await createRegistro(fromSection3ToRegistro(val, embajador!.id!,{ id_replica: Number(id_replica) }))
            //Agrega el toast que diga "Registro agregado"
            success('Registro agregado',1000)
            await reload(0)
          } catch (e: any) {
            notifyError(e?.message || 'No se pudo agregar el registro')
          }
        }}
      />
      <div style={{ marginTop: 16 }}>
        <h3>Últimos registros</h3>
        <div style={{ overflowX: 'auto', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nombres y apellidos</th>
                <th>Tipo doc</th>
                <th>N° doc</th>
                <th>Sexo</th>
                <th>Perfil</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r: any) => (
                <tr key={r.id}>
                  <td>{r.nombres_apellidos || '-'}</td>
                  <td>{r.tipo_documento || '-'}</td>
                  <td>{r.numero_documento || '-'}</td>
                  <td>{r.sexo || '-'}</td>
                  <td>{r.perfil_participante || '-'}</td>
                </tr>
              ))}
              {registros.length === 0 && (
                <tr><td colSpan={5} className="muted">Sin registros aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="actions" style={{ justifyContent: 'space-between' }}>
          <button className="btn ghost" type="button" disabled={skip === 0} onClick={() => reload(Math.max(0, skip - PAGE_SIZE))}>Anterior</button>
          <span className="muted">Página {Math.floor(skip / PAGE_SIZE) + 1}</span>
          <button className="btn ghost" type="button" disabled={!hasMore} onClick={() => reload(skip + PAGE_SIZE)}>Siguiente</button>
        </div>
      </div>
    </div>
  )
}
