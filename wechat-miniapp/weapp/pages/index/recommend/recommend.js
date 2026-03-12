Page({
  data: {
    detail: {
      title: "推荐内容",
      desc: "为你准备的推荐信息",
      points: []
    }
  },

  onLoad() {
    const cached = wx.getStorageSync("recommendDetail");
    if (cached && cached.title) {
      this.setData({ detail: cached });
    }
  }
});
