import { URL_SERVER } from '../data'
import type { Embajador } from '../model/Embajador'
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

