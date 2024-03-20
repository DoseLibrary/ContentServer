import GridCard from "../core/grid-card/grid-card";
import { MdMovie } from 'react-icons/md';

const Home = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <GridCard title="Total Shows" value="304" icon={MdMovie} color="text-blue-500" />
      <GridCard title="Total Movies" value="34" icon={MdMovie} color="text-blue-500" />
      <GridCard title="Total Episodes" value="1744" icon={MdMovie} color="text-blue-500" />
      <GridCard title="Users" value="1" icon={MdMovie} color="text-blue-500" />
    </div>
  )
};

export default Home;
