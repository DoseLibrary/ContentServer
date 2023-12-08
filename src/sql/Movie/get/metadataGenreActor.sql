SELECT
  mov.id,
  mov.library,
  mov.trailer,
  metadata.id AS metadata_id,
  metadata.title,
  metadata.overview,
  metadata.release_date,
  metadata.runtime,
  metadata.popularity,
  metadata.added_date,
  metadata.backdrop,
  metadata.poster,
  metadata.tmdb_id,
	json_agg(
		DISTINCT jsonb_build_object(
			'imdb_category_id',
			genre.imdb_category_id,
			'name',
			genre.name
		)
	) AS genres,
  json_agg(
    DISTINCT jsonb_build_object(
      'actor_image',
      actor.image,
      'actor_name',
      actor.name,
      'actor_id',
      actor.id,
      'character_name',
      mov_actor.character_name,
      'order',
      mov_actor.order_in_credit
    )
  ) AS characters,
  string_agg(DISTINCT mov.path, ',') AS path
FROM
  movie mov
  INNER JOIN movie_metadata metadata ON metadata.movie_id = mov.id -- Inner join movie_metadata to get metadata
  INNER JOIN movie_category mov_category ON mov_category.movie_id = mov.id -- Inner join movie_category and category to get genre data
  INNER JOIN category genre ON genre.imdb_category_id = mov_category.category_id
  INNER JOIN movie_actor mov_actor ON mov.id = mov_actor.movie_id -- Inner join movie_actor and actor to get actor data
  INNER JOIN actor ON mov_actor.actor_id = actor.id
WHERE
  mov.id = ${id}
GROUP BY
  mov.id,
  mov.library,
  mov.trailer,
  metadata.id,
  metadata.title,
  metadata.overview,
  metadata.release_date,
  metadata.runtime,
  metadata.popularity,
  metadata.added_date