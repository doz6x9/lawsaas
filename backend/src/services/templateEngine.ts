import fs from 'fs-extra';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import axios from 'axios';

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
  // 1. Validate template type
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

  // 7. Convert to PDF if requested using ConvertAPI
  if (outputFormat === 'pdf') {
    const convertApiKey = process.env.CONVERTAPI_SECRET;
    if (!convertApiKey) {
      throw new Error('PDF conversion is not available. CONVERTAPI_SECRET is missing from .env file.');
    }

    try {
      console.log(`[TemplateEngine] Converting to PDF using ConvertAPI...`);
      const convertapi = require('convertapi')(convertApiKey);
      const params = convertapi.createParams();
      params.add('File', outputBuffer, `${documentType}.docx`);

      const result = await convertapi.convert('docx', 'pdf', params);

      // Get the first file from the result
      const resultFile = result.files[0];
      if (!resultFile || !resultFile.url) {
        throw new Error('ConvertAPI did not return a valid file.');
      }

      // ConvertAPI returns a URL to the converted file, we need to download it
      const pdfResponse = await axios.get(resultFile.url, { responseType: 'arraybuffer' });
      return Buffer.from(pdfResponse.data);

    } catch (error: any) {
      const detailedError = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error(`[TemplateEngine] Error converting DOCX to PDF via ConvertAPI`, detailedError);
      throw new Error(`Failed to convert document to PDF via ConvertAPI: ${detailedError}`);
    }
  }

  return outputBuffer;
}
