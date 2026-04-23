const DEFAULT_CENTER = {
  latitude: 23.11444,
  longitude: 113.84722
};

Page({
  data: {
    center: DEFAULT_CENTER,
    scale: 14,
    markers: [],
    showLocation: false,
    address: ''
  },

  onLoad() {
    const payload = wx.getStorageSync('indexMapPreviewData') || {};
    const center = payload.center || DEFAULT_CENTER;
    const markers = Array.isArray(payload.markers) ? payload.markers : [];
    this.setData({
      center: {
        latitude: Number(center.latitude) || DEFAULT_CENTER.latitude,
        longitude: Number(center.longitude) || DEFAULT_CENTER.longitude
      },
      scale: Number(payload.scale) || 14,
      markers,
      showLocation: Boolean(payload.center),
      address: payload.address || ''
    });
  },

  onMarkerTap(e) {
    const markerId = e && e.detail ? Number(e.detail.markerId) : 0;
    if (markerId < 0) {
      wx.showToast({ title: '这是补充点位', icon: 'none' });
      return;
    }
    wx.showToast({ title: '可返回首页点卡片查看详情', icon: 'none' });
  }
});
