/**
 * Merge-variable substitution and plain-text-to-HTML conversion.
 *
 * Deliberately free of server imports so it can be unit tested directly and reused
 * anywhere. `src/lib/v2/render.ts` is the server-side wrapper that supplies the
 * variables and applies the compliance rules.
 */

export interface SubstitutionResult {
  text: string;
  filled: string[];
  missing: string[];
}

/**
 * Substitutes `{{variable}}` placeholders and cleans up after empty ones, so a contact
 * with no first name never receives "Hi ,".
 */
export function substitute(template: string, variables: Record<string, string>): SubstitutionResult {
  const filled: string[] = [];
  const missing: string[] = [];

  let text = template.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_match, name: string) => {
    const key = name.toLowerCase();
    const value = variables[key];
    if (value) {
      filled.push(key);
      return value;
    }
    missing.push(key);
    return '';
  });

  text = text
    // Greetings whose name variable came back empty.
    .replace(/\bHi\s*,/gi, 'Hi there,')
    .replace(/\bHey\s*,/gi, 'Hey there,')
    // Punctuation doubled up by a removed variable.
    .replace(/([,.!?])\s*\1+/g, '$1')
    // Whitespace an empty variable left behind.
    .replace(/[ \t]+([,.!?])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    // Paragraphs that became empty.
    .replace(/\n[ \t]+\n/g, '\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .trim();

  return { text, filled: Array.from(new Set(filled)), missing: Array.from(new Set(missing)) };
}

/** Plain text to HTML: paragraphs preserved, bare URLs linked, everything else escaped. */
export function textToHtml(text: string, accent = '#6428F9'): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => {
      const escaped = paragraph
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const linked = escaped.replace(
        /(https?:\/\/[^\s<]+)/g,
        `<a href="$1" style="color:${accent};text-decoration:underline">$1</a>`
      );

      return `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#27272a">${linked.replace(
        /\n/g,
        '<br />'
      )}</p>`;
    })
    .join('');
}
