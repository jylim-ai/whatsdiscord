// seed.js
import { faker } from '@faker-js/faker';
import { Pool } from 'pg';

// Setup your DB connection
const pool = new Pool({
  user: 'postgres',         // or your db user
  host: 'localhost',
  database: 'postgres',     // your database name
  password: 'postgres', // your postgres password
  port: 5432,
});

const insertUsers = async (count = 1000) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (let i = 0; i < count; i++) {
      const name = faker.person.fullName();
      const email = faker.internet.email();
      const password = faker.internet.password();
      const created = faker.date.past().toISOString().split('T')[0]; // YYYY-MM-DD

      await client.query(
        'INSERT INTO users (name, email, password_hash, created_at) VALUES ($1, $2, $3, $4)',
        [name, email, password, created]
      );
    }

    await client.query('COMMIT');
    console.log(`${count} fake users inserted successfully.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting users:', err);
  } finally {
    client.release();
    pool.end();
  }
};

insertUsers();
