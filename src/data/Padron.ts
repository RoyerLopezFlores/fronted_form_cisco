import { URL_SERVER } from '../data'
import type { Padron } from '../model/Padron'

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

// GET /padron/{cod_mod}
export async function getPadronByCodMod(cod_mod: string): Promise<Padron | null> {
    
    const res = await fetch(`${URL_SERVER}/padron/${encodeURIComponent(cod_mod)}`)
  if (res.status === 404) return null
  return handleJson<Padron>(res)
}
