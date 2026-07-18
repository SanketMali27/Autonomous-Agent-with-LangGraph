import api from "./axios";


export interface SignupRequest {
    email: string;
    username: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface User {
    id: string;
    email: string;
    username: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export const signup = async (
    data: SignupRequest
) => {
    try {
        const response = await api.post(
            "/auth/signup",
            data
        );

        return response.data;
    } catch (error) {
        console.error("Signup error:", error);
        throw error;
    }
};

export const login = async (
    data: LoginRequest
): Promise<TokenResponse> => {
    console.log("Sending login request with data:", data);
    try {
        const response =
            await api.post<TokenResponse>(
                "/auth/login",
                data
            );
        console.log("Login response:", response);
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");

    return response.data;
};