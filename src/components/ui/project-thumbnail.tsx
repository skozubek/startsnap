/**
 * src/components/ui/project-thumbnail.tsx
 * @description Project thumbnail components with various visual styles
 */

import React from 'react';
import { getCategoryHueMap } from '../../config/categories';

// Properties for the thumbnail components
interface ThumbnailProps {
  projectId: string;
  projectType: string;
  category: string;
}

// Function to generate a consistent color based on project properties
const generateColor = (id: string, category: string, opacity: number = 0.1) => {
  // Simple hash function to get a number from the id
  const hash = id.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Get category hues from central config
  const categoryHues = getCategoryHueMap();

  // Get base hue from category
  const baseHue = categoryHues[category] || categoryHues.other;

  // Add some variation based on the hash (±15 degrees)
  const hueVariation = (hash % 30) - 15;
  const finalHue = (baseHue + hueVariation + 360) % 360;

  // Category influences saturation and lightness for more variety
  const categoryHash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const saturation = 45 + (categoryHash % 30); // 45-75%
  const lightness = 85 + (hash % 10); // 85-95% for subtle backgrounds

  return `hsla(${finalHue}, ${saturation}%, ${lightness}%, ${opacity})`;
};

/**
 * Grid-based thumbnail with geometric patterns.
 */
export const GridThumbnail: React.FC<ThumbnailProps> = ({ projectId, projectType, category }) => {
  // Generate unique but consistent colors based on project properties
  const primaryColor = generateColor(projectId, category, 0.2);
  const secondaryColor = generateColor(projectId.split('').reverse().join(''), category, 0.15);

  // Determine grid size based on project type
  const gridSize = projectType === 'live' ? '5px' : '10px';
  const gridSizeNum = projectType === 'live' ? 5 : 10;

  return (
    <div
      className="w-full h-full rounded-lg overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(45deg, ${primaryColor} 25%, transparent 25%),
          linear-gradient(-45deg, ${primaryColor} 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${primaryColor} 75%),
          linear-gradient(-45deg, transparent 75%, ${primaryColor} 75%),
          linear-gradient(0deg, ${secondaryColor} 50%, transparent 50%)
        `,
        backgroundSize: `${gridSize} ${gridSize}, ${gridSize} ${gridSize}, ${gridSize} ${gridSize}, ${gridSize} ${gridSize}, ${gridSizeNum * 2}px ${gridSizeNum * 2}px`,
        backgroundPosition: `0 0, 0 ${gridSize}, ${gridSize} -${gridSize}, -${gridSize} 0px, 0 0`
      }}
    />
  );
};

/**
 * Minimalist thumbnail with subtle scribbles/lines on white background.
 */
export const MinimalistThumbnail: React.FC<ThumbnailProps> = ({ projectId, projectType, category }) => {
  // Generate unique but consistent colors based on project properties
  const primaryColor = generateColor(projectId, category, 0.20);
  const secondaryColor = generateColor(projectId.split('').reverse().join(''), category, 0.15);

  // Use projectId to determine line angle and thickness
  const idSum = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const angle = idSum % 180; // 0-179 degrees
  const lineThickness = 4 + (idSum % 4); // 4-7px
  const lineSpacing = 30 + (idSum % 40); // 30-69px

  return (
    <div
      className="w-full h-full rounded-lg overflow-hidden bg-white"
      style={{
        backgroundImage: `
          repeating-linear-gradient(${angle}deg, ${primaryColor}, ${primaryColor} ${lineThickness}px, transparent ${lineThickness}px, transparent ${lineSpacing}px),
          repeating-linear-gradient(${(angle + 80) % 180}deg, ${secondaryColor}, ${secondaryColor} ${lineThickness - 1}px, transparent ${lineThickness - 1}px, transparent ${lineSpacing + 15}px)
        `,
      }}
    />
  );
};

/**
 * Geometric Thumbnail: Chevrons
 * @description Creates a chevron pattern using diagonal gradients for a neobrutalist aesthetic
 * @param {ThumbnailProps} props - Component props including projectId, projectType, and category
 * @returns {JSX.Element} Chevron pattern thumbnail
 */
export const ChevronPatternThumbnail: React.FC<ThumbnailProps> = ({ projectId, projectType, category }) => {
  const chevronColor = generateColor(projectId, category, 0.2); // Primary color for chevrons
  const bgColor = generateColor(projectId.split("").reverse().join(""), category, 0.05); // Softer background

  return (
    <div
      className="w-full h-full rounded-lg overflow-hidden"
      style={{
        backgroundColor: bgColor,
        backgroundImage: `
          repeating-linear-gradient(45deg, ${chevronColor}, ${chevronColor} 10px, transparent 10px, transparent 25px),
          repeating-linear-gradient(-45deg, ${chevronColor}, ${chevronColor} 10px, transparent 10px, transparent 25px)
        `,
        // Note: Pixel values (10px, 25px) can be adjusted for desired chevron size and spacing
      }}
    />
  );
};

/**
 * Geometric Thumbnail: Polka Dots
 * @description Creates a polka dot pattern using radial gradients with dynamic sizing based on project type
 * @param {ThumbnailProps} props - Component props including projectId, projectType, and category
 * @returns {JSX.Element} Polka dot pattern thumbnail
 */
export const PolkaDotPatternThumbnail: React.FC<ThumbnailProps> = ({ projectId, projectType, category }) => {
  const dotColor = generateColor(projectId, category, 0.3);
  const bgColor = generateColor(projectId.split("").reverse().join(""), category, 0.03);
  const dotSize = projectType === 'live' ? '8px' : '12px'; // Example: smaller dots for live projects
  const spacing = projectType === 'live' ? '20px' : '30px';

  return (
    <div
      className="w-full h-full rounded-lg overflow-hidden"
      style={{
        backgroundColor: bgColor,
        backgroundImage: `radial-gradient(${dotColor} ${dotSize}, transparent ${dotSize})`,
        backgroundSize: `${spacing} ${spacing}`,
      }}
    />
  );
};