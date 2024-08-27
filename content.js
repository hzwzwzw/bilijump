function run () {
    // get url
    var url = window.location.href;
    // get bvid from url
    var sp = url.split("/");
    if(sp[3] !== "video"){
        return;
    }
    var bvid = sp[4];
    
    // get cid
    var cid = "";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.bilibili.com/x/player/pagelist?bvid=" + bvid, false);
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4 && xhr.status == 200){
            var res = JSON.parse(xhr.responseText);
            cid = res.data[0].cid;
        }
    }
    xhr.send();
    if (cid === "") {
        console.log("cid is empty");
        return;
    }

    // get subtitle_url
    xhr = new XMLHttpRequest();
    console.log("https://api.bilibili.com/x/player/v2?cid=" + cid + "&bvid=" + bvid);
    xhr.withCredentials = true;
    xhr.open("GET", "https://api.bilibili.com/x/player/v2?cid=" + cid + "&bvid=" + bvid, false);
    var subtitle_url = "";
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4 && xhr.status == 200){
            var res = JSON.parse(xhr.responseText);
            subtitle_url = res.data.subtitle.subtitles[0].subtitle_url;
        }
    }
    xhr.send();
    console.log(subtitle_url);
    if (subtitle_url === "") {
        console.log("subtitle_url is empty");
        return;
    }

    // get subtitle
    xhr = new XMLHttpRequest();
    xhr.open("GET", subtitle_url, false);
    var subtitle = "";
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4 && xhr.status == 200){
            subtitle = xhr.responseText;
        }
    }
    xhr.send();
    if (subtitle == "") {
        console.log("subtitle is empty");
        return;
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
        "model": "glm-4",
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
如果发现了广告部分，请输出：“广告品牌（产品）：xxx \\n开始时间：xxx \\n结束时间：xxx”\n\
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
    var modelout = ""
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            var response = JSON.parse(request.responseText);
            modelout = response.choices[0].message.content;
        }
    };
    request.send(JSON.stringify(requestBody));

    if (modelout.indexOf("没有广告") !== -1) {
        console.log("没有广告");
        return;
    }
    console.log(modelout);
    modelout.replace("\\n", "\n");
    modelout = modelout.split("\n");
    time1 = modelout[1].split("：")[1];
    time2 = modelout[2].split("：")[1];
    console.log(time1, time2);
    time1 = parseFloat(time1);
    time2 = parseFloat(time2);

    // add a timer to check current time
    var timer = setInterval(function(){
        video = document.getElementsByClassName("bpx-player-video-wrap")[0].children[0];
        if (video.currentTime >= time1 && video.currentTime <= time2) {
            timer.setInterval = null;
            video.currentTime = time2;
            video.play()
        }
    }, 1000);
}


if (document.readyState !== 'loading') {
    run();
} else {
    document.addEventListener('DOMContentLoaded', run);
}