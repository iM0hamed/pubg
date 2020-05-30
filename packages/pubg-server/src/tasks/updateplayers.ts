require("dotenv-safe").config();

import dayjs from "dayjs";
import { Database } from "../database";
import { PlayerDbController } from "../database/model/player";
import { importPlayerStats } from "../utils";
import { HTTP_STATUS_TOO_MANY_REQUESTS } from "pubg-utils/src";

const MIN_UPDATE_INTERVAL = 15; // in minutes

const run = async () => {
  const exit = async (exitCode: number) => {
    await Database.disconnect();
    process.exit(exitCode);
  };

  console.log(`[Info]: start update players task ...`);

  const db = await Database.connect();
  if (db.err) exit(1);

  const players = await PlayerDbController.find({});

  if (!players.ok || players.val.length === 0) {
    console.log(`[Info]: no players found`);
    return await exit(0);
  }

  // only update player stats older than MIN_UPDATE_INTERVAL
  const playersToUpdate = players.val.filter((i) =>
    dayjs(i.statsUpdatedAt ?? dayjs()).isBefore(
      dayjs().subtract(MIN_UPDATE_INTERVAL, "minute")
    )
  );

  console.log(`[Info]: ${playersToUpdate.length} players found`);

  for (const player of playersToUpdate) {
    console.log(`[Info]: start to import stats for "${player.name}" ...`);
    const result = await importPlayerStats(player);

    // TODO: ???
    if (result.err === HTTP_STATUS_TOO_MANY_REQUESTS) {
      console.log(`[Info]: STOP importer. PUBG API LIMIT REACHED.`);
      await exit(0);
    }
  }

  console.log(`[Info]: finished update players task.`);
  await exit(0);
};

run();
