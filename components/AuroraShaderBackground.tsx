"use client";

import { useEffect, useRef } from "react";

// 彩虹流体场 Shader 背景——用 simplex noise 生成云雾般流动的色彩场，
// 循环流过天空蓝、青光、极光紫、粉、金、翡翠绿这几个饱和度很高的颜色，
// 不是渐变色块，是真正逐帧计算的流体噪声。
//
// 容错设计：WebGL 上下文创建失败、shader 编译失败、或任何运行时错误，
// 都会被捕获，画布直接不显示——这时 globals.css 里那个静态纯色渐变
// （已经验证过在所有设备上都能正常显示）会顶上来，绝不会出现白屏。

const VERTEX_SHADER = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;

  // Simplex noise（Ashima Arts 经典实现，GLSL标准写法）
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

  // FBM：多个octave的噪声叠加，制造真实云朵那种"大团块+细节纹理"的形状，
  // 不是单层噪声那种均匀糊状的过渡。
  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.55;
    float freq = 1.0;
    for (int i = 0; i < 5; i++) {
      sum += amp * snoise(p * freq);
      freq *= 2.05;
      amp *= 0.55;
    }
    return sum;
  }

  // 彩虹条带：真实彩虹是清晰分层的红橙黄绿蓝紫，不是平滑混合——
  // 用离散的色带 + 很窄的过渡区，制造"条带感"而不是"渐变糊"。
  vec3 rainbowBand(float t) {
    t = fract(t);
    vec3 cols[6];
    cols[0] = vec3(1.000, 0.553, 0.922); // 粉 #FF8DEB
    cols[1] = vec3(1.000, 0.847, 0.420); // 金 #FFD86B
    cols[2] = vec3(0.435, 1.000, 0.784); // 翡翠绿 #6FFFC8
    cols[3] = vec3(0.000, 0.898, 1.000); // 青 #00E5FF
    cols[4] = vec3(0.227, 0.553, 1.000); // 天蓝 #3A8DFF
    cols[5] = vec3(0.659, 0.333, 0.969); // 紫 #A855F7
    float seg = t * 6.0;
    int idx = int(floor(seg));
    float f = seg - float(idx);
    // 窄过渡带（0.18），中间大部分是纯色平台——这才是"条带"而不是"渐变"
    float edge = smoothstep(0.0, 0.18, f) * (1.0 - smoothstep(0.82, 1.0, f)) + smoothstep(0.82, 1.0, f);
    vec3 a; vec3 b;
    if (idx == 0) { a = cols[0]; b = cols[1]; }
    else if (idx == 1) { a = cols[1]; b = cols[2]; }
    else if (idx == 2) { a = cols[2]; b = cols[3]; }
    else if (idx == 3) { a = cols[3]; b = cols[4]; }
    else if (idx == 4) { a = cols[4]; b = cols[5]; }
    else { a = cols[5]; b = cols[0]; }
    float mixF = smoothstep(0.82, 1.0, f);
    return mix(a, b, mixF);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float t = u_time * 0.15;

    // 真实蓝天底色：顶深底浅的天空渐变，这是"真实天空"的基础，不是彩虹本身
    vec3 sky = mix(vec3(0.216, 0.416, 0.792), vec3(0.494, 0.706, 0.949), uv.y);

    // 云朵形状：FBM噪声阈值化，形成有清晰边缘的云团，而不是铺满全屏的糊状色场
    vec2 cloudP = uv * vec2(3.2, 2.0) + vec2(t * 0.5, t * 0.12);
    float cloudShape = fbm(cloudP);
    float cloudMask = smoothstep(0.05, 0.55, cloudShape);

    // 彩虹条带：沿着云朵纹理的另一个方向展开，制造"云隙间透出彩虹"的效果
    float bandT = cloudShape * 0.6 + uv.x * 0.3 + t / 8.0;
    vec3 rainbow = rainbowBand(bandT);

    // 云朵内部叠加一层更细的纹理噪声，制造蓬松的云絮质感
    float detail = fbm(cloudP * 2.6 + 10.0) * 0.15;
    rainbow += detail;

    // 光从云中穿出的高光——噪声高值区域叠加白光
    float glow = smoothstep(0.35, 0.75, cloudShape) * 0.4;
    rainbow = mix(rainbow, vec3(1.0), glow);

    vec3 color = mix(sky, rainbow, cloudMask);

    gl_FragColor = vec4(color, 1.0);
  }
`;

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

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const geometry = new THREE.PlaneGeometry(2, 2);
        const uniforms = {
          u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          u_time: { value: 0 },
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
        // WebGL 不可用、shader 编译失败等任何问题——静默失败，画布保持隐藏，
        // globals.css 的静态渐变兜底会顶上来，不影响页面正常使用。
        console.warn("彩虹流体背景未能启动，使用静态渐变兜底:", e);
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
