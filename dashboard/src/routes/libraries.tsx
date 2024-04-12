import { MdMovie, MdTv, MdAdd } from "react-icons/md";
import { SimpleButton } from "../core";

const Libraries = () => {
  const openDrawer = () => {
    console.log('open drawer');
    const drawer = document.getElementById('drawer-right-example');
    drawer?.classList.remove('translate-x-full');
  }

  const closeDrawer = () => {
    console.log('close drawer');
    const drawer = document.getElementById('drawer-right-example');
    drawer?.classList.add('translate-x-full');
  }

  const toggleDropdown = () => {
    const dropdown = document.getElementById('dropdown');
    dropdown?.classList.toggle('hidden');
  }

  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
            <li className="me-2">
                <a href="#" className="inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group">
                    <MdMovie /><span className="ml-2">Movie something bla</span>
                </a>
            </li>
            <li className="me-2">
                <a href="#" className="inline-flex items-center justify-center p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500 group" aria-current="page">
                    <MdTv /><span className="ml-2">Show something bla</span>
                </a>
            </li>
            <li className="me-2">
                <button onClick={() => openDrawer()} className="inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group">
                    <MdAdd className="w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300" />
                    Add
                </button>
            </li>
        </ul>

    </div>
    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-6 py-3">
                        Title
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Added Date
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Release Date
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Playback Time
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        Iron Man
                    </th>
                    <td className="px-6 py-4">
                        123333
                    </td>
                    <td className="px-6 py-4">
                        1233344333
                    </td>
                    <td className="px-6 py-4">
                        4433
                    </td>
                </tr>
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        Tenet
                    </th>
                    <td className="px-6 py-4">
                        123333
                    </td>
                    <td className="px-6 py-4">
                        1233344333
                    </td>
                    <td className="px-6 py-4">
                        4433
                    </td>
                </tr>
                <tr>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        Back to the future
                    </th>
                    <td className="px-6 py-4">
                        123333
                    </td>
                    <td className="px-6 py-4">
                        1233344333
                    </td>
                    <td className="px-6 py-4">
                        4433
                    </td>
                </tr>
            </tbody>
        </table>

        <div id="drawer-right-example" className="shadow fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform translate-x-full bg-white w-80 dark:bg-gray-800" aria-labelledby="drawer-right-label">
            <h5 id="drawer-right-label" className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">Add Library</h5>
          <button onClick={() => closeDrawer()} type="button" data-drawer-hide="drawer-right-example" aria-controls="drawer-right-example" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" >
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
              <span className="sr-only">Close menu</span>
          </button>
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
            <input type="text" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Movies" required />
          </div>

          <p className="block mb-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Library Type</p>
          <div className="flex items-center mb-2">
              <input id="default-radio-1" type="radio" value="" name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
              <label htmlFor="default-radio-1" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Movies</label>
          </div>
          <div className="flex items-center">
              <input checked id="default-radio-2" type="radio" value="" name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
              <label htmlFor="default-radio-2" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Shows</label>
          </div>

          <div>
            <label htmlFor="path" className="block mb-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Path</label>
            <input type="text" id="path" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="/mnt/media/movies" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-5">
              <SimpleButton onClick={() => console.log('clicked')}>Add Library</SimpleButton>
          </div>
        </div>
    </div>
  )
};

export default Libraries;
