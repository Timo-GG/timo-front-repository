import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebars/Sidebar';

export default function ContentLayout() {
  return (
    <>
      <div className={`flex flex-row gap-16`}>
        <Sidebar />
        <Outlet />
      </div>
    </>
  );
}
