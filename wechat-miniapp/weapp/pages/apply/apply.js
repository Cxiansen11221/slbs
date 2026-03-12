Page({
  data: {
    uiText: {
      solutionTitle: '\u4e86\u89e3\u79df\u8f66\u89e3\u51b3\u65b9\u6848',
      solutionTopic: '\u79df\u8f66\u54a8\u8be2',
      solutionSubtopic: '\u5e38\u89c1\u95ee\u9898',
      primaryAction: '\u5168\u90e8\u54a8\u8be2',
      secondaryAction: '\u8054\u7cfb\u5ba2\u670d',
      moreLabel: '\u5176\u4ed6\u54a8\u8be2',
      shuffle: '\u6362\u4e00\u6279',
      askPlaceholder: '\u8bf7\u8f93\u5165\u60a8\u7684\u95ee\u9898...',
      send: '\u53d1\u9001'
    },
    showQuestions: true,
    inputText: '',
    inputFocus: false,
    toView: '',
    currentQuestions: [
      { q: '\u5982\u4f55\u9009\u62e9\u8f66\u8f86\uff1f', a: '\u5efa\u8bae\u6309\u7eed\u822a\u3001\u4ef7\u683c\u548c\u53ef\u7528\u72b6\u6001\u7efc\u5408\u9009\u62e9\uff0c\u4f18\u5148\u9009\u8ddd\u79bb\u4f60\u66f4\u8fd1\u7684\u8f66\u8f86\u3002' },
      { q: '\u8f66\u8f86\u884c\u9a76\u91cc\u7a0b\u95ee\u9898', a: '\u9875\u9762\u663e\u793a\u7684\u662f\u9884\u4f30\u91cc\u7a0b\uff0c\u53d7\u8def\u51b5\u548c\u8f7d\u91cd\u5f71\u54cd\uff0c\u5efa\u8bae\u9884\u7559 10%-20% \u7535\u91cf\u3002' },
      { q: '\u8f66\u8f86\u5145\u7535\u76f8\u5173\u95ee\u9898', a: '\u8bf7\u4f18\u5148\u4f7f\u7528\u5e73\u53f0\u5efa\u8bae\u7684\u5145\u7535\u65b9\u5f0f\uff0c\u907f\u514d\u4f7f\u7528\u4e0d\u5339\u914d\u7684\u5145\u7535\u5668\u3002' },
      { q: '\u53ef\u4ee5\u628a\u79df\u501f\u7684\u7535\u52a8\u8f66\u501f\u7ed9\u4ed6\u4eba\u5417\uff1f', a: '\u4e0d\u5efa\u8bae\u8f6c\u501f\uff0c\u8ba2\u5355\u8d23\u4efb\u7531\u4e0b\u5355\u8d26\u53f7\u627f\u62c5\uff0c\u8f6c\u501f\u4f1a\u5f71\u54cd\u4fdd\u969c\u548c\u7406\u8d54\u3002' }
    ],
    chatMessages: []
  },

  onPullDownRefresh() {
    this.setData({ showQuestions: true });
    wx.stopPullDownRefresh();
  },

  scrollToMessage(messageId) {
    this.setData({ toView: `msg-${messageId}` });
  },

  tapQuestion(e) {
    const question = e.currentTarget.dataset.question || '\u8be5\u95ee\u9898';
    const answer = e.currentTarget.dataset.answer || '\u5df2\u6536\u5230\uff0c\u5ba2\u670d\u4f1a\u5c3d\u5feb\u5904\u7406\u3002';
    const now = Date.now();
    const lastId = `${now}-a`;
    this.setData({
      chatMessages: [
        ...this.data.chatMessages,
        { id: `${now}-q`, role: 'user', text: question },
        { id: lastId, role: 'service', text: answer }
      ]
    }, () => {
      this.scrollToMessage(lastId);
    });
  },

  viewAll() {
    wx.showToast({
      title: '\u5f53\u524d\u5c55\u793a\u5e38\u89c1\u95ee\u9898\uff0c\u53ef\u76f4\u63a5\u70b9\u51fb\u63d0\u95ee',
      icon: 'none'
    });
  },

  onInput(e) {
    this.setData({
      inputText: (e && e.detail && e.detail.value) || ''
    });
  },

  sendInputMessage() {
    const text = String(this.data.inputText || '').trim();
    if (!text) {
      this.setData({ inputFocus: true });
      return;
    }

    const now = Date.now();
    const lastId = `${now}-custom-a`;
    this.setData({
      chatMessages: [
        ...this.data.chatMessages,
        { id: `${now}-custom-q`, role: 'user', text },
        { id: lastId, role: 'service', text: '\u60a8\u597d\uff0c\u5df2\u6536\u5230\u60a8\u7684\u95ee\u9898\uff0c\u6211\u4eec\u4f1a\u5c3d\u5feb\u56de\u590d\u60a8\u3002' }
      ],
      inputText: '',
      inputFocus: false
    }, () => {
      this.scrollToMessage(lastId);
    });
  }
});
