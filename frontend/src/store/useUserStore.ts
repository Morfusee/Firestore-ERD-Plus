import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface IUser {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  profilePicture?: string;
  token: string;
}

interface IUserState {
  currentUser: IUser | null;
}

interface IUserActions {
  getCurrentUser: () => IUser | null
  setCurrentUser: (user: IUser | null) => void;
  setProfileImage: (image: string) => void;
}

export const useUserStore = create<IUserState & IUserActions>()(
  devtools(
    (set, get) => ({
      currentUser: null,
      getCurrentUser: () => get().currentUser,
      setCurrentUser: (user) => set(() => ({ currentUser: user })),
      setProfileImage: (image) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, profileImage: image }
            : null,
        })),
    }),
    {
      name: "userStore",
    }
  )
);
