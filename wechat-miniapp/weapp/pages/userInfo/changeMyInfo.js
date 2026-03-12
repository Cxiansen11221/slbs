// pages/userInfo/changeMyInfo.js
const app = getApp();
import api from '../../config/api';
import path from '../../config/path';
const { $Message } = require('../../dist/base/index');
const { $Toast } = require('../../dist/base/index');
const MANUAL_AVATAR_KEY = 'manualAvatarUrl';
const MANUAL_AVATAR_LOCAL_KEY = 'manualAvatarLocalPath';
const MANUAL_NAME_KEY = 'manualDisplayName';

Page({
  data: {
    picLocal: app.globalData.picLocal,
    user: null,
    defaultAvatar: '../../images/icons/tabbar/my.png',
    avatarDisplayUrl: '../../images/icons/tabbar/my.png',
    allRole: [{ label: '用户' }],
    roleIndex: 0,
    genderOptions: [
      { label: '男', value: 0 },
      { label: '女', value: 1 },
      { label: '非二元', value: 2 },
      { label: '不愿透露', value: 3 }
    ],
    genderIndex: 0,
    files: [],
    sureVisible: false,
    localAvatarPath: ''
  },

  onLoad() {
    const loginData = wx.getStorageSync('loginData') || {};
    const wxProfile = wx.getStorageSync('wxProfile') || {};
    const user = this.normalizeUser(loginData, wxProfile);
    this.setData({
      user,
      avatarDisplayUrl: this.buildAvatarUrl(user.headUrl, ''),
      allRole: [{ label: user.roleStr || '用户' }],
      roleIndex: 0,
      genderIndex: this.findGenderIndex(user.sex),
      files: user.headUrl ? [user.headUrl] : []
    });
    this.ensureAvatarDisplayLocal(user.headUrl);
    this.syncUserDetailFromServer();
  },

  onShow() {
    const user = this.data.user || {};
    const headUrl = user.headUrl || '';
    const localAvatarPath = this.data.localAvatarPath || '';
    const safeHead = this.isTemporaryLocalPath(headUrl) ? '' : headUrl;
    const safeLocal = this.isTemporaryLocalPath(localAvatarPath) ? '' : localAvatarPath;
    this.setData({
      user: {
        ...user,
        headUrl: safeHead
      },
      localAvatarPath: safeLocal,
      avatarDisplayUrl: this.buildAvatarUrl(safeHead, safeLocal)
    });
    this.ensureAvatarDisplayLocal(safeHead);
    if (!safeHead) {
      this.syncUserDetailFromServer();
    }
  },

  syncUserDetailFromServer() {
    const loginData = wx.getStorageSync('loginData') || {};
    const wxProfile = wx.getStorageSync('wxProfile') || {};
    const username = wx.getStorageSync('loginUsername') || loginData.username || '';
    const uid = this.normalizeNumericId((this.data.user && (this.data.user.userId || this.data.user.id)) || loginData.userId || loginData.id);

    const applyRemote = (raw) => {
      const remote = raw || {};
      const mergedBase = {
        ...(this.data.user || {}),
        ...remote,
        headUrl: remote.avatarUrl || remote.headUrl || (this.data.user && this.data.user.headUrl) || ''
      };
      const user = this.normalizeUser(mergedBase, wxProfile);
      wx.setStorageSync('loginData', {
        ...loginData,
        ...user,
        headUrl: user.headUrl,
        avatarUrl: user.headUrl
      });
      if (user.headUrl) {
        wx.setStorageSync(MANUAL_AVATAR_KEY, user.headUrl);
      }
      this.setData({
        user,
        avatarDisplayUrl: this.buildAvatarUrl(user.headUrl, this.data.localAvatarPath || ''),
        files: user.headUrl ? [user.headUrl] : []
      });
      this.ensureAvatarDisplayLocal(user.headUrl);
    };

    const byId = () => {
      if (!uid) return Promise.resolve(false);
      return api.get(`api/user/${uid}`).then((res) => {
        applyRemote((res && res.data) || {});
        return true;
      });
    };

    const byUsername = () => {
      if (!username) return Promise.resolve(false);
      return api.post(path.path.getLoginData, { username }).then((res) => {
        const data = (res && res.data) || {};
        applyRemote(data);
        const resolvedId = this.normalizeNumericId(data.userId || data.id);
        if (!resolvedId) return true;
        return api.get(`api/user/${resolvedId}`).then((detailRes) => {
          applyRemote((detailRes && detailRes.data) || {});
          return true;
        }).catch(() => true);
      });
    };

    byId().catch(() => false).then((ok) => {
      if (ok) return;
      byUsername().catch(() => {});
    });
    this.hardSyncAvatarUrl(uid);
  },

  hardSyncAvatarUrl(userIdArg) {
    const loginData = wx.getStorageSync('loginData') || {};
    const uid = this.normalizeNumericId(userIdArg || (this.data.user && (this.data.user.userId || this.data.user.id)) || loginData.userId || loginData.id);
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
        const avatarUrl = String(data.avatarUrl || data.headUrl || '');
        if (!avatarUrl) return;
        const fullAvatar = this.buildAvatarUrl(avatarUrl, '');
        const nextUser = {
          ...(this.data.user || {}),
          id: uid,
          userId: uid,
          headUrl: avatarUrl
        };
        this.setData({
          user: nextUser,
          avatarDisplayUrl: fullAvatar,
          files: [avatarUrl]
        });
        wx.setStorageSync(MANUAL_AVATAR_KEY, avatarUrl);
        const oldLoginData = wx.getStorageSync('loginData') || {};
        wx.setStorageSync('loginData', {
          ...oldLoginData,
          id: uid,
          userId: uid,
          headUrl: avatarUrl,
          avatarUrl
        });
      }
    });
  },

  buildAvatarUrl(headUrl, localAvatarPath) {
    if (localAvatarPath) return localAvatarPath;
    const src = String(headUrl || '');
    if (!src || this.isTemporaryLocalPath(src)) {
      return this.data.defaultAvatar;
    }
    if (/^https?:\/\//i.test(src)) return src;
    if (src.startsWith('/api/')) {
      return `${app.globalData.baseUrl || ''}${src}`;
    }
    if (src.startsWith('/uploads/')) {
      return `${app.globalData.baseUrl || ''}${src}`;
    }
    if (src.startsWith('/images/')) return `${app.globalData.baseUrl || ''}${src}`;
    return src;
  },

  ensureAvatarDisplayLocal(headUrl) {
    if (this.data.localAvatarPath) return;
    const src = this.buildAvatarUrl(headUrl, '');
    const raw = String(headUrl || '');
    let downloadUrl = '';
    if (/^http:\/\//i.test(raw)) {
      downloadUrl = raw;
    } else if (raw.startsWith('/api/') || raw.startsWith('/uploads/')) {
      downloadUrl = `${app.globalData.baseUrl || ''}${raw}`;
    } else {
      downloadUrl = src;
    }
    if (!downloadUrl || !downloadUrl.startsWith('http://')) return;
    wx.downloadFile({
      url: downloadUrl,
      success: (res) => {
        if (res && res.statusCode === 200 && res.tempFilePath) {
          this.setData({ avatarDisplayUrl: res.tempFilePath });
        }
      }
    });
  },

  normalizeUser(raw, wxProfile = {}) {
    const user = raw || {};
    const profileNick = wxProfile.nickName || '';
    const profileAvatar = wxProfile.avatarUrl || '';
    const rawName = user.name || user.realName || user.nickname || '';
    const manualName = String(wx.getStorageSync(MANUAL_NAME_KEY) || '').trim();
    const finalName = manualName || (String(rawName) || '').trim() || (profileNick || '').trim();
    const openId = user.openId || '';
    // 编辑资料页优先使用用户已保存头像，避免被微信头像覆盖
    const manualAvatar = this.normalizeHeadUrl(String(wx.getStorageSync(MANUAL_AVATAR_KEY) || ''));
    const serverAvatar = this.normalizeHeadUrl(user.headUrl || user.avatarUrl || '');
    const profileAvatarSafe = this.normalizeHeadUrl(profileAvatar || '');
    const headUrl = manualAvatar || serverAvatar || profileAvatarSafe || '';
    const sexCode = this.resolveSexCode(user);
    const normalizedUserId = this.normalizeNumericId(user.userId || user.id);
    return {
      id: normalizedUserId,
      userId: normalizedUserId,
      displayId: normalizedUserId || '',
      openId,
      name: finalName || '微信用户',
      username: user.username || '',
      mobile: user.mobile || user.phone || '',
      phone: user.phone || user.mobile || '',
      email: user.email || '',
      address: user.address || '',
      birthday: user.birthday || '',
      sex: sexCode,
      roleStr: user.roleStr || '用户',
      headUrl
    };
  },

  normalizeNumericId(idValue) {
    const num = Number(idValue);
    if (!Number.isFinite(num) || num <= 0) return '';
    return num;
  },

  isTemporaryLocalPath(pathValue) {
    const s = String(pathValue || '');
    return s.includes('/__tmp__/')
      || s.includes('/__usr__/')
      || s.includes('127.0.0.1:24302')
      || s.includes('127.0.0.1:37688')
      || s.includes('127.0.0.1');
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

  resolveSexCode(user) {
    if (user && typeof user.sexCode === 'number') {
      return user.sexCode;
    }
    if (user && typeof user.sex === 'number') {
      return user.sex;
    }
    const sexText = String((user && user.sex) || '').toLowerCase();
    if (/female|女/.test(sexText)) return 1;
    if (/male|男/.test(sexText)) return 0;
    if (/non[- ]?binary|非二元/.test(sexText)) return 2;
    return 3;
  },

  findGenderIndex(sexValue) {
    const idx = this.data.genderOptions.findIndex((g) => g.value === sexValue);
    return idx >= 0 ? idx : 0;
  },

  handleSexChange({ detail = {} }) {
    const value = String(detail.value == null ? '' : detail.value);
    this.data.user.sex = (value === '1' || /female|女/i.test(value)) ? 1 : 0;
    this.setData({ user: this.data.user });
  },

  genderPickerChange(e) {
    const index = Number(e.detail.value) || 0;
    const selected = this.data.genderOptions[index] || this.data.genderOptions[0];
    this.data.user.sex = selected.value;
    this.setData({
      user: this.data.user,
      genderIndex: index
    });
  },

  rolePickerChange(e) {
    this.setData({ roleIndex: Number(e.detail.value) || 0 });
  },

  datePickerChange(e) {
    this.data.user.birthday = e.detail.value || '';
    this.setData({ user: this.data.user });
  },

  previewImage(e) {
    wx.previewImage({
      current: e.currentTarget.id,
      urls: this.data.files
    });
  },

  compressImage(filePath) {
    return new Promise((resolve) => {
      wx.compressImage({
        src: filePath,
        quality: 70,
        success: (res) => resolve((res && res.tempFilePath) || filePath),
        fail: () => resolve(filePath)
      });
    });
  },

  uploadAvatarIfNeeded() {
    const user = this.data.user || {};
    const currentHead = String(user.headUrl || '');
    const localPath = String(this.data.localAvatarPath || '');
    const shouldUpload = this.isTemporaryLocalPath(currentHead) || (!currentHead && !!localPath);
    if (!shouldUpload) {
      return Promise.resolve(currentHead);
    }
    const uploadSrc = localPath || currentHead;
    if (!uploadSrc) {
      return Promise.resolve('');
    }
    return this.compressImage(uploadSrc).then((uploadPath) => {
      const uid = this.normalizeNumericId(user.userId || user.id || (wx.getStorageSync('loginData') || {}).userId || (wx.getStorageSync('loginData') || {}).id);
      const username = String(wx.getStorageSync('loginUsername') || (wx.getStorageSync('loginData') || {}).username || '').trim();
      const formData = uid ? { userId: String(uid) } : {};
      if (username) formData.username = username;
      return api.upload(path.path.uploadHead, uploadPath, 'file', formData).then((uploadRes) => {
        const remoteUrl = (uploadRes && uploadRes.data) ? String(uploadRes.data) : '';
        return remoteUrl;
      });
    });
  },

  persistAvatarLocal(tempPath) {
    return new Promise((resolve) => {
      const src = String(tempPath || '');
      if (!src) {
        resolve('');
        return;
      }
      wx.saveFile({
        tempFilePath: src,
        success: (res) => {
          const saved = String((res && res.savedFilePath) || '');
          if (saved) {
            wx.setStorageSync(MANUAL_AVATAR_LOCAL_KEY, saved);
          }
          resolve(saved || src);
        },
        fail: () => resolve(src)
      });
    });
  },

  resolveSaveUserId() {
    const user = this.data.user || {};
    const fromUser = this.normalizeNumericId(user.userId || user.id);
    if (fromUser) return Promise.resolve(fromUser);

    const loginData = wx.getStorageSync('loginData') || {};
    const fromStorage = this.normalizeNumericId(loginData.userId || loginData.id);
    if (fromStorage) return Promise.resolve(fromStorage);

    const username = wx.getStorageSync('loginUsername') || loginData.username || '';
    if (!username) return Promise.resolve('');

    return api.post(path.path.getLoginData, { username }).then((res) => {
      const remote = (res && res.data) || {};
      const resolved = this.normalizeNumericId(remote.userId || remote.id);
      if (resolved) {
        const nextUser = { ...(this.data.user || {}), userId: resolved, id: resolved };
        this.setData({ user: nextUser });
      }
      return resolved || '';
    }).catch(() => '');
  },

  saveProfileWithFallback(params) {
    return api.post(path.path.userSave, params).catch(() => {
      const id = params.id;
      const payload = {
        userId: id,
        realName: params.name || '',
        phone: params.mobile || '',
        email: params.email || null,
        emergencyContact: params.address || '',
        gender: (typeof params.sex === 'number') ? params.sex : 0,
        avatarUrl: params.headUrl || ''
      };
      if (params.birthday) {
        payload.birthday = params.birthday;
      }
      return api.put(`api/user/${id}`, payload);
    });
  },

  syncAvatarToServer(remoteUrl) {
    const user = this.data.user || {};
    const id = this.normalizeNumericId(user.userId || user.id);
    if (!id || !remoteUrl) return Promise.reject(new Error('未获取到用户ID，头像无法持久化'));
    const payload = {
      id,
      headUrl: remoteUrl
    };
    return api.post(path.path.userSave, payload).catch((firstErr) => {
      return api.put(`api/user/${id}`, {
        userId: id,
        avatarUrl: remoteUrl
      }).catch(() => Promise.reject(firstErr));
    });
  },

  validatePhoneBeforeSave(params) {
    return api.get('api/user/list', { page: 1, size: 500 }).then((res) => {
      const list = (res && res.data) || [];
      if (!Array.isArray(list)) return params;
      const conflict = list.find((item) => {
        const itemPhone = String(item.phone || '');
        const itemId = Number(item.id || item.userId || 0);
        return itemPhone === String(params.mobile || '') && itemId !== Number(params.id || 0);
      });
      if (conflict) {
        throw new Error('手机号已被占用，请更换后重试');
      }
      return params;
    }).catch((err) => {
      const msg = (err && err.message) || '';
      if (msg.includes('占用')) {
        throw err;
      }
      return params;
    });
  },


  chooseImage() {
    const that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = (res.tempFilePaths && res.tempFilePaths[0]) || '';
        if (!tempFilePath) return;

        const previousHeadUrl = (that.data.user && that.data.user.headUrl) || '';
        const previousDisplayUrl = that.buildAvatarUrl(previousHeadUrl, '');
        // 先立即预览本地已选图片，保证用户“修改后立刻可见”
        that.setData({
          avatarDisplayUrl: tempFilePath,
          localAvatarPath: tempFilePath
        });
        wx.showLoading({ title: '上传中', mask: true });
        that.compressImage(tempFilePath).then((uploadPath) => {
          const uid = that.normalizeNumericId((that.data.user || {}).userId || (that.data.user || {}).id || (wx.getStorageSync('loginData') || {}).userId || (wx.getStorageSync('loginData') || {}).id);
          const username = String(wx.getStorageSync('loginUsername') || (wx.getStorageSync('loginData') || {}).username || '').trim();
          const formData = uid ? { userId: String(uid) } : {};
          if (username) formData.username = username;
          return api.upload(path.path.uploadHead, uploadPath, 'file', formData);
        }).then((uploadRes) => {
          const remoteUrl = (uploadRes && uploadRes.data) ? String(uploadRes.data) : '';
          if (!remoteUrl) {
            wx.hideLoading();
            $Message({ content: '头像上传失败', type: 'error' });
            return;
          }
          that.data.user.headUrl = remoteUrl;
          wx.setStorageSync(MANUAL_AVATAR_KEY, remoteUrl);
          const oldLoginData = wx.getStorageSync('loginData') || {};
          wx.setStorageSync('loginData', {
            ...oldLoginData,
            headUrl: remoteUrl,
            avatarUrl: remoteUrl
          });
          that.persistAvatarLocal(tempFilePath).then((savedLocal) => {
            that.setData({
              user: that.data.user,
              files: [remoteUrl],
              // 保留本地预览图用于当前会话显示；远程地址写入 headUrl 用于持久化
              localAvatarPath: savedLocal || tempFilePath,
              avatarDisplayUrl: savedLocal || tempFilePath
            });
            that.ensureAvatarDisplayLocal(remoteUrl);
            that.syncAvatarToServer(remoteUrl).then(() => {
              wx.hideLoading();
              $Message({ content: '头像上传成功', type: 'success' });
            }).catch((err) => {
              wx.hideLoading();
              $Message({ content: (err && err.message) ? err.message : '头像上传成功，但持久化失败', type: 'warning' });
            });
          });
        }).catch((err) => {
          that.setData({
            localAvatarPath: '',
            avatarDisplayUrl: previousDisplayUrl || that.data.defaultAvatar
          });
          wx.hideLoading();
          $Message({ content: (err && err.message) ? err.message : '头像上传失败', type: 'error' });
        });
      }
    });
  },

  onAvatarError() {
    const safeHead = this.isTemporaryLocalPath((this.data.user || {}).headUrl) ? '' : ((this.data.user || {}).headUrl || '');
    this.setData({
      localAvatarPath: '',
      avatarDisplayUrl: this.buildAvatarUrl(safeHead, '')
    });
  },

  changeName(e) {
    this.data.user.name = e.detail.value || '';
    this.setData({ user: this.data.user });
    const name = String(this.data.user.name || '').trim();
    if (name && name !== '微信用户') {
      wx.setStorageSync(MANUAL_NAME_KEY, name);
    }
  },

  changeMobile(e) {
    const value = e.detail.value || '';
    this.data.user.mobile = value;
    this.data.user.phone = value;
    this.setData({ user: this.data.user });
  },

  changeEmail(e) {
    this.data.user.email = e.detail.value || '';
    this.setData({ user: this.data.user });
  },

  changeAddress(e) {
    this.data.user.address = e.detail.value || '';
    this.setData({ user: this.data.user });
  },

  sureChange() {
    if (!this.data.user.name) {
      $Toast({ content: '请输入用户名', type: 'warning' });
      return;
    }
    if (!this.data.user.mobile) {
      $Toast({ content: '请输入手机号', type: 'warning' });
      return;
    }
    this.setData({ sureVisible: true });
  },

  reductionData() {
    const loginUsername = wx.getStorageSync('loginUsername') || '';
    const wxProfile = wx.getStorageSync('wxProfile') || {};
    api.post(path.path.getLoginData, { username: loginUsername }).then((res) => {
      const user = this.normalizeUser(res.data || {}, wxProfile);
      wx.setStorageSync('loginData', user);
      this.setData({
        user,
        localAvatarPath: '',
        avatarDisplayUrl: this.buildAvatarUrl(user.headUrl, ''),
        genderIndex: this.findGenderIndex(user.sex),
        files: user.headUrl ? [user.headUrl] : []
      });
      wx.setStorageSync('isLogin', true);
    }).catch((err) => {
      console.log(err);
    });
  },

  sureAlertOk() {
    const user = this.data.user || {};
    let headpic = '';
    const localPreviewBeforeSave = String(this.data.localAvatarPath || this.data.avatarDisplayUrl || '');
    wx.showLoading({ title: '保存中', mask: true });
    Promise.all([this.uploadAvatarIfNeeded(), this.resolveSaveUserId()]).then(([uploadedHead, resolvedUserId]) => {
      const rawHead = uploadedHead || user.headUrl;
      if (Array.isArray(rawHead) && rawHead.length > 0) {
        headpic = rawHead[0] || '';
      } else if (typeof rawHead === 'string') {
        headpic = rawHead;
      }
      if (this.isTemporaryLocalPath(headpic) || this.isDefaultAvatarValue(headpic)) {
        headpic = '';
      }
      const mobile = String(user.mobile || '').replace(/\D/g, '').slice(0, 11);
      const emailRaw = String(user.email || '').trim();
      const email = /@/.test(emailRaw) ? emailRaw.slice(0, 100) : '';
      const address = String(user.address || '').trim().slice(0, 20);
      const name = String(user.name || '').trim().slice(0, 50);
      const sexNum = Number(user.sex);
      const sex = [0, 1, 2].includes(sexNum) ? sexNum : null;
      const params = {
        id: this.normalizeNumericId(resolvedUserId || user.userId || user.id),
        headUrl: headpic,
        name,
        mobile,
        email,
        address,
        sex,
        birthday: user.birthday
      };
      if (!params.id) {
        throw new Error('未获取到用户ID，请先重新登录后再试');
      }
      if (!params.mobile || params.mobile.length !== 11) {
        throw new Error('手机号必须为11位数字');
      }
      return this.validatePhoneBeforeSave(params).then(() => this.saveProfileWithFallback(params)).then(() => params);
    }).then((params) => {
      const savedUser = this.normalizeUser({
        ...(this.data.user || {}),
        name: params.name,
        mobile: params.mobile,
        phone: params.mobile,
        email: params.email || '',
        address: params.address || '',
        headUrl: params.headUrl || ((this.data.user || {}).headUrl || ''),
        sex: (typeof params.sex === 'number') ? params.sex : (this.data.user || {}).sex,
        birthday: params.birthday || (this.data.user || {}).birthday || ''
      });
        const wxProfile = wx.getStorageSync('wxProfile') || {};
        const mergedUser = this.normalizeUser({
          ...savedUser,
          headUrl: headpic || savedUser.headUrl || savedUser.avatarUrl || ''
        }, wxProfile);
        // 不持久化临时显示路径，交由“我的”页按 headUrl 重新恢复并缓存
        mergedUser.displayHeadUrl = '';
        wx.setStorageSync('loginData', mergedUser);
        if (mergedUser.headUrl) {
          wx.setStorageSync(MANUAL_AVATAR_KEY, mergedUser.headUrl);
        }
        const stableLocalAvatar = String(this.data.localAvatarPath || localPreviewBeforeSave || '');
        if (stableLocalAvatar && !this.isTemporaryLocalPath(stableLocalAvatar)) {
          wx.setStorageSync(MANUAL_AVATAR_LOCAL_KEY, stableLocalAvatar);
        }
        wx.setStorageSync('wxProfile', {
          ...wxProfile,
          avatarUrl: mergedUser.headUrl || wxProfile.avatarUrl || '',
          nickName: mergedUser.name || wxProfile.nickName || ''
        });
        if (mergedUser.name && mergedUser.name !== '微信用户') {
          wx.setStorageSync(MANUAL_NAME_KEY, mergedUser.name);
        }
        if (mergedUser.username) {
          wx.setStorageSync('loginUsername', mergedUser.username);
        }
        wx.setStorageSync('isLogin', true);

        this.setData({
          sureVisible: false,
          user: mergedUser,
          localAvatarPath: localPreviewBeforeSave || '',
          avatarDisplayUrl: localPreviewBeforeSave || mergedUser.displayHeadUrl || this.buildAvatarUrl(mergedUser.headUrl, ''),
          genderIndex: this.findGenderIndex(mergedUser.sex),
          files: mergedUser.headUrl ? [mergedUser.headUrl] : []
        });
        this.ensureAvatarDisplayLocal(mergedUser.headUrl);
        $Message({ content: '修改成功', type: 'success' });
    }).catch((err) => {
      console.log(err);
      $Message({ content: (err && err.message) || '修改失败', type: 'error' });
    }).finally(() => {
      wx.hideLoading();
    });
  },

  sureAlertCancel() {
    this.setData({ sureVisible: false });
  }
});
