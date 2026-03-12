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

function getCandidateBaseUrls() {
  const current = normalizeBase(app.globalData.baseUrl || '');
  if (current) return [current];
  // 开发工具环境下常见容灾地址（仅在未配置 baseUrl 时使用）
  return ['http://127.0.0.1:8080', 'http://localhost:8080'];
}

const api = {
  request(url, method, data) {
    const rawToken = wx.getStorageSync('token') || app.globalData.token;
    const token = typeof rawToken === 'string'
      ? rawToken
      : (rawToken && typeof rawToken.token === 'string' ? rawToken.token : '');
    const header = {
      'content-type': 'application/json'
    };
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }

    const tryBases = getCandidateBaseUrls();

    const requestOnce = (base, canFallback) => new Promise((resolve, reject) => {
      wx.request({
        url: buildUrl(base, url),
        method,
        data,
        header,
        success: (res) => {
          if (res.statusCode === 401) {
            app.login();
            reject({ code: 401, message: '登录已过期，请重新登录' });
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
          app.globalData.baseUrl = normalizeBase(base);
          resolve(res.data);
        },
        fail: (err) => {
          if (canFallback) {
            reject({ __tryNextBase: true, err });
            return;
          }
          console.error('网络请求失败:', err);
          wx.showToast({
            title: '网络错误，请检查后端服务和IP地址',
            icon: 'none'
          });
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
    const rawToken = wx.getStorageSync('token') || app.globalData.token;
    const token = typeof rawToken === 'string'
      ? rawToken
      : (rawToken && typeof rawToken.token === 'string' ? rawToken.token : '');
    const header = {};
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }

    const tryBases = getCandidateBaseUrls();

    const uploadOnce = (base, canFallback) => new Promise((resolve, reject) => {
      wx.uploadFile({
        url: buildUrl(base, url),
        filePath,
        name,
        formData,
        header,
        success: (res) => {
          try {
            const data = JSON.parse(res.data || '{}');
            if (res.statusCode === 401) {
              app.login();
              reject({ code: 401, message: '登录已过期，请重新登录' });
              return;
            }
            if (data && data.success) {
              app.globalData.baseUrl = normalizeBase(base);
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
          wx.showToast({
            title: '上传失败，请检查网络或后端地址',
            icon: 'none'
          });
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
