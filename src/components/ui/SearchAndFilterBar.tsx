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

  const barStyle = "flex flex-col md:flex-row items-center gap-4 p-6 bg-startsnap-white border-2 border-gray-800 shadow-[4px_4px_0px_#1f2937] rounded-lg mb-8";
  const newPopoverContentStyle = "p-5 bg-startsnap-white border-2 border-gray-800 rounded-lg shadow-[2px_2px_0px_#1f2937]";
  const newSelectTriggerStyle = "flex-grow border border-gray-800 rounded-md p-2 shadow-[1px_1px_0px_#1f2937] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full";
  const newSelectContentPanelStyle = "bg-startsnap-white border-2 border-gray-800 rounded-lg shadow-[2px_2px_0px_#1f2937]";

  return (
    <div className={barStyle}>
      {/* Search Input */}
      <div className="relative flex-grow w-full md:w-auto">
        <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
        <Input
          type="text"
          placeholder="Search by Name, Description, Tags, Tools..."
          value={searchTerm}
          onChange={handleSearchInputChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchApply()} // Apply search on Enter key
          // Use a generic input style, or define one if specific tweaks are needed
          className={"flex-grow border border-gray-800 rounded-md p-2 shadow-[2px_2px_0px_#1f2937] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-10"}
        />
      </div>

      {/* Filter Controls */}
      <Popover open={isFilterPopoverOpen} onOpenChange={setIsFilterPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="filterTrigger" size="sm"> {/* Adjusted size to sm as original py-2 px-4 is smaller than default */}
            <span className="material-icons text-base">filter_list</span>
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className={newPopoverContentStyle} align="start">
          <div className="grid gap-5">
            <h3 className="font-bold text-lg text-startsnap-ebony-clay mb-1">Filter By</h3>

            {/* Category Filter */}
            <div>
              <Label htmlFor="filter-category" className="font-semibold text-startsnap-ebony-clay block mb-1.5">Category</Label>
              <Select
                value={currentFilters.category || ''}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="filter-category" className={newSelectTriggerStyle}>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className={newSelectContentPanelStyle}> {/* Panel style */}
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Type Filter */}
            <div>
              <Label className="font-semibold text-startsnap-ebony-clay block mb-1.5">Project Type</Label>
              {/* Using buttons as radio group for neo-brutalist style */}
              <div className="flex gap-2">
                {(['all', 'live', 'idea'] as const).map(type => (
                  <Button
                    key={type}
                    variant={currentFilters.type === type ? 'filterOptionSelected' : 'filterOption'}
                    size="sm" // Keep size consistent for these options
                    onClick={() => handleProjectTypeChange(type)}
                    className={"capitalize flex-1"} // flex-1 for equal width
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Hackathon Entry Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-hackathon"
                checked={!!currentFilters.isHackathonEntry}
                onCheckedChange={handleHackathonToggle}
                className="border-gray-800 shadow-[1px_1px_0px_#1f2937] data-[state=checked]:bg-startsnap-french-rose data-[state=checked]:text-startsnap-white"
              />
              <Label htmlFor="filter-hackathon" className="font-semibold text-startsnap-ebony-clay">Hackathon Entries Only</Label>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end mt-3">
              <Button variant="filterOption" size="sm" onClick={handleFilterClear}>Clear All Filters</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Sort Controls */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="filterTrigger" size="sm"> {/* Adjusted size to sm */}
            <span className="material-icons text-base">sort</span>
            {getSortLabel(currentSort)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={newPopoverContentStyle} align="end"> {/* Re-use style for consistency */}
          {/* Replaced DropdownMenuLabel with a styled div */}
          <div className="px-2 py-1.5 text-sm font-semibold text-startsnap-ebony-clay">Sort By</div>
          {/* Replaced DropdownMenuSeparator with a styled div */}
          <div className="h-px my-1 bg-gray-300" />
          <DropdownMenuItem onClick={() => handleSortChange('created_at', 'desc')} className="hover:bg-gray-100 cursor-pointer">Newest</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange('created_at', 'asc')} className="hover:bg-gray-100 cursor-pointer">Oldest</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange('support_count', 'desc')} className="hover:bg-gray-100 cursor-pointer">Most Supported</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange('name', 'asc')} className="hover:bg-gray-100 cursor-pointer">Name (A-Z)</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange('name', 'desc')} className="hover:bg-gray-100 cursor-pointer">Name (Z-A)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};