// import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';

// const AuthContext = createContext(null);

// function decodeExp(token) {
//   if (!token) return 0;
//   try {
//     const [, payload] = token.split('.');
//     const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
//     return typeof json.exp === 'number' ? json.exp : 0; // seconds since epoch
//    } catch (err) {
//     console.warn('JWT decode failed, treating as expired:', err);
//     return 0;
//   }
// }

// export function AuthProvider({ children }) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [ready, setReady] = useState(false);
//   const [token, setToken] = useState(() => localStorage.getItem('access_token') || null);
//   const [userId, setUserId] = useState(() => localStorage.getItem('user_id') || null);

//   const clearAndRedirect = () => {
//     try {
//       localStorage.removeItem('access_token');
//       localStorage.removeItem('user_id');
//       localStorage.removeItem('userData');
//       localStorage.removeItem('streak_current');
//       localStorage.removeItem('streak_lastActive');
//     } catch (e) {
//        console.warn('Failed clearing localStorage:', e);
//     }
//     setToken(null);
//     setUserId(null);
//     navigate('/otp1', { replace: true });
//   };

//   const PUBLIC_PATHS = new Set(['/']);

//   // Minimal guard: presence + local exp check only
//   useEffect(() => {
//     if (PUBLIC_PATHS.has(location.pathname)) {
//       setReady(true);
//       return;
//     }
//     const t = localStorage.getItem('access_token');
//     const uid = localStorage.getItem('user_id');
//     if (!t || !uid) {
//       clearAndRedirect();
//       setReady(true);
//       return;
//     }
//     const exp = decodeExp(t);
//     const now = Math.floor(Date.now() / 1000);
//     if (!exp || exp <= now) {
//       clearAndRedirect();
//       setReady(true);
//       return;
//     }
//     // Token looks valid locally; allow current route
//     setToken(t);
//     setUserId(uid);
//     setReady(true);
//   }, [location.pathname]);


//   const value = useMemo(
//     () => ({ token, userId, ready }),
//     [token, userId, ready]
//   );

//   if (!ready) {
//     return (
//       <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
//         <span>Loading…</span>
//       </div>
//     );
//   }

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }


import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';

const AuthContext = createContext(null);

function decodeExp(token) {
  if (!token) return 0;
  try {
    const [, payload] = token.split('.');
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof json.exp === 'number' ? json.exp : 0; // seconds since epoch
  } catch (err) {
    console.warn('JWT decode failed, treating as expired:', err);
    return 0;
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || null);
  const [userId, setUserId] = useState(() => localStorage.getItem('user_id') || null);

  const clearAndRedirect = () => {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('userData');
      localStorage.removeItem('streak_current');
      localStorage.removeItem('streak_lastActive');
    } catch (e) {
      console.warn('Failed clearing localStorage:', e);
    }
    setToken(null);
    setUserId(null);
    navigate('/otp1', { replace: true });
  };

  // Public welcome at '/'
  const PUBLIC_PATHS = new Set(['/']);

  // Minimal guard: presence + local exp check only
  useEffect(() => {
    if (PUBLIC_PATHS.has(location.pathname)) {
      // Do not redirect here; let the post-ready effect decide based on auth
      setReady(true);
      return;
    }

    const t = localStorage.getItem('access_token');
    const uid = localStorage.getItem('user_id');

    if (!t || !uid) {
      clearAndRedirect();
      setReady(true);
      return;
    }

    const exp = decodeExp(t);
    const now = Math.floor(Date.now() / 1000);
    if (!exp || exp <= now) {
      clearAndRedirect();
      setReady(true);
      return;
    }

    // Token looks valid locally; allow current route
    setToken(t);
    setUserId(uid);
    setReady(true);
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Promote authenticated users away from public "/" to "/diary"
  useEffect(() => {
    if (!ready) return;

    const t = localStorage.getItem('access_token');
    const uid = localStorage.getItem('user_id');
    const exp = decodeExp(t);
    const now = Math.floor(Date.now() / 1000);
    const isAuthed = !!t && !!uid && exp && exp > now;

    if (PUBLIC_PATHS.has(location.pathname) && isAuthed) {
      navigate('/diary', { replace: true });
    }
  }, [ready, location.pathname, navigate]);

  const value = useMemo(
    () => ({ token, userId, ready }),
    [token, userId, ready]
  );

  if (!ready) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <span>Loading…</span>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

// Guards

export function PrivateRoute({ children }) {
  const { ready } = useAuth();
  if (!ready) return null;

  const t = localStorage.getItem('access_token');
  const uid = localStorage.getItem('user_id');
  const exp = decodeExp(t);
  const now = Math.floor(Date.now() / 1000);
  const authed = !!t && !!uid && exp && exp > now;

  if (!authed) return <Navigate to="/otp1" replace />;
  return children;
}

export function PublicOnlyRoute({ children }) {
  const { ready } = useAuth();
  if (!ready) return null;

  const t = localStorage.getItem('access_token');
  const uid = localStorage.getItem('user_id');
  const exp = decodeExp(t);
  const now = Math.floor(Date.now() / 1000);
  const authed = !!t && !!uid && exp && exp > now;

  if (authed) return <Navigate to="/diary" replace />;
  return children;
}
