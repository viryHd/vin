import Taro, { Component } from "@tarojs/taro";
import {
  View,
  Camera,
  CoverView,
  CoverImage,
  Canvas
} from "@tarojs/components";
import "./index.scss";
import { throttle } from "../../common";
import { getVinCode } from "../../service/getVinCode";

export default class TakePhoto extends Component {
  config = {
    navigationBarTitleText: "拍照"
  };
  state = {
    cameraBtn: require("../../assets/camera.png"),
    albumBtn: require("../../assets/album.png"),
    W: 300,
    H: 300,
    vin: ""
  };
  // 拍照、节流
  takePhoto = throttle(() => {
    wx.showLoading({
      title: "识别中"
    });
    this.ctx.takePhoto({
      quality: "high",
      success: res => {
        const originImg = res.tempImagePath;
        const W = this.state.W;
        const H = this.state.H;
        const ctx = wx.createCanvasContext("photoCanvas");
        ctx.drawImage(originImg, 0, 0, W, H);
        ctx.draw(false, () => {
          wx.canvasToTempFilePath({
            canvasId: "photoCanvas",
            x: W * 0.4,
            y: H * 0.1,
            width: W * 0.2,
            height: H * 0.8,
            destWidth: W * 0.2,
            destHeight: H * 0.8,
            success: res => {
              const vinImg = res.tempFilePath;
              getVinCode(vinImg).then(res => {
                console.log(res);
                if (res.data.ErrorCode === "0") {
                  const vin = res.data.VIN;
                  Taro.showModal({
                    title: "vin码",
                    content: vin,
                    cancelText: "取消",
                    cancelColor: "#888",
                    confirmText: "确认",
                    success: res => {
                      if (res.confirm) {
                        // Taro.setClipboardData({
                        //   data: vin
                        // });
                        wx.removeStorageSync("tempPath");
                        wx.setStorageSync("vin", vin);
                        Taro.redirectTo({
                          url: "../result/index"
                        });
                      }
                    }
                  });
                }
              });
            }
          });
        });
      }
    });
  }, 3000);

  chooseImage = () => {
    wx.chooseImage({
      count: 1,
      sizeType: "original",
      sourceType: "album",
      success: res => {
        wx.setStorageSync("tempPath", res.tempFilePaths[0]);
        Taro.navigateTo({
          url: "../clipPhoto/index"
        });
      }
    });
  };
  error = e => {
    console.log(e.detail);
  };
  componentWillMount() {}
  componentDidMount() {
    const res = wx.getSystemInfoSync();
    this.ctx = wx.createCameraContext();
    this.setState({
      W: res.windowWidth,
      H: res.windowHeight - 50
    });
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    const { albumBtn, cameraBtn, W, H } = this.state;
    return (
      <View className="camera">
        <View className="camera_wrapp">
          <Camera
            device-position="back"
            flash="off"
            onError={this.error}
            style="width: 100%; height: 100%;"
          >
            <CoverView className="camera_mask fl_row">
              <CoverView className="camera_mask_lr fl_col_40">
                <CoverView className="album_btn">
                  <CoverImage
                    className="album_btn_img"
                    src={albumBtn}
                    onClick={this.chooseImage}
                  />
                </CoverView>
              </CoverView>
              <CoverView className="camera_mask_m fl_col_20 fl_col">
                <CoverView className="camera_mask_tb" />
                <CoverView className="camera_view_box">
                  <CoverView className="camera_view_line camera_view_line_h" />
                  <CoverView className="camera_view_line camera_view_line_h" />
                  <CoverView className="camera_view_line camera_view_line_h" />
                  <CoverView className="camera_view_line camera_view_line_h" />
                  <CoverView className="camera_view_line camera_view_line_v" />
                  <CoverView className="camera_view_line camera_view_line_v" />
                  <CoverView className="camera_view_line camera_view_line_v" />
                  <CoverView className="camera_view_line camera_view_line_v" />
                  <CoverView className="camera_btn">
                    <CoverImage
                      className="camera_btn_img"
                      src={cameraBtn}
                      onClick={this.takePhoto}
                    />
                  </CoverView>
                </CoverView>
                <CoverView className="camera_mask_tb" />
              </CoverView>
              <CoverView className="camera_mask_lr fl_col_40">
                <CoverView className="camera_tips">
                  请确保车架号在相框内
                </CoverView>
              </CoverView>
            </CoverView>
          </Camera>
        </View>
        <Canvas
          canvas-id="photoCanvas"
          className="photo_canvas"
          style={`width:${W}px; height:${H}px;`}
        />
      </View>
    );
  }
}
