/**
 * Returns the node is scrollable.
 *
 * @param {HTMLElement|SVGElement} node
 * @return {boolean}
 */
function isScrolling(node) {
  var overflow = getComputedStyle(node, null).getPropertyValue('overflow');
  return overflow.indexOf('scroll') > -1 || overflow.indexOf('auto') > -1;
}

/**
 * Returns the scroll parent of a given element.
 *
 * @param {HTMLElement|SVGElement} node
 * @return {HTMLElement}
 */
export function scrollParent(node) {
  if (!(node instanceof HTMLElement || node instanceof SVGElement)) {
    return undefined;
  }

  var current = node.parentNode;
  while (current.parentNode) {
    if (isScrolling(current)) {
      return current;
    }
    current = current.parentNode;
  }

  return document.scrollingElement || document.documentElement;
}
