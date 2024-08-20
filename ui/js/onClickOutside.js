const noop = () => {};

function onClickOutside(target /*: MaybeElementRef*/, handler /*: OnClickOutsideHandler<{ detectIframe: T['detectIframe'] }>*/, options /*: T = {} as T*/) {
  const { ignore = [], capture = true, detectIframe = false } = options;

  let shouldListen = true;

  const shouldIgnore = (event /*: PointerEvent*/) => {
    return ignore.some((target) => {
      if (typeof target === 'string') {
        return Array.from(window.document.querySelectorAll(target)).some((el) => el === event.target || event.composedPath().includes(el));
      } else {
        return target && (event.target === target || event.composedPath().includes(target));
      }
    });
  };

  const listener = (event /*: PointerEvent*/) => {
    const el = target;

    if (!el || el === event.target || event.composedPath().includes(el)) return;

    if (event.detail === 0) shouldListen = !shouldIgnore(event);

    if (!shouldListen) {
      shouldListen = true;
      return;
    }

    handler(event);
  };

  const cleanup = [
    useEventListener(window, 'click', listener, { passive: true, capture }),
    useEventListener(
      window,
      'pointerdown',
      (e) => {
        const el = target;
        shouldListen = !shouldIgnore(e) && !!(el && !e.composedPath().includes(el));
      },
      { passive: true }
    ),
    detectIframe &&
      useEventListener(window, 'blur', (event) => {
        setTimeout(() => {
          const el = target;
          if (window.document.activeElement?.tagName === 'IFRAME' && !el?.contains(window.document.activeElement)) {
            handler(event);
          }
        }, 0);
      }),
  ].filter(Boolean);

  return () => cleanup.forEach((fn) => fn());
}

export { onClickOutside };
