import { h } from './h.js';

// function setStyle(el, styles) {
//   Object.entries(styles).forEach(([k, v]) => (el.style[k] = v));
// }

const modalStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  minWidth: '100px',
  maxWidth: '80%',
  maxHeight: '80%',
  overflow: 'hidden',
  boxShadow: '0 0 0.5rem rgba(0, 0, 0, 0.3)',
  borderRadius: '0.125rem',
  backgroundColor: '#fff',
  padding: '0.75rem 2rem 0.75rem',
};

const mainStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: 'auto',
  overflow: 'auto',
  fontSize: '0.875rem',
};

const footerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '1rem',
};

const maskStyle = {
  position: 'fixed',
  top: '0',
  right: '0',
  bottom: '0',
  left: '0',
  zIndex: '9999',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  backgroundColor: 'rgba(0, 0, 0, 0.2)',
};

const stopPropagation = (e) => e.stopPropagation();

export function showModal(text, options = { center: true }) {
  return new Promise((resolve, reject) => {
    function cancel() {
      mask.remove();
      window.removeEventListener('keydown', cancel);
      reject();
    }

    function submit() {
      mask.remove();
      resolve();
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        cancel();
      } else if (e.key === 'Enter') {
        submit();
      }
    });

    const header = h('header', { style: { ...(options.title ? {} : { display: 'none' }) } }, options.title);
    const centerStyle = options.center ? { alignItems: 'center' } : {};
    const textStyle = text ? {} : { display: 'none' };
    const main = h('main', { style: { ...mainStyle, ...centerStyle, ...textStyle } }, text);
    const footer = h('footer', { style: footerStyle }, [
      h('button', { class: 'btn text-xs', onClick: cancel }, '取消'),
      h('button', { class: 'btn text-xs primary', onClick: submit }, '确定'),
    ]);
    const modal = h('div', { class: 'v-modal', style: modalStyle, onClick: stopPropagation }, [header, main, footer]);
    const mask = h('div', { class: 'v-modal-mask', style: maskStyle, onClick: cancel }, modal);
    mask.animate({ opacity: [0, 1] }, { duration: 150 });
    modal.animate({ opacity: [0, 1], scale: [0.5, 1] }, { duration: 150 });
    document.body.appendChild(mask);
  });
}
