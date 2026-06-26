import crypto from "crypto";

/**
 * Generates a unique complaint ID using the format: ATH-YYYYMMDD-XXXXXX
 * where XXXXXX are 6 random uppercase hexadecimal characters.
 * @returns {string} Unique complaint ID
 */
export const generateComplaintId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;
  
  const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  
  return `ATH-${dateStr}-${randomHex}`;
};
