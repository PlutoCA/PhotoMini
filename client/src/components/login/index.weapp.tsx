import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { View, Text, Button, Image } from "@tarojs/components";

export default class Index extends Component {
  state = {
    context: {},
    imgs: []
  };

  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  getLogin = () => {
    Taro.cloud
      .callFunction({
        name: "test2",
        data: {}
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
        Promise.all(
          chooseResult.tempFilePaths.map(item => {
            return Taro.cloud.uploadFile({
              // 指定上传到的云路径
              cloudPath: item.replace(/(.*\/)*([^.]+).*/ig,"$2"),
              // 指定要上传的文件的小程序临时文件路径
              filePath: item
            });
          })
        ).then(res => {
            console.log("上传成功", res);
            this.setState({
              imgs: res.map(item => item.fileID)
            })
          })
          .catch(e => {
            console.log(e);
          });
      }
    });
  };

  render() {
    return (
      <View className='index'>
        <Button onClick={this.getLogin}>获取登录云函数</Button>
        <Button onClick={this.upload}>上传</Button>
        <Text>context：{JSON.stringify(this.state.context)}</Text>
        {
          this.state.imgs.map((item) => (
            <Image key={item} src={item} />
          ))
        }
      </View>
    );
  }
}
