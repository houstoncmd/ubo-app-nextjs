interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  const items = [{ label: "Home", href: "/dashboard" }, ...breadcrumbs];

  return (
    <div className="mb-6">
      <nav className="lhb-breadcrumb mb-3">
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-2">
            {index > 0 && <i className="bi bi-chevron-right text-xs"></i>}
            {item.href ? (
              <a href={item.href} className="hover:underline">{item.label}</a>
            ) : (
              <span className="text-slate-700">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          {subtitle && (
            <p className="text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
