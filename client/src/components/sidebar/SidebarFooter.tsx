import { LogOut } from "lucide-react";
import Button from "../ui/Button";

interface Props {
    username?: string;
    onLogout: () => void;
}

export default function SidebarFooter({
    username,
    onLogout,
}: Props) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-blue-200">
                    {(username ?? "U")[0].toUpperCase()}
                </div>

                <div className="min-w-0 overflow-hidden">
                    <p className="truncate text-sm font-medium text-white">
                        {username ?? "User"}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">Signed in</p>
                </div>
            </div>

            <Button
                variant="danger"
                aria-label="Log out"
                title="Log out"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
                onClick={onLogout}
            >
                <LogOut size={17} />
            </Button>
        </div>
    );
}
