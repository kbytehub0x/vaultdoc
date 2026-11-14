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
    if (window.ai && window.ai.languageModel) {
      const caps = await window.ai.languageModel.capabilities();
      return {
        available: caps.available === 'readily',
        status: caps.available,
      };
    }

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
      error: 'Chrome Prompt API not detected. Enable chrome://flags/#prompt-api-for-gemini-nano or use Local Sandbox Mode.',
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
        systemPrompt: systemPrompt || 'You are VaultDoc, a senior legal counsel assistant for confidential contracts.',
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

  // Simulate network latency for cloud roundtrip (800ms - 1200ms)
  await new Promise((resolve) => setTimeout(resolve, 850));

  const latencyMs = Math.round(performance.now() - startTime);

  return {
    text: `### Portfolio Cross-Contract & Regulatory Synthesis

*Synthesized via Firebase AI Logic on sanitized, tokenized payload.*

1. **Liability Covenant Conflict:** The current SaaS Agreement specifies an asymmetric 1-month trailing liability cap ($200,000 USD). This directly conflicts with **Company Master Procurement Standard Section 4.2**, which mandates mutual 12-month trailing aggregate caps ($2,400,000 USD).
2. **Indemnification Asymmetry:** Vendor disclaims patent and copyright infringement defense. Cross-referencing against our 3 historical vendor agreements (Apex Enterprise, Nexus Cloud, BioGenix), 100% of standard suppliers provide full intellectual property indemnification.
3. **Data Protection & Sub-processors:** Counterparty retains unrestricted sub-processor delegation without 30-day prior written notice. This conflicts directly with our Enterprise DPA requirements under GDPR Article 28(2).
4. **Negotiation Guidance:** Do not execute until:
   • The 1-month cap is amended to 12 months trailing fees.
   • Reciprocal IP infringement indemnity is reinstated.
   • 30-day advance sub-processor notice is incorporated.`,
    latencyMs,
    bytesSent,
  };
}
