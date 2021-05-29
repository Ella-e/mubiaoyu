// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if(event.i==0){
    return await db.collection("smallGoal").where({
      bgId:event.bgId
    }).get()
  }else if(event.i==1){
    return await db.collection("smallGoal").where({
      bgId:event.bgId,
      orderId:event.orderId
    }).remove()
  }else if(event.i==2){
    return await db.collection("smallGoal").where({
      bgId:event.bgId,
      orderId:event.orderId
    }).update({
      data:{
        sgName:event.newName,
        endDate:event.newEndDate
      }
    })
  }else if(event.i==3){
    return await db.collection("smallGoal").where({
      bgId:event.bgId,
      orderId:event.orderId
    }).count()
  }else if(event.i==4){
    return await db.collection("smallGoal").add({
      data:{
        sgName:event.sgName,
        endDate:event.endDate,
        bgId:event.bgId,
        orderId:event.orderId,
        openid:wxContext.OPENID
      }
    })
  }
  
}