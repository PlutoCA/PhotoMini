// pages/index/index.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    images: [],
    page: 1,
    isEnd: false // 结束了 没有更多了
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log('当前是否有版本更新', res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.getImageList(this.data.page)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.setData({
      isEnd: false,
      page: 1
    })
    this.getImageList(1)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (!this.data.isEnd) {
      this.getImageList(this.data.page)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '这里有个靓仔快来康康~'
    }
  },
  getImageList(page = 1) {
    wx.showLoading({
      title: '正在加载～',
    })
    db.collection('album').count().then(res => {
      console.log(res);
    })
    db.collection('album')
      .skip(page * 20 - 20)
      // .limit(20) 小程序这边默认 limit 20
      .get({
        success: (res) => {
          // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
          console.log(res.data);
          this.setData({
            images: page === 1 ? res.data : this.data.images.concat(res.data)
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
        }
      })
  },
  showImage(event) {
    console.log(event.target.dataset.url);
    wx.previewImage({
      urls: this.data.images.map(item => item.fileID),
      current: event.target.dataset.url
    })
  },
  adminAction(e) {
    const info = wx.getStorageSync('USERINFO');
    if (info && info.isAdmin) {
      wx.showModal({
        title: '真删除了喔～',
        confirmText: '为所欲为',
        cancelText: '取消'
      }).then(r => {
        if (r.confirm) {
          db.collection('album').where({
            fileID: e.currentTarget.dataset.url
          }).remove({
            success: (res) => {
              // 把云存储的也删了
              wx.cloud.deleteFile({
                fileList: [fileID],
                success: res => {
                  this.onPullDownRefresh()
                  wx.showToast({
                    title: '删除成功',
                  })
                },
                fail: console.error
              })
            }
          })
        }
      })
    }

  }
})