import { Link, Outlet } from "react-router-dom";

const Root = () => {
  return (
    <div className="flex">
      <div className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-center h-12 text-2xl font-bold text-gray-900 dark:text-white font-roboto">
          Dose
        </div>

        <ul className="space-y-2 font-medium text-gray-900 dark:text-white">
          <li>
            <Link to={"/"} className="block p-4 transition-colors duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Home</Link>
            <Link to={"/libraries"} className="block p-4 transition-colors duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Libraries</Link>
            <Link to={"/users"} className="block p-4 transition-colors duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Users</Link>
            <Link to={"/plugins"} className="block p-4 transition-colors duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Plugins</Link>
            <Link to={"/integrations"} className="block p-4 transition-colors duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Integrations</Link>
            <Link to={"/logs"} className="block p-4 transition-colors duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Logs</Link>
            <Link to={"/settings"} className="block p-4 transition-colors duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Settings</Link>
          </li>
        </ul>
      </div>
      <div className="flex-grow ml-64 dark:bg-gray-900 h-screen w-screen p-14">
        <Outlet />
      </div>
    </div>
  )
};

export default Root;
