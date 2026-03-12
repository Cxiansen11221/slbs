// pages/apply/handle/handleRentApply.js
const app = getApp();
import api from '../../../config/api';
import path from '../../../config/path';
const { $Message } = require('../../../dist/base/index');

const PLACEHOLDER_IMG = '/images/icons/tabbar/home-active.png';

Page({
  data: {
    picLocal: app.globalData.picLocal || '',
    bikeId: '',
    rentApply: null,
    viewData: {
      images: [PLACEHOLDER_IMG],
      priceText: '¥0/小时',
      region: '未知地区',
      address: '地址待补充',
      rangeText: '未知公里',
      bikeTypeText: '标准型',
      distanceText: '未知公里',
      stateText: '申请中',
      depositText: '¥99'
    },
    loading: true,
    loadError: '',
    showSubmit: false,
    imageSetting: {
      indicatorDots: true,
      autoplay: true,
      interval: 5000,
      duration: 500
    }
  },

  onLoad(options) {
    this.initPage(options || {});
  },

  initPage(options) {
    const applyId = String(options.id || '').trim();
    const bikeId = String(options.bikeId || '').trim();
    this.setData({ bikeId });

    if (applyId) {
      this.loadRentApplyById(applyId).catch(() => {
        if (bikeId) {
          this.loadVehicleFallback(bikeId);
          return;
        }
        this.setData({ loading: false, loadError: '租赁申请加载失败，请返回重试' });
      });
      return;
    }

    if (bikeId) {
      this.loadVehicleFallback(bikeId);
      return;
    }

    this.setData({ loading: false, loadError: '缺少车辆参数，无法发起租赁' });
  },

  loadRentApplyById(id) {
    this.setData({ loading: true, loadError: '' });
    return api.post(path.path.getRentApply, { id }).then((res) => {
      const rentApply = (res && res.data) || null;
      if (!rentApply) throw new Error('empty rent apply');
      this.applyRentData(rentApply, { showSubmit: false });
    });
  },

  loadVehicleFallback(bikeId) {
    this.setData({ loading: true, loadError: '' });
    api.get(`api/vehicle/${bikeId}`).then((res) => {
      const vehicle = (res && res.data) || null;
      if (!vehicle) throw new Error('vehicle not found');
      const rentApply = this.buildFallbackRentApply(vehicle);
      this.applyRentData(rentApply, { showSubmit: true });
    }).catch(() => {
      this.setData({ loading: false, loadError: '车辆信息加载失败，请稍后重试' });
    });
  },

  applyRentData(rentApply, extra = {}) {
    this.setData({
      rentApply,
      viewData: this.buildViewData(rentApply),
      loading: false,
      loadError: '',
      ...extra
    });
  },

  buildFallbackRentApply(vehicle) {
    return {
      id: null,
      state: 0,
      deposit: 99,
      bikeResource: {
        money: vehicle.rentPrice || vehicle.price || vehicle.hourPrice || 0,
        province: vehicle.province || '',
        city: vehicle.city || '',
        county: vehicle.county || '',
        address: vehicle.address || vehicle.location || '地址待补充',
        distance: vehicle.rangeMileage || vehicle.mileage || '--',
        bikeType: vehicle.vehicleType || 1,
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        userLatitude: vehicle.userLatitude,
        userLongitude: vehicle.userLongitude,
        picList: [{ url: vehicle.frontImageUrl || vehicle.imageUrl || vehicle.picUrl || PLACEHOLDER_IMG }],
        vehicleName: `${vehicle.brand || '电动车'} ${vehicle.model || ''}`.trim(),
        brand: vehicle.brand || '未知品牌'
      }
    };
  },

  normalizeImage(item) {
    const raw = (item && (item.url || item.picUrl)) || item || '';
    if (!raw) return PLACEHOLDER_IMG;
    if (/^https?:\/\//.test(raw) || /^\/images\//.test(raw)) return raw;
    const base = String(this.data.picLocal || '').replace(/\/+$/, '');
    if (!base) return `/${String(raw).replace(/^\/+/, '')}`;
    return `${base}/${String(raw).replace(/^\/+/, '')}`;
  },

  toSafeNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  },

  calcDistance(lat1, lng1, lat2, lng2) {
    const a = this.toSafeNumber(lat1);
    const b = this.toSafeNumber(lng1);
    const c = this.toSafeNumber(lat2);
    const d = this.toSafeNumber(lng2);
    if (a === null || b === null || c === null || d === null) return null;
    const toRad = (n) => n * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(c - a);
    const dLng = toRad(d - b);
    const x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return (R * y).toFixed(1);
  },

  getBikeTypeValue(type) {
    const map = { 1: '标准型', 2: '轻享型', 3: '长续航' };
    return map[type] || '标准型';
  },

  buildViewData(rentApply) {
    const apply = rentApply || {};
    const bike = apply.bikeResource || {};
    const price = this.toSafeNumber(bike.money);
    const region = [bike.province, bike.city, bike.county].filter(Boolean).join('') || '未知地区';
    const rangeNum = this.toSafeNumber(bike.distance);
    const distanceKm = this.calcDistance(
      bike.latitude,
      bike.longitude,
      bike.userLatitude,
      bike.userLongitude
    );
    const images = (bike.picList || []).map((item) => this.normalizeImage(item)).filter(Boolean);
    const stateMap = { 0: '申请中', 1: '申请通过', 2: '申请拒绝', 3: '押金已支付', 4: '已取消', 5: '已结束' };

    return {
      images: images.length ? images : [PLACEHOLDER_IMG],
      priceText: `¥${price === null ? 0 : price}/小时`,
      region,
      address: bike.address || '地址待补充',
      rangeText: rangeNum === null ? '未知公里' : `${rangeNum}公里`,
      bikeTypeText: this.getBikeTypeValue(bike.bikeType),
      distanceText: distanceKm === null ? '未知公里' : `${distanceKm}公里`,
      stateText: stateMap[apply.state] || '申请中',
      depositText: `¥${apply.deposit || 99}`
    };
  },

  submitRentApply() {
    const bikeId = this.data.bikeId;
    if (!bikeId) {
      $Message({ content: '缺少车辆信息，无法提交申请', type: 'error' });
      return;
    }
    const params = { bikeId, bikeResourceId: bikeId, vehicleId: bikeId };
    api.post(path.path.addRentApply, params).then((res) => {
      const created = (res && res.data) || {};
      const applyId = created.id || created.applyId || created.rentApplyId || '';
      const viewData = this.data.viewData || {};
      const query = [
        `bikeId=${encodeURIComponent(bikeId)}`,
        `applyId=${encodeURIComponent(applyId)}`,
        `vehicleName=${encodeURIComponent((this.data.rentApply && this.data.rentApply.bikeResource && this.data.rentApply.bikeResource.vehicleName) || '电动车')}`,
        `price=${encodeURIComponent(viewData.priceText || '¥0/小时')}`,
        `address=${encodeURIComponent(viewData.address || '')}`,
        `bikeType=${encodeURIComponent(viewData.bikeTypeText || '标准型')}`,
        `deposit=${encodeURIComponent(viewData.depositText || '¥99')}`
      ].join('&');
      wx.navigateTo({
        url: `/pages/apply/submitOrder/submitOrder?${query}`
      });
      this.setData({ showSubmit: false });
      $Message({ content: '申请已提交，请完善订单信息', type: 'success' });
    }).catch(() => {
      $Message({ content: '提交租赁申请失败，请稍后重试', type: 'error' });
    });
  },

  onUnload() {
    const rentApply = this.data.rentApply;
    if (!rentApply || !rentApply.id) return;
    if (rentApply.state === 2) {
      api.post(path.path.saveRentApply, { id: rentApply.id, state: 5 }).catch(() => {});
    }
  },

  agree() {
    const rentApply = this.data.rentApply;
    if (!rentApply || !rentApply.id) {
      $Message({ content: '请先提交租赁申请', type: 'warning' });
      return;
    }
    wx.showModal({
      title: '提示',
      content: '确定租这辆车并支付押金吗？',
      cancelColor: '#d81e06',
      success: (res) => {
        if (!res.confirm) {
          $Message({ content: '操作取消' });
          return;
        }
        const payParams = {
          body: '电动车租赁押金',
          amount: rentApply.deposit,
          businessId: rentApply.id,
          attach: 'deposit'
        };
        api.post('wechat/unifiedOrder', payParams).then((orderRes) => {
          if (orderRes.code !== '200') {
            $Message({ content: orderRes.message || '下单失败', type: 'error' });
            return;
          }
          const payData = orderRes.data || {};
          wx.requestPayment({
            timeStamp: payData.timestamp,
            nonceStr: payData.nonceStr,
            package: payData.prepay_id,
            signType: payData.signType,
            paySign: payData.paySign,
            success: () => {
              api.post(path.path.paySuccess, { id: rentApply.id }).then((payRes) => {
                if (payRes.code === '200') {
                  $Message({ content: '支付成功', type: 'success' });
                  wx.switchTab({ url: '../apply' });
                }
              }).catch(() => {});
            },
            fail: () => {
              $Message({ content: '支付失败', type: 'error' });
            }
          });
        }).catch(() => {
          $Message({ content: '创建支付订单失败', type: 'error' });
        });
      }
    });
  },

  disagree() {
    const rentApply = this.data.rentApply;
    if (!rentApply || !rentApply.id) {
      $Message({ content: '请先提交租赁申请', type: 'warning' });
      return;
    }
    wx.showModal({
      title: '提示',
      content: '确定取消租这辆车吗？',
      cancelColor: '#d81e06',
      success: (res) => {
        if (!res.confirm) {
          $Message({ content: '操作取消' });
          return;
        }
        api.post(path.path.saveRentApply, { id: rentApply.id, state: 4 }).then((saveRes) => {
          if (saveRes.code === '200') {
            $Message({ content: '取消成功', type: 'success' });
          }
          wx.switchTab({ url: '../apply' });
        }).catch(() => {
          $Message({ content: '取消失败，请稍后重试', type: 'error' });
        });
      }
    });
  }
});
