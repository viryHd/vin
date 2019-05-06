import Taro from "@tarojs/taro";
// 调vin识别接口
export const getVinCode = path =>
  new Promise((resolve, reject) => {
    const FileSystemManager = wx.getFileSystemManager();
    FileSystemManager.readFile({
      filePath: path,
      encoding: "base64",
      success: res => {
        const str = `filedata=${encodeURIComponent(res.data)}&pid=1`;
        wx.request({
          url: "http://120.76.52.103:8078/OcrWeb/servlet/OcrServlet",
          method: "POST",
          data: str,
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          success: res => {
            wx.hideLoading();
            if (res.data.ErrorCode === "19") {
              showToast({ title: "未捕获到车架号信息" });
            } else if (res.data.ErrorCode === "20") {
              showToast({ title: "找不到该车型" });
            }else if(res.data.ErrorCode !== "0"){
              showToast({});
            }
            resolve(res);
          },
          fail: res => {
            showToast({});
            reject(new Error("请稍后再试!"));
          }
        });
      }
    });
  });
function showToast({ title = "请稍后再试", icon = "none", duration = 1500 }) {
  wx.showToast({
    title,
    icon,
    duration
  });
}
