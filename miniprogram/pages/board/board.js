// pages/board/board.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    page: 1,
    isEnd: false,
    tags: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // console.log(options);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // this.getList(1);
    this.setData({
      tags: wx.getStorageSync('USERINFO')?.tags || []
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getList(1);
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
    this.setData({
      isEnd: false,
      page: 1
    })
    this.getList(1)
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
  onClick(e){
    console.log(e);
    const { key, id } = e.currentTarget.dataset;
    const myId = wx.getStorageSync('USERINFO')._openid;
    if (key === myId) {
      wx.showActionSheet({
        itemList: ['删除'],
      }).then(() => {
        wx.showModal({
          content: '真删除了喔～'
        }).then((res) => {
          if (res.confirm) {
            db.collection('board').where({
              _id: id
            }).remove({
              success: (res) => {
                console.log(res);
                this.getList(1);
              }
            })
          }
        })
      })
    }
  },
  // 格式化时间
  time(time = +new Date()) {
    console.log(time);
    var date = new Date(time + 8 * 3600 * 1000);
    return date.toJSON().substr(0, 19).replace('T', ' ').replace(/-/g, '.');
  },
  getList(page = 1) {
    wx.showLoading({
      title: '正在加载～',
    })
    // db.collection('board').count().then(res => {
    //   console.log(res);
    // })
    db.collection('board')
      .skip(page * 20 - 20)
      // .limit(20) 小程序这边默认 limit 20
      .get({
        success: (res) => {
          // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
          // console.log(res.data[0].update_time.toLocaleString());
          const list = res.data.map((item) => ({
            ...item,
            update_time: this.time(item.update_time)
          }))
          console.log(list);
          this.setData({
            list: page === 1 ? list : this.data.list.concat(list)
          })
          if (page === 1) {
            wx.stopPullDownRefresh({
              success: (res) => {},
            })
          }
          if (res.data.length >= 20) { // 大于等于20 有下一页
            this.setData({
              page: this.data.page + 1
            })
          } else {
            this.setData({
              isEnd: true
            })
          }
          wx.hideLoading()
        },
        fail: (err) => {
          console.log(err, 'err');
          wx.hideLoading()
        }
      })
  },
  toEdit() {
    wx.navigateTo({
      url: '/pages/board_edit/index',
    })
  }
})