// 云函数入口文件
const cloud = require('wx-server-sdk')
const CloudBase = require("@cloudbase/manager-node");

cloud.init()


const { storage } = new CloudBase({
  // secretId: "Your SecretId",
  // secretKey: "Your SecretKey",
  envId: "dev-3gnk1mwt2797f6aa", // 云开发环境ID，可在腾讯云云开发控制台获取
});

async function test() {
  const res3 = await storage.listDirectoryFiles("/apple/");
  const res4 = await storage.listDirectoryFiles("apple/");
  const res5 = await storage.listDirectoryFiles("/");
  const res1 = await storage.listDirectoryFiles("6465-dev-3gnk1mwt2797f6aa-1300509077/");
  const res2 = await storage.listDirectoryFiles("6465-dev-3gnk1mwt2797f6aa-1300509077/apple");
  // for (let item in res1) {
  //   console.log(item);
  // }
  console.log(res1, res2, res3, res4, res5);
  // return res1
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const res = await cloud.getOpenData({
    list: [event.cloudID], // 假设 event.openData.list 是一个 CloudID 字符串列表
  })
  // test()
  // console.log(context);
  return {
    event,
    // context,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    info: res
  }
}