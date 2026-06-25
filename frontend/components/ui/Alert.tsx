import { ReactNode } from "react";

type AlertType = "error" | "success" | "warning" | "info";

interface AlertProps {
  type?: AlertType;
  children: ReactNode;
  className?: string;
}

const styles: Record<AlertType, string> = {
  error:   "bg-red-50 border-henna/30 text-henna",
  success: "bg-green-50 border-green-300 text-green-800",
  warning: "bg-amber-50 border-amber-300 text-amber-800",
  info:    "bg-blue-50 border-blue-300 text-blue-800",
};

export function Alert({ type = "error", children, className = "" }: AlertProps) {
  return (
    <div className={`border rounded-sm px-4 py-3 text-sm ${styles[type]} ${className}`}>
      {children}
    </div>
  );
}
