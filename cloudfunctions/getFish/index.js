// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if(event.i==0){
    return await db.collection("fish").where({
      level:event.level
    }).get()
  }else if(event.i==1){
    return await db.collection("fish").get()
  }else if(event.i==2){
    return await db.collection("fish").where({
      kind:event.url
    }).get()
  }
  
  
}