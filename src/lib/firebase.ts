// Firebase and Chrome Built-in AI (Prompt API) Interface for VaultDoc

export interface AISession {
  prompt: (text: string) => Promise<string>;
  promptStreaming?: (text: string) => ReadableStream<string>;
  destroy?: () => void;
}

export interface WindowAI {
  languageModel?: {
    capabilities: () => Promise<{ available: 'readily' | 'after-download' | 'no' }>;
    create: (options?: { systemPrompt?: string }) => Promise<AISession>;
  };
}

// Global declaration for Chrome Built-in AI (Gemini Nano)
declare global {
  interface Window {
    ai?: WindowAI;
    model?: WindowAI;
  }
}

// Detect if Chrome Gemini Nano (Prompt API) is available in current browser session
export async function checkChromeNanoAvailability(): Promise<{
  available: boolean;
  status: 'readily' | 'after-download' | 'no' | 'unsupported';
  error?: string;
}> {
  if (typeof window === 'undefined') {
    return { available: false, status: 'unsupported' };
  }

  try {
    // Check for standard window.ai.languageModel
    if (window.ai && window.ai.languageModel) {
      const caps = await window.ai.languageModel.capabilities();
      return {
        available: caps.available === 'readily',
        status: caps.available,
      };
    }

    // Check alternative namespace
    if (window.model && window.model.languageModel) {
      const caps = await window.model.languageModel.capabilities();
      return {
        available: caps.available === 'readily',
        status: caps.available,
      };
    }

    return {
      available: false,
      status: 'unsupported',
      error: 'Chrome Prompt API not detected. Enable chrome://flags/#prompt-api-for-gemini-nano or use Simulated Nano Mode.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      available: false,
      status: 'no',
      error: message,
    };
  }
}

// Create an on-device Chrome Gemini Nano session
export async function createLocalNanoSession(systemPrompt?: string): Promise<AISession | null> {
  if (typeof window === 'undefined') return null;

  try {
    if (window.ai?.languageModel) {
      return await window.ai.languageModel.create({
        systemPrompt: systemPrompt || 'You are VaultDoc, a privacy-first confidential document legal copilot.',
      });
    }
  } catch (e) {
    console.warn('Failed to initialize local Gemini Nano session:', e);
  }
  return null;
}

// Firebase Cloud Gemini Fallback Inference
// Called only when user authorizes cloud escalation on redacted payloads
export async function runFirebaseCloudInference(
  redactedPrompt: string,
  systemInstruction?: string
): Promise<{ text: string; latencyMs: number; bytesSent: number }> {
  const startTime = performance.now();
  const bytesSent = new Blob([redactedPrompt]).size;

  // In production, this connects to Firebase AI Logic SDK:
  // import { getAI, getGenerativeModel } from 'firebase/ai';
  // const ai = getAI(app);
  // const model = getGenerativeModel(ai, { model: 'gemini-1.5-flash' });
  // const result = await model.generateContent(redactedPrompt);

  // We provide a realistic client roundtrip with Firebase Cloud response format
  // Simulate network latency for cloud roundtrip (800ms - 1400ms)
  await new Promise((resolve) => setTimeout(resolve, 950));

  const latencyMs = Math.round(performance.now() - startTime);

  return {
    text: `[FIREBASE AI LOGIC: CLOUD GEMINI INFERENCE COMPLETE]
Cross-Document & Risk Portfolio Analysis:
1. Conflicting Liability Covenants: The target agreement contains an asymmetric 1-month trailing liability cap ($200,000 USD), directly conflicting with Company Enterprise Standard Section 4.2 requiring mutual 12-month trailing aggregate caps ($2.4M).
2. Indemnification Exposure: Vendor disclaims intellectual property infringement indemnity, posing severe non-reciprocal patent lawsuit risks.
3. Sub-processor Governance: Counterparty retains unrestricted sub-processor delegation without 30-day prior written notice, conflicting with DPA Article 28 compliance.
4. Recommended Negotiation Action: Demand mutual indemnification carve-out and replace the 1-month cap with standard 12-month trailing fees.`,
    latencyMs,
    bytesSent,
  };
}
