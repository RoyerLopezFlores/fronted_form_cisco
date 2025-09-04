type Props = { current: number; labels: string[] }

export function FormStepper({ current, labels }: Props) {
  return (
    <div className="stepper" role="tablist" aria-label="Pasos del formulario">
      {labels.map((label, i) => (
        <span key={label} className={"chip" + (i === current ? " active" : "")}>{i + 1}. {label}</span>
      ))}
    </div>
  )
}
