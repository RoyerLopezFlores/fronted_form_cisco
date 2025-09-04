import { z } from 'zod'

export const sexOptions = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  //{ value: 'O', label: 'Otro' },
]

export const docTypeOptions = [
  { value: 'DNI', label: 'DNI' },
  { value: 'CE', label: 'Carné de Extranjería' },
  { value: 'PAS', label: 'Pasaporte' },
]

export const perfilEmbajadorOptions = [
  {
    value: 'Coordinador de Innovación y Soporte Tecnológico (CIST)',
    label: 'Coordinador de Innovación y Soporte Tecnológico (CIST)'
  },{
    value: 'Especialista en Educación',
    label: 'Especialista en Educación'
  },{
    value: 'ATET',
    label: 'ATET'
  },{
    value: 'Profesor de Innovación Pedagógica (PIP)',
    label: 'Profesor de Innovación Pedagógica (PIP)'
  },{
    value: 'Especialista MINEDU',
    label: 'Especialista MINEDU'
  },{
    value: 'Otro',
    label: 'Otro'
  }
]

export const perfilParticipanteOptions = [
  { value: 'Estudiante', label: 'Estudiante' },
  { value: 'Docente', label: 'Docente' },
  { value: 'Director', label: 'Director' },
  { value: 'Padre de familia', label: 'Padre de familia' },
  { value: 'Especialista', label: 'Especialista' },
  { value: 'Otro', label: 'Otro' }
]

export const nivelEducativoOptions = [
  { value: 'PRIMARIA', label: 'Primaria' },
  { value: 'SECUNDARIA', label: 'Secundaria' },
]


export const gradoOptions: Record<string, { value: string; label: string }[]> = {
  PRIMARIA: Array.from({ length: 6 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}°` })),
  SECUNDARIA: Array.from({ length: 5 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}°` })),
}

export const section1Schema = z
  .object({
    tipoDocumento: z.string().min(1, 'Seleccione un tipo de documento'),
    numeroDocumento: z.string().min(1, 'Ingrese el número de documento'),
    nombreCompleto: z.string().min(3, 'Ingrese nombre y apellidos'),
    sexo: z.string().min(1, 'Seleccione sexo'),
    correo: z.string().email('Correo inválido'),
    celular: z
      .string()
      .min(9, 'Ingrese 9 dígitos')
      .regex(/^\d{9,15}$/g, 'Solo números (9-15)'),
    region: z.string().min(1, 'Seleccione región'),
    provincia: z.string().min(1, 'Seleccione provincia'),
    distrito: z.string().min(1, 'Seleccione distrito'),
    perfilEmbajador: z.string().min(1, 'Seleccione un perfil'),
  perfilEmbajadorOtro: z.string().optional(),
    dre: z.string().optional(),
    ugel: z.string().optional(),
    codigoModular: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.tipoDocumento === 'DNI' && !/^\d{8}$/.test(val.numeroDocumento)) {
      ctx.addIssue({ path: ['numeroDocumento'], code: z.ZodIssueCode.custom, message: 'DNI debe tener 8 dígitos' })
    }
    const requiereDreUgel = val.perfilEmbajador !== 'Especialista MINEDU' && val.perfilEmbajador !== 'Otro'
    if (requiereDreUgel) {
      if (!val.dre) ctx.addIssue({ path: ['dre'], code: z.ZodIssueCode.custom, message: 'Seleccione DRE/GRE' })
      if (!val.ugel) ctx.addIssue({ path: ['ugel'], code: z.ZodIssueCode.custom, message: 'Seleccione UGEL' })
    }
    if (val.perfilEmbajador === 'Otro') {
      if (!val.perfilEmbajadorOtro || val.perfilEmbajadorOtro.trim().length < 3) {
        ctx.addIssue({ path: ['perfilEmbajadorOtro'], code: z.ZodIssueCode.custom, message: 'Especifique el perfil (mín. 3 caracteres)' })
      }
    }
  if (val.perfilEmbajador === 'Profesor de Innovación Pedagógica (PIP)') {
      if (!val.codigoModular) ctx.addIssue({ path: ['codigoModular'], code: z.ZodIssueCode.custom, message: 'Ingrese código modular' })
    }
  })

export const section2Schema = z
  .object({
    codigoModular: z.string().min(1, 'Ingrese código modular'),
    dre: z.string().min(1, 'Seleccione DRE/GRE'),
    ugel: z.string().min(1, 'Seleccione UGEL'),
  fecha: z.string().min(1, 'Seleccione fecha'),
    horaInicio: z.string().min(1, 'Seleccione hora de inicio'),
    horaFin: z.string().min(1, 'Seleccione hora de fin'),
    fotosUrl: z.string().url('Ingrese un enlace válido'),
  })
  .refine((v) => !v.horaInicio || !v.horaFin || v.horaFin > v.horaInicio, {
    path: ['horaFin'],
    message: 'La hora de fin debe ser posterior a la de inicio',
  })

export const section3Schema = z
  .object({
    nombreCompleto: z.string().min(3, 'Ingrese nombres y apellidos'),
    tipoDocumento: z.string().min(1, 'Seleccione un tipo de documento'),
    numeroDocumento: z.string().min(1, 'Ingrese el número de documento'),
    sexo: z.string().min(1, 'Seleccione sexo'),
    correo: z.string().email('Correo inválido').optional().or(z.literal('')),
    celular: z.string().regex(/^$|^\d{9,15}$/g, 'Solo números (9-15) dígitos').optional(),
    perfilParticipante: z.string().min(1, 'Seleccione un perfil'),
    nivelEducativo: z.string().optional(),
    grado: z.string().optional(),
    perfilParticipanteOtro: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.tipoDocumento === 'DNI' && !/^\d{8}$/.test(val.numeroDocumento)) {
      ctx.addIssue({ path: ['numeroDocumento'], code: z.ZodIssueCode.custom, message: 'DNI debe tener 8 dígitos' })
    }
    if (val.perfilParticipante === 'Estudiante') {
      if (!val.nivelEducativo) ctx.addIssue({ path: ['nivelEducativo'], code: z.ZodIssueCode.custom, message: 'Seleccione nivel' })
      if (!val.grado) ctx.addIssue({ path: ['grado'], code: z.ZodIssueCode.custom, message: 'Seleccione grado' })
    }
    if (val.perfilParticipante === 'Otro') {
      if (!val.perfilParticipanteOtro || val.perfilParticipanteOtro.trim().length < 3) {
        ctx.addIssue({ path: ['perfilParticipanteOtro'], code: z.ZodIssueCode.custom, message: 'Especifique el perfil (mín. 3 caracteres)' })
      }
    }
  })

export type Section1 = z.infer<typeof section1Schema>
export type Section2 = z.infer<typeof section2Schema>
export type Section3 = z.infer<typeof section3Schema>

export type FormDataShape = {
  section1?: Section1
  section2?: Section2
  section3?: Section3
}
export type Region = {
  id: number
  nombre: string
}
export type Provincia = {
  id: number
  nombre: string
  regionId: number
}
export type Distrito = {
  id: number
  nombre: string
  provinciaId: number
}
export type DRE = {
  id: number
  nombre: string
}
export type Ugel = {
  id: number
  nombre: string
  dreId: number
}