import type { Section1, Section2 } from '../types'

// Modelo de Embajador para el frontend, alineado al esquema de LoopBack
export type Embajador = {
	id?: number
	nombre: string
	apellido: string
	perfil: string
	correo_electronico: string
	telefono?: number
	sexo?: string
	otro?: number
	edad?: number
	tipo_de_documento_de_identificacion?: string
	numero_de_documento_de_identificacion?: string
	dre?: number | string
	ugel?: number | string
	hora_agregado?: string
	nombre_del_referente?: string
	propietario_de_la_tarea?: string
	calificaciones_ciberseguridad?: number
	calificaciones_conciencia_digital?: number
	id_region?: number
	id_provincia?: number
	id_distrito?: number
	cod_mod?: string
}

// Heurística simple para separar nombre/apellido desde un campo "nombreCompleto".
// Toma la última palabra como apellido y el resto como nombre.
function splitNombreCompleto(nombreCompleto: string): { nombre: string; apellido: string } {
	const parts = (nombreCompleto ?? '').trim().split(/\s+/).filter(Boolean)
	if (parts.length <= 1) return { nombre: parts[0] ?? '', apellido: '' }
	const apellido = parts[parts.length - 1]
	const nombre = parts.slice(0, -1).join(' ')
	return { nombre, apellido }
}

// Mapea datos de la Sección 1 del formulario a un payload de Embajador para el backend
export function fromSection1ToEmbajador(s1: Section1): Embajador {
	const { nombre, apellido } = splitNombreCompleto(s1.nombreCompleto)

	// Perfil: si es "Otro", usar el texto libre
	const perfil = s1.perfilEmbajador === 'Otro' && s1.perfilEmbajadorOtro
		? s1.perfilEmbajadorOtro
		: s1.perfilEmbajador

	// PIP: si proporcionó código modular en Sección 1
	const cod_mod = s1.codigoModular || undefined

	const toNum = (v?: string) => (v !== undefined && v !== '' ? Number(v) : undefined)
	const telefono = toNum(s1.celular)

	return {
		nombre,
		apellido,
		perfil,
		correo_electronico: s1.correo,
		telefono: Number.isFinite(telefono) ? telefono : undefined,
		sexo: s1.sexo,
		tipo_de_documento_de_identificacion: s1.tipoDocumento,
		numero_de_documento_de_identificacion: s1.numeroDocumento,
		id_region: toNum(String(s1.region)),
		id_provincia: toNum(String(s1.provincia)),
		id_distrito: toNum(String(s1.distrito)),
		dre: s1.dre ?? undefined,
		ugel: s1.ugel ?? undefined,
		cod_mod,
	}
}

// Opcional: fusiona datos de Sección 2 sobre un Embajador existente (sobrescribe DRE/UGEL/cod_mod si aplica)
export function applySection2ToEmbajador(base: Embajador, s2: Section2): Embajador {
	const toNum = (v?: string) => (v !== undefined && v !== '' ? Number(v) : undefined)
	return {
		...base,
		// Si en la sección 2 se selecciona otro centro, priorizar ese código modular
		cod_mod: s2.codigoModular || base.cod_mod,
		dre: toNum(s2.dre) ?? s2.dre ?? base.dre,
		ugel: toNum(s2.ugel) ?? s2.ugel ?? base.ugel,
	}
}

// Utilidad: construye el payload final a partir de Section1 y Section2
export function buildEmbajadorPayload(section1: Section1, section2?: Section2): Embajador {
	const base = fromSection1ToEmbajador(section1)
	return section2 ? applySection2ToEmbajador(base, section2) : base
}

// Prefill: mapea un Embajador del backend a valores por defecto de Section1
export function toSection1Defaults(emb: Embajador): Section1 {
	const nombreCompleto = [emb.nombre, emb.apellido].filter(Boolean).join(' ').trim()
	// Si el perfil no coincide con opciones conocidas, usar 'Otro' y guardar en perfilEmbajadorOtro
	const knownPerfiles = new Set([
		'Coordinador de Innovación y Soporte Tecnológico (CIST)',
		'Especialista en Educación',
		'ATET',
		'Profesor de Innovación Pedagógica (PIP)',
		'Especialista MINEDU',
		'Otro',
	])
	const esConocido = emb.perfil && knownPerfiles.has(emb.perfil)
	const perfilEmbajador = esConocido ? emb.perfil : 'Otro'
	const perfilEmbajadorOtro = !esConocido ? emb.perfil : undefined

		return {
			// Campos requeridos por Section1Schema (strings, permitir '')
			tipoDocumento: emb.tipo_de_documento_de_identificacion || '',
			numeroDocumento: emb.numero_de_documento_de_identificacion || '',
			nombreCompleto,
			sexo: emb.sexo || '',
			correo: emb.correo_electronico || '',
			celular: emb.telefono ? String(emb.telefono) : '',
			region: emb.id_region ? String(emb.id_region) : '',
			provincia: emb.id_provincia ? String(emb.id_provincia) : '',
			distrito: emb.id_distrito ? String(emb.id_distrito) : '',
			perfilEmbajador,
			// Campos opcionales
			perfilEmbajadorOtro,
			dre: emb.dre != null ? String(emb.dre) : undefined,
			ugel: emb.ugel != null ? String(emb.ugel) : undefined,
			codigoModular: emb.cod_mod || undefined,
		}
}

