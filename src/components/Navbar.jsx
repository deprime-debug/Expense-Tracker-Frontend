import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenAuth }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="top">
      <div>
        <div className="brand">CacheFlow<span>.</span></div>
        <div className="tagline">a quieter way to watch your money</div>
      </div>

      <div className="header-actions">
        {isAuthenticated ? (
          <>
            <div className="user-badge">
              <span className="user-avatar">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </span>
              <span>{user.username}</span>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#4ade80',
                display: 'inline-block',
                marginLeft: 4
              }} title="JWT Authenticated &amp; MySQL Connected" />
            </div>
            <button
              className="btn-auth-nav ghost"
              onClick={logout}
              title="Sign out of your account"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button
              className="btn-auth-nav ghost"
              onClick={() => onOpenAuth('login')}
            >
              Sign In
            </button>
            <button
              className="btn-auth-nav primary"
              onClick={() => onOpenAuth('register')}
            >
              Register
            </button>
          </>
        )}
      </div>
    </header>
  );
}
