ALTER TABLE "blogs" ALTER COLUMN "comment_status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "blogs" ALTER COLUMN "comment_status" SET DATA TYPE boolean USING (
  CASE 
    WHEN "comment_status" = 'OPEN' OR "comment_status" = 'true' THEN true 
    ELSE false 
  END
);--> statement-breakpoint
ALTER TABLE "blogs" ALTER COLUMN "comment_status" SET DEFAULT true;
