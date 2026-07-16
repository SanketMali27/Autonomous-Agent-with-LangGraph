import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

export default function Signup() {
    const navigate = useNavigate();

    const signup = useAuthStore((state) => state.signup);
    const loading = useAuthStore((state) => state.loading);
    const error = useAuthStore((state) => state.error);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [validationError, setValidationError] =
        useState("");

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setValidationError("");

        if (password !== confirmPassword) {
            setValidationError(
                "Passwords do not match"
            );
            return;
        }

        await signup(
            email,
            username,
            password
        );

        if (!useAuthStore.getState().error) {
            navigate("/login");
        }
    };

    return (
        <div>
            <h1>Create Account</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                />

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

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) =>
                        setConfirmPassword(
                            e.target.value
                        )
                    }
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Creating Account..."
                        : "Create Account"}
                </button>

            </form>

            {validationError && (
                <p>{validationError}</p>
            )}

            {error && (
                <p>{error}</p>
            )}

            <p>
                Already have an account?{" "}
                <Link to="/login">
                    Login
                </Link>
            </p>

        </div>
    );
}