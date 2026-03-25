export function extractFollowers(snippet) {
  const match = snippet.match(/([\d,.]+[KkMm]?)\+?\s*followers/i);
  return match ? match[1] : null;
}
