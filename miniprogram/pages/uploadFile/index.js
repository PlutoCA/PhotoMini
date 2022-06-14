Page({

  /**
   * 页面的初始数据
   */
  data: {
    showUploadTip: false,
    haveGetImgSrc: false,
    envId: '',
    imgSrc: '',
    files: []
  },

  onLoad(options) {
    this.setData({
      envId: options.envId
    });
  },

  uploadImg() {
    wx.showLoading({
      title: '',
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
      // this.setState({
      //   imgs: res.map(item => item.fileID)
      // }, () => {
      //   Taro.hideLoading()
      // })
      wx.hideLoading()
    })
      .catch(e => {
        wx.hideLoading()
        console.log(e);
      });
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
    console.log(e);
    wx.showToast({
      title: e.detail.errMsg,
      icon: 'none'
    })
  }
});