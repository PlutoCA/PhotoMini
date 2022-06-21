const db = wx.cloud.database()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showUploadTip: false,
    haveGetImgSrc: false,
    envId: '',
    imgSrc: '',
    files: [],
    userInfo: undefined,
    can_upload: false
  },

  onLoad(options) {
    this.setData({
      userInfo: wx.getStorageSync('USERINFO'),
    })
    console.log(wx.getStorageSync('USERINFO'));
  },
  onShow() {
    this.getSetting()
  },
  getSetting() {
    db.collection('setting').get({
      success: (res) => {
        const { data } = res
        console.log(res);
        this.setData({
          can_upload: data[0].can_upload
        })
      },
      fail: (e) => {
        console.log('err', e);
      }
    })
  },
  uploadImg() {
    if (this.data.can_upload) {
      if (this.data.files.length) {
        wx.showLoading({
          title: '上传中...',
        });
        Promise.all(
            this.data.files.map(item => {
              return wx.cloud.uploadFile({
                // 指定上传到的云路径
                cloudPath: 'ali/' + item.url.replace(/(.*\/)*([^.]+).*/ig, "$2"),
                // 指定要上传的文件的小程序临时文件路径
                filePath: item.url
              });
            })
          ).then(res => {
            console.log("上传成功", res);
            const data = res.map((item) => ({
              fileID: item.fileID,
              type: 1,
              ownerInfo: this.data.userInfo
            }))
            console.log(data);
            Promise.all(
              data.map((item) => {
                return db.collection('album').add({
                  data: item
                })
              })
            ).then((result) => {
              wx.hideLoading()
              console.log(result);
              wx.showToast({
                title: '牛哇，上传成功',
                icon: 'success'
              });
              this.setData({
                files: []
              })
            }).catch((err) => {
              console.log('err', err);
            })
              
            // wx.hideLoading()
          })
          .catch(e => {
            wx.hideLoading()
            console.log(e);
          });
      } else {
        wx.showToast({
          title: '你这啥也没有喔',
          icon: 'none'
        })
      }
    } else {
      wx.showToast({
        title: '上传入口暂时关闭了~',
        icon: 'none'
      })
    }
  },

  clearImgSrc() {
    this.setData({
      haveGetImgSrc: false,
      imgSrc: ''
    });
  },
  select(e) {
    console.log(e.detail);
    this.setData({
      files: this.data.files.concat(e.detail.tempFiles.map((item) => ({
        url: item.path,
        size: item.size
      })))
    })
  },
  bindfail(e) {
    wx.showToast({
      title: e.detail.errMsg,
      icon: 'none'
    })
  }
});