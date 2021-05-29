// pages/breakBigGoal/breakBigGoal.js
var util = require("../../utils/util.js");
const db = wx.cloud.database()
const app = getApp()
const servicemarket = wx.serviceMarket
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //触摸开始时间
    touchStartTime:0,
    //触摸结束时间
    touchEndTime:0,
    //最后一次点击事件点击发生的时间
    lastTapTime:0,
    //控制展示使用手册的变量
    isshowRule:false
  },

  //调用珊珊安全检测
  doMsgSecCheck(e){
    servicemarket.invokeService({
      service: 'wxee446d7507c68b11',
      api: 'msgSecCheck',
      data: {
        "Action": "TextApproval",
        "Text":e
      },
    }).then(res => {

    })
  },

  //改变使用手册变量的函数
  showRule:function(){
    this.setData({
      isshowRule:!this.data.isshowRule
    })
    console.log(this.data.isshowRule)
  },

  //触摸时间的函数
  //按钮触摸开始触发的事件
  touchStart:function(e){
    this.setData({
      touchStartTime:e.timeStamp
    })
  },

  //按钮触摸结束触发的事件
  touchEnd:function(e){
    this.setData({
      touchEndTime:e.timeStamp
    })
  },

  //获得今日日期
  setToday(){
    var date = new Date();
    var today = util.formatDate(date);
    this.setData({
      today:today
    })
    //查询是否有今天录入的record，如果有，doOrNot==2，如果没有，doOrNot==0
    this.findRecordByDate();
  },

  //填写每日记录的函数
  record(e){
    var that = this
    //首先判断是单击还是双击
    //当前点击的时间
    var currentTime = e.timeStamp
    var lastTapTime = that.data.lastTapTime
    //更新最后一次点击事件
    that.setData({
      lastTapTime:currentTime
    })
    //如果两次点击时间在300ms内，则认为是双击事件
    if(currentTime-lastTapTime<300){
      //展示弹窗
      this.setData({
        doubleShowConfirm:true,
        currentTarget:e.currentTarget.dataset.id//绑定当前小目标id
      })
    }
  },

  //添加doday
  addDoDay(){
    //如果今天有打卡，给对应大目标的doday+1
    //查询数据库里日期是今天的记录，如果有
    wx.cloud.callFunction({
      name:"addDoDay",
      data:{
        bgId:this.data.bigGoalId
      },
      success:res=>{
        console.log(res)
      }
    })
  },

  //双击事件-提交弹窗里的每日记录
  submitRecord(e){
    servicemarket.invokeService({
      service: 'wxee446d7507c68b11',
      api: 'msgSecCheck',
      data: {
        "Action": "TextApproval",
        "Text":e.detail.value.content
      },
    }).then(res => {
      if(JSON.parse(res.data).Response.EvilTokens[0]==null){
      //大目标id,小目标orderId,今日日期,
      wx.cloud.callFunction({
        name:"addAndFindRecord",
        data:{
          bgId:this.data.bigGoalId,
          orderId:this.data.currentTarget,
          content:e.detail.value.content,
          doHour:e.detail.value.doHour,
          date:this.data.today,
          i:0
        },
        success:res=>{
          //显示加载中
          wx.showLoading({
            title: '加载中',
            icon:'loading',
            duration:8000
          })
          //doOrNot如果等于0，就把该大目标的doday+1,并把doOrNot设为2
          console.log(this.data.doOrNot)
          if(this.data.doOrNot==0){
            this.addDoDay();
            this.setData({
              doOrNot:2
            })
          }
          //关闭当前弹窗
          this.setData({
            doubleShowConfirm:false
          })
          //添加record成功，积分+3
          //添加完积分判断用户是否符合升级条件
          this.addRecordSuccess(3);
          //this.updateUserLevel();
        }
      })
    }else{
      wx.showToast({
          title: '您输入的言论涉及敏感词汇',
          icon:'none',
          duration:3000
      })
    }
    })
  },

  //添加积分函数
  addRecordSuccess(e){
    console.log(app.globalData.openid)
    //连接数据库查询用户积分自增3
    wx.cloud.callFunction({
      name:"addRecordSuccess",
      data:{
        i:0,
        point:e,
        openid:app.globalData.openid
      },
      success:res=>{
        wx.hideLoading({
          success: (res) => {
            //弹窗提示提交成功，可以在我的-足迹里查看每日目标完成记录
            wx.showToast({
              title: '提交成功，积分+3，可以在我的-足迹里查看每日目标完成记录',
              icon:'none',
              duration:3000
            })
            this.updateUserLevel();
          },
        })
        
      }
    })
  },

  //根据积分更新等级
  updateUserLevel(){
    //根据积分判断等级
        //获得当前积分
        wx.cloud.callFunction({
          name:"addRecordSuccess",
          data:{
            i:2,
            openid:app.globalData.openid
          },
          success:res=>{
            console.log(res)
            console.log(res.result.data[0].level)
            console.log(Math.floor(res.result.data[0].point/100)+1)
            //根据积分point判断level是多少，level=point/100
            var oldLevel = res.result.data[0].level 
            var currentLevel = Math.floor(res.result.data[0].point/100)+1
            if(currentLevel-oldLevel==1){
              //升级了，弹窗提示，并且更新等级
              wx.cloud.callFunction({
                name:"addRecordSuccess",
                data:{
                  i:1,
                  level:currentLevel,
                  openid:app.globalData.openid
                },
                success:res=>{
                  console.log(res)
                    wx.showToast({
                      title: '恭喜您升级了！',
                      icon:'none',
                      duration:2000
                    })
                }
              })
            }
          }
        })
  },


  //时间选择器
  bindDateChange:function(e){
    this.setData({
      date:e.detail.value
    })
  },

  //添加小目标
  addSG(e){
    servicemarket.invokeService({
      service: 'wxee446d7507c68b11',
      api: 'msgSecCheck',
      data: {
        "Action": "TextApproval",
        "Text":e.detail.value.sgName
      },
    }).then(res => {
    if(JSON.parse(res.data).Response.EvilTokens[0]==null){
      wx.cloud.callFunction({
        name:"acudgSmallGoal",
        data:{
          sgName:e.detail.value.sgName,
          endDate:e.detail.value.predictDate,
          bgId:this.data.bigGoalId,
          orderId:this.data.currentTarget.id,
          i:4
        },
        success:res=>{
          wx.hideLoading({
            success: (res) => {
              //弹窗提示添加成功
              wx.showToast({
                title: '添加成功',
                icon:'success',
                duration:2000
              })
              console.log(res)
              this.setData({
                isShowConfirm:false
              })
              //加载所有小目标
              this.showSmallGoal();
            },
          })
        }
      })
    }else{
      wx.showToast({
        title: '您输入的言论涉及敏感词汇',
        icon:'none',
        duration:3000
      })
    }
    })
  },

  //添加小目标综合
  addSmallGoal:function(e){
      //第一次点击，执行要做的代码
      var that = this
      //判断表单是否符合提交条件
      if(""==e.detail.value.sgName){
        //如果小目标内容为空
        wx.showToast({
          title: '请输入您的小目标内容',
          icon:'none',
          duration:2000//持续时间
        })
      }else{
      //符合提交条件，判断是添加还是更新小目标
      //查询当前大目标的小目标，根据顺序id查是否已经有该id的小目标了
        wx.cloud.callFunction({
          name:"acudgSmallGoal",
          data:{
            bgId:this.data.bigGoalId,
            orderId:this.data.currentTarget.id,
            i:3
          },
          success:res=>{
            //如果结果的长度等于1说明已经有小目标了，使用修改函数
            console.log(res)
            if(res.result.total==1){
              //展示加载中图标
              wx.showLoading({
                title: '加载中',
                icon:'loading',
                duration:8000
              })
              //使用修改函数
              this.updateSmallGoal(e);
            }else{
              //展示加载中图标
              wx.showLoading({
                title: '加载中',
                icon:'loading',
                duration:8000
              })
              //使用添加函数
              this.addSG(e);
              
            }
          }
        }) 
      }
  },

  //修改小目标
  updateSmallGoal(e){
    servicemarket.invokeService({
      service: 'wxee446d7507c68b11',
      api: 'msgSecCheck',
      data: {
        "Action": "TextApproval",
        "Text":e.detail.value.sgName
      },
    }).then(res => {
    if(JSON.parse(res.data).Response.EvilTokens[0]==null){
      wx.cloud.callFunction({
        name:"acudgSmallGoal",
        data:{
          bgId:this.data.bigGoalId,
          orderId:this.data.currentTarget.id,
          newName:e.detail.value.sgName,
          newEndDate:e.detail.value.predictDate,
          i:2
        },
        success:res=>{
          //关掉加载窗口
          wx.hideLoading({
            success: (res) => {
              //弹窗提示修改成功
              wx.showToast({
                title: '修改成功',
                icon:'success',
                duration:2000
              })
              this.setData({
                isShowConfirm:false
              })
              //加载所有小目标
              this.showSmallGoal();
            },
          })
        }
      })
    }else{
      wx.showToast({
        title: '您输入的言论涉及敏感词汇',
        icon:'none',
        duration:3000
      })
    }
  })
  },

  //弹窗提示是否删除小目标
  delPop(e){
    this.setData({
      currentTarget:e.currentTarget.dataset
    })
    var that = this
    wx.showModal({
      title:'提示',
      content:'您确定要删除该小目标吗',
      cancelColor: 'cancelColor',
      showCancel:true,
      success:function(res){
        if(res.confirm){
          //显示加载框
          wx.showLoading({
            title: '加载中',
            icon:'loading',
            duration:8000
          })
          //用户点击确定，调用删除函数
          that.deleteSmallGoal();
          
        }else{
          //用户点击取消，什么都不做
        }
      }
    })
  },

  deleteSmallGoal(){
    //删除小目标
    wx.cloud.callFunction({
      name:"acudgSmallGoal",
      data:{
        bgId:this.data.bigGoalId,
        orderId:this.data.currentTarget.id,
        i:1
      },
      success:res=>{
        wx.hideLoading({
          success: (res) => {
            //提示删除成功
            wx.showToast({
              title: '删除成功',
              icon:'success',
              duration:2000
            })
            //调用显示页面数据的函数
            //加载所有小目标
            this.showSmallGoal();
          },
        })
        
        
      }
    })
  },

  //显示小目标
  showSmallGoal(){
    this.setData({
      sg1:"",
      d1:"",
      sg2:"",
      d2:"",
      sg3:"",
      d3:"",
      sg4:"",
      d4:"",
      sg5:"",
      d5:"",
      sg6:"",
      d6:"",
      sg7:"",
      d7:""
    })
    //获取当前大目标下所有小目标
    wx.cloud.callFunction({
      name:"acudgSmallGoal",
      data:{
        bgId:this.data.bigGoalId,
        i:0
      },
      success:res=>{
        var smallGoals = res.result.data
        console.log(res.result.data)
        for(var i=0;i<smallGoals.length;i++){
          console.log(smallGoals[i].orderId)
          if(smallGoals[i].orderId==1){
            this.setData({
              sg1:smallGoals[i].sgName,
              d1:smallGoals[i].endDate
            })
          }else if(smallGoals[i].orderId==2){
            this.setData({
              sg2:smallGoals[i].sgName,
              d2:smallGoals[i].endDate
            })
          }else if(smallGoals[i].orderId==3){
            this.setData({
              sg3:smallGoals[i].sgName,
              d3:smallGoals[i].endDate
            })
          }else if(smallGoals[i].orderId==4){
            this.setData({
              sg4:smallGoals[i].sgName,
              d4:smallGoals[i].endDate
            })
          }else if(smallGoals[i].orderId==5){
            this.setData({
              sg5:smallGoals[i].sgName,
              d5:smallGoals[i].endDate
            })
          }else if(smallGoals[i].orderId==6){
            this.setData({
              sg6:smallGoals[i].sgName,
              d6:smallGoals[i].endDate
            })
          }else{
            this.setData({
              sg7:smallGoals[i].sgName,
              d7:smallGoals[i].endDate
            })
          }
        }
      }
    })
    //通过小目标的orderId设置隐藏或显示

  },

  //检查当前大目标的状态
  checkSate(){
    //获得大目标的结束时间和今天
    var bgEndDate = Date.parse(new Date(this.data.bgEndDate.replace(/-/g,"/")));
    var today = Date.parse(new Date(this.data.today.replace(/-/g,"/")));
    //判断大目标是否结束
    if(today-bgEndDate>0){
      //表示大目标已结束，计算actualPercent，判断大目标是完成了还是没完成还是失败
      var actualPercent = this.data.doday/this.data.allday*100;
      var expectPercent = this.data.expectPercent;
      console.log(actualPercent)
      console.log(expectPercent)
      if(actualPercent<expectPercent){
        var that = this
        //大目标没有完成，将状态码设为2
        wx.cloud.callFunction({
          name:"getAllBigGoal",
          data:{
            i:2,
            bgId:this.data.bigGoalId
          },
          success:res=>{
            console.log(res)
            wx.showToast({
              title: '很遗憾，您没有完成该大目标',
              icon:'none',
              duration:2000
            })
            //跳到写总结的页面
            setTimeout(function(){
              wx.navigateTo({
                url: '../completeBigGoal/completeBigGoal?goalId='+that.data.bigGoalId+'&state=2',
              })
            },2000)
          } 
        })    
      }else{
        var that = this
        //大目标完成了，将状态码设为1
        wx.cloud.callFunction({
          name:"getAllBigGoal",
          data:{
            i:3,
            bgId:this.data.bigGoalId
          },
          success:res=>{
            console.log(res)
            wx.showToast({
            title: 'Yeah! 您完成了该大目标',
            icon:'none',
            duration:2000
            })
          //跳到写总结的页面
          //跳到写总结的页面
            setTimeout(function(){
            wx.navigateTo({
              url: '../completeBigGoal/completeBigGoal?goalId='+that.data.bigGoalId+'&state=1',
              })
            },2000)
            // that.getAllBigGoal();
          }
        }) 
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      bigGoalId:options.goalId
    })
    console.log(this.data.bigGoalId)

    this.getBigGoalById(options.goalId);
    this.showSmallGoal();
    this.setToday();
    
    
  },

  //查询是否有今天录入的record，如果有，doOrNot==2，如果没有，doOrNot==0
  findRecordByDate:function(){
    console.log(this.data.bigGoalId)
    console.log(this.data.today)
    wx.cloud.callFunction({
      name:"addAndFindRecord",
      data:{
        bgId:this.data.bigGoalId,
        date:this.data.today,
        i:1
      },
      success:res=>{
        console.log(res);
        //console.log(res.total)
        if(res.result.total>0){
          this.setData({
            doOrNot:2
          })
        }else{
          this.setData({
            doOrNot:0
          })
        }
      }
    })
  },

  //点击修改跳出弹窗
  addGoalPop(e){
    this.setData({
      isShowConfirm:true,
      currentTarget:e.currentTarget.dataset
    })
  },

  //退出弹窗
  cancel(){
    this.setData({
      isShowConfirm:false,
      doubleShowConfirm:false
    })
  },

  //根据id查询当前大目标
  getBigGoalById(e){
    wx.cloud.callFunction({
      name:"getBigGoalById",
      data:{
        goalId:e
      },
      success:res=>{
        this.setData({
          bgName:res.result.data[0].bGname,
          bgBeginDate:res.result.data[0].beginDate,
          bgEndDate:res.result.data[0].endDate,
          date:res.result.data[0].beginDate,
          doday:res.result.data[0].doday,
          allday:res.result.data[0].allday,
          expectPercent:res.result.data[0].expectPercent
        })
        this.checkSate();
        
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

  },

  //去首页
  goIndex(){
    wx.redirectTo({
      url: '../index/index'
    })
  }
})