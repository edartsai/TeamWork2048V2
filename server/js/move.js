
// 根據指定方向移動整個 Map
function MoveArray(mapObj, direction) {
	if (direction === DIRECTION.ALL)
		return;

	if (mapObj.Items.length <= 0)
	    return;

    // 先排序，因為 Move 有順序性
	if (direction === DIRECTION.UP) {
	    mapObj.Items = mapObj.Items.sort(function (a, b) { return a.Y - b.Y; });
	}
	else if (direction === DIRECTION.DOWN) {
	    mapObj.Items = mapObj.Items.sort(function (a, b) { return b.Y - a.Y; });
	}
	else if (direction === DIRECTION.LEFT) {
	    mapObj.Items = mapObj.Items.sort(function (a, b) { return a.X - b.X; });
	}
	else if (direction === DIRECTION.RIGHT) {
	    mapObj.Items = mapObj.Items.sort(function (a, b) { return b.X - a.X; });
	}

	mapObj.Items.forEach(function (item) {
	    MoveItem(mapObj, direction, item);
	});

}

function MoveItem(mapObj, direction, item) {
    if (direction === DIRECTION.ALL)
        return;

    if (item.ToDel) 
        return;

    var isToBound = false;
    var isToOtherItem = false;
    var nPosition = { X: item.X, Y: item.Y };
    var temp, indexValue;
    var i = 1;      // 遞增
    var sign;       // 1 or -1 

    while (!isToBound && !isToOtherItem) {
        if (direction === DIRECTION.UP) {
            sign = -1;
            indexValue = item.Y + (sign * i);
            if (indexValue < 0) {
                isToBound = true;
                nPosition = { X: item.X, Y: 0 };
            }
            else {
                temp = FindByXY(mapObj, item.X, indexValue);
                if (temp !== null) {
                    isToOtherItem = true;
                    nPosition = { X: item.X, Y: indexValue + (sign * -1) };
                }
            }
        }
        else if (direction === DIRECTION.DOWN) {
            sign = 1;
            indexValue = item.Y + (sign * i);
            if (indexValue >= mapObj.Size) {
                isToBound = true;
                nPosition = { X: item.X, Y: mapObj.Size - 1 };
            }
            else {
                temp = FindByXY(mapObj, item.X, indexValue);
                if (temp !== null) {
                    isToOtherItem = true;
                    nPosition = { X: item.X, Y: indexValue + (sign * -1) };
                }
            }
        }
        else if (direction === DIRECTION.LEFT) {
            sign = -1;
            indexValue = item.X + (sign * i);
            if (indexValue < 0) {
                isToBound = true;
                nPosition = { X: 0, Y: item.Y };
            }
            else {
                temp = FindByXY(mapObj, indexValue, item.Y);
                if (temp !== null) {
                    isToOtherItem = true;
                    nPosition = { X: indexValue + (sign * -1), Y: item.Y };
                }
            }
        }
        else if (direction === DIRECTION.RIGHT) {
            sign = 1;
            indexValue = item.X + (sign * i);
            if (indexValue >= mapObj.Size) {
                isToBound = true;
                nPosition = { X: mapObj.Size - 1, Y: item.Y };
            }
            else {
                temp = FindByXY(mapObj, indexValue, item.Y);
                if (temp !== null) {
                    isToOtherItem = true;
                    nPosition = { X: indexValue + (sign * -1), Y: item.Y };
                }
            }
        }

        i++;
    }

    // 移動到新位置
    item.X = nPosition.X;
    item.Y = nPosition.Y;
}


