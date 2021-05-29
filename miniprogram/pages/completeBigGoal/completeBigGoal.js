// pages/completeBigGoal/completeBigGoal.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showSuccess:false,
    showFail:false
  },

  //根据id查大目标
  getBg(){
    wx.cloud.callFunction({
      name:"getBigGoalById",
      data:{
        goalId:this.data.bgId
      },
      success:res=>{
        this.setData({
          bigGoal:res.result.data[0]
        })
      }
    })
  },

  //将总结添加到数据库里
  addBigGoalSummary(e){
    var summary = [e.detail.value.a1,e.detail.value.a2,e.detail.value.a3,e.detail.value.a4]
    console.log(summary)
    wx.cloud.callFunction({
      name:"summary",
      data:{
        i:0,
        bgId:this.data.bgId,
        summary:summary
      },
      success:res=>{
        console.log(res)
        //回到首页
        wx.redirectTo({
          url: '../index/index?login=1',
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      bgId:options.goalId,
      bgState:options.state
    })
    if(options.state==1){
      //大目标完成了，展示完成了回答的问题
      this.setData({
        showSuccess:true
      })
    }else{
      //大目标没有完成
      this.setData({
        showFail:true
      })
      
    }
    //得到当前大目标
    this.getBg();
    //提示当前页面不能返回，一定要一次性做完
    wx.showModal({
      showCancel:false,
      title:"提示",
      content:"一旦开始填写目标总结将不可返回",
      success: function (res){
        if(res.confirm){
          
        }
      }

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