import { readFile } from 'node:fs/promises';

import { sql } from 'drizzle-orm';

import { productListResponseSchema } from '@bite/contracts';

import { readDatabaseUrl } from '../config.js';
import { createDatabase } from '../database/client.js';
import { products } from '../database/schema.js';

const importCatalog = async () => {
  const databaseUrl = readDatabaseUrl();
  const database = createDatabase(databaseUrl);
  const itemsFile = new URL('../data/items.json', import.meta.url);
  const items = productListResponseSchema.parse(
    JSON.parse(await readFile(itemsFile, 'utf8')),
  );
  const productRows = items.map((item, index) => ({
    ...item,
    displayOrder: index + 1,
  }));

  await database
    .insert(products)
    .values(productRows)
    .onConflictDoUpdate({
      target: products.id,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        price: sql`excluded.price_cents`,
        imageUrl: sql`excluded.image_url`,
        displayOrder: sql`excluded.display_order`,
        status: sql`excluded.status`,
      },
    });

  console.info(`Imported ${items.length} catalog products.`);
};

try {
  await importCatalog();
} catch {
  console.error(
    'Catalog import failed. Check DATABASE_URL and run the database migration first.',
  );
  process.exitCode = 1;
}
