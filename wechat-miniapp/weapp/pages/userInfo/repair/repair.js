// pages/userInfo/repair/repair.js
import api from '../../../config/api';
import path from '../../../config/path';

Page({
  data: {
    orderVehicles: [],
    orderVehicleLabels: [],
    orderVehicleIndex: 0,
    faultTypes: ['电池故障', '轮胎漏气/损坏', '电机故障', '刹车故障', '控制器/电路故障', '其他'],
    faultTypeIndex: 0,
    description: '',
    contact: '',
    submitting: false
  },

  onLoad() {
    this.loadOrderVehicles();
  },

  onVehiclePick(e) {
    const idx = Number(e.detail.value || 0);
    this.setData({ orderVehicleIndex: Number.isNaN(idx) ? 0 : idx });
  },

  onFaultTypeChange(e) {
    const idx = Number(e.detail.value || 0);
    this.setData({ faultTypeIndex: Number.isNaN(idx) ? 0 : idx });
  },

  onDescriptionInput(e) {
    this.setData({ description: e.detail.value || '' });
  },

  onContactInput(e) {
    this.setData({ contact: e.detail.value || '' });
  },

  resolveReporterId() {
    const loginData = wx.getStorageSync('loginData') || {};
    const rawUserId = loginData.userId || loginData.id;
    const userId = Number(rawUserId);
    return Number.isFinite(userId) && userId > 0 ? userId : '';
  },

  resolveVehicleId() {
    const list = this.data.orderVehicles || [];
    const idx = Number(this.data.orderVehicleIndex || 0);
    const item = Array.isArray(list) ? list[idx] : null;
    const vehicleId = item && (item.vehicleId || item.id);
    const num = Number(vehicleId || 0);
    return Number.isFinite(num) && num > 0 ? Promise.resolve(num) : Promise.resolve('');
  },

  loadOrderVehicles() {
    const userId = this.resolveReporterId();
    if (!userId) {
      this.setData({ orderVehicles: [], orderVehicleLabels: [] });
      return;
    }
    api.get(`api/order/user/${userId}`, { page: 1, size: 200 }).then((res) => {
      const list = (res && res.data) || [];
      const arr = Array.isArray(list) ? list : (Array.isArray(list.records) ? list.records : []);
      const normalized = arr.map((item) => ({
        orderId: item.orderId,
        vehicleId: item.vehicleId,
        vehicleName: item.vehicleName || item.vehicleModel || '',
        vehicleNumber: item.vehicleNumber || ''
      })).filter((item) => item.vehicleId);
      const labels = normalized.map((item) => {
        const name = String(item.vehicleName || '').trim();
        const number = String(item.vehicleNumber || '').trim();
        const label = [name, number].filter(Boolean).join(' ');
        return label || `车辆ID ${item.vehicleId}`;
      });
      this.setData({
        orderVehicles: normalized,
        orderVehicleLabels: labels,
        orderVehicleIndex: 0
      });
    }).catch(() => {
      this.setData({ orderVehicles: [], orderVehicleLabels: [] });
    });
  },

  submitReport() {
    if (this.data.submitting) return;
    const description = String(this.data.description || '').trim();
    if (!description) {
      wx.showToast({ title: '请填写故障描述', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    this.resolveVehicleId()
      .then((vehicleId) => {
        if (!vehicleId) {
          throw new Error('请选择订单车辆');
        }
        const reporterId = this.resolveReporterId();
        const faultType = this.data.faultTypeIndex + 1;
        const maintenanceNote = String(this.data.contact || '').trim();
        const payload = {
          vehicleId,
          reporterId: reporterId || undefined,
          faultType,
          faultDescription: description,
          maintenanceNote: maintenanceNote ? `联系方式：${maintenanceNote}` : ''
        };
        return api.post(path.path.createMaintenance, payload);
      })
      .then((res) => {
        if (res && res.success === false) {
          throw new Error(res.message || '提交失败');
        }
        wx.showToast({ title: '报修已提交', icon: 'success' });
        this.setData({
          orderVehicleIndex: 0,
          faultTypeIndex: 0,
          description: '',
          contact: '',
          submitting: false
        });
      })
      .catch((err) => {
        const msg = (err && err.message) ? err.message : '提交失败，请稍后重试';
        wx.showToast({ title: msg, icon: 'none' });
        this.setData({ submitting: false });
      });
  }
});
