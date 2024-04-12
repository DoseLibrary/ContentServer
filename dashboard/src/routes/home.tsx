import GridCard from "../core/grid-card/grid-card";
import { MdMovie, MdTv, MdDvr, MdGroup } from 'react-icons/md';
import { StreamActivity } from "../features/streamActivity/StreamActivity";
import { Statistics } from "../features/statistics/Statistics";

const Home = () => {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GridCard title="Movies" value="34" icon={MdMovie} color="text-blue-500" />
        <GridCard title="Shows" value="1" icon={MdTv} color="text-blue-500" />
        <GridCard title="Episodes" value="1744" icon={MdDvr} color="text-blue-500" />
        <GridCard title="Users" value="1" icon={MdGroup} color="text-blue-500" />
      </div>
      <StreamActivity />
      <Statistics />
    </div>
  )
};

export default Home;
