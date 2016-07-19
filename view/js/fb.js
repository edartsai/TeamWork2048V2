var appid = "289770624746579";

window.fbAsyncInit = function () {
    FB.init({
        appId: appid,
        cookie: true,
        xfbml: true,
        version: "v2.6"
    });
};
(function () {
    var e = document.createElement('script');
    e.type = 'text/javascript';
    e.src = 'https://connect.facebook.net/zh_TW/all.js';
    e.async = true;
    document.getElementById('fb-root').appendChild(e);
}());


function postToFbWall(name, msg, link, pic, cap, desc) {
    var hasLogin = false;
    var token ;

    FB.getLoginStatus(
        function(response) {
            if (response.status === "connected") {
                token = response.authResponse.accessToken;
                hasLogin = true;
            }
            else {
                FB.login(function(loginResponse) {
                    if (loginResponse.status === "conncted") {
                        token = response.authResponse.accessToken;
                        hasLogin = true;
                    }
                },
                {scope:"publish_stream,user_photos,friends_photos,user_photo_video_tags,friends_photo_video_tags"});
            } 
        });

    if (!hasLogin) {
        var response = {
            value: false,
            error: { value: true, message: "Not login!"}
        };
        onPostToFbWallCompleted(response);
    }

    var args = {
        method: "feed",
        name: name,
        message: msg,
        link: link,
        picture: pic,
        caption: cap,
        description: desc
    };

    FB.ui(args, onPostToFbWallCompleted);
    //todo: waiting mask
}

function onPostToFbWallCompleted(response) {
    //todo: close waiting mask

    if (!response || response.error) {
        document.getElementById("msg").innerHTML = "Error occured: " + response.error.message;
        //$('#msg').slideDown();
    } else {
        document.getElementById("msg").innerHTML = "發佈成功，訊息ID:" + response.id + "。刪除此訊息";
       // $('#msg').slideDown();
    }
}

