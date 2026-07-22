import { create } from "zustand";

import {
    login as loginApi,
    signup as signupApi,
    getCurrentUser,
    type User,
} from "../api/auth.api";
import { getApiErrorMessage } from "../lib/apiError";



interface AuthStore {

    user: User | null;

    token: string | null;

    loading: boolean;

    error: string | null;
    initialize: () => Promise<void>;

    login: (
        email: string,
        password: string
    ) => Promise<void>;

    signup: (
        email: string,
        username: string,
        password: string
    ) => Promise<void>;

    logout: () => void;

    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({

    user: null,

    token: localStorage.getItem("token"),

    loading: false,

    error: null,

    initialize: async () => {

        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        try {

            const user = await getCurrentUser();

            set({
                token,
                user,
            });

        } catch {

            localStorage.removeItem("token");

            set({
                token: null,
                user: null,
            });

        }

    },

    login: async (
        email,
        password,
    ) => {

        try {

            set({
                loading: true,
                error: null,
            });
            const response = await loginApi({
                email,
                password,
            });

            localStorage.setItem(
                "token",
                response.access_token
            );

            set({
                token: response.access_token,
                user: response.user,

                loading: false,
            });

        } catch (error) {

            set({
                loading: false,
                error: getApiErrorMessage(error, "Login failed. Please check your credentials."),
            });

        }

    },


    signup: async (
        email,
        username,
        password,
    ) => {
        try {
            set({
                loading: true,
                error: null,
            });
            await signupApi({
                email,
                username,
                password,
            });
            set({
                loading: false,

            });
        } catch (error) {
            set({
                loading: false,
                error: getApiErrorMessage(error, "Signup failed. Please try again."),
            });
        }
    },
    logout: () => {
        localStorage.removeItem("token");
        set({
            token: null,
            user: null,
        });
    },
    isAuthenticated: () => {
        return get().token !== null;
    },
}));
