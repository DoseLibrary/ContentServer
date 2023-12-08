SELECT
  i.id,
  i.serie_id,
  i.title,
  i.overview,
  i.first_air_date,
  i.added_date,
  i.popularity,
  i.tmdb_id
FROM
  serie_metadata i
WHERE
  i.title ILIKE ${query}