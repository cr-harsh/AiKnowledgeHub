import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <aside className="w-64 bg-[var(--bg-main)] border-r border-[#82aeb1]/15 flex flex-col h-screen shrink-0 text-[var(--text-secondary)]">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#82aeb1]/15 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#668586] via-[#82aeb1] to-[#93c6d6] flex items-center justify-center text-white font-bold text-lg shadow-md shadow-[#82aeb1]/25">
          A
        </div>
        <div>
          <h1 className="text-md font-bold text-white leading-tight">AI Knowledge</h1>
          <p className="text-[10px] text-[var(--text-tertiary)] font-semibold tracking-wide uppercase">Document Hub</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 ${
              isActive
                ? 'bg-[#82aeb1]/10 text-[#93c6d6] border-l-2 border-[#82aeb1]'
                : 'hover:bg-[#82aeb1]/10 hover:text-[#93c6d6]'
            }`
          }
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Dashboard
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 ${
              isActive
                ? 'bg-[#82aeb1]/10 text-[#93c6d6] border-l-2 border-[#82aeb1]'
                : 'hover:bg-[#82aeb1]/10 hover:text-[#93c6d6]'
            }`
          }
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </NavLink>
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-[#82aeb1]/15 bg-[var(--bg-card)]/45">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-[#82aeb1]/10 border border-[#82aeb1]/25 flex items-center justify-center text-[#93c6d6] font-bold shrink-0">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user.username}</p>
              <p className="text-[10px] text-[var(--text-tertiary)] truncate">{user.email}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[var(--danger-bg)] hover:bg-[var(--danger-bg-hover)] border border-[var(--danger-border)] hover:border-[var(--danger-border-hover)] text-[var(--danger-text)] rounded-lg text-xs font-semibold transition duration-200 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
