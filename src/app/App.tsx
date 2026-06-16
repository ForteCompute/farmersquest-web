import { RouterProvider } from 'react-router-dom';
import { SessionProvider } from './session';
import { router } from './router';

// The application root: session (role) context wrapping the router. Theme is applied once in
// main.tsx before render.
export function App() {
  return (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  );
}
