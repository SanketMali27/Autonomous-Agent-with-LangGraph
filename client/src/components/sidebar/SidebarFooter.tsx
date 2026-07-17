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
        <div className="border-t p-4 space-y-3">

            <div className="text-sm">
                👤 {username ?? "User"}
            </div>

            <Button
                variant="danger"
                className="w-full"
                onClick={onLogout}
            >
                Logout
            </Button>

        </div>
    );
}