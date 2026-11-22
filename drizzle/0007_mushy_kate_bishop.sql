CREATE TABLE "competition_contact_persons" (
	"competition_id" uuid NOT NULL,
	"contact_person_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "competition_contact_persons_competition_id_contact_person_id_pk" PRIMARY KEY("competition_id","contact_person_id")
);
--> statement-breakpoint
CREATE TABLE "contact_persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "competition_presales" CASCADE;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "price_list" jsonb DEFAULT '[{"id":"default","name":"Normal Price","price":0}]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "selected_price_id" varchar(50) DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE "competition_contact_persons" ADD CONSTRAINT "competition_contact_persons_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_contact_persons" ADD CONSTRAINT "competition_contact_persons_contact_person_id_contact_persons_id_fk" FOREIGN KEY ("contact_person_id") REFERENCES "public"."contact_persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitions" DROP COLUMN "has_presale";