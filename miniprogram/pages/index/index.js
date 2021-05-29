//index.js
const app = getApp();
//获取应用实例
var start_clientX;
var end_clientX;
var util = require("../../utils/util.js");

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    windowWidth: wx.getSystemInfoSync().windowWidth,
    userInfo: {},
    hasUserInfo: false,
    //判断小程序的API,回调，参数，组件等是否在当前版本可用
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide:true,
    showMask:false,
    showMask2:false,
    dologin:true,
    home:false
  },

  //展示登录页面
  dologin(){
    this.setData({
      dologin:false,
      isHide:true,
      home:true
    })
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

  onLoad: function(options) {
    var that = this;
    this.setData({
      login:options.login
    })

     //查看是否授权
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              //给用户信息的全局变量赋值
              app.globalData.nickName = res.userInfo.nickName;
              app.globalData.img = res.userInfo.avatarUrl;
              //将全局变量设置到这个页面里
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
                nickName:app.globalData.nickName,
                img:app.globalData.img
              })
              //获得oppenid
              this.onGetOpenid();
            }
          })
        }else{
          //用户没有授权
          //改变isHide的值，显示授权页面
          this.setData({
            isHide:!this.data.isHide
          })
        }
      }
    })
    
    //获得今天的日期
    this.getToday();

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //获得oppenid
    //this.onGetOpenid();
    //获得今天的日期
    this.getToday();
  },

  //得到用户信息
  bindGetUserInfo: function(e) {
    if(e.detail.userInfo){
      //用户按了允许授权按钮
      var that = this;
      //获取到用户的信息了
      console.log(e.detail.userInfo)
      app.globalData.nickName = e.detail.userInfo.nickName;
      app.globalData.img = e.detail.userInfo.avatarUrl;
      this.setData({
        nickName:app.globalData.nickName,
        img:app.globalData.img
      })
      //获得oppenid
      this.onGetOpenid();
      //隐藏授权页面,显示首页
      this.setData({
        dologin:true,
        home:false
      })
    }else{
      //用户按了拒绝按钮
      var that = this;
      wx.showModal({
        title:"警告",
        content:"您点击了拒绝授权，将只能体验目标鱼小程序",
        showCancel:false,
        confirmText:"返回首页",
        success:function(res){
          //用户没有授权成功，不需要改变isHide的值
          if(res.confirm){
            that.setData({
              dologin:true,
              isHide:false,
              home:false
            })
            

          }
        }
      })
    }
  },

  //获得今天
  getToday(){
    var date = new Date()
    var today = util.formatDate(date);
    this.setData({
      today:today
    })
  },

  //使用云函数删除大目标
  delBg(e){
    wx.cloud.callFunction({
      name:"deleteBigGoal",
      data:{
        bgId:e.currentTarget.dataset.id
      },
      success:res=>{
        wx.hideLoading({
          success: (res) => {
            //删除成功，弹窗提示
            wx.showToast({
              title: '删除成功',
              icon:'success',
              duration:2000
            })
            //login变成1
            this.setData({
              login:1
            })
            //调用加载当前所有大目标
            this.getAllBigGoal();
            this.onShow();
          },
        })
        
      }
    })
  },

  //删除大目标
  delBigGoal(e){
    var that = this
    //弹出弹窗询问是否删除该大目标
    wx.showModal({
      showCancel:true,
      title:'提示',
      content:'是否删除该大目标',
      success:function(res){
        if(res.confirm){
          //确定删除大目标
          //判断当前大目标下小目标数量为0才可以删除大目标
          wx.cloud.callFunction({
            name:"countSmallGoal",
            data:{
              bgId:e.currentTarget.dataset.id
            },
            success:res=>{
              if(res.result.total==0){
                wx.showLoading({
                  title: '加载中',
                  icon:'loading',
                  duration:8000
                })
                //可以删除大目标
                that.delBg(e);
              }else{
                //不可删除大目标
                wx.showToast({
                  title: '当前大目标下还有小目标，请先删除所有小目标',
                  icon:'none',
                  duration:3000
                })
              }
            }
          })
        }else{
          //点击取消，什么都不做
        }
      }
    })
    
  },

  //查询所有正在进行的大目标
  getAllBigGoal:function(){
    wx.cloud.callFunction({
      name:"getAllBigGoal",
      data:{
        openid:app.globalData.openid,
        i:0
      },
      success:res=>{
        console.log(res)
        this.setData({
          bigGoalArr:res.result.data
        })
        //得到所有的鱼
        this.getFish();
      }
    })
  },



  //将用户信息存到数据库里
  saveUser:function(e){
    console.log(this.data.nickName)
    //判断用户是否是初次登陆-数据库里有没有该用户的oppenid
    wx.cloud.callFunction({
      name:"getAllUser",
      success:res=>{
        console.log(res)
        //循环遍历所有openid判断是否与登录用户一致
        var allUser = res.result.data
        //创建一个帮助判断的变量
        var temp = 0
        for(var i=0;i<allUser.length;i++){
          if(allUser[i].openid==e){
            //如果有一致的-将temp设为1，不需要添加用户
            temp=1
          }
        }
        //如果temp==0，需要添加用户
        if(temp==0){
          console.log(this.data.nickName)
          wx.cloud.callFunction({
            name:"addOneUser",
            data:{
              i:0,
              openid:e,
              username:this.data.nickName,
              beginDate:this.data.today
              },
            success:res=>{
              console.log(res)
              this.getAllDay();
              //把用户首次登入的向导打开
              this.setData({
                showMask:true
              })
            }
          })
        }else{
          //有用户了，计算总天数
          //得到坚持的日子
          this.getAllDay();
          if(this.data.login!=1){
            this.setData({
              showMask2:true
            })
          }
        }
      }
    })
    //是-将信息存到数据库里
    //不一致-首次登录-添加用户
    //一致，判断需不需要升级
    //如果需要升级，将升级信息存到数据库里
    //如果不需要升级，保持不变
  },

  hideMask(){
    this.setData({
      showMask:false
    })
  },

  hideMask2(){
    this.setData({
      showMask2:false
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

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },


  //根据大目标的鱼的种类得到鱼的图片
  getFish:function(){
    var myFishArr = new Array()
    if(this.data.bigGoalArr.length==0){
      this.setData({
        myFishArr:[]
      })
    }else{
      //得到所有大目标的鱼的种类
      for(var i=0;i<this.data.bigGoalArr.length;i++){
        var fishUrl = this.data.bigGoalArr[i].fishUrl
        var bigGoalId = this.data.bigGoalArr[i]._id
        var bigGoalName = this.data.bigGoalArr[i].bGname
        var bigGoalCompRate = parseInt(this.data.bigGoalArr[i].doday/this.data.bigGoalArr[i].allday*100)
        var remainDays = (Date.parse(new Date(this.data.bigGoalArr[i].endDate.replace(/-/g,"/")))-Date.parse(new Date(this.data.today.replace(/-/g,"/"))))/(1000*60*60*24)+1
        //判断remainDays是否小于0
        if(remainDays<0){
          remainDays="目标已完成，请点击进入总结"
        }
        var oneFishArr = [bigGoalId,fishUrl,bigGoalName,bigGoalCompRate,remainDays]
        myFishArr.push(oneFishArr)
        this.setData({
          myFishArr:myFishArr
        })
        console.log(myFishArr)
      }
    }
    
    
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {
        userInfo:this.data.userInfo
      },
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        //得到当前用户的所有大目标
        this.getAllBigGoal();
        //将用户信息存到数据库里
        this.saveUser(app.globalData.openid);
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  

  //跳转创建大目标页面
  goMakeBigGoal:function(){
    //如果已经有三个大目标了，就不能再创建了
    if(this.data.bigGoalArr==undefined){
       //用户没有登录
       wx.showModal({
        title:"警告",
        content:"您还没有登录，信息将无法存到数据库中",
        showCancel:true,
        success(res){
          if(res.confirm){
            wx.navigateTo({
              //设置参数pass=0，说明没有登录
              url: '../makeBigGoal/makeBigGoal?pass=0'
            })
          }
        }
      })
    }else if(this.data.bigGoalArr.length==3){
      wx.showToast({
        title: '最多只能同时设置三个大目标',
        icon:'none',
        duration:3000//持续时间
      })
    }else{
      //可以创建大目标
      wx.navigateTo({
        url: '../makeBigGoal/makeBigGoal'
      })
    }
    
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
