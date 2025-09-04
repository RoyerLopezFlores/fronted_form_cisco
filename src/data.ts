// Datos de ejemplo. Reemplace por data real si la tiene.
import  {Region,Provincia, Distrito,DRE, Ugel}  from "./types";





export const URL_SERVER = 'http://localhost:3000'
export const getProvincias = async (id_region?: string) => {
  if(!id_region) return []
  const data = await fetch(`${URL_SERVER}/provincias?filter[where][departamentoId]=${id_region}`)
  const result = await data.json()
  const provincias = result.map((p: Record<string, any>) => (
    { id: p.id, nombre: p.nombre, regionId: p.departamentoId }))
  return provincias
}
export const getRegiones = async (): Promise<Region[]> => {
  const data = await fetch(`${URL_SERVER}/departamentos`)
  const result = await data.json()
  const regiones = result.map((r: Record<string, any>) => ({ id: r.id, nombre: r.nombre }))
  //console.log(regiones)
  return regiones
}

export const getDistritos = async (id_provincia?: string) => {
  if(!id_provincia) return []
  const data = await fetch(`${URL_SERVER}/distritos?filter[where][provinciaId]=${id_provincia}`)
  const result = await data.json()
  const distritos = result.map((d: Record<string, any>) => (
    { id: d.id, nombre: d.nombre, provinciaId: d.provinciaId }))
  return distritos
}

export const getDres = async (): Promise<DRE[]> => {
  const data = await fetch(`${URL_SERVER}/dres`)
  const result = await data.json()
  const dres = result.map((d: Record<string, any>) => ({ id: d.id, nombre: d.nombre }))
  return dres
}

export const getUgeles = async(id_dre?: string): Promise<Ugel[]> => {
  if (!id_dre) return []
  // Try to convert number id_dre if not posible only return empty array
  const id = Number(id_dre)
  if (isNaN(id)) return []
  const data = await fetch(`${URL_SERVER}/ugels?filter[where][dreId]=${id}`)
  const result = await data.json()
  const ugeles = result.map((u: Record<string, any>) => ({ id: u.id, nombre: u.nombre,dreId: u.dreId }))
  return ugeles
}

export const getDreById = async (id: string): Promise<DRE | null> => {
  if (!id) return null
  const data = await fetch(`${URL_SERVER}/dres/${id}`)
  const result = await data.json()
  return { id: result.id, nombre: result.nombre }
}