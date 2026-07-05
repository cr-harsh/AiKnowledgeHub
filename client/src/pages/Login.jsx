import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    // Frontend validations
    const formErrors = {};
    if (!email) {
      formErrors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      formErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      formErrors.password = 'Password is required';
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      if (result.errors) {
        setErrors(result.errors);
      } else {
        setGeneralError(result.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#82aeb1]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#a7acd9]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl relative border border-[#82aeb1]/15 animate-fade-in z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-[#82aeb1]/10 rounded-2xl border border-[#82aeb1]/20 text-[#93c6d6] mb-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Sign in to your AI Knowledge Hub account</p>
        </div>

        {generalError && (
          <div className="mb-6 p-3 bg-[var(--danger-bg)] border border-[var(--danger-border)] text-[var(--danger-text)] rounded-lg text-sm text-center">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`w-full bg-[var(--bg-card)]/55 border ${
                errors.email
                  ? 'border-[var(--danger-border-hover)] focus:border-[var(--danger)]'
                  : 'border-[#82aeb1]/15 focus:border-[#82aeb1]'
              } text-white placeholder:text-[var(--text-quaternary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#82aeb1]/40 transition duration-200`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-[var(--danger-text)] text-xs mt-1.5">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`w-full bg-[var(--bg-card)]/55 border ${
                errors.password
                  ? 'border-[var(--danger-border-hover)] focus:border-[var(--danger)]'
                  : 'border-[#82aeb1]/15 focus:border-[#82aeb1]'
              } text-white placeholder:text-[var(--text-quaternary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#82aeb1]/40 transition duration-200`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.password && <p className="text-[var(--danger-text)] text-xs mt-1.5">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#668586] via-[#82aeb1] to-[#93c6d6] hover:from-[#82aeb1] hover:to-[#a7acd9] text-white rounded-xl py-3 px-4 text-sm font-semibold transition duration-300 shadow-lg shadow-[#82aeb1]/25 flex items-center justify-center cursor-pointer disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-[var(--text-secondary)] text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#93c6d6] hover:text-[#a7acd9] font-semibold transition duration-200">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
