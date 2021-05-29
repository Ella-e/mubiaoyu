// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//获得数据库连接
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  return await db.collection("bigGoal").add({
    data:{
      openid: wxContext.OPENID,
      bGname:event.goalName,
      expectPercent:event.predictRate,
      beginDate:event.beginDate,
      endDate:event.predictDate,
      useropenid:event.useropenid,
      allday:event.allday,
      fishKind:event.fishKind,
      fishUrl:event.fishUrl,
      state:0,//完成状态：0-未完成，1-已完成，2-失败
      smallGoal:[],//
      doday:0,//
      summary:[]//

    }
  }).then(res=>{
    console.log(res)
  }).catch(console.error)

}