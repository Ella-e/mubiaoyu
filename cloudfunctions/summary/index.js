// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if(event.i==0){
    //添加summary
    return await db.collection("bigGoal").where({
      _id:event.bgId
    }).update({
      data:{
        summary:event.summary
      }
    })
  }
}