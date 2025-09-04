import { URL_SERVER } from '../data'
import type { Replica } from '../model/Replica'

type ApiError = { status: number; message: string }

async function handleJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  const data = text ? JSON.parse(text) : undefined
  if (!res.ok) {
    const msg = (data && (data.error?.message || data.message)) || res.statusText
    throw { status: res.status, message: msg } as ApiError
  }
  return data as T
}

export async function createReplica(payload: Replica): Promise<Replica> {
    console.log('Creating replica with payload:', payload) // Debug log
  const res = await fetch(`${URL_SERVER}/replicas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleJson<Replica>(res)
}

export async function getReplicasByEmbajador(idEmbajador: number): Promise<Replica[]> {
  const res = await fetch(`${URL_SERVER}/replicas?filter[where][id_embajador]=${idEmbajador}` )
  //filter=${encodeURIComponent(JSON.stringify({ where: { id_embajador: idEmbajador } }))}`)
  return handleJson<Replica[]>(res)
}

export async function getReplicaById(id: number): Promise<Replica> {
  const res = await fetch(`${URL_SERVER}/replicas/${id}`)
  return handleJson<Replica>(res)
}

export async function updateReplica(id: number, payload: Partial<Replica>): Promise<Replica> {
  const res = await fetch(`${URL_SERVER}/replicas/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleJson<Replica>(res)
}
