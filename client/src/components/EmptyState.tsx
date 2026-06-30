import type { ReactNode } from 'react';

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-start gap-4 p-8">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 max-w-xl text-sm text-ink/70">{description}</p>
      </div>
      {action}
    </div>
  );
}

