/**
 * Main layout component
 */

import React from 'react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <header className="header">
        <h1>Artists App</h1>
        <p>Music Composition Analysis Tool</p>
      </header>
      <main className="main-content">{children}</main>
      <footer className="footer">
        <p>&copy; 2024 Artists App. All rights reserved.</p>
      </footer>
    </div>
  );
};
