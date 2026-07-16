import Sidebar from "../components/sidebar/Sidebar";

interface Props {
    children: React.ReactNode;
}

export default function DashboardLayout({
    children,
}: Props) {

    return (

        <div
            style={{
                display: "flex",
                height: "100vh",
            }}
        >

            <Sidebar />

            <main
                style={{
                    flex: 1,
                    padding: "20px",
                }}
            >
                {children}
            </main>

        </div>

    );

}