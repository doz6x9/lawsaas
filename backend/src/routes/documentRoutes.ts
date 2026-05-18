import express from 'express';
import { generateEUDocument } from '../services/templateEngine';
import { TEMPLATE_CONFIGS, TemplatePayload, OutputFormat } from '../types/templates';

export const documentRoutes = express.Router();

/**
 * POST /api/documents/generate
 * Generates an EU-specific legal document from a base template.
 *
 * Expected Body:
 * {
 *   "documentType": "EuLatePaymentDemand",
 *   "payload": {
 *      "CreditorName": "...",
 *      "DebtorName": "...",
 *      ...
 *   },
 *   "outputFormat": "docx" | "pdf"
 * }
 */
documentRoutes.post('/generate', async (req, res) => {
  try {
    const { documentType, payload, outputFormat } = req.body;

    // 1. Validate Input
    if (!documentType || typeof documentType !== 'string') {
      return res.status(400).json({ error: 'documentType is required and must be a string.' });
    }

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'payload is required and must be a JSON object.' });
    }

    const validOutputFormat: OutputFormat = outputFormat === 'pdf' ? 'pdf' : 'docx';

    const templateConfig = TEMPLATE_CONFIGS.find(config => config.id === documentType);
    if (!templateConfig) {
      return res.status(400).json({
        error: `Unsupported document type: ${documentType}.`,
        supportedTypes: TEMPLATE_CONFIGS.map(c => c.id)
      });
    }

    // Basic payload validation against the schema (can be expanded with a validation library)
    for (const field of templateConfig.fields) {
      if (field.required && (payload[field.id] === undefined || payload[field.id] === null || payload[field.id] === '')) {
        return res.status(400).json({ error: `Missing required field: ${field.label} (${field.id})` });
      }
    }

    console.log(`[DocumentRoutes] Generating document type: ${documentType} as ${validOutputFormat}`);

    // 2. Generate Document
    const documentBuffer = await generateEUDocument(documentType, payload as TemplatePayload, validOutputFormat);

    // 3. Send Response
    const fileExtension = validOutputFormat === 'pdf' ? 'pdf' : 'docx';
    const contentType = validOutputFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const filename = `${documentType}_Generated_${Date.now()}.${fileExtension}`;

    res.set('Content-Type', contentType);
    res.set('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(documentBuffer);

  } catch (error) {
    console.error('[DocumentRoutes] Error generating document:', error);

    // Distinguish between missing template (404) and processing error (500)
    if (error instanceof Error && error.message.includes('not found on the server')) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred during document generation.'
    });
  }
});
