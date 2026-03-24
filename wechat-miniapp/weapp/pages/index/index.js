﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿const api = require('../../config/api');

Page({
  data: {
    uiText: {
      noticeTitle: '\u516c\u544a',
      more: '\u66f4\u591a',
      searchPlaceholder: '\u8f93\u5165\u8f66\u8f86\u7f16\u53f7\u6216\u54c1\u724c',
      searchBtn: '\u641c\u7d22',
      nearbyTitle: '\u9644\u8fd1\u53ef\u79df\u8f66\u8f86',
      nearbySub: '\u70b9\u51fb\u5361\u7247\u67e5\u770b\u8be6\u60c5',
      vehicleNumberLabel: '\u7f16\u53f7',
      batteryLabel: '\u7535\u91cf',
      rentLabel: '\u79df\u91d1',
      typeLabel: '\u8f66\u578b',
      loading: '\u52a0\u8f7d\u4e2d...',
      noMore: '\u6ca1\u6709\u66f4\u591a\u6570\u636e\u4e86',
      empty: '\u6682\u65e0\u8f66\u8f86\u6570\u636e\uff0c\u53ef\u5148\u5728\u540e\u53f0\u65b0\u589e\u8f66\u8f86',
      recommendTitle: '\u63a8\u8350\u4e13\u533a'
    },
    noticeList: [
      {
        tag: '\u516c\u544a',
        title: '\u5468\u672b\u9650\u65f6\u4f18\u60e0\uff1a\u9996\u5355\u6700\u9ad8\u51cf20\u5143',
        desc: '\u6d3b\u52a8\u65f6\u95f4\uff1a08:00-22:00\uff0c\u9650\u6807\u8bc6\u8f66\u578b\u53ef\u4eab\u53d7'
      },
      {
        tag: '\u6d3b\u52a8',
        title: '\u65e9\u9ad8\u5cf0\u9001\u5de5\u5361\u4e0a\u7ebf',
        desc: '\u5de5\u4f5c\u65e507:00-10:00\u4e0b\u5355\u53ef\享8\u6298\u4f18\u60e0'
      },
      {
        tag: '\u901a\u77e5',
        title: '\u7cfb\u7edf\u5347\u7ea7\u516c\u544a',
        desc: '3\u67085\u65e5\u949f\u66682:00-4:00\u7cfb\u7edf\u7ef4\u62a4\uff0c\u6682\u505c\u670d\u52a1'
      }
    ],
    noticeCurrent: 0,
    recommendCards: [
      {
        title: '\u70ed\u95e8\u8def\u7ebf \ud83d\udee3\ufe0f',
        desc: '\u4e3a\u4f60\u7b5b\u9009\u51fa\u884c\u6548\u7387\u66f4\u9ad8\u7684\u9a91\u884c\u65b9\u6848',
        points: [
          '\u7ed3\u5408\u4f60\u7684\u7528\u8f66\u4e60\u60ef\uff0c\u4f18\u5148\u5c55\u793a\u9ad8\u9891\u8d77\u7ec8\u70b9\u8def\u7ebf\uff0c\u9644\u5e26\u9884\u4f30\u65f6\u95f4\u548c\u5927\u81f4\u82b1\u8d39\u3002',
          '\u5728\u5468\u672b\u548c\u8282\u5047\u65e5\u63a8\u51fa\u4f11\u95f2\u573a\u666f\u7ebf\u8def\uff0c\u5e2e\u4f60\u66f4\u5feb\u627e\u5230\u5408\u9002\u7684\u53d6\u8f66/\u8fd8\u8f66\u70b9\u3002',
          '\u53c2\u8003\u5b9e\u65f6\u8f66\u91cf\u4e0e\u8def\u51b5\u70ed\u5ea6\uff0c\u63d0\u9192\u4f60\u907f\u5f00\u6548\u7387\u8f83\u4f4e\u7684\u8def\u6bb5\u3002'
        ]
      },
      {
        title: '\u4f18\u60e0\u6d3b\u52a8 \ud83c\udf81',
        desc: '\u9488\u5bf9\u65b0\u7528\u6237\u548c\u9ad8\u9891\u7528\u6237\u63d0\u4f9b\u66f4\u5212\u7b97\u7684\u4ef7\u683c',
        points: [
          '\u65b0\u4eba\u9636\u6bb5\u4f1a\u4f18\u5148\u914d\u7f6e\u5165\u95e8\u798f\u5229\uff0c\u5e2e\u52a9\u4f60\u4f4e\u6210\u672c\u4f53\u9a8c\u9996\u5355\u3002',
          '\u652f\u6301\u591a\u4eba\u4e00\u8d77\u53c2\u4e0e\u7684\u6d3b\u52a8\u673a\u5236\uff0c\u4eba\u6570\u8fbe\u5230\u6761\u4ef6\u540e\u53ef\u89e3\u9501\u66f4\u4f18\u6298\u6263\u3002',
          '\u63d0\u4f9b\u901a\u52e4\u578b\u548c\u5468\u672b\u578b\u5957\u9910\uff0c\u9002\u5408\u7ecf\u5e38\u7528\u8f66\u7684\u7528\u6237\u3002',
          '\u5206\u65f6\u6bb5\u8fd0\u8425\u4f18\u60e0\uff0c\u5728\u7279\u5b9a\u65f6\u95f4\u6bb5\u9a91\u884c\u901a\u5e38\u66f4\u5b9e\u60e0\u3002'
        ]
      },
      {
        title: '\u65b0\u624b\u6307\u5357 \ud83d\udcda',
        desc: '\u65b0\u7528\u6237\u5feb\u901f\u4e0a\u624b\u6240\u9700\u7684\u6d41\u7a0b\u4e0e\u89c4\u5219\u8bf4\u660e',
        points: [
          '\u6309\u6b65\u9aa4\u8bb2\u89e3\u5f00\u9501\u3001\u7528\u8f66\u3001\u8fd8\u8f66\u548c\u7ed3\u7b97\uff0c\u964d\u4f4e\u9996\u6b21\u4f7f\u7528\u7684\u7406\u89e3\u6210\u672c\u3002',
          '\u7edf\u4e00\u8bf4\u660e\u8fd8\u8f66\u8303\u56f4\u3001\u5931\u8d25\u5904\u7406\u4e0e\u8d85\u65f6\u8ba1\u8d39\uff0c\u907f\u514d\u8ba2\u5355\u5f02\u5e38\u3002',
          '\u5f3a\u8c03\u5b89\u5168\u9a91\u884c\u8981\u6c42\uff0c\u5e76\u63d0\u4f9b\u8f66\u8f86\u95ee\u9898\u7684\u5feb\u6377\u53cd\u9988\u6307\u5f15\u3002',
          '\u6574\u7406\u5e38\u89c1\u554f\u9898\uff0c\u5305\u62ec\u62bc\u91d1\u3001\u7968\u636e\u4e0e\u8d23\u4efb\u5904\u7406\u7b49\u5185\u5bb9\u3002'
        ]
      }
    ],
    keyword: '',
    electricVehicleList: [],
    pageNo: 1,
    pageSize: 10,
    loading: false,
    hasMore: true,
    loadError: ''
  },

  onLoad() {
    this.fetchHomeContent();
    this.fetchVehicles(true);
  },

  onPullDownRefresh() {
    Promise.allSettled([this.fetchHomeContent(), this.fetchVehicles(true)])
      .finally(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) {
      this.fetchVehicles(false);
    }
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value || '' });
  },

  onSearch() {
    this.fetchVehicles(true);
  },

  fetchVehicles(reset) {
    const pageNo = reset ? 1 : this.data.pageNo;
    const keyword = this.data.keyword.trim();
    this.setData({ loading: true, loadError: '' });

    return api.get('api/vehicle/list', {
      page: pageNo,
      size: this.data.pageSize,
      vehicleNumber: keyword,
      brand: keyword
    }).then((res) => {
      const list = Array.isArray(res.data) ? res.data : [];
      const mapped = list.map((item) => ({
        ...item,
        brand: item.brand || 'E-Bike',
        model: item.model || '-',
        statusText: this.mapStatus(item.status),
        statusClass: this.mapStatusClass(item.status),
        batteryLevel: Number(item.batteryLevel || 0),
        rentText: this.formatRent(item),
        vehicleTypeText: this.mapVehicleType(item.vehicleType)
      }));
      const merged = reset ? mapped : this.data.electricVehicleList.concat(mapped);

      this.setData({
        electricVehicleList: merged,
        pageNo: pageNo + 1,
        hasMore: list.length >= this.data.pageSize,
        loading: false,
        loadError: ''
      });
      wx.setStorageSync('latestVehicleList', merged);
    }).catch(() => {
      this.setData({
        loading: false,
        loadError: '\u6570\u636e\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u540e\u7aef\u670d\u52a1\u548c\u7f51\u7edc'
      });
    });
  },

  fetchHomeContent() {
    return api.get('api/vehicle/home-content')
      .then((res) => {
        const data = res && res.data ? res.data : {};
        const notices = Array.isArray(data.notices) ? data.notices : [];
        const recommends = this.normalizeRecommendCards(data.recommends);

        if (!notices.length && !recommends.length) return;

        this.setData({
          noticeList: notices.length ? notices : this.data.noticeList,
          noticeCurrent: 0,
          recommendCards: recommends
        });
      })
      .catch(() => {
        // Keep local fallback content if backend data is unavailable.
      });
  },

  normalizeRecommendCards(raw) {
    const baseCards = this.data.recommendCards || [];
    if (!Array.isArray(raw) || !raw.length) return baseCards;

    return raw.map((item, index) => {
      const fallback = baseCards[index % baseCards.length] || {};
      const title = (item && item.title) || fallback.title || '推荐内容';
      const desc = (item && item.desc) || fallback.desc || '';
      const points = Array.isArray(item && item.points) && item.points.length
        ? item.points
        : (fallback.points || []);
      return { title, desc, points };
    });
  },

  mapStatus(status) {
    const map = {
      1: '\u53ef\u79df',
      2: '\u5df2\u79df',
      3: '\u7ef4\u4fee\u4e2d',
      4: '\u62a5\u5e9f',
      5: '\u5f85\u6e05\u6d01'
    };
    return map[status] || '\u672a\u77e5';
  },

  mapStatusClass(status) {
    const map = {
      1: 's-available',
      2: 's-rented',
      3: 's-maintain',
      4: 's-disabled',
      5: 's-cleaning'
    };
    return map[status] || 's-disabled';
  },

  mapVehicleType(type) {
    const map = {
      1: '\u6807\u51c6\u578b',
      2: '\u8f7b\u4eab\u578b',
      3: '\u957f\u7eed\u822a'
    };
    return map[type] || '\u7535\u52a8\u8f66';
  },

  formatRent(item) {
    const price = item.price || item.rentPrice || item.hourPrice || item.hourlyPrice;
    if (price === 0) return '\u00a50/\u5c0f\u65f6';
    if (!price) return '\u00a5--/\u5c0f\u65f6';
    return `\u00a5${price}/\u5c0f\u65f6`;
  },

  tapNotice(e) {
    const title = e.currentTarget.dataset.title || '\u516c\u544a';
    wx.showToast({ title, icon: 'none' });
  },

  onNoticeChange(e) {
    this.setData({
      noticeCurrent: (e.detail && typeof e.detail.current === 'number') ? e.detail.current : 0
    });
  },

  viewMoreNotice() {
    wx.showToast({ title: '\u66f4\u591a\u516c\u544a\u656c\u8bf7\u671f\u5f85', icon: 'none' });
  },

  tapRecommend(e) {
    const idx = Number(e.currentTarget.dataset.index || 0);
    const card = this.data.recommendCards[idx] || {};
    const title = card.title || '\u63a8\u8350\u5185\u5bb9';
    const desc = card.desc || '';
    const points = card.points || [];
    wx.setStorageSync('recommendDetail', {
      title,
      desc: desc || '\u6682\u65e0\u8be6\u7ec6\u4ecb\u7ecd',
      points: Array.isArray(points) ? points : []
    });
    wx.navigateTo({
      url: '/pages/index/recommend/recommend'
    });
  },

  toBikeInfo(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({
      url: `bikeInfo/bikeInfo?id=${id}`
    });
  }
});
