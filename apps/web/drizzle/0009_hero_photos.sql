ALTER TABLE "images" ADD COLUMN "hero_order" integer;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "hero_background" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "images_hero_background_unique" ON "images" USING btree ("hero_background") WHERE "images"."hero_background";--> statement-breakpoint
CREATE UNIQUE INDEX "images_hero_order_unique" ON "images" USING btree ("hero_order") WHERE "images"."hero_order" is not null;