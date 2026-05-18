import express from 'express';
import { generateDemandLetter, DemandLetterData } from '../services/docGenService';
import { runConflictCheck } from '../services/conflictService';

export const automationRoutes = express.Router();

/**
 * POST /api/automations/generate-document
 * Triggers the document assembly engine for a specific case.
 */
automationRoutes.post('/generate-document', async (req, res) => {
  try {
    const { caseData, imageUrls } = req.body;

    if (!caseData || !caseData.caseId || !caseData.customerName || !caseData.company) {
      return res.status(400).json({ error: 'Incomplete caseData provided.' });
    }

    const documentUrl = await generateDemandLetter(caseData as DemandLetterData, imageUrls || []);

    res.status(200).json({
      success: true,
      message: 'Document generated successfully.',
      documentUrl
    });

  } catch (error) {
    console.error('[AutomationRoutes] Generate Document Error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal Server Error during document generation.'
    });
  }
});

/**
 * POST /api/automations/conflict-check
 * Triggers the full-text conflict search engine.
 */
automationRoutes.post('/conflict-check', async (req, res) => {
  try {
    const { searchQuery } = req.body;

    if (!searchQuery || typeof searchQuery !== 'string') {
      return res.status(400).json({ error: 'A valid search query string is required.' });
    }

    const report = await runConflictCheck(searchQuery);

    res.status(200).json({
      success: true,
      report
    });

  } catch (error) {
    console.error('[AutomationRoutes] Conflict Check Error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal Server Error during conflict check.'
    });
  }
});
