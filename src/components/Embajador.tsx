import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
import { set } from 'zod/v4'
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
  control,
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

    if (defaultValues?.region) {
      console.log("Precargando provincias", defaultValues.region)
      fetchProvincias(String(defaultValues.region))
    }
    if(defaultValues?.provincia){  
      console.log("Precargando distritos", defaultValues.provincia)
      fetchDistritos(String(defaultValues.provincia))
    }
    if (defaultValues?.dre) {
      fetchUgeles(String(defaultValues.dre))
    }
    
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
  const fetchProvincias = async (id_region: string) => {
    const provinciasData = await getProvincias(id_region)
    
    setProvinciasOpts(provinciasData)
  }
  const fetchDistritos = async (id_provincia: string) => {
    const distritosData = await getDistritos(id_provincia)
    setDistritosOpts(distritosData)
    //if (defaultValues?.distrito) setValue('distrito', String(defaultValues.distrito))
  }
  const fetchUgeles = async (dreId: string) => {
    const ugelesData = await getUgeles(dreId)
    setUgelesOpts(ugelesData)
  }
  useEffect(() => {
    initFetch()
  }, [])
  // Precargar dependencias según valores por defecto sin limpiar campos
  //useEffect(() => {
  //  if (region && provinciasOpts.length === 0) fetchProvincias(region)
  //}, [region])
  //useEffect(() => {
  //  if (provincia && distritosOpts.length === 0) fetchDistritos(provincia)
  //}, [provincia])

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

  //useEffect(() => {
  //  if (dre && ugelesOpts.length === 0) fetchUgeles(dre)
  //}, [dre])

  

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
    // Región/Provincia/Distrito: enviar null explícito cuando se limpian, y nulificar dependientes
    if (isDirty('region')) {
      partial.id_region = values.region ? Number(values.region) : null
      // Al cambiar región, provincia y distrito deben quedar sin valor en backend
      partial.id_provincia = null
      partial.id_distrito = null
    }
    if (isDirty('provincia')) {
      partial.id_provincia = values.provincia ? Number(values.provincia) : null
      // Al cambiar provincia, distrito debe quedar sin valor
      partial.id_distrito = null
    }
    if (isDirty('distrito')) {
      partial.id_distrito = values.distrito ? Number(values.distrito) : null
    }

    // Perfil: si alguno de los dos cambia, recalcular
    if (isDirty('perfilEmbajador') || isDirty('perfilEmbajadorOtro')) {
      partial.perfil = values.perfilEmbajador === 'Otro' && values.perfilEmbajadorOtro
        ? values.perfilEmbajadorOtro
        : values.perfilEmbajador
    }

    // DRE/UGEL: enviar null cuando se limpian y nulificar UGEL si cambia DRE
    if (isDirty('dre')) {
      partial.dre = values.dre ? values.dre : null
      partial.ugel = null
    }
    if (isDirty('ugel')) {
      partial.ugel = values.ugel ? values.ugel : null
    }
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
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                onChange={(e) => {
                  field.onChange(e)
                  // Limpiar dependientes y cargar provincias
                  resetField('provincia')
                  resetField('distrito')
                  setDistritosOpts([])
                  fetchProvincias(e.target.value)
                }}
              >
                <option value="">Seleccione…</option>
                {regiones.map((o) => (
                  <option key={o.nombre} value={String(o.id)}>{o.nombre}</option>
                ))}
              </select>
            )}
          />
          {errors.region && <span className="error">{errors.region.message}</span>}
        </div>

        <div className="col-6 field">
          <label>Provincia</label>
          <Controller
            name="provincia"
            control={control}
            disabled = {!region}
            render={({ field }) => (
              <select
                {...field}
                disabled={!region}
                onChange={(e) => {
                  field.onChange(e)
                  // Limpiar distrito y cargar distritos
                  resetField('distrito')
                  fetchDistritos(e.target.value)
                }}
              >
                <option value="">Seleccione…</option>
                {provinciasOpts.map((o) => (
                  <option key={o.nombre} value={String(o.id)}>{o.nombre}</option>
                ))}
              </select>
            )}
          />
          {errors.provincia && <span className="error">{errors.provincia.message}</span>}
        </div>

        <div className="col-6 field">
          <label>Distrito</label>
          <Controller
            name="distrito"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                disabled={!provincia || !region}
                onChange={(e) => {
                  field.onChange(e)
                }}
              >
                <option value="">Seleccione…</option>
                {distritosOpts.map((o) => (
                  <option key={o.id} value={String(o.id)}>{o.nombre}</option>
                ))}
              </select>
            )}
          />
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
              <Controller
                name="dre"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      resetField('ugel')
                      fetchUgeles(e.target.value)
                    }}
                  >
                    <option value="">Seleccione…</option>
                    {dreOpts.map((o) => (
                      <option key={o.nombre} value={String(o.id)}>{o.nombre}</option>
                    ))}
                  </select>
                )}
              />
              {errors.dre && <span className="error">{errors.dre.message}</span>}
            </div>
            <div className="col-6 field">
              <label>UGEL</label>
              <Controller
                name="ugel"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    disabled={!dre}
                    onChange={(e) => {
                      field.onChange(e)
                    }}
                  >
                    <option value="">Seleccione…</option>
                    {ugelesOpts.map((o) => (
                      <option key={o.nombre} value={o.nombre}>{o.nombre}</option>
                    ))}
                  </select>
                )}
              />
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
                console.log('Partial payload', partial)
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
