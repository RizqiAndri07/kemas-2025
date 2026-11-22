import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL or DIRECT_URL is required for Drizzle Kit configuration");
}

export default defineConfig({
  schema: "./modules/**/infrastructure/*.table.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
