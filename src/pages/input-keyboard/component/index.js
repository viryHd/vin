import Taro, { Component } from "@tarojs/taro";
import { View } from "@tarojs/components";
import "./index.scss";
export default class KeyBoardCom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      number: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
      letterFirstRow: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      letterSecRow: ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      letterThirdRow: ["Z", "X", "C", "V", "B", "N", "M"]
      // inputValue: ""
    };
  }
  static defaultProps = {};
  tapKeyboard = e => {
    const keyid = e.target.dataset.keyid;
    this.props.onInputChange(keyid);
  };
  keyboardBlur = () => {
    this.props.onInputChange("up");
  };
  stopProp = e => {
    e.stopPropagation();
  };
  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}
  componentDidHide() {}
  render() {
    const { number, letterFirstRow, letterSecRow, letterThirdRow } = this.state;
    return (
      <View className="keyboard" onClick={this.stopProp}>
        <View className="keyboard_mask" onClick={this.keyboardBlur} />
        <View className="keyboard_content">
          <View className="keyboard_handle">
            <View
              data-keyid="confirm"
              className="keyboard_item keyboard_confirm"
              hoverClass="keyboard_item_hover"
              hoverStayTime={50}
              onClick={this.tapKeyboard}
            >
              查询
            </View>
            <View
              data-keyid="up"
              className="keyboard_item keyboard_up"
              hoverClass="keyboard_item_hover"
              hoverStayTime={50}
              onClick={this.tapKeyboard}
            >
              收起
            </View>
          </View>
          {/* 数字 */}
          <View className="keyboard_item_content">
            {number.map(item => (
              <View
                className="keyboard_item"
                hoverClass="keyboard_item_hover"
                hoverStayTime={50}
                key={item}
                data-keyid={item}
                onClick={this.tapKeyboard}
              >
                {item}
              </View>
            ))}
          </View>
          {/* 字母1 */}
          <View className="keyboard_item_content">
            {letterFirstRow.map(item =>
              item === "I" || item === "O" ? (
                <View
                  className="keyboard_item keyboard_item_disabled"
                  key={item}
                >
                  {item}
                </View>
              ) : (
                <View
                  className="keyboard_item"
                  hoverClass="keyboard_item_hover"
                  hoverStayTime={50}
                  key={item}
                  data-keyid={item}
                  onClick={this.tapKeyboard}
                >
                  {item}
                </View>
              )
            )}
          </View>
          {/* 字母2 */}
          <View className="keyboard_item_content keyboard_lettertwo_content">
            {letterSecRow.map(item => (
              <View
                className="keyboard_item"
                hoverClass="keyboard_item_hover"
                hoverStayTime={50}
                key={item}
                data-keyid={item}
                onClick={this.tapKeyboard}
              >
                {item}
              </View>
            ))}
          </View>
          {/* 字母3 */}
          <View className="keyboard_item_content keyboard_letterth_content">
            {letterThirdRow.map(item => (
              <View
                className="keyboard_item"
                hoverClass="keyboard_item_hover"
                hoverStayTime={50}
                key={item}
                data-keyid={item}
                onClick={this.tapKeyboard}
              >
                {item}
              </View>
            ))}
            <View
              data-keyid="delete"
              className="keyboard_item keyboard_delete"
              hoverClass="keyboard_item_hover"
              hoverStayTime={50}
              onClick={this.tapKeyboard}
            >
              {/* <View className="keyboard_delete_arrow" /> */}
              {/* <View className="keyboard_delete_x">x</View> */}
              删除
            </View>
          </View>
        </View>
      </View>
    );
  }
}
