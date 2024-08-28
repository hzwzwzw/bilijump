var skiptimer = null;
var modelout = "";
var divinfo = null;
bvid = "";
function run() {
    // get url
    var url = window.location.href;
    // get bvid from url
    var sp = url.split("/");
    if (sp[3] !== "video") {
        return -1;
    }
    bvid = sp[4];
    
    // get cid
    var cid = "";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.bilibili.com/x/player/pagelist?bvid=" + bvid, false);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var res = JSON.parse(xhr.responseText);
            cid = res.data[0].cid;
        }
    }
    xhr.send();
    if (cid === "") {
        console.log("cid is empty");
        return -1;
    }

    // get subtitle_url
    xhr = new XMLHttpRequest();
    console.log("https://api.bilibili.com/x/player/v2?cid=" + cid + "&bvid=" + bvid);
    xhr.withCredentials = true;
    xhr.open("GET", "https://api.bilibili.com/x/player/v2?cid=" + cid + "&bvid=" + bvid, false);
    var subtitle_url = "";
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var res = JSON.parse(xhr.responseText);
            subtitle_url = res.data.subtitle.subtitles[0].subtitle_url;
        }
    }
    xhr.send();
    console.log(subtitle_url);
    if (subtitle_url === "") {
        console.log("subtitle_url is empty");
        return -1;
    }

    // get subtitle
    xhr = new XMLHttpRequest();
    xhr.open("GET", subtitle_url, false);
    var subtitle = "";
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            subtitle = xhr.responseText;
        }
    }
    xhr.send();
    if (subtitle == "") {
        console.log("subtitle is empty");
        return -1;
    }

    // trans subtitle into json
    var subtitle_json = JSON.parse(subtitle);
    subtitle_val = subtitle_json.body.map(item => {
        return {
            start: item.from,
            end: item.to,
            text: item.content
        }
    });

    // string format 
    var subtitle_str = "";
    subtitle_val.forEach(item => {
        subtitle_str += "[" + item.start + ", " + item.end + "] " + item.text + "\n";
    });
    console.log(subtitle_str);

    // send subtitle to bigmodel
    var request = new XMLHttpRequest();
    var url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    var apiKey = '17a4242bf1f7ea93a7dca2b57876aa0c.GRTHAxlK9Oc6IX07';
    var requestBody = {
        "model": "glm-4-flash",
        "messages": [
            {
                "role": "system",
                // system prompt
                "content": "\
你是一位Youtube视频标注员。你将得到一篇带有时间轴的视频文案，而你的任务是找到其中的`广告部分`，并指出其`开始时间`和`结束时间`。\n\
广告文案具有以下特征：\n\
1. 与视频文案的其他内容关联性不强或比较牵强\n\
2. 会提及一个与视频文案主体无关的赞助商品牌或产品\n\
3. 通常以一段衔接过渡语开始，并以一段鼓动消费语结束\n\
如果发现了广告部分，请输出：\n\
广告品牌（产品）：xxx \n\
开始时间：xxx \n\
结束时间：xxx”\n\n\
你只需要寻找一段广告。\n\
请注意，你所得到的文案也可能不包含广告，此时请输出：“没有广告”"
            },
            {
                "role": "user",
                "content": subtitle_str
            }
        ]
    };
    request.open('POST', url, false);
    request.setRequestHeader('Authorization', 'Bearer ' + apiKey);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            var response = JSON.parse(request.responseText);
            modelout = response.choices[0].message.content;
        }
    };
    request.send(JSON.stringify(requestBody));

    if (modelout.indexOf("没有广告") !== -1) {
        console.log("没有广告");
        return 0;
    }
    console.log(modelout);
    modelout = modelout.replace("\\n", "\n");
    modelout = modelout.replace("\n\n", "\n");
    modelout = modelout.split("\n");
    time1 = modelout[1].split("：")[1];
    time2 = modelout[2].split("：")[1];
    console.log(time1, time2);
    time1 = parseFloat(time1);
    time2 = parseFloat(time2);

    // add a timer to check current time
    skiptimer = setInterval(function () {
        // check bvid first, if changed, clear timer
        var url = window.location.href;
        var sp = url.split("/");
        if (sp[3] !== "video" || sp[4] !== bvid) {
            clearInterval(skiptimer);
            setTimer();
            return;
        }
        video = document.getElementsByClassName("bpx-player-video-wrap")[0].children[0];
        if (video.currentTime >= time1 && video.currentTime <= time2) {
            clearInterval(skiptimer);
            video.currentTime = time2;
            video.play()
            divinfo.innerHTML = "已跳过广告";
        }
    }, 1000);
    return 1;
}

var wtimer = null;

function setTimer() {
    // a func to check if video is loaded, using timer incase of puzzling ready state
    if (document.getElementsByClassName("bilijump_info").length > 0) {
        document.getElementsByClassName("bilijump_info")[0].remove();
    }
    if (skiptimer != null) {
        clearInterval(skiptimer);
    }
    wtimer = setInterval(function () {
        time = document.getElementsByClassName("bpx-player-video-wrap")[0].children[0].currentTime;
        if (time == undefined || time > 0) {
            clearInterval(wtimer);
            result = run();
            // add a div to show result
            divinfo = document.createElement("div");
            divinfo.className = "bilijump_info";
            if (result == -1) {
                divinfo.style = "color: red; font-size: 10px;";
                divinfo.innerHTML = "无法获取视频信息或字幕";
                var button = document.createElement("button");
                button.innerHTML = "重试";
                button.onclick = function() {
                    setTimer();
                }
                divinfo.appendChild(button);
            }else if (result == 0) {
                divinfo.style = "color: gray; font-size: 10px;";
                divinfo.innerHTML = "没有识别到广告";
                var button = document.createElement("button");
                button.innerHTML = "重试";
                button.onclick = function() {
                    setTimer();
                }
                divinfo.appendChild(button);
            }
            else {
                divinfo.style = "color: green; font-size: 10px;";
                time1min = parseInt(time1 / 60);
                time1sec = parseInt(time1 % 60);
                time2min = parseInt(time2 / 60);
                time2sec = parseInt(time2 % 60);
                divinfo.innerHTML = "广告品牌（产品）：" + modelout[0].split("：")[1] + " 开始时间：" + time1min + ":" + time1sec + " 结束时间：" + time2min + ":" + time2sec;
                var button = document.createElement("button");
                button.innerHTML = "取消";
                button.onclick = function() {
                    clearInterval(skiptimer);
                    divinfo.innerHTML = "取消跳过广告";
                }
                divinfo.appendChild(button);
            }
            document.getElementsByClassName("video-desc-container")[0].appendChild(divinfo);
            document.getElementsByClassName("video-desc-container")[0].style = "visibility: visible;";
        }
    }, 1000);
}

if (document.readyState !== 'loading') {
    setTimer();
} else {
    document.addEventListener('DOMContentLoaded', setTimer);
}

// url change
window.addEventListener('popstate', setTimer);
window.addEventListener('hashchange', setTimer);
document.getElementById("reco_list").addEventListener("click", setTimer);
