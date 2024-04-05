import { cleanDate } from "../../util/date";
import { Show } from "../../models/Show";
import { ImageType } from "../../models/Image";
import { BasicShowResponse } from "../../types/show/BasicShowResponse";
import { DetailedShowResponse } from "../../types/show/DetailedShowResponse";

export enum ShowOrderBy {
  ADDED_DATE = 'addedDate',
  RELEASE_DATE = 'releaseDate'
}

export interface ShowOrderByOptions {
  field: ShowOrderBy;
  dir: 'asc' | 'desc'
}

export const normalizeDetailedShow = (show: Show): DetailedShowResponse => {
  return {
    id: show.id,
    title: show.metadata?.title || show.name,
    overview: show.metadata?.overview,
    firstAirDate: cleanDate(show.metadata?.firstAirDate),
    addedDate: cleanDate(show.addedDate),
    genres: show.metadata?.genres?.map(genre => genre.name) || [],
    posterId: show.metadata?.images?.find(image => image.type === ImageType.POSTER)?.id,
    backdropId: show.metadata?.images?.find(image => image.type === ImageType.BACKDROP)?.id,
    logoId: show.metadata?.images?.find(image => image.type === ImageType.LOGO)?.id,
    seasons: show.seasons.map(season => ({
      title: season.metadata?.title,
      number: season.metadata?.seasonNumber || season.seasonNumber,
      posterId: season.metadata?.images?.find(image => image.type === ImageType.POSTER)?.id
    }))
  };
};

export const normalizeDetailedShows = (shows: Show[]): DetailedShowResponse[] => {
  return shows.map(normalizeDetailedShow);
};

export const normalizeBasicShow = (show: Show): BasicShowResponse => {
  return {
    id: show.id,
    title: show.metadata?.title || show.name,
    addedDate: cleanDate(show.addedDate),
    overview: show.metadata?.overview,
    posterId: show.metadata?.images?.find(image => image.type === ImageType.POSTER)?.id,
    backdropId: show.metadata?.images?.find(image => image.type === ImageType.BACKDROP)?.id,
    logoId: show.metadata?.images?.find(image => image.type === ImageType.LOGO)?.id,
  };
}

export const normalizeBasicShows = (shows: Show[]): BasicShowResponse[] => {
  return shows.map(normalizeBasicShow);
}
