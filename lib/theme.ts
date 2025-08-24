// Consistent theme configuration for BloodLink platform

export const bloodLinkTheme = {
  colors: {
    primary: {
      50: '#fef2f2',
      100: '#fee2e2', 
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    secondary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd', 
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    accent: {
      purple: '#8b5cf6',
      pink: '#ec4899',
      emerald: '#10b981',
      amber: '#f59e0b',
    }
  },
  gradients: {
    primary: 'from-red-500 to-red-600',
    secondary: 'from-blue-500 to-blue-600',
    success: 'from-emerald-500 to-emerald-600',
    warning: 'from-amber-500 to-amber-600',
    info: 'from-blue-500 to-cyan-500',
    accent: 'from-purple-500 to-pink-500',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    glow: '0 0 20px rgb(239 68 68 / 0.3)',
  },
  borderRadius: {
    sm: '0.125rem',
    default: '0.25rem', 
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  }
}

export const aiFeatureConfig = {
  prediction: {
    name: 'Smart Blood Demand Prediction',
    description: 'AI analyzes historical patterns, weather, events, and seasonal trends to predict blood demand',
    icon: 'TrendingUp',
    color: 'blue',
    status: 'active'
  },
  matching: {
    name: 'Intelligent Donor Matching', 
    description: 'Advanced algorithms match donors based on compatibility, location, availability, and reliability',
    icon: 'Users',
    color: 'emerald',
    status: 'active'
  },
  agentic: {
    name: 'Agentic AI Coordinator',
    description: 'Autonomous AI agents handle emergency responses, donor outreach, and resource optimization',
    icon: 'Bot',
    color: 'purple', 
    status: 'beta'
  }
}
