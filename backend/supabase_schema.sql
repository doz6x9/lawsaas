-- ==========================================
-- LEGALACT MVP: SUPABASE DATABASE SCHEMA (UPDATED FOR GDPR)
-- ==========================================

-- IF YOU ALREADY CREATED THE TABLES, DROP THEM FIRST:
DROP TABLE IF EXISTS public."Images" CASCADE;
DROP TABLE IF EXISTS public."Cases" CASCADE;
DROP TABLE IF EXISTS public."Contacts" CASCADE;

-- 1. Create the 'Contacts' Table (Infringers)
CREATE TABLE public."Contacts" (
    "idInfringer" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "phone" TEXT,
    "phone1" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT "Contacts_pkey" PRIMARY KEY ("idInfringer")
);

CREATE INDEX "idx_contacts_company" ON public."Contacts"("company");


-- 2. Create the 'Cases' Table
CREATE TABLE public."Cases" (
    "idCase" TEXT NOT NULL,
    "pass" TEXT,
    "customerName" TEXT NOT NULL,
    "idClient" TEXT,
    "idInfringer" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "isScrubbed" BOOLEAN NOT NULL DEFAULT FALSE, -- ADDED FOR GDPR COMPLIANCE

    CONSTRAINT "Cases_pkey" PRIMARY KEY ("idCase"),
    CONSTRAINT "Cases_idInfringer_fkey" FOREIGN KEY ("idInfringer")
        REFERENCES public."Contacts" ("idInfringer")
        ON DELETE CASCADE
);

CREATE INDEX "idx_cases_idInfringer" ON public."Cases"("idInfringer");
-- Optional index to speed up the nightly cron job
CREATE INDEX "idx_cases_created_scrubbed" ON public."Cases"("createdAt", "isScrubbed");


-- 3. Create the 'Images' Table
CREATE TABLE public."Images" (
    "idImage" UUID NOT NULL DEFAULT gen_random_uuid(),
    "idCase" TEXT NOT NULL,
    "catalogImagePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT "Images_pkey" PRIMARY KEY ("idImage"),
    CONSTRAINT "Images_idCase_fkey" FOREIGN KEY ("idCase")
        REFERENCES public."Cases" ("idCase")
        ON DELETE CASCADE
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public."Contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Cases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Images" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for MVP" ON public."Contacts" FOR ALL USING (true);
CREATE POLICY "Allow all operations for MVP" ON public."Cases" FOR ALL USING (true);
CREATE POLICY "Allow all operations for MVP" ON public."Images" FOR ALL USING (true);
