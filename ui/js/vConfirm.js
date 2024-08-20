import { h } from './h.js';
import { computePosition, autoUpdate } from './computePosition.js';

/**
 * @param {{el: HTMLElement; get: ()=>any}}
 *
 * @returns {() => void}
 */
export function vConfirm({ el, get }) {
  const options = get();

  let cancelIt = () => {};

  const click = (e) => {
    e.preventDefault();

    if (el.dataset.popover === 'v-confirm') {
      return;
    }

    el.dataset.popover = 'v-confirm';
    const main = h('main', null, options.text ?? '确认?');
    const cBtn = h('button', { 'data-for': 'cancel', class: 'btn text-xs' }, '取消');
    const okBtn = h('button', { 'data-for': 'ok', class: 'btn danger text-xs' }, '确认');
    const footer = h('footer', null, [cBtn, okBtn]);

    const ns = 'http://www.w3.org/2000/svg';
    const aEl = h('svg', { ns, viewBox: '0 0 14 8', class: 'arrow' }, [
      h('path', { ns, stroke: 'rgba(31, 32, 40, 0.1)', 'stroke-width': '1', fill: '#fff', d: 'm1 8 L7 1 L13 8' }),
    ]);

    const pEl = h('div', { class: 'popover' }, [main, footer, aEl]);
    document.body.appendChild(pEl);

    function cancel() {
      el.dataset.popover = '';
      pEl.remove();
    }

    okBtn.addEventListener('click', async () => {
      try {
        okBtn.setAttribute('disabled', 'disabled');
        cBtn.setAttribute('disabled', 'disabled');
        await options.onOk?.();
      } catch (error) {
      } finally {
        cancel();
      }
    });

    cBtn.addEventListener('click', () => cancel());

    const update = () => {
      const { left, top, arrow } = computePosition(el, pEl, { arrow: aEl });
      pEl.style.left = `${left}px`;
      pEl.style.top = `${top}px`;
      aEl.style.left = `${arrow.left - left}px`;
    };

    cancelIt = autoUpdate(update);
  };

  el.addEventListener('click', click, false);
  return () => {
    el.removeEventListener('click', click);
    cancelIt();
  };
}
