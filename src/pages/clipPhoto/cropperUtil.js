// 获取适应屏幕的图片显示大小
export const getAdjustSize = (W, H, width, height, minWidth) => {
  if (width < minWidth) {
    height *= minWidth / width;
    width = minWidth;
  }
  if (height < minWidth) {
    width *= minWidth / height;
    height = minWidth;
  }
  if (width > W) {
    height = (W / width) * height;
    width = W;
  }

  if (height > H) {
    width = (H / height) * width;
    height = H;
  }
  return {
    width: width,
    height: height
  };
};

// 利用向量的叉乘，计算三点的位置关系
// pq=
// 0 --> 三点一线
// 1 --> p, q, r顺时针
// 2 --> p, q, r逆时针
function orientation(p, q, r) {
  const val = (q.x - p.x) * (r.y - q.y) - (q.y - p.y) * (r.x - q.x);
  if (val == 0) return 0; 
  return val < 0 ? 1 : 2; 
}

// 凸包，四个点只能同顺/逆时针方向，凹点不满足
export const convexHull = (points) => {
  // 大于三个点形成凸包才有意义
  const n = points.length;
  if (n < 3) return;
  // 找到最左边的点
  let l = 0;
  for (let i = 1; i < n; i++) {
    if (points[i].x < points[l].x) {
      l = i;
    }
  }
  // 从最左边的点开始逆时针描点
  let hull = [];
  let p = l,
    q;
  // 循环将所有满足条件的点存入hull
  do {
    hull.push(points[p]);
    q = (p + 1) % n;

    for (let i = 0; i < n; i++) {
      // p跟q之间，是否有点能与之形成逆时针，有就让q取代他，成为p的临点
      if (orientation(points[p], points[i], points[q]) == 2) q = i;
    }
    p = q;
    // 执行循环index+1往下走，将p的临点q也存入hull

  } while (p != l); // l是起始点，遇到了就退出循环
  
  return hull;
};

// 获取选中区域的(x, y, w, h)
export const getCropRect = convexDots => {
  console.log(convexDots);
  let maxX = 0,
    maxY = 0;
  for (let i = 0, len = convexDots.length; i < len; i++) {
    maxX = Math.max(convexDots[i].x, maxX);
    maxY = Math.max(convexDots[i].y, maxY);
  }

  let minX = maxX,
    minY = maxY;
  for (let i = 0, len = convexDots.length; i < len; i++) {
    minX = Math.min(convexDots[i].x, minX);
    minY = Math.min(convexDots[i].y, minY);
  }
  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY
  };
};

