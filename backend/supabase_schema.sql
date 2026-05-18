-- ==========================================
-- LEGALACT MVP: SUPABASE DATABASE SCHEMA (HARDENED)
-- ==========================================

-- IF YOU ALREADY CREATED THE TABLES, DROP THEM FIRST:
DROP TABLE IF EXISTS public."Images" CASCADE;
DROP TABLE IF EXISTS public."Cases" CASCADE;
DROP TABLE IF EXISTS public."ContactPhones" CASCADE;
DROP TABLE IF EXISTS public."Contacts" CASCADE;
DROP TABLE IF EXISTS public."AutomationsConfig" CASCADE;
DROP TABLE IF EXISTS public."Invoices" CASCADE;
DROP TABLE IF EXISTS public."AuditLogs" CASCADE;

-- Enable pg_trgm extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Create the 'Contacts' Table (Infringers)
CREATE TABLE public."Contacts" (
    "idInfringer" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company" TEXT NOT NULL,
    "user_id" UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT "Contacts_pkey" PRIMARY KEY ("idInfringer")
);

CREATE INDEX "idx_contacts_company" ON public."Contacts"("company");
-- Create trigram index for fuzzy matching on company name
CREATE INDEX "idx_contacts_company_trgm" ON public."Contacts" USING gin ("company" gin_trgm_ops);
CREATE INDEX "idx_contacts_user" ON public."Contacts"("user_id");

-- 1.5 Create the 'ContactPhones' Table (Resolving phone1 anti-pattern)
CREATE TABLE public."ContactPhones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "idInfringer" UUID NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "isPrimary" BOOLEAN DEFAULT false,
    "user_id" UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),

    CONSTRAINT "ContactPhones_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ContactPhones_idInfringer_fkey" FOREIGN KEY ("idInfringer")
        REFERENCES public."Contacts" ("idInfringer")
        ON DELETE CASCADE
);

CREATE INDEX "idx_contactphones_idInfringer" ON public."ContactPhones"("idInfringer");

-- 2. Create the 'Cases' Table
CREATE TABLE public."Cases" (
    "idCase" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pass" TEXT,
    "customerName" TEXT NOT NULL,
    "idClient" TEXT,
    "idInfringer" UUID NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "isScrubbed" BOOLEAN NOT NULL DEFAULT FALSE,
    "user_id" UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),

    CONSTRAINT "Cases_pkey" PRIMARY KEY ("idCase"),
    CONSTRAINT "Cases_idInfringer_fkey" FOREIGN KEY ("idInfringer")
        REFERENCES public."Contacts" ("idInfringer")
        ON DELETE CASCADE
);

CREATE INDEX "idx_cases_idInfringer" ON public."Cases"("idInfringer");
CREATE INDEX "idx_cases_created_scrubbed" ON public."Cases"("createdAt", "isScrubbed");
CREATE INDEX "idx_cases_user" ON public."Cases"("user_id");


-- 3. Create the 'Images' Table
CREATE TABLE public."Images" (
    "idImage" UUID NOT NULL DEFAULT gen_random_uuid(),
    "idCase" UUID NOT NULL,
    "catalogImagePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "user_id" UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),

    CONSTRAINT "Images_pkey" PRIMARY KEY ("idImage"),
    CONSTRAINT "Images_idCase_fkey" FOREIGN KEY ("idCase")
        REFERENCES public."Cases" ("idCase")
        ON DELETE CASCADE
);
CREATE INDEX "idx_images_user" ON public."Images"("user_id");

-- 4. Create the 'AutomationsConfig' Table
CREATE TABLE public."AutomationsConfig" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "toolId" TEXT NOT NULL UNIQUE,
    "configuration" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "user_id" UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),

    CONSTRAINT "AutomationsConfig_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "idx_automations_user" ON public."AutomationsConfig"("user_id");

-- 5. Create the 'Invoices' Table
CREATE TABLE public."Invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "amount" NUMERIC(10, 2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'HUF',
    "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT FALSE,
    "sentReminderCount" INTEGER NOT NULL DEFAULT 0,
    "lastReminderSentAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "user_id" UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),

    CONSTRAINT "Invoices_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Invoices_caseId_fkey" FOREIGN KEY ("caseId")
        REFERENCES public."Cases" ("idCase")
        ON DELETE CASCADE
);
CREATE INDEX "idx_invoices_duedate_ispaid" ON public."Invoices"("dueDate", "isPaid");
CREATE INDEX "idx_invoices_user" ON public."Invoices"("user_id");

-- 6. Create the 'AuditLogs' Table (Append-Only)
CREATE TABLE public."AuditLogs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
    "action" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT "AuditLogs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "idx_auditlogs_user" ON public."AuditLogs"("user_id");


-- ==========================================
-- POSTGRES FUNCTIONS (RPC)
-- ==========================================

-- Function for fuzzy matching companies
CREATE OR REPLACE FUNCTION search_conflicts_fuzzy(search_term TEXT)
RETURNS TABLE (
    "idInfringer" UUID,
    "company" TEXT,
    "similarity" REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c."idInfringer",
        c."company",
        similarity(c."company", search_term) AS "similarity"
    FROM public."Contacts" c
    WHERE c."company" % search_term -- The % operator uses the trigram index
    ORDER BY similarity DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public."Contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ContactPhones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Cases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AutomationsConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditLogs" ENABLE ROW LEVEL SECURITY;

-- Authenticated User Policies (Restrict access to their own data)
CREATE POLICY "Users can only access their own Contacts" ON public."Contacts" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own ContactPhones" ON public."ContactPhones" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own Cases" ON public."Cases" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own Images" ON public."Images" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own Automations" ON public."AutomationsConfig" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own Invoices" ON public."Invoices" FOR ALL USING (auth.uid() = user_id);

-- AuditLogs Append-Only Policy
CREATE POLICY "Users can insert audit logs" ON public."AuditLogs" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own audit logs" ON public."AuditLogs" FOR SELECT USING (auth.uid() = user_id);
-- No UPDATE or DELETE policies created for AuditLogs, enforcing append-only behavior.
