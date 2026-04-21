import { auth } from "@/services/firebase";
import { redirect } from "@tanstack/react-router";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { createContext, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  avatar: string;
};

type AuthContextType = {
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export const AuthContext = createContext({} as AuthContextType);

type AuthContextProp = {
  children: React.ReactNode;
};

export const AuthContextProvider = ({ children }: AuthContextProp) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        setIsLoading(false);
        if (result?.user) {
          const redirectPath = sessionStorage.getItem("redirectAfterLogin");
          if (redirectPath) {
            sessionStorage.removeItem("redirectAfterLogin");
            window.location.href = redirectPath;
          }
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Redirect auth error", error);
        toast.error("Erro ao tentar fazer login");
      });

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const { displayName, uid, photoURL } = user;

        if (!displayName || !photoURL) {
          toast.error("Missing information from Google Account");
          return;
        }

        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    try {
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          const { displayName, uid, photoURL } = result.user;

          if (!displayName || !photoURL) {
            toast.error("Missing information from Google Account");
            return;
          }

        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL,
        });
        setIsLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Erro ao realizar login");
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null);
    redirect({
      to: "/home",
      replace: true,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithGoogle,
        signOut,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
