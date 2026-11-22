ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'ADMIN'::text;--> statement-breakpoint
UPDATE "users" SET "role" = 'CMS_WRITER' WHERE "role" = 'CONTENT_EDITOR';--> statement-breakpoint
UPDATE "users" SET "role" = 'ADMIN' WHERE "role" = 'COMMITTEE';--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('SUPERADMIN', 'ADMIN', 'CMS_WRITER');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'ADMIN'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";