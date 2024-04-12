export type PosterCardProps = {
  title: string;
  subTitle: string;
  poster: string;
};

const PosterCard = ({ title, subTitle, poster}: PosterCardProps) => {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg w-32 items-center text-left" >
      <div className="w-32 h-48 bg-cover" style={{backgroundImage: "url(" + poster + ")"}}>
      </div>
      <div className="self-start mt-1 w-32 text-s truncate dark:text-gray-100">
        {title}
      </div>
      <div className="self-start text-xs truncate dark:text-gray-300">
        {subTitle}
      </div>
    </div>
  );
}

export default PosterCard;
