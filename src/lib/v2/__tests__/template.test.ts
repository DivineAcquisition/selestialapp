import assert from 'node:assert/strict';
import test from 'node:test';

import { substitute, textToHtml } from '../template';

const variables = {
  first_name: 'Jane',
  full_name: 'Jane Doe',
  business_name: 'Sparkle Clean',
  service_type: 'deep clean',
  last_service: 'March 2024',
  dormancy: '14 months',
  city: 'Austin',
  offer: '',
  booking_link: 'https://go.selestial.io/l/abc123',
  attachment_link: '',
};

test('fills merge variables and reports which were used', () => {
  const result = substitute(
    'Hi {{first_name}}, it has been {{dormancy}} since your {{service_type}}. {{booking_link}}',
    variables
  );

  assert.equal(
    result.text,
    'Hi Jane, it has been 14 months since your deep clean. https://go.selestial.io/l/abc123'
  );
  assert.deepEqual(result.filled.sort(), ['booking_link', 'dormancy', 'first_name', 'service_type']);
  assert.deepEqual(result.missing, []);
});

test('a contact with no first name never receives "Hi ,"', () => {
  const result = substitute('Hi {{first_name}}, quick question.', { ...variables, first_name: '' });

  assert.equal(result.text, 'Hi there, quick question.');
  assert.deepEqual(result.missing, ['first_name']);
});

test('an empty variable does not leave double spaces or orphaned punctuation', () => {
  const result = substitute('We serve {{city}} and nearby. {{offer}} Book here: {{booking_link}}', {
    ...variables,
    city: '',
  });

  assert.ok(!result.text.includes('  '), `unexpected double space in: ${result.text}`);
  assert.ok(!/\s+\./.test(result.text), `unexpected space before period in: ${result.text}`);
  assert.ok(result.text.includes('https://go.selestial.io/l/abc123'));
});

test('collapses the blank lines an empty paragraph variable leaves behind', () => {
  const result = substitute('Line one.\n\n{{offer}}\n\nLine two.', variables);
  assert.equal(result.text, 'Line one.\n\nLine two.');
});

test('unknown variables are removed rather than sent as literal braces', () => {
  const result = substitute('Hi {{first_name}}, {{invented_field}} here.', variables);

  assert.ok(!result.text.includes('{{'));
  assert.ok(result.missing.includes('invented_field'));
});

test('variable syntax tolerates internal spacing and casing', () => {
  const result = substitute('Hi {{ First_Name }}!', variables);
  assert.equal(result.text, 'Hi Jane!');
});

test('renders paragraphs and auto-links bare URLs in email HTML', () => {
  const html = textToHtml('Hi Jane,\n\nBook here: https://go.selestial.io/l/abc123');

  assert.equal((html.match(/<p /g) ?? []).length, 2);
  assert.ok(html.includes('<a href="https://go.selestial.io/l/abc123"'));
});

test('escapes HTML in contact-supplied text before linking', () => {
  const html = textToHtml('Note: <script>alert(1)</script> & more');

  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&amp;'));
});
