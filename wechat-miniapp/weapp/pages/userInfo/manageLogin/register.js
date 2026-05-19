// pages/userInfo/manageLogin/register.js
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
      confirmPassword: '\u786e\u8ba4\u5bc6\u7801',
      confirmPasswordPlaceholder: '\u8bf7\u518d\u6b21\u8f93\u5165\u5bc6\u7801',
      realName: '\u59d3\u540d',
      realNamePlaceholder: '\u8bf7\u8f93\u5165\u59d3\u540d(\u53ef\u9009)',
      phone: '\u624b\u673a\u53f7',
      phonePlaceholder: '\u8bf7\u8f93\u5165\u624b\u673a\u53f7(\u53ef\u9009)',
      register: '\u6ce8\u518c',
      backLogin: '\u8fd4\u56de\u767b\u5f55',
      welcome: '\u6b22\u8fce\u4f7f\u7528\u77f3\u9f99\u9547\u7535\u52a8\u8f66\u79df\u8d41\u5e73\u53f0',
      navTitle: '\u6ce8\u518c\u7528\u6237'
    },

    picLocal: app.globalData.picLocal,
    systemName: '\u77f3\u9f99\u9547\u7535\u52a8\u8f66\u79df\u8d41\u5e73\u53f0',
    systemLogo: '',
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    phone: '',
    showPassword: false,
    showConfirm: false,
    eyeOpenIcon: 'https://api.iconify.design/mdi/eye.svg',
    eyeClosedIcon: 'https://api.iconify.design/mdi/eye-off.svg'
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: this.data.i18n.navTitle });
    this.setData({
      systemName: '\u77f3\u9f99\u9547\u7535\u52a8\u8f66\u79df\u8d41\u5e73\u53f0',
      systemLogo: ''
    });
  },

  usernameChange(e) {
    this.setData({ username: e.detail.detail.value });
  },

  realNameChange(e) {
    this.setData({ realName: e.detail.detail.value });
  },

  phoneChange(e) {
    this.setData({ phone: e.detail.detail.value });
  },

  passwordInput(e) {
    this.setData({ password: e.detail.value || '' });
  },

  confirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value || '' });
  },

  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword });
  },

  toggleConfirm() {
    this.setData({ showConfirm: !this.data.showConfirm });
  },

  register() {
    const username = String(this.data.username || '').trim();
    const password = String(this.data.password || '').trim();
    const confirmPassword = String(this.data.confirmPassword || '').trim();
    const realName = String(this.data.realName || '').trim();
    const phone = String(this.data.phone || '').trim();

    if (!username) {
      wx.showToast({ title: '请输入账户', icon: 'none' });
      return;
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    if (password !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }

    const payload = {
      username,
      password,
      realName: realName || null,
      phone: phone || null
    };

    api.post(path.path.registerUser, payload).then((res) => {
      if (!res || res.success === false) {
        wx.showToast({ title: (res && res.message) ? res.message : '注册失败', icon: 'none' });
        return;
      }
      wx.showToast({ title: '注册成功，请登录', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }).catch(() => {
      wx.showToast({ title: '注册失败，请稍后重试', icon: 'none' });
    });
  },

  goLogin() {
    setTimeout(() => {
        wx.navigateBack();
      }, 2000);
  }
});
