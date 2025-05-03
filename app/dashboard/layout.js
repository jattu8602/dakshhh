import DashboardLayout from '../components/DashboardLayout';

export const metadata = {
  title: 'Dashboard - School Management System',
  description: 'Manage schools, classes, and students',
};

export default function Layout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}