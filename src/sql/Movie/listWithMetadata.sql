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
  i.poster,
  -- i.logo,
  array_agg(DISTINCT t.name) AS genres
FROM
  movie_metadata i -- Join with movie_category and category to get an array of the categories
  INNER JOIN movie_category it ON it.movie_id = i.movie_id
  INNER JOIN category t ON t.imdb_category_id = it.category_id -- Join with movie_image and image to get an array of the movies images
GROUP BY
  i.id,
  i.title