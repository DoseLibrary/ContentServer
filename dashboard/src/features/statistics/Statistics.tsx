import styles from "./statistics.module.css"

import { StatisticsCard, PosterCard } from "../../core";
import { Statistic } from "../../types/Statistic";
import { MdMovie, MdTv } from "react-icons/md";


const movieStatistics: Statistic[] = [
  { label: "Back to the Future", value: "12" },
  { label: "Tenet", value: "10" },
  { label: "Iron Man 3", value: "8" },
  { label: "Avatar", value: "6" },
  { label: "Thor: Ragnarok", value: "4" },
]

const showStatistics: Statistic[] = [
  { label: "The Flash", value: "12" },
]

const categoryStatistics: Statistic[] = [
  { label: "Action", value: "12" },
  { label: "Comedy", value: "10" },
  { label: "Drama", value: "8" },
  { label: "Thriller", value: "6" },
  { label: "Horror", value: "4" },
]

const showCategoryStatistics: Statistic[] = [
  { label: "Comedy", value: "18" },
  { label: "Action", value: "14" },
  { label: "Thriller", value: "8" },
  { label: "Drama", value: "3" },
  { label: "Horror", value: "2" },
]


export const Statistics = () => {
  return (
    <div className="mt-5">
      <h1 className="text-2xl mb-5 dark:text-gray-200">Statistics</h1>
      <div className={styles.row}>
        <StatisticsCard title={"Most Watched Movies"} items={movieStatistics} countLabel={"Played"} backdrop={"https://i0.wp.com/goldrecordoutlet.com/wp-content/uploads/2020/08/back-to-the-future1.jpeg?fit=1365%2C728&ssl=1"} poster={"https://static.posters.cz/image/1300/poster/back-to-the-future-i152504.jpg"} />
        <StatisticsCard title={"Most Watched Shows"} items={showStatistics} countLabel={"Played"} backdrop={"https://d32qys9a6wm9no.cloudfront.net/images/tvs/backdrop/7a/98e7c314b3d05345554347591f2edce9_1280x720.jpg?t=1671135913"} poster={"https://m.media-amazon.com/images/I/71vQxlNXedL.jpg"} />
        <StatisticsCard title={"Category"} items={categoryStatistics} countLabel={"Movies"} icon={MdMovie} />
        <StatisticsCard title={"Category"} items={showCategoryStatistics} countLabel={"Shows"} icon={MdTv} />
      </div>
      <h1 className="text-2xl mb-5 dark:text-gray-200">Newly Added</h1>
      <div className={styles.row}>
        <PosterCard title="Back to the Future" poster="https://static.posters.cz/image/1300/poster/back-to-the-future-i152504.jpg" subTitle={"1994"} />
        <PosterCard title="Tenet" poster="https://m.media-amazon.com/images/I/71D8LFlOiDL._AC_UF1000,1000_QL80_.jpg" subTitle={"2019"} />
        <PosterCard title="Avatar" poster="https://static.posters.cz/image/750/poster/avatar-limited-ed-one-sheet-sun-i7182.jpg" subTitle={"2002"} />
        <PosterCard title="The Flash" poster="https://upload.wikimedia.org/wikipedia/en/7/73/The_Flash_season_1.jpg" subTitle={"Season 1"} />
      </div>
    </div>
  )
}
