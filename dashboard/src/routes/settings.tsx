import { MdOutlineSettings, MdCompare, MdSystemUpdateAlt, MdOutlineSchedule ,MdCode } from "react-icons/md";

const Settings = () => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
            <li className="me-2">
                <a href="/settings" className="inline-flex items-center justify-center p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500 group" aria-current="page">
                    <MdOutlineSettings /><span className="ml-2">General</span>
                </a>
            </li>
            <li className="me-2">
                <a href="#" className="inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group">
                    <MdCompare /><span className="ml-2">Transcoding</span>
                </a>
            </li>
            <li className="me-2">
                <a href="#" className="inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group">
                    <MdSystemUpdateAlt /><span className="ml-2">Updates</span>
                </a>
            </li>
            <li className="me-2">
                <a href="/settings/jobs" className="inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group">
                    <MdOutlineSchedule /><span className="ml-2">Jobs</span>
                </a>
            </li>
            <li className="me-2">
                <a href="#" className="inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group">
                    <MdCode /><span className="ml-2">Plugins</span>
                </a>
            </li>
            <li className="me-2">
                <a href="#" className="inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group">
                    <MdCode /><span className="ml-2">API</span>
                </a>
            </li>
        </ul>
    </div>
  )
};

export default Settings;
