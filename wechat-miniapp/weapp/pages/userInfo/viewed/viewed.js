// pages/userInfo/viewed/viewed.js
const app = getApp();
import api from '../../../config/api';
import path from '../../../config/path';
const { $Toast } = require('../../../dist/base/index');

const VIEWED_KEY = 'viewedVehicleList';

Page({
  data: {
    picLocal: (app.globalData.picLocal || '').replace(/\/+$/, ''),
    bikeList: [],
    pageData: {
      pageNo: 1,
      pageSize: 8,
      count: 0
    },
    bottomLoading: false,
    loading: true,
    loadError: ''
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '看车记录' });
    if (!this.isLogin()) {
      this.setEmptyState();
      return;
    }
    this.fetchViewedList(true);
  },

  onShow() {
    if (!this.isLogin()) {
      this.setEmptyState();
      return;
    }
    this.fetchViewedList(true);
  },

  onPullDownRefresh() {
    if (!this.isLogin()) {
      this.setEmptyState();
      wx.stopPullDownRefresh();
      return;
    }
    this.fetchViewedList(true);
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (!this.isLogin()) return;
    if (this.data.bottomLoading) return;
    const { pageNo, pageSize, count } = this.data.pageData;
    if (count <= pageNo * pageSize) {
      $Toast({ content: '没有更多记录了' });
      return;
    }
    this.fetchViewedList(false);
  },

  toBikeInfo(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({ url: `../../index/bikeInfo/bikeInfo?id=${id}` });
  },

  fetchViewedList(reset) {
    const loginData = wx.getStorageSync('loginData') || {};
    const rawUserId = loginData.userId || loginData.id;
    const userId = Number(rawUserId);
    if (Number.isFinite(userId) && userId > 0) {
      api.post(path.path.findViewedList, { userId }).then((res) => {
        const allList = Array.isArray((res && res.data) || []) ? res.data : [];
        const pageNo = reset ? 1 : this.data.pageData.pageNo + 1;
        const pageSize = this.data.pageData.pageSize;
        const start = (pageNo - 1) * pageSize;
        const end = start + pageSize;
        const segment = allList.slice(start, end).map((item) => this.normalizeViewedItem(item));
        wx.setStorageSync(VIEWED_KEY, allList);
        this.setData({
          loading: false,
          bottomLoading: false,
          loadError: '',
          bikeList: reset ? segment : this.data.bikeList.concat(segment),
          pageData: {
            pageNo,
            pageSize,
            count: allList.length
          }
        });
      }).catch(() => {
        this.fetchViewedListFromLocal(reset);
      });
      return;
    }
    this.fetchViewedListFromLocal(reset);
  },

  fetchViewedListFromLocal(reset) {
    const all = wx.getStorageSync(VIEWED_KEY) || [];
    const allList = Array.isArray(all) ? all : [];
    const pageNo = reset ? 1 : this.data.pageData.pageNo + 1;
    const pageSize = this.data.pageData.pageSize;
    const start = (pageNo - 1) * pageSize;
    const end = start + pageSize;
    const segment = allList.slice(start, end).map((item) => this.normalizeViewedItem(item));
    this.setData({
      loading: false,
      bottomLoading: false,
      loadError: '',
      bikeList: reset ? segment : this.data.bikeList.concat(segment),
      pageData: {
        pageNo,
        pageSize,
        count: allList.length
      }
    });
  },

  isLogin() {
    return wx.getStorageSync('isLogin') === true && !!wx.getStorageSync('token');
  },

  setEmptyState() {
    this.setData({
      loading: false,
      bottomLoading: false,
      loadError: '',
      bikeList: [],
      pageData: {
        ...this.data.pageData,
        pageNo: 1,
        count: 0
      }
    });
  },

  normalizeImage(url) {
    const raw = String(url || '').trim();
    if (!raw) return 'https://api.iconify.design/mdi/scooter-electric.svg?color=%23d11a2a&width=640&height=640';
    if (/^https?:\/\//.test(raw) || /^\/images\//.test(raw) || /^data:image\//.test(raw)) return raw;
    const base = this.data.picLocal;
    if (!base) return `/${raw.replace(/^\/+/, '')}`;
    return `${base}/${raw.replace(/^\/+/, '')}`;
  },

  normalizeViewedItem(item) {
    const source = item || {};
    return {
      id: String(source.id || ''),
      picUrl: this.normalizeImage(source.picUrl),
      vehicleName: source.vehicleName || '',
      monthPrice: source.monthPrice || '--',
      hourPrice: source.hourPrice || '--',
      region: source.region || '',
      address: source.address || '地址待补充',
      distance: source.distance || '--',
      bikeType: source.bikeType || '电动车'
    };
  }
});
