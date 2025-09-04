import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  section3Schema,
  type Section3 as Section3Type,
  docTypeOptions,
  sexOptions,
  perfilParticipanteOptions,
  nivelEducativoOptions,
  gradoOptions,
} from '../types'

type Props = {
  defaultValues?: Partial<Section3Type>
  onBack?: () => void
  onSubmit: (values: Section3Type) => void | Promise<void>
  submitLabel?: string
  showBack?: boolean
}

export function Section3({ defaultValues, onBack, onSubmit, submitLabel = 'Enviar', showBack = true }: Props) {
  const { register, handleSubmit, watch, resetField, reset, formState: { errors } } = useForm<Section3Type>({
    resolver: zodResolver(section3Schema),
    defaultValues: {
      nombreCompleto: '',
      tipoDocumento: '',
      numeroDocumento: '',
      sexo: '',
      correo: '',
      celular: '',
      perfilParticipante: '',
      nivelEducativo: '',
      grado: '',
      perfilParticipanteOtro: '',
      ...defaultValues,
    },
  })

  const nivel = watch('nivelEducativo')
  const perfil = watch('perfilParticipante')
  useEffect(() => { resetField('grado') }, [nivel, resetField])
  useEffect(() => {
    if (perfil !== 'Estudiante') {
      resetField('nivelEducativo')
      resetField('grado')
    }
    if (perfil !== 'Otro') {
      resetField('perfilParticipanteOtro')
    }
  }, [perfil, resetField])

  const grados = gradoOptions[nivel ?? ''] ?? []

  const handleSubmitInternal = async (values: Section3Type) => {
    try {
      await onSubmit(values)
      // Si no hubo error en onSubmit, limpiar el formulario a sus valores por defecto
      reset()
    } catch {
      // Mantener los valores si onSubmit falla
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitInternal)} noValidate>
      
      <div className="grid">
        <div className="col-6 field">
          <label>Nombres y apellidos del participante</label>
          <input {...register('nombreCompleto')} />
          {errors.nombreCompleto && <span className="error">{errors.nombreCompleto.message}</span>}
        </div>
        <div className="col-6 field">
          <label>Tipo de documento</label>
          <select {...register('tipoDocumento')}>
            <option value="">Seleccione…</option>
            {docTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errors.tipoDocumento && <span className="error">{errors.tipoDocumento.message}</span>}
        </div>
        <div className="col-6 field">
          <label>Número de documento</label>
          <input {...register('numeroDocumento')} inputMode="numeric" />
          {errors.numeroDocumento && <span className="error">{errors.numeroDocumento.message}</span>}
        </div>
        <div className="col-6 field">
          <label>Sexo</label>
          <select {...register('sexo')}>
            <option value="">Seleccione…</option>
            {sexOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errors.sexo && <span className="error">{errors.sexo.message}</span>}
        </div>
        <div className="col-6 field">
          <label>Correo electrónico</label>
          <input type="email" {...register('correo')} />
          {errors.correo && <span className="error">{errors.correo.message}</span>}
        </div>
        <div className="col-6 field">
          <label>Celular</label>
          <input inputMode="numeric" {...register('celular')} />
          {errors.celular && <span className="error">{errors.celular.message}</span>}
        </div>
        <div className="col-6 field">
          <label>Perfil del participante</label>
          <select {...register('perfilParticipante')}>
            <option value="">Seleccione…</option>
            {perfilParticipanteOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errors.perfilParticipante && <span className="error">{errors.perfilParticipante.message}</span>}
        </div>
        {perfil === 'Estudiante' && (
          <>
            <div className="col-6 field">
              <label>Nivel educativo</label>
              <select {...register('nivelEducativo')}>
                <option value="">Seleccione…</option>
                {nivelEducativoOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {errors.nivelEducativo && <span className="error">{errors.nivelEducativo.message}</span>}
            </div>
            <div className="col-6 field">
              <label>Grado</label>
              <select {...register('grado')} disabled={!nivel}>
                <option value="">Seleccione…</option>
                {grados.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {errors.grado && <span className="error">{errors.grado.message}</span>}
            </div>
          </>
        )}

        {perfil === 'Otro' && (
          <div className="col-6 field">
            <label>Especifique el perfil</label>
            <input {...register('perfilParticipanteOtro')} placeholder="Describa el perfil" />
            {errors.perfilParticipanteOtro && <span className="error">{errors.perfilParticipanteOtro.message}</span>}
          </div>
        )}
      </div>
      <div className="actions">
        {showBack && <button type="button" className="btn ghost" onClick={onBack}>Atrás</button>}
        <button type="submit" className="btn">{submitLabel}</button>
      </div>
    </form>
  )
}
