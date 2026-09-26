import { useState } from "react";
import { Bot } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import { useAuthStore } from "../store/authStore";

const fieldClass = "mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15";

export default function Login() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const loading = useAuthStore((state) => state.loading);
    const error = useAuthStore((state) => state.error);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await login(email, password);
        if (useAuthStore.getState().isAuthenticated()) navigate("/");
    };

    return (
        <AuthShell
            icon={<Bot size={22} />}
            title="Welcome back"
            description="Sign in to continue your research workspace."
            footer={<>New here? <Link to="/signup" className="font-medium text-blue-300 transition hover:text-blue-200">Create an account</Link></>}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm font-medium text-slate-300">
                    Email
                    <input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} required />
                </label>
                <label className="block text-sm font-medium text-slate-300">
                    Password
                    <input type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass} required />
                </label>

                {error && <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">{error}</div>}

                <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/25 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
                    {loading ? "Signing in…" : "Sign in"}
                </button>
            </form>
        </AuthShell>
    );
}
