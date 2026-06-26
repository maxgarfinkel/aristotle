interface FormFieldProps {
  id: string
  label: string
  type?: 'text' | 'number' | 'date'
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  min?: string | number | undefined
  max?: string | number | undefined
  step?: number
  placeholder?: string
  hint?: string
}

export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  disabled,
  min,
  max,
  step,
  placeholder,
  hint,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-gray-500">
          {hint}
        </p>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        aria-describedby={hintId}
        className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  )
}
