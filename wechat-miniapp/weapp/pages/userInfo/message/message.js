// pages/userInfo/message/message.js
import api from '../../../config/api';
import path from '../../../config/path';

Page({
  data: {
    currentTab: 'wait',
    messageList: [],
    pageData: {
      pageNo: 1,
      pageSize: 10,
      count: 0
    },
    viewMessage: {},
    dialogVisible: false
  },

  onReady() {
    this.findMessage();
    this.refreshMyTabBadge();
  },

  onShow() {
    this.findMessage();
    this.refreshMyTabBadge();
  },

  getCurrentUserId() {
    const loginData = wx.getStorageSync('loginData') || {};
    const uid = Number(loginData.userId || loginData.id || 0);
    return Number.isFinite(uid) && uid > 0 ? uid : 0;
  },

  tabChange({ detail }) {
    this.setData({
      currentTab: detail.key,
      pageData: {
        ...this.data.pageData,
        pageNo: 1,
        pageSize: 10
      }
    });
    this.findMessage();
  },

  mapMessage(item) {
    const src = item || {};
    return {
      id: src.id,
      title: src.title || '系统通知',
      text: src.text || src.content || '',
      createDate: src.createDate || src.createTime || '',
      state: Number(src.state || 0)
    };
  },

  findMessage() {
    const state = this.data.currentTab === 'wait' ? 0 : 1;
    const params = {
      pageNo: this.data.pageData.pageNo,
      pageSize: this.data.pageData.pageSize,
      state,
      userId: this.getCurrentUserId()
    };
    api.post(path.path.findMessage, params).then((res) => {
      const data = (res && res.data) || {};
      const list = Array.isArray(data.list) ? data.list.map((x) => this.mapMessage(x)) : [];
      this.setData({
        messageList: list,
        pageData: {
          ...this.data.pageData,
          count: Number(data.count || 0)
        }
      });
    }).catch(() => {});
  },

  updateMyTabBadge(unreadCount) {
    const num = Number(unreadCount || 0);
    if (!Number.isFinite(num) || num <= 0) {
      wx.removeTabBarBadge({ index: 2 });
      return;
    }
    wx.setTabBarBadge({
      index: 2,
      text: num > 99 ? '99+' : String(num)
    });
  },

  refreshMyTabBadge() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.updateMyTabBadge(0);
      return;
    }
    api.post(path.path.getBaseInfoCount, { userId }).then((res) => {
      const data = (res && res.data) || {};
      this.updateMyTabBadge(data.messageCount || 0);
    }).catch(() => {});
  },

  viewMessage(e) {
    const id = e.currentTarget.dataset.id;
    const hit = (this.data.messageList || []).find((item) => String(item.id) === String(id));
    if (!hit) return;
    this.setData({
      viewMessage: hit,
      dialogVisible: true
    });
    if (this.data.currentTab === 'wait') {
      api.post(path.path.changeMessage, { id: hit.id, state: 1 }).then(() => {
        this.refreshMyTabBadge();
      }).catch(() => {});
    }
  },

  close() {
    this.setData({ dialogVisible: false });
    this.findMessage();
    this.refreshMyTabBadge();
  }
});
