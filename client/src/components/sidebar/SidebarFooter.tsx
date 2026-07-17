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
        <div className="space-y-4">

            <div className="flex items-center gap-3 rounded-xl bg-slate-800/70 p-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 font-semibold text-white">
                    {(username ?? "U")[0].toUpperCase()}
                </div>

                <div className="overflow-hidden">
                    <p className="text-xs text-slate-400">
                        Logged in as
                    </p>

                    <p className="truncate font-medium text-white">
                        {username ?? "User"}
                    </p>
                </div>

            </div>

            <Button
                variant="danger"
                className="w-full rounded-xl py-3 transition-all duration-300 hover:scale-[1.02]"
                onClick={onLogout}
            >
                🚪 Logout
            </Button>

        </div>
    );
}