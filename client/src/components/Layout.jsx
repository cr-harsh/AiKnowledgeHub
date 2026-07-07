import React, { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--bg-main)] text-[var(--text-primary)] overflow-hidden">
      {/* Sidebar for Desktop (visible on md screens and up) */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar Drawer for Mobile/Tablet (visible under md screens) */}
      <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Dark backdrop overlay */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsOpen(false)} 
        />
        
        {/* Drawer container with slide-in animation */}
        <div className={`absolute top-0 bottom-0 left-0 w-64 bg-[var(--bg-main)] shadow-2xl transform transition-transform duration-300 ease-in-out z-10 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar onCloseMobile={() => setIsOpen(false)} isMobile={true} />
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navbar Header on Mobile/Tablet */}
        <header className="flex md:hidden items-center justify-between px-4 py-3 bg-[var(--bg-main)] border-b border-[#82aeb1]/15 shrink-0 z-20">
          <button 
            onClick={() => setIsOpen(true)}
            className="text-[var(--text-secondary)] hover:text-white p-1.5 rounded-lg hover:bg-[#82aeb1]/10 focus:outline-none transition cursor-pointer"
            aria-label="Open navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#668586] via-[#82aeb1] to-[#93c6d6] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#82aeb1]/25">
              A
            </div>
            <span className="font-bold text-white text-sm tracking-tight">AI Knowledge</span>
          </div>
          
          {/* Balanced spacing block */}
          <div className="w-9" />
        </header>

        {/* Children Page Content wrapper */}
        <div className={`flex-1 min-w-0 relative ${className}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
