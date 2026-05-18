import cron from 'node-cron';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization of Supabase client to ensure process.env is loaded
let supabase: SupabaseClient | null = null;

function getSupabaseClient() {
  if (supabase) return supabase;

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

/**
 * Executes the data scrubbing process for GDPR compliance.
 * Runs on a schedule.
 */
export async function performDataScrubbing() {
  console.log('[GDPR Retention Service] Starting scheduled data scrubbing process...');

  const client = getSupabaseClient();
  if (!client) {
    console.error('[GDPR Retention Service] ERROR: Supabase credentials missing. Aborting scrub.');
    return;
  }

  try {
    // 1. Find all cases older than 30 days that haven't been scrubbed yet.
    // Calculate the date 30 days ago
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - 30);
    const retentionDateIso = retentionDate.toISOString();

    console.log(`[GDPR Retention Service] Querying cases older than ${retentionDateIso} ...`);

    const { data: oldCases, error: casesError } = await client
      .from('Cases')
      .select('idCase, idInfringer')
      .lt('createdAt', retentionDateIso)
      .eq('isScrubbed', false);

    if (casesError) {
      throw new Error(`Failed to query old cases: ${casesError.message}`);
    }

    if (!oldCases || oldCases.length === 0) {
      console.log('[GDPR Retention Service] No eligible cases found for scrubbing today.');
      return;
    }

    console.log(`[GDPR Retention Service] Found ${oldCases.length} cases to scrub.`);

    // 2. Iterate and securely scrub each case
    let successCount = 0;
    let failCount = 0;

    for (const caseRecord of oldCases) {
      try {
        console.log(`[GDPR Retention Service] Scrubbing Case ID: ${caseRecord.idCase}`);

        // Step A: Find and Delete raw images from Supabase Storage
        const { data: images, error: imagesError } = await client
          .from('Images')
          .select('idImage, catalogImagePath')
          .eq('idCase', caseRecord.idCase);

        if (imagesError) {
          throw new Error(`Failed to fetch images for case: ${imagesError.message}`);
        }

        if (images && images.length > 0) {
          // Assuming images are stored in a Supabase Storage bucket named 'evidence'
          // And catalogImagePath stores the file path within the bucket
          const pathsToDelete = images.map(img => img.catalogImagePath);

          // We check if it's a full URL or a relative bucket path. If it's an external URL,
          // we can't delete it from storage, but we can delete the record.
          // Assuming the requirement meant deleting from Supabase Storage buckets if they are stored there.
          const localPaths = pathsToDelete.filter(path => !path.startsWith('http'));

          if (localPaths.length > 0) {
            const { error: storageError } = await client.storage
              .from('evidence')
              .remove(localPaths);

            if (storageError) {
              throw new Error(`Supabase Storage deletion failed: ${storageError.message}`);
            }
          }

          // Optional: We might also want to delete the Image metadata records,
          // or just leave them but they won't point anywhere. Let's delete the records to be safe.
          const { error: deleteImagesErr } = await client
            .from('Images')
            .delete()
            .eq('idCase', caseRecord.idCase);

          if (deleteImagesErr) {
            console.warn(`[GDPR Retention Service] Failed to delete Image metadata records: ${deleteImagesErr.message}`);
          }
        }

        // Step B: Nullify or mask contact information (PII)
        if (caseRecord.idInfringer) {
          // We mask the Phone and Company details for this contact.
          // Note: If multiple cases share the same infringer, and only ONE case is older than 30 days,
          // masking the contact will affect the newer cases too. In a fully robust GDPR system,
          // PII should be strictly decoupled or ref-counted, but per prompt requirements:
          const { error: contactError } = await client
            .from('Contacts')
            .update({
              company: 'REDACTED_GDPR',
              phone: 'REDACTED_GDPR',
              phone1: 'REDACTED_GDPR'
            })
            .eq('idInfringer', caseRecord.idInfringer);

          if (contactError) {
            throw new Error(`Failed to mask contact PII: ${contactError.message}`);
          }
        }

        // Step C: Mark the Case as scrubbed
        const { error: updateCaseError } = await client
          .from('Cases')
          .update({ isScrubbed: true })
          .eq('idCase', caseRecord.idCase);

        if (updateCaseError) {
          throw new Error(`Failed to update isScrubbed flag: ${updateCaseError.message}`);
        }

        successCount++;
        console.log(`[GDPR Retention Service] Successfully scrubbed Case ID: ${caseRecord.idCase}`);

      } catch (caseErr) {
        failCount++;
        // Strict error logging as required. The isScrubbed flag remains false.
        console.error(`[GDPR Retention Service] ERROR during scrubbing Case ID ${caseRecord.idCase}:`, caseErr);
      }
    }

    console.log(`[GDPR Retention Service] Scrubbing cycle complete. Success: ${successCount}, Failed: ${failCount}.`);

  } catch (err) {
    console.error('[GDPR Retention Service] FATAL ERROR during scrubbing cycle:', err);
  }
}

/**
 * Initializes the cron job to run the scrubbing service every night at 02:00 AM.
 */
export function scheduleDataScrubbing() {
  // '0 2 * * *' = run at 02:00 AM every day
  cron.schedule('0 2 * * *', () => {
    performDataScrubbing();
  }, {
    scheduled: true,
    timezone: "Europe/Budapest" // Ensuring it aligns with Hungarian time
  });

  console.log('[GDPR Retention Service] Scheduled daily data scrubbing at 02:00 AM (Europe/Budapest).');
}
