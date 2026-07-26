import assert from 'node:assert/strict';
import test from 'node:test';

import { applyMapping, buildRejectsCsv, detectMapping, mappingConfidence, parseCsv } from '../csv';

test('parses quoted fields containing commas, newlines and escaped quotes', () => {
  const csv = [
    'name,notes,email',
    '"Doe, Jane","Said ""call first""\nprefers mornings",jane@example.com',
    'Bob Smith,simple note,bob@example.com',
  ].join('\n');

  const parsed = parseCsv(csv);

  assert.deepEqual(parsed.headers, ['name', 'notes', 'email']);
  assert.equal(parsed.rows.length, 2);
  assert.equal(parsed.rows[0][0], 'Doe, Jane');
  assert.equal(parsed.rows[0][1], 'Said "call first"\nprefers mornings');
  assert.equal(parsed.rows[1][2], 'bob@example.com');
});

test('strips the BOM, handles CRLF, and drops blank rows', () => {
  const csv = '\uFEFFName,Email\r\nJane,jane@example.com\r\n\r\n,\r\nBob,bob@example.com\r\n';
  const parsed = parseCsv(csv);

  assert.deepEqual(parsed.headers, ['Name', 'Email']);
  assert.equal(parsed.rows.length, 2);
  assert.equal(parsed.blankRowCount, 2);
});

test('keeps ragged rows rather than discarding the data that is there', () => {
  const parsed = parseCsv('a,b,c\n1,2\n3,4,5,6');

  assert.equal(parsed.rows.length, 2);
  assert.deepEqual(parsed.rows[0], ['1', '2']);
  assert.deepEqual(parsed.rows[1], ['3', '4', '5', '6']);
});

test('detects a messy real-world header row', () => {
  const headers = [
    'Customer Name',
    'E-Mail Address',
    'PRIMARY PHONE',
    'last_service_date',
    'Service Type',
    'Street Address',
    'Zip',
    'Total Spent',
    'Internal Notes',
  ];

  const mapping = detectMapping(headers);

  assert.equal(mapping.full_name, 0);
  assert.equal(mapping.email, 1);
  assert.equal(mapping.phone, 2);
  assert.equal(mapping.last_service_date, 3);
  assert.equal(mapping.service_type, 4);
  assert.equal(mapping.address, 5);
  assert.equal(mapping.postal_code, 6);
  assert.equal(mapping.lifetime_value, 7);
  assert.equal(mapping.notes, 8);
  assert.equal(mappingConfidence(mapping), 'high');
});

test('prefers split name columns and never maps one column to two fields', () => {
  const mapping = detectMapping(['First Name', 'Last Name', 'Email']);

  assert.equal(mapping.first_name, 0);
  assert.equal(mapping.last_name, 1);
  assert.equal(mapping.email, 2);

  const indexes = Object.values(mapping);
  assert.equal(new Set(indexes).size, indexes.length);
});

test('reports low confidence when there is no way to reach anyone', () => {
  const mapping = detectMapping(['Customer Name', 'City', 'Notes']);
  assert.equal(mappingConfidence(mapping), 'low');
});

test('applyMapping trims values and preserves unmapped columns as extras', () => {
  const headers = ['Name', 'Email', 'Gate Code'];
  const mapping = detectMapping(headers);
  const { values, extras } = applyMapping(headers, ['  Jane Doe ', 'jane@example.com', '1234'], mapping);

  assert.equal(values.full_name, 'Jane Doe');
  assert.equal(values.email, 'jane@example.com');
  assert.deepEqual(extras, { 'Gate Code': '1234' });
});

test('rejects CSV escapes values that would break the file', () => {
  const csv = buildRejectsCsv([
    { row_number: 4, reason: 'No usable phone or email', raw: { Name: 'Doe, Jane', Phone: '555' } },
  ]);

  const lines = csv.split('\n');
  assert.equal(lines[0], 'row_number,reason,Name,Phone');
  assert.equal(lines[1], '4,No usable phone or email,"Doe, Jane",555');
});
