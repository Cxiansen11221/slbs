// pages/userInfo/renting/renting.js
const app = getApp()
import api from '../../../config/api'
import path from '../../../config/path'
const { $Message } = require('../../../dist/base/index');
const { $Toast } = require('../../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picLocal:app.globalData.picLocal,
    bikeList:[],
    pageData:{
      pageNo:1,
      pageSize:5,
      count:0
    },
    bottomLoading:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '我正在租',
    })
    let params = {
      pageNo:this.data.pageData.pageNo,
      pageSize:this.data.pageData.pageSize
    }
    //查询后端接口，找出我正在租的车辆列表
    api.post(path.path.findRentingBikePage,params).then(res=>{
      this.data.pageData.count = res.data.count;
      this.setData({
        bikeList:res.data.list,
        pageData:this.data.pageData
      })
    }).catch(err=>{
      console.log(err)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.bottomStart();
    //如果没有数据后
    if(this.data.pageData.count<(this.data.pageData.pageNo*this.data.pageData.pageSize)){
      $Toast({
        content:'没有更多数据了'
      })
      this.bottomEnd();
      return;
    }
    //页面触底之后加载第二页的数据加到第一页上去
    this.data.pageData.pageNo++;
    this.setData({
      pageData:this.data.pageData
    })
    let params = {
      pageNo:this.data.pageData.pageNo,
      pageSize:this.data.pageData.pageSize,
    }
    api.post(path.path.findRentingBikePage,params).then(res => {
      let getList = res.data.list;
      let oraginList = this.data.bikeList;
      getList.forEach((item)=>{
        oraginList.push(item)
      })
      this.setData({
        bikeList:oraginList
      })
      //将加载中去掉
      this.bottomEnd();
    }).catch(err => {
      console.log(err)
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  toBikeInfo(e){
    // console.log(e)
    wx.navigateTo({
      url: '../../index/bikeInfo/bikeInfo?id='+e.currentTarget.dataset.id,
    })
  },
  // 还车功能
  returnBike(e){
    const bikeId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '还车确认',
      content: '确定要归还这辆电动车吗？',
      confirmColor: '#d81e06',
      success: (res) => {
        if (res.confirm) {
          // 调用还车接口
          api.post('applyRent/returnBike', {bikeId: bikeId}).then(res => {
            if (res.code === '200') {
              $Message({
                content: '还车成功',
                type: 'success'
              });
              // 刷新页面
              this.onLoad();
            } else {
              $Message({
                content: res.message || '还车失败',
                type: 'error'
              });
            }
          }).catch(err => {
            console.log(err);
            $Message({
              content: '网络错误，请稍后重试',
              type: 'error'
            });
          });
        }
      }
    });
  },
  //底部加载
  bottomStart(){
    this.setData({
      bottomLoading:true
    })
  },
  //底部不加载
  bottomEnd(){
    this.setData({
      bottomLoading:false
    })
  },
})