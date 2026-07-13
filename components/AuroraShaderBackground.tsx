"use client";

import { useEffect, useRef } from "react";

// 彩虹云海背景——视频版。云本身真实的流动就是最好的动效，所以这版
// 不再需要合成假的水波扭动：直接把处理好的实拍视频（已裁掉水印/边缘、
// 做成 30 秒首尾无缝循环）当贴图，用 GPU 按 "cover" 方式适配任意屏幕
// 比例，只叠一层极轻的低频位移（比 v114 图片版更弱），增加一点点水面
// 般的呼吸感，但主要的"活"来自视频本身。
//
// 容错设计：WebGL 不可用、视频加载/自动播放失败、shader 编译失败等任何
// 问题，都会被捕获，画布直接不显示——这时 globals.css 里那张视频海报帧
// （同一支视频的第一帧）会顶上来，绝不会出现白屏。

const VERTEX_SHADER = `
  varying vec2 v_uv;
  void main() {
    v_uv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 v_uv;
  uniform vec2 u_resolution;
  uniform vec2 u_texSize;
  uniform float u_time;
  uniform sampler2D u_video;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
      + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // "cover" 映射：视频永远铺满整个视口并居中裁切，不拉伸变形。
  vec2 coverUV(vec2 uv, vec2 screenRes, vec2 texRes) {
    float screenAspect = screenRes.x / screenRes.y;
    float texAspect = texRes.x / texRes.y;
    vec2 scale = vec2(1.0);
    if (screenAspect > texAspect) {
      scale.y = texAspect / screenAspect;
    } else {
      scale.x = screenAspect / texAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = v_uv;
    float t = u_time * 0.5;

    // 极轻的低频水波位移——振幅比图片版更小，因为视频本身已经在流动，
    // 这里只是让画面多一点点"隔水看天"的细腻质感，不喧宾夺主。
    float n1 = snoise(uv * 2.4 + vec2(t * 0.08, -t * 0.06));
    float n2 = snoise(uv * 4.3 - vec2(t * 0.05, t * 0.04));
    vec2 rippleOffset = vec2(n1, n2) * 0.006;

    vec2 cuv = coverUV(uv + rippleOffset, u_resolution, u_texSize);
    vec3 color = texture2D(u_video, clamp(cuv, 0.0, 1.0)).rgb;

    float vig = smoothstep(1.05, 0.35, length((uv - 0.5) * vec2(1.15, 1.0)));
    color *= mix(0.94, 1.0, vig);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const VIDEO_SRC = "/images/sky/rainbow-sky.mp4";
const POSTER_SRC = "/images/sky/rainbow-sky-poster.jpg";

export default function AuroraShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: import("three").WebGLRenderer | null = null;
    let frameId = 0;
    let disposed = false;

    (async () => {
      try {
        const THREE = await import("three");

        const video = document.createElement("video");
        video.src = VIDEO_SRC;
        video.poster = POSTER_SRC;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.autoplay = true;
        video.crossOrigin = "anonymous";
        videoRef.current = video;

        await new Promise<void>((resolve, reject) => {
          video.addEventListener("loadeddata", () => resolve(), { once: true });
          video.addEventListener("error", () => reject(new Error("video load failed")), { once: true });
        });
        if (disposed) return;
        await video.play().catch(() => {
          // 一些浏览器需要用户交互才允许自动播放——静默失败，
          // WebGL 画布会保持隐藏，CSS 海报帧兜底会顶上来。
          throw new Error("video autoplay blocked");
        });
        if (disposed) return;

        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "low-power" });
        if (disposed) { renderer.dispose(); return; }

        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.colorSpace = THREE.SRGBColorSpace;
        videoTexture.wrapS = THREE.ClampToEdgeWrapping;
        videoTexture.wrapT = THREE.ClampToEdgeWrapping;
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const geometry = new THREE.PlaneGeometry(2, 2);
        const uniforms = {
          u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          u_texSize: { value: new THREE.Vector2(video.videoWidth || 1680, video.videoHeight || 792) },
          u_time: { value: 0 },
          u_video: { value: videoTexture },
        };
        const material = new THREE.ShaderMaterial({
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          uniforms,
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const setSize = () => {
          const w = window.innerWidth, h = window.innerHeight;
          renderer!.setSize(w, h, false);
          renderer!.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
          uniforms.u_resolution.value.set(w, h);
        };
        setSize();
        window.addEventListener("resize", setSize);

        const clock = new THREE.Clock();
        const animate = () => {
          if (disposed) return;
          uniforms.u_time.value = clock.getElapsedTime();
          renderer!.render(scene, camera);
          frameId = requestAnimationFrame(animate);
        };
        animate();
        canvas.style.opacity = "1";

        return () => {
          window.removeEventListener("resize", setSize);
        };
      } catch (e) {
        // WebGL 不可用、视频加载/自动播放失败、shader 编译失败等任何问题——
        // 静默失败，画布保持隐藏，globals.css 的静态海报帧兜底会顶上来。
        console.warn("彩虹云海视频背景未能启动，使用静态海报帧兜底:", e);
      }
    })();

    return () => {
      disposed = true;
      if (frameId) cancelAnimationFrame(frameId);
      renderer?.dispose();
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="lx-shader-canvas fixed inset-0 -z-10 h-full w-full opacity-0 transition-opacity duration-1000"
      aria-hidden="true"
    />
  );
}
