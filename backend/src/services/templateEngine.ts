import fs from 'fs-extra'; // Using fs-extra for promise-based file operations
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import libreoffice from 'libreoffice-convert'; // No types available, will be treated as 'any'
import { promisify } from 'util';

import { TEMPLATE_CONFIGS, TemplatePayload, OutputFormat } from '../types/templates';

// Promisify libreoffice.convert, casting libreoffice to any to bypass TS error for missing types
const convertToPdf = promisify((libreoffice as any).convert);

/**
 * Generates an EU-specific legal document by populating a base .docx template with the provided payload.
 * Can output as DOCX or PDF.
 *
 * @param documentType The ID of the template (e.g., 'EuLatePaymentDemand').
 * @param payload The JSON object containing the fields to inject into the template.
 * @param outputFormat The desired output format ('docx' or 'pdf').
 * @returns A Promise resolving to the generated document as a Buffer.
 */
export async function generateEUDocument(documentType: string, payload: TemplatePayload, outputFormat: OutputFormat): Promise<Buffer> {
  // 1. Validate template type
  const templateConfig = TEMPLATE_CONFIGS.find(config => config.id === documentType);
  if (!templateConfig) {
    throw new Error(`Unsupported document type: ${documentType}.`);
  }

  // 2. Resolve template path
  // We assume a folder structure like: backend/storage/templates/EuLatePaymentDemand.docx
  const templatePath = path.resolve(__dirname, '../../storage/templates', `${documentType}.docx`);

  // 3. Read base template
  let content: Buffer;
  try {
    content = await fs.readFile(templatePath);
  } catch (error) {
    console.error(`[TemplateEngine] Missing template file at ${templatePath}`, error);
    throw new Error(`The base template for '${documentType}' was not found on the server. Please ensure ${documentType}.docx exists in the storage/templates directory.`);
  }

  // 4. Initialize PizZip and Docxtemplater
  let zip: PizZip;
  try {
    zip = new PizZip(content);
  } catch (error) {
    console.error(`[TemplateEngine] Failed to initialize PizZip for ${documentType}`, error);
    throw new Error('Failed to parse the base document template. Ensure it is a valid .docx file.');
  }

  let doc: Docxtemplater;
  try {
    doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      // You can add more options here, e.g., for strict rendering or custom delimiters
      // For example, to handle missing variables gracefully:
      //  nullGetter: function(part) {
      //    if (!part.module) {
      //      return "undefined";
      //    }
      //    if (part.module === "rawxml") {
      //      return "";
      //    }
      //    return "";
      //  },
    });
  } catch (error) {
    console.error(`[TemplateEngine] Failed to initialize Docxtemplater for ${documentType}`, error);
    throw new Error('Failed to initialize the document templating engine.');
  }

  // 5. Render the payload
  try {
    doc.render(payload);
  } catch (error: any) {
    // Distinguish between rendering errors and other errors
    if (error.properties && error.properties.errors && error.properties.errors.length > 0) {
      const firstError = error.properties.errors[0];
      console.error(`[TemplateEngine] Docxtemplater rendering error: ${firstError.message}`, firstError);
      throw new Error(`Template rendering error: ${firstError.message} (Context: ${firstError.context})`);
    }
    console.error(`[TemplateEngine] Error rendering ${documentType} with payload:`, payload, error);
    throw new Error(`Failed to populate the template: ${error.message || 'Unknown rendering error.'}`);
  }

  // 6. Generate the final buffer (DOCX)
  let outputBuffer: Buffer;
  try {
    outputBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
  } catch (error) {
    console.error(`[TemplateEngine] Error generating final DOCX buffer for ${documentType}`, error);
    throw new Error('Failed to generate the final DOCX document buffer.');
  }

  // 7. Convert to PDF if requested
  if (outputFormat === 'pdf') {
    try {
      // Ensure LibreOffice is installed and accessible in the environment
      // This conversion can be resource-intensive and might require a dedicated service
      const pdfBuffer = await convertToPdf(outputBuffer, '.pdf', undefined); // undefined for default filters
      return pdfBuffer;
    } catch (error) {
      console.error(`[TemplateEngine] Error converting DOCX to PDF for ${documentType}`, error);
      throw new Error('Failed to convert document to PDF. Ensure LibreOffice is installed and accessible on the server path.');
    }
  }

  return outputBuffer;
}
