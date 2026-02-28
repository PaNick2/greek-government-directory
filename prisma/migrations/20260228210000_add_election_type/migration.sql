-- CreateEnum
CREATE TYPE "ElectionType" AS ENUM ('parliamentary', 'european', 'local', 'referendum');

-- AlterTable
ALTER TABLE "ElectionResult" ADD COLUMN "election_type" "ElectionType" NOT NULL DEFAULT 'parliamentary';
