import { URL_SERVER } from '../data'
import type { Embajador } from '../model/Embajador'
import type { Replica } from '../model/Replica'
import { buildEmbajadorPayload, fromSection1ToEmbajador } from '../model/Embajador'
import type { Section1, Section2 } from '../types'

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

// GET /embajadores/by-documento/{numero}
export async function getEmbajadorByDocumento(numero: string): Promise<Embajador | null> {
	const res = await fetch(`${URL_SERVER}/embajadores/by-documento/${encodeURIComponent(numero)}`)
	if (res.status === 404) return null
	return handleJson<Embajador>(res)
}

// GET /embajadores/{id}
export async function getEmbajadorById(id: number): Promise<Embajador | null> {
	const res = await fetch(`${URL_SERVER}/embajadores/${id}`)
	if (res.status === 404) return null
	return handleJson<Embajador>(res)
}

// POST /embajadores
export async function createEmbajador(payload: Embajador): Promise<Embajador> {
	const res = await fetch(`${URL_SERVER}/embajadores`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	})
	return handleJson<Embajador>(res)
}

// PATCH /embajadores/{id}
export async function updateEmbajador(id: number, payload: Partial<Embajador>): Promise<Embajador> {
	console.log("Updating embajador", id, payload)
	const res = await fetch(`${URL_SERVER}/embajadores/${id}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	})
	return handleJson<Embajador>(res)
}

// Helper de alto nivel: construye el payload desde las secciones y crea el embajador
// Crear embajador SOLO con datos de la Sección 1
export async function submitEmbajadorFromSection1(section1: Section1) {
	const payload = fromSection1ToEmbajador(section1)
	return createEmbajador(payload)
}

// (Opcional) Crear embajador usando Sección 1 y Sección 2
export async function submitEmbajadorFromSections(section1: Section1, section2?: Section2) {
	const payload = buildEmbajadorPayload(section1, section2)
	return createEmbajador(payload)
}

// Actualiza un embajador desde datos de Sección 1
export async function updateEmbajadorFromSection1(id: number, section1: Section1) {
	console.log("Actualizando embajador", id)
    const payload = fromSection1ToEmbajador(section1)
	return updateEmbajador(id, payload)
}

// Intentar liberar (desasociar/eliminar) un embajador por número de documento.
// Primero intenta POST /embajadores/liberar/{numero}; si falla, intenta DELETE /embajadores/by-documento/{numero}
export async function liberarEmbajadorByDocumento(_: string) {
	// Solo limpiar localStorage, sin llamadas a la API
	try {
		localStorage.removeItem('embajador.actual')
		return { ok: true }
	} catch (e) {
		throw { status: 0, message: 'No se pudo limpiar el almacenamiento local' } as ApiError
	}
}

// /embajadores/892/replicas?filter[limit]=10&filter[skip]=10
// Tipo auxiliar: réplica con contador de registros
export type ReplicaWithRegistrosCount = Replica & { registrosCount?: number }

// GET /embajadores/{id}/replicas?filter[limit]=..&filter[skip]=..
// Devuelve la lista de réplicas del embajador con el campo registrosCount incluido por el backend
export async function getEmbajadorReplicas(
    idEmbajador: number,
    opts?: { limit?: number; skip?: number; order?: string }
): Promise<ReplicaWithRegistrosCount[]> {
    const params = new URLSearchParams()
    if (opts?.limit != null) params.set('filter[limit]', String(opts.limit))
    if (opts?.skip != null) params.set('filter[skip]', String(opts.skip))
    if (opts?.order) params.set('filter[order]', opts.order)
    const qs = params.toString()
    const url = `${URL_SERVER}/embajadores/${idEmbajador}/replicas${qs ? `?${qs}` : ''}`
    console.log("Fetching replicas from URL:", url) // Debug log
    const res = await fetch(url)
    return handleJson<ReplicaWithRegistrosCount[]>(res)
}

/*
[
    {
        "id": 6,
        "codigo_modular": "00000",
        "dre": "DRE CUSCO",
        "ugel": "UGEL PAUCARTAMBO",
        "fecha": "2025-09-03T05:00:00.000Z",
        "hora_inicio": "15:39:00",
        "hora_fin": "18:39:00",
        "enlace_fotografias": "http://127.0.0.1:3000/",
        "create_at": "2025-09-03T19:38:31.763Z",
        "id_embajador": 892,
        "registrosCount": 2
    },
    {
        "id": 7,
        "codigo_modular": "415547",
        "dre": "DRE ANCASH",
        "ugel": "UGEL HUARAZ",
        "fecha": "2025-09-03T05:00:00.000Z",
        "hora_inicio": "17:31:00",
        "hora_fin": "17:32:00",
        "enlace_fotografias": "http://127.0.0.1:3000/1",
        "create_at": "2025-09-03T22:29:44.997Z",
        "id_embajador": 892,
        "registrosCount": 2
    },
    {
        "id": 9,
        "codigo_modular": "00000",
        "dre": "Sin DRE",
        "ugel": "Sin UGEL",
        "fecha": "2025-09-05T05:00:00.000Z",
        "hora_inicio": "17:54:00",
        "hora_fin": "18:55:00",
        "enlace_fotografias": "http://127.0.0.1:3000/",
        "create_at": "2025-09-05T21:53:16.981Z",
        "id_embajador": 892,
        "registrosCount": 6
    }
]
*/
