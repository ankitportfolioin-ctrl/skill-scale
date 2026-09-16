'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function AdminCard({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl border bg-card shadow-sm', className)}>
      <header className="border-b px-5 py-4">
        <h2 className="font-heading text-base font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="text-xs leading-5 text-muted-foreground">{hint}</span>}
    </label>
  )
}

export const inputClassName = 'h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted'
export const textareaClassName = 'min-h-24 w-full resize-y rounded-lg border bg-background px-3 py-2.5 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/10'

export function TextInput({ label, value, onChange, hint, type = 'text', min, max, step, required, placeholder, className }: { label: string; value: string | number; onChange: (value: string) => void; hint?: string; type?: string; min?: number; max?: number; step?: number; required?: boolean; placeholder?: string; className?: string }) {
  return <Field label={label} hint={hint} className={className}><input className={inputClassName} type={type} value={value} onChange={(event) => onChange(event.target.value)} min={min} max={max} step={step} required={required} placeholder={placeholder} /></Field>
}

export function TextArea({ label, value, onChange, hint, rows = 4, className }: { label: string; value: string; onChange: (value: string) => void; hint?: string; rows?: number; className?: string }) {
  return <Field label={label} hint={hint} className={className}><textarea className={textareaClassName} value={value} onChange={(event) => onChange(event.target.value)} rows={rows} /></Field>
}

export function SelectField({ label, value, onChange, options, className }: { label: string; value: string; onChange: (value: string) => void; options: string[]; className?: string }) {
  return <Field label={label} className={className}><select className={inputClassName} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></Field>
}

export function ToggleField({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border bg-background px-4 py-3">
      <span><span className="block text-sm font-semibold">{label}</span>{description && <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{description}</span>}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-primary" />
    </label>
  )
}

export function EditorGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>
}
