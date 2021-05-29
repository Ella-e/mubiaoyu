// pages/goalDetail/goalDetail.js
var util = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isshow:false,
    isshowsum:false
  },

  //展示小目标函数
  show:function(){
    this.setData({
      isshow:!this.data.isshow
    })
  },

  showsum:function(){
    this.setData({
      isshowsum:!this.data.isshowsum
    })
  },

  //得到今天
  getToday(){
    var date = new Date()
    var today = util.formatDate(date);
    this.setData({
      today:today
    })
  },

  //根据日期数组查找对应的record，存成数组，放到一起
  getRecord(){
    console.log(this.data.bgId)
    var dateAndRecord = new Array()
    var dates = this.data.allDate
    for(var i=0;i<dates.length;i++){
      //根据日期，大目标id查询对应record数组
      wx.cloud.callFunction({
        name:"addAndFindRecord",
        data:{
          i:2,
          date:dates[i],
          bgId:this.data.bgId
        },
        success:res=>{
          console.log(res)
          if(res.result.data!=''){
            var oneDateAndRecord = new Array()
            oneDateAndRecord.push(res.result.data[0].date)
            oneDateAndRecord.push(res.result.data)
            dateAndRecord.push(oneDateAndRecord)
            console.log(dateAndRecord)
            this.setData({
              dateAndRecord:dateAndRecord
            })
          }
        }
      })
    }
    
  },

  //得到所有小目标
  getAllSmallGoal(){
    wx.cloud.callFunction({
      name:"acudgSmallGoal",
      data:{
        bgId:this.data.bgId,
        i:0
      },
      success:res=>{
        this.setData({
          smallGoal:res.result.data
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    Date.prototype.format = function(){
      var s = '';
      var month = (this.getMonth()+1)>=10?(this.getMonth()+1):('0'+(this.getMonth()+1));
      var day = this.getDate()>=10?this.getDate():('0'+this.getDate());
      s+=this.getFullYear()+'-';//获取年份
      s+=month+'-';
      s+=day;
      return(s)
    }

    this.getToday();

    console.log(options.goalId)
    this.setData({
      bgId:options.goalId,
      bgBeginDate:options.beginDate,
      bgEndDate:options.endDate,
      recordEndDate:options.endDate,
      state:options.state,
      bgName:options.bgName,
      allday:options.allday,
      doday:options.doday,
      expectPercent:options.expectPercent,
      actualPercent:parseInt(options.doday/options.allday*100),
      goalSummary:options.summary
    })
    if(options.summary!=null){
      this.setData({
        goalSummary:options.summary.split(",")
      })
    }
    if(options.state==0){
      //目标未完成
      this.setData({
        recordEndDate:this.data.today
      })
    }
    this.getMyDate();
    this.getRecord();
    this.getAllSmallGoal();
    
  },

  

  //得到两个日期之间的所有天
  getMyDate:function(){
    var arr = [];
    var ab =  this.data.bgBeginDate.split("-");
    var ae = this.data.recordEndDate.split("-");
    var db = new Date();
    db.setUTCFullYear(ab[0], ab[1] - 1, ab[2]);
    var de = new Date();
    de.setUTCFullYear(ae[0], ae[1] - 1, ae[2]);
    var unixDb = db.getTime() - 24 * 60 * 60 * 1000;
    var unixDe = de.getTime() - 24 * 60 * 60 * 1000;
    for (var k = unixDb; k <= unixDe;) {
    //console.log((new Date(parseInt(k))).format());
      k = k + 24 * 60 * 60 * 1000;
      arr.push((new Date(parseInt(k))).format());
    }
    this.setData({
      allDate:arr
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})