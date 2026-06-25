import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm text-stone">
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          className={`w-full border rounded-sm px-3 py-2 text-sm outline-none transition-colors resize-y min-h-[100px]
            ${error ? "border-henna focus:border-henna" : "border-stone/30 focus:border-gold-deep"}
            ${className}`}
          {...props}
        />
        {error && <p className="text-henna text-xs">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
