import type { Section3 } from '../types'

// Modelo de Registro para el frontend, alineado al esquema de LoopBack
export type Registro = {
  id?: number
  codigo_modular?: string
  nombres_apellidos?: string
  tipo_documento?: string
  numero_documento?: string
  sexo?: string
  correo_electronico?: string
  celular?: string
  perfil_participante?: string
  nivel_educativo?: string
  grado?: string
  adicional?: string
  create_at?: string // ISO timestamp
  id_embajador: number
}

// Construye un payload Registro desde la Sección 3 del formulario
export function fromSection3ToRegistro(
  s3: Section3,
  id_embajador: number,
  opts?: { create_at?: string; adicional?: string; id_replica?: number }
): Registro {
  const {  adicional } = opts ?? {}

  // Perfil participante: si es "Otro", usar el texto libre
  const perfil_participante =
    s3.perfilParticipante === 'Otro' && s3.perfilParticipanteOtro
      ? s3.perfilParticipanteOtro
      : s3.perfilParticipante

  // Nivel/grado sólo aplica a Estudiante
  const nivel_educativo = s3.perfilParticipante === 'Estudiante' ? s3.nivelEducativo : undefined
  const grado = s3.perfilParticipante === 'Estudiante' ? s3.grado : undefined

  return {
    id_embajador,
  // @ts-ignore - if backend accepts id_replica, include it conditionally
  ...(opts?.id_replica ? { id_replica: opts.id_replica } : {}),
    nombres_apellidos: s3.nombreCompleto || undefined,
    tipo_documento: s3.tipoDocumento || undefined,
    numero_documento: s3.numeroDocumento || undefined,
    sexo: s3.sexo || undefined,
    correo_electronico: s3.correo || undefined,
    celular: s3.celular || undefined,
    perfil_participante,
    nivel_educativo: nivel_educativo || undefined,
    grado: grado || undefined,
    adicional,
  }
}
