import { PIIToken, RedactionResult } from '@/types';

// Client-side PII & Confidential Data Masking Engine
// Runs 100% in-browser with zero network egress.
export function maskPII(text: string, customEntities: string[] = []): RedactionResult {
  const tokens: PIIToken[] = [];
  let maskedText = text;
  let counter = 1;

  // Helper to record token
  const replaceAndTrack = (
    regex: RegExp,
    category: PIIToken['category'],
    prefix: string
  ) => {
    maskedText = maskedText.replace(regex, (match) => {
      const existing = tokens.find((t) => t.original.toLowerCase() === match.toLowerCase());
      if (existing) {
        return existing.placeholder;
      }
      const placeholder = `[${prefix}_${counter++}]`;
      tokens.push({
        id: `token-${tokens.length + 1}`,
        original: match,
        placeholder,
        category,
        index: tokens.length,
      });
      return placeholder;
    });
  };

  // 1. Email Addresses
  replaceAndTrack(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g,
    'EMAIL',
    'CONFIDENTIAL_EMAIL'
  );

  // 2. Phone Numbers (US & International)
  replaceAndTrack(
    /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    'PHONE',
    'PHONE_NUM'
  );

  // 3. Financial Dollar Caps & Liability Values
  replaceAndTrack(
    /(?:\$|USD\s*)\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?(?:\s*(?:million|billion|M|B|k|thousand))?\b/gi,
    'AMOUNT',
    'FINANCIAL_CAP'
  );

  // 4. Tax IDs, SSN, EIN patterns
  replaceAndTrack(
    /\b\d{2}-\d{7}\b|\b\d{3}-\d{2}-\d{4}\b/g,
    'IDENTIFIER',
    'TAX_REG_ID'
  );

  // 5. Explicit Custom / Known Counterparty Entities
  const defaultOrgs = [
    'Acme Technologies Inc.',
    'Acme Technologies',
    'Acme Corp',
    'Nexus Cloud Solutions LLC',
    'Nexus Cloud Solutions',
    'Global Vanguard Logistics',
    'Apex Enterprise Systems',
    'Johnathan Vance',
    'Sarah Jenkins',
    'David K. Sterling',
    'Dr. Aris Thorne',
    ...customEntities,
  ];

  for (const org of defaultOrgs) {
    if (!org) continue;
    const escaped = org.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    replaceAndTrack(regex, 'ORGANIZATION', 'ORGANIZATION_ENTITY');
  }

  // 6. Dates (e.g., November 14, 2026, 11/14/2026)
  replaceAndTrack(
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
    'DATE',
    'DATE_TOKEN'
  );

  return {
    originalText: text,
    redactedText: maskedText,
    tokens,
    maskedCount: tokens.length,
  };
}

// Restore confidential tokens in the local browser UI after receiving cloud response
export function unmaskText(text: string, tokens: PIIToken[]): string {
  let restored = text;
  for (const token of tokens) {
    const escapedPlaceholder = token.placeholder.replace(/[[\]]/g, '\\$&');
    restored = restored.replace(new RegExp(escapedPlaceholder, 'g'), token.original);
  }
  return restored;
}
