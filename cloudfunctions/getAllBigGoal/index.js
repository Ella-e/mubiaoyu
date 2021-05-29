// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if(event.i==0){
    return await db.collection("bigGoal").where({
      useropenid:wxContext.OPENID,
      state:0
    }).get()
  }else if(event.i==1){
    return await db.collection("bigGoal").where({
      useropenid:wxContext.OPENID,
      state:1
    }).get()
  }else if(event.i==2){
    //将状态码设为2
    return await db.collection("bigGoal").where({
      useropenid:wxContext.OPENID,
      _id:event.bgId
    }).update({
      data:{
        state:2
      }
    })
  }else if(event.i==3){
    //将状态码设为1
    db.collection("bigGoal").where({
      useropenid:wxContext.OPENID,
      _id:event.bgId
    }).update({
      data:{
        state:1
      }
    })
  }else if(event.i==4){
    //得到所有未完成的大目标
    return await db.collection("bigGoal").where({
      useropenid:wxContext.OPENID,
      state:2
    }).get()
  }
  

}