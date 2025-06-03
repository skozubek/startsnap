/**
 * src/types/projectDiscovery.ts
 * @description Type definitions for project filtering and sorting functionalities.
 */

/**
 * @description Options for filtering projects.
 * Each property is optional.
 */
export interface FilterOptions {
  category?: string;
  type?: 'live' | 'idea' | 'all'; // 'all' represents no type filter
  isHackathonEntry?: boolean;
}

/**
 * @description Available fields to sort projects by.
 */
export type SortableField = 'created_at' | 'support_count' | 'name';

/**
 * @description Sort direction.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * @description Options for sorting projects.
 */
export interface SortOption {
  field: SortableField;
  direction: SortDirection;
}

/**
 * @description Combines all discovery parameters.
 */
export interface ProjectDiscoveryState {
  searchTerm: string;
  filters: FilterOptions;
  sort: SortOption;
}