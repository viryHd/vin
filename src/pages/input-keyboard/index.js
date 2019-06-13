import Taro, { Component } from "@tarojs/taro";
import { View, Text, MovableArea, MovableView } from "@tarojs/components";
import KeyBoardCom from "./component";
import "./index.scss";
export default class InputKeyboard extends Component {
  config = {
    navigationBarTitleText: "主页"
  };
  constructor(props) {
    super(props);
    this.state = {
      isFocus: false,
      value: "",
      valueList: [],
      cursorIndex: 0,
      maxlength: 17,
      textWidth: 10,
      movableCursor: false,
      showCursor: false,
      showClipboard: false,
      highlight: false
    };
  }
  showKeyboard = e => {
    e.stopPropagation();
    const isAlreadyShowCursor = this.state.showCursor;
    const x = e.changedTouches[0].clientX;
    const cursorIndex = this.cursorPoint(x);
    const length = this.state.valueList.length;
    if (isAlreadyShowCursor && length) {
      this.setState({ movableCursor: true });
    }
    this.setState({
      isFocus: true,
      showCursor: true,
      showClipboard: false,
      highlight: false
    });
    if (length) {
      this.setState({ cursorIndex });
    }
  };
  longPressClipboard = () => {
    const isAlreadyFocus = this.state.isFocus;
    const length = this.state.valueList.length;
    if (!isAlreadyFocus) {
      this.setState({ isFocus: true, showCursor: true });
      return;
    }
    this.setState({ showClipboard: true });
    if (!length) {
      this.setState({
        isFocus: true,
        highlight: false,
        showCursor: true,
        movableCursor: true
      });
    } else {
      this.setState({
        showCursor: false,
        movableCursor: false,
        highlight: true
      });
    }
  };
  copyValue = e => {
    e.stopPropagation();
    this.setState({
      showClipboard: false,
      highlight: false,
      movableCursor: false
    });
    const data = this.state.valueList.join("");
    Taro.setClipboardData({ data }).then(res => {
      console.log(res);
    });
  };
  pasteValue = e => {
    e.stopPropagation();
    this.setState({
      showClipboard: false,
      highlight: false,
      movableCursor: false,
      showCursor: true
    });
    Taro.getClipboardData().then(res => {
      // 当粘贴的时候
      console.log("粘贴", res);
      const maxlength = this.state.maxlength;
      const length = res.data.length;
      if (length >= maxlength) {
        this.setState((state, props) => {
          return {
            valueList: res.data.slice(0, maxlength).split(""),
            cursorIndex: maxlength
          };
        });
      } else {
        this.setState((state, props) => {
          return {
            valueList: res.data.split(""),
            cursorIndex: length
          };
        });
      }
    });
  };
  hideKeyboard = e => {
    const value = this.state.valueList.join("");
    this.props.onGetValue(value);
    this.setState({
      isFocus: false,
      showCursor: false,
      movableCursor: false,
      value
    });
  };
  inputChange = keyid => {
    this.setState({
      showClipboard: false,
      highlight: false,
      movableCursor: false
    });
    if (keyid == "confirm" || keyid == "up") {
      const value = this.state.valueList.join("");
      this.setState((state, props) => {
        return {
          showCursor: false,
          isFocus: false
        };
      });
      this.props.onGetValue(value);
      return;
    } else {
      this.setState({
        showCursor: true
      });
    }
    if (this.state.highlight) {
      if (keyid == "delete") {
        keyid = "";
      }
      this.setState((state, props) => {
        return {
          valueList: keyid ? [keyid] : [],
          cursorIndex: keyid ? 1 : 0,
          showClipboard: false,
          highlight: false
        };
      });
      return;
    }
    const maxlength = this.state.maxlength;
    const length = this.state.valueList.length;
    if (length >= maxlength && keyid !== "delete") {
      return false;
    }
    let step = 0;
    if (keyid === "delete") {
      if (this.state.cursorIndex <= 0) {
        return false;
      }
      step = -1;
      this.setState((state, props) => {
        state.valueList.splice(state.cursorIndex - 1, 1);
        return {
          valueList: state.valueList,
          cursorIndex: state.cursorIndex + step
        };
      });
    } else {
      step = 1;
      this.setState((state, props) => {
        state.valueList.splice(state.cursorIndex, 0, keyid);
        return {
          valueList: state.valueList,
          cursorIndex: state.cursorIndex + step
        };
      });
    }
  };
  ctrlCursorPoint = e => {
    e.stopPropagation();
    const x = e.changedTouches[0].clientX;
    const cursorIndex = this.cursorPoint(x);
    this.setState({ cursorIndex });
  };
  cursorPoint = x => {
    const length = this.state.valueList.length;
    // console.log(length);
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
  init = () => {
    this.setState({
      isFocus: false,
      movableCursor: false,
      showCursor: false,
      showClipboard: false,
      highlight: false
    });
  };
  componentDidMount() {
    const { screenWidth } = wx.getSystemInfoSync();
    const ratio = screenWidth / 750;
    this.setState({
      textWidth: 25 * ratio
    });
    this.init();
  }
  componentDidShow() {}
  render() {
    const {
      isFocus,
      showCursor,
      valueList,
      textWidth,
      cursorIndex,
      movableCursor,
      maxlength,
      showClipboard,
      highlight
    } = this.state;
    return (
      <View className="keyboard_input_box">
        <View className="keyboard_box" onClick={this.hideKeyboard}>
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
              onLongPress={this.longPressClipboard}
            >
              {showClipboard && (
                <View className="clipboard">
                  <View
                    className="clipboard_btn"
                    hoverClass="clipboard_btn_hover"
                    hoverStayTime={50}
                    onClick={this.copyValue}
                  >
                    复制
                  </View>
                  <View
                    className="clipboard_btn"
                    hoverClass="clipboard_btn_hover"
                    hoverStayTime={50}
                    onClick={this.pasteValue}
                  >
                    粘贴
                  </View>
                </View>
              )}
              {valueList.map(item => (
                // 光标激活状态可复制粘贴,且value高亮
                <Text
                  key={item}
                  data-keyid={item}
                  className={`input_value_wrapper ${highlight && "highlight"}`}
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
                {!showCursor ? null : !movableCursor ? (
                  <View
                    className="keyboard_cursor_line line_unmove"
                    style={`left:${textWidth * cursorIndex}px;`}
                  />
                ) : (
                  <MovableView
                    className="keyboard_cursor"
                    direction="horizontal"
                    animation={false}
                    x={textWidth * cursorIndex}
                    style={`left:${textWidth * cursorIndex}px;`}
                    onTouchmove={this.ctrlCursorPoint}
                    onTouchend={this.ctrlCursorPoint}
                  >
                    <View className="keyboard_cursor_line" />
                    <View className="keyboard_cursor_btn" />
                  </MovableView>
                )}
              </MovableArea>
            </View>
          )}
          <View className="input_length">
            已输入<Text style="color:#ea606a;">{valueList.length}</Text>/
            {maxlength}
          </View>
          {!isFocus ? null : (
            <KeyBoardCom onInputChange={keyid => this.inputChange(keyid)} />
          )}
        </View>
      </View>
    );
  }
}
