interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

/** 2a's listing-page header (Projects, Articles): a large title, a 17px standfirst, and
 *  optional controls underneath (the projects type chips). */
export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <header className="pg-head nm-root">
      <h1 className="pg-title">{title}</h1>
      {subtitle && <p className="pg-sub">{subtitle}</p>}
      {children}
    </header>
  );
}
