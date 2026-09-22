import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/utils/cn";

const gayaDasar =
  "w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 disabled:bg-stone-100 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-50 dark:placeholder:text-stone-500 dark:disabled:bg-stone-800";

const gayaError =
  "border-rose-400 focus:border-rose-500 focus:ring-rose-500/25 dark:border-rose-500";

export interface PropField {
  label: string;
  htmlFor?: string;
  pesanError?: string;
  petunjuk?: string;
  wajib?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  htmlFor,
  pesanError,
  petunjuk,
  wajib,
  className,
  children,
}: PropField) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-stone-700 dark:text-stone-200">
        {label}
        {wajib && (
          <span className="ml-1 text-rose-600 dark:text-rose-400" aria-hidden="true">
            *
          </span>
        )}
        {wajib && <span className="sr-only"> (wajib diisi)</span>}
      </label>
      {children}
      {pesanError ? (
        <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
          {pesanError}
        </p>
      ) : petunjuk ? (
        <p className="text-xs text-stone-500 dark:text-stone-400">{petunjuk}</p>
      ) : null}
    </div>
  );
}

export interface PropInput extends InputHTMLAttributes<HTMLInputElement> {
  pesanError?: string;
}

export const Input = forwardRef<HTMLInputElement, PropInput>(function Input(
  { className, pesanError, ...lainnya },
  ref
) {
  return (
    <input
      ref={ref}
      aria-invalid={pesanError ? true : undefined}
      className={cn(gayaDasar, pesanError && gayaError, className)}
      {...lainnya}
    />
  );
});

export interface PropTextarea extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  pesanError?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, PropTextarea>(function Textarea(
  { className, pesanError, ...lainnya },
  ref
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={pesanError ? true : undefined}
      className={cn(gayaDasar, "min-h-24 resize-y", pesanError && gayaError, className)}
      {...lainnya}
    />
  );
});

export interface PropSelect extends SelectHTMLAttributes<HTMLSelectElement> {
  pesanError?: string;
}

export const Select = forwardRef<HTMLSelectElement, PropSelect>(function Select(
  { className, pesanError, children, ...lainnya },
  ref
) {
  return (
    <select
      ref={ref}
      aria-invalid={pesanError ? true : undefined}
      className={cn(gayaDasar, "cursor-pointer pr-9", pesanError && gayaError, className)}
      {...lainnya}
    >
      {children}
    </select>
  );
});
