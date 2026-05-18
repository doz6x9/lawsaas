import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
import axios from 'axios';
import { getSupabaseClient } from '../utils/supabaseClient';

export interface DemandLetterData {
  caseId: string;
  customerName: string;
  company: string;
  phone: string;
  details?: string;
}

/**
 * Generates a demand letter and uploads it to Supabase storage.
 * @param caseData Core case information to populate the document.
 * @param imageUrls Array of public URLs pointing to evidence images.
 * @returns The secure public URL of the generated document.
 */
export async function generateDemandLetter(caseData: DemandLetterData, imageUrls: string[] = []): Promise<string> {
  const docChildren: any[] = [
    new Paragraph({
      children: [
        new TextRun({ text: 'Formal Demand Letter', bold: true, size: 36 }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Case ID: ', bold: true }),
        new TextRun(caseData.caseId),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Client Name: ', bold: true }),
        new TextRun(caseData.customerName),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Opposing Company: ', bold: true }),
        new TextRun(caseData.company),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Contact Phone: ', bold: true }),
        new TextRun(caseData.phone),
      ],
    }),
    new Paragraph({ text: '' }),
  ];

  if (caseData.details) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Case Details:', bold: true }),
        ],
      }),
      new Paragraph({ text: caseData.details }),
      new Paragraph({ text: '' })
    );
  }

  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Attached Evidence:', bold: true }),
      ],
    }),
    new Paragraph({ text: '' })
  );

  // Safely fetch and inject images
  if (imageUrls.length > 0) {
    for (const url of imageUrls) {
      if (!url || url.trim() === '') continue;

      try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
        const imageBuffer = Buffer.from(response.data);

        docChildren.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 400,
                  height: 300,
                },
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Source Link: ${url}`, size: 16, italics: true }),
            ]
          }),
          new Paragraph({ text: '' })
        );
      } catch (err) {
        console.error(`[DocGen] Error fetching image from ${url}:`, err instanceof Error ? err.message : String(err));
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `[Error: Failed to load image from URL: ${url}]`, color: 'FF0000' })
            ]
          }),
          new Paragraph({ text: '' })
        );
      }
    }
  } else {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: '[No evidence links provided for this case]', italics: true })
        ]
      }),
      new Paragraph({ text: '' })
    );
  }

  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Confidential - For Internal Use Only.', italics: true, size: 20 }),
      ],
    })
  );

  const doc = new Document({
    creator: 'Legal Automation Engine',
    description: `Demand Letter for ${caseData.customerName}`,
    sections: [{ properties: {}, children: docChildren }],
  });

  const buffer = await Packer.toBuffer(doc);

  // Clean filename
  const safeName = caseData.customerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const timestamp = Date.now();
  const fileName = `demand_letter_${safeName}_${timestamp}.docx`;

  const supabase = getSupabaseClient();

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('generated-docs')
    .upload(fileName, buffer, {
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      upsert: true
    });

  if (uploadError) {
    throw new Error(`Failed to upload document to Supabase storage: ${uploadError.message}`);
  }

  // Retrieve public URL
  const { data: publicUrlData } = supabase.storage
    .from('generated-docs')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}
