/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  const boardLength = boardSize * boardSize;
  // left
  const topLeft = 0;
  const bottomLeft = boardLength - boardSize;
  const left = [];
  for (let i = boardSize; i < boardLength - boardSize; i += boardSize) {
    left.push(i);
  }
  // right
  const topRight = boardSize - 1;
  const bottomRight = boardLength - 1;
  const right = [];
  for (let i = boardSize * 2 - 1; i < boardLength - boardSize + boardSize -1; i += boardSize) {
    right.push(i);
  }
  // top
  const top = [];
  for (let i = 1; i < boardSize - 1; i++) {
      top.push(i);
  }
  // bottom
  const bottom = [];
  for (let i = boardLength - boardSize + 1; i < boardLength - 1; i++) {
      bottom.push(i);
  }

  if (index === topLeft) {
    return "top-left";
  } else if (index === topRight) {
    return "top-right";
  } else if (index === bottomLeft) {
    return "bottom-left";
  } else if (index === bottomRight) {
    return "bottom-right";
  } else if (top.includes(index)) {
      return "top"
  } else if (bottom.includes(index)) {
      return "bottom"
  } else if (left.includes(index)) {
    return "left";
  } else if (right.includes(index)) {
    return "right";
  } else {
    return "center";
  }
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

export function calcTileDistance(index1, index2, boardSize) {
  const row1 = Math.floor(index1 / boardSize);
  const col1 = index1 % boardSize;
  const row2 = Math.floor(index2 / boardSize);
  const col2 = index2 % boardSize;

  return Math.max(Math.abs(row2 - row1), Math.abs(col2 - col1));
}
