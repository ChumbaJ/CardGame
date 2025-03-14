import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router';
import router from './pages/router.tsx';
import Provider from './shared/Contexts/Provider.tsx';

createRoot(document.getElementById('root')!).render(
    <Provider>
        <RouterProvider router={router} />
    </Provider>
);
