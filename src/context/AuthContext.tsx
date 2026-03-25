import { auth } from "@/services/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
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
};

export const AuthContext = createContext({} as AuthContextType);

type AuthContextProp = {
  children: React.ReactNode;
};

export const AuthContextProvider = ({ children }: AuthContextProp) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
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
    const provider = new GoogleAuthProvider();
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
    }
  }, []);

  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
