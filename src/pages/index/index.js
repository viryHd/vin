import Taro, { Component } from "@tarojs/taro";
import {
  View,
  Button,
  Text,
  Image,
  Input,
  MovableArea,
  MovableView
} from "@tarojs/components";
import KeyBoard from "../key-board";
import "./index.scss";
import "../../assets/iconfont/iconfont.css";
export default class Index extends Component {
  config = {
    navigationBarTitleText: "主页"
  };
  constructor(props) {
    super(props);
    this.state = {
      isFocus: false,
      valueList: [],
      cursorIndex: 0,
      textWidth: 10
    };
  }
  takePhoto = () => {
    //           // 注意，页面跳转之前检查用户相机权限，wx.opensetting，
    Taro.navigateTo({
      url: "../takePhoto/index"
    });
  };
  showKeyboard = e => {
    e.stopPropagation();
    this.setState({ isFocus: true });
  };
  hideKeyboard = e => {
    e.stopPropagation();
    this.setState({ isFocus: false });
  };
  inputChange = (valueList, cursorIndex) => {
    // const cursorIndex = valueList.length;
    this.setState({ valueList, cursorIndex });
  };
  touchmove = e => {
    const x = e.changedTouches[0].clientX;
    const cursorIndex = this.cursorPoint(x);
    this.setState({ cursorIndex });
  };
  touchend = e => {
    const x = e.changedTouches[0].clientX;
    const cursorIndex = this.cursorPoint(x);
    this.setState({ cursorIndex });
  };
  cursorPoint = x => {
    const length = this.state.valueList.length;
    console.log(length);
    if (!length) return false;
    const width = this.state.textWidth;
    const realX = x - this.state.textWidth * 2;
    const i = Math.floor(realX / width);
    if (i > length) {
      return length;
    } else if (i < 0) {
      return 0;
    } else {
      return i;
    }
  };
  componentDidMount() {
    const { screenWidth } = wx.getSystemInfoSync();
    const ratio = screenWidth / 750;
    this.setState({
      textWidth: 30 * ratio
    });
  }

  render() {
    const { isFocus, valueList, textWidth, cursorIndex } = this.state;
    return (
      <View className="vin_inquire" onClick={this.hideKeyboard}>
        <View className="search">
          <View
            className="iconfont icon-chaxun"
            style="font-size:45px;"
            onClick={this.takePhoto}
          />
        </View>
        {!isFocus ? (
          <View
            className="input_value"
            style={`margin:0 ${textWidth}px;padding-left: ${textWidth}px;`}
            onClick={this.showKeyboard}
          >
            {valueList.length ? (
              valueList.map(item => (
                <Text
                  key={item}
                  data-keyid={item}
                  className="input_value_wrapper"
                  style={`width:${textWidth}px;`}
                >
                  {item}
                </Text>
              ))
            ) : (
              <Text className="placeholder">请输入VIN码</Text>
            )}
          </View>
        ) : (
          <View
            className="input_value input_value_focus"
            style={`margin:0 ${textWidth}px;padding-left: ${textWidth}px;`}
            onClick={this.showKeyboard}
          >
            {valueList.map(item => (
              <Text
                key={item}
                data-keyid={item}
                className="input_value_wrapper"
                style={`width:${textWidth}px;`}
              >
                {item}
              </Text>
            ))}
            <MovableArea
              className="keyboard_cursor_area"
              style={`width:${textWidth *
                cursorIndex}px;margin-left: ${textWidth}px;`}
            >
              <MovableView
                className="keyboard_cursor"
                direction="horizontal"
                animation={false}
                x={textWidth * cursorIndex}
                style={`left:${textWidth * cursorIndex}px;`}
                onTouchmove={this.touchmove}
                onTouchend={this.touchend}
              >
                <View className="keyboard_cursor_line" />
                <View className="keyboard_cursor_btn" />
              </MovableView>
            </MovableArea>
          </View>
        )}
        {!isFocus ? null : (
          <KeyBoard
            cursorIndex={cursorIndex}
            valueList={valueList}
            onInputChange={(valueList, cursorIndex) =>
              this.inputChange(valueList, cursorIndex)
            }
          />
        )}
      </View>
    );
  }
}
