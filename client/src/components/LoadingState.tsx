export function LoadingState({ label = 'Loading FlatBuddy...' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-line bg-white/80 p-8 text-sm text-ink/70 shadow-soft">
      {label}
    </div>
  );
}

