-- CreateEnum
CREATE TYPE "PoliticalSpectrum" AS ENUM ('far_left', 'left', 'centre_left', 'centre', 'centre_right', 'right', 'far_right');

-- CreateEnum
CREATE TYPE "ParliamentaryStatus" AS ENUM ('governing', 'opposition', 'junior_coalition_partner', 'extra_parliamentary', 'dissolved');

-- AlterTable
ALTER TABLE "Party" ADD COLUMN     "abbreviation" TEXT,
ADD COLUMN     "abbreviation_en" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "bio_en" TEXT,
ADD COLUMN     "dissolved" DATE,
ADD COLUMN     "founded" DATE,
ADD COLUMN     "ideology" TEXT,
ADD COLUMN     "ideology_en" TEXT,
ADD COLUMN     "parliamentary_status" "ParliamentaryStatus",
ADD COLUMN     "political_spectrum" "PoliticalSpectrum";

-- CreateTable
CREATE TABLE "ElectionResult" (
    "id" TEXT NOT NULL,
    "party_id" TEXT NOT NULL,
    "election_date" DATE NOT NULL,
    "vote_percentage" DOUBLE PRECISION,
    "seats" INTEGER,
    "total_seats" INTEGER,
    "formed_government" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyLeader" (
    "id" TEXT NOT NULL,
    "party_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minister_id" TEXT,
    "from" DATE NOT NULL,
    "to" DATE,
    "notes" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartyLeader_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ElectionResult_party_id_idx" ON "ElectionResult"("party_id");

-- CreateIndex
CREATE UNIQUE INDEX "ElectionResult_party_id_election_date_key" ON "ElectionResult"("party_id", "election_date");

-- CreateIndex
CREATE INDEX "PartyLeader_party_id_idx" ON "PartyLeader"("party_id");

-- CreateIndex
CREATE INDEX "PartyLeader_minister_id_idx" ON "PartyLeader"("minister_id");

-- CreateIndex
CREATE UNIQUE INDEX "PartyLeader_party_id_name_from_key" ON "PartyLeader"("party_id", "name", "from");

-- AddForeignKey
ALTER TABLE "ElectionResult" ADD CONSTRAINT "ElectionResult_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyLeader" ADD CONSTRAINT "PartyLeader_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyLeader" ADD CONSTRAINT "PartyLeader_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "Minister"("id") ON DELETE SET NULL ON UPDATE CASCADE;
