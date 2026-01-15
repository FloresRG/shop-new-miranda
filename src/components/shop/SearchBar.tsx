import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

export default function SearchBar({ onSearch }: { onSearch?: (query: string) => void }) {
    const [query, setQuery] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setQuery(params.get("search") || "");
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);

        // Debounce simple
        const timeoutId = setTimeout(() => {
            if (onSearch) {
                onSearch(newQuery);
            } else {
                const url = new URL(window.location.href);
                if (newQuery) {
                    url.searchParams.set("search", newQuery);
                    url.searchParams.set("page", "1"); // Reset page
                } else {
                    url.searchParams.delete("search");
                }
                window.location.href = url.toString();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    };

    return (
        <div className="relative w-full max-w-md">
            <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-dark dark:text-white dark:placeholder-gray-400 transition-all"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
    );
}
