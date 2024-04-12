import { MdCode, MdCompare, MdOutlineSchedule, MdOutlineSettings, MdSystemUpdateAlt } from "react-icons/md";

const SettingsJobs = () => {
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
                        <div className="text-lg font-medium text-gray-800 dark:text-gray-100">Scheduled Jobs</div>
                    </div>
                    <div className="p-4">
                        <div className="flex flex-row items-center justify-between">
                            <div className="flex flex-col">
                                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Transcode</div>
                                <div className="text-xs text-gray-500 dark text-gray-400">Every 24 hours</div>
                                <div className="text-xs text-gray-500 dark text-gray-400">Last run: 2 hours ago</div>
                                <div className="text-xs text-gray-500 dark text-gray-400">Next run: 22 hours</div>
                            </div>
                            <div className="text-xs text-green-500 dark:text-green-400">Running</div>
                            <button className="text-blue-600 dark:text-blue-500">Edit</button>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex flex-row items-center justify-between">
                            <div className="flex flex-col">
                                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Trailer Download</div>
                                <div className="text-xs text-gray-500 dark text-gray-400">Every 24 hours</div>
                                <div className="text-xs text-gray-500 dark text-gray-400">Last run: 3 hours ago</div>
                                <div className="text-xs text-gray-500 dark text-gray-400">Next run: 21 hours</div>
                            </div>
                            <div className="text-xs text-red-500 dark:text-red-400">Stopped</div>
                            <button className="text-blue-600 dark:text-blue-500">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
};

export default SettingsJobs;
