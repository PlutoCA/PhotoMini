import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { View, Text, Button, Image } from "@tarojs/components";

export default class Index extends Component {
  state = {
    context: {},
    imgs: []
  };

  componentWillMount() { }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  getLogin = () => {
    Taro.cloud
      .callFunction({
        name: "test2",
        data: { apple: 1 }
      })
      .then(res => {
        this.setState({
          context: res.result
        });
      });
  };

  upload = () => {
    // 让用户选择一张图片
    Taro.chooseImage({
      count: 2,
      success: chooseResult => {
        // 将图片上传至云存储空间
        console.log(chooseResult);
        Taro.showLoading({ title: '上传中...', mask: true })
        Promise.all(
          chooseResult.tempFilePaths.map(item => {
            return Taro.cloud.uploadFile({
              // 指定上传到的云路径
              cloudPath: item.replace(/(.*\/)*([^.]+).*/ig, "$2"),
              // 指定要上传的文件的小程序临时文件路径
              filePath: item
            });
          })
        ).then(res => {
          console.log("上传成功", res);
          this.setState({
            imgs: res.map(item => item.fileID)
          }, () => {
            Taro.hideLoading()
          })
        })
          .catch(e => {
            Taro.hideLoading()
            console.log(e);
          });
      }
    });
  };

  onClick = (url: string) => {
    Taro.previewImage({
      current: url,
      urls: this.state.imgs
    })
  }

  getUser = (data: any) => {
    const { cloudID, } = data.detail
    // console.log();

    Taro.cloud
      .callFunction({
        name: "test2",
        // @ts-ignore
        cloudID: cloudID,
        data: { ...data.detail  }
      })
      .then(res => {
        this.setState({
          context: res.result
        });
      });
  }

  render() {
    return (
      <View className='index'>
        <Button onClick={this.getLogin}>获取登录云函数</Button>
        <Button onClick={this.upload}>上传</Button>
        <Button openType='getUserInfo' onGetUserInfo={this.getUser}>获取用户信息</Button>
        <Text>context：{JSON.stringify(this.state.context)}</Text>
        {
          this.state.imgs.map((item) => (
            <Image key={item} src={item} onClick={() => this.onClick(item)} />
          ))
        }
      </View>
    );
  }
}
