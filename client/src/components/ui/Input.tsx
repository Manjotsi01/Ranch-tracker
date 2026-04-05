// client/src/components/ui/Input.tsx
import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

/* ─── Shared field wrapper ───────────────────────────────────────── */

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  id?: string;
  required?: boolean;
  success?: boolean;
  children: ReactNode;
}

function FieldWrapper({ label, error, hint, id, required, success, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors duration-150',
            error ? 'text-red-400' : success ? 'text-emerald-400' : 'text-[#4a6a5a]'
          )}
        >
          {label}
          {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error && (
        <div className="flex items-center gap-1.5 animate-fade-in" role="alert" aria-live="polite">
          <AlertCircle size={11} className="text-red-400 flex-shrink-0" aria-hidden="true" />
          <p className="text-[11px] text-red-400">{error}</p>
        </div>
      )}
      {hint && !error && (
        <p className="text-[11px] text-[#2a4a3a]">{hint}</p>
      )}
    </div>
  );
}

/* ─── INPUT ──────────────────────────────────────────────────────── */

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  success?: boolean;
  /** Enable show/hide toggle for password fields (auto-detects type="password") */
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      prefix,
      suffix,
      success,
      showPasswordToggle,
      className,
      id,
      type,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '_');
    const isPassword = type === 'password';
    const [showPw, setShowPw] = useState(false);

    const resolvedType = isPassword && showPw ? 'text' : type;

    const borderColor = error
      ? 'rgba(239,68,68,0.4)'
      : success
      ? 'rgba(74,222,128,0.3)'
      : 'rgba(255,255,255,0.07)';

    const focusBorderColor = error
      ? 'rgba(239,68,68,0.6)'
      : success
      ? 'rgba(74,222,128,0.5)'
      : 'rgba(74,222,128,0.35)';

    return (
      <FieldWrapper label={label} error={error} hint={hint} id={inputId} required={required} success={success}>
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl border px-3 py-2.5',
            'transition-all duration-150',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          style={{
            background: 'rgba(13,17,23,0.8)',
            borderColor,
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
          }}
          onFocusCapture={e => {
            (e.currentTarget as HTMLElement).style.borderColor = focusBorderColor;
            (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 1px 2px rgba(0,0,0,0.2), 0 0 0 3px ${focusBorderColor.replace('0.35', '0.1')}`;
          }}
          onBlurCapture={e => {
            (e.currentTarget as HTMLElement).style.borderColor = borderColor;
            (e.currentTarget as HTMLElement).style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.2)';
          }}
        >
          {/* Prefix icon */}
          {prefix && (
            <span className="flex-shrink-0 text-[#2a4a3a]" aria-hidden="true">{prefix}</span>
          )}

          {/* Input element */}
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            required={required}
            disabled={disabled}
            {...props}
            className={cn(
              'flex-1 bg-transparent text-sm text-[#c8d8e8] min-w-0',
              'placeholder:text-[#1e3028] outline-none',
              'font-body',
              className
            )}
            style={{ caretColor: '#4ade80' }}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          />

          {/* Password toggle */}
          {(isPassword || showPasswordToggle) && (
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="flex-shrink-0 text-[#2a4a3a] hover:text-[#6a8a7a] transition-colors"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}

          {/* Success / error icon (right side) */}
          {success && !error && (
            <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" aria-hidden="true" />
          )}
          {error && (
            <AlertCircle size={14} className="text-red-400 flex-shrink-0" aria-hidden="true" />
          )}

          {/* Custom suffix */}
          {suffix && !error && !success && (
            <span className="flex-shrink-0 text-[#2a4a3a]" aria-hidden="true">{suffix}</span>
          )}
        </div>
      </FieldWrapper>
    );
  }
);
Input.displayName = 'Input';

/* ─── SELECT ─────────────────────────────────────────────────────── */

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  success?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, success, className, id, required, disabled, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '_');

    return (
      <FieldWrapper label={label} error={error} id={inputId} required={required} success={success}>
        <select
          ref={ref}
          id={inputId}
          required={required}
          disabled={disabled}
          {...props}
          className={cn(
            'w-full rounded-xl border px-3 py-2.5 text-sm text-[#c8d8e8]',
            'outline-none transition-all duration-150 cursor-pointer',
            'font-body appearance-none',
            'focus:ring-1',
            error
              ? 'border-red-500/40 focus:border-red-500/60'
              : success
              ? 'border-emerald-500/30 focus:border-emerald-500/50'
              : 'border-white/7 focus:border-emerald-500/35 focus:ring-emerald-500/10',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          style={{
            background: 'rgba(13,17,23,0.8)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
            caretColor: '#4ade80',
          }}
          aria-invalid={error ? 'true' : undefined}
        >
          {placeholder && (
            <option value="" style={{ background: '#0d1117', color: '#3a4a5a' }}>
              {placeholder}
            </option>
          )}
          {options.map(o => (
            <option key={o.value} value={o.value} style={{ background: '#0d1117', color: '#c8d8e8' }}>
              {o.label}
            </option>
          ))}
        </select>
      </FieldWrapper>
    );
  }
);
Select.displayName = 'Select';

/* ─── TEXTAREA ───────────────────────────────────────────────────── */

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, success, className, id, required, disabled, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '_');

    return (
      <FieldWrapper label={label} error={error} hint={hint} id={inputId} required={required} success={success}>
        <textarea
          ref={ref}
          id={inputId}
          rows={3}
          required={required}
          disabled={disabled}
          {...props}
          className={cn(
            'w-full rounded-xl border px-3 py-2.5 text-sm text-[#c8d8e8]',
            'placeholder:text-[#1e3028] outline-none resize-none font-body',
            'transition-all duration-150',
            'focus:ring-1',
            error
              ? 'border-red-500/40 focus:border-red-500/60'
              : success
              ? 'border-emerald-500/30 focus:border-emerald-500/50'
              : 'border-white/7 focus:border-emerald-500/35 focus:ring-emerald-500/10',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          style={{
            background: 'rgba(13,17,23,0.8)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
            caretColor: '#4ade80',
          }}
          aria-invalid={error ? 'true' : undefined}
        />
      </FieldWrapper>
    );
  }
);
TextArea.displayName = 'TextArea';

/* ─── FORM GROUP (groups related fields) ─────────────────────────── */

interface FormGroupProps {
  legend?: string;
  children: ReactNode;
  className?: string;
}

export function FormGroup({ legend, children, className }: FormGroupProps) {
  return (
    <fieldset
      className={cn('space-y-3', className)}
      style={{ border: 'none', padding: 0, margin: 0 }}
    >
      {legend && (
        <legend className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#2a4a3a] pb-1 w-full">
          {legend}
        </legend>
      )}
      {children}
    </fieldset>
  );
}