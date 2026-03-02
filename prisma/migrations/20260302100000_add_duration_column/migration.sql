-- Recovery: Add duration column to Event table
-- This adds only the duration column since repeatType/repeatUntil already exist

ALTER TABLE "Event" ADD COLUMN "duration" INTEGER NOT NULL DEFAULT 30;
