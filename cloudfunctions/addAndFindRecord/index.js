// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log(wxContext.OPENID)
  if(event.i==0){
    return await db.collection("record").add({
      data:{
        bgId:event.bgId,
        sgOrderId:event.orderId,
        content:event.content,
        doHour:event.doHour,
        date:event.date,
        openid:wxContext.OPENID
      }
    })
  }else if(event.i==1){
    return await db.collection("record").where({
      bgId:event.bgId,
      date:event.date
    }).count()
  }else if(event.i==2){
    return await db.collection("record").where({
      bgId:event.bgId,
      date:event.date
    }).get()
  }
  
}