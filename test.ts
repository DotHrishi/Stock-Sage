import { config } from 'dotenv';
config({ path: '.env.local' });
import { connectToDatabase } from './database/mongoose';
import { WatchlistGroup } from './database/models/watchlistGroup.model';
import { Watchlist } from './database/models/watchlist.model';

async function main() {
    await connectToDatabase();
    const groups = await WatchlistGroup.find({}).lean();
    console.log("Groups:", JSON.stringify(groups, null, 2));

    const items = await Watchlist.find({}).lean();
    console.log("Items:", JSON.stringify(items, null, 2));
    process.exit(0);
}
main();
