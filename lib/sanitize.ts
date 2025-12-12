import validator from "validator";

// Basic sanitization to mitigate script injection on user strings
export function sanitizeString(input: string) {
  return validator.escape(validator.trim(input));
}

