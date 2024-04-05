import { cleanDate } from "../../util/date";
import { Episode } from "../../models/Episode";
import { ImageType } from "../../models/Image";
import { BasicEpisodeResponse } from "../../types/episode/BasicEpisodeResponse";
import { DetailedEpisodeResponse } from "../../types/episode/DetailedEpisodeResponse";

enum EpisodeOrderBy {
  ADDED_DATE = 'addedDate',
  RELEASE_DATE = 'releaseDate'
}

export interface EpisodeOrderByOptions {
  field: EpisodeOrderBy;
  dir: 'asc' | 'desc'
}

export const normalizeBasicEpisode = (episode: Episode): BasicEpisodeResponse => {
  return {
    showId: episode.showId,
    season: episode.metadata?.seasonNumber || episode.seasonNumber,
    episode: episode.metadata?.episodeNumber || episode.episodeNumber,
    addedDate: cleanDate(episode.addedDate),
    posterId: episode.metadata?.images.find(image => image.type === ImageType.POSTER)?.id ||
      episode.season.metadata?.images.find(image => image.type === ImageType.POSTER)?.id ||
      episode.season.show.metadata?.images.find(image => image.type === ImageType.POSTER)?.id,
    backdropId: episode.metadata?.images.find(image => image.type === ImageType.BACKDROP)?.id ||
      episode.season.metadata?.images.find(image => image.type === ImageType.BACKDROP)?.id ||
      episode.season.show.metadata?.images.find(image => image.type === ImageType.BACKDROP)?.id,
    logoId: episode.metadata?.images.find(image => image.type === ImageType.LOGO)?.id,
  };
}

export const normalizeDetailedEpisode = (episode: Episode): DetailedEpisodeResponse => {
  return {
    showId: episode.showId,
    season: episode.season.metadata?.seasonNumber || episode.seasonNumber,
    episode: episode.metadata?.episodeNumber || episode.episodeNumber,
    title: episode.metadata?.title,
    overview: episode.metadata?.overview,
    addedDate: cleanDate(episode.addedDate),
    airDate: cleanDate(episode.metadata?.airDate),
    duration: episode.duration || undefined,
    posterId: episode.metadata?.images.find(image => image.type === ImageType.POSTER)?.id ||
      episode.season.metadata?.images.find(image => image.type === ImageType.POSTER)?.id ||
      episode.season.show.metadata?.images.find(image => image.type === ImageType.POSTER)?.id,
    backdropId: episode.metadata?.images.find(image => image.type === ImageType.BACKDROP)?.id ||
      episode.season.metadata?.images.find(image => image.type === ImageType.BACKDROP)?.id ||
      episode.season.show.metadata?.images.find(image => image.type === ImageType.BACKDROP)?.id,
    logoId: episode.metadata?.images.find(image => image.type === ImageType.LOGO)?.id,
  };
}

export const normalizeBasicEpisodes = (episodes: Episode[]): BasicEpisodeResponse[] => {
  return episodes.map(normalizeBasicEpisode);
};

export const normalizeDetailedEpisodes = (episodes: Episode[]): DetailedEpisodeResponse[] => {
  return episodes.map(normalizeDetailedEpisode);
};
