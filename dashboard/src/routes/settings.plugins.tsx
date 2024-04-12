import { MdCode, MdCompare, MdOutlineSchedule, MdOutlineSettings, MdSystemUpdateAlt } from "react-icons/md";
import { PosterCard } from "../core";

const SettingsPlugins = () => {
  return (
    <div className="flex flex-col">
        <div className="w-full border-b border-gray-200 dark:border-gray-700">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                <li className="me-2">
                    <a href="/settings" className="inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group">
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
                    <a href="/settings/jobs" className="inline-flex items-center justify-center p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500 group" aria-current="page">
                        <MdOutlineSchedule /><span className="ml-2">Jobs</span>
                    </a>
                </li>
                <li className="me-2">
                    <a href="#" className="inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group">
                        <MdCode /><span className="ml-2">API</span>
                    </a>
                </li>
            </ul>
        </div>
        <div className="flex flex-row">
            <div className="w-1/3">
                <div className="flex flex-col">
                    <div className="flex flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="text-lg font-medium text-gray-800 dark:text-gray-100">Official Plugins</div>
                    </div>
                    <div className="flex flex-col p-4">
                        <div className="flex flex-row items-center justify-between">
                            <div className="text-lg font-medium text-gray-800 dark:text-gray-100">
                                <span className="font-medium">YouTube</span><span className="ml-2 text-xs">1.3.1</span>
                                <div className="text-sm text-gray-500 dark:text-gray-400">YouTube plugin for Dose</div>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <button className="mt-2 text-2xl text-white rounded-md p-2"><MdOutlineSettings /></button>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col p-4">
                        <div className="flex flex-row items-center justify-between">
                            <div className="text-lg font-medium text-gray-800 dark:text-gray-100">
                                <span className="font-medium">Vimeo</span><span className="ml-2 text-xs">1.3.1</span>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Vimeo plugin for Dose</div>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <button className="mt-2 text-2xl text-white rounded-md p-2"><MdOutlineSettings /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
};

export default SettingsPlugins;
