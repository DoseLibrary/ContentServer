SELECT
  i.id,
  i.movie_id,
  i.title,
  i.overview,
  i.release_date,
  i.runtime,
  i.popularity,
  i.added_date,
  i.trailer,
  i.tmdb_id,
  i.backdrop,
  i.poster
  -- i.logo,
FROM
  movie_metadata i
WHERE
  i.title ILIKE ${query}