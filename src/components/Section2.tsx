
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DRE, section2Schema, Ugel, type Section2 as Section2Type } from '../types'
import { getDres, getUgeles } from '../data'
import { getPadronByCodMod } from '../data/Padron'
import type { Padron } from '../model/Padron'

type Props = {
  defaultValues?: Partial<Section2Type>
  onBack?: () => void
  onNext: (values: Section2Type) => void
  showActions?: boolean
  submitLabel?: string,
  edition?: boolean
}

export function Section2({ defaultValues, onBack, onNext, showActions = true, 
  submitLabel = 'Siguiente',
  edition = false
}: Props) {
  // Fecha por defecto: hoy (zona horaria local)
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const todayStr = `${yyyy}-${mm}-${dd}`

  const { register, handleSubmit, watch, resetField, setValue, formState: { errors } } = useForm<Section2Type>({
    resolver: zodResolver(section2Schema),
    defaultValues: {
      codigoModular: '',
      dre: '',
      ugel: '',
      fecha: defaultValues?.fecha ?? todayStr,
      horaInicio: '',
      horaFin: '',
      fotosUrl: '',
      ...defaultValues,
    },
  })

  const dre = watch('dre')
  const codigoModular = watch('codigoModular')
  //useEffect(() => { resetField('ugel') }, [dre, resetField])
  const [dreOpts, setDreOpts] = useState<DRE[]>([])
  const [ugelesOpts, setUgelesOpts] = useState<Ugel[]>([]);


  const fetchDres = async () => {
    const dresData = await getDres()
    setDreOpts(dresData)
    // Mapear default por nombre -> id si aplica (para modo edición)
    
  }

  const fetchUgeles = async () => {
    const ugelesData = await getUgeles(dre)
    setUgelesOpts(ugelesData)
    // Mapear default por nombre -> id si aplica (para modo edición)
    
  }
  //useEffect(() => {
  //  fetchDres()
  //}, [])
  //useEffect(() => {
  //  // limpiar UGEL al cambiar DRE
  //  resetField('ugel')
  //  fetchUgeles()
  //}, [dre, resetField])

  // Debounce + cache para consultar padrón solo una vez por código
  const debounceRef = useRef<number | null>(null)
  const cacheRef = useRef<Map<string, Padron | null>>(new Map())
  const lastRequestedRef = useRef<string | null>(null)

  const applyPadron = (pad: Padron | null | undefined) => {
    if (!pad) {
      setValue('dre', 'Sin DRE')
      setValue('ugel', 'Sin UGEL')
      return
    }
    // Intento básico: si d_dreugel viene como texto "UGEL ...", úsalo como UGEL.
    // Si no hay una separación clara, al menos llenamos ambos con la misma referencia descriptiva.
    const dre = pad.d_region || 'Sin DRE'
    const ugel = pad.d_dreugel || 'Sin UGEL'
    setValue('dre', dre)
    setValue('ugel', ugel)
  }

  useEffect(() => {
    const code = (codigoModular || '').trim()
    if (!code) return

    // Caso especial: no representa IE
    if (code === '0000000') {
      setValue('dre', 'Sin DRE')
      setValue('ugel', 'Sin UGEL')
      return
    }

    // Reglas simples para evitar llamadas innecesarias en tipeo
    const isLikelyValid = /^\d{3,}$/.test(code)
    if (!isLikelyValid) return

    // Si ya está en caché, reutilizar inmediatamente
    if (cacheRef.current.has(code)) {
      applyPadron(cacheRef.current.get(code))
      return
    }

    // Debounce de 500ms
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(async () => {
      if (lastRequestedRef.current === code) return
      lastRequestedRef.current = code
      try {
        const pad = await getPadronByCodMod(code)
        
        cacheRef.current.set(code, pad)
        applyPadron(pad)
      } catch (e) {
        // Silenciar errores de red; no bloquear el flujo
        console.log("Error al obtener padrón:", e)
      }
    }, 500)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [codigoModular, setValue])


  const onSubmit = (values: Section2Type) => {
    // Convertir el id (string) de DRE a su nombre; UGEL ya usa nombre como value
    const dreName = dreOpts.find(d => String(d.id) === String(values.dre))?.nombre || values.dre || ''
    const ugelName = values.ugel || ''
    onNext({ ...values, dre: dreName, ugel: ugelName })
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <details open style={{
        border: '1px solid #e5e7eb',
        background: '#fafafa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12
      }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Para tomar en cuenta</summary>
        <div style={{ color: '#4b5563', fontSize: 14, marginTop: 8 }}>
          <p>
            Para consultar el código modular de tu IE, entra al siguiente enlace:<br/>
            <a href="https://escale.minedu.gob.pe/web/inicio/padron-de-iiee" target="_blank" rel="noopener noreferrer">
              https://escale.minedu.gob.pe/web/inicio/padron-de-iiee
            </a><br/>
            Copia el código modular y pégalo aquí.<br/>
            Nota: En caso de no representar a ninguna IE, coloca 0000000
          </p>
        </div>
      </details>
      <div className="grid">
        <div className="col-6 field">
          <label>Código modular de la IIEE</label>
          <input {...register('codigoModular')} />
          {errors.codigoModular && <span className="error">{errors.codigoModular.message}</span>}
        </div>
        <div className="col-6 field">
          <label>Fecha de la réplica</label>
          <input type="date" {...register('fecha')} />
          {errors.fecha && <span className="error">{errors.fecha.message}</span>}
        </div>
        
        <>
          <div className="col-6 field">
            <label>DRE/GRE</label>
            <input {...register('dre')} disabled/>
            {errors.dre && <span className="error">{errors.dre.message}</span>}
          </div>
          <div className="col-6 field">
            <label>UGEL</label>
            <input {...register('ugel')} disabled/>
            {errors.ugel && <span className="error">{errors.ugel.message}</span>}
          </div>
        </>
        
        
        <div className="col-6 field">
          <label>Hora de inicio de la réplica</label>
          <input type="time" {...register('horaInicio')} />
          {errors.horaInicio && <span className="error">{errors.horaInicio.message}</span>}
        </div>
        <div className="col-6 field">
          <label>Hora de fin de la réplica</label>
          <input type="time" {...register('horaFin')} />
          {errors.horaFin && <span className="error">{errors.horaFin.message}</span>}
        </div>
        <div className="col-12 field">
          <label>Enlace de fotografías (4 fotografías)</label>
          <input type="url" placeholder="https://…" {...register('fotosUrl')} />
          {errors.fotosUrl && <span className="error">{errors.fotosUrl.message}</span>}
        </div>
      </div>
      {showActions && (
        <div className="actions">
          <button type="submit" className="btn">{submitLabel}</button>
        </div>
      )}
    </form>
  )
}
/**
 * 
          <button type="button" className="btn ghost" onClick={onBack}>Atrás</button>
 {!edition &&<>
        <div className="col-6 field">
          <label>DRE/GRE</label>
          <select {...register('dre')}>
            <option value="">Seleccione…</option>
            {dreOpts.map((o) => <option key={o.nombre} value={o.id}>{o.nombre}</option>)}
          </select>
          {errors.dre && <span className="error">{errors.dre.message}</span>}
        </div>
        <div className="col-6 field">
          <label>UGEL</label>
          <select {...register('ugel')} disabled={!dre}>
            <option value="">Seleccione…</option>
            {ugelesOpts.map((o) => <option key={o.nombre} value={o.nombre}>{o.nombre}</option>)}
          </select>
          {errors.ugel && <span className="error">{errors.ugel.message}</span>}
        </div>
        </>}
 */
