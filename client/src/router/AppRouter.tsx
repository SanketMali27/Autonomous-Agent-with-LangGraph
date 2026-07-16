import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Chat from "../pages/Chat";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/signup"
                    element={<Signup />}
                />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>

                            <DashboardLayout>

                                <Chat />

                            </DashboardLayout>

                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>

    );

}