import DOMPurify from "dompurify";

/**
 * Sanitize HTML content untuk mencegah XSS attacks
 *
 * @param {string} dirty - HTML content yang belum di-sanitize
 * @param {object} options - DOMPurify configuration options
 * @returns {string} Sanitized HTML
 *
 * @example
 * const cleanHTML = sanitizeHTML('<p>Hello <script>alert("XSS")</script></p>');
 * // Returns: '<p>Hello </p>'
 */
export const sanitizeHTML = (dirty, options = {}) => {
  if (!dirty) return "";

  const defaultOptions = {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "br", "p", "span"],
    ALLOWED_ATTR: [],
    ...options,
  };

  return DOMPurify.sanitize(dirty, defaultOptions);
};

/**
 * Sanitize plain text - escape HTML entities
 * Untuk render text biasa tanpa HTML tags
 *
 * @param {string} text - Plain text
 * @returns {string} Escaped text
 */
export const escapeHTML = (text) => {
  if (!text) return "";

  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Truncate and sanitize text untuk preview
 *
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated and sanitized text
 */
export const sanitizeAndTruncate = (text, maxLength = 100) => {
  if (!text) return "";

  const sanitized = escapeHTML(text);
  if (sanitized.length <= maxLength) return sanitized;

  return sanitized.substring(0, maxLength) + "...";
};
