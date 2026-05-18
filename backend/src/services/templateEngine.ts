import fs from 'fs-extra';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import axios from 'axios';
import FormData from 'form-data';

// Note: TEMPLATE_CONFIGS was moved to the frontend. We validate using SUPPORTED_TEMPLATES.
import { SUPPORTED_TEMPLATES, TemplatePayload, OutputFormat } from '../types/templates';

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
  // 1. Validate template type using the simple array
  if (!SUPPORTED_TEMPLATES.includes(documentType)) {
    throw new Error(`Unsupported document type: ${documentType}. Supported types are: ${SUPPORTED_TEMPLATES.join(', ')}`);
  }

  // 2. Resolve template path
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
    });
  } catch (error) {
    console.error(`[TemplateEngine] Failed to initialize Docxtemplater for ${documentType}`, error);
    throw new Error('Failed to initialize the document templating engine.');
  }

  // 5. Render the payload
  try {
    doc.render(payload);
  } catch (error: any) {
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
      // Default to port 3001 or whatever the user configures, to avoid hitting the Express server itself on 3000
      const gotenbergUrl = process.env.GOTENBERG_URL || 'http://localhost:3001';

      const form = new FormData();
      form.append('files', outputBuffer, {
        filename: `${documentType}.docx`,
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      console.log(`[TemplateEngine] Sending request to Gotenberg at ${gotenbergUrl}/forms/libreoffice/convert`);

      const response = await axios.post(`${gotenbergUrl}/forms/libreoffice/convert`, form, {
        headers: form.getHeaders(),
        responseType: 'arraybuffer', // Expecting PDF buffer
        timeout: 15000 // 15 second timeout
      });

      return Buffer.from(response.data);
    } catch (error: any) {
      console.error(`[TemplateEngine] Error converting DOCX to PDF via Gotenberg`, error.message);

      let errorMessage = 'Failed to convert document to PDF. ';
      if (error.code === 'ECONNREFUSED') {
         errorMessage += `Could not connect to Gotenberg service at ${process.env.GOTENBERG_URL || 'http://localhost:3001'}. Is the Docker container running?`;
      } else if (error.response && error.response.status === 404) {
         errorMessage += `Gotenberg service returned 404. Ensure you are not pointing GOTENBERG_URL to the Express backend itself.`;
      } else {
         errorMessage += error.message;
      }

      throw new Error(errorMessage);
    }
  }

  return outputBuffer;
}
