interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** 2a's narrower certifications header (928px, 56ch standfirst). Default 1180px. */
  narrow?: boolean;
  children?: React.ReactNode;
}

/** 2a's page header (Projects, Articles, Guestbook, Certifications, Tours): a large title, a
 *  17px standfirst, and optional controls underneath (the projects type chips). */
export function PageHeader({ title, subtitle, narrow, children }: PageHeaderProps) {
  return (
    <header className="pg-head" data-w={narrow ? "928" : undefined}>
      <h1 className="pg-title">{title}</h1>
      {subtitle && <p className="pg-sub">{subtitle}</p>}
      {children}
    </header>
  );
}
