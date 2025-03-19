import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';

export default function OuterLayout() {
  return (
    <div className="flex flex-col">
      <Header />
      <Outlet />
    </div>
  );
}
