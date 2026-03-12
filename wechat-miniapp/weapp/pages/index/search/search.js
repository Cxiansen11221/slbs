const api = require('../../../config/api');

Page({
  data: {
    condition: '',
    bikeList: [],
    pageNo: 1,
    pageSize: 10,
    bottomLoading: false,
    hasMore: true
  },

  onLoad(options) {
    this.setData({ condition: (options && options.condition) || '' });
    this.searchBike(true);
  },

  onPullDownRefresh() {
    this.searchBike(true).finally(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (!this.data.bottomLoading && this.data.hasMore) {
      this.searchBike(false);
    }
  },

  conditionChange(e) {
    this.setData({ condition: e.detail.value || '' });
  },

  searchBike(reset = true) {
    const nextPage = reset ? 1 : this.data.pageNo;
    this.setData({ bottomLoading: true });

    return api.get('api/vehicle/list', {
      page: nextPage,
      size: this.data.pageSize,
      vehicleNumber: this.data.condition.trim(),
      brand: this.data.condition.trim()
    }).then((res) => {
      const list = Array.isArray(res.data) ? res.data : [];
      const merged = reset ? list : this.data.bikeList.concat(list);
      this.setData({
        bikeList: merged,
        pageNo: nextPage + 1,
        hasMore: list.length >= this.data.pageSize,
        bottomLoading: false
      });
    }).catch(() => {
      this.setData({ bottomLoading: false });
    });
  },

  toBikeInfo(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({
      url: `../bikeInfo/bikeInfo?id=${id}`
    });
  }
});
