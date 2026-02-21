import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ClientAuthContext = createContext();
const API = import.meta.env.VITE_API_URL;

const LS_CLIENT_TOKEN_KEY = 'clientToken';
const LS_CLIENT_KEY = 'client';

export function ClientAuthProvider({ children }) {
    const [clientToken, setClientToken] = useState(() => localStorage.getItem(LS_CLIENT_TOKEN_KEY));
    const [client, setClient] = useState(() => {
        try {
            const stored = localStorage.getItem(LS_CLIENT_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [clientLoading, setClientLoading] = useState(true);

    const persistClient = (value) => {
        setClient(value);
        if (value) localStorage.setItem(LS_CLIENT_KEY, JSON.stringify(value));
        else localStorage.removeItem(LS_CLIENT_KEY);
    };

    const clientLogin = (jwt, clientData) => {
        localStorage.setItem(LS_CLIENT_TOKEN_KEY, jwt);
        setClientToken(jwt);

        if (clientData) {
            persistClient(clientData);
        }
    };

    const clientLogout = useCallback(() => {
        localStorage.removeItem(LS_CLIENT_TOKEN_KEY);
        localStorage.removeItem(LS_CLIENT_KEY);
        setClientToken(null);
        setClient(null);
    }, []);

    const verifyClient = useCallback(async () => {
        setClientLoading(true);

        if (!clientToken) {
            persistClient(null);
            setClientLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API}/api/clients/me`, {
                headers: { Authorization: `Bearer ${clientToken}` },
            });

            let data = null;
            try {
                data = await res.json();
            } catch {
                data = null;
            }

            if (!res.ok) {
                clientLogout();
                setClientLoading(false);
                return;
            }

            persistClient(data?.client || null);
            setClientLoading(false);
        } catch {
            setClientLoading(false);
        }
    }, [API, clientToken, clientLogout]);

    useEffect(() => {
        verifyClient();
    }, [verifyClient]);

    return (
        <ClientAuthContext.Provider
            value={{
                clientToken,
                client,
                clientLoading,
                clientLogin,
                clientLogout,
                verifyClient,
            }}
        >
            {children}
        </ClientAuthContext.Provider>
    );
}

export function useClientAuth() {
    return useContext(ClientAuthContext);
}
