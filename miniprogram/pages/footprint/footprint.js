// pages/footprint/footprint.js
const app = getApp()
var start_clientX;
var end_clientX;
var util = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isshow:false,
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

  //改变规则说明的状态
  changeShow(){
    this.setData({
      isshow:!this.data.isshow
    })
  },

  //查询到所有正在进行的大目标
  getProgressingBg(){
    wx.cloud.callFunction({
      name:"getAllBigGoal",
      data:{
        i:0
      },
      success:res=>{
        this.setData({
          progressingBg:res.result.data
        })
      }
    })
  },

  //查询所有已完成的大目标
  getDoneBg(){
    wx.cloud.callFunction({
      name:"getAllBigGoal",
      data:{
        i:1
      },
      success:res=>{
        this.setData({
          doneBg:res.result.data
        })
        this.getAllFish();
      }
    })
  },

  //获得所有失败了的大目标
  getAllFailBigGoal(){
    wx.cloud.callFunction({
      name:"getAllBigGoal",
      data:{
        i:4
      },
      success:res=>{
        this.setData({
          unDoneBg:res.result.data
        })
      }
    })
  },

  //得到所有的鱼
  getAllFish(){
    wx.cloud.callFunction({
      name:"getFish",
      data:{
        i:1
      },
      success:res=>{
        var showFishArr = new Array()
        var fishArr = res.result.data;
        var fishKindArr = new Array()
        for(var i=0;i<fishArr.length;i++){
          fishKindArr.push(fishArr[i].kind)
        }
        var bgArr = this.data.doneBg;
        var bgKindArr = new Array()
        for(var j=0;j<bgArr.length;j++){
          bgKindArr.push(bgArr[j].fishUrl)
        }
        for(var k=0;k<fishKindArr.length;k++){
          if(bgKindArr.indexOf(fishKindArr[k])!=-1){
            //代表用户有这个鱼，添加到showFishArr里
            showFishArr.push(fishKindArr[k])
          }else{
            //代表用户没有这个鱼
            showFishArr.push("/images/unKnown.jpg")
          }
        }
        this.setData({
          showFishArr:showFishArr
        })
      }
    })
  },

  //展示鱼的简介
  showInfo(e){
    //根据url查询鱼
    if(e.currentTarget.dataset.url!="/images/unKnown.jpg"){
      //有这种鱼类简介，数据库查询
      wx.cloud.callFunction({
        name:"getFish",
        data:{
          i:2,
          url:e.currentTarget.dataset.url
        },
        success:res=>{
          //把得到的鱼的信息放到data里
          this.setData({
            fishName:res.result.data[0].fishname,
            fishIntro:res.result.data[0].intro,
            fishLevel:res.result.data[0].level
          })
        }
      })
    }else{
      //鱼没有解锁，信息放？？
      this.setData({
        fishName:"???",
        fishIntro:"???",
        fishLevel:"???"
      })
    }
  },

  //获得用户的等级和积分
  getPointAndLevel:function(){
    wx.cloud.callFunction({
      name:"addOneUser",
      data:{
        i:1
      },
      success:res=>{
        this.setData({
          level:res.result.data[0].level,
          point:res.result.data[0].point
        })
      }
    })
  },

  //
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getProgressingBg();
    this.getDoneBg();
    this.getAllFailBigGoal();
    this.getPointAndLevel();

    //获得用户名和用户头像
    this.setData({
      nickName:app.globalData.nickName,
      img:app.globalData.img
    })

    this.getToday();
    
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getProgressingBg();
    this.getDoneBg();
    this.getAllFailBigGoal();
    this.getPointAndLevel();

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
      url: '../index/index?login=1',
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
  }
})