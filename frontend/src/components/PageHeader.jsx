const PageHeader = ({ eyebrow, title, subtitle, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      {eyebrow && (
        <p className="mb-1 font-data text-xs uppercase tracking-widest text-teal-600">{eyebrow}</p>
      )}
      <h1 className="text-2xl font-semibold text-ink-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default PageHeader;
