// pages/board_edit/index.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo: undefined,
    toptip: {
      msg: '',
      type: 'success',
      show: false
    },
    num: 0
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
    // console.log();
    this.setData({
      userinfo: {
        ...wx.getStorageSync('USERINFO'),
        _openid: ''
      }
    });
    this.updateNum()
  },
  updateNum() {
    db.collection('board').where({
      _openid: wx.getStorageSync('USERINFO')._openid,
      type: 'anonymous'
    }).get({
      success: (e) => {
        console.log(e);
        const num = 3 - e.data.length;
        this.setData({
          num: num > 0 ? num : 0,
        })
      }
    })
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  submit(e) {
    const {
      type
    } = e.detail.target.dataset;
    console.log(e);
    const {
      value
    } = e.detail;
    if (!value.content) {
      wx.showToast({
        title: '总要说点什么吧～',
        icon: 'none'
      })
    } else {
      if (type === 'anonymous' && !this.data.num) {
        wx.showToast({
          title: '次数有限，别搞了～',
          icon: 'none'
        })
        return false;
      }

      wx.showLoading({
        title: '上传中...',
      })
      db.collection('board').add({
        data: {
          // openid: this.data.openid,
          content: value.content,
          owner: this.data.userinfo, // 这里备案
          nickname: type === 'anonymous' ? this.getRandomName(2) : this.data.userinfo.nickname,
          avatar: type === 'anonymous' ? 'https://api.multiavatar.com/' + Math.random() + '.svg' : this.data.userinfo.avatar,
          update_time: new Date().getTime(),
          type
        },
        success: (res) => {
          this.updateNum();
          wx.hideLoading();
          this.setData({
            toptip: {
              msg: '牛哇，留言成功～ 不愧是你',
              type: 'success',
              show: true
            }
          })
        }
      })
    }
    console.log(type, value);
  },

  // 获取指定范围内的随机数
  randomAccess(min, max) {

    return Math.floor(Math.random() * (min - max) + max)
  },

  // 解码
  decodeUnicode(str) {

    //Unicode显示方式是\u4e00
    str = "\\u" + str
    str = str.replace(/\\/g, "%");
    //转换中文
    str = unescape(str);
    //将其他受影响的转换回原来
    str = str.replace(/%/g, "\\");
    return str;
  },

  /*
   *@param Number NameLength 要获取的名字长度
   */
  getRandomName(NameLength) {

    let name = ""
    for (let i = 0; i < NameLength; i++) {

      let unicodeNum = ""
      unicodeNum = this.randomAccess(0x4e00, 0x9fa5).toString(16)
      name += this.decodeUnicode(unicodeNum)
    }
    return name
  }
})