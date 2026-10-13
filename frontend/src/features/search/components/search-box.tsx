import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useId, useState, type KeyboardEvent } from "react";
import { useWorkspace } from "@/features/workspace/store";
import { useSuggestions } from "../queries";
import type { LeadSuggestion } from "../types";
import { SuggestionResults } from "./suggestion-results";

export function SearchBox() {
  const value = useWorkspace((state) => state.search);
  const setSearch = useWorkspace((state) => state.setSearch);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(-1);
  const id = useId();
  const open = focused && !dismissed && value.trim().length >= 2;
  const query = useSuggestions(value, open);
  const items = query.waiting || query.isError ? [] : (query.data?.items ?? []);
  const activeIndex = active < items.length ? active : -1;
  function select(lead: LeadSuggestion) {
    useWorkspace.getState().selectLead(lead.id);
    setDismissed(true);
  }
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setDismissed(true);
      setActive(-1);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setDismissed(false);
      if (items.length) {
        const step = event.key === "ArrowDown" ? 1 : -1;
        setActive(
          activeIndex < 0
            ? step === 1
              ? 0
              : items.length - 1
            : (activeIndex + step + items.length) % items.length,
        );
      }
    }
    if (event.key === "Enter" && open && activeIndex >= 0) {
      event.preventDefault();
      select(items[activeIndex]);
    }
  }
  return (
    <div
      className="search-combobox"
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div className="search-field">
        <MagnifyingGlass size={19} />
        <input
          aria-label="Search leads and discussions"
          placeholder="Search names, companies, or conversations…"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          aria-controls={open && items.length ? id : undefined}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${id}-${activeIndex}` : undefined
          }
          value={value}
          maxLength={200}
          type="search"
          onKeyDown={onKeyDown}
          onChange={(event) => {
            setSearch(event.target.value);
            setActive(-1);
            setDismissed(false);
          }}
        />
        {value && (
          <button
            className="icon-button"
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setSearch("");
              setActive(-1);
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>
      {open && (
        <SuggestionResults
          id={id}
          items={items}
          active={activeIndex}
          loading={query.waiting}
          failed={query.isError}
          onSelect={select}
          onRetry={() => void query.refetch()}
        />
      )}
    </div>
  );
}
