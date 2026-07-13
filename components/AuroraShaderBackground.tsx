"use client";

import { useEffect, useRef } from "react";

// 彩虹云海背景——不再是纯程序生成的噪声云，而是直接用你拍摄/收集的三张
// 真实云彩虹照片（已裁掉地面建筑和水印，只留蓝天+七彩云）作为贴图，
// GPU 逐帧对采样坐标做一层很轻、低频的水波扭曲，让画面像"隔着一层缓慢
// 流动的水面"看这片天空——云的轮廓、色彩都是照片本身真实的样子，动的
// 只是那层温柔的波纹，不会把照片撕成噪点。三张照片之间每隔一段时间
// 缓慢交叉溶解切换，整个场感觉是活的、在呼吸，但底子始终是真实照片。
//
// 容错设计：WebGL 不可用、贴图加载失败、shader 编译失败等任何问题，
// 都会被捕获，画布直接不显示——这时 globals.css 里那张静态天空照片
// （同一批真实照片之一）会顶上来，绝不会出现白屏或噪点。

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
  uniform float u_time;
  uniform sampler2D u_tex0;
  uniform sampler2D u_tex1;
  uniform sampler2D u_tex2;
  uniform vec2 u_texSize0;
  uniform vec2 u_texSize1;
  uniform vec2 u_texSize2;

  // Simplex noise（Ashima Arts 经典实现）——这里只用它做非常低频、柔和的
  // 位移场，不用来生成云的形状本身，云的形状已经是照片里真实的样子了。
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

  // 把屏幕 uv 按 "cover" 方式映射到某张贴图自己的坐标系里——
  // 保证照片不被拉伸变形，永远铺满整个视口并居中裁切。
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

  // 极慢的镜头漂移（缩放+平移），配合水波扭曲，让"活的场"不仅是纹理在
  // 波动，画面本身也像被一阵很慢的风推着缓缓游移。
  vec2 drift(vec2 uv, float t, float seed) {
    float zoom = 1.0 + 0.05 * sin(t * 0.05 + seed);
    vec2 pan = vec2(sin(t * 0.035 + seed * 3.1), cos(t * 0.028 + seed * 2.3)) * 0.03;
    return (uv - 0.5) * zoom + 0.5 + pan;
  }

  vec3 sampleSky(int idx, vec2 uv, float t) {
    vec2 cuv;
    vec2 ruv = uv;
    // 低频水波：两层不同频率、不同速度的噪声叠加做位移场，振幅很小，
    // 只是让画面"呼吸"，不会破坏照片本身的清晰度和形状。
    float n1 = snoise(uv * 2.2 + vec2(t * 0.10, -t * 0.07) + float(idx) * 11.0);
    float n2 = snoise(uv * 4.1 - vec2(t * 0.06, t * 0.05) + float(idx) * 31.0);
    vec2 rippleOffset = vec2(n1, n2) * 0.012;

    if (idx == 0) {
      cuv = coverUV(drift(ruv, t, 0.0) + rippleOffset, u_resolution, u_texSize0);
      return texture2D(u_tex0, clamp(cuv, 0.0, 1.0)).rgb;
    } else if (idx == 1) {
      cuv = coverUV(drift(ruv, t, 7.0) + rippleOffset, u_resolution, u_texSize1);
      return texture2D(u_tex1, clamp(cuv, 0.0, 1.0)).rgb;
    } else {
      cuv = coverUV(drift(ruv, t, 14.0) + rippleOffset, u_resolution, u_texSize2);
      return texture2D(u_tex2, clamp(cuv, 0.0, 1.0)).rgb;
    }
  }

  void main() {
    vec2 uv = v_uv;
    float t = u_time * 0.5;

    // 三张真实照片轮流展示，每张停留一段时间后缓慢交叉溶解到下一张——
    // 云彩流动漂移的同时，画面本身也在缓缓"转场"，加强"活的场"的感觉。
    float cycle = 16.0;
    float total = cycle * 3.0;
    float phase = mod(u_time, total);
    int idxA = int(mod(floor(phase / cycle), 3.0));
    int idxB = int(mod(floor(phase / cycle) + 1.0, 3.0));
    float localT = mod(phase, cycle) / cycle;
    float blend = smoothstep(0.72, 1.0, localT);

    vec3 colorA = sampleSky(idxA, uv, t);
    vec3 colorB = blend > 0.001 ? sampleSky(idxB, uv, t) : colorA;
    vec3 color = mix(colorA, colorB, blend);

    // 极轻微的暗角，让四周略微收敛，视觉重心留在画面中central，
    // 同时也让贴图边缘的裁切不那么突兀。
    float vig = smoothstep(1.05, 0.35, length((uv - 0.5) * vec2(1.15, 1.0)));
    color *= mix(0.94, 1.0, vig);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const TEXTURE_PATHS = [
  "/images/sky/sky1.jpg",
  "/images/sky/sky2.jpg",
  "/images/sky/sky3.jpg",
];

export default function AuroraShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "low-power" });
        if (disposed) { renderer.dispose(); return; }

        const loader = new THREE.TextureLoader();
        const textures = await Promise.all(
          TEXTURE_PATHS.map(
            (src) =>
              new Promise<import("three").Texture>((resolve, reject) => {
                loader.load(
                  src,
                  (tex) => {
                    tex.colorSpace = THREE.SRGBColorSpace;
                    tex.wrapS = THREE.ClampToEdgeWrapping;
                    tex.wrapT = THREE.ClampToEdgeWrapping;
                    tex.minFilter = THREE.LinearMipmapLinearFilter;
                    tex.magFilter = THREE.LinearFilter;
                    tex.generateMipmaps = true;
                    resolve(tex);
                  },
                  undefined,
                  reject
                );
              })
          )
        );
        if (disposed) { renderer.dispose(); return; }

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const geometry = new THREE.PlaneGeometry(2, 2);
        const uniforms = {
          u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          u_time: { value: 0 },
          u_tex0: { value: textures[0] },
          u_tex1: { value: textures[1] },
          u_tex2: { value: textures[2] },
          u_texSize0: { value: new THREE.Vector2((textures[0].image as HTMLImageElement).width, (textures[0].image as HTMLImageElement).height) },
          u_texSize1: { value: new THREE.Vector2((textures[1].image as HTMLImageElement).width, (textures[1].image as HTMLImageElement).height) },
          u_texSize2: { value: new THREE.Vector2((textures[2].image as HTMLImageElement).width, (textures[2].image as HTMLImageElement).height) },
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
        // WebGL 不可用、贴图加载失败、shader 编译失败等任何问题——静默失败，
        // 画布保持隐藏，globals.css 的静态照片兜底会顶上来，不影响页面正常使用。
        console.warn("彩虹云海背景未能启动，使用静态照片兜底:", e);
      }
    })();

    return () => {
      disposed = true;
      if (frameId) cancelAnimationFrame(frameId);
      renderer?.dispose();
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
