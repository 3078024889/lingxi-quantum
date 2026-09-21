# Na香蕉Pro / Nanobanana九宫格电影级分镜

- Source: https://my.feishu.cn/wiki/ZXgvwHFcpige4EkNNXxcYKfmn1d#TnfYdqRBDoEdfUxCHIOcuBZWnZf

## Visible output format

提示词：

<最终输出格式顺序>
A)场景拆解(SceneBreakdown) B)主题与故事（Theme&Story)
C)电影化处理方案(CinematicApproach） D)关键帧列表(KF#List)
E)一张Master接触表大图（所有关键顿集合）

## JSON输出结构参考 (visible code block)

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

Media: ../media/images/nanobanana-json-prompt.png
