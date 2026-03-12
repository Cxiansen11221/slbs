// pages/apply/handle/handleViewApply.js
const app = getApp()
import api from '../../../config/api'
import path from '../../../config/path'
const { $Message } = require('../../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picLocal:app.globalData.picLocal,
    isHandle:0,
    viewApply:null,
    imageSetting:{
      indicatorDots:true,
      autoplay:true,
      interval:5000,
      duration:500
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //向后端发送接口，通过id查询一条申请的数据
    let params = {
      id:options.id
    }
    api.post(path.path.getViewApply,params).then(res=>{
      this.setData({
        viewApply:res.data
      })
      console.log(this.data.viewApply)
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
    //在页面关掉之前，如果是状态为1的申请，那么在用户浏览之后将它的状态设置为已结束
    if(this.data.viewApply.state==1){
      let params = {
        id:this.data.viewApply.id,
        state:5,
      }
      api.post(path.path.saveViewApply,params).then(res=>{
        // console.log(res)
      }).catch(err=>{
        console.log(err)
      })
    }
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  agree(){
    var that = this;
    //如果用户同意再次预约的看车时间
    wx.showModal({
      title:'提示',
      content:'确定同意再次预约的看车时间吗？',
      cancelColor: '#d81e06',
      success(res){
        if(res.confirm){
          let params = {
            id:that.data.viewApply.id,
            state:6
          }
          //向后端发送请求，
          api.post(path.path.saveViewApply,params).then(res=>{
            if(res.code=='200'){
              $Message({
                content:'操作成功',
                type:'success'
              })
              //跳转回页面
              wx.switchTab({
                url: '/pages/apply/apply',
              })
            }
          }).catch(err=>{
            console.log(err)
          })
        }else if(res.cancel){
          $Message({
            content:'操作取消',
          })
          wx.switchTab({
            url: '/pages/apply/apply',
          })
        }
      }
    })
    
  },
  disagree(){
    //如果用户不同意再次预约看车时间
    var that = this;
    wx.showModal({
      title:'提示',
      content:'确定拒绝再次预约的看车时间吗？',
      cancelColor: '#d81e06',
      success(res){
        if(res.confirm){
          let params = {
            id:that.data.viewApply.id,
            state:4
          }
          //向后端发送请求，
          api.post(path.path.saveViewApply,params).then(res=>{
            if(res.code=='200'){
              $Message({
                content:'操作成功',
                type:'success'
              })
              wx.switchTab({
                url: '/pages/apply/apply',
              })
            }
          }).catch(err=>{
            console.log(err)
          })
        }else if(res.cancel){
          $Message({
            content:'操作取消',
          })
          wx.switchTab({
            url: '/pages/apply/apply',
          })
        }
      }
    })
  }
})