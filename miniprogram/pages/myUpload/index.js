// pages/myUpload/index.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: [
      {
        type: 1,
        text: '靓仔'
      },
      {
        type: 2,
        text: '沙雕网友'
      },
    ],
    openid: '',
    images: [],
    page: 1,
    isEnd: false // 结束了 没有更多了
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
    this.setData({
      openid: wx.getStorageSync('USERINFO')._openid
    })
    this.getImageList(this.data.page)
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

  },
  updateType(fileID) {
    wx.showActionSheet({
      itemList: this.data.type.map(item => item.text),
      success: (res) => {
        db.collection('album').where({
          fileID
        }).update({
          data: {
            type: res.tapIndex + 1
          },
          success: (res) => {
            wx.showToast({
              title: '删除成功',
            })
          }
        })
      }
    })

  },
  // 删除图片
  delImage(fileID) {
    db.collection('album').where({
      fileID
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
  },
  getImageList(page = 1) {
    db.collection('album')
    .skip(page * 20 - 20)
    .where({
      ownerInfo: {
        _openid: this.data.openid
      }
    })
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
      },
      fail: (err) => {
        console.log(err);
      }
    })
  },
  showImage(event) {
    console.log(event);
    const { url } = event.target.dataset;
    wx.showActionSheet({
      itemList: ['删除', '修改分类'],
      success: (res) => {
        console.log(res.tapIndex)
        if (res.tapIndex === 0) {
          this.delImage(url)
        } else {
          this.updateType(url)
        }
      },
      fail (res) {
        console.log(res.errMsg)
      }
    })
  }
})