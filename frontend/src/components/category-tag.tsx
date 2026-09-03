export function CategoryTag({ color, name }: { color: string | null; name: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={
        color
          ? { backgroundColor: `${color}22`, color }
          : { backgroundColor: 'var(--color-financy-canvas)', color: 'var(--color-financy-muted)' }
      }
    >
      {name}
    </span>
  )
}
