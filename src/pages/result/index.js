import Taro, { Component } from "@tarojs/taro";
import { View, Image } from "@tarojs/components";
import "./index.scss";

export default class Result extends Component {
  config = {
    navigationBarTitleText: "识别结果"
  };
  state = {
    vin: ""
  };
  intData = () => {
    const vin = wx.getStorageSync("vin");
    this.setState({
      vin
    });
  };
  componentDidMount() {
    this.intData();
  }
  render() {
    const { vin } = this.state;
    return (
      <View>
        <View>{vin}</View>
        <View>以下为具体内容</View>
      </View>
    );
  }
}
