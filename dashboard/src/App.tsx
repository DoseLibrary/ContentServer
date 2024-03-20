import React from "react"
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import "./App.css"
import Root from "./routes/root";
import Home from "./routes/home";
import { SetupMain } from "./routes/setup";
import Database from "./features/setup/database";

const router = createBrowserRouter(
  createRoutesFromElements(
    [
      <Route path="/" element={<Root />}>
        <Route path="/home" element={<Home />} />
      </Route>,
      <Route path="/setup" element={<SetupMain />}>
        <Route path="/setup/database" element={<Database />} />
      </Route>
    ]
  )
);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
