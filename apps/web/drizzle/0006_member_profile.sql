CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."marital_status" AS ENUM('single', 'married', 'other');--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "father_name" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "mother_name" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "date_of_birth" date;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "gender" "gender";--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "marital_status" "marital_status";--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "organization" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "house_village" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "road_ward" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "post_office" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "post_code" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "upazila" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "district" text;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_post_code_format" CHECK ("members"."post_code" ~ '^[0-9]{4}$');--> statement-breakpoint
-- Hand-written: keep the old free-text address. Address and area go, joined,
-- into house_village (concat_ws skips NULLs), so nothing is lost; an admin can
-- split it into the new fields later. 0007 then drops the old columns.
UPDATE "members" SET "house_village" = nullif(concat_ws(', ', nullif(trim("address"), ''), nullif(trim("area"), '')), '');
