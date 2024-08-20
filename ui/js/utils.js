export function compact(n) {
  return Array.isArray(n)
    ? n.filter((n) => !isEmpty(n))
    : typeof n === 'object'
    ? Object.fromEntries(Object.entries(n).filter(([_, v]) => !isEmpty(v)))
    : n;
}

export function isEmpty(n) {
  const typ = typeof n;
  return n === null || n === undefined
    ? true
    : typ === 'undefined' || typ === 'function' || typ === 'symbol'
    ? true
    : typ === 'boolean' || typ === 'bigint' || typ === 'string' || typ === 'number'
    ? !n
    : Array.isArray(n)
    ? n.length == 0 || !n.some((x) => !isEmpty(x))
    : typ === 'object'
    ? Object.keys(n).length === 0 || !Object.keys(n).some((k) => !isEmpty(n[k]))
    : !n;
}

/**
 * append
 * @param  {...(any|any[])} it - any
 * @returns {any[]}
 */
export function append(...it) {
  return it.reduce((r, c) => [...r, ...(Array.isArray(c) ? c : [c])], []);
}

/**
 * 组合数组
 * @param  {...any} args - 参数
 * @returns 字符串
 */
export function join(...args) {
  const items = append(...args);
  return items.length ? items.slice(0, -1).join(items.at(-1)) : '';
}

/**
 * 分割字符串
 * @param {string} str - 待分解的字符串
 * @param {string} [sep] - 分隔符
 * @returns {string[]} - 分解后的字符串数组
 */
export function split(str, sep) {
  const arr = str?.split(sep) ?? [];
  return arr.length == 1 && arr[0] == '' ? [] : arr;
}

/**
 * JSON解析
 * @param {string} s - 待解析的字符串
 */
export function parseJSON(s) {
  try {
    return JSON.parse(s);
  } catch {}
}
