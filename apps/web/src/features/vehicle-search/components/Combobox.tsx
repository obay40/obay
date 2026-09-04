"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { foldDiacritics, naturalCompare, normalizedSearchKey } from "@autoklick24/types";

export interface ComboboxItem {
  slug: string;
  name: string;
  isPopular?: boolean;
  /** Nicht mehr produziert, aber weiterhin gebraucht gehandelt (siehe historicLabel-Prop). */
  isHistoric?: boolean;
  /** Alternative Schreibweisen ("VW", "1er", …) – werden mitdurchsucht, aber nie angezeigt. */
  aliases?: string[];
}

interface ComboboxProps {
  id: string;
  label: string;
  value: string | undefined;
  onChange: (slug: string | undefined) => void;
  items: ComboboxItem[];
  placeholder: string;
  searchPlaceholder: string;
  popularLabel: string;
  allLabel: string;
  emptyStateText: string;
  disabled?: boolean;
  disabledHint?: string;
  loading?: boolean;
  className?: string;
  /**
   * Bei vielen Einträgen (Herstellerliste) werden die Nicht-Beliebten
   * zusätzlich alphabetisch in Buchstaben-Abschnitte gruppiert (A, B, C, …),
   * wie in der Aufgabenstellung vorgegeben. Bei kurzen Listen (z. B.
   * Modelle) bleibt es bei der einfachen Liste.
   */
  groupAlphabetically?: boolean;
  /**
   * Wenn gesetzt, werden Items mit isHistoric=true in einen dritten,
   * separaten Abschnitt (statt in "allLabel") einsortiert, damit
   * historische Modelle die aktuelle Auswahl nicht überfrachten (siehe
   * Aufgabenstellung: "Historische Modelle visuell nicht dominieren
   * lassen"). Ohne diese Prop bleibt es bei der bisherigen 2-Stufen-Logik.
   */
  historicLabel?: string;
}

function firstLetter(name: string): string {
  const folded = foldDiacritics(name).toUpperCase();
  const match = folded.match(/[A-Z0-9]/);
  return match ? match[0]! : "#";
}

/**
 * Durchsuchbares Auswahlfeld mit "Beliebt"/"Alle"-Gruppierung, optionaler
 * A-Z-Gruppierung, Natural-Sort (1er/2er/10er statt 1/10/2) und voller
 * Tastaturbedienung (Pfeiltasten, Enter, Escape, Klick außerhalb schließt).
 * Wird von MakeCombobox und ModelCombobox mit unterschiedlichen Daten
 * wiederverwendet, damit die Interaktionslogik nur einmal existiert.
 */
export function Combobox({
  id,
  label,
  value,
  onChange,
  items,
  placeholder,
  searchPlaceholder,
  popularLabel,
  allLabel,
  emptyStateText,
  disabled,
  disabledHint,
  loading,
  className = "",
  groupAlphabetically = false,
  historicLabel,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selected = items.find((item) => item.slug === value);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => naturalCompare(a.name, b.name)),
    [items],
  );
  const popularItems = useMemo(() => sortedItems.filter((item) => item.isPopular), [sortedItems]);
  const currentItems = useMemo(
    () => sortedItems.filter((item) => !item.isPopular && !(historicLabel && item.isHistoric)),
    [sortedItems, historicLabel],
  );
  const historicItems = useMemo(
    () => (historicLabel ? sortedItems.filter((item) => !item.isPopular && item.isHistoric) : []),
    [sortedItems, historicLabel],
  );

  const filteredItems = useMemo(() => {
    if (!query.trim()) return sortedItems;
    // Case-insensitive und tolerant gegenüber Umlauten/Sonderzeichen: "skoda"
    // muss "Škoda" treffen, "e klasse" muss "E-Klasse" treffen. Aliase
    // ("VW", "1er", "Q4 e-tron", …) werden mitdurchsucht, aber nie als
    // eigener Treffer angezeigt – nur der echte Katalogname erscheint.
    const q = normalizedSearchKey(query);
    return sortedItems.filter((item) => {
      if (normalizedSearchKey(item.name).includes(q)) return true;
      return (item.aliases ?? []).some((alias) => normalizedSearchKey(alias).includes(q));
    });
  }, [sortedItems, query]);

  const visibleList = query.trim() ? filteredItems : sortedItems;

  const alphabeticalGroups = useMemo(() => {
    if (!groupAlphabetically || query.trim()) return null;
    const groups = new Map<string, ComboboxItem[]>();
    for (const item of sortedItems) {
      const letter = firstLetter(item.name);
      const group = groups.get(letter) ?? [];
      group.push(item);
      groups.set(letter, group);
    }
    return [...groups.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  }, [groupAlphabetically, query, sortedItems]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closePanel();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) {
      searchInputRef.current?.focus();
      setActiveSlug(visibleList[0]?.slug ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function openPanel() {
    if (disabled) return;
    setQuery("");
    setOpen(true);
  }

  function closePanel() {
    setOpen(false);
    setQuery("");
  }

  function selectItem(slug: string) {
    onChange(slug);
    closePanel();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      closePanel();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const currentIndex = visibleList.findIndex((item) => item.slug === activeSlug);
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = Math.min(Math.max(currentIndex + delta, 0), visibleList.length - 1);
      setActiveSlug(visibleList[nextIndex]?.slug ?? null);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (activeSlug) selectItem(activeSlug);
      return;
    }
  }

  function renderItem(item: ComboboxItem) {
    const isActive = item.slug === activeSlug;
    const isSelected = item.slug === value;
    return (
      <li key={item.slug} role="option" aria-selected={isSelected}>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => selectItem(item.slug)}
          onMouseEnter={() => setActiveSlug(item.slug)}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
            isActive ? "bg-brand-50 text-brand-700" : "text-navy-800"
          } ${isSelected ? "font-semibold" : ""}`}
        >
          {item.name}
          {isSelected && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12l5 5L20 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </li>
    );
  }

  function renderSectionLabel(text: string) {
    return (
      <li className="text-navy-400 px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide">
        {text}
      </li>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => (open ? closePanel() : openPanel())}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
            event.preventDefault();
            openPanel();
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`group relative w-full rounded-xl border bg-white text-left transition-colors ${
          open ? "border-brand-500 ring-brand-100 ring-2" : "border-navy-200 hover:border-navy-300"
        } ${disabled ? "bg-navy-50/60 cursor-not-allowed opacity-70" : ""}`}
      >
        <span className="text-navy-500 pointer-events-none block px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </span>
        <span className="text-navy-900 block truncate px-3 pb-2.5 pr-8 pt-0.5 text-sm font-medium">
          {selected
            ? selected.name
            : disabled && disabledHint
              ? disabledHint
              : loading
                ? "Wird geladen…"
                : placeholder}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={`text-navy-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="border-navy-200 shadow-card-hover absolute left-0 right-0 top-[calc(100%+6px)] z-20 rounded-xl border bg-white p-2">
          <div className="relative">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="text-navy-400 pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="border-navy-200 text-navy-900 focus:border-brand-500 w-full rounded-lg border py-2 pl-8 pr-3 text-sm outline-none"
              role="combobox"
              aria-expanded={open}
              aria-controls={`${id}-listbox`}
              aria-autocomplete="list"
            />
          </div>

          <ul id={`${id}-listbox`} role="listbox" className="mt-2 max-h-72 overflow-y-auto">
            {visibleList.length === 0 && (
              <li className="text-navy-500 px-3 py-6 text-center text-sm">{emptyStateText}</li>
            )}

            {!query.trim() && popularItems.length > 0 && (
              <>
                {renderSectionLabel(popularLabel)}
                {popularItems.map(renderItem)}
                <li className="border-navy-100 my-2 border-t" role="presentation" />
                {!alphabeticalGroups && renderSectionLabel(allLabel)}
              </>
            )}

            {historicLabel && !query.trim() ? (
              <>
                {currentItems.map(renderItem)}
                {historicItems.length > 0 && (
                  <>
                    <li className="border-navy-100 my-2 border-t" role="presentation" />
                    {renderSectionLabel(historicLabel)}
                    {historicItems.map(renderItem)}
                  </>
                )}
              </>
            ) : alphabeticalGroups ? (
              alphabeticalGroups.map(([letter, groupItems]) => (
                <Fragment key={letter}>
                  {renderSectionLabel(letter)}
                  {groupItems.map(renderItem)}
                </Fragment>
              ))
            ) : (
              visibleList.map(renderItem)
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
