/**
 * Sanitize and parse JSON from AI model responses.
 * Handles: markdown code blocks, control characters inside strings,
 * extra text wrapping, and other common AI output quirks.
 */
export function sanitizeAndParseJSON(raw: string): Record<string, unknown> {
  // Extract from markdown code blocks
  const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  let str = (codeBlock?.[1] ?? raw).trim();

  // Extract the outermost { ... }
  const objMatch = str.match(/\{[\s\S]*\}/);
  if (objMatch) str = objMatch[0];

  // Fix literal newlines/tabs inside JSON string values
  let result = "";
  let inString = false;
  let escape = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (escape) {
      result += ch;
      escape = false;
      continue;
    }

    if (ch === "\\" && inString) {
      result += ch;
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }

    if (inString) {
      const code = ch.charCodeAt(0);
      if (code < 0x20) {
        if (ch === "\n") result += "\\n";
        else if (ch === "\r") result += "\\r";
        else if (ch === "\t") result += "\\t";
        continue;
      }
    }

    result += ch;
  }

  return JSON.parse(result);
}
