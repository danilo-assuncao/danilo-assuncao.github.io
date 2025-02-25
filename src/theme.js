const lightTheme = {
  colors: {
    title: '#1E3A8A',        // Dark Blue for titles
    text: '#212529',         // Soft Black for main text
    textSecondary: '#4A4A4A',// Dark Gray for secondary text
    background: '#FFFFFF',   // Pure white background
    surface: '#F8F9FA',      // Light gray for cards
    accent: '#2563EB',       // Medium Blue for links
    accentHover: '#1E40AF',  // Darker Blue for link hovers
    highlight: '#F97316',    // Orange for highlights
    highlightHover: '#EA580C',// Darker Orange for highlight hovers
    border: '#E5E7EB',       // Light gray for borders
    code: '#1E293B',         // Dark slate for code blocks
    codeBackground: '#F1F5F9'// Light slate for code backgrounds
  }
};

const darkTheme = {
  colors: {
    title: '#E0E0E0',        // Light Gray for titles in dark mode
    text: '#E0E0E0',         // Light Gray for text in dark mode
    textSecondary: '#A0A0A0',// Medium Gray for secondary text
    background: '#121212',   // Charcoal Gray background
    surface: '#1E1E1E',      // Slightly lighter surface
    accent: '#60A5FA',       // Lighter Blue for better contrast
    accentHover: '#93C5FD',  // Even lighter Blue for hover
    highlight: '#FB923C',    // Lighter Orange for dark mode
    highlightHover: '#FD9D57',// Even lighter Orange for hover
    border: '#2D2D2D',       // Dark gray for borders
    code: '#E0E0E0',         // Light gray for code
    codeBackground: '#1E293B'// Dark slate for code backgrounds
  }
};

export const defaultTheme = {
  ...lightTheme,
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    headerSize: '2.25rem',
    subheaderSize: '1.5rem',
    bodySize: '1.125rem',
    smallSize: '0.875rem',
    lineHeight: 1.8,         // Slightly increased for better readability
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  spacing: {
    xs: '0.25rem',
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
    paragraph: '1.75rem'     // Specific spacing for paragraphs
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1280px'
  },
  borderRadius: {
    small: '0.375rem',
    medium: '0.5rem',
    large: '0.75rem'
  },
  shadows: {
    small: '0 1px 2px rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  },
  darkMode: false           // Flag for dark mode state
};
