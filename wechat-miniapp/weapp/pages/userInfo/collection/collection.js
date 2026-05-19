// pages/userInfo/collection/collection.js
const app = getApp();
import api from '../../../config/api';
import path from '../../../config/path';
const { $Toast } = require('../../../dist/base/index');

Page({
  data: {
    picLocal: app.globalData.picLocal,
    bikeList: []
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '我的收藏' });
    this.loadCollections();
  },

  onShow() {
    this.loadCollections();
  },

  getCurrentUserId() {
    const loginData = wx.getStorageSync('loginData') || {};
    const userId = loginData.id || loginData.userId;
    return userId ? String(userId) : '';
  },

  normalizeImage(url) {
    const raw = String(url || '').trim();
    if (!raw) return 'https://api.iconify.design/mdi/scooter-electric.svg?color=%23d11a2a&width=640&height=640';
    if (/^https?:\/\//.test(raw) || /^\/images\//.test(raw)) return raw;
    const base = String(this.data.picLocal || '').replace(/\/+$/, '');
    if (!base) return `/${raw.replace(/^\/+/, '')}`;
    return `${base}/${raw.replace(/^\/+/, '')}`;
  },

  loadCollections() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.setData({ bikeList: [] });
      return;
    }
    api.post(path.path.findCollectionList, { userId }).then((res) => {
      const list = ((res && res.data) || []).map((item) => ({
        ...item,
        picUrl: this.normalizeImage(item.picUrl)
      }));
      this.setData({ bikeList: list });
    }).catch(() => {
      this.setData({ bikeList: [] });
    });
  },

  onReachBottom() {
    $Toast({ content: '没有更多数据了' });
  },

  toBikeInfo(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({ url: `../../index/bikeInfo/bikeInfo?id=${id}` });
  },

  removeCollection(e) {
    const vehicleId = String(e.currentTarget.dataset.id || '');
    const userId = this.getCurrentUserId();
    if (!vehicleId || !userId) return;

    api.post(path.path.deleteCollection, { userId, vehicleId }).then(() => {
      this.setData({
        bikeList: this.data.bikeList.filter((item) => String(item.id) !== vehicleId)
      });
      $Toast({ content: '已取消收藏' });
    }).catch(() => {
      $Toast({ content: '取消收藏失败' });
    });
  }
});
