// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if(event.i==0){
    return await db.collection("user").where({
      openid:event.openid
    }).update({
      data:{
        point:_.inc(event.point)
      }
    })
  }else if(event.i==1){
    return await db.collection("user").where({
      openid:event.openid
    }).update({
      data:{
        level:event.level
      }
    })
  }else{
    return await db.collection("user").where({
      openid:event.openid
    }).get()
  }
}