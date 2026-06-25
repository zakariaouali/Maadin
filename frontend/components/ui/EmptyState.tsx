import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-stone/40 mb-4">{icon}</div>}
      <h3 className="font-display text-lg text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-stone mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
