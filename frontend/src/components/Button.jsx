const variants = {
  primary: "bg-teal-500 text-white hover:bg-teal-600 shadow-card",
  secondary: "bg-white text-ink-900 border border-slate-200 hover:bg-slate-50",
  danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
  ghost: "text-ink-700 hover:bg-slate-100",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        Icon && <Icon size={16} strokeWidth={2} />
      )}
      {children}
    </button>
  );
};

export default Button;
