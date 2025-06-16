/**
 * src/components/ui/SearchAndFilterBar.tsx
 * @description Component for searching, filtering, and sorting project listings.
 */
import React, { useState, useEffect } from 'react';
import { Input } from './input'; // Assuming Input component exists
import { Button } from './button'; // Assuming Button component exists
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'; // Reverted to named imports
import { Popover, PopoverContent, PopoverTrigger } from './popover'; // Assuming Popover components exist
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'; // Assuming Select components exist
import { Checkbox } from './checkbox'; // Assuming Checkbox component exists
import { Label } from './label'; // Assuming Label component exists
import type { FilterOptions, SortOption, SortableField, SortDirection } from '../../types/projectDiscovery';

interface SearchAndFilterBarProps {
  initialSearchTerm?: string;
  initialFilters?: FilterOptions;
  initialSort?: SortOption;
  categories?: string[]; // To populate category filter, e.g., ["Tech", "Art", "Social"]
  onDiscoveryChange: (discoveryState: { searchTerm: string; filters: FilterOptions; sort: SortOption }) => void;
}

const DEFAULT_SORT: SortOption = { field: 'created_at', direction: 'desc' }; // Newest by default

/**
 * @description A bar with search input, filter options, and sort options for project listings.
 * @param {SearchAndFilterBarProps} props - Props for the component.
 * @returns {JSX.Element} The SearchAndFilterBar component.
 */
export const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  initialSearchTerm = '',
  initialFilters = { type: 'all' },
  initialSort = DEFAULT_SORT,
  categories = [],
  onDiscoveryChange,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>(initialFilters);
  const [currentSort, setCurrentSort] = useState<SortOption>(initialSort);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState<boolean>(false); // State for popover

  // Sync internal state with prop changes
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  useEffect(() => {
    setCurrentFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    setCurrentSort(initialSort);
  }, [initialSort]);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== initialSearchTerm) {
          handleApplyChanges();
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, initialSearchTerm]);

  const handleApplyChanges = (updatedFilters?: FilterOptions, updatedSort?: SortOption) => {
    const finalFilters = updatedFilters || currentFilters;
    const finalSort = updatedSort || currentSort;
    onDiscoveryChange({
      searchTerm,
      filters: finalFilters,
      sort: finalSort,
    });
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchApply = () => {
    handleApplyChanges();
  };

  const handleSortChange = (field: SortableField, direction?: SortDirection) => {
    let newDirection: SortDirection = 'desc';
    if (field === 'name') {
      newDirection = direction || (currentSort.field === 'name' && currentSort.direction === 'asc' ? 'desc' : 'asc');
    } else if (field === 'created_at') {
      newDirection = direction || (currentSort.field === 'created_at' && currentSort.direction === 'desc' ? 'asc' : 'desc');
    } else if (field === 'support_count') {
      newDirection = 'desc';
    }

    const newSort: SortOption = { field, direction: newDirection };
    setCurrentSort(newSort);
    handleApplyChanges(undefined, newSort);
  };

  const handleCategoryChange = (value: string) => {
    const newFilters = { ...currentFilters, category: value === 'all' ? undefined : value };
    setCurrentFilters(newFilters);
    handleApplyChanges(newFilters);
  };

  const handleProjectTypeChange = (type: 'all' | 'live' | 'idea') => {
    const newFilters = { ...currentFilters, type };
    setCurrentFilters(newFilters);
    handleApplyChanges(newFilters);
  };

  const handleHackathonToggle = (checked: boolean) => {
    const newFilters = { ...currentFilters, isHackathonEntry: checked ? true : undefined };
    setCurrentFilters(newFilters);
    handleApplyChanges(newFilters);
  };

  const handleFilterClear = () => {
    const clearedFilters: FilterOptions = { type: 'all', category: undefined, isHackathonEntry: undefined };
    setCurrentFilters(clearedFilters);
    handleApplyChanges(clearedFilters);
    setIsFilterPopoverOpen(false);
  };

  const getSortLabel = (sort: SortOption): string => {
    if (sort.field === 'created_at' && sort.direction === 'desc') return 'Newest';
    if (sort.field === 'created_at' && sort.direction === 'asc') return 'Oldest';
    if (sort.field === 'support_count') return 'Most Supported';
    if (sort.field === 'name' && sort.direction === 'asc') return 'Name (A-Z)';
    if (sort.field === 'name' && sort.direction === 'desc') return 'Name (Z-A)';
    return 'Sort by';
  };

  return (
    <div className="bg-startsnap-ebony-clay p-6 rounded-xl border-4 border-startsnap-french-rose shadow-[6px_6px_0px_#ef4444] transform rotate-[0.5deg] hover:rotate-0 transition-all duration-300">
      {/* Search Section */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Main Search Input - Takes Most Space */}
        <div className="relative flex-1 w-full">
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-startsnap-beige text-xl">search</span>
          <Input
            type="text"
            placeholder="Search projects, tags, tools..."
            value={searchTerm}
            onChange={handleSearchInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchApply()}
            className="w-full bg-startsnap-beige text-startsnap-ebony-clay placeholder:text-startsnap-ebony-clay/60 border-2 border-startsnap-ebony-clay rounded-lg pl-12 pr-4 py-3 text-base font-medium shadow-[3px_3px_0px_#1f2937] focus:shadow-[5px_5px_0px_#1f2937] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
          />
        </div>

        {/* Compact Filter & Sort Controls */}
        <div className="flex gap-3 shrink-0">
          {/* Filter Popover */}
          <Popover open={isFilterPopoverOpen} onOpenChange={setIsFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button className="bg-startsnap-french-rose text-white border-2 border-startsnap-ebony-clay rounded-lg px-4 py-3 font-bold shadow-[3px_3px_0px_#1f2937] hover:shadow-[5px_5px_0px_#1f2937] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 flex items-center gap-2">
                <span className="material-icons text-lg">tune</span>
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-6 bg-startsnap-white border-3 border-startsnap-ebony-clay rounded-xl shadow-[6px_6px_0px_#1f2937] w-80" align="start">
              <div className="space-y-6">
                <h3 className="font-bold text-xl text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">🎯 Filter Projects</h3>

                {/* Category Filter */}
                <div>
                  <Label className="font-bold text-startsnap-ebony-clay block mb-3 font-['Space_Grotesk',Helvetica]">Category</Label>
                  <Select value={currentFilters.category || ''} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-full bg-startsnap-beige border-2 border-startsnap-ebony-clay rounded-lg p-3 shadow-[2px_2px_0px_#1f2937] font-medium">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-startsnap-white border-2 border-startsnap-ebony-clay rounded-lg shadow-[4px_4px_0px_#1f2937]">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Project Type Filter */}
                <div>
                  <Label className="font-bold text-startsnap-ebony-clay block mb-3 font-['Space_Grotesk',Helvetica]">Project Type</Label>
                  <div className="flex gap-2">
                    {(['all', 'live', 'idea'] as const).map(type => (
                      <Button
                        key={type}
                        onClick={() => handleProjectTypeChange(type)}
                        className={`flex-1 capitalize font-bold border-2 border-startsnap-ebony-clay rounded-lg py-2 px-3 shadow-[2px_2px_0px_#1f2937] transition-all duration-200 ${
                          currentFilters.type === type
                            ? 'bg-startsnap-french-rose text-white'
                            : 'bg-startsnap-beige text-startsnap-ebony-clay hover:bg-startsnap-french-rose hover:text-white'
                        }`}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Hackathon Filter */}
                <div className="flex items-center gap-3 p-3 bg-startsnap-beige rounded-lg border-2 border-startsnap-ebony-clay">
                  <Checkbox
                    id="filter-hackathon"
                    checked={!!currentFilters.isHackathonEntry}
                    onCheckedChange={handleHackathonToggle}
                    className="border-2 border-startsnap-ebony-clay shadow-[1px_1px_0px_#1f2937] data-[state=checked]:bg-startsnap-french-rose"
                  />
                  <Label htmlFor="filter-hackathon" className="font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica] cursor-pointer">
                    🏆 Hackathon Projects Only
                  </Label>
                </div>

                {/* Clear Button */}
                <Button
                  onClick={handleFilterClear}
                  className="w-full bg-startsnap-ebony-clay text-startsnap-beige border-2 border-startsnap-french-rose rounded-lg py-3 font-bold shadow-[3px_3px_0px_#ef4444] hover:shadow-[5px_5px_0px_#ef4444] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                >
                  Clear All Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-startsnap-beige text-startsnap-ebony-clay border-2 border-startsnap-ebony-clay rounded-lg px-4 py-3 font-bold shadow-[3px_3px_0px_#1f2937] hover:shadow-[5px_5px_0px_#1f2937] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 flex items-center gap-2">
                <span className="material-icons text-lg">sort</span>
                <span className="hidden sm:inline">{getSortLabel(currentSort)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-4 bg-startsnap-white border-3 border-startsnap-ebony-clay rounded-xl shadow-[6px_6px_0px_#1f2937] min-w-[200px]" align="end">
              <div className="space-y-2">
                <div className="font-bold text-startsnap-ebony-clay mb-3 font-['Space_Grotesk',Helvetica]">📊 Sort By</div>
                {[
                  { field: 'created_at', direction: 'desc', label: '🆕 Newest First' },
                  { field: 'created_at', direction: 'asc', label: '📅 Oldest First' },
                  { field: 'support_count', direction: 'desc', label: '❤️ Most Supported' },
                  { field: 'name', direction: 'asc', label: '🔤 Name (A-Z)' },
                  { field: 'name', direction: 'desc', label: '🔤 Name (Z-A)' }
                ].map(({ field, direction, label }) => (
                  <DropdownMenuItem
                    key={`${field}-${direction}`}
                    onClick={() => handleSortChange(field as SortableField, direction as SortDirection)}
                    className="cursor-pointer hover:bg-startsnap-beige rounded-lg p-2 font-medium transition-colors duration-200"
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};