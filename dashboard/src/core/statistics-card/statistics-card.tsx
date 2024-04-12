import { ReactNode } from 'react';
import { MdMovie, MdTv, MdPlayArrow, MdPause } from 'react-icons/md';
import { Statistic } from '../../types/Statistic';
import { IconType } from 'react-icons/lib';
import React from 'react';


export type StatisticsCardProps = {
  title: string;
  poster: string | undefined;
  backdrop: string | undefined;
  icon: IconType | undefined;
  countLabel: string;
  items: Statistic[];
};

const StatisticsCard = ({ title, countLabel, items, backdrop=undefined, poster=undefined, icon=undefined}: StatisticsCardProps) => {
  return (
    <div className="overflow-hidden shadow text-gray rounded-lg w-[32rem] h-[15rem] relative" >
      {backdrop ? (
        <div className="w-full h-full bg-cover blur-[2px] brightness-50 absolute top-0 left-0" style={{backgroundImage: "url(" + backdrop + ")"}}>
        </div>
      ) : (
        <div className="w-full h-full dark:bg-gray-800 absolute top-0 left-0"></div>
      )}

      {poster ? (
        <div className="w-[7rem] h-[11rem] m-2 bg-cover absolute top-6" style={{backgroundImage: "url(" + poster + ")"}}></div>
      ) : (
        <div className="absolute top-14 left-2 m-2 text-blue-500">
          {icon && icon({ size: 96 })}
        </div>
      )}
      
      <div className={`absolute m-2 left-32 top-2 text-xl dark:text-gray-200 ${backdrop !== undefined ? "text-gray-200" : "text-black"}`}>
        {title}
      </div>
      <div className={`absolute m-2 right-1 top-2 text-xl dark:text-gray-200 ${backdrop !== undefined ? "text-gray-200" : "text-black"}`}>
        {countLabel}
      </div>
      <hr className="absolute m-2 left-32 top-9 w-[23rem] dark:text-gray-500" />

      <div className="absolute m-2 top-10 left-32 flex-row">
        {items.map((item, index) => (
          <div key={index} className="flex flex-column w-[22.6rem] text-s">
            <span className={`${backdrop !== undefined ? "text-gray-200" : "text-black dark:text-gray-200"} basis-2/3 text-left p-1 drop-shadow-md ${index === 0 ? 'text-xl font-semibold' : ''}`}>{item.label}</span><span className={`${backdrop !== undefined ? "text-gray-200" : "text-black dark:text-gray-200"} basis-1/3 p-1 text-right drop-shadow-md ${index === 0 ? 'text-xl font-semibold' : ''}`}>{item.value}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default StatisticsCard;
