// app.js
App({
  onLaunch() {
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);
    this.sanitizeLocalUserCache();
    this.sanitizeAllStorage();
  },

  isTemporaryLocalPath(pathValue) {
    const s = String(pathValue || '');
    return s.includes('/__tmp__/')
      || s.includes('/__usr__/')
      || s.includes('127.0.0.1');
  },

  sanitizeLocalUserCache() {
    const loginData = wx.getStorageSync('loginData') || {};
    if (loginData && this.isTemporaryLocalPath(loginData.headUrl || loginData.avatarUrl)) {
      const cleaned = { ...loginData };
      delete cleaned.headUrl;
      delete cleaned.avatarUrl;
      delete cleaned.displayHeadUrl;
      wx.setStorageSync('loginData', cleaned);
    }

    const wxProfile = wx.getStorageSync('wxProfile') || {};
    if (wxProfile && this.isTemporaryLocalPath(wxProfile.avatarUrl)) {
      wx.setStorageSync('wxProfile', {
        ...wxProfile,
        avatarUrl: ''
      });
    }
  },

  sanitizeValueDeep(value) {
    if (typeof value === 'string') {
      return this.isTemporaryLocalPath(value) ? '' : value;
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeValueDeep(item));
    }
    if (value && typeof value === 'object') {
      const next = {};
      Object.keys(value).forEach((k) => {
        next[k] = this.sanitizeValueDeep(value[k]);
      });
      return next;
    }
    return value;
  },

  sanitizeAllStorage() {
    try {
      const info = wx.getStorageInfoSync() || {};
      const keys = Array.isArray(info.keys) ? info.keys : [];
      keys.forEach((key) => {
        const oldVal = wx.getStorageSync(key);
        const newVal = this.sanitizeValueDeep(oldVal);
        const oldJson = JSON.stringify(oldVal);
        const newJson = JSON.stringify(newVal);
        if (oldJson !== newJson) {
          wx.setStorageSync(key, newVal);
        }
      });
    } catch (e) {
      console.warn('sanitizeAllStorage failed', e);
    }
  },

  // 用于 token 过期后的静默刷新（仅 code）
  login() {
    wx.login({
      success: (res) => {
        if (res && res.code) {
          this.getToken(res.code);
        }
      },
      fail: (err) => {
        console.error('微信登录失败:', err);
      }
    });
  },

  getToken(code) {
    const api = require('./config/api.js');
    const path = require('./config/path.js');
    api.post(path.path.wechatLogin, { code }).then((res) => {
      if (!res || !res.success || !res.data || !res.data.token) return;
      wx.setStorageSync('token', res.data.token);
      this.globalData.token = res.data.token;
      this.globalData.userInfo = {
        openId: res.data.openId || '',
        nickname: res.data.username || ''
      };
    }).catch((err) => {
      console.error('获取令牌失败:', err);
    });
  },

  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'http://192.168.2.230:8080',
    picLocal: 'http://192.168.2.230:8080/images/'
  }
});
