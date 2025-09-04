// Modelo Padron alineado al backend LoopBack
// @model({name: 'padron'})
export type Padron = {
  codinst?: number
  cod_mod: string
  anexo?: number
  codlocal?: number
  cen_edu?: string
  d_region?: string
  codooii?: number
  d_dreugel?: string
}

// Nota: Si el backend añadiera más campos, ampliar aquí manteniendo la compatibilidad.
