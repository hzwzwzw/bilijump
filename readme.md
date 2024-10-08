# BiliJump

BiliJump 是一个简单的 Bilibili 平台视频内口播广告智能跳过插件。理论上，只要视频有 AI 字幕（UP 主没有手动关闭且 AI 字幕已经生成完成），插件就可以发挥作用。实际上，由于插件尚没有对长视频做优化，仅15分钟以下的视频有较好的识别率。

效果演示： 

<img src="example.gif" style="zoom:150%;" />

（图片原视频：BV1rN411B7uR）

## 工作原理

在打开一个视频页面后，BiliJump 执行以下操作：

1. 读取 BV 号，使用 B 站官方 API 获取所提供的 AI 字幕。
2. 将 AI 字幕输入到大模型中，指示其搜寻其中的口播广告部分。
3. 在网页中监听视频进度，自动跳过广告时间段。

## 使用方法

0. **获取大模型 API key**
   代码只硬编码了 GLM 模型的请求体。如果你想直接使用插件，请使用 [GLM 模型的 API](https://open.bigmodel.cn/)。如果要换用其他模型，你需要修改`content.js`中`run`函数有关大模型的请求体。
   测试中，不同的模型对识别效果（准确率、时间区间）有比较显著的影响。
1. **安装插件**
  考虑到项目仍然很不完善，不提供 crx 文件。请 clone 本项目到本地，打开 Chrome 浏览器的开发人员模式并使用“加载解压缩的拓展”选项加载项目目录。
2. **配置 key**
  安装后，在拓展界面打开 BiliJump，输入 API key 并保存即可。
3. **测试效果**
  打开一个视频，你应当可以在简介栏下方看到以下三种提示之一：
     - 绿色文字提示发现广告，将会自动跳过。你可以手动取消。
     - 灰色文字提示没有发现广告，你可以重试。
     - 红色文字提示无法正确找到字幕信息，可能是视频没有对应的 AI 字幕，你可以重试。

## 已知问题

- 插件效率有待优化
- 直接在视频页中跳转，有概率无法触发插件
- 长视频的识别并不稳定
- 没有对特殊视频页面做测试和适配
