import { useEffect, useMemo, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { EmbajadorBadge } from '../components/EmbajadorBadge'
import { useEmbajador } from '../context/EmbajadorContext'
import { useNotifications } from '../components/Notifications'
import { getEmbajadorReplicas, type ReplicaWithRegistrosCount } from '../data/Embajador'
import { countReplicasByEmbajador } from '../data/Replica'
import { countRegistrosByEmbajador } from '../data/Registro'

export default function DashboardEmbajador() {
  const { embajador } = useEmbajador()
  const { error: notifyError } = useNotifications()
  const PAGE_SIZE = 5
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replicas, setReplicas] = useState<ReplicaWithRegistrosCount[]>([])
  const [skip, setSkip] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [totalReplicas, setTotalReplicas] = useState<number>(0)
  const [totalRegistros, setTotalRegistros] = useState<number>(0)

  // Guardar login
  if (!embajador) return <Navigate to="/login" replace />

  const summary = useMemo(() => {
    return [
      { label: 'Perfil', value: embajador.perfil || '-' },
      { label: 'Correo', value: embajador.correo_electronico || '-' },
      { label: 'Celular', value: embajador.telefono ? String(embajador.telefono) : '-' },
      { label: 'Documento', value: `${embajador.tipo_de_documento_de_identificacion || '-'} ${embajador.numero_de_documento_de_identificacion || ''}`.trim() },
      { label: 'Región', value: embajador.id_region ?? '-' },
      { label: 'Provincia', value: embajador.id_provincia ?? '-' },
      { label: 'Distrito', value: embajador.id_distrito ?? '-' },
      { label: 'DRE', value: embajador.dre ?? '-' },
      { label: 'UGEL', value: embajador.ugel ?? '-' },
      { label: 'Código modular', value: embajador.cod_mod || '-' },
    ]
  }, [embajador])

  const loadPage = async (newSkip = 0) => {
    try {
      // pedir 1 extra para saber si hay siguiente
      const items = await getEmbajadorReplicas(embajador!.id!, { limit: PAGE_SIZE + 1, skip: newSkip, order: 'create_at DESC' })
      setHasMore(items.length > PAGE_SIZE)
      setReplicas(items.slice(0, PAGE_SIZE))
      setSkip(newSkip)
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar las réplicas')
      notifyError(e?.message || 'No se pudo cargar las réplicas')
    }
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const [replicasCount, registrosCount] = await Promise.all([
          countReplicasByEmbajador(embajador!.id!),
          countRegistrosByEmbajador(embajador!.id!),
        ])
        await loadPage(0)
        if (mounted) {
          setTotalReplicas(replicasCount)
          setTotalRegistros(registrosCount)
        }
      } catch (e: any) {
        setError(e?.message || 'Error cargando el dashboard')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embajador?.id])

  if (loading) return <div className="container">Cargando…</div>
  if (error) return <div className="container"><EmbajadorBadge /><div className="error">{error}</div></div>

  const hasPrev = skip > 0

  return (
    <div className="container">

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'stretch', marginTop: 8 }}>
        {/* Más datos del embajador */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Más datos del embajador</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
            {summary
              .filter((item) => ['Perfil', 'Correo', 'Celular', 'Documento','Sexo'].includes(item.label))
              .map((item) => (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="muted" style={{ fontSize: 12 }}>{item.label}</span>
                  <span style={{ fontWeight: 500 }}>{String(item.value) || '-'}</span>
                </div>
              ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <Link to="/embajador" className="btn">Actualizar datos</Link>
          </div>
        </div>

        {/* Total réplicas */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          {/* Círculo dividido en dos mitades */}
          <div style={{ position: 'relative', width: 200, height: 200, borderRadius: '50%', border: '6px solid #111827', overflow: 'hidden', background: '#fff' }}>
            {/* Línea horizontal */}
            <div style={{ position: 'absolute', left: 10, right: 10, top: '50%', height: 2, background: '#111827', transform: 'translateY(-50%)' }} />
            {/* Superior: réplicas */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingTop: 8 }}>
              <div className="muted" style={{ fontSize: 12, textAlign: 'center' }}>Total de réplicas</div>
              <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{totalReplicas.toLocaleString('es-PE')}</div>
            </div>
            {/* Inferior: beneficiarios */}
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingBottom: 8 }}>
              <div className="muted" style={{ fontSize: 12, textAlign: 'center' }}>Total de beneficiarios</div>
              <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{totalRegistros.toLocaleString('es-PE')}</div>
            </div>
          </div>
          {/* Botón centrado debajo del círculo */}
          <Link to="/replica" className="btn primary">Crear réplica</Link>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>Réplicas</h2>
        <div style={{ overflowX: 'auto', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Código modular</th>
                <th>DRE</th>
                <th>UGEL</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Total registros</th>
              </tr>
            </thead>
            <tbody>
              {replicas.map((r) => (
                <tr key={r.id}>
                  <td>{r.fecha ? new Date(r.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</td>
                  <td>{r.codigo_modular || '-'}</td>
                  <td>{r.dre || '-'}</td>
                  <td>{r.ugel || '-'}</td>
                  <td>{r.hora_inicio || '-'}</td>
                  <td>{r.hora_fin || '-'}</td>
                  <td>{r.registrosCount ?? 0}</td>
                </tr>
              ))}
              {replicas.length === 0 && (
                <tr><td colSpan={7} className="muted">Sin réplicas aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="actions" style={{ justifyContent: 'space-between' }}>
          {hasPrev ? (
            <button className="btn ghost" type="button" onClick={() => loadPage(Math.max(0, skip - PAGE_SIZE))}>Anterior página</button>
          ) : <span />}
          <span className="muted">Página {Math.floor(skip / PAGE_SIZE) + 1}</span>
          {hasMore ? (
            <button className="btn ghost" type="button" onClick={() => loadPage(skip + PAGE_SIZE)}>Siguiente página</button>
          ) : <span />}
        </div>
      </div>
    </div>
  )
}
