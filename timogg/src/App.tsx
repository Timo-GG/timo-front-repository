import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Router from './pages/Router.tsx';
import Sidebar from './components/sidebars/Sidebar.tsx';
import { BrowserRouter, HashRouter } from 'react-router-dom';

let queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex h-screen">
          {/* 콘텐츠 영역 */}
          <Router />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
