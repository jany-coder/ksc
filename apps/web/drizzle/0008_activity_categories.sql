CREATE TABLE "activity_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_bn" text NOT NULL,
	"name_en" text NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "category_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "activity_categories_name_bn_unique" ON "activity_categories" USING btree (lower("name_bn"));--> statement-breakpoint
CREATE UNIQUE INDEX "activity_categories_name_en_unique" ON "activity_categories" USING btree (lower("name_en"));--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_category_id_activity_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."activity_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_category_id_idx" ON "activities" USING btree ("category_id");--> statement-breakpoint
-- The five kinds that used to be fixed in the code, in their old order (one
-- second apart, since the list is ordered by created_at).
INSERT INTO "activity_categories" ("name_bn", "name_en", "created_at") VALUES
	('রক্তদান', 'Blood donation', now()),
	('ত্রাণ ও সহায়তা', 'Relief and support', now() + interval '1 second'),
	('শিক্ষা', 'Education', now() + interval '2 seconds'),
	('খেলাধুলা', 'Sports', now() + interval '3 seconds'),
	('সভা', 'Meeting', now() + interval '4 seconds');--> statement-breakpoint
-- Activities that already had one of them keep it.
UPDATE "activities" AS a SET "category_id" = c."id"
FROM "activity_categories" AS c
WHERE a."category" = c."name_bn";
