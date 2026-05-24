import dotenv from 'dotenv';
dotenv.config(); // Must be at the very top before any other imports that might use process.env

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { processLegalBatch, OutputFormat, getContactsDirectory, searchConflicts, redactDocument } from '../engine';
import { scheduleDataScrubbing } from '../services/retentionService';
import { intakeRouter } from '../intake';
import { automationsRouter } from './automations';
import { automationRoutes } from '../routes/automationRoutes';
import { documentRoutes } from '../routes/documentRoutes';
import JSZip from 'jszip';

const app = express();
const port = process.env.PORT || 3000;

// Initialize Automated Background Jobs
scheduleDataScrubbing();

// Increase body limit for large base64 JSON responses
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Register routers
app.use('/api/intake', intakeRouter);
app.use('/api/automations', automationsRouter); // Config API
app.use('/api/automations', automationRoutes);  // Action API
app.use('/api/documents', documentRoutes);      // Template Engine API

/**
 * Health check endpoint to verify backend is running.
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is healthy' });
});

/**
 * Endpoint to execute conflict of interest full-text search
 */
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.query as string;
    if (!query) {
      return res.status(400).json({ error: 'Search query parameter is required.' });
    }
    const results = await searchConflicts(query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred during search'
    });
  }
});

/**
 * Endpoint to fetch the contacts directory.
 */
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await getContactsDirectory();
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred while fetching contacts'
    });
  }
});

/**
 * Endpoint to process uploaded Excel files.
 */
app.post('/api/upload', upload.fields([
  { name: 'excel', maxCount: 1 }
]), async (req, res, next) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const outputFormat = (req.body.outputFormat as OutputFormat) || 'both';
    const importContacts = req.body.importContacts === 'true';

    if (!['excel', 'docx', 'both'].includes(outputFormat)) {
      return res.status(400).json({ error: 'Invalid output format selected.' });
    }

    if (!files || !files.excel || files.excel.length === 0) {
      return res.status(400).json({ error: 'Excel dataset is required.' });
    }

    const excelFile = files.excel[0];

    // Trigger the engine processing which now returns an array of files with base64 content
    const processedFiles = await processLegalBatch(excelFile.buffer, outputFormat, importContacts);

    res.status(200).json({
      message: 'Batch processed successfully.',
      files: processedFiles
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred during batch processing'
    });
  }
});

/**
 * Endpoint to redact sensitive information from multiple DOCX files.
 */
app.post('/api/redact-documents', upload.array('documents'), async (req, res, next) => {
  try {
    const files = req.files as Express.Multer.File[];
    let targets: string[] = [];

    if (req.body.targets) {
      try {
        targets = JSON.parse(req.body.targets);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid targets array format.' });
      }
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Document files are required.' });
    }

    const zip = new JSZip();
    for (const docFile of files) {
      const redactedBuffer = await redactDocument(docFile.buffer, targets);
      zip.file(`redacted_${docFile.originalname}`, redactedBuffer);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename=redacted_documents.zip');
    res.send(zipBuffer);

  } catch (error) {
    console.error('Redaction error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred during redaction'
    });
  }
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// For local development, listen on a port
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
  });
}

export default app;
