ALTER TABLE "products" ADD COLUMN "display_order" integer;--> statement-breakpoint
UPDATE "products"
SET "display_order" = CASE "id"
	WHEN '1' THEN 1
	WHEN '2' THEN 2
	WHEN '3' THEN 3
	WHEN '4' THEN 4
	WHEN '5' THEN 5
	WHEN '6' THEN 6
	WHEN '7' THEN 7
	WHEN '8' THEN 8
	WHEN '9' THEN 9
	WHEN '10' THEN 10
	WHEN '11' THEN 11
	WHEN '12' THEN 12
	WHEN '13' THEN 13
	WHEN '14' THEN 14
	WHEN '15' THEN 15
	WHEN '16' THEN 16
	WHEN '17' THEN 17
	ELSE 2147483647
END;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "display_order" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_display_order_positive" CHECK ("products"."display_order" > 0);
