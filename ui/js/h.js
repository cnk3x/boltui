/**
 *
 * @param {string} tag - 标签名
 * @param {string} ns - 命名空间
 * @returns {HTMLElement|SVGAElement}
 */
function newElement(tag, ns) {
  if (ns) {
    return document.createElementNS(ns, tag);
  }
  return document.createElement(tag);
}

/**
 * 扁平化类名
 * @param {((string|string[]|Record<string,any>)|(string|string[]|Record<string,any>)[])} className - 类名
 * @returns {string}
 */
function flatCSSClass(className) {
  return typeof className === 'string'
    ? className
    : Array.isArray(className)
    ? className.map((n) => flatCSSClass(n)).join(' ')
    : typeof className === 'object'
    ? Object.entries(className)
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join(' ')
    : '';
}

/**
 * @param {string} tag
 * @param {(Record<string, any>)} [props]
 * @param {(string|Element|(string|Element)[])} [children]
 *
 * @returns {HTMLElement|SVGAElement}
 */
export function createElement(tag, props, children) {
  const el = newElement(tag, props?.ns);
  if (props) {
    Object.entries(props).forEach(([k, v]) => {
      if (k == 'ns' || k == 'allowHtml') {
        return;
      }

      if (k === 'style') {
        if (typeof v == 'object') {
          Object.entries(v).forEach(([k, v]) => (el.style[k] = v));
        } else {
          el.style.cssText = v;
        }
        return;
      }

      if (k === 'class' || k === 'className') {
        el.classList.add(...flatCSSClass(v).split(' ').filter(Boolean));
        return;
      }

      if (k.startsWith('on')) {
        const evt = k.slice(2).toLowerCase();
        el.addEventListener(evt, v);
        return;
      }

      el.setAttribute(k, v);
    });
  }

  if (children) {
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (typeof child === 'string') {
        if (props?.allowHtml) {
          el.appendChild(document.createRange().createContextualFragment(children).firstChild);
        } else {
          el.appendChild(document.createTextNode(child));
        }
      } else {
        el.appendChild(child);
      }
    });
  }

  return el;
}

export const h = createElement;
