import Taro, { Component } from "@tarojs/taro"
import { View, Button,Text, Image, Input } from "@tarojs/components"
import "./index.scss"
import "../../assets/iconfont/iconfont.css"
export default class Index extends Component {
  config = {
    navigationBarTitleText: "主页"
  };
  takePhoto = () => {
    Taro.navigateTo({
      url: "../takePhoto/index"
    });
  };
  componentDidMount() {
  }
  render() {
    return (
      <View className="vin_inquire">
        <View className="search">
        <View className="iconfont icon-chaxun" style="font-size:45px;" onClick={this.takePhoto} />
        <Input />
        </View>
      </View>
    );
  }
}
