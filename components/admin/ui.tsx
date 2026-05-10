import { ReactNode } from "react";

/**
 * Standard page header used at the top of every admin page.
 * Title left, optional description below, action buttons right.
 */
export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * Standard content card. Use this for every panel on every admin page.
 */
export function AdminCard({
  children,
  title,
  description,
  className = "",
  bodyClassName = "",
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {(title || description) && (
        <header className="border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4">
          {title && <h2 className="text-base font-semibold text-gray-900">{title}</h2>}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </header>
      )}
      <div className={`p-4 sm:p-5 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

/** Empty-state placeholder — dashed border + clear CTA. */
export function AdminEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
