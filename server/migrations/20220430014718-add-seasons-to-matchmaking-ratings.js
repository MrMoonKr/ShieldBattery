exports.up = async function (db) {
  // First we create the columns as nullable since we can't guarantee what the right season ID is
  await db.runSql(`
    ALTER TABLE matchmaking_ratings
    ADD COLUMN season integer;
  `)
  await db.runSql(`
    ALTER TABLE matchmaking_rating_changes
    ADD COLUMN season integer;
  `)

  // Then we update all the rows to have the latest season ID
  await db.runSql(`
    UPDATE matchmaking_ratings
    SET season = (SELECT id FROM matchmaking_seasons ORDER BY start_date DESC LIMIT 1);
  `)
  await db.runSql(`
    UPDATE matchmaking_rating_changes
    SET season = (SELECT id FROM matchmaking_seasons ORDER BY start_date DESC LIMIT 1);
  `)

  // Then we make them non-nullable
  await db.runSql(`
    ALTER TABLE matchmaking_ratings
    ALTER COLUMN season SET NOT NULL;
  `)
  await db.runSql(`
    ALTER TABLE matchmaking_rating_changes
    ALTER COLUMN season SET NOT NULL;
  `)

  // Finally, we update the primary keys for matchmaking_rating to include the season ID
  // (matchmaking_rating_changes doesn't need this because the game_id is included there)
  await db.runSql(`
    ALTER TABLE matchmaking_ratings
    DROP CONSTRAINT matchmaking_ratings_pkey,
    ADD PRIMARY KEY (user_id, matchmaking_type, season);
  `)
}

exports.down = async function (db) {
  await db.runSql(`
    ALTER TABLE matchmaking_ratings
    DROP CONSTRAINT matchmaking_ratings_pkey,
    ADD PRIMARY KEY (user_id, matchmaking_type);
  `)

  await db.runSql(`
    ALTER TABLE matchmaking_ratings
    DROP COLUMN season;
  `)
  await db.runSql(`
    ALTER TABLE matchmaking_rating_changes
    DROP COLUMN season;
  `)
}

exports._meta = {
  version: 1,
}
