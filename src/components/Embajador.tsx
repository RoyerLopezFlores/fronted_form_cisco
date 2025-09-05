import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  section1Schema,
  type Section1 as Section1Type,
  sexOptions,
  docTypeOptions,
  perfilEmbajadorOptions,
  Provincia,
  Distrito,
  DRE,
  Ugel,
} from '../types'
import { getProvincias,getRegiones, getDistritos, getDres, getUgeles } from '../data'
import { Region } from '../types'
import type { Embajador as EmbajadorModel } from '../model/Embajador'
type Props = {
  defaultValues?: Partial<Section1Type>
  onNext: (values: Section1Type) => void
  showActions?: boolean
  mode?: 'create' | 'update'
  onUpdate?: (values: Section1Type) => void
  onPartialUpdate?: (partial: Partial<EmbajadorModel>) => void
}

export function Embajador({ defaultValues, onNext, showActions = true, mode = 'create', onUpdate, onPartialUpdate }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    resetField,
  getValues,
  formState: { errors, dirtyFields },
  } = useForm<Section1Type>({
    resolver: zodResolver(section1Schema),
    defaultValues: {
      tipoDocumento: '',
      numeroDocumento: '',
      nombreCompleto: '',
      sexo: '',
      correo: '',
      celular: '',
      region: '',
      provincia: '',
      distrito: '',
      perfilEmbajador: '',
  perfilEmbajadorOtro: '',
      ...defaultValues,
    },
  })
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [provinciasOpts, setProvinciasOpts] = useState<Provincia[]>([]);
  const [distritosOpts, setDistritosOpts] = useState<Distrito[]>([]);
  const [dreOpts, setDreOpts] = useState<DRE[]>([]);
  const [ugelesOpts, setUgelesOpts] = useState<Ugel[]>([]);
  const region = watch('region')
  const provincia = watch('provincia')
  const perfil = watch('perfilEmbajador')
  const dre = watch('dre')
  const initFetch = async () => {
    const regionesData = await getRegiones()
    setRegiones(regionesData)
    
    const dresData = await getDres()
    setDreOpts(dresData)
    // Rehidrata región si viene en defaults (asegura coincidencia tras cargar opciones)
    // Normaliza DRE por nombre -> id si los defaults vienen con nombre
    console.log(defaultValues,"Valores")
    //if (defaultValues?.region) setValue('region', String(defaultValues.region))
    if (defaultValues?.dre && isNaN(Number(defaultValues.dre))) {
      
      const match = dresData.find((d) => d.nombre === defaultValues.dre)
      if (match) {
        setValue('dre', String(match.id))
      }
    } else if (defaultValues?.dre) {
      setValue('dre', String(defaultValues.dre))
    }
  }
  const fetchProvincias = async () => {
    const provinciasData = await getProvincias(region)
    setProvinciasOpts(provinciasData)
    if (defaultValues?.provincia) setValue('provincia', String(defaultValues.provincia))
  }
  const fetchDistritos = async () => {
    const distritosData = await getDistritos(provincia)
    setDistritosOpts(distritosData)
    if (defaultValues?.distrito) setValue('distrito', String(defaultValues.distrito))
  }
  const fetchUgeles = async () => {
    const ugelesData = await getUgeles(dre)
    setUgelesOpts(ugelesData)
    if (defaultValues?.ugel) setValue('ugel', String(defaultValues.ugel))
  }
  useEffect(() => {
    initFetch()
  }, [])

  const firstRegionRef = useRef(true)
  useEffect(() => {
    if (!region) return
    console.log(region,"Region", defaultValues,regiones, provinciasOpts)
    if (firstRegionRef.current) {
      firstRegionRef.current = false
      // No limpiar en la primera carga, solo poblar opciones
      fetchProvincias()
      return
    }
    // limpiar provincia/distrito al cambiar región (interactivo)
    resetField('provincia')
    resetField('distrito')
    fetchProvincias()
    setDistritosOpts([])
  }, [region, resetField])

  const firstRegionOptsRef = useRef(true);
  useEffect(()=>{
    if (regiones.length === 0) return
    if (firstRegionOptsRef.current) {
      firstRegionOptsRef.current = false
      if (defaultValues?.region) setValue('region', String(defaultValues.region))
    }
  },[regiones])

  const firstProvRef = useRef(true)
  useEffect(() => {
    if (!provincia) return
    if (firstProvRef.current) {
      firstProvRef.current = false
      fetchDistritos()
      return
    }
    // limpiar distrito al cambiar provincia (interactivo)
    resetField('distrito')
    fetchDistritos()
  }, [provincia, resetField])

  useEffect(() => {
    // limpiar campos condicionales segun perfil
    const showDreUgel = perfil && perfil !== 'Especialista MINEDU' && perfil !== 'Otro'
    if (!showDreUgel) {
      resetField('dre')
      resetField('ugel')
    }
    if (perfil !== 'Profesor de Innovación Pedagógica (PIP)') {
      resetField('codigoModular')
    }
    if (perfil !== 'Otro') {
      resetField('perfilEmbajadorOtro')
    }
  }, [perfil, resetField])

  const firstDreRef = useRef(true)
  useEffect(() => {
    if (!dre) return
    if (firstDreRef.current) {
      firstDreRef.current = false
      fetchUgeles()
      return
    }
    // limpiar UGEL al cambiar DRE (interactivo)
    resetField('ugel')
    fetchUgeles()
  }, [dre, resetField])

  

  // Construye un payload parcial basado en los campos modificados
  const buildPartialPayload = (values: Section1Type) => {
    const partial: Partial<EmbajadorModel> = {}
    const isDirty = (k: keyof typeof dirtyFields) => Boolean((dirtyFields as any)[k])

    // nombreCompleto -> nombre, apellido
    if (isDirty('nombreCompleto')) {
      const parts = (values.nombreCompleto ?? '').trim().split(/\s+/).filter(Boolean)
      if (parts.length <= 1) {
        partial.nombre = parts[0] ?? ''
        partial.apellido = ''
      } else {
        partial.apellido = parts.pop() as string
        partial.nombre = parts.join(' ')
      }
    }

    if (isDirty('tipoDocumento')) partial.tipo_de_documento_de_identificacion = values.tipoDocumento
    if (isDirty('numeroDocumento')) partial.numero_de_documento_de_identificacion = values.numeroDocumento
    if (isDirty('sexo')) partial.sexo = values.sexo
    if (isDirty('correo')) partial.correo_electronico = values.correo
    if (isDirty('celular')) {
      const tel = values.celular ? Number(values.celular) : undefined
      if (Number.isFinite(tel)) partial.telefono = tel as number
      else partial.telefono = undefined
    }
    if (isDirty('region')) partial.id_region = values.region ? Number(values.region) : undefined
    if (isDirty('provincia')) partial.id_provincia = values.provincia ? Number(values.provincia) : undefined
    if (isDirty('distrito')) partial.id_distrito = values.distrito ? Number(values.distrito) : undefined

    // Perfil: si alguno de los dos cambia, recalcular
    if (isDirty('perfilEmbajador') || isDirty('perfilEmbajadorOtro')) {
      partial.perfil = values.perfilEmbajador === 'Otro' && values.perfilEmbajadorOtro
        ? values.perfilEmbajadorOtro
        : values.perfilEmbajador
    }

    if (isDirty('dre')) partial.dre = values.dre
    if (isDirty('ugel')) partial.ugel = values.ugel
    if (isDirty('codigoModular')) partial.cod_mod = values.codigoModular

    return partial
  }

  const onSubmit = (values: Section1Type) => {
    
    if (mode === 'update' && onUpdate) return onUpdate(values)
    return onNext(values)
  }
  
  
  //
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid">
        <div className="col-6 field">
          <label>Tipo de documento</label>
          <select {...register('tipoDocumento')}>
            <option value="">Seleccione…</option>
            {docTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.tipoDocumento && <span className="error">{errors.tipoDocumento.message}</span>}
        </div>
        <div className="col-6 field">
          <label>Número de documento</label>
          <input {...register('numeroDocumento')} inputMode="numeric" />
          {errors.numeroDocumento && <span className="error">{errors.numeroDocumento.message}</span>}
        </div>

        <div className="col-12 field">
          <label>Nombres y apellidos</label>
          <input {...register('nombreCompleto')} />
          {errors.nombreCompleto && <span className="error">{errors.nombreCompleto.message}</span>}
        </div>

        <div className="col-6 field">
          <label>Sexo</label>
          <select {...register('sexo')}>
            <option value="">Seleccione…</option>
            {sexOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.sexo && <span className="error">{errors.sexo.message}</span>}
        </div>
        <div className="col-6 field">
          <label>Correo electrónico</label>
          <input {...register('correo')} type="email" />
          {errors.correo && <span className="error">{errors.correo.message}</span>}
        </div>

        <div className="col-6 field">
          <label>Celular</label>
          <input {...register('celular')} inputMode="numeric" />
          {errors.celular && <span className="error">{errors.celular.message}</span>}
        </div>

        <div className="col-6 field">
          <label>Región</label>
          
          
        
      <select {...register('region')}>
            <option value="">Seleccione…</option>
            {regiones.map((o) => {
        return <option key={o.nombre} value={String(o.id)}>{o.nombre}</option>
            })}
          </select>
          {errors.region && <span className="error">{errors.region.message}</span>}
        </div>

        <div className="col-6 field">
          <label>Provincia</label>
      <select {...register('provincia')} disabled={!region}>
            
            <option value="">Seleccione…</option>
            {provinciasOpts.map((o) => (
        <option key={o.nombre} value={String(o.id)}>{o.nombre}</option>
            ))}
          </select>
          {errors.provincia && <span className="error">{errors.provincia.message}</span>}
        </div>

        <div className="col-6 field">
          <label>Distrito</label>
      <select {...register('distrito')} disabled={!provincia}>
            <option value="">Seleccione…</option>
            {distritosOpts.map((o) => (
        <option key={o.id} value={String(o.id)}>{o.nombre}</option>
            ))}
          </select>
          {errors.distrito && <span className="error">{errors.distrito.message}</span>}
        </div>

        <div className="col-6 field">
          <label>Perfil del embajador</label>
          <select {...register('perfilEmbajador')}>
            <option value="">Seleccione…</option>
            {perfilEmbajadorOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.perfilEmbajador && <span className="error">{errors.perfilEmbajador.message}</span>}
          <span className="muted">Culmina el registro si selecciona las opciones correspondientes.</span>
        </div>

        {perfil === 'Otro' && (
          <div className="col-6 field">
            <label>Especifique el perfil</label>
            <input {...register('perfilEmbajadorOtro')} placeholder="Describa el perfil" />
            {errors.perfilEmbajadorOtro && <span className="error">{errors.perfilEmbajadorOtro.message}</span>}
          </div>
        )}

        {perfil && perfil !== 'Especialista MINEDU' && perfil !== 'Otro' && (
          <>
            <div className="col-6 field">
              <label>DRE/GRE</label>
        <select {...register('dre')}>
                <option value="">Seleccione…</option>
                {dreOpts.map((o) => (
          <option key={o.nombre} value={String(o.id)}>{o.nombre}</option>
                ))}
              </select>
              {errors.dre && <span className="error">{errors.dre.message}</span>}
            </div>
            <div className="col-6 field">
              <label>UGEL</label>
              <select {...register('ugel')} disabled={!dre}>
                <option value="">Seleccione…</option>
                {ugelesOpts.map((o) => (
                  <option key={o.nombre} value={o.nombre}>{o.nombre}</option>
                ))}
              </select>
              {errors.ugel && <span className="error">{errors.ugel.message}</span>}
            </div>
          </>
        )}

  {perfil === 'Profesor de Innovación Pedagógica (PIP)' && (
          <div className="col-6 field">
            <label>Código modular de la IIEE</label>
            <input {...register('codigoModular')} />
            {errors.codigoModular && <span className="error">{errors.codigoModular.message}</span>}
          </div>
        )}
      </div>

    {showActions && (
        <div className="actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {mode !== 'update' &&<button type="submit" className="btn"> 'Crear embajador'</button>}
          
          {mode === 'update' && onPartialUpdate && (
            <button
              type="button"
              className="btn ghost"
              onClick={(e) => {
                e.preventDefault()
                console.log('onSubmit', getValues(), defaultValues)
                const partial = buildPartialPayload(getValues())
                onPartialUpdate(partial)
              }}
              disabled={Object.keys(dirtyFields).length === 0}
              title={Object.keys(dirtyFields).length === 0 ? 'Sin cambios por actualizar' : 'Enviar solo cambios'}
            >
              Actualizar
            </button>
          )}
        </div>
      )}
    </form>
  )
}
