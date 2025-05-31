import React from 'react';

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

  // Map category to base hue
  const categoryHues: Record<string, number> = {
    ai: 290,          // Violet - Intelligence, innovation, future tech
    blockchain: 210,  // Blue - Trust, technology, innovation
    gaming: 120,      // Green - Energy, play, achievement
    community: 270,   // Purple - Connection, collaboration, creativity
    music: 330,       // Pink/Magenta - Rhythm, creativity, expression
    design: 30,       // Orange - Creativity, warmth, inspiration
    education: 60,    // Yellow - Knowledge, enlightenment, learning
    productivity: 180, // Cyan - Efficiency, clarity, focus
    other: 0          // Red - Passion, energy, standout
  };

  // Get category-specific variations
  const categoryHash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const hue = categoryHues[category] || (hash % 360); // Fallback to hash-based hue
  const saturation = 65 + (hash % 25) + (categoryHash % 10); // 65-99% with category variation
  const lightness = 80 + (hash % 15) + (categoryHash % 5);  // 80-99% (very light) with category variation

  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
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