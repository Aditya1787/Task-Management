import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
