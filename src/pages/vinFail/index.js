import Taro, { Component } from "@tarojs/taro";
import {
  View,
  Image
} from "@tarojs/components";
import "./index.scss";

export default class VinFail extends Component {
  config = {
    navigationBarTitleText: "识别结果"
  };
  state = {
    imgInfo: ""
  }
 intImage = ( ) => {
    const imgInfo = wx.getStorageSync("tempPath");
        this.setState({
          imgInfo
        });
  };
  componentDidMount() {
    this.intImage();
  }
  render(){
    const {imgInfo} = this.state;
    return(
      <View>
        <View>多次识别无果，试试手动输入吧</View>
        <Image src={imgInfo} />
      </View>
    )
  }
}