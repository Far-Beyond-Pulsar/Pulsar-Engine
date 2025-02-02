import React from 'react';
import { AlertCircle } from 'lucide-react';

const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = {
    default: "bg-zinc-950 text-zinc-50",
    destructive: "bg-red-500 text-zinc-50 dark:border-red-900"
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={`relative w-full rounded-lg border border-zinc-800 p-4 ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
});

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  />
));

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm opacity-90 ${className}`}
    {...props}
  />
));

export { Alert, AlertTitle, AlertDescription };