// pages/userInfo/manageLogin/login.js
const app = getApp();
import api from '../../../config/api';
import path from '../../../config/path';

Page({
  data: {
    i18n: {
      account: '\u8d26\u6237',
      accountPlaceholder: '\u8bf7\u8f93\u5165\u8d26\u6237',
      password: '\u5bc6\u7801',
      passwordPlaceholder: '\u8bf7\u8f93\u5165\u5bc6\u7801',
      login: '\u767b\u5f55',
      registerUser: '\u6ce8\u518c\u7528\u6237',
      welcome: '\u6b22\u8fce\u4f7f\u7528\u6613\u79df\u8f66',
      navTitle: '\u79df\u8f66'
    },

    picLocal: app.globalData.picLocal,
    systemName: '易租车平台',
    systemLogo: '',
    loginName: '',
    password: '',
    showPassword: false,
    eyeOpenIcon: 'https://api.iconify.design/mdi/eye.svg',
    eyeClosedIcon: 'https://api.iconify.design/mdi/eye-off.svg'
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: this.data.i18n.navTitle });
    this.setData({
      systemName: '易租车平台',
      systemLogo: ''
    });
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/userInfo/manageLogin/register' });
  },

  login() {
    const params = { username: this.data.loginName, password: this.data.password };
    api.post(path.path.login, params).then((res) => {
      if (!res.success) {
        this.showLoginErrorModal();
        return;
      }
      const token = (res.data && res.data.token) ? res.data.token : res.data;
      wx.setStorageSync('token', token);
      wx.setStorageSync('loginUsername', this.data.loginName);
      wx.setStorageSync('isLogin', true);
      wx.removeStorageSync('wxProfile');
      api.post(path.path.getLoginData, { username: this.data.loginName }).then((userRes) => {
        const userData = (userRes && userRes.data) ? userRes.data : null;
        if (userData) {
          wx.setStorageSync('loginData', userData);
        }
        wx.showToast({ title: '\u767b\u5f55\u6210\u529f', icon: 'success' });
        wx.switchTab({ url: '/pages/userInfo/myInfo' });
      }).catch(() => {
        wx.showToast({ title: '\u767b\u5f55\u6210\u529f', icon: 'success' });
        wx.switchTab({ url: '/pages/userInfo/myInfo' });
      });
      wx.showToast({ title: '登录成功', icon: 'success' });
      wx.switchTab({ url: '/pages/userInfo/myInfo' });
    }).catch(() => this.showLoginErrorModal());
  },

  showLoginErrorModal() {
    wx.showModal({
      title: '登录失败',
      content: '用户名或密码错误',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  loginNameChange(e) {
    this.setData({ loginName: e.detail.detail.value });
  },

  passwordChange(e) {
    this.setData({ password: e.detail.detail.value });
  },

  passwordInput(e) {
    this.setData({ password: e.detail.value || '' });
  },

  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword });
  },

  wechatLogin(e) {
    this.doWechatLogin(e || {});
  },

  ensurePrivacyAuthorize() {
    return new Promise((resolve, reject) => {
      if (typeof wx.requirePrivacyAuthorize !== 'function') {
        resolve();
        return;
      }
      wx.requirePrivacyAuthorize({
        success: () => resolve(),
        fail: () => reject(new Error('请先同意隐私授权后再登录'))
      });
    });
  },

  getLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res && res.code) {
            resolve(res.code);
            return;
          }
          reject(new Error('获取登录凭证失败，请重试'));
        },
        fail: () => reject(new Error('微信登录失败，请稍后重试'))
      });
    });
  },

  getPhonePayload(detail) {
    const d = detail || {};
    const failMsg = String(d.errMsg || '');
    if (failMsg.includes('fail')) return {};
    return {
      phoneCode: d.code || '',
      phoneEncryptedData: d.encryptedData || '',
      phoneIv: d.iv || ''
    };
  },

  fetchWechatProfileSafe() {
    return new Promise((resolve) => {
      wx.getUserProfile({
        desc: '用于完善会员资料',
        success: (res) => resolve(res || {}),
        fail: () => resolve({})
      });
    });
  },

  loginByBackend(payloadV2, payloadLegacy) {
    return api.post(path.path.wechatLogin, payloadV2).catch(() => api.post('api/wechat/auth/login', payloadLegacy));
  },

  doWechatLogin(e) {
    this.ensurePrivacyAuthorize()
      .then(() => this.getLoginCode())
      .then((code) => {
        const phonePayload = this.getPhonePayload((e && e.detail) || {});
        return this.fetchWechatProfileSafe().then((profileRes) => {
          const userInfo = profileRes.userInfo || {};
          const payloadV2 = {
            code,
            userInfo: profileRes.encryptedData || '',
            iv: profileRes.iv || '',
            encryptedData: profileRes.encryptedData || '',
            rawData: profileRes.rawData || '',
            signature: profileRes.signature || '',
            nickname: userInfo.nickName || '',
            avatarUrl: userInfo.avatarUrl || '',
            gender: typeof userInfo.gender === 'number' ? userInfo.gender : null,
            ...phonePayload
          };
          const payloadLegacy = {
            code,
            nickname: userInfo.nickName || '',
            avatarUrl: userInfo.avatarUrl || '',
            gender: typeof userInfo.gender === 'number' ? userInfo.gender : null
          };

          return this.loginByBackend(payloadV2, payloadLegacy).then((resp) => {
            const data = (resp && resp.data) || {};
            const token = data.token || resp.token || '';
            if (!token) {
              wx.showToast({ title: '登录失败，未获取到令牌', icon: 'none' });
              return;
            }

            const fallbackUser = {
              id: data.userId || data.openId || `wx_${Date.now()}`,
              userId: data.userId || data.openId || '',
              openId: data.openId || '',
              username: data.username || 'wx_user',
              name: userInfo.nickName || data.username || '微信用户',
              headUrl: userInfo.avatarUrl || '',
              roleStr: 'User'
            };

            wx.setStorageSync('token', token);
            wx.setStorageSync('isLogin', true);
      wx.removeStorageSync('wxProfile');
      api.post(path.path.getLoginData, { username: this.data.loginName }).then((userRes) => {
        const userData = (userRes && userRes.data) ? userRes.data : null;
        if (userData) {
          wx.setStorageSync('loginData', userData);
        }
        wx.showToast({ title: '\u767b\u5f55\u6210\u529f', icon: 'success' });
        wx.switchTab({ url: '/pages/userInfo/myInfo' });
      }).catch(() => {
        wx.showToast({ title: '\u767b\u5f55\u6210\u529f', icon: 'success' });
        wx.switchTab({ url: '/pages/userInfo/myInfo' });
      });
            wx.setStorageSync('wxProfile', {
              nickName: userInfo.nickName || '',
              avatarUrl: userInfo.avatarUrl || ''
            });
            wx.setStorageSync('loginData', fallbackUser);
            wx.setStorageSync('loginUsername', fallbackUser.username || '');

            wx.showToast({ title: '登录成功', icon: 'success' });
            wx.switchTab({ url: '/pages/userInfo/myInfo' });
          });
        });
      })
      .catch((err) => {
        const msg = (err && err.message) ? err.message : '登录失败，请稍后重试';
        wx.showToast({ title: msg, icon: 'none' });
      });
  }
});
