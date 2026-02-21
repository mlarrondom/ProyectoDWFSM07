import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const AuthContext = createContext();
const API = import.meta.env.VITE_API_URL;

const LS_TOKEN_KEY = 'token';
const LS_USER_KEY = 'user';

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
    };

    const logout = useCallback(() => {
        localStorage.removeItem(LS_TOKEN_KEY);
        localStorage.removeItem(LS_USER_KEY);
        setToken(null);
        setUser(null);
    }, []);

    const verify = useCallback(async () => {
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

            let data = null;
            try {
                data = await res.json();
            } catch {
                data = null;
            }

            if (!res.ok) {
                logout();
                setLoading(false);
                return;
            }

            const normalizedUser = data?.user ? data.user : data;

            persistUser(normalizedUser);
            setLoading(false);
        } catch {
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
                verify,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
