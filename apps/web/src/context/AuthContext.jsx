import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { UserService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const { isSignedIn, isLoaded, signOut } = useClerkAuth();
    const { user: clerkUser } = useUser();
    const [user, setUser] = useState(null); // Database User
    const [loading, setLoading] = useState(true);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchProfile = async () => {
            if (!isLoaded) return;

            if (!isSignedIn) {
                if (mounted) {
                    setUser(null);
                    setNeedsOnboarding(false);
                    setLoading(false);
                }
                return;
            }

            try {
                const { data } = await UserService.getProfile();
                if (mounted) {
                    setUser(data);
                    setNeedsOnboarding(false);
                }
            } catch (err) {
                if (err.response?.status === 404 || err.response?.data?.message === 'Hero not found') {
                    // Exists in Clerk, missing from DB. Must onboard!
                    if (mounted) {
                        setNeedsOnboarding(true);
                        setUser(null);
                    }
                } else {
                    console.error("Failed to fetch backend profile:", err);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchProfile();
        return () => { mounted = false; };
    }, [isSignedIn, isLoaded]);

    const onboard = async (username, selectedClass) => {
        try {
            const email = clerkUser?.primaryEmailAddress?.emailAddress || 'hero@flameroar.dev';
            const { data } = await UserService.onboard({
                username,
                email: email,
                selectedClass
            });
            setUser(data);
            setNeedsOnboarding(false);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || err.message };
        }
    };

    const logout = () => {
        signOut();
        setUser(null);
    };

    const value = {
        user,
        loading: loading || !isLoaded,
        needsOnboarding,
        onboard,
        logout,
        setUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
