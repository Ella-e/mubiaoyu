// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if(event.i==0){
    return await db.collection("user").add({
      data:{
        username:event.username,
        level:1,
        point:0,
        openid:event.openid,
        beginDate:event.beginDate
      }
    })
  }else if(event.i==1){
    return await db.collection("user").where({
      openid:wxContext.OPENID
    }).get()
  }
  

  
}