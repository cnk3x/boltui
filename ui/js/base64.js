/**
 * base64解码
 * @param {string} [b] base64字符串
 * @returns {string} 解码后的字符串
 */
export function b2s(b) {
  if (!b) {
    return '';
  }
  b = b.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b.length % 4)) % 4);

  let s = b;
  try {
    s = atob(s)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return b;
  }

  try {
    return decodeURIComponent(s);
  } catch {
    return s.replace(/%/g, () => '\\x');
  }
}

/**
 * base64编码
 * @param {string} [s] 待编码的字符串
 * @returns {string} 编码后的字符串
 */
export function s2b(s) {
  if (!s) {
    return '';
  }

  if (/^(\\x([0-9a-fA-F]{2}))+$/g.test(s)) {
    s = s.replace(/\\x([0-9a-fA-F]{2})/g, (_, c) => String.fromCharCode('0x' + c));
  }
  return btoa(encodeURIComponent(s).replace(/%([0-9a-fA-F]{2})/g, (_, c) => String.fromCharCode('0x' + c)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
