import React, { useEffect, useRef } from 'react';

interface ProjectThumbnailProps {
  projectId: string;
  projectType: string;
  category: string;
}

// Option 1: Bold Geometric Overlays with High-Contrast Borders
export const ProjectThumbnail: React.FC<ProjectThumbnailProps> = ({ 
  projectId, 
  projectType,
  category 
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Generate a pseudo-random number between min and max based on a seed
  const seededRandom = (seed: string, min: number, max: number): number => {
    // Simple string hash function
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Normalize between 0 and 1, then scale to range
    const normalizedHash = Math.abs(hash) / 2147483647; // Max 32-bit signed int
    return min + normalizedHash * (max - min);
  };
  
  // Get color based on category
  const getCategoryColor = (category: string): string => {
    const categoryMap: Record<string, string> = {
      tech: '#bfdbfe', // french-pass
      gaming: '#bbf7d0', // ice-cold
      community: '#bfdbfe', // french-pass
      music: '#e9d5ff', // purple-200
      design: '#fbcfe8', // pink-200
      education: '#fef08a', // yellow-200
      productivity: '#fed7aa', // orange-200
      other: '#e5e7eb', // athens-gray
    };
    
    return categoryMap[category] || categoryMap.other;
  };
  
  // Get a second color that contrasts well with the category color
  const getAccentColor = (category: string): string => {
    const accentMap: Record<string, string> = {
      tech: '#1d4ed8', // persian-blue
      gaming: '#15803d', // jewel
      community: '#1d4ed8', // persian-blue
      music: '#7e22ce', // purple-heart
      design: '#ec4899', // french-rose
      education: '#eab308', // corn
      productivity: '#f97316', // orange-500
      other: '#374151', // oxford-blue
    };
    
    return accentMap[category] || accentMap.other;
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.innerHTML = ''; // Clear existing content
    
    // Set background color based on category (lighter version)
    canvas.style.backgroundColor = getCategoryColor(category);
    
    // Number of shapes to draw (2-4)
    const numShapes = Math.floor(seededRandom(`${projectId}-count`, 2, 5));
    
    // Determine if we should use project type to influence shapes
    const useCircles = projectType === 'live';
    
    // Create shapes
    for (let i = 0; i < numShapes; i++) {
      const shape = document.createElement('div');
      
      // Determine shape type
      const isCircle = useCircles || seededRandom(`${projectId}-shape-${i}`, 0, 1) > 0.6;
      
      // Size (30-60% of container)
      const size = seededRandom(`${projectId}-size-${i}`, 30, 60);
      
      // Position (ensuring at least part of the shape is visible)
      const left = seededRandom(`${projectId}-left-${i}`, -20, 80);
      const top = seededRandom(`${projectId}-top-${i}`, -20, 80);
      
      // Rotation (0-360 degrees)
      const rotation = seededRandom(`${projectId}-rotation-${i}`, 0, 360);
      
      // Get accent color
      const accentColor = getAccentColor(category);
      
      // Shape styling
      shape.style.position = 'absolute';
      shape.style.width = `${size}%`;
      shape.style.height = `${size}%`;
      shape.style.left = `${left}%`;
      shape.style.top = `${top}%`;
      shape.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      shape.style.border = `3px solid ${accentColor}`;
      shape.style.transform = `rotate(${rotation}deg)`;
      shape.style.zIndex = `${i + 1}`;
      
      if (isCircle) {
        shape.style.borderRadius = '50%';
      }
      
      // Add shadow similar to card shadow but smaller
      shape.style.boxShadow = `3px 3px 0px #1f2937`;
      
      canvas.appendChild(shape);
    }
  }, [projectId, projectType, category]);

  return (
    <div 
      ref={canvasRef}
      className="w-full h-full rounded-lg border-2 border-solid border-gray-800 overflow-hidden relative"
      aria-label="Project thumbnail"
    ></div>
  );
};

// Option 2: Abstract Grid with Dynamic Fills
export const GridThumbnail: React.FC<ProjectThumbnailProps> = ({ 
  projectId, 
  projectType,
  category 
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Generate a pseudo-random number between min and max based on a seed
  const seededRandom = (seed: string, min: number, max: number): number => {
    // Simple string hash function
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Normalize between 0 and 1, then scale to range
    const normalizedHash = Math.abs(hash) / 2147483647;
    return min + normalizedHash * (max - min);
  };
  
  // Get color based on category
  const getCategoryColor = (category: string): string => {
    const categoryMap: Record<string, string> = {
      tech: '#bfdbfe', // french-pass
      gaming: '#bbf7d0', // ice-cold
      community: '#bfdbfe', // french-pass
      music: '#e9d5ff', // purple-200
      design: '#fbcfe8', // pink-200
      education: '#fef08a', // yellow-200
      productivity: '#fed7aa', // orange-200
      other: '#e5e7eb', // athens-gray
    };
    
    return categoryMap[category] || categoryMap.other;
  };
  
  // Get a second color that contrasts well with the category color
  const getAccentColor = (category: string): string => {
    const accentMap: Record<string, string> = {
      tech: '#1d4ed8', // persian-blue
      gaming: '#15803d', // jewel
      community: '#1d4ed8', // persian-blue
      music: '#7e22ce', // purple-heart
      design: '#ec4899', // french-rose
      education: '#eab308', // corn
      productivity: '#f97316', // orange-500
      other: '#374151', // oxford-blue
    };
    
    return accentMap[category] || accentMap.other;
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.innerHTML = ''; // Clear existing content
    
    // Set white background
    canvas.style.backgroundColor = '#ffffff';
    
    // Grid size (more cells for live projects)
    const gridSize = projectType === 'live' ? 6 : 5;
    
    // Cell size
    const cellSize = 100 / gridSize;
    
    // Create grid container
    const gridContainer = document.createElement('div');
    gridContainer.style.display = 'grid';
    gridContainer.style.width = '100%';
    gridContainer.style.height = '100%';
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
    
    const categoryColor = getCategoryColor(category);
    const accentColor = getAccentColor(category);
    
    // Fill ratio - determines how many cells to fill (20-40%)
    const fillRatio = seededRandom(`${projectId}-fill-ratio`, 0.2, 0.4);
    
    // Create cells
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cell = document.createElement('div');
        
        // Cell border
        cell.style.border = `2px solid ${accentColor}`;
        
        // Determine if cell should be filled based on seeded random
        const cellSeed = `${projectId}-cell-${row}-${col}`;
        const shouldFill = seededRandom(cellSeed, 0, 1) < fillRatio;
        
        // Add a pattern element for some cells (25% chance)
        const addPattern = seededRandom(`${cellSeed}-pattern`, 0, 1) > 0.75;
        
        if (shouldFill) {
          // Fill cell with category color
          cell.style.backgroundColor = accentColor;
          
          // Add an inner element with a pattern for some cells
          if (addPattern) {
            const pattern = document.createElement('div');
            pattern.style.width = '100%';
            pattern.style.height = '100%';
            pattern.style.display = 'flex';
            pattern.style.justifyContent = 'center';
            pattern.style.alignItems = 'center';
            
            // Choose a pattern type
            const patternType = Math.floor(seededRandom(`${cellSeed}-pattern-type`, 0, 3));
            
            if (patternType === 0) {
              // Diagonal lines
              pattern.style.backgroundImage = `repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px)`;
            } else if (patternType === 1) {
              // Circle
              const innerCircle = document.createElement('div');
              innerCircle.style.width = '60%';
              innerCircle.style.height = '60%';
              innerCircle.style.borderRadius = '50%';
              innerCircle.style.backgroundColor = 'white';
              pattern.appendChild(innerCircle);
            } else {
              // Cross
              pattern.innerHTML = `
                <div style="position: absolute; width: 60%; height: 10%; background-color: white; top: 45%;"></div>
                <div style="position: absolute; width: 10%; height: 60%; background-color: white; left: 45%;"></div>
              `;
            }
            
            cell.appendChild(pattern);
          }
        } else {
          // Empty cell with slight tint
          cell.style.backgroundColor = categoryColor;
        }
        
        gridContainer.appendChild(cell);
      }
    }
    
    canvas.appendChild(gridContainer);
  }, [projectId, projectType, category]);
  
  return (
    <div 
      ref={canvasRef}
      className="w-full h-full rounded-lg border-2 border-solid border-gray-800 overflow-hidden relative"
      aria-label="Project thumbnail"
    ></div>
  );
};