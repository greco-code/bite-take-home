CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price_cents" integer NOT NULL,
	"image_url" text NOT NULL,
	CONSTRAINT "products_price_cents_nonnegative" CHECK ("products"."price_cents" >= 0)
);
