-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('vote', 'scandal', 'legal', 'statement', 'achievement', 'appointment', 'financial', 'media');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "Resolution" AS ENUM ('resolved', 'ongoing', 'pending', 'dismissed');

-- CreateEnum
CREATE TYPE "VoteOutcome" AS ENUM ('passed', 'rejected', 'abstained');

-- CreateEnum
CREATE TYPE "Constitutionality" AS ENUM ('constitutional', 'unconstitutional', 'disputed', 'pending_ruling', 'not_applicable');

-- CreateEnum
CREATE TYPE "ConstitutionalRulingOutcome" AS ENUM ('upheld', 'struck_down', 'referred', 'pending');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('party_colleague', 'family', 'business', 'friendship', 'political_rivalry', 'mentor_mentee');

-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ministry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ministry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Government" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "prime_minister_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Government_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Minister" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "born" TIMESTAMP(3),
    "died" TIMESTAMP(3),
    "birthplace" TEXT,
    "party_id" TEXT,
    "bio" TEXT,
    "bio_en" TEXT,
    "career_before_politics" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Minister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyTerm" (
    "id" TEXT NOT NULL,
    "minister_id" TEXT NOT NULL,
    "party_id" TEXT NOT NULL,
    "from" TIMESTAMP(3),
    "to" TIMESTAMP(3),
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartyTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CabinetRole" (
    "id" TEXT NOT NULL,
    "minister_id" TEXT NOT NULL,
    "government_id" TEXT NOT NULL,
    "ministry_id" TEXT,
    "role" TEXT NOT NULL,
    "role_en" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CabinetRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "minister_id" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "degree_en" TEXT,
    "institution" TEXT NOT NULL,
    "year" INTEGER,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "minister_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "political_role" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParliamentaryTerm" (
    "id" TEXT NOT NULL,
    "minister_id" TEXT NOT NULL,
    "constituency" TEXT,
    "from" INTEGER NOT NULL,
    "to" INTEGER,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParliamentaryTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommitteeMembership" (
    "id" TEXT NOT NULL,
    "minister_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "from" TIMESTAMP(3),
    "to" TIMESTAMP(3),
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommitteeMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillProposed" (
    "id" TEXT NOT NULL,
    "minister_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "outcome" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillProposed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "minister_id" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "title_en" TEXT,
    "description" TEXT NOT NULL,
    "description_en" TEXT,
    "severity" "Severity",
    "resolution" "Resolution",
    "vote_outcome" "VoteOutcome",
    "constitutionality" "Constitutionality",
    "constitutional_notes" TEXT,
    "constitutional_court_ruling" TEXT,
    "constitutional_ruling_outcome" "ConstitutionalRulingOutcome",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSource" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "EventSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstitutionalReference" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "article" TEXT NOT NULL,
    "constitution_year" INTEGER,
    "description" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConstitutionalReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetDeclaration" (
    "id" TEXT NOT NULL,
    "minister_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "declared_value_eur" DOUBLE PRECISION,
    "notes" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetDeclaration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessInterest" (
    "id" TEXT NOT NULL,
    "minister_id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT,
    "from" TIMESTAMP(3),
    "to" TIMESTAMP(3),
    "notes" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaTie" (
    "id" TEXT NOT NULL,
    "minister_id" TEXT NOT NULL,
    "media_outlet" TEXT NOT NULL,
    "nature" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaTie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyPosition" (
    "id" TEXT NOT NULL,
    "minister_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "minister_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "context" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contradiction" (
    "id" TEXT NOT NULL,
    "minister_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "past_position" TEXT NOT NULL,
    "past_date" TIMESTAMP(3),
    "past_source" TEXT,
    "current_position" TEXT NOT NULL,
    "current_date" TIMESTAMP(3),
    "current_source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contradiction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "from_id" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,
    "relation_type" "RelationType" NOT NULL,
    "notes" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Party_slug_key" ON "Party"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ministry_slug_key" ON "Ministry"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Government_slug_key" ON "Government"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Minister_slug_key" ON "Minister"("slug");

-- CreateIndex
CREATE INDEX "Minister_party_id_idx" ON "Minister"("party_id");

-- CreateIndex
CREATE INDEX "PartyTerm_minister_id_idx" ON "PartyTerm"("minister_id");

-- CreateIndex
CREATE INDEX "CabinetRole_minister_id_idx" ON "CabinetRole"("minister_id");

-- CreateIndex
CREATE INDEX "CabinetRole_government_id_idx" ON "CabinetRole"("government_id");

-- CreateIndex
CREATE INDEX "CabinetRole_ministry_id_idx" ON "CabinetRole"("ministry_id");

-- CreateIndex
CREATE INDEX "Education_minister_id_idx" ON "Education"("minister_id");

-- CreateIndex
CREATE INDEX "FamilyMember_minister_id_idx" ON "FamilyMember"("minister_id");

-- CreateIndex
CREATE INDEX "ParliamentaryTerm_minister_id_idx" ON "ParliamentaryTerm"("minister_id");

-- CreateIndex
CREATE INDEX "CommitteeMembership_minister_id_idx" ON "CommitteeMembership"("minister_id");

-- CreateIndex
CREATE INDEX "BillProposed_minister_id_idx" ON "BillProposed"("minister_id");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_minister_id_idx" ON "Event"("minister_id");

-- CreateIndex
CREATE INDEX "Event_type_idx" ON "Event"("type");

-- CreateIndex
CREATE INDEX "Event_date_idx" ON "Event"("date");

-- CreateIndex
CREATE INDEX "Event_constitutionality_idx" ON "Event"("constitutionality");

-- CreateIndex
CREATE INDEX "EventSource_event_id_idx" ON "EventSource"("event_id");

-- CreateIndex
CREATE INDEX "ConstitutionalReference_event_id_idx" ON "ConstitutionalReference"("event_id");

-- CreateIndex
CREATE INDEX "ConstitutionalReference_article_idx" ON "ConstitutionalReference"("article");

-- CreateIndex
CREATE INDEX "AssetDeclaration_minister_id_idx" ON "AssetDeclaration"("minister_id");

-- CreateIndex
CREATE INDEX "BusinessInterest_minister_id_idx" ON "BusinessInterest"("minister_id");

-- CreateIndex
CREATE INDEX "MediaTie_minister_id_idx" ON "MediaTie"("minister_id");

-- CreateIndex
CREATE INDEX "PolicyPosition_minister_id_idx" ON "PolicyPosition"("minister_id");

-- CreateIndex
CREATE INDEX "Quote_minister_id_idx" ON "Quote"("minister_id");

-- CreateIndex
CREATE INDEX "Contradiction_minister_id_idx" ON "Contradiction"("minister_id");

-- CreateIndex
CREATE INDEX "Connection_from_id_idx" ON "Connection"("from_id");

-- CreateIndex
CREATE INDEX "Connection_to_id_idx" ON "Connection"("to_id");

-- AddForeignKey
ALTER TABLE "Government" ADD CONSTRAINT "Government_prime_minister_id_fkey" FOREIGN KEY ("prime_minister_id") REFERENCES "Minister"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Minister" ADD CONSTRAINT "Minister_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyTerm" ADD CONSTRAINT "PartyTerm_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "Minister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyTerm" ADD CONSTRAINT "PartyTerm_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CabinetRole" ADD CONSTRAINT "CabinetRole_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "Minister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CabinetRole" ADD CONSTRAINT "CabinetRole_government_id_fkey" FOREIGN KEY ("government_id") REFERENCES "Government"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CabinetRole" ADD CONSTRAINT "CabinetRole_ministry_id_fkey" FOREIGN KEY ("ministry_id") REFERENCES "Ministry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "Minister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "Minister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParliamentaryTerm" ADD CONSTRAINT "ParliamentaryTerm_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "Minister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeMembership" ADD CONSTRAINT "CommitteeMembership_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "Minister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillProposed" ADD CONSTRAINT "BillProposed_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "Minister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "Minister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSource" ADD CONSTRAINT "EventSource_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstitutionalReference" ADD CONSTRAINT "ConstitutionalReference_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDeclaration" ADD CONSTRAINT "AssetDeclaration_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "Minister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessInterest" ADD CONSTRAINT "BusinessInterest_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "Minister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaTie" ADD CONSTRAINT "MediaTie_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "Minister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyPosition" ADD CONSTRAINT "PolicyPosition_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "Minister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "Minister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contradiction" ADD CONSTRAINT "Contradiction_minister_id_fkey" FOREIGN KEY ("minister_id") REFERENCES "Minister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "Minister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "Minister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
