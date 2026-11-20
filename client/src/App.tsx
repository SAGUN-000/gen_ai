 // src/routes/AppRouter.tsx
import { createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import ChatInterface from "./components/ChatInterface";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import ProtectedRoute from "./routes/ProtectedRoutes";
import PublicRoute from "./routes/publicRoutes";
 
function App(){

  const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <ChatInterface />,
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

return <RouterProvider router={router} />;

}


export default App;