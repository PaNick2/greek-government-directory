-- Rename my_constitutional_assessment to objective_constitutional_assessment
ALTER TABLE "Event" RENAME COLUMN "my_constitutional_assessment" TO "objective_constitutional_assessment";

-- Add new objective_constitutionality enum column
ALTER TABLE "Event" ADD COLUMN "objective_constitutionality" "Constitutionality";
