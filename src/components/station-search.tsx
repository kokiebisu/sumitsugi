"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, Train } from "lucide-react";
import { searchStations, type Station } from "@/lib/station-data";

interface StationSearchProps {
  value: string;
  onChange: (stationName: string) => void;
  placeholder?: string;
}

export function StationSearch({
  value,
  onChange,
  placeholder = "駅名を検索",
}: StationSearchProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Station[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // value が外部から変更された場合に同期
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      setQuery(newQuery);
      setSelectedIndex(-1);

      if (newQuery.length > 0) {
        const results = searchStations(newQuery);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } else {
        setSuggestions([]);
        setIsOpen(false);
        onChange("");
      }
    },
    [onChange]
  );

  const handleSelect = useCallback(
    (station: Station) => {
      const stationWithSuffix = `${station.name}駅`;
      setQuery(stationWithSuffix);
      onChange(stationWithSuffix);
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSelect(suggestions[selectedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, suggestions, selectedIndex, handleSelect]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onChange("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }, [onChange]);

  const handleFocus = useCallback(() => {
    if (query.length > 0) {
      const results = searchStations(query);
      setSuggestions(results);
      setIsOpen(results.length > 0);
    }
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-foreground"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
          <ul className="max-h-60 overflow-y-auto">
            {suggestions.map((station, index) => (
              <li key={`${station.name}-${station.line}-${index}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(station)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-muted transition-colors ${
                    index === selectedIndex ? "bg-muted" : ""
                  }`}
                >
                  <Train className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">
                      {station.name}駅
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {station.line}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
