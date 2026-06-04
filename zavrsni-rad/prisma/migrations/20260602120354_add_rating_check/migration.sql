ALTER TABLE "Rating"
ADD CONSTRAINT rating_value_check
CHECK (value >= 1 AND value <= 5);