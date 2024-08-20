/**
 * @param {Record<string,any>|string} query
 */
function resloveQuery(query) {
  let q = '';
  if (typeof query === 'object') {
    q = Object.entries(query).reduce((r, [k, v]) => `${r}` + (v ? `${r ? '&' : '?'}${k}=${encodeURI(v)}` : ''), '');
  } else {
    q = query?.startsWith('?') ? query : '?' + query;
  }
  return q;
}

/**
 * @param {Record<string,any>|string} pathquery - fullpath or query
 */
function routerPush(pathquery) {
  const from = location.href.substring(location.origin.length);
  const to = typeof pathquery === 'object' ? `${location.pathname}${resloveQuery(pathquery)}` : pathquery;
  if (from != to) {
    history.pushState({}, null, to);
  }
}

/**
 * @param {{el:HTMLElement; get: ()=>Record<string,any>|string; effect: ()=>void}} ctx
 */
export function vTo(ctx) {
  const { el, get, effect } = ctx;
  const href = () => `${location.pathname}${resloveQuery(get())}`;

  effect(() => (el.tagName === 'A' ? (el.href = href()) : (el.dataset.routerTo = href())));

  /**
   *
   * @param {PointerEvent} e
   */
  function click(e) {
    e.preventDefault();
    routerPush(el.dataset.routerTo || el.href);
  }

  el.addEventListener('click', click, false);
  return () => {
    el.removeEventListener('click', click);
  };
}

export function useQuery() {
  function wrap(evt) {
    if (history[evt]) return;
    history[evt] = evt;
    const fn = history[(evt += 'State')];
    history[evt] = function (uri) {
      fn.apply(this, arguments);
      return dispatchEvent(new PopStateEvent(evt.toLowerCase(), { state: uri }));
    };
  }

  const query = {};
  const callbacks = new Set();

  function add(fn) {
    return callbacks.add(fn);
  }

  function remove(fn) {
    return callbacks.delete(fn);
  }

  function dispatch() {
    Object.keys(query).forEach((k) => delete query[k]);
    new URLSearchParams(location.search).forEach((v, k) => (query[k] = v));
    callbacks.forEach((fn) => fn(query));
  }

  ['push', 'replace'].forEach((evt) => wrap(evt));

  addEventListener('popstate', dispatch);
  addEventListener('pushstate', dispatch);
  dispatch();

  return { add, remove, query, push: routerPush };
}
