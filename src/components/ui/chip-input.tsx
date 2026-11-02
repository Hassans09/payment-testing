"use client";

import { useState, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";

import { addChips } from "@/lib/image-utils";

/**
 * Free-entry chips: type a value and press Enter, comma or "Add".
 * Pasting "S, M, L" adds three chips. Optional suggestions add with one tap.
 */
export function ChipInput({
  id,
  label,
  values,
  onChange,
  placeholder,
  suggestions = [],
}: {
  id: string;
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");

  const commit = (text = draft) => {
    if (text.trim()) onChange(addChips(values, text));
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit();
    } else if (event.key === "Backspace" && !draft && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const unused = suggestions.filter((item) => !values.some((value) => value.toLowerCase() === item.toLowerCase()));

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-2 focus-within:border-[color:var(--brand-primary)]">
        {values.map((value) => (
          <span key={value} className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-deep)] py-1 pl-3 pr-1 text-xs font-bold text-white">
            {value}
            <button
              type="button"
              aria-label={`Remove ${value}`}
              onClick={() => onChange(values.filter((item) => item !== value))}
              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          aria-label={label}
          value={draft}
          onChange={(event) => {
            const text = event.target.value;
            // Mobile keyboards don't always fire keydown for ",": handle it here too.
            if (text.includes(",")) commit(text);
            else setDraft(text);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => commit()}
          enterKeyHint="done"
          placeholder={values.length === 0 ? placeholder : "Add another"}
          className="min-w-[8rem] flex-1 bg-transparent px-2 py-1.5 text-sm outline-none"
        />
        <button
          type="button"
          onClick={() => commit()}
          className="inline-flex items-center gap-1 rounded-full border border-[color:var(--brand-border)] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[color:var(--brand-deep)]"
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
      {unused.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {unused.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onChange(addChips(values, item))}
              className="rounded-full border border-dashed border-[color:var(--brand-border)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[color:var(--brand-charcoal)]/75 hover:border-[color:var(--brand-primary)]"
            >
              + {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
