import express from 'express';
import { generateEUDocument } from '../services/templateEngine';
// Only import what is actually exported from types/templates.ts
import { TemplatePayload, OutputFormat, SUPPORTED_TEMPLATES } from '../types/templates';
import { getSupabaseClient } from '../utils/supabaseClient';

export const documentRoutes = express.Router();

/**
 * POST /api/documents/generate
 * Generates an EU-specific legal document from a base template.
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

    if (!SUPPORTED_TEMPLATES.includes(documentType)) {
      return res.status(400).json({
        error: `Unsupported document type: ${documentType}.`,
        supportedTypes: SUPPORTED_TEMPLATES
      });
    }

    const validOutputFormat: OutputFormat = outputFormat === 'pdf' ? 'pdf' : 'docx';

    console.log(`[DocumentRoutes] Generating document type: ${documentType} as ${validOutputFormat}`);

    // 2. Generate Document
    const documentBuffer = await generateEUDocument(documentType, payload as TemplatePayload, validOutputFormat);

    // 3. Audit Log the Action
    const client = getSupabaseClient();
    if (client) {
       await client.from('AuditLogs').insert({
         action: 'DOCUMENT_GENERATED',
         resourceId: documentType,
         details: {
           format: validOutputFormat,
           // Do not log sensitive PII payload, just metadata
           timestamp: new Date().toISOString()
         }
       });
    }

    // 4. Send Response
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
