import DashBoardPage from "@/components/pages/dashboard/admin/DashBoardPage";
import APP_INFO from "@/lib/CONSTANTS/APP_INFO";

export const metadata = {
    title: `Admin Dashboard | ${APP_INFO.NAME}`,
    description: "Admin dashboard for managing the application.",
};


export default function Page() {
    return <DashBoardPage />;
}
