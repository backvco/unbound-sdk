import { internalRequest } from '../../base.js';

function pickDefined(fields) {
  const body = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) body[key] = value;
  }
  return body;
}

/**
 * Email generation via SpaceXAI. `sdk.ai.email.*`.
 *
 * @see app1-api src/services/ai/routes/email.js
 */
export class EmailService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Generate or revise an email as a block-tree document.
   *
   * @param {Object} params
   * @param {string} params.prompt - Generation prompt (required)
   * @param {string} [params.brandKitId] - Brand kit to apply
   * @param {string} [params.appearance] - `client` or `marketing`
   * @param {Object|Array} [params.tree] - Existing block tree to revise
   * @returns {Promise<Object>} `{ tree }`
   */
  async generate({ prompt, brandKitId, appearance, tree } = {}) {
    this.sdk.validateParams(
      { prompt, brandKitId, appearance, tree },
      {
        prompt: { type: 'string', required: true },
        brandKitId: { type: 'string', required: false },
        appearance: { type: 'string', required: false },
        tree: { type: 'object', required: false },
      },
    );

    return internalRequest(this.sdk, '/ai/email/generate', 'POST', {
      body: pickDefined({ prompt, brandKitId, appearance, tree }),
    });
  }

  /**
   * Rewrite email copy.
   *
   * @param {Object} params
   * @param {string} params.text - Source copy (required)
   * @param {string} params.instruction - `tone` | `shorten` | `expand` | `translate`
   * @param {string} [params.lang] - Target language (required when `translate`)
   * @returns {Promise<Object>} `{ text }`
   */
  async rewrite({ text, instruction, lang } = {}) {
    this.sdk.validateParams(
      { text, instruction, lang },
      {
        text: { type: 'string', required: true },
        instruction: { type: 'string', required: true },
        lang: { type: 'string', required: false },
      },
    );

    return internalRequest(this.sdk, '/ai/email/rewrite', 'POST', {
      body: pickDefined({ text, instruction, lang }),
    });
  }

  /**
   * Generate subject + preheader variants.
   *
   * @param {Object} params
   * @param {string} [params.html] - Rendered email HTML
   * @param {string} [params.prompt] - Prompt describing the email
   * @param {number} [params.n] - Variant count (1–5, default 3)
   * @returns {Promise<Object>} `{ variants: [{ subject, preheader }] }`
   */
  async subjects({ html, prompt, n } = {}) {
    this.sdk.validateParams(
      { html, prompt, n },
      {
        html: { type: 'string', required: false },
        prompt: { type: 'string', required: false },
        n: { type: 'number', required: false },
      },
    );

    return internalRequest(this.sdk, '/ai/email/subjects', 'POST', {
      body: pickDefined({ html, prompt, n }),
    });
  }

  /**
   * Generate image alt text.
   *
   * @param {Object} params
   * @param {string} [params.imageUrl] - https or data:image URL
   * @param {string} [params.description] - Image description
   * @returns {Promise<Object>} `{ alt }`
   */
  async altText({ imageUrl, description } = {}) {
    this.sdk.validateParams(
      { imageUrl, description },
      {
        imageUrl: { type: 'string', required: false },
        description: { type: 'string', required: false },
      },
    );

    return internalRequest(this.sdk, '/ai/email/alt-text', 'POST', {
      body: pickDefined({ imageUrl, description }),
    });
  }
}
