// pages/userInfo/rentRecord/rentRecord.js
import api from '../../../config/api';

Page({
  data: {
    loading: true,
    loadError: '',
    orderList: [],
    focusOrderId: ''
  },

  onLoad(options) {
    const orderId = String((options && options.orderId) || '');
    this.setData({ focusOrderId: orderId });
    this.fetchOrders();
  },

  onShow() {
    this.fetchOrders();
  },

  onPullDownRefresh() {
    this.fetchOrders().finally(() => wx.stopPullDownRefresh());
  },

  getCurrentUserId() {
    const loginData = wx.getStorageSync('loginData') || {};
    return Number(loginData.id || loginData.userId || 0);
  },

  mapStatus(status) {
    const s = Number(status);
    if (s === 1) return '待支付';
    if (s === 2) return '已支付';
    if (s === 3) return '租赁中';
    if (s === 4) return '已完成';
    if (s === 5) return '已取消';
    if (s === 6) return '已退款';
    return '未知状态';
  },

  canCancel(status) {
    return Number(status) === 1;
  },

  canPay(status) {
    return Number(status) === 1;
  },

  canDelete(status) {
    const s = Number(status);
    return s === 5 || s === 2;
  },

  formatDateTime(val) {
    if (!val) return '--';
    const date = new Date(val);
    if (isNaN(date.getTime())) return '--';
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    const hh = `${date.getHours()}`.padStart(2, '0');
    const mm = `${date.getMinutes()}`.padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}`;
  },

  normalizeOrder(order) {
    const item = order || {};
    const baseRent = Number(item.baseRent || 0);
    const serviceFee = Number(item.serviceFee || 0);
    const totalAmount = Number(item.totalAmount || baseRent + serviceFee || 0);
    return {
      id: String(item.orderId || ''),
      orderCode: item.orderCode || '--',
      vehicleId: item.vehicleId || '--',
      statusText: this.mapStatus(item.orderStatus),
      startTime: this.formatDateTime(item.expectedPickupTime),
      endTime: this.formatDateTime(item.expectedReturnTime),
      amountText: `¥${totalAmount.toFixed(2)}`,
      amountValue: totalAmount,
      isFocus: String(item.orderId || '') === this.data.focusOrderId,
      rawStatus: Number(item.orderStatus || 0),
      canCancel: this.canCancel(item.orderStatus),
      canPay: this.canPay(item.orderStatus),
      canDelete: this.canDelete(item.orderStatus)
    };
  },

  fetchOrders() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.setData({ loading: false, loadError: '请先登录', orderList: [] });
      return Promise.resolve();
    }
    this.setData({ loading: true, loadError: '' });
    return api.get(`api/order/user/${userId}`, { page: 1, size: 50 }).then((res) => {
      const list = ((res && res.data) || []).map((item) => this.normalizeOrder(item));
      list.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
      this.setData({
        loading: false,
        loadError: '',
        orderList: list
      });
    }).catch(() => {
      this.setData({
        loading: false,
        loadError: '订单加载失败，请下拉重试',
        orderList: []
      });
    });
  },

  startMockPay(e) {
    const id = String(e.currentTarget.dataset.id || '');
    const amount = Number(e.currentTarget.dataset.amount || 0);
    if (!id) return;
    wx.showActionSheet({
      itemList: ['密码支付（模拟）', '指纹支付（模拟）'],
      success: (res) => {
        const method = res.tapIndex === 1 ? 'finger' : 'password';
        const methodText = method === 'finger' ? '指纹' : '密码';
        wx.showModal({
          title: '模拟微信支付',
          content: `请完成${methodText}验证（仅演示，不真实扣款）`,
          confirmText: '验证完成',
          success: (modalRes) => {
            if (!modalRes.confirm) return;
            this.mockPayOrder(id, amount, method);
          }
        });
      }
    });
  },

  mockPayOrder(orderId, amount, method) {
    const paymentNo = `SIM${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const payment = {
      paymentMethod: 1,
      paymentAmount: Number.isFinite(amount) ? amount : 0,
      paymentNo
    };
    wx.showLoading({ title: method === 'finger' ? '指纹验证中...' : '密码验证中...', mask: true });
    setTimeout(() => {
      api.post(`api/order/${orderId}/pay`, payment).then(() => {
        wx.hideLoading();
        wx.showToast({ title: '支付成功（模拟）', icon: 'success' });
        this.fetchOrders();
      }).catch((err) => {
        wx.hideLoading();
        const msg = (err && err.message) ? err.message : '支付失败，请重试';
        wx.showToast({ title: msg, icon: 'none' });
      });
    }, 700);
  },

  cancelOrder(e) {
    const id = String(e.currentTarget.dataset.id || '');
    if (!id) return;
    wx.showModal({
      title: '取消订单',
      content: '确定取消该订单吗？',
      confirmColor: '#ef4444',
      success: (res) => {
        if (!res.confirm) return;
        const reason = encodeURIComponent('用户主动取消');
        api.put(`api/order/${id}/cancel?cancelReason=${reason}`, {}).then(() => {
          wx.showToast({ title: '已取消', icon: 'success' });
          this.fetchOrders();
        }).catch((err) => {
          const msg = (err && err.message) ? err.message : '取消失败，请稍后重试';
          wx.showToast({ title: msg, icon: 'none' });
        });
      }
    });
  },

  tryDeleteOrder(id) {
    return api.delete(`api/order/${id}/delete`)
      .catch((err) => {
        // 某些环境不放行 DELETE，自动降级为 POST 兼容路由
        if (err && (Number(err.code) === 404 || Number(err.code) === 405)) {
          return api.post(`api/order/${id}/delete`, {})
            .catch(() => api.post(`api/order/delete/${id}`, {}));
        }
        throw err;
      });
  },

  deleteOrder(e) {
    const id = String(e.currentTarget.dataset.id || '');
    if (!id) return;
    wx.showModal({
      title: '删除订单',
      content: '仅已取消或已支付订单可删除，确认删除该订单吗？',
      confirmColor: '#ef4444',
      success: (res) => {
        if (!res.confirm) return;
        this.tryDeleteOrder(id).then(() => {
          wx.showToast({ title: '删除成功', icon: 'success' });
          this.fetchOrders();
        }).catch((err) => {
          const msg = (err && err.message) ? err.message : '删除失败';
          wx.showToast({ title: msg, icon: 'none' });
        });
      }
    });
  }
});
