import { ReactNode } from 'react';
import { MdMovie, MdTv, MdPlayArrow, MdPause } from 'react-icons/md';

export type StreamCardProps = {
  title: string;
  backdrop: string;
  poster: string;
  quality: string;
  playback: "PLAYING" | "PAUSED";
  user: string;
  currentPlaybackTime: number;
  playbackTime: number;
  
};

const parseTime = (time: number) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60); // Modified line
  return `${hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
}

const StreamCard = ({ title, backdrop, poster, quality, playback, playbackTime, currentPlaybackTime, user }: StreamCardProps) => {
  return (
    <div className="overflow-hidden shadow rounded-lg w-[24rem] h-[12.2rem] relative" >
      <div className="w-full h-full bg-cover blur-[2px] brightness-50 absolute top-0 left-0" style={{backgroundImage: "url(" + backdrop + ")"}}>
      </div>
      
      <div className="w-[7rem] h-[11rem] m-2 bg-cover absolute top-0" style={{backgroundImage: "url(" + poster + ")"}}></div>
      <div className="absolute m-2 right-1 top-1">
        <div className="bg-blue-500 text-white p-1 rounded-lg text-xs">
          {playback === "PLAYING" ? <MdPlayArrow /> : <MdPause />}
        </div>
      </div>

      <div className="absolute m-2 top-9 left-[6.3rem] flex-row">
        <div className="flex flex-column w-64 text-s">
          <span className='text-gray-300 basis-1/3 text-right p-1 drop-shadow-md'>TITLE</span><span className='text-gray-200 basis-2/3 p-1 drop-shadow-md'>{title}</span> 
        </div>
        <div className="flex flex-column w-64 text-s">
          <span className='text-gray-300 basis-1/3 text-right p-1 drop-shadow-md'>STREAM</span><span className='text-gray-200 basis-2/3 p-1 drop-shadow-md'>{quality}</span> 
        </div>
        <div className="flex flex-column w-64 text-s">
          <span className='text-gray-300 basis-1/3 text-right p-1 drop-shadow-md'>USER</span><span className='text-gray-200 basis-2/3 p-1 drop-shadow-md'>{user}</span> 
        </div>
        <div className="flex flex-column w-64 text-s">
          <span className='text-gray-300 basis-1/3 text-right p-1 drop-shadow-md'>TIME</span><span className='text-gray-200 basis-2/3 p-1 '>{parseTime(currentPlaybackTime)}/{parseTime(playbackTime)}</span> 
        </div>
      </div>
      <div className="w-full bg-gray-200 h-1.5 dark:bg-gray-700 bottom-0 absolute">
        <div className="bg-blue-500 h-1.5" style={{width: currentPlaybackTime / playbackTime * 100 + "%"}}></div>
      </div>
    </div>
  );
}

export default StreamCard;
