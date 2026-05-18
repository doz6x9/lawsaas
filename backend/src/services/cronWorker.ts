import cron from 'node-cron';
import { getSupabaseClient } from '../utils/supabaseClient';

// Store dynamic jobs so we can stop/restart them if configs change
const activeCronJobs: Record<string, cron.ScheduledTask> = {};

/**
 * Executes the daily deadline alert check.
 */
async function runDeadlineCheck() {
  console.log('[CronWorker] Running deadline check...');
  const client = getSupabaseClient();

  // For MVP: cases created 12 days ago, assuming a 15 day deadline
  const twelveDaysAgo = new Date();
  twelveDaysAgo.setDate(twelveDaysAgo.getDate() - 12);

  try {
    const { data: activeCases, error } = await client
      .from('Cases')
      .select('idCase, customerName, createdAt')
      .lt('createdAt', twelveDaysAgo.toISOString())
      .eq('isScrubbed', false);

    if (error) throw error;

    if (!activeCases || activeCases.length === 0) {
      console.log('[CronWorker] No upcoming deadlines found.');
      return;
    }

    console.log(`[CronWorker] Found ${activeCases.length} cases requiring attention.`);
    // In a real scenario, this would trigger a Teams notification, a dashboard alert, etc.
    console.log(`[CronWorker] Alert for cases: ${activeCases.map(c => c.idCase).join(', ')}`);

  } catch (err) {
    console.error('[CronWorker] Error executing deadline check:', err);
  }
}

/**
 * Executes the invoice reminder check.
 */
async function runInvoiceReminder(overdueThreshold: number) {
  console.log(`[CronWorker] Running invoice reminder for >${overdueThreshold} days overdue...`);
  const client = getSupabaseClient();
  const now = new Date();
  const overdueDate = new Date(now);
  overdueDate.setDate(now.getDate() - overdueThreshold);

  try {
    // Find overdue invoices that are not paid and have not sent a reminder today
    const { data: overdueInvoices, error } = await client
      .from('Invoices')
      .select('id, caseId, amount, currency, dueDate, recipientEmail, sentReminderCount')
      .eq('isPaid', false)
      .lt('dueDate', overdueDate.toISOString()) // Due date is older than (now - threshold)
      .or(`lastReminderSentAt.is.null,lastReminderSentAt.lt.${now.toISOString().split('T')[0]}`); // Not sent today

    if (error) throw error;

    if (!overdueInvoices || overdueInvoices.length === 0) {
      console.log('[CronWorker] No overdue invoices found requiring reminders.');
      return;
    }

    console.log(`[CronWorker] Found ${overdueInvoices.length} overdue invoices.`);
    // In a real scenario, this would trigger a notification to a billing system, a dashboard alert, etc.
    overdueInvoices.forEach(invoice => {
      console.log(`[CronWorker] Reminder for Invoice ${invoice.id} (Case: ${invoice.caseId}, Due: ${new Date(invoice.dueDate).toLocaleDateString()})`);
    });

    // Update invoice record: increment reminder count and set last sent date
    // (We still update the reminder count even if no email is sent, to track attempts)
    for (const invoice of overdueInvoices) {
      const { error: updateError } = await client
        .from('Invoices')
        .update({
          sentReminderCount: invoice.sentReminderCount + 1,
          lastReminderSentAt: new Date().toISOString()
        })
        .eq('id', invoice.id);

      if (updateError) {
        console.error(`[CronWorker] Failed to update reminder count for invoice ${invoice.id}:`, updateError.message);
      }
    }

  } catch (err) {
    console.error('[CronWorker] Error executing invoice reminder check:', err);
  }
}

/**
 * Syncs cron jobs based on the AutomationsConfig table.
 * This runs periodically to detect new configurations saved via the frontend.
 */
export async function syncDynamicAutomations() {
  console.log('[CronWorker] Syncing dynamic automation configs from database...');
  const client = getSupabaseClient();

  try {
    const { data: configs, error } = await client
      .from('AutomationsConfig')
      .select('*')
      .eq('isActive', true);

    if (error) {
      // If table doesn't exist yet, just return
      if (error.code === '42P01') return;
      throw error;
    }

    // Process Court Deadline Alert
    const deadlineConfig = configs.find((c: any) => c.toolId === 'court-deadline-alert');
    if (deadlineConfig) {
      const alertTime = deadlineConfig.configuration.alertTime || '08:00';
      const [hour, minute] = alertTime.split(':');

      const cronExpression = `${minute} ${hour} * * *`;
      const jobId = 'court-deadline-alert';

      if (activeCronJobs[jobId]) {
        activeCronJobs[jobId].stop(); // Stop existing job to reschedule
      }

      activeCronJobs[jobId] = cron.schedule(cronExpression, () => {
        runDeadlineCheck(); // No email parameter needed
      }, { scheduled: true, timezone: "Europe/Budapest" });

      console.log(`[CronWorker] Synced: Court Deadline Alert scheduled at ${alertTime}`);
    } else {
      if (activeCronJobs['court-deadline-alert']) {
        activeCronJobs['court-deadline-alert'].stop();
      }
    }

    // Process Invoice Reminder
    const invoiceConfig = configs.find((c: any) => c.toolId === 'invoice-reminder');
    if (invoiceConfig) {
      const threshold = parseInt(invoiceConfig.configuration.overdueThreshold || '5');
      // replyTo is no longer used for sending emails, but might be useful for logging or other actions
      const replyTo = invoiceConfig.configuration.replyTo || 'finance@lawfirm.com';

      const jobId = 'invoice-reminder';
      if (activeCronJobs[jobId]) activeCronJobs[jobId].stop();

      // Schedule at 09:00 AM daily
      activeCronJobs[jobId] = cron.schedule('0 9 * * *', () => {
        runInvoiceReminder(threshold); // No replyTo parameter needed
      }, { scheduled: true, timezone: "Europe/Budapest" });

      console.log(`[CronWorker] Synced: Invoice Reminder scheduled at 09:00 AM (Threshold: ${threshold})`);
    } else {
      if (activeCronJobs['invoice-reminder']) {
        activeCronJobs['invoice-reminder'].stop();
      }
    }

  } catch (err) {
    console.error('[CronWorker] Error syncing dynamic automations:', err);
  }
}

/**
 * Initializes the automated cron worker for the server.
 */
export function initializeCronWorker() {
  // Sync immediately on startup
  syncDynamicAutomations();

  // Also, set up a master cron to re-sync configs every 10 minutes,
  // allowing the backend to pick up changes made by the frontend dynamically
  // without needing a server restart.
  cron.schedule('*/10 * * * *', () => {
    syncDynamicAutomations();
  });

  console.log('[CronWorker] Initialized dynamic configuration sync loop (runs every 10 mins).');
}
