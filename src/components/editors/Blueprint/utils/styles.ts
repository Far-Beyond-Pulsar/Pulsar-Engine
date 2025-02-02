import styled from 'styled-components';

// Layout Styles
export const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 300px;
  grid-template-areas:
    'editor canvas details';
  gap: 0.6em;
  padding: 0.6em;
  background: #000000;
  color: #ffffff;
  box-sizing: border-box;
  overflow: hidden;
  height: calc(100% - 24px);
  width: 100%;
`;

// Editor Wrapper Styles
export const EditorWrapper = styled.div`
  grid-area: editor;
  position: relative;
  background: #000000;
  border: 1px solid #1f1f1f;
`;

// Canvas Wrapper Styles
export const CanvasWrapper = styled.div`
  grid-area: canvas;
  position: relative;
  background: #000000;
  border: 1px solid #1f1f1f;
`;

// Details Panel Styles
export const DetailsPanel = styled.div`
  grid-area: details;
  background: #121212;
  border: 1px solid #1f1f1f;
  padding: 1em;
  overflow-y: auto;
`;

// Form Field Styles
export const FormField = styled.div`
  margin-bottom: 1em;
  
  label {
    display: block;
    margin-bottom: 0.5em;
    color: #3B82F6;
  }
  
  input {
    width: 100%;
    padding: 0.5em;
    background: #1f1f1f;
    border: 1px solid #333;
    color: #fff;
    border-radius: 4px;
  }
`;

// Node Styles
export const StyledNode = styled.div`
  background: #121212;
  border: 2px solid #333333;
  border-radius: 8px;
  padding: 10px;
  min-width: 150px;
  max-width: 200px;
  box-shadow:  0 4px 6px rgba(255,255,255,0.05);
  color: #ffffff;
  font-family: 'Arial', sans-serif;
  
  &.selected {
    border-color: #3B82F6;
  }
  
  &.highlighted {
    border-color: #10B981;
  }
  
  .node-type {
    font-weight: bold;
    color: #3B82F6;
    margin-bottom: 5px;
    text-transform: uppercase;
  }
  
  .node-details {
    font-size: 0.9em;
    color: #888888;
    word-break: break-all;
  }
`;

// Theme Configuration
export const THEME = {
  colors: {
    background: {
      dark: '#000000',
      medium: '#121212',
      light: '#1f1f1f'
    },
    text: {
      primary: '#ffffff',
      secondary: '#888888',
      accent: '#3B82F6'
    },
    border: {
      default: '#333333',
      highlighted: '#10B981'
    },
    handles: {
      input: '#3B82F6',
      output: '#10B981'
    }
  },
  spacing: {
    xs: '0.5em',
    sm: '1em',
    md: '1.5em',
    lg: '2em'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px'
  }
};

// Global Styles
export const GlobalStyles = styled.createGlobalStyle`
  body {
    background-color: ${THEME.colors.background.dark};
    color: ${THEME.colors.text.primary};
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  * {
    scrollbar-width: thin;
    scrollbar-color: ${THEME.colors.border.default} ${THEME.colors.background.medium};
  }

  *::-webkit-scrollbar {
    width: 8px;
  }

  *::-webkit-scrollbar-track {
    background: ${THEME.colors.background.medium};
  }

  *::-webkit-scrollbar-thumb {
    background-color: ${THEME.colors.border.default};
    border-radius: 20px;
  }
`;

// Utility Style Mixins
export const styleMixins = {
  // Flexbox Center
  flexCenter: `
    display: flex;
    justify-content: center;
    align-items: center;
  `,

  // Glass Morphism Effect
  glassMorphism: `
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `,

  // Hover Effect
  hoverEffect: `
    transition: all 0.3s ease;
    &:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 6px rgba(255,255,255,0.1);
    }
  `
};

// Typography Styles
export const Typography = {
  H1: styled.h1`
    font-size: 2.5em;
    color: ${THEME.colors.text.accent};
    margin-bottom: ${THEME.spacing.sm};
  `,
  
  H2: styled.h2`
    font-size: 2em;
    color: ${THEME.colors.text.primary};
    margin-bottom: ${THEME.spacing.sm};
  `,
  
  Body: styled.p`
    font-size: 1em;
    color: ${THEME.colors.text.secondary};
    line-height: 1.6;
  `
};

export default {
  Layout,
  EditorWrapper,
  CanvasWrapper,
  DetailsPanel,
  FormField,
  StyledNode,
  THEME,
  GlobalStyles,
  styleMixins,
  Typography
};