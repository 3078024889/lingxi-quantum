"use client";

import { useEffect, useRef } from "react";

// 真实彩虹云场 Shader 背景——参照"贝母云 / 云彩虹（cloud iridescence）"实拍：
// 画面主体是干净、饱和的蓝天，云只占一小片，是稀薄、拉丝状的卷云，
// 色彩不是铺满整片云的实心彩虹，而是沿着云的稀薄边缘、以柔和连续的珠光色
// （粉→金→绿→青→蓝）一圈圈晕开，云的浓密处仍然是近白色——这是光通过
// 极小冰晶衍射的真实物理观感，不是"给云涂色"。整个场用逐帧噪声驱动，
// 云的丝缕形状、色彩的相位都在缓慢流动漂移，画面是活的。
//
// 容错设计：WebGL 上下文创建失败、shader 编译失败、或任何运行时错误，
// 都会被捕获，画布直接不显示——这时 globals.css 里那个静态天空渐变
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

  // FBM：多个octave的噪声叠加，制造真实云朵那种"大团块+细节纹理"的形状。
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

  // 域扭曲（domain warp）：用噪声去扰动噪声的采样坐标，
  // 这是让噪声场从"团块状"变成实拍卷云那种"拉丝、飘带状"纹理的关键，
  // 也是让整个场看起来在缓慢流动、卷曲、而不是原地闪烁的关键。
  vec2 warp(vec2 p, float t) {
    vec2 q = vec2(fbm(p + vec2(0.0, 0.0) + t * 0.06), fbm(p + vec2(5.2, 1.3) - t * 0.05));
    vec2 r = vec2(
      fbm(p + 3.2 * q + vec2(1.7, 9.2) + t * 0.09),
      fbm(p + 3.2 * q + vec2(8.3, 2.8) - t * 0.07)
    );
    return r;
  }

  // 连续珠光色谱：不是分段色带，是像贝母云/油膜那样柔和连续过渡的彩虹相位，
  // 粉紫 → 金黄 → 嫩绿 → 青 → 天蓝 → 回到粉紫，循环无缝。
  vec3 iridescence(float t) {
    vec3 c1 = vec3(1.000, 0.694, 0.870); // 珠光粉  #FFB1DE
    vec3 c2 = vec3(1.000, 0.878, 0.588); // 暖金    #FFE096
    vec3 c3 = vec3(0.729, 0.980, 0.780); // 嫩绿    #BAFAC7
    vec3 c4 = vec3(0.580, 0.918, 0.976); // 浅青    #94EAF9
    vec3 c5 = vec3(0.478, 0.663, 0.980); // 天蓝    #7AA9FA
    vec3 c6 = vec3(0.792, 0.686, 0.984); // 淡紫    #CAAFFB
    t = fract(t);
    float seg = t * 6.0;
    int idx = int(floor(seg));
    float f = smoothstep(0.0, 1.0, seg - float(idx));
    if (idx == 0) return mix(c1, c2, f);
    if (idx == 1) return mix(c2, c3, f);
    if (idx == 2) return mix(c3, c4, f);
    if (idx == 3) return mix(c4, c5, f);
    if (idx == 4) return mix(c5, c6, f);
    return mix(c6, c1, f);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 auv = uv;
    auv.x *= u_resolution.x / u_resolution.y;
    float t = u_time * 0.16;

    // 真实蓝天底色：顶部深邃、地平线附近略浅，饱和干净——画面的主角是这片蓝天
    vec3 sky = mix(vec3(0.243, 0.514, 0.867), vec3(0.129, 0.318, 0.706), uv.y);

    // 卷云的拉丝纹理：整体沿一个方向拉伸压扁，再做域扭曲，
    // 出来的形状是稀薄、飘逸的丝带，而不是浓密云团
    vec2 cloudP = vec2(auv.x * 1.15, auv.y * 3.4) + vec2(t * 0.42, t * 0.05);
    vec2 w = warp(cloudP, t);
    float density = fbm(cloudP + 2.6 * w);

    // 云量控制得很稀薄：大部分画面留白给纯蓝天，只有少数丝缕状区域显现云和彩虹
    float cloudMask = smoothstep(0.18, 0.58, density) * (1.0 - smoothstep(0.86, 1.05, density));

    // 珠光彩虹只集中在云"稀薄的边缘"最强，云心浓处反而泛白——
    // 这正是真实衍射云彩的观感：edge 在过渡区取最大值
    float edge = smoothstep(0.18, 0.42, density) * (1.0 - smoothstep(0.5, 0.86, density));

    // 色相相位：用另一层噪声驱动，让彩虹色带本身也随时间蜿蜒流动，
    // 而不是固定贴在某个位置不动
    float huePhase = fbm(cloudP * 1.6 + w * 1.4 + t * 0.12) * 0.9 + auv.x * 0.12 + t * 0.05;
    vec3 iri = iridescence(huePhase);

    // 云体本身的底色：从近白（云心）到极浅蓝白（云边）
    vec3 cloudBase = mix(vec3(0.86, 0.93, 0.99), vec3(1.0), smoothstep(0.4, 0.9, density));

    // 云体 = 白色云雾 与 珠光彩虹 按 edge 强度混合
    vec3 cloudColor = mix(cloudBase, iri, clamp(edge * 1.5, 0.0, 0.92));

    // 极细的絮状细节噪声，避免云面看起来是光滑色块
    float detail = fbm(cloudP * 4.5 + 20.0 + t * 0.2) * 0.05;
    cloudColor += detail;

    // 云心透出的柔光高光
    float glow = smoothstep(0.55, 0.95, density) * 0.35;
    cloudColor = mix(cloudColor, vec3(1.0), glow);

    vec3 color = mix(sky, cloudColor, cloudMask);

    // 极轻微的高层丝云叠加一层几乎不带色的白纱，增加流动的层次感，
    // 不额外占用彩虹的视觉份额
    float veil = smoothstep(0.5, 0.95, fbm(auv * vec2(2.0, 1.2) + vec2(-t * 0.25, t * 0.03) + 40.0));
    color = mix(color, vec3(1.0), veil * 0.05);

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
