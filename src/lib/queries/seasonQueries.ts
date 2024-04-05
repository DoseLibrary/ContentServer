import { cleanDate } from "../../util/date";
import { Season } from "../../models/Season";
import { ImageType } from "../../models/Image";
import { DetailedSeasonResponse } from "../../types/season/DetailedSeasonResponse";

export const normalizeDetailedSeason = (season: Season): DetailedSeasonResponse => {
  return {
    addedDate: cleanDate(season.addedDate),
    airDate: cleanDate(season.metadata?.airDate),
    season: season.metadata?.seasonNumber || season.seasonNumber,
    title: season.metadata?.title,
    backdropId: season.metadata?.images?.find(image => image.type === ImageType.BACKDROP)?.id ||
      season.show.metadata?.images?.find(image => image.type === ImageType.BACKDROP)?.id,
    posterId: season.metadata?.images?.find(image => image.type === ImageType.POSTER)?.id ||
      season.show.metadata?.images?.find(image => image.type === ImageType.POSTER)?.id,
    overview: season.metadata?.overview,
    episodes: season.episodes.map(episode => ({
      episode: episode.episodeNumber,
      backdropId: episode.metadata?.images.find(image => image.type === ImageType.BACKDROP)?.id,
      overview: episode.metadata?.overview,
      title: episode.metadata?.title,
    })),
    show: {
      id: season.show.id,
      title: season.show.metadata?.title || season.show.name
    }
  }
}