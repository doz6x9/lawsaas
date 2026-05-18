import * as ExcelJS from 'exceljs';
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';

// 1. Strict TypeScript Interfaces
export interface CaseEntity {
  idCase: string; // Now UUID
  pass: string;
  customerName: string;
  idClient: string;
  idInfringer: string; // Now UUID
}

export interface ContactEntity {
  idInfringer: string; // Now UUID
  company: string;
  phone1: string; // This is raw from excel, will be mapped to ContactPhones
}

export interface AggregatedCase {
  caseData: CaseEntity;
  contactData: ContactEntity | null;
  imageUrls: string[];
}

export interface ProcessedFile {
  filename: string;
  mimeType: string;
  base64Content: string;
}

export type OutputFormat = 'excel' | 'docx' | 'both';

export interface DirectoryContact {
  idInfringer: string;
  company: string;
  phones: string[]; // Updated to use array instead of single phone string
  caseCount: number;
  clientNames: string;
}

export interface ConflictSearchResult {
  idCase: string;
  matchType: 'Client Name' | 'Infringer Company' | 'Infringer Phone';
  matchedText: string;
}

// Lazy initialization of Supabase client to ensure process.env is loaded
let supabase: SupabaseClient | null = null;

export function getSupabaseClient() {
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
 * Executes a full-text search query across Cases, Contacts, and ContactPhones to identify conflicts of interest.
 * Uses fuzzy matching for company names.
 * @param query - The string to search for (Company, Customer Name, or Phone)
 */
export async function searchConflicts(query: string): Promise<ConflictSearchResult[]> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase credentials missing. Cannot perform search.');
  }

  if (!query || query.trim() === '') {
    return [];
  }

  const searchTerm = `%${query.trim()}%`;
  const rawQuery = query.trim();
  const results: ConflictSearchResult[] = [];

  try {
    // 1. Search in Cases (Customer Name) - Exact/ilike
    const { data: casesMatches, error: casesError } = await client
      .from('Cases')
      .select('idCase, customerName')
      .ilike('customerName', searchTerm);

    if (casesError) throw casesError;

    if (casesMatches) {
      casesMatches.forEach(c => {
        results.push({
          idCase: c.idCase,
          matchType: 'Client Name',
          matchedText: c.customerName
        });
      });
    }

    // 2. Search in Contacts (Company Name) - Fuzzy Matching via RPC
    const { data: fuzzyContacts, error: fuzzyError } = await client.rpc('search_conflicts_fuzzy', {
      search_term: rawQuery
    });

    // If the RPC fails (e.g. pg_trgm not installed), fallback to standard ilike
    let contactsMatches: any[] = [];
    if (fuzzyError) {
      console.warn('Fuzzy search RPC failed, falling back to standard ilike:', fuzzyError);
      const { data, error } = await client
        .from('Contacts')
        .select('idInfringer, company')
        .ilike('company', searchTerm);
      if (error) throw error;
      if (data) contactsMatches = data;
    } else if (fuzzyContacts) {
      // Filter by a reasonable similarity threshold if desired, or just take the results
      contactsMatches = fuzzyContacts;
    }

    // 3. Search in ContactPhones (Phone Number)
    const { data: phonesMatches, error: phonesError } = await client
      .from('ContactPhones')
      .select('idInfringer, phoneNumber')
      .ilike('phoneNumber', searchTerm);

    if (phonesError) throw phonesError;

    // Combine unique infringer IDs from both searches
    const infringerIds = new Set<string>();
    contactsMatches?.forEach(c => infringerIds.add(c.idInfringer));
    phonesMatches?.forEach(p => infringerIds.add(p.idInfringer));

    if (infringerIds.size > 0) {
      // Find all associated cases
      const { data: linkedCases, error: linkedCasesError } = await client
        .from('Cases')
        .select('idCase, idInfringer')
        .in('idInfringer', Array.from(infringerIds));

      if (linkedCasesError) throw linkedCasesError;

      if (linkedCases) {
        linkedCases.forEach(c => {
          const contact = contactsMatches?.find(cont => cont.idInfringer === c.idInfringer);
          const phoneRec = phonesMatches?.find(p => p.idInfringer === c.idInfringer);

          if (contact && contact.company) {
            // For fuzzy match, we don't strictly check if it includes the string, because it's fuzzy!
            results.push({
              idCase: c.idCase,
              matchType: 'Infringer Company',
              matchedText: contact.company + (contact.similarity ? ` (Sim: ${Math.round(contact.similarity * 100)}%)` : '')
            });
          }
          if (phoneRec && phoneRec.phoneNumber && phoneRec.phoneNumber.toLowerCase().includes(rawQuery.toLowerCase())) {
            results.push({
              idCase: c.idCase,
              matchType: 'Infringer Phone',
              matchedText: phoneRec.phoneNumber
            });
          }
        });
      }
    }

    // Deduplicate results
    const uniqueResults = results.filter((result, index, self) =>
      index === self.findIndex((t) => (
        t.idCase === result.idCase && t.matchType === result.matchType && t.matchedText === result.matchedText
      ))
    );

    // Audit Log the Search Action
    await client.from('AuditLogs').insert({
      action: 'CONFLICT_SEARCH_PERFORMED',
      details: { query: rawQuery, resultsFound: uniqueResults.length, timestamp: new Date().toISOString() }
    }).catch(e => console.error("Failed to write audit log:", e));

    return uniqueResults;

  } catch (err) {
    console.error('Error executing conflict search:', err);
    throw new Error('Database search failed.');
  }
}

/**
 * Fetches the directory of contacts from Supabase, including a case count per contact.
 */
export async function getContactsDirectory(): Promise<DirectoryContact[]> {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase credentials missing. Returning empty contacts directory.');
    return [];
  }

  try {
    const { data: contacts, error: contactsError } = await client
      .from('Contacts')
      .select('*')
      .order('company', { ascending: true });

    if (contactsError) throw contactsError;
    if (!contacts) return [];

    const { data: phones, error: phonesError } = await client
      .from('ContactPhones')
      .select('idInfringer, phoneNumber');

    if (phonesError) throw phonesError;

    const { data: cases, error: casesError } = await client
      .from('Cases')
      .select('idInfringer, customerName');

    if (casesError) throw casesError;

    const caseCountMap: Record<string, number> = {};
    const clientNamesMap: Record<string, Set<string>> = {};
    const phonesMap: Record<string, string[]> = {};

    if (phones) {
      phones.forEach(p => {
        if (!phonesMap[p.idInfringer]) {
          phonesMap[p.idInfringer] = [];
        }
        phonesMap[p.idInfringer].push(p.phoneNumber);
      });
    }

    if (cases) {
      cases.forEach(c => {
        if (c.idInfringer) {
          caseCountMap[c.idInfringer] = (caseCountMap[c.idInfringer] || 0) + 1;

          if (!clientNamesMap[c.idInfringer]) {
            clientNamesMap[c.idInfringer] = new Set<string>();
          }
          if (c.customerName && c.customerName.trim() !== '') {
            clientNamesMap[c.idInfringer].add(c.customerName.trim());
          }
        }
      });
    }

    return contacts.map((c: any) => {
      const id = c.idInfringer || c.id || '';
      const clientSet = clientNamesMap[id];
      const clientNames = clientSet && clientSet.size > 0
        ? Array.from(clientSet).join(', ')
        : 'N/A';

      return {
        idInfringer: id,
        company: c.company || '',
        phones: phonesMap[id] || [],
        caseCount: caseCountMap[id] || 0,
        clientNames
      };
    });

  } catch (err) {
    console.error('Error fetching contacts directory from Supabase:', err);
    throw new Error('Failed to retrieve contacts directory.');
  }
}

/**
 * Imports the aggregated cases into the Supabase database.
 * Upserts contacts, contact phones, and inserts cases.
 */
async function importCasesToDatabase(cases: AggregatedCase[]) {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase credentials missing. Skipping database import.');
    return;
  }

  const contactsToUpsert = new Map<string, any>();
  const phonesToUpsert: any[] = [];
  const casesToUpsert = new Map<string, any>();
  const imagesToInsert: any[] = [];

  for (const aggCase of cases) {
    const contactUuid = uuidv4();
    const caseUuid = uuidv4();

    if (aggCase.contactData) {
      contactsToUpsert.set(contactUuid, {
        idInfringer: contactUuid,
        company: aggCase.contactData.company,
      });

      if (aggCase.contactData.phone1) {
        phonesToUpsert.push({
          idInfringer: contactUuid,
          phoneNumber: aggCase.contactData.phone1,
          isPrimary: true
        });
      }
    }

    if (aggCase.caseData) {
      casesToUpsert.set(caseUuid, {
        idCase: caseUuid,
        pass: aggCase.caseData.pass,
        customerName: aggCase.caseData.customerName,
        idClient: aggCase.caseData.idClient,
        idInfringer: contactUuid
      });

      for (const url of aggCase.imageUrls) {
        imagesToInsert.push({
          idCase: caseUuid,
          catalogImagePath: url
        });
      }
    }
  }

  try {
    // 1. Upsert Contacts
    if (contactsToUpsert.size > 0) {
      const { error: contactsErr } = await client
        .from('Contacts')
        .upsert(Array.from(contactsToUpsert.values()), { onConflict: 'idInfringer' });

      if (contactsErr) {
        console.error('Error upserting contacts:', contactsErr);
        throw new Error(`Failed to import contacts: ${contactsErr.message}`);
      }
    }

    // 1.5 Insert ContactPhones
    if (phonesToUpsert.length > 0) {
      const { error: phonesErr } = await client
        .from('ContactPhones')
        .insert(phonesToUpsert);

      if (phonesErr) {
        console.error('Error inserting contact phones:', phonesErr);
        // Continue, as this isn't strictly fatal for the whole batch
      }
    }

    // 2. Upsert Cases
    if (casesToUpsert.size > 0) {
      const { error: casesErr } = await client
        .from('Cases')
        .upsert(Array.from(casesToUpsert.values()), { onConflict: 'idCase' });

      if (casesErr) {
        console.error('Error upserting cases:', casesErr);
        throw new Error(`Failed to import cases: ${casesErr.message}`);
      }
    }

    // 3. Insert Images
    if (imagesToInsert.length > 0) {
      const caseIds = Array.from(casesToUpsert.keys());

      const chunkSize = 100;
      for (let i = 0; i < caseIds.length; i += chunkSize) {
        const chunk = caseIds.slice(i, i + chunkSize);
        await client.from('Images').delete().in('idCase', chunk);
      }

      const { error: imagesErr } = await client
        .from('Images')
        .insert(imagesToInsert);

      if (imagesErr) {
        console.error('Error inserting images:', imagesErr);
      }
    }

    // Audit Log the Import Action
    await client.from('AuditLogs').insert({
      action: 'BATCH_DATA_IMPORTED',
      details: {
        contactsImported: contactsToUpsert.size,
        casesImported: casesToUpsert.size,
        timestamp: new Date().toISOString()
      }
    }).catch(e => console.error("Failed to write audit log:", e));

    console.log(`Successfully imported ${contactsToUpsert.size} contacts and ${casesToUpsert.size} cases.`);
  } catch (err) {
    console.error('Database import transaction failed:', err);
    throw err;
  }
}

/**
 * Fetches an image from a given URL and returns it as an ArrayBuffer.
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
 * Helper to build a trimmed map of headers to column indices
 */
function getHeaderMap(row: ExcelJS.Row): Record<string, number> {
  const map: Record<string, number> = {};
  row.eachCell((cell, colNumber) => {
    map[cell.value?.toString().trim() || ''] = colNumber;
  });
  return map;
}

/**
 * Parses the Excel sheet. Handles both multi-sheet relational files
 * and pre-aggregated single-sheet files.
 */
export async function parseAndAggregateCases(excelBuffer: Buffer): Promise<AggregatedCase[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(excelBuffer as any);

  const casesSheet = workbook.getWorksheet('Cases');
  const contactsSheet = workbook.getWorksheet('Contacts');
  const imagesSheet = workbook.getWorksheet('Images');

  // Check if it's a relational file
  if (casesSheet && contactsSheet && imagesSheet) {
    const contactsMap = new Map<string, ContactEntity>();
    const contactsHeaders = getHeaderMap(contactsSheet.getRow(1));

    for (let i = 2; i <= contactsSheet.rowCount; i++) {
      const row = contactsSheet.getRow(i);
      const idInfringer = row.getCell(contactsHeaders['ID Infringer'])?.value?.toString() || '';
      if (!idInfringer) continue;
      contactsMap.set(idInfringer, {
        idInfringer,
        company: row.getCell(contactsHeaders['Company'])?.value?.toString() || '',
        phone1: row.getCell(contactsHeaders['Phone 1'])?.value?.toString() || '',
      });
    }

    const imagesMap = new Map<string, string[]>();
    const imagesHeaders = getHeaderMap(imagesSheet.getRow(1));

    for (let i = 2; i <= imagesSheet.rowCount; i++) {
      const row = imagesSheet.getRow(i);
      const idCase = row.getCell(imagesHeaders['ID Case'])?.value?.toString() || '';
      const pathUrl = row.getCell(imagesHeaders['Catalog Image Path'])?.value?.toString() || '';
      if (!idCase || !pathUrl) continue;
      if (!imagesMap.has(idCase)) imagesMap.set(idCase, []);
      imagesMap.get(idCase)!.push(pathUrl);
    }

    const casesHeaders = getHeaderMap(casesSheet.getRow(1));
    const aggregatedCases: AggregatedCase[] = [];

    for (let i = 2; i <= casesSheet.rowCount; i++) {
      const row = casesSheet.getRow(i);
      const idCase = row.getCell(casesHeaders['ID Case'])?.value?.toString() || '';
      if (!idCase) continue;

      const idInfringer = row.getCell(casesHeaders['ID Infringer'])?.value?.toString() || '';
      aggregatedCases.push({
        caseData: {
          idCase,
          pass: row.getCell(casesHeaders['Pass'])?.value?.toString() || '',
          customerName: row.getCell(casesHeaders['CustomerName'])?.value?.toString() || '',
          idClient: row.getCell(casesHeaders['ID Client'])?.value?.toString() || '',
          idInfringer,
        },
        contactData: contactsMap.get(idInfringer) || null,
        imageUrls: imagesMap.get(idCase) || [],
      });
    }
    return aggregatedCases;
  }

  // Otherwise, check if it's a pre-aggregated file
  const aggSheet = workbook.getWorksheet('Aggregated Cases') || workbook.worksheets[0];
  if (aggSheet) {
    const headers = getHeaderMap(aggSheet.getRow(1));
    if (headers['Case ID'] || headers['idCase']) {
      const aggregatedCases: AggregatedCase[] = [];
      const colIdCase = headers['Case ID'] || headers['idCase'];
      const colPass = headers['Pass'] || headers['pass'];
      const colCust = headers['Customer Name'] || headers['customerName'];
      const colClient = headers['Client ID'] || headers['idClient'];
      const colInfringer = headers['Infringer ID'] || headers['idInfringer'];
      const colCompany = headers['Company'] || headers['company'];
      const colPhone = headers['Phone 1'] || headers['phone1'];
      const colImages = headers['Image URLs (Comma Separated)'] || headers['imageUrls'];

      for (let i = 2; i <= aggSheet.rowCount; i++) {
        const row = aggSheet.getRow(i);
        const idCase = row.getCell(colIdCase)?.value?.toString() || '';
        if (!idCase) continue;

        const rawImages = row.getCell(colImages)?.value?.toString() || '';
        const imageUrls = rawImages ? rawImages.split(',').map(u => u.trim()).filter(u => u.length > 0) : [];

        aggregatedCases.push({
          caseData: {
            idCase,
            pass: colPass ? row.getCell(colPass)?.value?.toString() || '' : '',
            customerName: colCust ? row.getCell(colCust)?.value?.toString() || '' : '',
            idClient: colClient ? row.getCell(colClient)?.value?.toString() || '' : '',
            idInfringer: colInfringer ? row.getCell(colInfringer)?.value?.toString() || '' : '',
          },
          contactData: {
            idInfringer: colInfringer ? row.getCell(colInfringer)?.value?.toString() || '' : '',
            company: colCompany ? row.getCell(colCompany)?.value?.toString() || '' : '',
            phone1: colPhone ? row.getCell(colPhone)?.value?.toString() || '' : '',
          },
          imageUrls,
        });
      }
      if (aggregatedCases.length > 0) return aggregatedCases;
    }
  }

  throw new Error('Unrecognized Excel format. Must contain either relational sheets (Cases, Contacts, Images) or an Aggregated sheet.');
}

/**
 * Generates a single aggregated Excel sheet and returns it as a ProcessedFile.
 */
async function generateAggregatedExcelFile(cases: AggregatedCase[]): Promise<ProcessedFile> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Aggregated Cases');

  sheet.columns = [
    { header: 'Case ID', key: 'idCase', width: 15 },
    { header: 'Pass', key: 'pass', width: 15 },
    { header: 'Customer Name', key: 'customerName', width: 25 },
    { header: 'Client ID', key: 'idClient', width: 15 },
    { header: 'Infringer ID', key: 'idInfringer', width: 15 },
    { header: 'Company', key: 'company', width: 25 },
    { header: 'Phone 1', key: 'phone1', width: 15 },
    { header: 'Image URLs (Comma Separated)', key: 'imageUrls', width: 50 },
  ];

  for (const c of cases) {
    sheet.addRow({
      idCase: c.caseData.idCase,
      pass: c.caseData.pass,
      customerName: c.caseData.customerName,
      idClient: c.caseData.idClient,
      idInfringer: c.caseData.idInfringer,
      company: c.contactData?.company || '',
      phone1: c.contactData?.phone1 || '',
      imageUrls: c.imageUrls.join(', '),
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return {
    filename: 'aggregated_cases.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    base64Content: (buffer as unknown as Buffer).toString('base64'),
  };
}

/**
 * Generates individual Word documents and returns them as an array of ProcessedFile.
 */
async function generateWordFiles(cases: AggregatedCase[]): Promise<ProcessedFile[]> {
  const files: ProcessedFile[] = [];

  for (const aggCase of cases) {
    const { caseData, contactData, imageUrls } = aggCase;

    const docChildren: any[] = [
      new Paragraph({
        children: [
          new TextRun({ text: 'Legal Evidence Report', bold: true, size: 36 }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Case ID: ', bold: true }),
          new TextRun(caseData.idCase),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Customer Name: ', bold: true }),
          new TextRun(caseData.customerName),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Company: ', bold: true }),
          new TextRun(contactData?.company || 'N/A'),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Phone Number: ', bold: true }),
          new TextRun(contactData?.phone1 || 'N/A'),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Evidence Attached:', bold: true }),
        ],
      }),
      new Paragraph({ text: '' }),
    ];

    if (imageUrls.length > 0) {
      for (const url of imageUrls) {
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
            new Paragraph({ text: '' })
          );
        } catch (err) {
          console.error(`Error fetching image for Case ${caseData.idCase} from URL ${url}:`, err);
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `[Failed to load image from URL: ${url}]`, color: 'FF0000' })
              ]
            })
          );
        }
      }
    } else {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: '[No Image URLs Specified for this Case]', italics: true })
          ]
        }),
        new Paragraph({ text: '' })
      );
    }

    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Confidential - For internal use only.', italics: true, size: 20 }),
        ],
      })
    );

    const doc = new Document({
      creator: 'Legal Automation Engine',
      description: `Legal document for Case ${caseData.idCase}`,
      sections: [{ properties: {}, children: docChildren }],
    });

    const buffer = await Packer.toBuffer(doc);
    const safeName = caseData.idCase.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    files.push({
      filename: `legal_report_case_${safeName}.docx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      base64Content: buffer.toString('base64'),
    });
  }

  return files;
}

/**
 * Main entry point. Parses the input and generates output files based on requested format.
 * Returns an array of ProcessedFile suitable for JSON serialization.
 */
export async function processLegalBatch(excelBuffer: Buffer, format: OutputFormat = 'both', importContacts: boolean = false): Promise<ProcessedFile[]> {
  const aggregatedCases = await parseAndAggregateCases(excelBuffer);

  if (importContacts) {
    await importCasesToDatabase(aggregatedCases);
  }

  const results: ProcessedFile[] = [];

  if (format === 'excel' || format === 'both') {
    const excelFile = await generateAggregatedExcelFile(aggregatedCases);
    results.push(excelFile);
  }

  if (format === 'docx' || format === 'both') {
    const wordFiles = await generateWordFiles(aggregatedCases);
    results.push(...wordFiles);
  }

  return results;
}

/**
 * Redacts specific target strings or regex patterns from a .docx file.
 * Uses JSZip to modify the underlying document.xml.
 */
export async function redactDocument(docxBuffer: Buffer, targets: string[]): Promise<Buffer> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(docxBuffer);

  const docXmlFile = loadedZip.file('word/document.xml');
  if (!docXmlFile) {
    throw new Error('Invalid .docx file structure: word/document.xml not found.');
  }

  let xmlContent = await docXmlFile.async('string');

  for (const target of targets) {
    if (!target) continue;

    let regex: RegExp;

    // Check if target is a predefined pattern identifier
    if (target === '__PHONE_PATTERN__') {
      // Basic phone number pattern (matches international and local formats)
      regex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
    } else if (target === '__EMAIL_PATTERN__') {
      // Basic email pattern
      regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    } else {
      // Escape target string for literal matching
      const escapedTarget = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regex = new RegExp(escapedTarget, 'gi');
    }

    // Replace the matched text with a solid black block (████████) simulating redaction.
    // Note: This simple regex replace acts directly on the XML text payload.
    // It works perfectly for contiguous text runs, but might miss words split across XML tags.
    // For MVP, this is an efficient and clean approach. To handle complex cross-tag splits,
    // a full XML parser/lexer traversal would be needed.
    xmlContent = xmlContent.replace(regex, (match) => {
      // Generate a solid block matching the approximate length of the original text
      return '█'.repeat(match.length);
    });
  }

  loadedZip.file('word/document.xml', xmlContent);
  const updatedBuffer = await loadedZip.generateAsync({ type: 'nodebuffer' });

  return updatedBuffer;
}

export { getSupabaseClient };
