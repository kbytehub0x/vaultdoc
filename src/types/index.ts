export type InferenceMode = 'local_nano' | 'cloud_gemini' | 'simulated_nano';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface PIIToken {
  id: string;
  original: string;
  placeholder: string;
  category: 'ORGANIZATION' | 'PERSON' | 'EMAIL' | 'PHONE' | 'AMOUNT' | 'DATE' | 'IDENTIFIER';
  index: number;
}

export interface RedactionResult {
  originalText: string;
  redactedText: string;
  tokens: PIIToken[];
  maskedCount: number;
}

export interface ContractClause {
  id: string;
  title: string;
  originalText: string;
  summary: string;
  riskLevel: RiskLevel;
  riskReason: string;
  suggestedRedline?: string;
  sectionNumber?: string;
}

export interface ContractDocument {
  id: string;
  title: string;
  type: 'SaaS MSA' | 'DPA' | 'Consulting / IP' | 'Custom';
  counterparty: string;
  effectiveDate: string;
  rawText: string;
  clauses: ContractClause[];
  redaction: RedactionResult;
  isPreloaded?: boolean;
}

export interface TelemetryEvent {
  timestamp: string;
  mode: InferenceMode;
  task: string;
  bytesEgress: number;
  latencyMs: number;
  piiMaskedCount: number;
  modelName: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  documentTitle: string;
  action: 'LOCAL_ANALYSIS' | 'PII_MASKED' | 'LOCAL_REDLINE' | 'CLOUD_ESCALATION';
  inferenceEngine: string;
  bytesEgress: number;
  piiProtectedCount: number;
  userConsentGranted: boolean;
  status: 'SUCCESS' | 'BLOCKED_BY_USER' | 'OFFLINE_HANDLED';
}
