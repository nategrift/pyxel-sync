export const hexToRgb = (hex) => {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, '');

  // Parse the hex color
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
};

export const rgbToHex = (r, g, b) => {
  // Ensure values are within range and convert each to a hex string
  const redHex = ('0' + r.toString(16)).slice(-2);
  const greenHex = ('0' + g.toString(16)).slice(-2);
  const blueHex = ('0' + b.toString(16)).slice(-2);

  // Concatenate the hex strings and prepend with a hash
  return `#${redHex}${greenHex}${blueHex}`;
};
