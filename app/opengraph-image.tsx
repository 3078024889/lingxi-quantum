import {ImageResponse} from "next/og";
export const runtime="edge";
export const alt="灵犀场 LINGXIFIELD｜全球 SIAI 排行榜、SASI 智能软件市场与 100+ 在线工具";
export const size={width:1200,height:630};
export const contentType="image/png";
export default function OpenGraphImage(){
 return new ImageResponse(
  <div style={{width:"1200px",height:"630px",display:"flex",position:"relative",overflow:"hidden",background:"linear-gradient(135deg,#ffffff 0%,#f7fbff 54%,#f4f6ff 100%)",color:"#17233d",fontFamily:"Arial, sans-serif"}}>
   <div style={{position:"absolute",width:"650px",height:"650px",right:"-110px",top:"-250px",borderRadius:"50%",background:"radial-gradient(circle,rgba(107,190,255,.25),rgba(180,157,255,.10) 55%,transparent 72%)"}}/>
   <div style={{position:"absolute",width:"500px",height:"500px",right:"110px",bottom:"-360px",borderRadius:"50%",background:"radial-gradient(circle,rgba(255,216,146,.18),transparent 70%)"}}/>
   <div style={{position:"relative",zIndex:2,width:"100%",display:"flex",flexDirection:"column",padding:"48px 58px 42px"}}>
    <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
     <img src="https://lingxifield.com/images/lingxifield-logo.png" width="66" height="66" style={{borderRadius:"50%",objectFit:"contain"}}/>
     <div style={{display:"flex",flexDirection:"column"}}>
      <div style={{fontSize:"25px",fontWeight:800,letterSpacing:"1px"}}>灵犀场 LINGXIFIELD</div>
      <div style={{fontSize:"13px",color:"#64748b",letterSpacing:"2px",marginTop:"4px"}}>GLOBAL INTELLIGENT SERVICES</div>
     </div>
    </div>
    <div style={{display:"flex",flex:1,alignItems:"center",justifyContent:"space-between",gap:"18px"}}>
     <div style={{display:"flex",flexDirection:"column",width:"510px",paddingTop:"10px"}}>
      <div style={{fontSize:"48px",fontWeight:900,lineHeight:1.18,letterSpacing:"-2px"}}>全球智能服务与</div>
      <div style={{fontSize:"48px",fontWeight:900,lineHeight:1.18,letterSpacing:"-2px",color:"#315fcb"}}>实用工具平台</div>
      <div style={{fontSize:"19px",fontWeight:600,color:"#40516c",marginTop:"17px",lineHeight:1.6}}>全球 SIAI 排行榜 · 100+ 在线工具</div>
      <div style={{fontSize:"19px",fontWeight:600,color:"#40516c",lineHeight:1.6}}>SASI 智能软件市场 · MT5 EA · 量化源码</div>
      <div style={{display:"flex",gap:"10px",marginTop:"25px"}}>
       <div style={{padding:"10px 15px",borderRadius:"13px",background:"linear-gradient(135deg,#397cf3,#7455d9)",color:"#fff",fontSize:"14px",fontWeight:800}}>全球 SIAI 排行榜</div>
       <div style={{padding:"10px 15px",borderRadius:"13px",background:"#ffffff",border:"1px solid #d7e1f1",color:"#31415c",fontSize:"14px",fontWeight:800}}>100+ 实用工具</div>
      </div>
     </div>
     <div style={{position:"relative",width:"520px",height:"390px",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{position:"absolute",inset:"20px 0 20px 0",borderRadius:"50%",border:"1px solid rgba(122,155,230,.25)",transform:"rotate(-12deg)"}}/>
      <img src="https://lingxifield.com/images/sasi/sasi-market-hero-lingxifield.png" width="540" height="330" style={{objectFit:"contain"}}/>
     </div>
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #dbe5f3",paddingTop:"16px",color:"#64748b",fontSize:"13px"}}>
     <span>真实数据 · 持续更新 · 全球可用 · 安全高效</span><span style={{color:"#9872c9",fontWeight:700}}>Celestial · LINGXIFIELD</span>
    </div>
   </div>
  </div>,
  {width:1200,height:630}
 );
}
