// pages/apply/submitOrder/submitOrder.js
import api from '../../../config/api';

Page({
  data: {
    orderInfo: {
      bikeId: '',
      applyId: '',
      vehicleName: '电动车',
      bikeType: '标准型',
      priceText: '¥0/小时',
      address: '地址信息待补充',
      deposit: '¥99'
    },
    form: {
      pickupType: 'store',
      rentalType: 2,
      startDate: '',
      endDate: '',
      name: '',
      mobile: '',
      depositAmount: 99
    },
    fee: {
      rentAmount: 0,
      serviceFee: 0,
      depositAmount: 99,
      payableAmount: 99,
      rentAmountText: '¥0.00',
      serviceFeeText: '¥0.00',
      depositAmountText: '¥99.00',
      payableAmountText: '¥99.00'
    }
  },

  onLoad(options) {
    const today = this.formatDate(new Date());
    const tomorrow = this.formatDate(new Date(Date.now() + 24 * 3600 * 1000));
    const orderInfo = {
      bikeId: decodeURIComponent(options.bikeId || ''),
      applyId: decodeURIComponent(options.applyId || ''),
      vehicleName: decodeURIComponent(options.vehicleName || '电动车'),
      bikeType: decodeURIComponent(options.bikeType || '标准型'),
      priceText: decodeURIComponent(options.price || '¥0/小时'),
      address: decodeURIComponent(options.address || '地址信息待补充'),
      deposit: decodeURIComponent(options.deposit || '¥99')
    };
    const depositAmount = this.parseAmount(orderInfo.deposit) || 99;
    this.setData({
      orderInfo,
      'form.startDate': today,
      'form.endDate': tomorrow,
      'form.depositAmount': depositAmount
    });
    this.recalcTotal();
    this.ensurePriceLoaded();
  },

  ensurePriceLoaded() {
    const hourly = this.parseHourly(this.data.orderInfo.priceText);
    const bikeId = Number(this.data.orderInfo.bikeId || 0);
    if (hourly > 0 || !bikeId) return;
    api.get(`api/vehicle/${bikeId}`).then((res) => {
      const item = (res && res.data) || {};
      const realPrice = Number(item.price || item.rentPrice || item.hourPrice || item.hourlyPrice || 0);
      if (realPrice > 0) {
        this.setData({
          'orderInfo.priceText': `¥${realPrice}/小时`
        });
        this.recalcTotal();
      }
    }).catch(() => {});
  },

  formatDate(date) {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  getCurrentUserId() {
    const loginData = wx.getStorageSync('loginData') || {};
    return Number(loginData.id || loginData.userId || 0);
  },

  parseAmount(text) {
    const num = Number(String(text || '').replace(/[^\d.]/g, ''));
    return Number.isFinite(num) ? num : 0;
  },

  changePickupType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ 'form.pickupType': type });
    this.recalcTotal();
  },

  changeRentalType(e) {
    const type = Number(e.currentTarget.dataset.type || 2);
    this.setData({ 'form.rentalType': type });
    this.recalcTotal();
  },

  onStartDateChange(e) {
    this.setData({ 'form.startDate': e.detail.value });
    this.recalcTotal();
  },

  onEndDateChange(e) {
    this.setData({ 'form.endDate': e.detail.value });
    this.recalcTotal();
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: e.detail.value });
  },

  onDepositInput(e) {
    const input = Number(e.detail.value || 0);
    const depositAmount = Number.isFinite(input) ? Math.max(0, input) : 0;
    this.setData({ 'form.depositAmount': depositAmount });
    this.recalcTotal();
  },

  toDayCount(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
    return Math.floor((end - start) / (24 * 3600 * 1000)) + 1;
  },

  parseHourly(priceText) {
    const num = Number(String(priceText || '').replace(/[^\d.]/g, ''));
    return Number.isFinite(num) ? num : 0;
  },

  formatMoney(n) {
    const v = Number(n || 0);
    return `¥${(Number.isFinite(v) ? v : 0).toFixed(2)}`;
  },

  recalcTotal() {
    const hourly = this.parseHourly(this.data.orderInfo.priceText);
    const days = Math.max(1, this.toDayCount(this.data.form.startDate, this.data.form.endDate));
    const rentalType = Number(this.data.form.rentalType);
    let rentAmount = 0;
    if (rentalType === 4) {
      rentAmount = hourly * 24 * 30;
    } else if (rentalType === 2) {
      rentAmount = hourly * 24 * days;
    } else {
      rentAmount = hourly * 8 * days;
    }
    const serviceFee = this.data.form.pickupType === 'delivery' ? 20 : 0;
    const depositAmount = Number(this.data.form.depositAmount || 0);
    const payableAmount = Number((rentAmount + serviceFee + depositAmount).toFixed(2));
    this.setData({
      fee: {
        rentAmount: Number(rentAmount.toFixed(2)),
        serviceFee,
        depositAmount: Number(depositAmount.toFixed(2)),
        payableAmount,
        rentAmountText: this.formatMoney(rentAmount),
        serviceFeeText: this.formatMoney(serviceFee),
        depositAmountText: this.formatMoney(depositAmount),
        payableAmountText: this.formatMoney(payableAmount)
      }
    });
  },

  async submitOrder() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    const vehicleId = Number(this.data.orderInfo.bikeId || 0);
    if (!vehicleId) {
      wx.showToast({ title: '车辆信息无效', icon: 'none' });
      return;
    }

    const { name, mobile, startDate, endDate, rentalType, pickupType } = this.data.form;
    if (!String(name || '').trim()) {
      wx.showToast({ title: '请填写姓名', icon: 'none' });
      return;
    }
    if (!/^1\d{10}$/.test(String(mobile || ''))) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    if (!startDate || !endDate) {
      wx.showToast({ title: '请选择租赁日期', icon: 'none' });
      return;
    }

    const startTs = new Date(`${startDate}T09:00:00`).getTime();
    const endTs = new Date(`${endDate}T18:00:00`).getTime();
    if (!Number.isFinite(startTs) || !Number.isFinite(endTs) || endTs <= startTs) {
      wx.showToast({ title: '租赁时间不合法', icon: 'none' });
      return;
    }

    const orderPayload = {
      userId,
      vehicleId,
      rentalType,
      expectedPickupTime: startTs,
      expectedReturnTime: endTs,
      rentalDuration: this.toDayCount(startDate, endDate),
      baseRent: this.data.fee.rentAmount,
      serviceFee: pickupType === 'delivery' ? 20 : 0,
      insuranceFee: 0
    };

    try {
      const res = await api.post('api/order/create', orderPayload);
      const order = (res && res.data) || {};
      const orderId = Number(order.orderId || 0);
      const depositAmount = Number(this.data.form.depositAmount || 0);

      if (orderId && depositAmount > 0) {
        await api.post('api/deposit/create', {
          userId,
          depositAmount,
          depositType: 1,
          relatedOrderId: orderId
        });
      }

      wx.showToast({ title: '订单提交成功', icon: 'success' });
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/userInfo/rentRecord/rentRecord?orderId=${encodeURIComponent(orderId || '')}`,
          fail: () => {
            wx.navigateTo({
              url: `/pages/userInfo/rentRecord/rentRecord?orderId=${encodeURIComponent(orderId || '')}`
            });
          }
        });
      }, 500);
    } catch (err) {
      const msg = (err && err.message) ? err.message : '提交订单失败，请稍后重试';
      wx.showToast({ title: msg, icon: 'none' });
    }
  }
});
