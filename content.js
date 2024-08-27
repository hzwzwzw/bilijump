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
}


if (document.readyState !== 'loading') {
    run();
} else {
    document.addEventListener('DOMContentLoaded', run);
}