# Video watermark regression fixture

File: `fixed-watermark-vp8.webm`, 160×120, VP8, 12 fps, 2 seconds, no audio.
Original deterministic test asset generated with FFmpeg, SHA-256
`2367cda08af30a92f718d0b3640f8fd32c3e10b06fba8f21ae402a783f682e71`.

Reproduce using:

```sh
ffmpeg -v error -y -f lavfi -i 'color=c=0x304060:s=160x120:r=12:d=2' -vf 'drawbox=x=120:y=98:w=26:h=12:color=0xff2020@1:t=fill' -an -c:v libvpx -b:v 160k -deadline good -cpu-used 4 -f webm fixed-watermark-vp8.webm
```

The source region at (132,104) should be red (independent decoding yielded RGB 254,31,29).
A processed output must remain playable and significantly reduce that red mark.
The test verifies source and processed pixel values and forbids real payments.
Do not replace this with a mocked output or a source that sometimes decodes black.
