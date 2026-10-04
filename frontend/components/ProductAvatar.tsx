const TONES = [
  'bg-emerald-100 text-emerald-800',
  'bg-sky-100 text-sky-800',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-800',
  'bg-violet-100 text-violet-800',
];

export default function ProductAvatar({ id, name }: { id: number; name: string }) {
  return (
    <span
      aria-hidden
      className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-base font-semibold ${TONES[id % TONES.length]}`}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
