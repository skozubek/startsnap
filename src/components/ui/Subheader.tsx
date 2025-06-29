/**
 * src/components/ui/Subheader.tsx
 * @description Component for displaying breadcrumb navigation under the main header.
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Breadcrumb {
  name: string;
  path: string;
}

// Predefined display names for specific path segments
const pathDisplayNames: Record<string, string> = {
  'projects': 'Projects',
  'profile': 'Profile',
  'create': 'Create StartSnap',
  // 'edit' will be handled contextually
};

// Helper to format a path segment into a displayable name (e.g., 'my-project' -> 'My Project')
const formatPathSegment = (segment: string): string => {
  if (pathDisplayNames[segment.toLowerCase()]) {
    return pathDisplayNames[segment.toLowerCase()];
  }
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * @description Generates an array of breadcrumb objects from the current pathname.
 * @param {string} pathname - The current URL pathname.
 * @returns {Breadcrumb[]} An array of breadcrumb objects.
 */
const generateBreadcrumbs = (pathname: string): Breadcrumb[] => {
  const pathSegments = pathname.split('/').filter(Boolean); // filter(Boolean) removes empty strings
  const breadcrumbs: Breadcrumb[] = [{ name: 'Home', path: '/' }];

  let currentPath = '';
  pathSegments.forEach((segment, index, arr) => {
    currentPath += `/${segment}`;
    let name: string;

    if (segment.toLowerCase() === 'edit' && index > 0 && arr[index - 2]?.toLowerCase() === 'projects') {
      // Handles '/projects/:slug/edit' -> 'Edit'
      name = 'Edit';
    } else if (index > 0 && arr[index - 1]?.toLowerCase() === 'projects' && segment.toLowerCase() !== 'edit') {
      // Handles '/projects/:slug' -> formatted slug
      name = formatPathSegment(segment);
    } else {
      name = formatPathSegment(segment);
    }

    breadcrumbs.push({ name, path: currentPath });
  });

  return breadcrumbs;
};

/**
 * @description Renders a subheader with breadcrumb navigation.
 * It uses the current route to generate breadcrumbs.
 * Does not render on the homepage ('/').
 * @returns {JSX.Element | null} The Subheader component or null if on the homepage.
 */
export const Subheader = (): JSX.Element | null => {
  const location = useLocation();

  // Do not render the subheader on the homepage
  if (location.pathname === '/') {
    return null;
  }

  const breadcrumbs = generateBreadcrumbs(location.pathname);

  if (breadcrumbs.length <= 1 && location.pathname !== '/') return null;

  return (
    <nav
      aria-label="breadcrumb"
      className="w-full bg-startsnap-beige py-3 border-b-2 border-gray-800 shadow-[0px_3px_0px_#1f2937]"
    >
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
        <ol className="flex items-center space-x-1 text-base text-startsnap-ebony-clay font-body">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.path} className="flex items-center">
              {index === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-startsnap-ebony-clay px-2 py-1">{crumb.name}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className="px-2 py-1 hover:text-startsnap-french-rose transition-colors duration-150"
                >
                  {crumb.name}
                </Link>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className="mx-1 text-startsnap-gray-chateau select-none">/</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};