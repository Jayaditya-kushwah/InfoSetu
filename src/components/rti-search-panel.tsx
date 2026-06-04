"use client";

import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SearchResult {
  id: string;
  subject: string;
  createdAt: string;
  department: string;
  category: string;
  excerpt: string;
  userInput: string;
  draft: string;
}

interface RTISearchPanelProps {
  onResultSelect?: (result: SearchResult) => void;
}

/**
 * Phase 1C: Search Past RTIs
 * Searchable component for browsing past RTI applications
 */
export function RTISearchPanel({ onResultSelect }: RTISearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const limit = 10;

  const handleSearch = useCallback(
    async (newOffset = 0) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setTotal(0);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      try {
        const params = new URLSearchParams({
          q: searchQuery,
          limit: limit.toString(),
          offset: newOffset.toString(),
        });

        if (department.trim()) params.append("department", department);
        if (category.trim()) params.append("category", category);

        const response = await fetch(`/api/rti/search?${params}`);
        const data = await response.json();

        if (response.ok) {
          setResults(data.results || []);
          setTotal(data.total || 0);
          setOffset(newOffset);
          setHasSearched(true);
        } else {
          console.error("Search failed:", data.error);
          setResults([]);
          setTotal(0);
          setHasSearched(true);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
        setTotal(0);
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    },
    [searchQuery, department, category, limit]
  );

  const handleSearchClick = () => {
    setOffset(0);
    handleSearch(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  const handlePrevPage = () => {
    const newOffset = Math.max(0, offset - limit);
    handleSearch(newOffset);
  };

  const handleNextPage = () => {
    const newOffset = offset + limit;
    if (newOffset < total) {
      handleSearch(newOffset);
    }
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Search Inputs */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Search Keyword</label>
          <div className="mt-1 flex gap-2">
            <Input
              type="text"
              placeholder="Search by keyword, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button
              onClick={handleSearchClick}
              disabled={isSearching || !searchQuery.trim()}
              size="sm"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Optional Filters */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Department (optional)
            </label>
            <Input
              type="text"
              placeholder="e.g., PWD, Municipal Corp"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Category (optional)
            </label>
            <Input
              type="text"
              placeholder="e.g., infrastructure"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-3">
          <div className="text-sm text-slate-600">
            {total === 0
              ? "No results found"
              : `Found ${total} result${total !== 1 ? "s" : ""}`}
          </div>

          {results.length > 0 && (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((result) => (
                  <Card
                    key={result.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onResultSelect?.(result)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">
                            {result.subject}
                          </p>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                            {result.excerpt}
                          </p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {result.category}
                            </span>
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {new Date(result.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    onClick={handlePrevPage}
                    disabled={offset === 0 || isSearching}
                    size="sm"
                    variant="outline"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="text-xs text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={handleNextPage}
                    disabled={offset + limit >= total || isSearching}
                    size="sm"
                    variant="outline"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
