import { useState } from "react";
import { Rocket } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import { useAuthStore } from "../store/authStore";

const fieldClass = "mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15";

export default function Signup() {
    const navigate = useNavigate();
    const signup = useAuthStore((state) => state.signup);
    const loading = useAuthStore((state) => state.loading);
    const error = useAuthStore((state) => state.error);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationError, setValidationError] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setValidationError("");
        if (password !== confirmPassword) {
            setValidationError("Passwords do not match.");
            return;
        }
        await signup(email, username, password);
        if (!useAuthStore.getState().error) navigate("/login");
    };

    return (
        <AuthShell
            icon={<Rocket size={22} />}
            title="Create your workspace"
            description="Set up an account to research, analyze, and revisit your conversations."
            footer={<>Already have an account? <Link to="/login" className="font-medium text-blue-300 transition hover:text-blue-200">Sign in</Link></>}
        >
            <form onSubmit={handleSubmit} className="space-y-3.5">
                <label className="block text-sm font-medium text-slate-300">
                    Username
                    <input type="text" autoComplete="username" placeholder="Your name" value={username} onChange={(event) => setUsername(event.target.value)} className={fieldClass} required />
                </label>
                <label className="block text-sm font-medium text-slate-300">
                    Email
                    <input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} required />
                </label>
                <label className="block text-sm font-medium text-slate-300">
                    Password
                    <input type="password" autoComplete="new-password" placeholder="Create a password" value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass} required />
                </label>
                <label className="block text-sm font-medium text-slate-300">
                    Confirm password
                    <input type="password" autoComplete="new-password" placeholder="Repeat your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={fieldClass} required />
                </label>

                {(validationError || error) && <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">{validationError || error}</div>}

                <button type="submit" disabled={loading} className="mt-1 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/25 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
                    {loading ? "Creating account…" : "Create account"}
                </button>
            </form>
        </AuthShell>
    );
}
