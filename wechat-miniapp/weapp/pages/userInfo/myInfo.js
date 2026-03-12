// pages/userInfo/myInfo.js
const app = getApp();
import api from '../../config/api';
import path from '../../config/path';

const VIEWED_KEY = 'viewedVehicleList';
const MANUAL_AVATAR_KEY = 'manualAvatarUrl';
const MANUAL_AVATAR_LOCAL_KEY = 'manualAvatarLocalPath';
const MANUAL_NAME_KEY = 'manualDisplayName';
const CN = {
  privacyRequired: '\u8bf7\u5148\u540c\u610f\u9690\u79c1\u6388\u6743\u540e\u518d\u767b\u5f55',
  getCodeFailed: '\u83b7\u53d6\u767b\u5f55\u51ed\u8bc1\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5',
  wxLoginFailed: '\u5fae\u4fe1\u767b\u5f55\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5',
  profileDesc: '\u7528\u4e8e\u5b8c\u5584\u4f1a\u5458\u8d44\u6599',
  wxUser: '\u5fae\u4fe1\u7528\u6237',
  loginNoToken: '\u767b\u5f55\u5931\u8d25\uff0c\u672a\u83b7\u53d6\u5230\u4ee4\u724c',
  loginSuccess: '\u767b\u5f55\u6210\u529f',
  loginRetry: '\u767b\u5f55\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5',
  logoutTitle: '\u9000\u51fa\u767b\u5f55',
  logoutConfirm: '\u786e\u8ba4\u9000\u51fa\u5f53\u524d\u8d26\u53f7\u5417\uff1f',
  logoutSuccess: '\u5df2\u9000\u51fa\u767b\u5f55'
};

Page({
  data: {
    picLocal: (app.globalData.picLocal || '').replace(/\/+$/, ''),
    localHeadPic: '../../images/icons/tabbar/my.png',
    baseHeadPic: '../../images/icons/tabbar/my.png',
    user: {},
    count: {
      visited: 0,
      collection: 0,
      myBike: 0,
      myRent: 0,
      messageCount: 0
    },
    i18n: {
      wechatLogin: '\u5fae\u4fe1\u767b\u5f55',
      otherLogin: '\u5176\u4ed6\u7528\u6237\u767b\u5f55',
      switchAccount: '\u5207\u6362\u8d26\u53f7',
      editProfile: '\u7f16\u8f91\u8d44\u6599',
      viewed: '\u770b\u8f66\u8bb0\u5f55',
      collection: '\u6211\u7684\u6536\u85cf',
      orders: '\u6211\u7684\u8ba2\u5355',
      message: '\u6211\u7684\u6d88\u606f',
      setting: '\u8bbe\u7f6e',
      help: '\u5e2e\u52a9\u4e2d\u5fc3',
      logout: '\u9000\u51fa\u767b\u5f55'
    }
  },

  onLoad() {
    this.applyManualAvatarImmediately();
    this.hydrateUserFromStorage();
    this.refreshViewedCount();
  },

  setUserAndHead(userObj = {}) {
    const user = userObj || {};
    const directHead = this.toDisplayHeadUrl(user.headUrl, user.openId);
    const displayHead = String(user.displayHeadUrl || '');
    const preferDirect = directHead && !/^http:\/\//i.test(directHead);
    const baseHeadPic = displayHead || (preferDirect ? directHead : '') || this.data.localHeadPic;
    this.setData({ user, baseHeadPic });
  },

  onShow() {
    this.applyManualAvatarImmediately();
    this.refreshViewedCount();
    const token = wx.getStorageSync('token');
    const isLogin = wx.getStorageSync('isLogin') === true;
    if (!token || !isLogin) {
      this.resetToGuestState();
      return;
    }
    const cachedUser = this.normalizeUserHead(wx.getStorageSync('loginData') || {});
    if (cachedUser && Object.keys(cachedUser).length > 0) {
      this.setUserAndHead(cachedUser);
      if (cachedUser.headUrl) {
        wx.setStorageSync(MANUAL_AVATAR_KEY, cachedUser.headUrl);
      }
      if (cachedUser.name && cachedUser.name !== CN.wxUser) {
        wx.setStorageSync(MANUAL_NAME_KEY, cachedUser.name);
      }
      this.ensureAvatarDisplayLocal(cachedUser);
    }
    wx.setStorageSync('loginData', cachedUser || {});
    this.refreshBaseInfoCount();
    this.refreshUserFromServer();
    this.forceApplyHeadFromLoginData();
    this.forceSyncUserDetail();
    this.hardSyncAvatarUrl();
    this.syncMyAvatarStrict();
  },

  forceApplyHeadFromLoginData() {
    const cached = wx.getStorageSync('loginData') || {};
    const username = wx.getStorageSync('loginUsername') || cached.username || '';
    if (!username) return;
    api.post(path.path.getLoginData, { username }).then((res) => {
      const data = (res && res.data) || {};
      const headUrl = this.normalizeHeadUrl(data.headUrl || data.avatarUrl || '');
      if (!headUrl) return;
      const openId = data.openId || (this.data.user && this.data.user.openId) || '';
      const full = this.toDisplayHeadUrl(headUrl, openId);
      const nextUser = {
        ...(this.data.user || {}),
        ...this.normalizeRemoteUser(data),
        headUrl,
        displayHeadUrl: full
      };
      this.setUserAndHead(nextUser);
      wx.setStorageSync(MANUAL_AVATAR_KEY, headUrl);
      const oldLogin = wx.getStorageSync('loginData') || {};
      wx.setStorageSync('loginData', {
        ...oldLogin,
        ...nextUser,
        headUrl,
        avatarUrl: headUrl
      });
    }).catch(() => {});
  },

  applyManualAvatarImmediately() {
    const manualAvatar = this.normalizeHeadUrl(String(wx.getStorageSync(MANUAL_AVATAR_KEY) || ''));
    if (!manualAvatar) return;
    const user = this.data.user || this.normalizeRemoteUser(wx.getStorageSync('loginData') || {});
    const nextUser = {
      ...user,
      headUrl: manualAvatar,
      displayHeadUrl: this.toDisplayHeadUrl(manualAvatar, user.openId || '')
    };
    this.setUserAndHead(nextUser);
    const cached = wx.getStorageSync('loginData') || {};
    wx.setStorageSync('loginData', {
      ...cached,
      headUrl: manualAvatar,
      avatarUrl: manualAvatar
    });
  },

  hydrateUserFromStorage() {
    const token = wx.getStorageSync('token');
    const isLogin = wx.getStorageSync('isLogin') === true;
    if (!token || !isLogin) {
      this.resetToGuestState();
      return;
    }
    const cachedUser = this.normalizeUserHead(wx.getStorageSync('loginData') || {});
    this.setUserAndHead(cachedUser);
    if (cachedUser.headUrl) {
      wx.setStorageSync(MANUAL_AVATAR_KEY, cachedUser.headUrl);
    }
    if (cachedUser.name && cachedUser.name !== CN.wxUser) {
      wx.setStorageSync(MANUAL_NAME_KEY, cachedUser.name);
    }
    this.ensureAvatarDisplayLocal(cachedUser);
    wx.setStorageSync('loginData', cachedUser || {});
  },

  refreshUserFromServer() {
    const cached = wx.getStorageSync('loginData') || {};
    const loginUsername = wx.getStorageSync('loginUsername') || cached.username || cached.name || '';
    const loginUserId = Number(cached.userId || cached.id || 0);
    const applyRemoteUser = (remoteData) => {
      const normalized = this.normalizeUserHead(this.normalizeRemoteUser(remoteData || {}));
      if (!normalized || Object.keys(normalized).length === 0) return;
      const merged = this.mergeUserProfile(this.data.user, normalized);
      wx.setStorageSync('loginData', merged);
      if (merged.headUrl) {
        wx.setStorageSync(MANUAL_AVATAR_KEY, merged.headUrl);
      }
      if (merged.name && merged.name !== CN.wxUser) {
        wx.setStorageSync(MANUAL_NAME_KEY, merged.name);
      }
      this.setUserAndHead(merged);
      this.ensureAvatarDisplayLocal(merged);
      this.refreshCollectionCount();
      this.refreshOrderCount();
    };

    const byId = (idArg) => {
      const candidate = Number(idArg || loginUserId || (this.data.user && (this.data.user.userId || this.data.user.id)));
      if (!Number.isFinite(candidate) || candidate <= 0) return Promise.resolve();
      return api.get(`api/user/${candidate}`).then((res) => {
        applyRemoteUser((res && res.data) || {});
      });
    };

    const byUsername = () => {
      if (!loginUsername) return Promise.resolve();
      return api.post(path.path.getLoginData, { username: loginUsername }).then((res) => {
        applyRemoteUser((res && res.data) || {});
      });
    };

    byUsername()
      .catch(() => Promise.resolve())
      .then(() => {
        const resolvedId = Number((this.data.user && (this.data.user.userId || this.data.user.id)) || loginUserId || 0);
        return byId(resolvedId).catch(() => {});
      });
  },

  forceSyncUserDetail() {
    const cached = wx.getStorageSync('loginData') || {};
    const loginUsername = wx.getStorageSync('loginUsername') || cached.username || '';
    const applyRemoteUser = (remoteData) => {
      const normalized = this.normalizeUserHead(this.normalizeRemoteUser(remoteData || {}));
      if (!normalized || Object.keys(normalized).length === 0) return;
      const merged = this.mergeUserProfile(this.data.user, normalized);
      wx.setStorageSync('loginData', merged);
      if (merged.headUrl) {
        wx.setStorageSync(MANUAL_AVATAR_KEY, merged.headUrl);
      }
      if (merged.name && merged.name !== CN.wxUser) {
        wx.setStorageSync(MANUAL_NAME_KEY, merged.name);
      }
      this.setUserAndHead(merged);
      this.ensureAvatarDisplayLocal(merged);
    };

    const resolveIdAndFetch = () => {
      const current = this.data.user || {};
      const fromCurrent = Number(current.userId || current.id || 0);
      const fromCache = Number(cached.userId || cached.id || 0);
      const candidate = Number.isFinite(fromCurrent) && fromCurrent > 0 ? fromCurrent : fromCache;
      if (Number.isFinite(candidate) && candidate > 0) {
        return api.get(`api/user/${candidate}`).then((res) => {
          applyRemoteUser((res && res.data) || {});
        });
      }
      if (!loginUsername) return Promise.resolve();
      return api.post(path.path.getLoginData, { username: loginUsername }).then((res) => {
        const byName = (res && res.data) || {};
        applyRemoteUser(byName);
        const uid = Number((byName && (byName.userId || byName.id)) || 0);
        if (!Number.isFinite(uid) || uid <= 0) return Promise.resolve();
        return api.get(`api/user/${uid}`).then((detailRes) => {
          applyRemoteUser((detailRes && detailRes.data) || {});
        });
      });
    };

    resolveIdAndFetch().catch(() => {});
  },

  hardSyncAvatarUrl() {
    const cached = wx.getStorageSync('loginData') || {};
    const uid = this.normalizeNumericId((this.data.user && (this.data.user.userId || this.data.user.id)) || cached.userId || cached.id);
    if (!uid) return;
    const baseUrl = String((app.globalData && app.globalData.baseUrl) || '').replace(/\/+$/, '');
    if (!baseUrl) return;
    const rawToken = wx.getStorageSync('token') || (app.globalData && app.globalData.token);
    const token = typeof rawToken === 'string'
      ? rawToken
      : (rawToken && typeof rawToken.token === 'string' ? rawToken.token : '');
    const header = token ? { Authorization: `Bearer ${token}` } : {};
    wx.request({
      url: `${baseUrl}/api/user/${uid}`,
      method: 'GET',
      header,
      success: (res) => {
        const data = (res && res.data && res.data.data) || {};
        const avatarUrl = this.normalizeHeadUrl(data.avatarUrl || data.headUrl || '');
        if (!avatarUrl) return;
        const nextUser = this.mergeUserProfile(this.data.user, this.normalizeRemoteUser({
          ...data,
          avatarUrl
        }));
        this.setUserAndHead(nextUser);
        wx.setStorageSync(MANUAL_AVATAR_KEY, avatarUrl);
        const oldLogin = wx.getStorageSync('loginData') || {};
        wx.setStorageSync('loginData', {
          ...oldLogin,
          headUrl: avatarUrl,
          avatarUrl
        });
      }
    });
  },

  syncMyAvatarStrict() {
    const cached = wx.getStorageSync('loginData') || {};
    const usernameCandidates = [
      wx.getStorageSync('loginUsername') || '',
      cached.username || '',
      (this.data.user && this.data.user.username) || '',
      cached.name || '',
      (this.data.user && this.data.user.name) || ''
    ].map(v => String(v || '').trim()).filter(Boolean);
    if (usernameCandidates.length === 0) return;

    const loginUsername = usernameCandidates[0];
    api.post(path.path.getLoginData, { username: loginUsername }).then((res) => {
      const byName = (res && res.data) || {};
      const uid = this.normalizeNumericId(byName.userId || byName.id || (this.data.user && (this.data.user.userId || this.data.user.id)));
      const mergedByName = this.mergeUserProfile(this.data.user, this.normalizeRemoteUser(byName));
      this.setUserAndHead(mergedByName);
      wx.setStorageSync('loginData', mergedByName);
      if (mergedByName.headUrl) {
        wx.setStorageSync(MANUAL_AVATAR_KEY, mergedByName.headUrl);
      }
      const fetchById = (resolvedId) => {
        if (!resolvedId) return Promise.resolve();
        return api.get(`api/user/${resolvedId}`).then((detailRes) => {
          const detail = (detailRes && detailRes.data) || {};
          const merged = this.mergeUserProfile(this.data.user, this.normalizeRemoteUser(detail));
          this.setUserAndHead(merged);
          wx.setStorageSync('loginData', merged);
          if (merged.headUrl) {
            wx.setStorageSync(MANUAL_AVATAR_KEY, merged.headUrl);
          }
        }).catch(() => {});
      };

      if (uid) {
        fetchById(uid);
        return;
      }

      const openId = String(byName.openId || cached.openId || '');
      api.get('api/user/list', { page: 1, size: 500 }).then((listRes) => {
        const list = (listRes && listRes.data) || [];
        if (!Array.isArray(list) || list.length === 0) return;
        const hit = list.find((it) => {
          const uname = String((it && it.username) || '');
          const oid = String((it && it.openId) || (it && it.open_id) || '');
          return usernameCandidates.includes(uname) || (openId && oid === openId);
        });
        const fallbackId = this.normalizeNumericId(hit && (hit.userId || hit.id));
        if (!fallbackId) return;
        fetchById(fallbackId);
      }).catch(() => {});
    }).catch(() => {
      const remain = usernameCandidates.slice(1);
      if (remain.length === 0) return;
      api.post(path.path.getLoginData, { username: remain[0] }).then((res) => {
        const byName = (res && res.data) || {};
        const uid = this.normalizeNumericId(byName.userId || byName.id);
        if (!uid) return;
        api.get(`api/user/${uid}`).then((detailRes) => {
          const detail = (detailRes && detailRes.data) || {};
          const merged = this.mergeUserProfile(this.data.user, this.normalizeRemoteUser(detail));
          this.setUserAndHead(merged);
          wx.setStorageSync('loginData', merged);
          if (merged.headUrl) {
            wx.setStorageSync(MANUAL_AVATAR_KEY, merged.headUrl);
          }
        }).catch(() => {});
      }).catch(() => {});
    });
  },

  ensureAvatarDisplayLocal(user) {
    const targetUser = user || this.data.user || {};
    const raw = String(targetUser.headUrl || '');
    const src = String(targetUser.displayHeadUrl || targetUser.headUrl || '');
    let requestUrl = '';
    if (/^http:\/\//i.test(raw)) {
      requestUrl = raw;
    } else if (raw.startsWith('/api/') || raw.startsWith('/uploads/')) {
      requestUrl = `${app.globalData.baseUrl || ''}${raw}`;
    } else {
      requestUrl = src;
    }
    if (!requestUrl || !requestUrl.startsWith('http://')) return;
    const rawToken = wx.getStorageSync('token') || app.globalData.token;
    const token = typeof rawToken === 'string'
      ? rawToken
      : (rawToken && typeof rawToken.token === 'string' ? rawToken.token : '');
    const header = token ? { Authorization: `Bearer ${token}` } : {};
    wx.downloadFile({
      url: requestUrl,
      header,
      success: (res) => {
        if (!(res && res.statusCode === 200 && res.tempFilePath)) return;
        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success: (saveRes) => {
            const finalPath = String((saveRes && saveRes.savedFilePath) || res.tempFilePath || '');
            if (!finalPath) return;
            const nextUser = { ...(this.data.user || {}), displayHeadUrl: finalPath };
            this.setUserAndHead(nextUser);
            wx.setStorageSync(MANUAL_AVATAR_LOCAL_KEY, finalPath);
          },
          fail: () => {
            const finalPath = String(res.tempFilePath || '');
            if (!finalPath) return;
            const nextUser = { ...(this.data.user || {}), displayHeadUrl: finalPath };
            this.setUserAndHead(nextUser);
          }
        });
      },
      fail: () => {
        const stableLocalAvatar = String(wx.getStorageSync(MANUAL_AVATAR_LOCAL_KEY) || '');
        if (stableLocalAvatar && !this.isTemporaryLocalPath(stableLocalAvatar)) {
          const nextUser = { ...(this.data.user || {}), displayHeadUrl: stableLocalAvatar };
          this.setUserAndHead(nextUser);
          return;
        }
        const fallback = { ...(this.data.user || {}), displayHeadUrl: '' };
        this.setUserAndHead(fallback);
      }
    });
  },

  refreshBaseInfoCount() {
    const loginData = wx.getStorageSync('loginData') || {};
    const rawUserId = this.data.user.userId || this.data.user.id || loginData.userId || loginData.id;
    const userId = Number(rawUserId);
    const params = (Number.isFinite(userId) && userId > 0) ? { userId } : {};
    api.post(path.path.getBaseInfoCount, params).then((res) => {
      const remoteCount = (res && res.data) || {};
      const mergedCount = { ...this.data.count, ...remoteCount };
      this.setData({ count: mergedCount });
      this.updateMyTabBadge(mergedCount.messageCount);
      this.refreshCollectionCount();
      this.refreshViewedCount();
      this.refreshOrderCount();
    }).catch(() => {
      this.updateMyTabBadge(this.data.count.messageCount || 0);
      this.refreshCollectionCount();
      this.refreshViewedCount();
      this.refreshOrderCount();
    });
  },

  updateMyTabBadge(unreadCount) {
    const num = Number(unreadCount || 0);
    if (!Number.isFinite(num) || num <= 0) {
      wx.removeTabBarBadge({ index: 2 });
      return;
    }
    const text = num > 99 ? '99+' : String(num);
    wx.setTabBarBadge({
      index: 2,
      text
    });
  },

  onHeadPicError() {
    const user = this.data.user || {};
    if (user.headUrl) {
      this.ensureAvatarDisplayLocal(user);
      return;
    }
    const manualAvatar = String(wx.getStorageSync(MANUAL_AVATAR_KEY) || '');
    if (manualAvatar) {
      const recoveredUser = {
        ...user,
        headUrl: manualAvatar,
        displayHeadUrl: ''
      };
      this.setUserAndHead(recoveredUser);
      this.ensureAvatarDisplayLocal(recoveredUser);
      return;
    }
    if (user.displayHeadUrl) {
      const nextUser = { ...user, displayHeadUrl: '' };
      this.setUserAndHead(nextUser);
      this.ensureAvatarDisplayLocal(nextUser);
      return;
    }
    this.syncMyAvatarStrict();
    this.setData({ baseHeadPic: this.data.localHeadPic });
  },

  resetToGuestState() {
    wx.removeStorageSync('loginData');
    wx.removeStorageSync('loginUsername');
    wx.removeStorageSync('wxProfile');
    wx.setStorageSync('isLogin', false);
    this.updateMyTabBadge(0);
    this.setData({
      user: {},
      baseHeadPic: this.data.localHeadPic,
      count: { visited: 0, collection: 0, myBike: 0, myRent: 0, messageCount: 0 }
    });
  },

  isTemporaryLocalPath(pathValue) {
    const s = String(pathValue || '');
    return s.includes('/__tmp__/')
      || s.includes('/__usr__/')
      || s.includes('127.0.0.1:24302')
      || s.includes('127.0.0.1:37688')
      ;
  },

  toDisplayHeadUrl(headUrl, openId) {
    const src = String(headUrl || '');
    if (!src || this.isTemporaryLocalPath(src)) return '';
    if (/^http:\/\//i.test(src)) return src;
    if (/^https:\/\//i.test(src)) return src;
    if (src.startsWith('/api/')) {
      const full = `${app.globalData.baseUrl || ''}${src}`;
      return full;
    }
    if (src.startsWith('/uploads/')) {
      const full = `${app.globalData.baseUrl || ''}${src}`;
      return full;
    }
    if (src.startsWith('/images/')) return `${app.globalData.baseUrl || ''}${src}`;
    if (src.startsWith('/')) return `${this.data.picLocal}${src.replace(/^\/+/, '')}`;
    if (openId) return src;
    return `${this.data.picLocal}/${src}`;
  },

  normalizeNumericId(idValue) {
    const num = Number(idValue);
    if (!Number.isFinite(num) || num <= 0) return '';
    return num;
  },

  normalizeUserHead(user) {
    const safeUser = this.normalizeRemoteUser(user || {});
    const wxProfile = wx.getStorageSync('wxProfile') || {};
    const profileHead = wxProfile.avatarUrl || '';
    const profileNick = wxProfile.nickName || '';
    // 浼樺厛灞曠ず鐢ㄦ埛鍦ㄧ郴缁熷唴淇濆瓨鐨勫ご鍍忥紝鍏舵鎵嶇敤寰俊鎺堟潈澶村儚
    const manualAvatar = this.normalizeHeadUrl(String(wx.getStorageSync(MANUAL_AVATAR_KEY) || ''));
    const manualName = String(wx.getStorageSync(MANUAL_NAME_KEY) || '').trim();
    const manualLocalAvatar = String(wx.getStorageSync(MANUAL_AVATAR_LOCAL_KEY) || '');
    const safeHead = this.normalizeHeadUrl(safeUser.headUrl || safeUser.avatarUrl || '');
    const profileHeadSafe = this.normalizeHeadUrl(profileHead || '');
    const headUrl = manualAvatar || safeHead || profileHeadSafe || '';
    const openId = safeUser.openId || '';
    const userId = this.normalizeNumericId(safeUser.userId || safeUser.id);
    const rawName = String(safeUser.name || safeUser.realName || safeUser.nickname || '').trim();
    const wxName = String(profileNick || '').trim();
    const preferredName = rawName && rawName !== CN.wxUser ? rawName : '';
    const mapped = {
      ...safeUser,
      id: userId,
      userId,
      name: manualName || preferredName || wxName || CN.wxUser,
      headUrl: this.normalizeHeadUrl(headUrl)
    };
    const remoteDisplay = this.toDisplayHeadUrl(mapped.headUrl, openId);
    const stableLocal = manualLocalAvatar && !this.isTemporaryLocalPath(manualLocalAvatar) ? manualLocalAvatar : '';
    return { ...mapped, displayHeadUrl: stableLocal || remoteDisplay };
  },

  mergeUserProfile(localUser, serverUser) {
    const local = localUser || {};
    const remote = this.normalizeRemoteUser(serverUser || {});
    const wxProfile = wx.getStorageSync('wxProfile') || {};
    const profileNick = wxProfile.nickName || '';
    const manualName = String(wx.getStorageSync(MANUAL_NAME_KEY) || '').trim();
    const remoteName = String(remote.name || remote.realName || remote.nickname || '').trim();
    const localName = String(local.name || local.realName || local.nickname || '').trim();
    const wxName = String(profileNick || '').trim();
    const profileHead = wxProfile.avatarUrl || '';
    const manualAvatar = this.normalizeHeadUrl(String(wx.getStorageSync(MANUAL_AVATAR_KEY) || ''));
    const remoteHead = this.normalizeHeadUrl(remote.headUrl || remote.avatarUrl || '');
    const localHead = this.normalizeHeadUrl(local.headUrl || local.avatarUrl || '');
    const profileHeadSafe = this.normalizeHeadUrl(profileHead || '');
    const mergedHead = manualAvatar || remoteHead || localHead || profileHeadSafe || '';
    const mergedDisplay = this.toDisplayHeadUrl(mergedHead, remote.openId || local.openId || '');
    const manualLocalAvatar = String(wx.getStorageSync(MANUAL_AVATAR_LOCAL_KEY) || '');
    const stableLocal = manualLocalAvatar && !this.isTemporaryLocalPath(manualLocalAvatar) ? manualLocalAvatar : '';
    return {
      ...local,
      ...remote,
      name: manualName || (localName && localName !== CN.wxUser ? localName : '') || (remoteName && remoteName !== CN.wxUser ? remoteName : '') || wxName || CN.wxUser,
      headUrl: mergedHead,
      displayHeadUrl: stableLocal || mergedDisplay
    };
  },

  isDefaultAvatarValue(pathValue) {
    const s = String(pathValue || '');
    if (!s) return true;
    return s.includes('/images/icons/tabbar/my.png')
      || s.includes('images/icons/tabbar/my.png')
      || s === 'my.png'
      || s.endsWith('/my.png');
  },

  normalizeHeadUrl(pathValue) {
    const src = String(pathValue || '');
    if (!src || this.isTemporaryLocalPath(src) || this.isDefaultAvatarValue(src)) return '';
    return src;
  },

  normalizeRemoteUser(raw) {
    const d = raw || {};
    return {
      ...d,
      id: d.id || d.userId || d.user_id || '',
      userId: d.userId || d.user_id || d.id || '',
      name: d.name || d.realName || d.real_name || d.nickname || '',
      realName: d.realName || d.real_name || d.name || '',
      avatarUrl: d.avatarUrl || d.avatar_url || d.headUrl || d.head_url || '',
      headUrl: d.headUrl || d.head_url || d.avatarUrl || d.avatar_url || '',
      openId: d.openId || d.open_id || '',
      username: d.username || '',
      phone: d.phone || d.mobile || '',
      mobile: d.mobile || d.phone || ''
    };
  },

  refreshCollectionCount() {
    const loginData = wx.getStorageSync('loginData') || {};
    const rawUserId = this.data.user.userId || this.data.user.id || loginData.userId || loginData.id;
    const userId = Number(rawUserId);
    if (!Number.isFinite(userId) || userId <= 0) {
      this.setData({ count: { ...this.data.count, collection: 0 } });
      return;
    }
    api.post(path.path.countCollection, { userId }).then((res) => {
      this.setData({ count: { ...this.data.count, collection: Number((res && res.data) || 0) } });
    }).catch(() => {
      api.post(path.path.findCollectionList, { userId }).then((listRes) => {
        const list = (listRes && listRes.data) || [];
        this.setData({ count: { ...this.data.count, collection: Array.isArray(list) ? list.length : 0 } });
      }).catch(() => {});
    });
  },

  refreshViewedCount() {
    const token = wx.getStorageSync('token');
    const isLogin = wx.getStorageSync('isLogin') === true;
    if (!token || !isLogin) {
      this.setData({ count: { ...this.data.count, visited: 0 } });
      return;
    }
    const loginData = wx.getStorageSync('loginData') || {};
    const rawUserId = this.data.user.userId || this.data.user.id || loginData.userId || loginData.id;
    const userId = Number(rawUserId);
    if (Number.isFinite(userId) && userId > 0) {
      api.post(path.path.countViewed, { userId }).then((res) => {
        this.setData({ count: { ...this.data.count, visited: Number((res && res.data) || 0) } });
      }).catch(() => {
        const viewed = wx.getStorageSync(VIEWED_KEY) || [];
        this.setData({ count: { ...this.data.count, visited: Array.isArray(viewed) ? viewed.length : 0 } });
      });
      return;
    }
    const viewed = wx.getStorageSync(VIEWED_KEY) || [];
    this.setData({ count: { ...this.data.count, visited: Array.isArray(viewed) ? viewed.length : 0 } });
  },

  refreshOrderCount() {
    const loginData = wx.getStorageSync('loginData') || {};
    const rawUserId = this.data.user.userId || this.data.user.id || loginData.userId || loginData.id;
    const userId = Number(rawUserId);
    if (!Number.isFinite(userId) || userId <= 0) {
      this.setData({ count: { ...this.data.count, myRent: 0 } });
      return;
    }
    const resolveCount = (res) => {
      const data = (res && res.data) || [];
      if (Array.isArray(data)) return data.length;
      if (Array.isArray(data.records)) return data.records.length;
      if (Array.isArray(data.list)) return data.list.length;
      if (Number.isFinite(Number(data.total))) return Number(data.total);
      return 0;
    };
    api.get(`api/order/user/${userId}`, { page: 1, size: 200 }).then((res) => {
      this.setData({ count: { ...this.data.count, myRent: resolveCount(res) } });
    }).catch(() => {
      api.get('api/order/list', { page: 1, size: 200, userId }).then((res) => {
        this.setData({ count: { ...this.data.count, myRent: resolveCount(res) } });
      }).catch(() => this.setData({ count: { ...this.data.count, myRent: 0 } }));
    });
  },

  handleLogin(e) {
    this.wechatLogin(e || {});
  },

  ensurePrivacyAuthorize() {
    return new Promise((resolve, reject) => {
      if (typeof wx.requirePrivacyAuthorize !== 'function') {
        resolve();
        return;
      }
      wx.requirePrivacyAuthorize({
        success: () => resolve(),
        fail: () => reject(new Error(CN.privacyRequired))
      });
    });
  },

  getLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => (res && res.code ? resolve(res.code) : reject(new Error(CN.getCodeFailed))),
        fail: () => reject(new Error(CN.wxLoginFailed))
      });
    });
  },

  getPhonePayload(detail) {
    const d = detail || {};
    const failMsg = String(d.errMsg || '');
    if (failMsg.includes('fail')) return {};
    return {
      phoneCode: d.code || '',
      phoneEncryptedData: d.encryptedData || '',
      phoneIv: d.iv || ''
    };
  },

  fetchWechatProfileSafe() {
    return new Promise((resolve) => {
      wx.getUserProfile({
        desc: CN.profileDesc,
        success: (res) => resolve(res || {}),
        fail: () => {
          // 鍏滃簳锛氶儴鍒嗘満鍨?棰戠巼闄愬埗涓?getUserProfile 澶辫触鏃跺皾璇?getUserInfo
          wx.getUserInfo({
            success: (res) => resolve(res || {}),
            fail: () => resolve({ userInfo: wx.getStorageSync('wxProfile') || {} })
          });
        }
      });
    });
  },

  loginByBackend(payloadV2, payloadLegacy) {
    return api.post(path.path.wechatLogin, payloadV2).catch(() => api.post('api/wechat/auth/login', payloadLegacy));
  },

  buildFallbackUser(res, profileUser) {
    const data = (res && res.data) || {};
    const cached = wx.getStorageSync('loginData') || {};
    const cachedProfile = wx.getStorageSync('wxProfile') || {};
    const avatar = profileUser.avatarUrl || data.avatarUrl || data.headUrl || cached.headUrl || cachedProfile.avatarUrl || '';
    const nickname = profileUser.nickName || data.nickname || data.username || cached.name || CN.wxUser;
    return this.normalizeUserHead(this.normalizeRemoteUser({
      id: data.userId || data.openId || '',
      userId: data.userId || '',
      openId: data.openId || '',
      username: data.username || 'wx_user',
      name: nickname,
      headUrl: avatar,
      avatarUrl: avatar,
      roleStr: 'User'
    }));
  },

  wechatLogin(e) {
    this.ensurePrivacyAuthorize()
      .then(() => this.getLoginCode())
      .then((code) => {
        const phonePayload = this.getPhonePayload((e && e.detail) || {});
        return this.fetchWechatProfileSafe().then((profileRes) => {
          const userInfo = profileRes.userInfo || {};
          const payloadV2 = {
            code,
            userInfo: profileRes.encryptedData || '',
            iv: profileRes.iv || '',
            encryptedData: profileRes.encryptedData || '',
            rawData: profileRes.rawData || '',
            signature: profileRes.signature || '',
            nickname: userInfo.nickName || '',
            avatarUrl: userInfo.avatarUrl || '',
            gender: typeof userInfo.gender === 'number' ? userInfo.gender : null,
            ...phonePayload
          };
          const payloadLegacy = {
            code,
            nickname: userInfo.nickName || '',
            avatarUrl: userInfo.avatarUrl || '',
            gender: typeof userInfo.gender === 'number' ? userInfo.gender : null
          };
          return this.loginByBackend(payloadV2, payloadLegacy).then((loginRes) => {
            const token = (loginRes && loginRes.data && loginRes.data.token) || loginRes.token || '';
            if (!token) {
              wx.showToast({ title: CN.loginNoToken, icon: 'none' });
              return;
            }
            const effectiveUserInfo = {
              nickName: userInfo.nickName || (wx.getStorageSync('wxProfile') || {}).nickName || '',
              avatarUrl: userInfo.avatarUrl || (wx.getStorageSync('wxProfile') || {}).avatarUrl || ''
            };
            const fallbackUser = this.buildFallbackUser(loginRes, effectiveUserInfo);
            wx.setStorageSync('token', token);
            wx.setStorageSync('isLogin', true);
            const oldWxProfile = wx.getStorageSync('wxProfile') || {};
            wx.setStorageSync('wxProfile', {
              nickName: effectiveUserInfo.nickName || oldWxProfile.nickName || fallbackUser.name || '',
              avatarUrl: effectiveUserInfo.avatarUrl || oldWxProfile.avatarUrl || fallbackUser.headUrl || ''
            });
          const stableName = String(wx.getStorageSync(MANUAL_NAME_KEY) || '').trim();
          if (stableName && stableName !== CN.wxUser) {
            fallbackUser.name = stableName;
          }
          wx.setStorageSync('loginData', fallbackUser);
            if (fallbackUser.headUrl) {
              wx.setStorageSync(MANUAL_AVATAR_KEY, fallbackUser.headUrl);
            }
            wx.setStorageSync('loginUsername', fallbackUser.username || '');
            this.setUserAndHead(fallbackUser);
            this.refreshCollectionCount();
            this.refreshViewedCount();
            this.refreshOrderCount();
            const loginUsername = fallbackUser.username || '';
            if (loginUsername) {
              api.post(path.path.getLoginData, { username: loginUsername }).then((userRes) => {
                const normalized = this.normalizeUserHead((userRes && userRes.data) || {});
                if (!normalized || Object.keys(normalized).length === 0) return;
                const merged = this.mergeUserProfile(fallbackUser, normalized);
                wx.setStorageSync('loginData', merged);
                if (merged.headUrl) {
                  wx.setStorageSync(MANUAL_AVATAR_KEY, merged.headUrl);
                }
                wx.setStorageSync('loginUsername', merged.username || loginUsername);
                this.setUserAndHead(merged);
                this.refreshCollectionCount();
                this.refreshOrderCount();
              }).catch(() => {});
            }
            wx.showToast({ title: CN.loginSuccess, icon: 'success' });
          });
        });
      })
      .catch((err) => {
        const msg = (err && err.message) ? err.message : CN.loginRetry;
        wx.showToast({ title: msg, icon: 'none' });
      });
  },

  logout() {
    wx.showModal({
      title: CN.logoutTitle,
      content: CN.logoutConfirm,
      confirmColor: '#0d6ee9',
      success: (res) => {
        if (!res.confirm) return;
        wx.removeStorageSync('token');
        wx.removeStorageSync('wxProfile');
        this.resetToGuestState();
        this.refreshViewedCount();
        wx.showToast({ title: CN.logoutSuccess, icon: 'success' });
      }
    });
  },

  toChangeInfo() {
    wx.navigateTo({ url: `./changeMyInfo?id=${this.data.user.id || ''}` });
  },

  changeLogin() {
    wx.navigateTo({ url: './manageLogin/login' });
  },

  toVisited() {
    wx.navigateTo({ url: './viewed/viewed' });
  },

  toCollection() {
    wx.navigateTo({ url: './collection/collection' });
  },

  toMyRent() {
    this.toRentRecord();
  },

  toMessage() {
    wx.navigateTo({ url: './message/message' });
  },

  toRentRecord() {
    wx.navigateTo({ url: './rentRecord/rentRecord' });
  }
});
