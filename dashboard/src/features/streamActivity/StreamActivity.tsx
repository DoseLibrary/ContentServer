import { useState } from "react"

import styles from "./StreamActivity.module.css"

import { StreamCard } from "../../core";

export const StreamActivity = () => {

  return (
    <div className="mt-5">
      <h1 className="text-2xl mb-5 dark:text-gray-200">Streaming Activity</h1>
      <div className={styles.row}>
        <StreamCard title={"Back to the future"} backdrop={"https://i0.wp.com/goldrecordoutlet.com/wp-content/uploads/2020/08/back-to-the-future1.jpeg?fit=1365%2C728&ssl=1"} poster={"https://static.posters.cz/image/1300/poster/back-to-the-future-i152504.jpg"} quality={"1080P"} playback={"PLAYING"} user={"frippe9"} currentPlaybackTime={4555} playbackTime={9343}></StreamCard>
        <StreamCard title={"Tenet"} backdrop={"https://blog.uclfilm.com/wp-content/uploads/2020/09/tenetfeatured-1.jpg"} poster={"https://m.media-amazon.com/images/I/71D8LFlOiDL._AC_UF1000,1000_QL80_.jpg"} quality={"Direct Play"} playback={"PLAYING"} user={"vezel"} currentPlaybackTime={3304} playbackTime={9201}></StreamCard>
        <StreamCard title={"Iron Man 3"} backdrop={"https://wallpapercave.com/wp/wp1886659.jpg"} poster={"https://m.media-amazon.com/images/I/718XVhrcXfL._AC_UF1000,1000_QL80_.jpg"} quality={"Direct Play"} playback={"PLAYING"} user={"vezel"} currentPlaybackTime={344} playbackTime={7566}></StreamCard>
        <StreamCard title={"Avatar"} backdrop={"https://i.pinimg.com/originals/21/8f/71/218f71441e41f80dee9cd04c91db770f.jpg"} poster={"https://static.posters.cz/image/750/poster/avatar-limited-ed-one-sheet-sun-i7182.jpg"} quality={"720P"} playback={"PAUSED"} user={"vezel"} currentPlaybackTime={6754} playbackTime={9201}></StreamCard>
        <StreamCard title={"The Flash S1E4"} backdrop={"https://d32qys9a6wm9no.cloudfront.net/images/tvs/backdrop/7a/98e7c314b3d05345554347591f2edce9_1280x720.jpg?t=1671135913"} poster={"https://m.media-amazon.com/images/I/71vQxlNXedL.jpg"} quality={"Direct Play"} playback={"PLAYING"} user={"vezel"} currentPlaybackTime={3304} playbackTime={3453}></StreamCard>
      </div>
    </div>
  )
}
