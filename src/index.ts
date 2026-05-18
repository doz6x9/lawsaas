import * as xlsx from 'xlsx';
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    ImageRun,
    VerticalAlign,
    Header,
    Footer,
} from 'docx';
import JSZip from 'jszip';
import { Resend } from 'resend';

// Initialize Resend with API Key (Ensure this is passed via env vars in production)
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

/**
 * Interface representing the expected structure of a row in the uploaded Excel file.
 */
export interface ClientDataRow {
    'Client Name': string;
    'Phone Number': string;
    'Company Name': string;
    'Evidence URL': string; // URL pointing to Supabase Storage
}

/**
 * Configuration options for the batch processing.
 */
export interface ProcessBatchOptions {
    excelBuffer: Buffer;
    recipientEmail: string;
}

/**
 * Validates the parsed headers of the Excel sheet to ensure all required fields are present.
 * Throws an error if any required header is missing.
 *
 * @param headers - Array of header strings from the Excel sheet.
 */
function validateHeaders(headers: string[]): void {
    const requiredHeaders = ['Client Name', 'Phone Number', 'Company Name', 'Evidence URL'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

    if (missingHeaders.length > 0) {
        throw new Error(`Invalid Excel structure. Missing required columns: ${missingHeaders.join(', ')}`);
    }
}

/**
 * Fetches an image from a given URL and returns it as an ArrayBuffer.
 * Useful for fetching evidence images from Supabase Storage.
 *
 * @param url - The URL of the image to fetch.
 * @returns A Promise resolving to the image data as an ArrayBuffer.
 */
async function fetchImageBuffer(url: string): Promise<ArrayBuffer> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
        }
        return await response.arrayBuffer();
    } catch (error) {
        throw new Error(`Error fetching evidence image: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Generates a Word document for a specific client, injecting their details and evidence image.
 *
 * @param client - The client data row.
 * @param imageBuffer - The fetched evidence image buffer.
 * @returns A Promise resolving to the generated .docx file as a Buffer.
 */
async function generateWordDocument(client: ClientDataRow, imageBuffer: ArrayBuffer): Promise<Buffer> {
    // We create a new Document instance for each client
    const doc = new Document({
        creator: 'Legal Automation Engine',
        description: `Legal document for ${client['Client Name']}`,
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'Legal Evidence Report',
                                bold: true,
                                size: 36, // 18pt
                            }),
                        ],
                    }),
                    new Paragraph({ text: '' }), // Spacer
                    new Paragraph({
                        children: [
                            new TextRun({ text: 'Client Name: ', bold: true }),
                            new TextRun(client['Client Name']),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: 'Company Name: ', bold: true }),
                            new TextRun(client['Company Name']),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: 'Phone Number: ', bold: true }),
                            new TextRun(client['Phone Number']),
                        ],
                    }),
                    new Paragraph({ text: '' }), // Spacer
                    new Paragraph({
                        children: [
                            new TextRun({ text: 'Evidence Attached:', bold: true }),
                        ],
                    }),
                    new Paragraph({ text: '' }), // Spacer
                    // Image injection logic
                    new Paragraph({
                        children: [
                            new ImageRun({
                                data: imageBuffer,
                                transformation: {
                                    // Scaling the image to fit within standard margins (approx 6 inches wide)
                                    // Depending on image source, you might need to calculate aspect ratio dynamically
                                    // For this example, we scale to a safe fixed width and height
                                    width: 400,
                                    height: 300,
                                },
                            }),
                        ],
                    }),
                    new Paragraph({ text: '' }), // Spacer
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'Confidential - For internal use only.',
                                italics: true,
                                size: 20, // 10pt
                            }),
                        ],
                    }),
                ],
            },
        ],
    });

    // Package the document into a Buffer in-memory
    const buffer = await Packer.toBuffer(doc);
    return buffer;
}

/**
 * Core processing engine for the document automation SaaS.
 * Takes an uploaded Excel buffer, processes each row, generates Word docs with injected images,
 * packages them into a ZIP archive, and emails the result via Resend.
 *
 * All processing is done in-memory without touching local persistent storage.
 *
 * @param options - Configuration options containing the Excel buffer and recipient email.
 * @returns A Promise resolving to an object indicating success.
 */
export async function processLegalBatch(options: ProcessBatchOptions): Promise<{ success: boolean; message: string }> {
    const { excelBuffer, recipientEmail } = options;

    try {
        console.log('Starting legal batch processing...');

        // 1. Parse the Excel File in-memory
        const workbook = xlsx.read(excelBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON, specifically asking for header row as array first to validate
        const rawData = xlsx.utils.sheet_to_json<any>(worksheet, { header: 1 });
        if (rawData.length === 0) {
            throw new Error('The uploaded Excel file is empty.');
        }

        const headers = rawData[0] as string[];

        // Input Validation: Check for required headers
        validateHeaders(headers);

        // Map data to our typed interface, skipping the header row
        const clientData: ClientDataRow[] = xlsx.utils.sheet_to_json<ClientDataRow>(worksheet);

        if (clientData.length === 0) {
            throw new Error('No client data found in the Excel file.');
        }

        console.log(`Successfully parsed ${clientData.length} client records.`);

        // 2. Initialize JSZip for packaging
        const zip = new JSZip();

        // 3. Process each row
        // Using Promise.all for concurrent processing, but map sequentially if rate limits apply to image fetching
        const processingPromises = clientData.map(async (client, index) => {
            try {
                // Defensive check in case a row is missing the URL
                if (!client['Evidence URL']) {
                    console.warn(`Row ${index + 2}: Missing Evidence URL for ${client['Client Name']}. Skipping.`);
                    return;
                }

                // Asynchronous Image Fetching
                const imageBuffer = await fetchImageBuffer(client['Evidence URL']);

                // Word Template Generation & Image Injection
                const docxBuffer = await generateWordDocument(client, imageBuffer);

                // Add to ZIP archive. Sanitize filename.
                const safeName = client['Client Name'].replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const filename = `legal_report_${safeName}.docx`;

                zip.file(filename, docxBuffer);

                console.log(`Successfully processed document for ${client['Client Name']}`);
            } catch (err) {
                console.error(`Error processing row ${index + 2} for ${client['Client Name']}:`, err);
                // Depending on requirements, we might want to fail the whole batch, or just skip this row.
                // Here, we log the error and skip, so valid ones still get processed.
            }
        });

        await Promise.all(processingPromises);

        // 4. Generate final ZIP buffer
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

        if (Object.keys(zip.files).length === 0) {
            throw new Error('Failed to generate any valid documents from the provided data.');
        }

        console.log(`Packaging complete. Generated ${Object.keys(zip.files).length} files.`);

        // 5. Trigger Transactional Email via Resend
        // Attaching the in-memory zip buffer directly
        const emailResponse = await resend.emails.send({
            from: 'Legal Automation <noreply@yourlegaltech.com>', // Replace with verified domain
            to: [recipientEmail],
            subject: 'Your Legal Document Batch is Ready',
            html: '<p>Hello,</p><p>Your requested batch of legal documents has been successfully processed. Please find the attached ZIP file containing all the generated reports.</p>',
            attachments: [
                {
                    filename: 'legal_documents_batch.zip',
                    content: zipBuffer,
                },
            ],
        });

        if (emailResponse.error) {
            throw new Error(`Failed to send email: ${emailResponse.error.message}`);
        }

        console.log(`Email successfully sent to ${recipientEmail}`);

        return {
            success: true,
            message: 'Batch processed successfully and email sent.',
        };

    } catch (error) {
        console.error('Batch processing failed:', error);
        // Throw a descriptive error to be caught and handled by the calling function/frontend
        throw new Error(error instanceof Error ? error.message : 'An unknown error occurred during batch processing');
    }
}
