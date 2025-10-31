
import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

interface Expense {
  description: string;
  amount: number;
  date: string;
}

interface Invoice {
  customer_id: string;
  amount: number;
  status: string;
  date: string;
}

const expenses = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'expenses.json'), 'utf8'));
const invoices = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'invoices.json'), 'utf8'));

async function seedExpenses() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    // Create the "expenses" table if it doesn't exist
    const createTable = await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        amount INT NOT NULL,
        date DATE NOT NULL
      );
    `;

    console.log(`Created "expenses" table`);

    // Insert data into the "expenses" table
    const insertedExpenses = await Promise.all(
      expenses.map(
        (expense: Expense) => sql`
        INSERT INTO expenses (description, amount, date)
        VALUES (${expense.description}, ${expense.amount}, ${expense.date})
        ON CONFLICT (id) DO NOTHING;
      `,
      ),
    );

    console.log(`Seeded ${insertedExpenses.length} expenses`);

    return {
      createTable,
      expenses: insertedExpenses,
    };
  } catch (error) {
    console.error('Error seeding expenses:', error);
    throw error;
  }
}

async function seedInvoices() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create the "invoices" table if it doesn't exist
    const createTable = await sql`
    CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID NOT NULL,
    amount INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    date DATE NOT NULL
  );
`;

    console.log(`Created "invoices" table`);

    // Insert data into the "invoices" table
    const insertedInvoices = await Promise.all(
      invoices.map(
        (invoice: Invoice) => sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `,
      ),
    );

    console.log(`Seeded ${insertedInvoices.length} invoices`);

    return {
      createTable,
      invoices: insertedInvoices,
    };
  } catch (error) {
    console.error('Error seeding invoices:', error);
    throw error;
  }
}


async function main() {
  await seedExpenses();
  await seedInvoices();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
