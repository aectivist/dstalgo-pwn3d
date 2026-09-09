const db = require('./db');
const { categories, problems } = require('./problemsData');

const upsertCategory = db.prepare(`
  INSERT INTO categories (slug, name, description, order_index)
  VALUES (@slug, @name, @description, @order_index)
  ON CONFLICT(slug) DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    order_index = excluded.order_index
`);

const getCategoryId = db.prepare(`SELECT id FROM categories WHERE slug = ?`);

const upsertProblem = db.prepare(`
  INSERT INTO problems
    (slug, title, category_id, difficulty, description_html, function_name, preamble, driver, starter_code, tests_json, order_index)
  VALUES
    (@slug, @title, @category_id, @difficulty, @description_html, @function_name, @preamble, @driver, @starter_code, @tests_json, @order_index)
  ON CONFLICT(slug) DO UPDATE SET
    title = excluded.title,
    category_id = excluded.category_id,
    difficulty = excluded.difficulty,
    description_html = excluded.description_html,
    function_name = excluded.function_name,
    preamble = excluded.preamble,
    driver = excluded.driver,
    starter_code = excluded.starter_code,
    tests_json = excluded.tests_json,
    order_index = excluded.order_index
`);

const seed = db.transaction(() => {
  for (const cat of categories) {
    upsertCategory.run(cat);
  }

  let orderCounters = {};
  for (const p of problems) {
    const cat = getCategoryId.get(p.category);
    if (!cat) throw new Error(`Unknown category slug "${p.category}" for problem "${p.slug}"`);
    orderCounters[p.category] = (orderCounters[p.category] || 0) + 1;
    upsertProblem.run({
      slug: p.slug,
      title: p.title,
      category_id: cat.id,
      difficulty: p.difficulty,
      description_html: p.description_html,
      function_name: p.function_name || '',
      preamble: p.preamble || '',
      driver: p.driver,
      starter_code: p.starter_code,
      tests_json: JSON.stringify(p.tests),
      order_index: orderCounters[p.category],
    });
  }
});

seed();

const counts = db.prepare(`
  SELECT c.name AS category, COUNT(p.id) AS count
  FROM categories c LEFT JOIN problems p ON p.category_id = c.id
  GROUP BY c.id ORDER BY c.order_index
`).all();

console.log('Seed complete:');
for (const row of counts) {
  console.log(`  ${row.category}: ${row.count} problem(s)`);
}
