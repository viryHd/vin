import Taro, { Component } from "@tarojs/taro";
import {
  View,
  Button,
  Image,
  Canvas,
  MovableArea,
  MovableView,
  Block
} from "@tarojs/components";
import "./index.scss";
import { getAdjustSize, convexHull, getCropRect } from "./cropperUtil";
import { throttle } from "../../common";
import { getVinCode } from "../../service/getVinCode";

export default class Clip extends Component {
  config = {
    navigationBarTitleText: "裁切"
  };
  state = {
    W: 0,
    H: 0,
    vin: "",
    imgInfo: {
      path: "",
      w: 0,
      h: 0,
      x: 0,
      y: 0
    },
    canCrop: true,
    convexDots: [],
    movableItems: [
      {
        point: "topleft",
        x: 0,
        y: 0
      },
      {
        point: "topright",
        x: 0,
        y: 0
      },
      {
        point: "bottomright",
        x: 0,
        y: 0
      },
      {
        point: "bottomleft",
        x: 0,
        y: 0
      }
    ],
    movableItemLength: 50
  };
  intImage = (W, H) => {
    const tempPath = wx.getStorageSync("tempPath");
    wx.getImageInfo({
      src: tempPath,
      success: res => {
        const originImg = res.path;
        const minWidth = 200;
        const imgSize = getAdjustSize(W, H, res.width, res.height, minWidth);
        const imgInfo = {
          path: originImg,
          w: imgSize.width,
          h: imgSize.height,
          x: (W - imgSize.width) / 2,
          y: (H - imgSize.height) / 2
        };
        let bol = imgSize.width === minWidth;
        let movableItems = this.intPoint(imgInfo, bol);
        this.drawClipImage(movableItems, imgInfo);
        this.setState({
          imgInfo,
          movableItems
        });
      }
    });
  };
  intPoint = (imgInfo, bol) => {
    let movableItems = [];
    if (bol) {
      movableItems = [
        {
          point: "topleft",
          x: 20,
          y: 20
        },
        {
          point: "topright",
          x: imgInfo.w - 20,
          y: 20
        },
        {
          point: "bottomright",
          x: imgInfo.w - 20,
          y: imgInfo.h - 20
        },
        {
          point: "bottomleft",
          x: 20,
          y: imgInfo.h - 20
        }
      ];
    } else {
      movableItems = [
        {
          point: "topleft",
          x: 50,
          y: 50
        },
        {
          point: "topright",
          x: imgInfo.w - 50,
          y: 50
        },
        {
          point: "bottomright",
          x: imgInfo.w - 50,
          y: imgInfo.h - 50
        },
        {
          point: "bottomleft",
          x: 50,
          y: imgInfo.h - 50
        }
      ];
    }
    return movableItems;
  };

  drawClipImage = (movableItems, imgInfo, callback) => {
    let convexDots = [];
    let orderedDots = movableItems;
    const w = imgInfo.w;
    const h = imgInfo.h;
    // 获取凸边形的点
    convexDots = convexHull(orderedDots);
    // 四个点组成的四边形是不是凸四边形
    let canCrop = convexDots.length == 4;
    if (callback) {
      callback(canCrop);
    }
    this.setState({
      canCrop,
      convexDots
    });
    let ctx = wx.createCanvasContext("move-canvas");
    //绘制选中边框
    // 如果四个点组成的四边形不是凸四边形，则显示红色，表示不可取
    let color = canCrop ? "rgba(0,0,0,0.8)" : "red";
    ctx.setStrokeStyle(color);
    ctx.setLineWidth(2);
    ctx.beginPath();
    for (let i = 0, len = convexDots.length; i < len; i++) {
      let dot = convexDots[i];
      if (i == 0) {
        ctx.moveTo(dot.x, dot.y);
      } else {
        ctx.lineTo(dot.x, dot.y);
      }
    }
    let dot = convexDots[0];
    ctx.lineTo(dot.x, dot.y);
    ctx.stroke();
    //绘制四个角
    ctx.setFillStyle("white");
    ctx.setStrokeStyle("white");
    for (let i = 0, len = orderedDots.length; i < len; i++) {
      let dot = orderedDots[i];
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 4, 0, 2 * Math.PI, true);
      ctx.fill();
      ctx.closePath();
    }
    ctx.draw();
  };
  // move events
  setupMoveItem = (key, changedTouches, imgInfo, callback) => {
    let movableItems = this.state.movableItems;
    const left = imgInfo.x;
    const top = imgInfo.y;
    const w = imgInfo.w;
    const h = imgInfo.h;
    if (changedTouches.length === 1) {
      let touch = changedTouches[0];
      let x = touch.clientX;
      let y = touch.clientY;
      // 相对画布的点
      x = x - left;
      y = y - top;
      // 边界检测，使截图不超出截图区域
      x = x < 0 ? 0 : x > w ? w : x;
      y = y < 0 ? 0 : y > h ? h : y;
      movableItems = movableItems.map(v => {
        if (v.point === key) {
          v.x = x;
          v.y = y;
        }
        return v;
      });
      this.drawClipImage(movableItems, imgInfo, function(canCrop) {
        if (callback) {
          callback(movableItems, canCrop);
        }
      });
    }
  };

  // moveable-view touchmove
  moveEvent = e => {
    const key = e.currentTarget.dataset.key;
    this.setupMoveItem(key, e.changedTouches, this.state.imgInfo);
  };

  // moveable-view touchend，end的时候设置movable-view的位置，如果在move阶段设置位置，选中会不流畅
  endEvent = e => {
    let key = e.currentTarget.dataset.key;
    this.setupMoveItem(
      key,
      e.changedTouches,
      this.state.imgInfo,
      (movableItems, canCrop) => {
        this.setState({
          canCrop,
          movableItems
        });
      }
    );
  };
  confirmImage = throttle(() => {
    if (!this.state.canCrop) {
      return;
    }
    wx.showLoading({
      title: "识别中"
    });
    const convexDots = this.state.convexDots;
    const cropRect = getCropRect(convexDots);
    const imgInfo = this.state.imgInfo;
    const w = imgInfo.w;
    const h = imgInfo.h;
    let ctx = wx.createCanvasContext("img-canvas");
    ctx.setFillStyle("rgba(0,0,0,0)");
    ctx.fillRect(0, 0, w, h);
    ctx.setStrokeStyle("rgba(0,0,0,0)");
    ctx.beginPath();
    for (let i = 0, len = convexDots.length; i < len; i++) {
      let dot = convexDots[i];
      if (i == 0) {
        ctx.moveTo(dot.x, dot.y);
      } else {
        ctx.lineTo(dot.x, dot.y);
      }
    }
    let dot = convexDots[0];
    ctx.lineTo(dot.x, dot.y);
    ctx.save();
    ctx.stroke();
    ctx.setFillStyle("rgba(0,0,0,1)");
    ctx.clip();
    ctx.drawImage(imgInfo.path, 0, 0, w, h);
    ctx.restore();
    ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        x: cropRect.x,
        y: cropRect.y,
        width: cropRect.w,
        height: cropRect.h,
        destWidth: cropRect.w,
        destHeight: cropRect.h,
        canvasId: "img-canvas",
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
                    // 清除本地
                    wx.removeStorageSync('tempPath');
                    wx.setStorageSync("vin", vin);
                    Taro.redirectTo({
                      url: "../result/index"
                    });
                  }
                }
              });
            } else {
              wx.setStorageSync("tempPath", vinImg);
              Taro.redirectTo({
                url: "../vinFail/index"
              });
            }
          });
        }
      });
    });
  }, 3000);

  chooseImage = () => {
    wx.chooseImage({
      count: 1,
      sizeType: ["original"],
      sourceType: ["album"],
      success: res => {
        wx.setStorageSync("tempPath", res.tempFilePaths[0]);
        this.intImage(this.state.W, this.state.H);
      }
    });
  };
  componentDidMount() {
    wx.getSystemInfo({
      success: res => {
        const W = res.windowWidth;
        const H = res.windowHeight - 50;
        this.intImage(W, H);
        this.setState({
          W,
          H
        });
      }
    });
  }
  render() {
    const { imgInfo, W, H, movableItems, movableItemLength } = this.state;
    return (
      <View className="clip">
        <View className="clip-wrapp" style={`width:${W}px; height:${H}px;`}>
          <Image
            className="img"
            src={imgInfo.path}
            style={`width:${imgInfo.w}px; height:${imgInfo.h}px; left:${
              imgInfo.x
            }px; top:${imgInfo.y}px;`}
          />
          <Canvas
            canvas-id="img-canvas"
            className="img-canvas"
            style={`width:${imgInfo.w}px; height:${imgInfo.h}px;`}
          />
          <View
            className="canvas-wrapp"
            style={`width:${imgInfo.w}px; height:${imgInfo.h}px;`}
          >
            <Canvas canvas-id="move-canvas" className="move-canvas" />
            <MovableArea
              style={`width:${imgInfo.w}px; height:${
                imgInfo.h
              }px;position:absolute;left:0;top:0;`}
            >
              {movableItems.map(item => (
                <Block key={item.point}>
                  <MovableView
                    class="move_item"
                    style={`width:${movableItemLength}px; height:${movableItemLength}px;`}
                    direction="all"
                    x={item.x - movableItemLength / 2}
                    y={item.y - movableItemLength / 2}
                    data-key={item.point}
                    onTouchmove={this.moveEvent}
                    onTouchend={this.endEvent}
                  />
                </Block>
              ))}
            </MovableArea>
          </View>
        </View>
        <View className="bottom-btn">
          <Button onClick={this.chooseImage}>重选</Button>
          <Button onClick={this.confirmImage}>确认</Button>
        </View>
      </View>
    );
  }
}
