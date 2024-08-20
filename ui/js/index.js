import { createApp } from './petite.js';
import { vConfirm } from './vConfirm.js';
import { Icon } from './Icon.js';
import { useQuery, vTo } from './useQuery.js';
import { compact, append, split, join, isEmpty, parseJSON } from './utils.js';
import { b2s, s2b } from './base64.js';
import { showModal } from './modal.js';

/**
 * @typedef Item
 * @property {string} key
 * @property {boolean} [dir]
 * @property {string} [value]
 */

const PATHSPLITE = '::';

/**
 * 请求API
 * @param {string} action - 'set' | 'get' | 'del'
 * @param {string[]} [key] - key path
 * @param {string} [value] - value
 */
async function execApi(action, key, value) {
  const body = compact({ action, key, value });

  const r = await window.fetch(`${location.origin}/api`, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (r.status == 200) {
    return await r.json();
  }

  const errObj = parseJSON(await r.text());
  if (errObj) {
    throw errObj.err;
  }
}

const router = useQuery();

const app = {
  loading: true,
  loaded: false,
  error: '',

  meta: { path: '' },

  /** @type {'list'|'get'|'set'|'bucket'|'new'} - 请求动作 */
  action: 'list', //list, get, set, new

  /** @type {string[]} */
  buckets: [],
  key: '',
  value: '',

  /** @type {Item[]}  */
  list: [],

  editor_key: '',
  editor_value: '',
  show_type: 'text',

  get textKey() {
    return b2s(this.key);
  },

  get textValue() {
    return b2s(this.value);
  },

  async onMounted() {
    this.$router.add(this.load);
    await this.load();
    this.loaded = true;
  },

  async onUnmounted() {
    this.$router.remove(this.load);
  },

  async load() {
    this.action = this.$router.query.action ?? 'list';
    this.key = this.$router.query.key;
    this.buckets = split(this.$router.query.bucket, PATHSPLITE);
    this.editor_key = '';
    this.editor_value = this.value = '';

    this.error = '';
    try {
      this.loading = true;
      if (!this.loaded) {
        this.meta = await execApi('meta');
      }

      if (!this.loaded || this.action == 'list') {
        this.list = await execApi('list', this.buckets);
      }

      if (this.action == 'get') {
        this.value = await execApi('get', append(this.buckets, this.key));
        this.editor_value = b2s(this.value);

        this.editor_key = b2s(this.key);
        this.show_type = 'text';
      }
    } catch (error) {
      this.error = error;
    } finally {
      this.loading = false;
    }
  },

  get changed() {
    if (!['get', 'set', 'new'].includes(this.action)) {
      return false;
    }

    if (this.action === 'get' && this.show_type !== 'text') {
      return false;
    }

    if (this.action === 'get') {
      return s2b(this.editor_value) !== this.value;
    }

    return s2b(this.editor_value) !== this.value || s2b(this.editor_key) !== this.key;
  },

  get bucket() {
    return join(this.buckets, PATHSPLITE);
  },

  get db() {
    const filepaths = split(this.meta?.path, '/');
    if (filepaths.length) {
      return {
        name: String(filepaths.at(-1) ?? ''),
        dir: join(filepaths.slice(0, -1), '/'),
      };
    }
    return { name: '', dir: '' };
  },

  isAction(...actions) {
    return actions.includes(this.action);
  },

  isKey(key = '') {
    return this.key === key;
  },

  bucketUrl(i) {
    return {
      action: 'list',
      bucket: join(this.buckets?.slice(0, i), PATHSPLITE),
    };
  },

  /**
   * 获取 item 的 url
   * @param {{dir?:boolean; key?: string[]}} item - item
   */
  itemUrl(item) {
    return {
      action: item.dir ? 'list' : 'get',
      bucket: join(this.buckets, item.dir ? item.key : [], PATHSPLITE),
      key: item.dir ? '' : item.key,
    };
  },

  handleDel(key) {
    // const keyPath = append(this.buckets, key ? key : []);
    showModal('确定删除？', { center: true })
      .then(() => execApi('del', append(this.buckets, key ? key : [])))
      .then(() => this.afterApi())
      .catch((err) => (this.error = err));
  },

  handleUpdate() {
    execApi('set', append(this.buckets, this.key), s2b(this.editor_value))
      .then(() => this.afterApi())
      .catch((err) => (this.error = err));
  },

  handleSet() {
    execApi('set', append(this.buckets, s2b(this.editor_key)), s2b(this.editor_value))
      .then(() => this.afterApi())
      .catch((err) => (this.error = err));
  },

  handleNew() {
    execApi('new', append(this.buckets, s2b(this.editor_key)))
      .then(() => this.afterApi())
      .catch((err) => (this.error = err));
  },

  afterApi() {
    if (this.action !== 'list') {
      this.$router.push({ action: 'list', bucket: this.bucket });
    } else {
      this.load();
    }
  },

  $router: router,

  s2b,
  b2s,
  Icon,
};

// createApp(app).directive('to', vTo).directive('confirm', vConfirm).mount();

setTimeout(() => createApp(app).directive('to', vTo).directive('confirm', vConfirm).mount(), 1000);
