import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Metric({ icon: Icon, label, value, hint }) {
  return (
    <div className="panel p-5 flex flex-col gap-4">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/45">
          {label}
        </p>
        <p className="mt-1.5 text-3xl font-black font-manrope tracking-tight tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {hint ? <p className="mt-1 text-xs text-foreground/50">{hint}</p> : null}
      </div>
    </div>
  );
}

export function PanelHead({ eyebrow, title, action, legend }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          {eyebrow}
        </p>
        <h2 className="mt-1.5 text-lg font-bold font-manrope tracking-tight">
          {title}
        </h2>
      </div>
      {legend ? (
        <div className="flex items-center gap-4 text-xs">
          {legend.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  l.tone === "secondary" ? "bg-secondary" : "bg-primary"
                }`}
              />
              <span className="text-foreground/60 font-medium">{l.label}</span>
            </span>
          ))}
        </div>
      ) : null}
      {action ? (
        <Link
          href={action.href}
          className="text-xs font-semibold text-primary hover:text-primary-container inline-flex items-center gap-1"
        >
          {action.label}
          <ArrowRight size={13} />
        </Link>
      ) : null}
    </div>
  );
}
