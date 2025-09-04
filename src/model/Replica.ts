import type { Section2 } from '../types'

// Modelo de Replica para el frontend, alineado al esquema de LoopBack
export type Replica = {
	id?: number
	codigo_modular?: string
	dre?: string
	ugel?: string
	fecha?: string // ISO date-time (RFC3339)
	hora_inicio?: string // HH:mm
	hora_fin?: string // HH:mm
	enlace_fotografias?: string
	create_at?: string // ISO timestamp
	id_embajador: number
}

// Construye un payload Replica desde la Sección 2 del formulario
export function fromSection2ToReplica(
	s2: Section2,
	id_embajador: number,
	opts?: { create_at?: string }
): Replica {
	const toISODateTime = (date?: string, time?: string) => {
		if (!date) return undefined
		const t = time && /^\d{2}:\d{2}$/.test(time) ? time : '00:00'
		// Build local date-time then convert to RFC3339 (Z)
		const iso = new Date(`${date}T${t}:00`).toISOString()
		return iso
	}
	return {
		id_embajador,
		codigo_modular: s2.codigoModular || undefined,
		dre: s2.dre || undefined,
		ugel: s2.ugel || undefined,
		fecha: toISODateTime(s2.fecha, s2.horaInicio),
		hora_inicio: s2.horaInicio || undefined,
		hora_fin: s2.horaFin || undefined,
		enlace_fotografias: s2.fotosUrl || undefined,

	}
}
