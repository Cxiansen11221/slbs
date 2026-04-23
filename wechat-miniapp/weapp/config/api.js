// api.js
const app = getApp();

function normalizeBase(url) {
  return String(url || '').replace(/\/+$/, '');
}

function buildUrl(base, url) {
  const cleanBase = normalizeBase(base);
  const path = `/${String(url || '').replace(/^\/+/, '')}`;
  return `${cleanBase}${path}`.replace(/([^:]\/)\/+/g, '$1');
}

function getTokenString() {
  const rawToken = wx.getStorageSync('token') || app.globalData.token;
  if (typeof rawToken === 'string') return rawToken;
  if (rawToken && typeof rawToken.token === 'string') return rawToken.token;
  return '';
}

function buildAuthHeader(extra = {}) {
  const token = getTokenString();
  const header = {
    'content-type': 'application/json',
    ...extra
  };
  if (token) header.Authorization = `Bearer ${token}`;
  return header;
}

function getCandidateBaseUrls() {
  const current = normalizeBase(app.globalData.baseUrl || '');
  const local = normalizeBase(app.globalData.localBaseUrl || '');
  const locals = Array.isArray(app.globalData.localBaseUrls) ? app.globalData.localBaseUrls : [];
  const localList = locals.map((u) => normalizeBase(u)).filter(Boolean);
  const pub = normalizeBase(app.globalData.publicBaseUrl || '');
  const storageBase = normalizeBase(wx.getStorageSync('backendBaseUrl') || '');
  let isDevtools = false;
  try {
    const sys = wx.getSystemInfoSync();
    isDevtools = String((sys && sys.platform) || '').toLowerCase() === 'devtools';
  } catch (e) {
    isDevtools = false;
  }

  // Prefer explicit local list first; avoid trying stale cached baseUrl that can cause long timeouts.
  const devtoolsFirst = isDevtools ? ['http://127.0.0.1:8080', 'http://localhost:8080'] : [];
  const candidates = []
    .concat(devtoolsFirst)
    .concat([current])
    .concat(localList)
    .concat([local])
    // In DevTools, skip cached baseUrl to avoid long timeouts due to stale LAN IP.
    .concat(!isDevtools && storageBase ? [storageBase] : [])
    .concat([pub])
    .filter(Boolean);
  return [...new Set(candidates)];
}

function applyBase(base) {
  const normalized = normalizeBase(base);
  app.globalData.baseUrl = normalized;
  app.globalData.picLocal = `${normalized}/images/`;
}

function showNetworkDebugHint(title, requestUrl, err) {
  const errMsg = String((err && err.errMsg) || (err && err.message) || 'unknown error');
  const shortUrl = String(requestUrl || '').slice(0, 120);
  wx.showModal({
    title: title || '网络请求失败',
    content: `请确认手机与电脑在同一局域网，并检查地址是否可访问：\n${shortUrl}\n${errMsg}`,
    showCancel: false
  });
}

const api = {
  request(url, method, data) {
    const tryBases = getCandidateBaseUrls();

    const ensureLoginOnce = () => {
      if (!app || typeof app.login !== 'function') return Promise.reject(new Error('app.login not found'));
      if (!app.__loginPromise) {
        app.__loginPromise = Promise.resolve()
          .then(() => app.login())
          .finally(() => { app.__loginPromise = null; });
      }
      return app.__loginPromise;
    };

    const requestOnce = (base, canFallback, retried401 = false) => new Promise((resolve, reject) => {
      const requestUrl = buildUrl(base, url);
      wx.request({
        url: requestUrl,
        method,
        data,
        header: buildAuthHeader(),
        timeout: 10000,
        success: (res) => {
          if (res.statusCode === 401) {
            if (retried401) {
              reject({ code: 401, message: '登录已过期，请重新登录' });
              return;
            }
            ensureLoginOnce()
              .then(() => requestOnce(base, canFallback, true).then(resolve).catch(reject))
              .catch(() => reject({ code: 401, message: '登录已过期，请重新登录' }));
            return;
          }
          if (res.statusCode >= 400) {
            const msg = (res.data && res.data.message) || res.errMsg || '请求失败';
            reject({ code: res.statusCode, message: msg });
            return;
          }
          if (res.data && !res.data.success) {
            reject({ code: res.statusCode, message: res.data.message || '请求失败' });
            return;
          }
          // 当前地址可用，固化为全局地址
          applyBase(base);
          resolve(res.data);
        },
        fail: (err) => {
          console.error('请求失败URL:', requestUrl);
          if (canFallback) {
            reject({ __tryNextBase: true, err });
            return;
          }
          console.error('网络请求失败:', err);
          showNetworkDebugHint('网络请求失败', requestUrl, err);
          reject(err);
        }
      });
    });

    // 串行重试不同 baseUrl
    return tryBases.reduce((p, base, idx) => {
      return p.catch((e) => {
        if (idx === 0 || (e && e.__tryNextBase)) {
          const canFallback = idx < tryBases.length - 1;
          return requestOnce(base, canFallback);
        }
        throw e;
      });
    }, Promise.reject({ __tryNextBase: true }));
  },

  post(url, data) {
    return this.request(url, 'POST', data);
  },

  get(url, data) {
    return this.request(url, 'GET', data);
  },

  put(url, data) {
    return this.request(url, 'PUT', data);
  },

  delete(url, data) {
    return this.request(url, 'DELETE', data);
  },

  upload(url, filePath, name = 'file', formData = {}) {
    const tryBases = getCandidateBaseUrls();

    const ensureLoginOnce = () => {
      if (!app || typeof app.login !== 'function') return Promise.reject(new Error('app.login not found'));
      if (!app.__loginPromise) {
        app.__loginPromise = Promise.resolve()
          .then(() => app.login())
          .finally(() => { app.__loginPromise = null; });
      }
      return app.__loginPromise;
    };

    const uploadOnce = (base, canFallback, retried401 = false) => new Promise((resolve, reject) => {
      wx.uploadFile({
        url: buildUrl(base, url),
        filePath,
        name,
        formData,
        header: buildAuthHeader({}),
        success: (res) => {
          try {
            const data = JSON.parse(res.data || '{}');
            if (res.statusCode === 401) {
              if (retried401) {
                reject({ code: 401, message: '登录已过期，请重新登录' });
                return;
              }
              ensureLoginOnce()
                .then(() => uploadOnce(base, canFallback, true).then(resolve).catch(reject))
                .catch(() => reject({ code: 401, message: '登录已过期，请重新登录' }));
              return;
            }
            if (data && data.success) {
              applyBase(base);
              resolve(data);
              return;
            }
            reject({ code: res.statusCode, message: (data && data.message) || '上传失败' });
          } catch (e) {
            reject({ code: res.statusCode, message: '上传响应解析失败' });
          }
        },
        fail: (err) => {
          if (canFallback) {
            reject({ __tryNextBase: true, err });
            return;
          }
          showNetworkDebugHint('上传失败', buildUrl(base, url), err);
          reject(err);
        }
      });
    });

    return tryBases.reduce((p, base, idx) => {
      return p.catch((e) => {
        if (idx === 0 || (e && e.__tryNextBase)) {
          const canFallback = idx < tryBases.length - 1;
          return uploadOnce(base, canFallback);
        }
        throw e;
      });
    }, Promise.reject({ __tryNextBase: true }));
  }
};

module.exports = api;
