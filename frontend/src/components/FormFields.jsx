import React from "react";

export const Field = ({ label, error, children, required }) => (
  <div className="mb-4">
    <label className="mb-1.5 block text-sm font-medium text-ink-800">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const baseClasses =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500";

export const Input = React.forwardRef((props, ref) => (
  <input
    ref={ref}
    className={baseClasses}
    {...props}
  />
));

Input.displayName = "Input";

export const Textarea = React.forwardRef((props, ref) => (
  <textarea
    ref={ref}
    className={`${baseClasses} min-h-[80px] resize-y`}
    {...props}
  />
));

Textarea.displayName = "Textarea";

export const Select = React.forwardRef(({ children, ...props }, ref) => (
  <select
    ref={ref}
    className={baseClasses}
    {...props}
  >
    {children}
  </select>
));

Select.displayName = "Select";