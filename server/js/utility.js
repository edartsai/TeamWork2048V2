﻿
//// 判斷陣列中是否有包含 target value
//function Contains(array, target) {
//	if (array.length <= 0)
//		return false;

//	for (var i = 0; i < array.length; i++) {
//		if (array[i] === target)
//			return true;
//	}

//	return false;
//}


// 根據設定的最大最小值產生亂數
function Random(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}


function Clone(nowObj, preObj) {
    preObj.Size = nowObj.Size;
    preObj.Score = nowObj.Score;
    preObj.IsGameOver = nowObj.IsGameOver;
    preObj.Items = CloneItems(nowObj.Items);        //不可以直接用 oldItems = newItems (call by ref when array)
    preObj.IdMax = nowObj.IdMax;
}


// 複製 MapItem 所有物件至新 Array
function CloneItems(items) {
    var rtn = [];
    items.forEach(function (item) {
        var nitem = {
            Id: item.Id,
            X: item.X,
            Y: item.Y,
            Value: item.Value,
            PreId: item.PreId,
            ToDel: item.ToDel
        }

        rtn.push(nitem);
    });
    return rtn;
}


// 從 mapObj.Items 中 根據 X,Y 座標尋找是否有此物件
// 若有則回傳 物件
// 若無則回傳 null
function FindByXY(mapObj, x, y) {
    if (mapObj.Items === undefined || mapObj.Items.length <= 0)
        return null;

    var rtn = null;
    mapObj.Items.forEach(function(item) {
        if (item.X === x && item.Y === y) {
            rtn = item;
        }
    });

    return rtn;
}

// 從 mapObj.Items 中 根據 id 尋找是否有此物件
// 若有則回傳 物件
// 若無則回傳 null
function FindById(mapObj, id) {
    if (mapObj.Items === undefined || mapObj.Items.length <= 0)
        return null;

    var rtn = null;
    mapObj.Items.forEach(function (item) {
        if (item.Id === id) {
            rtn = item;
        }
    });

    return rtn;
}

function FindXItems(mapObj, x) {
    var rtn = [];
    mapObj.Items.forEach(function (item) {
        if(item.X === x)
            rtn.push(item);
    });
    return rtn;
}

function FindYItems(mapObj, y) {
    var rtn = [];
    mapObj.Items.forEach(function (item) {
        if (item.Y === y)
            rtn.push(item);
    });
    return rtn;
}


//建立Cookie
//name : Key
//value:保存值
//days:預設為天數，如有需求請自行修改
function CreateCookie(name, value, days) {
    //需要呼叫編碼，為瞭解決中文問題
    var expires;
    value = encodeURI(value);
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    else
        expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

//讀取Cookie
//name : Key
function ReadCookie(name) {
    var nameeq = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameeq) === 0)
            return decodeURI(c.substring(nameeq.length, c.length));
    }
    return null;
}

//刪除cookie
//name: Key
function DeleteCookie(name) {
    CreateCookie(name, "", -1);
}


//螢幕截圖
function capturePhoto(obj, callback) {
    // Assign an event to the object.
    document.body.addEventListener(captureEventName, callback, false);

    html2canvas(obj, {
        onrendered: function (canvas) {
            // canvas is the final rendered <canvas> element
            var img = canvas.toDataURL("image/png");
            captureCompletedEvent.detail.image = img;
            document.body.dispatchEvent(captureCompletedEvent);
            document.body.removeEventListener(captureCompletedEvent, false);
        }
    });
}

// 客製化事件
var captureEventName = "CaptureCompletedEvent";

var captureCompletedEvent = new CustomEvent(
    captureEventName, {
        detail: {
            image: null
        },
        bubbles: true,
        cancelable: true
    }
);
