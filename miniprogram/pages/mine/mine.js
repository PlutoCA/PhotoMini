// pages/mine.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: defaultAvatarUrl,
    openId: '',
    newUser: true,
    nickname: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    const value = wx.getStorageSync('USERINFO')
    if (!value) {
      this.getOpenId();
    } else {
      this.setData({
        newUser: false,
        avatarUrl: value.avatar,
        nickname: value.nickname
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.getOpenId();
  },
 // 新用户判断
  getOpenId() {
    wx.showLoading({
      title: '',
    });
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getOpenId'
      }
    }).then((resp) => {
      console.log(resp);
      this.setData({
        // haveGetOpenId: true,
        openId: resp.result.openid
      });
      db.collection('user').where({
        _openid: resp.result.openid
      }).get({
        success: (res) => {
          console.log(res);
          const { data } = res
          if (!data.length || !data[0].avatar || !data[0].nickname) {
            // 未更新过信息
            console.log('当前是新用户');
            this.setData({
              newUser: true
            })
          } else {
            console.log('老用户');
            this.setData({
              newUser: false,
              avatarUrl: data[0].avatar,
              nickname: data[0].nickname
            })
            wx.setStorageSync('USERINFO', data[0])
          }
          wx.stopPullDownRefresh()
        },
        fail: (e) => {
          console.log('err', e);
        }
      })
      wx.hideLoading();
    }).catch((e) => {
      this.setData({
        showUploadTip: true
      });
      wx.hideLoading();
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  // 新增用户
  // 得先判断一下 openId是否已存在
  add(name) {
    wx.showLoading({ title: '更新中...', mask: true })
    wx.cloud.uploadFile({
      // 指定上传到的云路径
      cloudPath: 'avatar/' + this.data.avatarUrl.replace(/(.*\/)*([^.]+).*/ig, "$2"),
      // 指定要上传的文件的小程序临时文件路径
      filePath: this.data.avatarUrl
    }).then(res => {
      console.log('上传成功', res);
      db.collection('user').add({
        data: {
          openid: this.data.openid,
          avatar: res.fileID,
          nickname: name
        },
        success: (res) => {
          console.log(res, '新增用户成功');
          wx.hideLoading();
          this.getOpenId();
        }
      })
    }).catch((e) => {
      wx.hideLoading();
    });
  },
  submit(e) {
    console.log(e);
    const { nickname } = e.detail.value;
    if (this.data.newUser) this.add(nickname)
  },
  onChooseAvatar(e) {
    console.log(e);
    const {
      avatarUrl
    } = e.detail;
    this.setData({
      avatarUrl
    })
  },
  toUpload() {
    // 这里需要关闭入口 如果过时间的话
    wx.navigateTo({
      url: '/pages/uploadFile/index',
    })
  },
  toMyUpload() {
    wx.navigateTo({
      url: '/pages/myUpload/index',
    })
  }
})