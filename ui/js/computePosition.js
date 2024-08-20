/**
 * @typedef Placement
 * @type {'top'|'top-start'|'top-end'|'right'|'right-start'|'right-end'|'bottom'|'bottom-start'|'bottom-end'|'left'|'left-start'|'left-end'}
 */

/**
 * @typedef Options
 * @type {object}
 * @property {Placement} [placement] - 位置.
 * @property {HTMLElement} [arrow] - 箭头元素.
 */

/**
 * @param {HTMLElement} reference - 引用元素
 * @param {HTMLElement} target - 目标元素
 * @param {Options} [options] - 配置项
 */
export function computePosition(reference, target, options) {
  const rEl = reference;
  const pEl = target;

  const rRect = rEl.getBoundingClientRect();
  const pRect = pEl.getBoundingClientRect();

  const result = { left: 0, top: 0, arrow: { left: 0, top: 0 } };

  result.top = rRect.top + rRect.height;
  result.left = rRect.right - pRect.width;

  if (options?.arrow) {
    const aRect = options.arrow.getBoundingClientRect();

    result.arrow.top = result.top;
    result.arrow.left = rRect.left + (rRect.width - aRect.width) / 2;

    result.top += aRect.height;
  }

  return result;
}

export function autoUpdate(cb) {
  const winSize = new ResizeObserver((es) => cb?.(es.length ? es[0] : null));
  winSize.observe(document.documentElement);

  const onScroll = () => cb();
  window.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', onScroll);
    winSize.disconnect();
  };
}
