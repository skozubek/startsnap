/**
 * src/config/categories.ts
 * @description Single source of truth for all category configurations
 * Adding a new category? Just add it here and it works everywhere! Will migrate to DB later
 */

export const CATEGORY_CONFIG = {
    ai: { // VIOLET - CORRECT
      value: 'ai',
      label: 'AI Powered Tool',
      hue: 290, //
      display: {
        bgColor: 'bg-violet-200',
        textColor: 'text-violet-700',
        borderColor: 'border-violet-700'
      }
    },
    blockchain: {
      value: 'blockchain',
      label: 'Blockchain',
      hue: 210, // Blue - Trust, technology, innovation
      display: {
        bgColor: 'bg-blue-200',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-700'
      }
    },
    gaming: {
      value: 'gaming',
      label: 'Gaming',
      hue: 120, // Green - Energy, play, achievement
      display: {
        bgColor: 'bg-startsnap-ice-cold',
        textColor: 'text-startsnap-jewel',
        borderColor: 'border-green-700'
      }
    },
    community: {
      value: 'community',
      label: 'Community',
      hue: 270, // Purple - Connection, collaboration, creativity
      display: {
        bgColor: 'bg-purple-200',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-700'
      }
    },
    music: {
      value: 'music',
      label: 'Music Tech',
      hue: 330, // Pink/Magenta - Rhythm, creativity, expression
      display: {
        bgColor: 'bg-pink-200',
        textColor: 'text-pink-700',
        borderColor: 'border-pink-700'
      }
    },
    design: {
      value: 'design',
      label: 'Design',
      hue: 30, // Orange - Creativity, warmth, inspiration
      display: {
        bgColor: 'bg-orange-200',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-700'
    }
},
    education: {
      value: 'education',
      label: 'Education',
      hue: 60, // Yellow - Knowledge, enlightenment, learning
      display: {
        bgColor: 'bg-yellow-200',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-700'
      }
    },
    productivity: {
      value: 'productivity',
      label: 'Productivity',
      hue: 180, // Cyan - Efficiency, clarity, focus
      display: {
        bgColor: 'bg-cyan-200',
        textColor: 'text-cyan-700',
        borderColor: 'border-cyan-700'
      }
    },
    other: {
      value: 'other',
      label: 'Other',
      hue: 210, // Neutral blue-gray - Balanced, inclusive, flexible
      display: {
        bgColor: 'bg-gray-200',           // Changed from bg-red-200 to neutral gray
        textColor: 'text-gray-700',       // Changed from text-red-700 to neutral gray
        borderColor: 'border-gray-700'    // Changed from border-red-700 to neutral gray
      }
    }
  } as const;

/**
 * @description Configuration for vibe log entry types
 * Adding a new vibe log type? Just add it here and it works everywhere! 🚀
 */
export const VIBE_LOG_CONFIG = {
  update: {
    value: 'update',
    label: 'General Update',
    icon: 'campaign',
    description: 'Progress updates and general improvements',
    contentPlaceholder: "What\'s new? Share your progress, milestones, or general announcements about your project.",
    display: {
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-700',
      iconBorder: 'border-cyan-600'
    }
  },
  feature: {
    value: 'feature',
    label: 'Fix / New Feature',
    icon: 'construction',
    description: 'New features, fixes, or enhancements',
    contentPlaceholder: "Describe the new feature or fix. What problem does it solve? How does it improve the project?",
    display: {
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-700',
      iconBorder: 'border-orange-600'
    }
  },
  feedback: {
    value: 'feedback',
    label: 'Seeking Feedback',
    icon: 'forum',
    description: 'Looking for community input and suggestions',
    contentPlaceholder: "What specific aspects of your project are you seeking feedback on? Guide the community on how they can help.",
    display: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-700',
      iconBorder: 'border-green-600'
    }
  },
  aimagic: {
    value: 'aimagic',
    label: 'AI magic',
    icon: 'auto_awesome',
    description: 'Showcasing AI-driven features or breakthroughs.',
    contentPlaceholder: "Showcase your AI breakthrough! What did you build, what prompt did you use, or what was the amazing LLM output?",
    display: {
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      iconBorder: 'border-purple-500'
    }
  },
  launch: {
    value: 'launch',
    label: 'Launch',
    icon: 'rocket_launch',
    description: 'Initial project launch or major release',
    contentPlaceholder: "It\'s launch day! Share the excitement, key features, and what makes your project special.",
    display: {
      iconBg: 'bg-startsnap-wisp-pink',
      iconColor: 'text-startsnap-french-rose',
      iconBorder: 'border-pink-500'
    }
  },
  idea: {
    value: 'idea',
    label: 'Idea',
    icon: 'lightbulb',
    description: 'Initial concept or brainstorming',
    contentPlaceholder: "Describe your new idea. What problem does it solve? What\'s your vision for it?",
    display: {
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      iconBorder: 'border-yellow-500'
    }
  }
} as const;

/**
 * @description Configuration for user status options
 * Adding a new user status? Just add it here and it works everywhere! 🚀
 */
export const USER_STATUS_CONFIG = {
  building: {
    value: 'building',
    label: 'Actively Building',
    icon: 'rocket_launch',
    description: 'Currently working on projects and building things'
  },
  brainstorming: {
    value: 'brainstorming',
    label: 'Brainstorming Ideas',
    icon: 'lightbulb',
    description: 'Exploring new concepts and generating ideas'
  },
  collaborating: {
    value: 'collaborating',
    label: 'Open to Collaboration',
    icon: 'handshake',
    description: 'Looking for team members and collaboration opportunities'
  },
  feedback: {
    value: 'feedback',
    label: 'Seeking Feedback',
    icon: 'search',
    description: 'Actively seeking input and feedback on projects'
  },
  job_ready: {
    value: 'job_ready',
    label: 'Looking for Work',
    icon: 'work',
    description: 'Open to job opportunities and employment'
  },
  break: {
    value: 'break',
    label: 'Taking a Break',
    icon: 'hourglass_empty',
    description: 'Currently taking time off from active development'
  }
} as const;

/**
 * @description Get form options for select dropdowns
 * @returns Array of {value, label} objects for form components
 */
export const getFormOptions = () => {
  return Object.values(CATEGORY_CONFIG).map(config => ({
    value: config.value,
    label: config.label
  }));
};

/**
 * @description Get vibe log type options for select dropdowns
 * @returns Array of {value, label, icon, description} objects for form components
 */
export const getVibeLogOptions = () => {
  return Object.values(VIBE_LOG_CONFIG).map(config => ({
    value: config.value,
    label: config.label,
    icon: config.icon,
    description: config.description,
    contentPlaceholder: config.contentPlaceholder
  }));
};

/**
 * @description Get category display mapping for UI components
 * @returns Object mapping category values to display properties
 */
export const getCategoryDisplayMap = () => {
  return Object.fromEntries(
    Object.entries(CATEGORY_CONFIG).map(([key, config]) => [
      key,
      {
        name: config.label,
        ...config.display
      }
    ])
  );
};

/**
 * @description Get vibe log type display mapping for UI components
 * @returns Object mapping vibe log type values to display properties
 */
export const getVibeLogDisplayMap = () => {
  return Object.fromEntries(
    Object.entries(VIBE_LOG_CONFIG).map(([key, config]) => [
      key,
      {
        icon: config.icon,
        label: config.label,
        description: config.description,
        contentPlaceholder: config.contentPlaceholder,
        ...config.display
      }
    ])
  );
};

/**
 * @description Get category hue mapping for thumbnail components
 * @returns Object mapping category values to color hues
 */
export const getCategoryHueMap = () => {
  return Object.fromEntries(
    Object.entries(CATEGORY_CONFIG).map(([key, config]) => [key, config.hue])
  );
};

/**
 * @description Get display properties for a specific category
 * @param {string} category - Category identifier
 * @returns {Object} Display properties including name, colors, etc.
 */
export const getCategoryDisplay = (category: string) => {
  const displayMap = getCategoryDisplayMap();
  return displayMap[category] || displayMap.other;
};

/**
 * @description Get display properties for a specific vibe log type
 * @param {string} vibeLogType - Vibe log type identifier
 * @returns {Object} Display properties including icon, colors, etc.
 */
export const getVibeLogDisplay = (vibeLogType: string) => {
  const displayMap = getVibeLogDisplayMap();
  return displayMap[vibeLogType] || displayMap.update;
};

/**
 * @description Get user status options for select dropdowns
 * @returns Array of {value, label, icon, description} objects for form components
 */
export const getUserStatusOptions = () => {
  return Object.values(USER_STATUS_CONFIG).map(config => ({
    value: config.value,
    label: config.label,
    icon: config.icon,
    description: config.description
  }));
};

/**
 * @description Get user status display mapping for UI components
 * @returns Object mapping user status values to display properties
 */
export const getUserStatusDisplayMap = () => {
  return Object.fromEntries(
    Object.entries(USER_STATUS_CONFIG).map(([key, config]) => [
      key,
      {
        label: config.label,
        icon: config.icon,
        description: config.description
      }
    ])
  );
};

/**
 * @description Get display properties for a specific user status
 * @param {string} status - User status identifier
 * @returns {Object} Display properties including label, icon, etc.
 */
export const getUserStatusDisplay = (status: string) => {
  const displayMap = getUserStatusDisplayMap();
  return displayMap[status] || displayMap.brainstorming;
};

// Type exports for better TypeScript support
export type CategoryValue = keyof typeof CATEGORY_CONFIG;
export type CategoryConfig = typeof CATEGORY_CONFIG[CategoryValue];
export type VibeLogValue = keyof typeof VIBE_LOG_CONFIG;
export type VibeLogConfig = typeof VIBE_LOG_CONFIG[VibeLogValue];
export type UserStatusValue = keyof typeof USER_STATUS_CONFIG;
export type UserStatusConfig = typeof USER_STATUS_CONFIG[UserStatusValue];