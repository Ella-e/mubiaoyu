// pages/setting/setting.js
const app = getApp()
var start_clientX;
var end_clientX;
var util = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowWidth: wx.getSystemInfoSync().windowWidth,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  }, 
  // 滑动开始
  touchstart: function (e) {
    start_clientX = e.changedTouches[0].clientX
  },
  // 滑动结束
  touchend: function (e) {
    end_clientX = e.changedTouches[0].clientX;
    if (end_clientX - start_clientX > 120) {
      this.setData({
        display: "block",
        translate: 'transform: translateX(' + this.data.windowWidth * 0.7 + 'px);'
      })
    } else if (start_clientX - end_clientX > 0) {
      this.setData({
        display: "none",
        translate: ''
      })
    }
  },
  // 头像
  showview: function () {
    this.setData({
      display: "block",
      translate: 'transform: translateX(' + this.data.windowWidth * 0.7 + 'px);'
    })
  },
  // 遮拦
  hideview: function () {
    this.setData({
      display: "none",
      translate: '',
    })
  },

  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  //去往帮助页面
  goHelp:function(){
    wx.redirectTo({
      url: '../help/help',
    })
  },

  //去往首页
  goIndex:function(){
    wx.redirectTo({
      url: '../index/index',
    })
  },

  //去往设置页面
  goSetting:function(){
    wx.redirectTo({
      url: '../setting/setting',
    })
  },
  //去往反馈页面
  goContact:function(){
    wx.redirectTo({
      url: '../contactUs/contactUs',
    })
  },
  //去往足迹页面
  goFoot:function(){
    wx.redirectTo({
      url: '../footprint/footprint',
    })
  },

  //计算allDay
  getAllDay(){
    //查询用户的开始时间
    wx.cloud.callFunction({
      name:"addOneUser",
      data:{
        i:1
      },
      success:res=>{
        var beginDate = new Date(res.result.data[0].beginDate.replace(/-/g,"/"))
        var tempToday = new Date(this.data.today.replace(/-/g,"/"))
        var allDay = (tempToday-beginDate)/(1000*60*60*24)+1
        this.setData({
          userAllDay:allDay
        })
      }
    })
    //用today-开始时间得到全部天数
    //把全部天数set到data里
  },

  //获得今天
  getToday(){
    var date = new Date()
    var today = util.formatDate(date);
    this.setData({
      today:today
    })
    this.getAllDay();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获得用户名和用户头像
    this.setData({
      nickName:app.globalData.nickName,
      img:app.globalData.img
    })

    this.getToday();
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})