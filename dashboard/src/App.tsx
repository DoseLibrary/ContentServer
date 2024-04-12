import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, RouteProps, PathRouteProps, RouteObject } from 'react-router-dom';
import "./App.css"
import Root from "./routes/root";
import Home from "./routes/home";
import Users from "./routes/users";
import Libraries from "./routes/libraries";
import Settings from "./routes/settings";
import SettingsJobs from "./routes/settings.jobs";
import SettingsPlugins from './routes/settings.plugins';
import Claim from './routes/claim';
import { ProtectedRoute } from './routes/ProtectedRoute';
import AuthProvider from './provider/authProvider';

const routesForPublic: RouteObject[]  = [{
  path: "/claim",
  element: <Claim />,
}];

const routesForAuthenticated: RouteObject[] = [
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/libraries",
        element: <Libraries />,
      },
      {
        path: "/users",
        element: <Users />,
      },
      {
        path: "/settings",
        element: <Settings />,
        children: [
          {
            path: "/settings/jobs",
            element: <SettingsJobs />,
          },
          {
            path: "/settings/plugins",
            element: <SettingsPlugins />,
          }
        ]
      }
    ]
  }
];

const router = createBrowserRouter([...routesForPublic, ...routesForAuthenticated]);

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
