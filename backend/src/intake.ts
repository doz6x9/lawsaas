import express from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
import { v4 as uuidv4 } from 'uuid';

export const intakeRouter = express.Router();

// Strict TypeScript Interfaces for the Intake Payload
export interface IntakeSubmission {
  customerName: string;
  company: string;
  phone: string;
  imageUrls: string[];
}

// Lazy initialization of Supabase client
let supabase: SupabaseClient | null = null;

function getSupabaseClient() {
  if (supabase) return supabase;

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

/**
 * Helper: Fetches an image from a URL and returns it as an ArrayBuffer.
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
 * Generates the Word Document Demand Letter.
 */
async function generateDemandLetter(data: IntakeSubmission, idCase: string): Promise<Buffer> {
  const docChildren: any[] = [
    new Paragraph({
      children: [
        new TextRun({ text: 'Ügyvédi Felszólító Levél (Demand Letter)', bold: true, size: 36 }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Ügyszám (Case ID): ', bold: true }),
        new TextRun(idCase),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Ügyfél neve: ', bold: true }),
        new TextRun(data.customerName),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Cégnév: ', bold: true }),
        new TextRun(data.company),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Telefonszám: ', bold: true }),
        new TextRun(data.phone),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Csatolt Bizonyítékok (Evidence):', bold: true }),
      ],
    }),
    new Paragraph({ text: '' }),
  ];

  // Fetch and inject images
  if (data.imageUrls && data.imageUrls.length > 0) {
    for (const url of data.imageUrls) {
      if (!url.trim()) continue;

      try {
        const imageBuffer = await fetchImageBuffer(url);
        docChildren.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: Buffer.from(imageBuffer),
                transformation: {
                  width: 400,
                  height: 300,
                },
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Forrás link: ${url}`, size: 16, italics: true })
            ]
          }),
          new Paragraph({ text: '' }) // spacer
        );
      } catch (err) {
        console.error(`Error fetching image for intake Case ${idCase} from URL ${url}:`, err);
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `[Nem sikerült letölteni a képet: ${url}]`, color: 'FF0000' })
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
          new TextRun({ text: '[Nincsenek megadva bizonyíték linkek]', italics: true })
        ]
      }),
      new Paragraph({ text: '' })
    );
  }

  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Szigorúan bizalmas - Csak belső használatra.', italics: true, size: 20 }),
      ],
    })
  );

  const doc = new Document({
    creator: 'Legal Automation Engine',
    description: `Felszólító levél: ${data.customerName}`,
    sections: [{ properties: {}, children: docChildren }],
  });

  return await Packer.toBuffer(doc);
}

/**
 * POST /api/intake/submit
 * Handles public form submissions.
 */
intakeRouter.post('/submit', async (req, res) => {
  try {
    const payload: IntakeSubmission = req.body;

    // Basic Validation
    if (!payload.customerName || !payload.company || !payload.phone) {
      return res.status(400).json({ error: 'Minden kötelező mezőt ki kell tölteni (Név, Cégnév, Telefon).' });
    }

    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase configuration is missing. Cannot save intake.');
    }

    // 1. Check if Contact (Company) already exists, otherwise Insert
    let idInfringer: string;

    const { data: existingContact, error: checkError } = await client
      .from('Contacts')
      .select('idInfringer')
      .eq('company', payload.company)
      .limit(1)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means zero rows found, which is fine
      throw new Error(`Failed to check existing contacts: ${checkError.message}`);
    }

    if (existingContact) {
      idInfringer = existingContact.idInfringer;
      // Optional: Update phone number if it changed
    } else {
      idInfringer = uuidv4();
      const { error: insertContactError } = await client
        .from('Contacts')
        .insert({
          idInfringer,
          company: payload.company,
          phone: payload.phone,
          phone1: payload.phone
        });

      if (insertContactError) {
        throw new Error(`Failed to insert new contact: ${insertContactError.message}`);
      }
    }

    // 2. Insert Case
    const idCase = uuidv4();
    const { error: insertCaseError } = await client
      .from('Cases')
      .insert({
        idCase,
        customerName: payload.customerName,
        idInfringer,
        // Optional: generate a generic pass or link to client ID
      });

    if (insertCaseError) {
      throw new Error(`Failed to create case: ${insertCaseError.message}`);
    }

    // 3. Insert Images
    if (payload.imageUrls && payload.imageUrls.length > 0) {
      const imageRecords = payload.imageUrls
        .filter(url => url.trim() !== '')
        .map(url => ({
          idCase,
          catalogImagePath: url.trim()
        }));

      if (imageRecords.length > 0) {
        const { error: insertImagesError } = await client
          .from('Images')
          .insert(imageRecords);

        if (insertImagesError) {
          console.error(`Failed to insert image links for case ${idCase}:`, insertImagesError);
          // Non-fatal, continue with generation
        }
      }
    }

    // 4. Generate Document
    const docxBuffer = await generateDemandLetter(payload, idCase);

    // 5. Save Document to Supabase Storage
    const safeName = payload.customerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `felszolito_${safeName}_${idCase.substring(0, 8)}.docx`;

    // Ensure bucket 'generated-documents' exists in Supabase Storage
    const { error: uploadError } = await client.storage
      .from('generated-documents')
      .upload(fileName, docxBuffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        upsert: true
      });

    if (uploadError) {
      console.error(`Failed to upload document to storage:`, uploadError);
      // We still succeeded in creating the case, but document upload failed.
      // Depending on requirements, we could throw here or just log it.
    }

    res.status(200).json({
      success: true,
      message: 'Sikeres beküldés! (Successfully submitted)',
      caseId: idCase
    });

  } catch (error) {
    console.error('Intake submission error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Ismeretlen hiba történt a feldolgozás során.'
    });
  }
});
