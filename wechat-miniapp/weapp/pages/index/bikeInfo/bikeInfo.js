// pages/index/bikeInfo/bikeInfo.js
import api from '../../../config/api';
import path from '../../../config/path';

// Icon from Iconify (Material Design Icons): mdi:scooter-electric
// Using a remote SVG avoids bundling new bitmap assets.
const PLACEHOLDER_IMG = 'https://api.iconify.design/mdi/scooter-electric.svg?color=%23d11a2a&width=640&height=640';
const VIEWED_KEY = 'viewedVehicleList';

Page({
  data: {
    bikeId: '',
    bikeInfo: null,
    isCollected: false,
    loading: true,
    loadError: '',
    navigating: false
  },

  onLoad(options) {
    const bikeId = String((options && options.id) || '');
    if (!bikeId) {
      this.setData({ loading: false, loadError: '车辆ID无效' });
      return;
    }

    this.setData({ bikeId, isCollected: false });
    this.getBikeInfo(bikeId);
    this.loadCollectedState(bikeId);
  },

  normalizeVehicle(raw) {
    const item = raw || {};
    const id = item.vehicleId || item.id || this.data.bikeId;
    const cacheList = wx.getStorageSync('latestVehicleList') || [];
    const cacheItem = Array.isArray(cacheList)
      ? cacheList.find((v) => String(v.vehicleId || v.id) === String(id))
      : null;
    const price = item.price
      || item.rentPrice
      || item.hourPrice
      || item.hourlyPrice
      || (cacheItem && (cacheItem.price || cacheItem.rentPrice || cacheItem.hourPrice || cacheItem.hourlyPrice))
      || 0;
    const cachedBattery = cacheItem && (cacheItem.batteryLevel || cacheItem.battery_percentage);
    const battery = Number(item.batteryLevel || item.battery_percentage || cachedBattery || 0);
    const status = item.status;
    const statusText = status === 1 ? '可用' : (status === 2 ? '已租' : '不可用');

    return {
      id,
      vehicleName: `${item.brand || '电动车'} ${item.model || ''}`.trim(),
      hourlyPrice: Number(price) || 0,
      priceText: `¥${Number(price) || 0}/小时`,
      vehicleType: this.mapVehicleType(item.vehicleType),
      vehicleBrand: item.brand || '未知品牌',
      statusText,
      region: item.location || item.city || '附近网点',
      batteryLevel: Number.isNaN(battery) ? 0 : Math.max(0, Math.min(100, battery)),
      batteryStatus: battery >= 60 ? '良好' : (battery >= 30 ? '一般' : '偏低'),
      chargeType: item.batteryType === 2 ? '锂电' : '铅酸',
      mileage: item.rangeMileage || item.mileage || '--',
      description: item.description || '暂无车辆描述，可先查看车辆参数和状态。',
      address: item.address || item.location || '地址信息待补充',
      picUrl: item.frontImageUrl || item.imageUrl || item.picUrl || PLACEHOLDER_IMG
    };
  },

  mapVehicleType(type) {
    const map = { 1: '标准型', 2: '轻享型', 3: '长续航' };
    return map[type] || '电动车';
  },

  getBikeInfo(id) {
    this.setData({ loading: true, loadError: '' });
    api.get(`api/vehicle/${id}`).then((res) => {
      const bikeInfo = this.normalizeVehicle((res && res.data) || {});
      this.setData({ bikeInfo, loading: false });
      this.recordViewedBike(bikeInfo);
    }).catch(() => {
      this.setData({ loading: false, loadError: '车辆详情加载失败，请稍后重试' });
    });
  },

  recordViewedBike(bikeInfo) {
    if (!bikeInfo || !bikeInfo.id) return;
    const isLogin = wx.getStorageSync('isLogin') === true;
    const token = wx.getStorageSync('token');
    if (!isLogin || !token) return;
    const loginData = wx.getStorageSync('loginData') || {};
    const rawUserId = loginData.userId || loginData.id;
    const userId = Number(rawUserId);
    if (Number.isFinite(userId) && userId > 0) {
      api.post(path.path.saveViewed, {
        userId,
        vehicleId: Number(bikeInfo.id)
      }).catch(() => {});
    }
    const oldList = wx.getStorageSync(VIEWED_KEY) || [];
    const list = Array.isArray(oldList) ? oldList : [];
    const next = list.filter((item) => String(item.id) !== String(bikeInfo.id));
    next.unshift({
      id: String(bikeInfo.id),
      vehicleName: bikeInfo.vehicleName,
      picUrl: bikeInfo.picUrl,
      bikeType: bikeInfo.vehicleType,
      hourPrice: bikeInfo.hourlyPrice || 0,
      monthPrice: (bikeInfo.hourlyPrice || 0) * 24 * 30,
      region: bikeInfo.region || '',
      address: bikeInfo.address || '',
      distance: bikeInfo.mileage || '--',
      viewedAt: Date.now()
    });
    wx.setStorageSync(VIEWED_KEY, next.slice(0, 200));
  },

  getCurrentUserId() {
    const user = this.data.user || {};
    const loginData = wx.getStorageSync('loginData') || {};
    const rawUserId = user.userId || user.id || loginData.userId || loginData.id;
    const userId = Number(rawUserId);
    return Number.isFinite(userId) && userId > 0 ? userId : '';
  },

  loadCollectedState(vehicleId) {
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.setData({ isCollected: false });
      return;
    }
    api.post(path.path.findCollectionList, { userId }).then((res) => {
      const list = (res && res.data) || [];
      const isCollected = list.some((item) => String(item.id) === String(vehicleId));
      this.setData({ isCollected });
    }).catch(() => {
      this.setData({ isCollected: false });
    });
  },

  collectBike() {
    const bike = this.data.bikeInfo;
    const userId = this.getCurrentUserId();
    if (!userId) {
      wx.showToast({ title: '请先登录后再收藏', icon: 'none' });
      return;
    }
    if (!bike || !bike.id) {
      wx.showToast({ title: '车辆信息缺失', icon: 'none' });
      return;
    }

    const vehicleId = Number(bike.id);
    if (!Number.isFinite(vehicleId) || vehicleId <= 0) {
      wx.showToast({ title: '车辆ID无效', icon: 'none' });
      return;
    }
    const params = { userId, vehicleId };
    if (this.data.isCollected) {
      api.post(path.path.deleteCollection, params).then(() => {
        this.setData({ isCollected: false });
        wx.showToast({ title: '已取消收藏', icon: 'none' });
      }).catch((err) => {
        const msg = (err && err.message) ? err.message : '取消收藏失败，请重试';
        this.loadCollectedState(vehicleId);
        wx.showToast({ title: msg, icon: 'none' });
      });
      return;
    }

    api.post(path.path.saveCollection, params).then(() => {
      this.setData({ isCollected: true });
      wx.showToast({ title: '收藏成功', icon: 'success' });
    }).catch(() => {
      wx.showToast({ title: '收藏失败', icon: 'none' });
    });
  },

  rentBike() {
    if (this.data.navigating) return;
    const bike = this.data.bikeInfo;
    const bikeId = bike && bike.id;
    if (!bikeId) {
      wx.showToast({ title: '车辆信息缺失', icon: 'none' });
      return;
    }

    const loginData = wx.getStorageSync('loginData') || {};
    const token = wx.getStorageSync('token');
    const isLogin = wx.getStorageSync('isLogin') === true;
    const userId = loginData.id || loginData.userId;
    if (!token || !isLogin || !userId) {
      wx.showToast({ title: '请先登录后再租赁', icon: 'none' });
      return;
    }

    const query = [
      `bikeId=${encodeURIComponent(String(bikeId))}`,
      `vehicleName=${encodeURIComponent(bike.vehicleName || '电动车')}`,
      `bikeType=${encodeURIComponent(bike.vehicleType || '标准型')}`,
      `price=${encodeURIComponent(bike.priceText || '¥0/小时')}`,
      `address=${encodeURIComponent(bike.address || '地址待补充')}`,
      `deposit=${encodeURIComponent('¥99')}`
    ].join('&');

    this.setData({ navigating: true });
    wx.navigateTo({
      url: `/pages/apply/submitOrder/submitOrder?${query}`,
      complete: () => {
        setTimeout(() => {
          this.setData({ navigating: false });
        }, 300);
      }
    });
  }
});
