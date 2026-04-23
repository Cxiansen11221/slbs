// app.js
App({
  onUnhandledRejection(res) {
    try {
      // Avoid DevTools lifecycle crash due to unhandled promise rejection (e.g. network timeout).
      const reason = (res && res.reason) ? res.reason : res;
      const msg = reason && (reason.message || reason.errMsg) ? (reason.message || reason.errMsg) : String(reason || '');
      console.error('onUnhandledRejection:', msg, res);
      if (msg && msg.toLowerCase().includes('timeout')) {
        wx.showToast({ title: '请求超时，请检查后端是否可访问', icon: 'none' });
      }
    } catch (e) {
      // ignore
    }
  },

  onError(err) {
    console.error('App onError:', err);
  },

  onLaunch() {
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);
    this.sanitizeLocalUserCache();
    this.sanitizeAllStorage();
    this.initBaseUrlByNetwork();
  },

  initBaseUrlByNetwork() {
    // In WeChat DevTools, always prefer localhost to avoid LAN timeouts during desktop testing.
    let isDevtools = false;
    try {
      const sys = wx.getSystemInfoSync();
      isDevtools = String((sys && sys.platform) || '').toLowerCase() === 'devtools';
    } catch (e) {
      isDevtools = false;
    }
    if (isDevtools) {
      const devBase = 'http://127.0.0.1:8080';
      this.globalData.baseUrl = devBase;
      this.globalData.picLocal = `${devBase}/images/`;
      return;
    }

    const savedBase = wx.getStorageSync('backendBaseUrl');
    if (savedBase) {
      this.globalData.baseUrl = String(savedBase).replace(/\/+$/, '');
      this.globalData.picLocal = `${this.globalData.baseUrl}/images/`;
    }
    wx.getNetworkType({
      success: (res) => {
        const networkType = String((res && res.networkType) || '');
        const preferPublic = networkType === '4g' || networkType === '5g' || networkType === '3g' || networkType === '2g';
        const localFallback = (Array.isArray(this.globalData.localBaseUrls) && this.globalData.localBaseUrls.length > 0)
          ? this.globalData.localBaseUrls[0]
          : this.globalData.localBaseUrl;
        const target = (preferPublic && this.globalData.publicBaseUrl) ? this.globalData.publicBaseUrl : localFallback;
        this.globalData.baseUrl = String(target || '').replace(/\/+$/, '');
        this.globalData.picLocal = `${this.globalData.baseUrl}/images/`;
      }
    });
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
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res && res.code) {
            this.getToken(res.code).then(resolve).catch(reject);
            return;
          }
          reject(new Error('no login code'));
        },
        fail: (err) => {
          console.error('微信登录失败:', err);
          reject(err || new Error('wx.login failed'));
        }
      });
    });
  },

  getToken(code) {
    const api = require('./config/api.js');
    const path = require('./config/path.js');
    return api.post(path.path.wechatLogin, { code }).then((res) => {
      if (!res || !res.success || !res.data || !res.data.token) {
        throw new Error('no token');
      }
      wx.setStorageSync('token', res.data.token);
      this.globalData.token = res.data.token;
      this.globalData.userInfo = {
        openId: res.data.openId || '',
        nickname: res.data.username || ''
      };
      return res.data.token;
    }).catch((err) => {
      console.error('获取令牌失败:', err);
      throw err;
    });
  },

  globalData: {
    userInfo: null,
    token: null,
    // 默认先走局域网；如需广域网登录，请把 publicBaseUrl 改成你的 HTTPS 公网域名
    // 同时支持“校园网”和“手机热点”两种常见网段，接口请求会自动轮询可用地址
    localBaseUrls: [
      'http://192.168.2.230:8080',   // 校园网/路由器局域网示例
      'http://192.168.11.248:8080'   // 手机热点示例（电脑连接手机热点后的 IPv4）
    ],
    // 兼容旧字段：保留一个默认局域网地址
    localBaseUrl: 'http://192.168.2.230:8080',
    publicBaseUrl: '',
    baseUrl: 'http://192.168.2.230:8080',
    picLocal: 'http://192.168.2.230:8080/images/'
  }
});
