"use client";

import { PointerEvent, WheelEvent, useMemo, useRef, useState } from "react";

type Point = { lat: number; lon: number };
type Props = { lat: string; lon: string; place: string; onConfirm: (point: Point) => void };

const TILE = 256;
const clampLat = (lat: number) => Math.max(-85.0511, Math.min(85.0511, lat));
const wrapLon = (lon: number) => ((lon + 180) % 360 + 360) % 360 - 180;

function lonToWorldX(lon: number, zoom: number) { return ((lon + 180) / 360) * TILE * 2 ** zoom; }
function latToWorldY(lat: number, zoom: number) {
  const rad = clampLat(lat) * Math.PI / 180;
  return (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * TILE * 2 ** zoom;
}
function worldToPoint(x: number, y: number, zoom: number): Point {
  const size = TILE * 2 ** zoom;
  const lon = x / size * 360 - 180;
  const n = Math.PI - 2 * Math.PI * y / size;
  return { lat: 180 / Math.PI * Math.atan(Math.sinh(n)), lon: wrapLon(lon) };
}

export default function PreciseMapPicker({ lat, lon, place, onConfirm }: Props) {
  const initial = Number.isFinite(Number(lat)) && Number.isFinite(Number(lon)) && lat !== "" && lon !== "" ? { lat: Number(lat), lon: Number(lon) } : { lat: 35.8617, lon: 104.1954 };
  const [open, setOpen] = useState(false);
  const [center, setCenter] = useState<Point>(initial);
  const [zoom, setZoom] = useState(lat && lon ? 16 : 4);
  const [locating, setLocating] = useState(false);
  const drag = useRef<{ x: number; y: number; center: Point } | null>(null);
  const tiles = useMemo(() => {
    const centerX = lonToWorldX(center.lon, zoom), centerY = latToWorldY(center.lat, zoom);
    const baseX = Math.floor(centerX / TILE), baseY = Math.floor(centerY / TILE);
    const count = 2 ** zoom;
    const values: Array<{ key: string; src: string; left: number; top: number }> = [];
    for (let dy = -2; dy <= 2; dy += 1) for (let dx = -2; dx <= 2; dx += 1) {
      const rawX = baseX + dx, y = baseY + dy;
      if (y < 0 || y >= count) continue;
      const x = ((rawX % count) + count) % count;
      values.push({ key: `${zoom}-${rawX}-${y}`, src: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`, left: rawX * TILE - centerX, top: y * TILE - centerY });
    }
    return values;
  }, [center, zoom]);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const x = lonToWorldX(drag.current.center.lon, zoom) - (event.clientX - drag.current.x);
    const y = latToWorldY(drag.current.center.lat, zoom) - (event.clientY - drag.current.y);
    setCenter(worldToPoint(x, y, zoom));
  }
  function wheel(event: WheelEvent<HTMLDivElement>) { event.preventDefault(); setZoom((value) => Math.max(3, Math.min(19, value + (event.deltaY < 0 ? 1 : -1)))); }
  function locate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition((position) => { setCenter({ lat: position.coords.latitude, lon: position.coords.longitude }); setZoom(16); setLocating(false); }, () => setLocating(false), { enableHighAccuracy: true, timeout: 10000 });
  }

  return <div className="sm:col-span-2">
    <p className="text-xs tracking-wider text-bone-dim">精准地图选点 *</p>
    <button type="button" onClick={() => setOpen(true)} className="mt-2 w-full border border-amber/45 bg-amber/[.07] px-4 py-4 text-sm text-amber">{lat && lon ? "重新选择精准地图位置" : "打开地图并选择精准位置"}</button>
    {lat && lon && <div className="mt-2 border-l-2 border-lattice bg-void/35 px-4 py-3 text-xs leading-6 text-bone-dim"><span className="block text-bone">{place || "最后可证之处"}</span>地图坐标已建立 · {Number(lat).toFixed(6)}, {Number(lon).toFixed(6)}</div>}
    {open && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#020715]/90 p-4" role="dialog" aria-modal="true" aria-label="精准地图选点">
      <div className="w-full max-w-3xl border border-white/15 bg-[#091631] p-4 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs tracking-[.24em] text-amber">精准地图 · 中心点定位</p><p className="mt-2 text-xs leading-6 text-bone-dim">拖动地图，使十字标落在最后可确认的位置；滚轮或按钮缩放。若地点就在附近，可先用设备位置定位后再拖动。</p></div><button type="button" onClick={() => setOpen(false)} className="px-3 py-1 text-bone">关闭</button></div>
        <div className="relative mt-4 h-[52vh] min-h-[320px] cursor-grab overflow-hidden bg-[#dce5e8] touch-none active:cursor-grabbing" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); drag.current = { x: event.clientX, y: event.clientY, center }; }} onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onWheel={wheel}>
          {tiles.map((tile) => <img key={tile.key} draggable={false} alt="" src={tile.src} className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 max-w-none select-none" style={{ transform: `translate(${tile.left}px, ${tile.top}px)` }}/>) }
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#f2d487] shadow-[0_0_0_5px_rgba(5,17,42,.5)]"><span className="absolute left-1/2 top-[-9px] h-12 w-px -translate-x-1/2 bg-[#f2d487]"/><span className="absolute left-[-9px] top-1/2 h-px w-12 -translate-y-1/2 bg-[#f2d487]"/></div>
          <div className="absolute bottom-2 left-2 bg-white/85 px-2 py-1 text-[10px] text-slate-700">© OpenStreetMap contributors</div>
          <div className="absolute right-3 top-3 flex flex-col gap-2"><button type="button" onClick={(event) => { event.stopPropagation(); setZoom((z) => Math.min(19, z + 1)); }} className="h-10 w-10 bg-[#091631] text-xl text-bone">+</button><button type="button" onClick={(event) => { event.stopPropagation(); setZoom((z) => Math.max(3, z - 1)); }} className="h-10 w-10 bg-[#091631] text-xl text-bone">−</button><button type="button" onClick={(event) => { event.stopPropagation(); locate(); }} className="h-10 bg-[#091631] px-3 text-xs text-lattice">{locating ? "定位中" : "附近"}</button></div>
        </div>
        <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p className="text-xs text-bone-dim">当前中心：{center.lat.toFixed(6)}, {center.lon.toFixed(6)}</p><button type="button" onClick={() => { onConfirm(center); setOpen(false); }} className="border border-lattice/60 bg-lattice/10 px-6 py-3 text-sm text-lattice">确认此精准位置</button></div>
      </div>
    </div>}
  </div>;
}
