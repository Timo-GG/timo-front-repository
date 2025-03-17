import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Router from './pages/Router.tsx';
import Sidebar from './components/sidebars/Sidebar.tsx';
import { BrowserRouter } from 'react-router-dom';

let queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex h-screen">
          {/* 사이드바 (토글 가능) */}
          <div className={`transition-width duration-300`}>
            <Sidebar />
          </div>

          {/* 콘텐츠 영역 */}
          <div>
            <Router />
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
