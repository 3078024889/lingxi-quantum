# Nanobanana 九宫格电影级分镜（FULL_BODY）

- Source: https://my.feishu.cn/wiki/ZXgvwHFcpige4EkNNXxcYKfmn1d#XSwjdsvncoOVf7xUzxHcLSOZnIg
- Parent: Na香蕉Pro
- Status: FULL_BODY (visible body, prompt schema, attached asset names, and case image capture)
- Media: `media/images/nanobanana-nine-grid-case.png`

## 页面可见附件/资料

- 优秀的脚本是什么样的.docx
- 影片的美术设计.docx
- AI视频脚本分镜模板_共300条.xlsx
- 5000+分镜画面提示词.xlsx
- 300+电影风格提示词.csv
- `media/files/草图故事板提示词.txt`
- `media/files/故事板提示词-1.txt`

## 页面正文

提示词：

<最终输出格式顺序>

A)场景拆解(SceneBreakdown)  B)主题与故事（Theme&Story)

C)电影化处理方案(CinematicApproach） D)关键帧列表(KF#List)

E)一张Master接触表大图（所有关键顿集合）

### JSON输出结构参考

```json
{
  "image_generation_model": "NanoBananaPro",
  "grid_layout": "5x5",
  "grid_aspect_ratio": "16:9",
  "global_watermark": {
    "position": "bottom_center",
    "size": "extremely small"
  },
  "shots": [
    {
      "shot_number": "分镜1",
      "prompt_text": "Extreme Wide Shot, mountain village in glowing canyon, waterfalls, futuristic flora, anime style, 3D render, 8k, cinematic lighting, no timecode, no subtitles."
    }
  ]
}
```

## 视觉案例

页面展示了香蕉 2.0 BANANA PRO 的示例封面，以及一张多格电影分镜接触表/关键帧集合图。截图已保存至 `media/images/nanobanana-nine-grid-case.png`。
