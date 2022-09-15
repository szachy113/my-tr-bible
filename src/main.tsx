import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from '@app/App';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router basename="my-tr-bible">
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/:language" element={<App />} />
          <Route path="/:language/:version" element={<App />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  </React.StrictMode>,
);
