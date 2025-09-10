import { URL_SERVER } from '../data'
import type { Registro } from '../model/Registro'

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

export async function createRegistro(payload: Registro): Promise<Registro> {
    console.log("Creating registro:", payload)
  const res = await fetch(`${URL_SERVER}/registros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleJson<Registro>(res)
}

export async function getRegistrosByEmbajador(idEmbajador: number, limit = 5, skip = 0): Promise<{ items: Registro[]; total: number }> {
  const filter = {
    where: { id_embajador: idEmbajador },
    order: ['id DESC'],
    limit,
    skip,
  }
  const res = await fetch(`${URL_SERVER}/registros?filter=${encodeURIComponent(JSON.stringify(filter))}`)
  const items = await handleJson<Registro[]>(res)
  // Nota: LoopBack 4 no devuelve total por defecto; si tu endpoint lo soporta, cámbialo.
  return { items, total: items.length }
}

export async function getRegistrosByReplica(idReplica: number, limit = 5, skip = 0): Promise<{ items: Registro[]; total: number }> {
  const filter = {
    where: { id_replica: idReplica },
    order: ['id DESC'],
    limit,
    skip,
  }
  const res = await fetch(`${URL_SERVER}/registros?filter=${encodeURIComponent(JSON.stringify(filter))}`)
  const items = await handleJson<Registro[]>(res)
  return { items, total: items.length }
}
export async function countRegistrosByEmbajador(idEmbajador: number): Promise<number> {
  const res = await fetch(`${URL_SERVER}/registros/count?filter[where][id_embajador]=${idEmbajador}`)
  const data = await handleJson<{ count: number }>(res)
  return data.count
}
