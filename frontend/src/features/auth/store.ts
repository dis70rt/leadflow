import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface DemoUser {
  name: string;
  email: string;
}
interface AuthState {
  user: DemoUser | null;
  signIn: (user: DemoUser) => void;
  signOut: () => void;
}
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
    }),
    {
      name: "leadflow-demo-session",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
    },
  ),
);
