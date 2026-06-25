import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm text-stone">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={`w-full border rounded-sm px-3 py-2 text-sm outline-none transition-colors
            ${error ? "border-henna focus:border-henna" : "border-stone/30 focus:border-gold-deep"}
            ${className}`}
          {...props}
        />
        {error && <p className="text-henna text-xs">{error}</p>}
        {hint && !error && <p className="text-stone text-xs">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
