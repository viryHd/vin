import Taro, { Component } from "@tarojs/taro";
import {
  View
} from "@tarojs/components";
import InputKeyboard from "../input-keyboard";
import "./index.scss";
export default class Index extends Component {
  config = {
    navigationBarTitleText: "主页"
  };
  constructor(props) {
    super(props);
    this.state = {
      value: ""
    };
  }
  getValue = value => {
    console.log(value);
    this.setState({ value });
  };
  componentDidMount() {}
  componentDidShow() {}
  render() {
    const {value} = this.state;
    return (
      <View className="vin_inquire">
        <View className="input_box">

        <InputKeyboard onGetValue={value => this.getValue(value)} />
        </View>
        <View className="value">{value}</View>
        <View className="value">这些是内容填充</View>
        <View className="value">这些是内容填充</View>
        <View className="value">这些是内容填充</View>
        <View className="value">这些是内容填充</View>
        <View className="value">这些是内容填充</View>
        <View className="value">这些是内容填充</View>
      </View>
    );
  }
}
