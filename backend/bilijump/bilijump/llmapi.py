import requests
import os
def get_key():
    print("API_KEY: ", os.getenv("ZHIPU_API_KEY"))
    return os.getenv("ZHIPU_API_KEY") 

def send_request(message):
    api_key = get_key()
    url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    data = {
        "model": "glm-4-flash",
        "messages": [
            {
                "role": "system",
                "content":"\
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
                "content": message
            }
        ]
    }

    response = requests.post(url, headers=headers, json=data)
    if response and response.status_code == 200:
        return response.json().get('choices')[0].get('message').get('content')
    else:
        return None

# if __name__ == "__main__":
#     message = '你好'
#     response = send_request(get_key(), message)
#     print(response)
