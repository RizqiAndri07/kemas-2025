CREATE TYPE "public"."competition_status" AS ENUM('OPEN', 'CLOSED', 'UPCOMING', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."competition_type" AS ENUM('EVENT', 'TOURNAMENT');--> statement-breakpoint
CREATE TABLE "competitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"type" "competition_type" DEFAULT 'TOURNAMENT' NOT NULL,
	"registration_start_date" timestamp with time zone NOT NULL,
	"registration_end_date" timestamp with time zone NOT NULL,
	"event_start_date" timestamp with time zone NOT NULL,
	"event_end_date" timestamp with time zone NOT NULL,
	"fee" integer DEFAULT 0 NOT NULL,
	"description" text,
	"max_quota" integer,
	"status" "competition_status" DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "status" varchar(20) DEFAULT 'PUBLIC' NOT NULL;