export const throttle = (fn, gapTime) => {
  if (gapTime === null || gapTime === undefined) {
    gapTime = 2000;
  }
  let lastTime = null;
  // 返回新的函数
  return function() {
    let nowTime = +new Date();
    if (nowTime - lastTime > gapTime || !lastTime) {
      fn.apply(this, arguments); //将this和参数传给原函数
      lastTime = nowTime;
    }
  };
};
