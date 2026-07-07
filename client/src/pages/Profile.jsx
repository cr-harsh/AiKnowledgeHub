import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout className="overflow-y-auto">
      <main className="p-4 md:p-8 relative">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#82aeb1]/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-2xl mx-auto animate-fade-in relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Account Profile</h1>
            <p className="text-[var(--text-secondary)] mt-1.5 text-sm">View your profile details and connection settings</p>
          </div>

          <div className="glass-panel rounded-2xl border border-[#82aeb1]/15 p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-[#82aeb1]/15">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#668586] via-[#82aeb1] to-[#93c6d6] flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-[#82aeb1]/20">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-white">{user.username}</h3>
                <p className="text-sm text-[#93c6d6] font-medium">Personal Account Tier</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="block text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Username
                </span>
                <div className="bg-[var(--bg-card)]/55 border border-[#82aeb1]/15 rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm font-medium">
                  {user.username}
                </div>
              </div>

              <div>
                <span className="block text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Email Address
                </span>
                <div className="bg-[var(--bg-card)]/55 border border-[#82aeb1]/15 rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm font-medium">
                  {user.email}
                </div>
              </div>

              <div>
                <span className="block text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Member Since
                </span>
                <div className="bg-[var(--bg-card)]/55 border border-[#82aeb1]/15 rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm font-medium">
                  {formatDate(user.createdAt)}
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button
                onClick={logout}
                className="px-6 py-3 bg-[var(--danger-bg)] hover:bg-[var(--danger-bg-hover)] border border-[var(--danger-border)] hover:border-[var(--danger-border-hover)] text-[var(--danger-text)] rounded-xl text-sm font-semibold transition duration-200 cursor-pointer"
              >
                Log Out Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Profile;
