/**
 * CSV parsing and column detection for list uploads.
 *
 * Pure functions with no server dependencies so they can be unit tested directly
 * (see src/lib/v2/__tests__/csv.test.ts) and reused on either side of the wire.
 */

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
  /** Rows that were entirely empty and dropped before mapping. */
  blankRowCount: number;
}

/**
 * RFC 4180 parser that survives the files people actually upload: BOMs, CRLF, quoted
 * fields containing commas and newlines, escaped double quotes, ragged row lengths, and
 * trailing blank lines.
 */
export function parseCsv(input: string): ParsedCsv {
  const text = input.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  const pushField = () => {
    row.push(field);
    field = '';
  };

  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"' && field.length === 0) {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (char === ',') {
      pushField();
      i += 1;
      continue;
    }

    if (char === '\r') {
      // Swallow CR; the following LF (or its absence) ends the row.
      if (text[i + 1] === '\n') i += 1;
      pushRow();
      i += 1;
      continue;
    }

    if (char === '\n') {
      pushRow();
      i += 1;
      continue;
    }

    field += char;
    i += 1;
  }

  // Trailing field/row, unless the file ended exactly on a newline.
  if (field.length > 0 || row.length > 0) pushRow();

  const isBlank = (cells: string[]) => cells.every((cell) => cell.trim() === '');

  const headerRow = rows.find((cells) => !isBlank(cells)) ?? [];
  const headerIndex = rows.indexOf(headerRow);
  const bodyRows = headerIndex === -1 ? [] : rows.slice(headerIndex + 1);

  const dataRows = bodyRows.filter((cells) => !isBlank(cells));

  return {
    headers: headerRow.map((h) => h.trim()),
    rows: dataRows,
    blankRowCount: bodyRows.length - dataRows.length,
  };
}

// ---------------------------------------------------------------------------
// Column detection
// ---------------------------------------------------------------------------

export const CONTACT_FIELDS = [
  'first_name',
  'last_name',
  'full_name',
  'email',
  'phone',
  'last_service_date',
  'service_type',
  'address',
  'city',
  'state',
  'postal_code',
  'lifetime_value',
  'notes',
] as const;

export type ContactField = (typeof CONTACT_FIELDS)[number];

export const FIELD_LABELS: Record<ContactField, string> = {
  first_name: 'First name',
  last_name: 'Last name',
  full_name: 'Full name',
  email: 'Email',
  phone: 'Phone',
  last_service_date: 'Last service date',
  service_type: 'Service type',
  address: 'Address',
  city: 'City',
  state: 'State',
  postal_code: 'Postal code',
  lifetime_value: 'Lifetime value',
  notes: 'Notes',
};

/**
 * Header synonyms, most specific first. Matching is done on a normalized header
 * (lowercased, punctuation stripped) so "Customer E-Mail", "customer_email" and
 * "CUSTOMER EMAIL" all land on the same field.
 */
const SYNONYMS: Record<ContactField, string[]> = {
  first_name: ['firstname', 'fname', 'givenname', 'first', 'customerfirstname', 'clientfirstname'],
  last_name: ['lastname', 'lname', 'surname', 'familyname', 'last', 'customerlastname'],
  full_name: [
    'fullname',
    'name',
    'customername',
    'clientname',
    'contactname',
    'customer',
    'client',
  ],
  email: ['email', 'emailaddress', 'mail', 'customeremail', 'clientemail', 'contactemail'],
  phone: [
    'phone',
    'phonenumber',
    'mobile',
    'mobilephone',
    'cell',
    'cellphone',
    'telephone',
    'tel',
    'primaryphone',
    'customerphone',
    'contactnumber',
  ],
  last_service_date: [
    'lastservicedate',
    'lastservice',
    'lastcleaning',
    'lastcleaned',
    'lastjob',
    'lastjobdate',
    'lastvisit',
    'lastappointment',
    'servicedate',
    'lastbooking',
    'lastcompleted',
  ],
  service_type: [
    'servicetype',
    'service',
    'jobtype',
    'servicename',
    'cleaningtype',
    'package',
    'plan',
  ],
  address: ['address', 'address1', 'addressline1', 'streetaddress', 'street', 'serviceaddress'],
  city: ['city', 'town', 'locality'],
  state: ['state', 'province', 'region'],
  postal_code: ['postalcode', 'zip', 'zipcode', 'postcode', 'postal'],
  lifetime_value: [
    'lifetimevalue',
    'ltv',
    'totalspent',
    'totalrevenue',
    'revenue',
    'totalvalue',
    'amountspent',
  ],
  notes: ['notes', 'note', 'comments', 'comment', 'remarks', 'description'],
};

export function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export type ColumnMapping = Partial<Record<ContactField, number>>;

/**
 * Best-effort mapping from CSV columns to contact fields.
 *
 * Exact synonym matches win; a substring match is the fallback so "Client Email Address"
 * still resolves. Each column maps to at most one field and each field takes at most one
 * column, with earlier columns winning ties — the goal is that confirming the mapping is
 * one click, not a data-entry exercise.
 */
export function detectMapping(headers: string[]): ColumnMapping {
  const normalized = headers.map(normalizeHeader);
  const mapping: ColumnMapping = {};
  const usedColumns = new Set<number>();

  const claim = (field: ContactField, index: number) => {
    if (mapping[field] !== undefined || usedColumns.has(index)) return;
    mapping[field] = index;
    usedColumns.add(index);
  };

  // Pass 1: exact matches.
  for (const field of CONTACT_FIELDS) {
    for (const synonym of SYNONYMS[field]) {
      const index = normalized.findIndex((h, i) => h === synonym && !usedColumns.has(i));
      if (index !== -1) {
        claim(field, index);
        break;
      }
    }
  }

  // Pass 2: substring matches for the fields still unclaimed.
  for (const field of CONTACT_FIELDS) {
    if (mapping[field] !== undefined) continue;
    for (const synonym of SYNONYMS[field]) {
      if (synonym.length < 4) continue;
      const index = normalized.findIndex((h, i) => h.includes(synonym) && !usedColumns.has(i));
      if (index !== -1) {
        claim(field, index);
        break;
      }
    }
  }

  return mapping;
}

export function mappingConfidence(mapping: ColumnMapping): 'high' | 'medium' | 'low' {
  const hasName = mapping.full_name !== undefined || mapping.first_name !== undefined;
  const hasContact = mapping.email !== undefined || mapping.phone !== undefined;

  if (!hasContact) return 'low';
  if (hasName && hasContact && mapping.last_service_date !== undefined) return 'high';
  if (hasName && hasContact) return 'medium';
  return 'low';
}

/** Row cells keyed by contact field, with anything unmapped kept under `extras`. */
export interface MappedRow {
  values: Partial<Record<ContactField, string>>;
  extras: Record<string, string>;
}

export function applyMapping(
  headers: string[],
  row: string[],
  mapping: ColumnMapping
): MappedRow {
  const values: Partial<Record<ContactField, string>> = {};
  const claimed = new Set(Object.values(mapping));

  for (const field of CONTACT_FIELDS) {
    const index = mapping[field];
    if (index === undefined) continue;
    const cell = row[index];
    if (cell !== undefined && cell.trim() !== '') values[field] = cell.trim();
  }

  const extras: Record<string, string> = {};
  headers.forEach((header, index) => {
    if (claimed.has(index)) return;
    const cell = row[index];
    if (cell !== undefined && cell.trim() !== '') extras[header] = cell.trim();
  });

  return { values, extras };
}

/** Serializes rejected rows back into a CSV the operator can fix and re-upload. */
export function buildRejectsCsv(
  rejects: { row_number: number | null; reason: string; raw: Record<string, unknown> }[]
): string {
  const dataKeys = new Set<string>();
  for (const reject of rejects) {
    Object.keys(reject.raw ?? {}).forEach((key) => dataKeys.add(key));
  }

  const columns = ['row_number', 'reason', ...Array.from(dataKeys)];
  const escape = (value: unknown): string => {
    const str = value == null ? '' : String(value);
    return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const lines = [columns.join(',')];
  for (const reject of rejects) {
    lines.push(
      columns
        .map((column) => {
          if (column === 'row_number') return escape(reject.row_number);
          if (column === 'reason') return escape(reject.reason);
          return escape(reject.raw?.[column]);
        })
        .join(',')
    );
  }

  return lines.join('\n');
}
