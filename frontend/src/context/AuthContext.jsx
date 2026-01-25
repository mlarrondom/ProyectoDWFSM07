import { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthContext = createContext();
const API = import.meta.env.VITE_API_URL;

const LS_TOKEN_KEY = "token";
const LS_USER_KEY = "user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(LS_TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const persistUser = (value) => {
    setUser(value);
    if (value) localStorage.setItem(LS_USER_KEY, JSON.stringify(value));
    else localStorage.removeItem(LS_USER_KEY);
  };

  const login = (jwt) => {
    localStorage.setItem(LS_TOKEN_KEY, jwt);
    setToken(jwt);
    // Importante: al cambiar token, verify() se encargará de setear user
  };

  const logout = useCallback(() => {
    localStorage.removeItem(LS_TOKEN_KEY);
    localStorage.removeItem(LS_USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const verify = useCallback(async () => {
    // Mientras verificamos, bloqueamos redirecciones (ProtectedRoute debe respetar loading)
    setLoading(true);

    if (!token) {
      persistUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/user/verifytoken`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // OJO: algunos backends pueden devolver vacío o texto; protegemos el parse
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        // Token inválido o expirado
        logout();
        setLoading(false);
        return;
      }

      // Normalizamos: si viene { user: {...} } o viene directo {...}
      const normalizedUser = data?.user ? data.user : data;

      persistUser(normalizedUser);
      setLoading(false);
    } catch {
      // Si hay error de red (backend caído), NO necesariamente quieres botar sesión.
      // Pero para evitar estados inconsistentes, dejamos user como estaba y solo terminamos loading.
      // Si prefieres “modo estricto” (logout), dime y lo cambiamos.
      setLoading(false);
    }
  }, [API, token, logout]);

  useEffect(() => {
    verify();
  }, [verify]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
        verify, // útil para refrescar manualmente si lo necesitas
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
