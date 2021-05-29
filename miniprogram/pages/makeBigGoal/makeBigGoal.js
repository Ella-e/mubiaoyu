// pages/makeBigGoal/makeBigGoal.js
var util = require("../../utils/util.js");
const app = getApp()
const servicemarket = wx.serviceMarket

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  

  //时间选择器
  bindDateChange:function(e){
    this.setData({
      date:e.detail.value
    })
  },

  //存放开始和结束时间
  setStartandEndDate:function(){
    var date = new Date();
    var today = util.formatDate(date);
    var endDay = util.formatEndDate(date);
    this.setData({
      today:today,
      endDay:endDay
    })
  },

  //封装一个调用addBigGoal云函数的方法
  addBG2:function(e){
    //调用计算全部天数的函数
    this.calculateDate(e);
    wx.cloud.callFunction({
      name:"addBigGoal",
      data:{
        goalName:e.detail.value.goalName,
        predictDate:e.detail.value.predictDate,
        predictRate:e.detail.value.predictRate,
        beginDate:this.data.today,
        useropenid:app.globalData.openid,
        allday:this.data.allday,
        fishKind:this.data.fishKind,
        fishUrl:this.data.fishUrl
      },
      success:res=>{
        //隐藏加载中
        wx.hideLoading({
          success: (res) => {
            //弹窗提示添加成功
            wx.showToast({
              title: '添加大目标成功',
              icon:'none',
              duration:2000
            })
            wx.redirectTo({
              url: '../reminder/reminder?login=1',
            })
          },
        })
      }
    })  
  },

  //根据fishKind得到对应url
  getFishUrl(){
    wx.cloud.callFunction({
      name:"getFishById",
      data:{
        fishId:this.data.fishKind
      },
      success:res=>{
        this.setData({
          fishUrl:res.result.data[0].kind
        })
      }
    })
  },

  //提交表单，添加大目标
  addBigGoal:function(e){
      var that = this
      console.log(e.detail.value)
      //判断表单是否符合提交条件
      if(this.data.pass==0){
        //用户未登录
        wx.showToast({
          title: '您还未登录，不可以设置大目标哦~',
          icon:'none',
          duration:3000
        })
      }else{
      if(""==e.detail.value.goalName){
        //如果大目标名称为空
        wx.showToast({
          title: '请输入您的大目标名称',
          icon:'none',
          duration:2000//持续时间
        })
      }else if(e.detail.value.predictRate<60){
        wx.showModal({
          title:'提示',
          showCancel:true,
          content:'您确定要设置一个小于60%的完成度目标吗',
          success:function(res){
            if(res.confirm){
              wx.showLoading({
                title: '加载中',
                icon:'loading',
                duration:8000
              })
              that.addBG2(e)
            }else{
              //点击取消
              console.log("用户点击取消")
            }
          }
        })
      }else{
        servicemarket.invokeService({
          service: 'wxee446d7507c68b11',
          api: 'msgSecCheck',
          data: {
            "Action": "TextApproval",
            "Text":e.detail.value.goalName
          },
        }).then(res => {
        if(JSON.parse(res.data).Response.EvilTokens[0]==null){
          wx.showLoading({
            title: '加载中',
            icon:'loading',
            duration:8000
          })
          this.addBG2(e);
        }else{
          wx.showToast({
            title: '您输入的言论涉及敏感词汇',
            icon:'none',
            duration:3000
          })
        }
      })
      }
    }
    
  },


  //随机获取海洋生物类型函数
  getFish:function(){
    //获取当前用户等级
    wx.cloud.callFunction({
      name:"getLoginUser",
      data:{
        openid:app.globalData.openid
      },
      success:res=>{
        var level = res.result.data[0].level
        var fishLevel = 1;
        //根据当前用户等级查询所有适合他的鱼，返回array
        if(level<3){
          fishLevel = 1
        }else if(3<level<7){
          fishLevel = Math.floor(Math.random()*2)+1//1或者2
        }else{
          fishLevel = Math.floor(Math.random()*3)+1//1或者2或者3
        }
        console.log(fishLevel)
        wx.cloud.callFunction({
          name:"getFish",
          data:{
            level:fishLevel,
            i:0
          },
          success:res=>{
            console.log(res.result.data)
            //根据array的大小生成随机数，随机选取一个鱼
            var levelFish = Math.floor(Math.random()*res.result.data.length)
            this.setData({
              fishKind:res.result.data[levelFish].id
            })
            this.getFishUrl();
          }
        })
      }
    })
    //根据当前用户等级查询所有适合他的鱼，返回array
    //把选出来的鱼放到数据库里
  },

  //获得所有大目标

  //计算开始日期和结束日期间隔多少天
  calculateDate:function(e){
    //console.log(this.data.predictDate-this.data.beginDate);
     //首先准备两个日期
     var begin = this.data.today;
     var end = e.detail.value.predictDate;
     //日期字符串转化为日期对象
     var temp_begin = new Date(begin.replace(/-/g,"/"));
     var temp_end = new Date(end.replace(/-/g,"/"));
     //将两个日期转换成时间戳后做减法计算
     var day = Date.parse(temp_end)-Date.parse(temp_begin)
     //把秒换算成分+1天
     this.setData({
       allday:day/(1000*60*60*24)+1
     })

  },

  //回到首页
  returnToIndex(){
    wx.redirectTo({
      url: '../index/index?login=1',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setStartandEndDate();
    //给date设置一个初始值，为今天
    this.setData({
      date:util.formatDate(new Date()),
      pass:options.pass
    })
    this.getFish();
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