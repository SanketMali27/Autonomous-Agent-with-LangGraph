import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

export default function Login() {
    const navigate = useNavigate();

    const login = useAuthStore((state) => state.login);
    const loading = useAuthStore((state) => state.loading);
    const error = useAuthStore((state) => state.error);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        await login(email, password);

        if (useAuthStore.getState().isAuthenticated()) {
            navigate("/");
        }
    };

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

            </form>

            {error && (
                <p>{error}</p>
            )}

            <p>
                Don't have an account?{" "}
                <Link to="/signup">
                    Signup
                </Link>
            </p>

        </div>
    );
}