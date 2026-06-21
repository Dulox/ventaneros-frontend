import { useState, useEffect } from "react";
import { loginWithEmail, signupWithEmail, logout, isLoggedIn, calcularEnServidor, descargarOrdenPDF } from "./api.js";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Display:wght@400;500;700&family=Roboto:wght@300;400;500&family=Roboto+Mono:wght@400;500&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  /* Google Material You — Blue theme */
  --pri:#1a73e8;--pri-dark:#1557b0;--pri-light:#e8f0fe;--pri-light2:#d2e3fc;
  --on-pri:#fff;
  --sec:#188038;--sec-light:#e6f4ea;
  --ter:#b5179e;--ter-light:#fce4ec;
  --err:#d93025;--err-light:#fce8e6;
  --warn:#f9ab00;--warn-light:#fef7e0;

  --sur:#fff;--sur2:#f8f9fa;--sur3:#f1f3f4;--sur4:#e8eaed;--sur5:#dadce0;
  --on-sur:#202124;--on-sur2:#3c4043;--on-sur3:#5f6368;--on-sur4:#80868b;
  --out:#dadce0;--out2:#bdc1c6;

  --sh1:0 1px 2px rgba(60,64,67,.3),0 1px 3px 1px rgba(60,64,67,.15);
  --sh2:0 1px 2px rgba(60,64,67,.3),0 2px 6px 2px rgba(60,64,67,.15);
  --sh3:0 4px 8px 3px rgba(60,64,67,.15),0 1px 3px rgba(60,64,67,.3);
  --r-sm:8px;--r-md:12px;--r-lg:16px;--r-xl:24px;--r-full:50px;
}
html,body,#root{height:100%;background:var(--sur2)}
body{color:var(--on-sur);font-family:'Inter',sans-serif;font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased}

/* ── SHELL ── */
.shell{display:flex;height:100vh;overflow:hidden}

/* ── NAVIGATION RAIL (Google style) ── */
.nav-rail{width:72px;min-width:72px;background:var(--sur2);display:flex;flex-direction:column;align-items:center;padding:16px 0;border-right:1px solid var(--out);z-index:10;transition:width .25s}
.nav-rail.expanded{width:256px;align-items:flex-start}
.rail-logo{width:40px;height:40px;border-radius:50%;background:var(--pri);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;margin-bottom:8px;flex-shrink:0;cursor:pointer;transition:all .2s}
.rail-logo:hover{box-shadow:var(--sh2)}
.rail-wordmark{display:none;font-size:14px;font-weight:600;color:var(--on-sur);white-space:nowrap}
.nav-rail.expanded .rail-wordmark{display:block}
.rail-header{display:flex;align-items:center;gap:10px;padding:0 16px;margin-bottom:8px;width:100%}
.nav-rail:not(.expanded) .rail-header{padding:0;justify-content:center}

.rail-sec{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:var(--on-sur4);padding:12px 16px 4px;white-space:nowrap;display:none}
.nav-rail.expanded .rail-sec{display:block}
.nav-rail:not(.expanded) .rail-sec{display:none}

.ni{display:flex;flex-direction:column;align-items:center;gap:3px;width:64px;padding:8px 4px;border-radius:var(--r-lg);cursor:pointer;transition:all .2s;color:var(--on-sur3);text-decoration:none;position:relative;flex-shrink:0}
.nav-rail.expanded .ni{flex-direction:row;width:100%;padding:10px 16px;border-radius:var(--r-full);gap:12px}
.ni:hover{background:var(--sur3)}
.ni.on{color:var(--pri)}
.nav-rail:not(.expanded) .ni.on{background:var(--pri-light2)}
.nav-rail.expanded .ni.on{background:var(--pri-light);color:var(--pri-dark)}
.ni-icon{font-size:20px;line-height:1;flex-shrink:0;width:24px;text-align:center}
.ni-lbl{font-size:11px;font-weight:500;white-space:nowrap;display:none}
.nav-rail:not(.expanded) .ni-lbl{display:block;font-size:10px}
.nav-rail.expanded .ni-lbl{display:block;font-size:13px;font-weight:500}
.ni-badge{background:var(--pri);color:#fff;font-size:10px;font-weight:700;padding:0 6px;border-radius:var(--r-full);min-width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace}
.nav-rail:not(.expanded) .ni-badge{position:absolute;top:4px;right:4px;font-size:9px;min-width:16px;height:16px}
.nav-rail.expanded .ni-badge{margin-left:auto}
.ni-badge-g{background:var(--sec)}

.nav-divider{width:calc(100% - 32px);height:1px;background:var(--out);margin:8px 16px}
.nav-rail:not(.expanded) .nav-divider{width:40px}
.sb-user-row{margin-top:auto;width:100%;padding:0 12px}
.nav-rail.expanded .sb-user-row{padding:0 8px}
.sb-user{display:flex;align-items:center;gap:10px;padding:8px;border-radius:var(--r-full);cursor:pointer;transition:all .2s;width:100%}
.sb-user:hover{background:var(--sur3)}
.sb-av{width:32px;height:32px;border-radius:50%;background:var(--pri);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0}
.sb-info{display:none}
.nav-rail.expanded .sb-info{display:block}
.sb-un{font-size:13px;font-weight:500;color:var(--on-sur);white-space:nowrap}
.sb-ur{font-size:11px;color:var(--on-sur3);white-space:nowrap}

/* ── MAIN ── */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--sur2)}

/* ── TOP APP BAR (Google style) ── */
.topbar{height:64px;min-height:64px;background:var(--sur2);display:flex;align-items:center;padding:0 24px;gap:12px}
.topbar-title{font-size:22px;font-weight:400;color:var(--on-sur);flex:1;letter-spacing:0}
.topbar-search{display:flex;align-items:center;gap:8px;background:var(--sur);border:1px solid var(--out);border-radius:var(--r-full);padding:8px 16px;color:var(--on-sur3);min-width:240px;transition:all .2s;box-shadow:var(--sh1)}
.topbar-search:focus-within{background:var(--sur);box-shadow:var(--sh2);border-color:var(--pri)}
.topbar-search input{border:none;background:transparent;outline:none;font-family:inherit;font-size:14px;color:var(--on-sur);flex:1;width:100%}
.topbar-search input::placeholder{color:var(--on-sur4)}

.content{flex:1;overflow-y:auto;padding:0 24px 24px}
.content::-webkit-scrollbar{width:8px}
.content::-webkit-scrollbar-thumb{background:var(--out);border-radius:4px}

/* ── GOOGLE BUTTONS ── */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 24px;border-radius:var(--r-full);border:none;cursor:pointer;font-family:inherit;font-size:14px;font-weight:500;transition:all .2s;white-space:nowrap;letter-spacing:.25px}
.btn-filled{background:var(--pri);color:#fff;box-shadow:var(--sh1)}
.btn-filled:hover{background:var(--pri-dark);box-shadow:var(--sh2)}
.btn-tonal{background:var(--pri-light);color:var(--pri-dark)}
.btn-tonal:hover{background:var(--pri-light2)}
.btn-outlined{background:transparent;color:var(--pri);border:1px solid var(--out)}
.btn-outlined:hover{background:var(--pri-light)}
.btn-text{background:transparent;color:var(--pri)}
.btn-text:hover{background:var(--pri-light)}
.btn-err{background:var(--err-light);color:var(--err)}
.btn-err:hover{background:#f8d7d4}
.btn-sm{padding:6px 16px;font-size:13px}
.btn-xs{padding:4px 12px;font-size:12px}
.icon-btn{width:40px;height:40px;border-radius:50%;border:none;background:transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:18px;color:var(--on-sur3);transition:all .2s}
.icon-btn:hover{background:var(--sur3)}
.icon-btn.danger:hover{background:var(--err-light);color:var(--err)}

/* ── CARDS (Google Material) ── */
.card{background:var(--sur);border-radius:var(--r-lg);box-shadow:var(--sh1);overflow:hidden}
.card-elevated{box-shadow:var(--sh2)}
.card-outlined{box-shadow:none;border:1px solid var(--out)}
.card-hdr{padding:16px 20px 0;display:flex;align-items:center;gap:12px}
.card-ttl{font-size:16px;font-weight:500;color:var(--on-sur);flex:1}
.card-sub{font-size:13px;color:var(--on-sur3);margin-top:1px}
.card-bdy{padding:16px 20px}
.card-divider{height:1px;background:var(--out);margin:0 20px}

/* ── CHIPS ── */
.chip{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:var(--r-full);font-size:12px;font-weight:500;border:1px solid var(--out);background:var(--sur);color:var(--on-sur3)}
.chip-filled-pri{background:var(--pri-light);color:var(--pri-dark);border-color:var(--pri-light)}
.chip-filled-sec{background:var(--sec-light);color:var(--sec);border-color:var(--sec-light)}
.chip-filled-err{background:var(--err-light);color:var(--err);border-color:var(--err-light)}
.chip-filled-warn{background:var(--warn-light);color:#a07000;border-color:var(--warn-light)}

/* ── TABLE ── */
.twrap{overflow-x:auto}
table{width:100%;border-collapse:collapse}
thead th{font-size:12px;font-weight:500;color:var(--on-sur3);padding:10px 16px;text-align:left;border-bottom:1px solid var(--out);background:var(--sur2);white-space:nowrap;letter-spacing:.3px}
tbody td{padding:12px 16px;border-bottom:1px solid var(--out);font-size:13px;color:var(--on-sur);vertical-align:middle}
tbody tr:last-child td{border-bottom:none}
tbody tr{transition:background .1s}
tbody tr:hover td{background:var(--sur3)}
.mono{font-family:'JetBrains Mono',monospace;font-size:12px}

/* ── STATS ── */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
.stat-card{background:var(--sur);border-radius:var(--r-lg);padding:20px;box-shadow:var(--sh1);transition:box-shadow .2s}
.stat-card:hover{box-shadow:var(--sh2)}
.stat-icon-wrap{width:48px;height:48px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:14px}
.stat-num{font-size:28px;font-weight:400;color:var(--on-sur);line-height:1;margin-bottom:4px}
.stat-lbl{font-size:12px;color:var(--on-sur3);font-weight:500;text-transform:uppercase;letter-spacing:.5px}
.stat-sub{font-size:12px;margin-top:6px;font-weight:500}

/* ── FORM FIELDS (Google style) ── */
.fgrid{display:grid;gap:16px}.f2{grid-template-columns:1fr 1fr}.f3{grid-template-columns:1fr 1fr 1fr}
.fld{display:flex;flex-direction:column;gap:0;position:relative}
.fld label{font-size:12px;font-weight:500;color:var(--on-sur3);margin-bottom:6px;letter-spacing:.3px}
.fld input,.fld select,.fld textarea{
  background:var(--sur);border:1px solid var(--out);border-radius:var(--r-sm);
  padding:10px 14px;font-family:inherit;font-size:14px;color:var(--on-sur);
  outline:none;transition:all .2s;width:100%;
}
.fld input:hover,.fld select:hover{border-color:var(--on-sur4)}
.fld input:focus,.fld select:focus,.fld textarea:focus{border-color:var(--pri);border-width:2px;padding:9px 13px;box-shadow:0 0 0 0px var(--pri-light)}
.fld select{cursor:pointer}
.fld textarea{resize:vertical;min-height:72px}

/* ── MODAL ── */
.modal-bd{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.32);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease}
.modal{background:var(--sur);border-radius:28px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;animation:slideUp .25s ease;box-shadow:0 24px 48px rgba(0,0,0,.2)}
.modal-hdr{padding:24px 24px 16px;display:flex;align-items:center;gap:12px}
.modal-ttl{font-size:20px;font-weight:500;color:var(--on-sur);flex:1}
.modal-bdy{padding:0 24px 8px}
.modal-ftr{padding:16px 24px 24px;display:flex;justify-content:flex-end;gap:8px}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* ── SEARCH BAR ── */
.sbar{display:flex;align-items:center;gap:8px;background:var(--sur);border:1px solid var(--out);border-radius:var(--r-full);padding:8px 16px;color:var(--on-sur3);transition:all .2s;box-shadow:var(--sh1);flex:1;max-width:320px}
.sbar:focus-within{box-shadow:var(--sh2);border-color:var(--pri)}
.sbar input{border:none;background:transparent;outline:none;font-family:inherit;font-size:14px;color:var(--on-sur);flex:1}

/* ── SEGMENTED TABS ── */
.seg-tabs{display:flex;gap:0;background:var(--sur2);border-radius:var(--r-full);padding:4px;margin-bottom:20px;width:fit-content;border:1px solid var(--out)}
.seg-tab{padding:6px 20px;border-radius:var(--r-full);cursor:pointer;font-size:13px;font-weight:500;color:var(--on-sur3);transition:all .2s;border:none;background:transparent;font-family:inherit}
.seg-tab.on{background:var(--sur);color:var(--pri);font-weight:600;box-shadow:var(--sh1)}

/* ── CALC LAYOUT ── */
.cl{display:grid;grid-template-columns:300px 1fr;gap:20px;align-items:start}
.cr{display:flex;flex-direction:column;gap:14px;animation:fadeUp .3s ease}

/* ── METRIC HERO ── */
.hero{background:linear-gradient(135deg,var(--pri) 0%,var(--pri-dark) 100%);border-radius:var(--r-xl);padding:24px 28px;display:flex;justify-content:space-between;align-items:center;box-shadow:var(--sh3)}
.hl{font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,.7);margin-bottom:4px;font-weight:500}
.hs{font-size:12px;color:rgba(255,255,255,.6);margin-top:6px;display:flex;gap:6px;flex-wrap:wrap}
.ht{background:rgba(255,255,255,.15);border-radius:var(--r-full);padding:2px 10px;font-size:11px;color:rgba(255,255,255,.9)}
.hn{font-size:48px;font-weight:300;color:#fff;line-height:1}
.hu{font-size:12px;color:rgba(255,255,255,.6);text-align:right;margin-top:4px}

/* ── DIM GRID ── */
.dg{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.db{background:var(--sur2);border-radius:var(--r-sm);padding:10px 12px;border:1px solid var(--out)}
.dl{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--on-sur3);margin-bottom:3px;font-weight:500}
.dv{font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--pri-dark);font-weight:500}

/* ── HW GRID ── */
.hwg{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.hwb{background:var(--sur2);border-radius:var(--r-md);padding:14px;text-align:center;border:1px solid var(--out)}
.hwn{font-size:26px;font-weight:300;color:var(--pri);line-height:1;margin-bottom:4px}
.hwl{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--on-sur3);font-weight:500}

/* ── VENTANA GRID ── */
.vg{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}
.vc{background:var(--sur);border-radius:var(--r-lg);padding:20px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;border:1px solid var(--out);box-shadow:var(--sh1)}
.vc:hover{box-shadow:var(--sh3);transform:translateY(-2px)}
.vc.off{opacity:.55;cursor:default}.vc.off:hover{transform:none;box-shadow:var(--sh1)}
.vi{font-size:28px;margin-bottom:10px}.vn{font-size:15px;font-weight:500;color:var(--on-sur);margin-bottom:4px}.vd{font-size:12px;color:var(--on-sur3);line-height:1.5}
.vbg{position:absolute;top:12px;right:12px;font-size:11px;font-weight:600}

/* ── ORDER TABLE ── */
.order-wrap{background:var(--sur);border-radius:var(--r-lg);box-shadow:var(--sh1);overflow:hidden;margin-top:20px;border:1px solid var(--out)}
.order-hdr{padding:16px 20px;background:linear-gradient(90deg,var(--pri-light),var(--sur));display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--out)}
.order-hdr-ttl{font-size:15px;font-weight:500;color:var(--pri-dark);flex:1}
.order-stats{display:flex;gap:16px;font-size:12px;color:var(--on-sur3)}
.order-stat{display:flex;flex-direction:column;align-items:center}
.order-stat-n{font-size:15px;font-weight:600;color:var(--on-sur)}
.del-btn{opacity:0;transition:opacity .15s}
tbody tr:hover .del-btn{opacity:1}

/* ── ADD LINE BUTTON ── */
.add-line-btn{width:100%;padding:12px;background:transparent;border:2px dashed var(--out);border-radius:var(--r-md);cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;color:var(--on-sur3);transition:all .2s;margin-top:12px;display:flex;align-items:center;justify-content:center;gap:8px}
.add-line-btn:hover{border-color:var(--pri);color:var(--pri);background:var(--pri-light)}

/* ── ACTIVITY ── */
.act-i{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--out)}
.act-i:last-child{border-bottom:none}
.act-d{width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0}
.act-t{font-size:13px;color:var(--on-sur)}.act-s{font-size:12px;color:var(--on-sur4);margin-top:2px}

/* ── LICENSE ── */
.lic-screen{position:fixed;inset:0;z-index:999;background:linear-gradient(135deg,#1a73e8 0%,#1557b0 50%,#0d47a1 100%);display:flex;align-items:center;justify-content:center}
.lic-box{background:#fff;border-radius:28px;width:100%;max-width:420px;padding:40px;box-shadow:0 24px 64px rgba(0,0,0,.25)}
.lic-icon{width:64px;height:64px;background:var(--pri-light);border-radius:var(--r-xl);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 20px}
.lic-title{font-size:24px;font-weight:500;color:var(--on-sur);text-align:center;margin-bottom:6px}
.lic-sub{font-size:14px;color:var(--on-sur3);text-align:center;margin-bottom:28px}
.lic-lbl{font-size:12px;font-weight:500;color:var(--on-sur3);margin-bottom:6px;letter-spacing:.3px}
.lic-in{width:100%;background:var(--sur2);border:1px solid var(--out);border-radius:var(--r-sm);padding:12px 16px;font-family:'JetBrains Mono',monospace;font-size:16px;color:var(--on-sur);outline:none;text-align:center;letter-spacing:3px;transition:all .2s;margin-bottom:16px}
.lic-in:focus{border-color:var(--pri);border-width:2px;background:var(--sur)}
.lic-btn{width:100%;padding:14px;background:var(--pri);color:#fff;border:none;border-radius:var(--r-full);cursor:pointer;font-family:inherit;font-size:15px;font-weight:500;transition:all .2s;letter-spacing:.25px}
.lic-btn:hover{background:var(--pri-dark);box-shadow:var(--sh2)}
.lic-err{font-size:13px;color:var(--err);text-align:center;margin-top:10px}
.lic-hint{font-size:12px;color:var(--on-sur4);text-align:center;margin-top:16px}

/* ── PILL for table ── */
.tpill{display:inline-flex;align-items:center;padding:2px 10px;border-radius:var(--r-full);font-size:11px;font-weight:500}

/* ── SECTION HEADER ── */
.sec-hdr{display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid var(--out)}
.sec-hdr-title{font-size:18px;font-weight:400;color:var(--on-sur);flex:1}

/* ── SUMMARY ROW ── */
.summary-row{display:flex;gap:8px;padding:10px 16px;background:var(--sur2);border-top:1px solid var(--out);font-size:12px;color:var(--on-sur3);flex-wrap:wrap}
.summary-item{display:flex;gap:4px;align-items:center}
.summary-val{font-weight:600;color:var(--on-sur)}

/* FAB */
.fab{position:fixed;bottom:24px;right:24px;background:var(--pri);color:#fff;border:none;border-radius:var(--r-xl);padding:14px 20px;font-family:inherit;font-size:14px;font-weight:500;cursor:pointer;box-shadow:var(--sh3);display:flex;align-items:center;gap:8px;transition:all .2s;z-index:50}
.fab:hover{background:var(--pri-dark);box-shadow:0 6px 12px rgba(26,115,232,.4)}
`;

// ═══ CALC LOGIC (unchanged) ════════════════════════════════════════════════
const FR=[[0,""],[.0625,"1/16"],[.125,"1/8"],[.1875,"3/16"],[.25,"1/4"],[.3125,"5/16"],[.375,"3/8"],[.4375,"7/16"],[.5,"1/2"],[.5625,"9/16"],[.625,"5/8"],[.6875,"11/16"],[.75,"3/4"],[.8125,"13/16"],[.875,"7/8"],[.9375,"15/16"]];
function tf(v){const i=Math.floor(v),d=v-i;let c=FR[0],mn=99;for(const f of FR){const x=Math.abs(f[0]-d);if(x<mn){mn=x;c=f;}}return c[1]?i+" "+c[1]+'"':i+'"';}
function r2(n){return Math.round(n*100)/100;}

// ═══ REAL PDF GENERATOR ══════════════════════════════════════════════════════
// Renders an HTML string (style+body) to a real downloadable .pdf using
// html2canvas + jsPDF loaded from CDN inside a hidden iframe. No server needed.
function downloadAsPDF(styleBlock, bodyHtml, filename){
  // Visible status toast so the user always sees what's happening (never silent)
  var toast=document.createElement("div");
  toast.style.cssText="position:fixed;bottom:24px;right:24px;z-index:99999;background:#202124;color:#fff;padding:12px 20px;border-radius:8px;font-family:Inter,sans-serif;font-size:13px;box-shadow:0 4px 16px rgba(0,0,0,.3);display:flex;align-items:center;gap:10px;max-width:320px";
  toast.innerHTML='<span style="font-size:16px">⏳</span><span>Generando PDF...</span>';
  document.body.appendChild(toast);
  function setToast(icon,text,autoHideMs){
    toast.innerHTML='<span style="font-size:16px">'+icon+'</span><span>'+text+'</span>';
    if(autoHideMs){
      setTimeout(function(){ if(toast&&toast.parentNode){ toast.parentNode.removeChild(toast); } }, autoHideMs);
    }
  }

  function fallbackHtml(reason){
    var html='<!DOCTYPE html><html><head><meta charset="utf-8"/><style>'+styleBlock+'</style></head><body>'+bodyHtml+'</body></html>';
    var blob=new Blob([html],{type:"text/html;charset=utf-8"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");
    a.href=url; a.download=filename.replace(/\.pdf$/i,"")+".html";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
    setToast("📄","Se descargó como HTML (abrir y usar Ctrl+P para PDF)",5000);
  }

  function loadScript(src){
    return new Promise(function(resolve,reject){
      var existing=document.querySelector('script[data-src="'+src+'"]');
      if(existing){ resolve(); return; }
      var s=document.createElement("script");
      s.src=src;
      s.setAttribute("data-src",src);
      s.onload=function(){ resolve(); };
      s.onerror=function(){ reject(new Error("load failed: "+src)); };
      document.head.appendChild(s);
    });
  }

  function render(){
    var w=window;
    if(!w.jspdf||!w.jspdf.jsPDF){
      fallbackHtml("jsPDF not available");
      return;
    }
    var jsPDF=w.jspdf.jsPDF;

    var container=document.createElement("div");
    container.style.position="fixed";
    container.style.left="0";
    container.style.top="0";
    container.style.zIndex="-1";
    container.style.opacity="0";
    container.style.pointerEvents="none";
    container.style.width="816px";
    container.style.background="#ffffff";

    var styleEl=document.createElement("style");
    styleEl.textContent=styleBlock;
    container.appendChild(styleEl);

    var bodyWrap=document.createElement("div");
    bodyWrap.innerHTML=bodyHtml;
    container.appendChild(bodyWrap);

    document.body.appendChild(container);

    var pdf=new jsPDF({unit:"pt",format:"letter"});
    var safetyTimer=setTimeout(function(){
      if(container&&container.parentNode){ container.parentNode.removeChild(container); }
      fallbackHtml("timeout");
    }, 12000);

    try{
      pdf.html(container,{
        x:18, y:18,
        width:576,
        windowWidth:816,
        autoPaging:"text",
        html2canvas:{scale:0.75, backgroundColor:"#ffffff", useCORS:true},
        callback:function(doc){
          clearTimeout(safetyTimer);
          try{
            doc.save(filename);
            setToast("✅","PDF descargado",3000);
          }
          catch(e){ fallbackHtml("save failed"); }
          if(container&&container.parentNode){ container.parentNode.removeChild(container); }
        }
      });
    }catch(e){
      clearTimeout(safetyTimer);
      if(container&&container.parentNode){ container.parentNode.removeChild(container); }
      fallbackHtml("html() threw");
    }
  }

  if(window.jspdf&&window.jspdf.jsPDF){
    render();
    return;
  }
  setToast("⏳","Cargando librerías PDF...");
  loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js")
    .then(function(){
      return loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
    })
    .then(function(){
      setToast("⏳","Generando PDF...");
      setTimeout(render, 50);
    })
    .catch(function(){
      fallbackHtml("cdn load failed");
    });
}

function red(cpp){return cpp<=9?3.5:cpp<=18?6:9;}
function pieFn(W,H,qty){const st=[];for(let a=22.75;a<=106.75;a+=3.5)st.push(parseFloat(a.toFixed(2)));const bn=[24,48,72,96,120,144];let hM=144;for(const b of bn){if(W<=b){hM=b;break;}}let ca=st[st.length-1];for(const s of st){if(H<=s){ca=s;break;}}let t=(hM*ca)/144;if(W>hM)t=(W*ca)/144;if(t<5)t=5;return r2(t*qty);}
function balA(cc,cu,qty){const b={b1:"",b2:"",op:0};if(cc<=9){b.op=cu*qty;b.b1=(cu*2*qty)+"/"+Math.floor(cc/cu-.5);}else if(cc<=18){const q=cu*4;b.op=cu*2*qty;if(Math.floor(cc/2)===cc/2){b.b1=(q*qty)+"/"+(cc/2);}else{const bv=cc/((q/2)/2),bb=bv/2,a=(bv-bb)-1;b.b1=bb<a?((q/2)*qty)+"/"+Math.round(a):((q/2)*qty)+"/"+Math.round(bb);b.b2=bb<a?((q/2)*qty)+"/"+Math.round(bb):((q/2)*qty)+"/"+Math.round(a);}}else if(cc<=27){const q=cu*6;b.op=cu*3*qty;if(Math.floor(cc/3)===cc/3){b.b1=(q*qty)+"/"+(cc/3);}else{const a=Math.floor(cc/3),bv=(cc/3)-a;b.b1=bv<=.5?(cu*4*qty)+"/"+a:(cu*4*qty)+"/"+(a+1);b.b2=bv<=.5?(cu*2*qty)+"/"+(a+1):(cu*2*qty)+"/"+a;}}return b;}
function balAA(cc,cu,qty){const b={b1:"",b2:"",op:0};if(cc<=9){b.op=cu*qty;b.b1=(cu*2*qty)+"/"+Math.floor(cc/cu);}else if(cc<=18){const q=cu*4;b.op=cu*2*qty;if(Math.floor(cc/2)===cc/2){b.b1=q+"/"+(cc/2);}else{const bv=cc/((q/2)/2),bb=bv/2,a=(bv-bb)-1;b.b1=bb<a?((q/2)*qty)+"/"+Math.round(a):((q/2)*qty)+"/"+Math.round(bb);b.b2=bb<a?((q/2)*qty)+"/"+Math.round(bb):((q/2)*qty)+"/"+Math.round(a);}}else if(cc<=27){const q=cu*6*qty;b.op=cu*3*qty;if(Math.floor(cc/3)===cc/3){b.b1=q+"/"+(cc/3);}else{const a=Math.floor(cc/2),bv=(cc/3)-a;b.b1=bv<=.5?(cu*2*qty)+"/"+a:(cu*2*qty)+"/"+(a+1);b.b2=bv<=.5?(cu*2*qty)+"/"+(a+1):(cu*2*qty)+"/"+a;}}return b;}
function calcCor({ancho,alto,hojas,cantidad,unidad,material,vidrio}){let W=ancho,H=alto;if(unidad==="Metros"){W*=39.375;H*=39.375;}const er=[];if(W<10)er.push('Ancho mínimo: 10".');if(H<10)er.push('Alto mínimo: 10".');if(H>252)er.push('Alto máximo: 252".');if(er.length)return{errors:er};const lt=H-.5,ct=W-.25,jt=H-.875,vh=H-4.125,lc=2*cantidad,cc=cantidad;let cht,chc,vw,vc,cr,fl=4*(jt/12)*cantidad;if(hojas===2){cht=(W-.5)/2;chc=2*cantidad;vw=(W-4.125)/2;vc=2*cantidad;cr=2*cantidad;}else if(hojas===3){cht=(W+.9)/3;chc=2*cantidad;vw=(W-4.5625)/3;vc=3*cantidad;cr=2*cantidad;}else if(hojas===4){cht=(W-.5)/2;chc=2*cantidad;vw=(W-4.125)/2;vc=4*cantidad;cr=4*cantidad;}else{cht=(W+.9)/3;chc=2*cantidad;vw=(W-4.5625)/3;vc=6*cantidad;cr=2*cantidad;}const jlc=(hojas<=3)?2*cantidad:4*cantidad,jec=(hojas===2)?2*cantidad:(hojas===6)?8*cantidad:4*cantidad,ac=hojas===4?cantidad:0;let p=(W*H)/144;const M=16;if(hojas===2&&p<M)p=M;if(hojas===3&&p<M*1.5)p=M*1.5;if(hojas===4&&p<M*2)p=M*2;if(hojas===6&&p<M*3)p=M*3;const pies={lat:r2((lc*lt)/12),cab:r2((cc*ct)/12),rie:r2((cc*ct)/12),chb:r2((chc*cht)/12),alf:r2((chc*cht)/12),jll:r2((jlc*jt)/12),jng:r2((jec*jt)/12),ada:ac>0?r2((ac*jt)/12):0};const hw={rue:hojas*2*cantidad,gui:hojas*2*cantidad,tor:hojas*6*cantidad,cer:cr,gom:r2(vc*((vw*2+vh*2)/12)),fel:r2(fl)};return{errors:[],tipo:"cor",dim:{ancho:tf(W),alto:tf(H),lt:tf(lt),ct:tf(ct),jt:tf(jt),cht:tf(cht),vw:tf(vw),vh:tf(vh)},pies,hw,glass:{tipo:vidrio,cant:vc,sqft:r2((vc*(vw*vh))/144)},pie:r2(p*cantidad),material,hojas,cantidad,label:`Corrediza ${tf(W)}×${tf(H)} ${hojas}H ×${cantidad}`};}
function calcPA({ancho,alto,cuerpo,cantidad,unidad,tipo,vidrio,material}){let W=ancho,H=alto;if(unidad==="Metros"){W*=39.375;H*=39.375;}const er=[];if(W<4)er.push('Ancho mínimo: 4".');if(H<8.75)er.push('Alto mínimo: 8.75".');if(H>106.75)er.push('Alto máximo: 106.75".');if(er.length)return{errors:er};const cc2=Math.floor(H/3.5)*cuerpo,tc=((W-.25)/cuerpo)-1.5,tce=tipo==="Aluminio"?(tc-.25)+.25:tc-.125;const jt=H-.25,jl=cuerpo+1,jm=cuerpo>1?cuerpo-1:0,c2=Math.floor(H/3.5),bl=balA(c2,cuerpo,cantidad);const rv=red(cc2/cuerpo),lb=(jt-rv)*2;const gom=tipo==="Vidrio"?cantidad*(cuerpo*(jt*2)/12)+((cantidad*cuerpo*tc)/12):cantidad*(cuerpo*(jt*2)/12);const pies={cel:r2(cantidad*((cc2*tce)+(4*cc2))/12),bal:r2(cantidad*(cuerpo*lb)/12),cab:r2(cantidad*cuerpo*tc/12),alf:r2(cantidad*cuerpo*tc/12),jll:r2(cantidad*(jl*jt)/12),jmm:jm>0?r2(cantidad*(jm*jt)/12):0};const hw={gom:r2(gom),cli:tipo==="Vidrio"?cc2*cantidad*2:0,rem:4*cc2*cantidad,op:bl.op,tc:cantidad*(4*cuerpo),te:(H>44?3:2)*jm};return{errors:[],tipo:"pa",dim:{ancho:tf(W),alto:tf(H),tce:tf(tce),tc:tf(tc),jt:tf(jt),lb:tf(lb)},cnt:{cc:cc2*cantidad,cab:cantidad*cuerpo,jl:jl*cantidad,jm:jm*cantidad},pies,hw,bl,ft:pieFn(W,H,cantidad),tipoPer:tipo,vidrio,material,cuerpo,cantidad,lam:tipo==="Vidrio"?r2((cc2*cantidad*tce)/12):0,pie:pieFn(W,H,cantidad),label:`Persiana A ${tf(W)}×${tf(H)} ${cuerpo}C ×${cantidad}`};}
function calcPAA({ancho,alto,cuerpo,cantidad,unidad,tipo,vidrio,material}){let W=ancho,H=alto;if(unidad==="Metros"){W*=39.375;H*=39.375;}const er=[];if(W<4)er.push('Ancho mínimo: 4".');if(H<8.75)er.push('Alto mínimo: 8.75".');if(H>106.75)er.push('Alto máximo: 106.75".');if(er.length)return{errors:er};const tce=tipo==="Aluminio"?(W-(0.25+(2*cuerpo)))/cuerpo:(W-(0.375+(2*cuerpo)))/cuerpo;const tc=W-.25,cc2=Math.floor(H/3.5)*cuerpo,jt=H-.625,jl=cuerpo+1,jm=cuerpo>1?cuerpo-1:0;const c2=Math.floor(H/3.5),bl=balAA(c2,cuerpo,cantidad),rv=red(cc2/cuerpo),lb=(jt-rv)*2;const E=H>50?4:H>36?3:2,gom=tipo==="Vidrio"?cantidad*(cuerpo*(jt*2)/12)+(cantidad*tc)/12:cantidad*(cuerpo*(jt*2)/12);const pies={cel:r2(cantidad*((cc2*tce)+(4*cc2))/12),bal:r2(cantidad*(cuerpo*lb)/12),cab:r2((cantidad*tc)/12),alf:r2((cantidad*tc)/12),jll:r2(cantidad*(jl*jt)/12),jmm:jm>0?r2(cantidad*(jm*jt)/12):0};const hw={gom:r2(gom),cli:tipo==="Vidrio"?cc2*cantidad*2:0,rem:4*cc2*cantidad,op:bl.op,tc:cantidad*8,te:cantidad*((E*jm)+(jm*6))};return{errors:[],tipo:"paa",dim:{ancho:tf(W),alto:tf(H),tce:tf(tce),tc:tf(tc),jt:tf(jt),lb:tf(lb)},cnt:{cc:cc2*cantidad,cab:cantidad,jl:jl*cantidad,jm:jm*cantidad},pies,hw,bl,ft:pieFn(W,H,cantidad),tipoPer:tipo,vidrio,material,cuerpo,cantidad,lam:tipo==="Vidrio"?r2((cc2*cantidad*tce)/12):0,pie:pieFn(W,H,cantidad),label:`Persiana AA ${tf(W)}×${tf(H)} ${cuerpo}C ×${cantidad}`};}
function calcP92({ancho,alto,hojas,cantidad,unidad,riel,material,vidrio}){
  let W=ancho,H=alto;if(unidad==="Metros"){W*=39.375;H*=39.375;}
  const er=[];if(W<10)er.push('Ancho mínimo: 10".');if(H<10)er.push('Alto mínimo: 10".');if(H>252)er.push('Alto máximo: 252".');if(er.length)return{errors:er};
  // Marco — P92 specific
  const lat_t=H-0.125;
  const cab_t=W-1.625; // P92 differs: 1.625 vs P65's 1.50
  let jam_t=H-2.5;     // P92 differs: 2.5 vs P65's 2.125
  if(riel==="Interior (I)")jam_t+=1;
  let vid_h=H-6.5;     // P92 differs: 6.5 vs P65's 5
  if(riel==="Interior (I)")vid_h+=1;
  let cht,chc,jllc,jengc,vc,vw,cerr,ada=0;
  if(hojas===2){
    cerr=2*cantidad;chc=2*cantidad;
    cht=(W-1.375)/2+0.125;       // P92 specific
    jllc=2*cantidad;jengc=2*cantidad;
    vc=2*cantidad;vw=(W-5.75)/2-1; // P92 specific
  } else if(hojas===3){
    cerr=2*cantidad;chc=3*cantidad;
    cht=(W+1.5)/3;                // P92 specific
    jllc=2*cantidad;jengc=4*cantidad;
    vc=3*cantidad;vw=(W-8.25)/3;  // P92 uses secondary vidrio_ancho
  } else if(hojas===4){
    cerr=4*cantidad;chc=4*cantidad;
    cht=(W-1.25)/4+0.1875;        // P92 specific (+0.1875 vs P65's +0.125)
    jllc=4*cantidad;jengc=4*cantidad;
    vc=4*cantidad;vw=(W-12.25)/4-0.375; // P92 specific
  } else{ // 6
    cerr=4*cantidad;chc=6*cantidad;
    cht=(W-2.25)/6+1.125;         // P92 specific (+1.125 vs P65's no correction)
    jllc=4*cantidad;jengc=8*cantidad;
    ada=1*cantidad;vc=4*cantidad;vw=(W-15.25)/6;
  }
  const lat_c=2*cantidad,cab_c=cantidad;
  const pies={lat:r2((lat_c*lat_t)/12),cab:r2((cab_c*cab_t)/12),rie:r2((cab_c*cab_t)/12),
    chb:r2((cantidad*hojas*cht)/12),alf:r2((cantidad*hojas*cht)/12),
    jll:r2((jllc*jam_t)/12),jng:r2((jengc*jam_t)/12),
    ada:ada>0?r2((ada*jam_t)/12):0};
  const rueda=hojas*2*cantidad,guia=hojas*2*cantidad,tornillo=hojas*6*cantidad;
  const gom=r2(vc*((vw*2+vid_h*2)/12));
  // Felpa — same structure as P65
  let fLla,fEng,fCab,fAlf;
  if(hojas===2){fLla=(2*2*jam_t/12)*cantidad;fEng=(1*2*jam_t/12)*cantidad;fCab=(1*2*cht/12)*cantidad;fAlf=(1*2*cht/12)*cantidad;}
  else if(hojas===3){fLla=(2*2*jam_t/12)*cantidad;fEng=(1*4*jam_t/12)*cantidad;fCab=(1*3*cht/12)*cantidad;fAlf=(1*3*cht/12)*cantidad;}
  else if(hojas===4){fLla=(2*4*jam_t/12)*cantidad;fEng=(1*4*jam_t/12)*cantidad;fCab=(1*4*cht/12)*cantidad;fAlf=(1*4*cht/12)*cantidad;}
  else{fLla=(2*4*jam_t/12)*cantidad;fEng=(1*8*jam_t/12)*cantidad;fCab=(1*6*cht/12)*cantidad;fAlf=(1*6*cht/12)*cantidad;}
  const felpa=r2(fLla+fEng+fCab+fAlf);
  let p=(W*H)/144;const M=16;if(hojas===2&&p<M)p=M;if(hojas===3&&p<M*1.5)p=M*1.5;if(hojas===4&&p<M*2)p=M*2;if(hojas===6&&p<M*3)p=M*3;
  return{errors:[],tipo:"p92",dim:{ancho:tf(W),alto:tf(H),lt:tf(lat_t),ct:tf(cab_t),jt:tf(jam_t),cht:tf(cht),vw:tf(vw),vh:tf(vid_h)},
    pies,hw:{rue:rueda,gui:guia,tor:tornillo,cer:cerr,gom,fel:felpa},
    glass:{tipo:vidrio,cant:vc,sqft:r2((vc*(vw*vid_h))/144)},
    pie:r2(p*cantidad),material,riel,hojas,cantidad,label:`P-92 ${tf(W)}×${tf(H)} ${hojas}H ×${cantidad}`};
}
function calcP65({ancho,alto,hojas,cantidad,unidad,riel,material,vidrio}){
  let W=ancho,H=alto;if(unidad==="Metros"){W*=39.375;H*=39.375;}
  const er=[];if(W<10)er.push('Ancho mínimo: 10".');if(H<10)er.push('Alto mínimo: 10".');if(H>252)er.push('Alto máximo: 252".');if(er.length)return{errors:er};
  const lat_t=H-0.125, cab_t=W-1.50;
  let jam_t=H-2.125; if(riel==="Interior (I)")jam_t+=1;
  const vid_h=H-5;
  let cht,chc,jllc,jengc,vc,vw,cerr,ada=0;
  if(hojas===2){cerr=2*cantidad;chc=2*cantidad;cht=(W-1.5)/2+0.125;jllc=2*cantidad;jengc=2*cantidad;vc=2*cantidad;vw=(W-6.875)/2+0.125;}
  else if(hojas===3){cerr=2*cantidad;chc=3*cantidad;cht=(W+0.25)/3;jllc=2*cantidad;jengc=4*cantidad;vc=3*cantidad;vw=(W-7.6875)/3;}
  else if(hojas===4){cerr=4*cantidad;chc=4*cantidad;cht=(W-1.25)/4+0.125;jllc=4*cantidad;jengc=4*cantidad;ada=1*cantidad;vc=4*cantidad;vw=(W-12.25)/4+0.125;}
  else{cerr=4*cantidad;chc=6*cantidad;cht=(W-2.25)/6;jllc=4*cantidad;jengc=8*cantidad;ada=1*cantidad;vc=4*cantidad;vw=(W-15.25)/6;}
  const lat_c=2*cantidad,cab_c=cantidad;
  const pies={lat:r2((lat_c*lat_t)/12),cab:r2((cab_c*cab_t)/12),rie:r2((cab_c*cab_t)/12),chb:r2((cantidad*hojas*cht)/12),alf:r2((cantidad*hojas*cht)/12),jll:r2((jllc*jam_t)/12),jng:r2((jengc*jam_t)/12),ada:ada>0?r2((ada*jam_t)/12):0};
  const rueda=hojas*2*cantidad,guia=hojas*2*cantidad,tornillo=hojas*6*cantidad,gom=r2(vc*((vw*2+vid_h*2)/12));
  let fLla,fEng,fCab,fAlf;
  if(hojas===2){fLla=(2*2*jam_t/12)*cantidad;fEng=(1*2*jam_t/12)*cantidad;fCab=(1*2*cht/12)*cantidad;fAlf=(1*2*cht/12)*cantidad;}
  else if(hojas===3){fLla=(2*2*jam_t/12)*cantidad;fEng=(1*4*jam_t/12)*cantidad;fCab=(1*3*cht/12)*cantidad;fAlf=(1*3*cht/12)*cantidad;}
  else if(hojas===4){fLla=(2*4*jam_t/12)*cantidad;fEng=(1*4*jam_t/12)*cantidad;fCab=(1*4*cht/12)*cantidad;fAlf=(1*4*cht/12)*cantidad;}
  else{fLla=(2*4*jam_t/12)*cantidad;fEng=(1*8*jam_t/12)*cantidad;fCab=(1*6*cht/12)*cantidad;fAlf=(1*6*cht/12)*cantidad;}
  const felpa=r2(fLla+fEng+fCab+fAlf);
  let p=(W*H)/144;const M=16;if(hojas===2&&p<M)p=M;if(hojas===3&&p<M*1.5)p=M*1.5;if(hojas===4&&p<M*2)p=M*2;if(hojas===6&&p<M*3)p=M*3;
  return{errors:[],tipo:"p65",dim:{ancho:tf(W),alto:tf(H),lt:tf(lat_t),ct:tf(cab_t),jt:tf(jam_t),cht:tf(cht),vw:tf(vw),vh:tf(vid_h)},
    pies,hw:{rue:rueda,gui:guia,tor:tornillo,cer:cerr,gom,fel:felpa},
    glass:{tipo:vidrio,cant:vc,sqft:r2((vc*(vw*vid_h))/144)},
    pie:r2(p*cantidad),material,riel,hojas,cantidad,label:`P-65 ${tf(W)}×${tf(H)} ${hojas}H ×${cantidad}`};
}
function calcPuertas({ancho,alto,hojas,tipo,posicion,cantidad,unidad,material,vidrio}){
  let W=ancho,H=alto;if(unidad==="Metros"){W*=39.375;H*=39.375;}
  const er=[];if(W<10)er.push('Ancho mínimo: 10".');if(H<10)er.push('Alto mínimo: 10".');if(H>252)er.push('Alto máximo: 252".');if(er.length)return{errors:er};
  const lat_t=H-0.125, cab_t=W-3.625;
  const lat_c=2*cantidad, cab_c=1*cantidad;
  const jam_t=H-2.625;
  let cht,chc,jamc,tope_can,tope_ancho,tope_alto,vid_can;
  let barra_roscada=0,barra_empuje=0,soporte=0;
  let pivot=0,cierre=0,cerradura=0,pestillo=0,puno=0;
  if(hojas===1){
    soporte=1*cantidad;pivot=1*cantidad;cierre=1*cantidad;cerradura=1*cantidad;puno=1*cantidad;
    chc=1*cantidad;jamc=2*cantidad;tope_can=4*cantidad;vid_can=1*cantidad;
    if(tipo==="Comercial"){cht=W-8;tope_ancho=cht;tope_alto=H-8.625;barra_roscada=tope_ancho+1.375;barra_empuje=W-4.875;}
    else{cht=W-11.875;tope_ancho=cht;tope_alto=H-8.625;barra_roscada=tope_ancho+1.375;}
  } else {
    soporte=2*cantidad;pivot=2*cantidad;cierre=2*cantidad;cerradura=1*cantidad;puno=2*cantidad;pestillo=1*cantidad;
    chc=2*cantidad;jamc=4*cantidad;cht=(W-12.1875)/2;
    tope_can=8*cantidad;vid_can=2*cantidad;
    tope_ancho=cht;tope_alto=H-8.625;
    barra_roscada=(W-9.50)/2;barra_empuje=(W-6)/2;
  }
  const felpa=r2((jamc*jam_t)/12);
  const goma=r2((tope_can*(tope_ancho+tope_alto))/12);
  const pies={
    lat:r2((lat_c*lat_t)/12),cab:r2((cab_c*cab_t)/12),pie:r2((cab_c*cab_t)/12),
    chb:r2((chc*cht)/12),alf:r2((chc*cht)/12),jam:r2((jamc*jam_t)/12),
    emp:barra_empuje>0?r2(barra_empuje/12):0,
    sop:r2((soporte*jam_t)/12),top:r2((tope_can*(tope_alto+tope_ancho))/12)
  };
  let p=(W*H)/144;if(p<16)p=16;p=r2(p*cantidad);
  const glass_sqft=r2((vid_can*(tope_ancho*(tope_alto+1)))/144);
  return{errors:[],tipo:"pu",
    dim:{ancho:tf(W),alto:tf(H),lat_t:tf(lat_t),cab_t:tf(cab_t),jam_t:tf(jam_t),
      cht:tf(cht),tope_ancho:tf(tope_ancho),tope_alto:tf(tope_alto),
      barra_roscada:barra_roscada>0?tf(barra_roscada):"—",
      barra_empuje:barra_empuje>0?tf(barra_empuje):"—"},
    counts:{lat_c,cab_c,chc,jamc,tope_can,vid_can},
    pies,hw:{pivot,cierre,cerradura,pestillo,puno,goma,felpa,roscada:cantidad*hojas},
    glass:{tipo:vidrio,cant:vid_can,sqft:glass_sqft},
    pie:p,material,posicion,hojas,tipoPuerta:tipo,cantidad,
    label:`Puerta ${tipo} ${tf(W)}×${tf(H)} ${hojas}H ${posicion} ×${cantidad}`};
}
function sumOrder(lines){const tot={pie:0,gom:0,rem:0,op:0};lines.forEach(l=>{tot.pie+=l.pie||0;tot.gom+=(l.hw?.gom||0);if(l.tipo!=="cor"){tot.rem+=(l.hw?.rem||0);tot.op+=(l.hw?.op||0);}});return{pie:r2(tot.pie),gom:r2(tot.gom),rem:tot.rem,op:tot.op};}

// ═══ DATA ═══════════════════════════════════════════════════════════════════
const MATS=["Natural","Lacado Blanco","Lacado Bronce","Anodizado Bronce","Madera","Oro","Mate"];
const VIDS=["Natural transparente","Bronce liso","Bronce martillado","Natural martillado","Corrugado","Reflectivo","Blue green"];
const VENTANAS=[
  {id:"cor",nombre:"Corrediza Tradicional",icon:"🪟",desc:"Marco GK, rieles ext/int, 2-6 hojas",on:true},
  {id:"pa",nombre:"Persiana Tipo A",icon:"🔳",desc:"Celosía por cuerpo, cabezal dividido",on:true},
  {id:"paa",nombre:"Persiana Tipo AA",icon:"⬡",desc:"Celosía ancho completo, cabezal único",on:true},
  {id:"p65",nombre:"Corrediza Med. P-65",icon:"🏛️",desc:"Perfiles ALD, riel Ext/Int, felpa 4 componentes",on:true},
  {id:"p92",nombre:"Corrediza Med. P-92",icon:"🏗️",desc:"Perfiles ALD-900, grandes dimensiones",on:true},
  {id:"int",nombre:"Corrediza Integrada",icon:"⬛",desc:"Acabado flush integrado en pared",on:false,hidden:true},
  {id:"pu",nombre:"Puertas Comercial & Residencial",icon:"🚪",desc:"GK-48/50/52/84/85, 1 o 2 hojas, Comercial/Residencial",on:true},
  {id:"siscop",nombre:"Productos SISCOP",icon:"📦",desc:"191 productos importados",on:true},
];
const DC=[
  {id:1,nombre:"Constructora Pérez & Asociados",contacto:"Luis Pérez",tel:"809-555-1234",email:"lperez@construc.do",ciudad:"Sto. Domingo",tipo:"Empresa",estado:"Activo",ordenes:8},
  {id:2,nombre:"Ferretería El Martillo",contacto:"Carmen Rodríguez",tel:"829-555-5678",email:"carmen@martillo.do",ciudad:"Santiago",tipo:"Empresa",estado:"Activo",ordenes:3},
  {id:3,nombre:"María González",contacto:"María González",tel:"849-555-9012",email:"mgonzalez@gmail.com",ciudad:"La Romana",tipo:"Particular",estado:"Activo",ordenes:1},
  {id:4,nombre:"Inmobiliaria Vista Verde",contacto:"Roberto Méndez",tel:"809-555-3456",email:"rob@vverde.do",ciudad:"Punta Cana",tipo:"Empresa",estado:"Inactivo",ordenes:12},
];
const DP=[
  {id:1,nombre:"Aluminio del Caribe SRL",contacto:"Jorge Santos",tel:"809-555-2233",ciudad:"Sto. Domingo",producto:"Perfiles de Aluminio",estado:"Activo"},
  {id:2,nombre:"Vidriera Nacional",contacto:"Patricia Cruz",tel:"829-555-4455",ciudad:"Santiago",producto:"Vidrios y Cristales",estado:"Activo"},
  {id:3,nombre:"Herrajes RD Import",contacto:"Manuel Reyes",tel:"849-555-6677",ciudad:"Sto. Domingo",producto:"Herrajes",estado:"Activo"},
];

// ═══ PDF DOWNLOAD ════════════════════════════════════════════════════════════
function downloadOrder(lines, info) {
  const tot = sumOrder(lines);
  const now = new Date().toLocaleDateString("es-DO",{day:"2-digit",month:"long",year:"numeric"});

  var styleBlock=""+
    "*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:11px;color:#202124;padding:24px;background:#fff}"+
    ".hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:16px;border-bottom:3px solid #1a73e8}"+
    ".logo{font-size:26px;font-weight:700;color:#1a73e8;letter-spacing:-0.5px}"+
    ".logo-sub{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5f6368;margin-top:2px}"+
    ".ord-num{font-size:20px;font-weight:600;color:#1a73e8;text-align:right}"+
    ".ord-date{font-size:11px;color:#5f6368;margin-top:3px;text-align:right}"+
    ".info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px;background:#f8f9fa;border-radius:8px;padding:14px 16px;border:1px solid #e8eaed}"+
    ".il{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#5f6368;margin-bottom:3px}"+
    ".iv{font-size:13px;font-weight:500;color:#202124}"+
    ".hero{background:linear-gradient(135deg,#1a73e8,#1557b0);border-radius:10px;padding:14px 18px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;color:#fff}"+
    ".hero-l{font-size:11px;text-transform:uppercase;letter-spacing:2px;opacity:.8}"+
    ".hero-n{font-size:36px;font-weight:300}.hero-u{font-size:11px;opacity:.7}"+
    ".sec{margin-bottom:16px}"+
    ".sec-ttl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#5f6368;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #e8eaed}"+
    "table{width:100%;border-collapse:collapse}"+
    "th{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:#5f6368;padding:7px 10px;text-align:left;background:#f8f9fa;border-bottom:1px solid #e8eaed}"+
    "td{padding:8px 10px;border-bottom:1px solid #f1f3f4;font-size:11px;vertical-align:top}"+
    "tr:last-child td{border-bottom:none}"+
    ".tot td{background:#e8f0fe;font-weight:700;border-top:2px solid #1a73e8}"+
    ".mono{font-family:Courier New,monospace;font-size:10px}"+
    ".badge{display:inline-block;padding:1px 7px;border-radius:20px;font-size:9px;font-weight:700;background:#e8f0fe;color:#1557b0}"+
    ".kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:10px}"+
    ".kpi{background:#f8f9fa;border-radius:6px;padding:10px 12px;border:1px solid #e8eaed}"+
    ".kpi-l{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#5f6368;font-weight:600;margin-bottom:4px}"+
    ".kpi-n{font-size:16px;font-weight:600;color:#1a73e8}"+
    ".kpi-u{font-size:9px;color:#5f6368}"+
    ".note{background:#fef7e0;border:1px solid #f9ab00;border-radius:6px;padding:10px 14px;font-size:11px;color:#594300;margin-bottom:14px}"+
    ".footer{margin-top:24px;padding-top:12px;border-top:1px solid #e8eaed;display:flex;justify-content:space-between;color:#80868b;font-size:10px}"+
    ".sig{border-top:1px solid #202124;padding-top:4px;min-width:180px;text-align:center;font-size:10px;color:#5f6368;margin-top:32px}";

  var notaHtml="";
  if(info.notas){ notaHtml='<div class="note">Nota: '+info.notas+'</div>'; }

  var typeLabel=function(t){return t==="cor"?"Corrediza":t==="pa"?"Persiana A":t==="paa"?"Persiana AA":t==="p65"?"P-65":t==="p92"?"P-92":t==="pu"?"Puerta":t;};

  var resumenRows="";
  for(var ri=0;ri<lines.length;ri++){
    var rl=lines[ri];
    resumenRows+='<tr><td style="font-weight:700;color:#1a73e8">'+(ri+1)+'</td><td style="font-weight:600">'+rl.label+'</td><td><span class="badge">'+typeLabel(rl.tipo)+'</span></td><td class="mono">'+rl.dim.ancho+'</td><td class="mono">'+rl.dim.alto+'</td><td style="text-align:center;font-weight:700">'+rl.cantidad+'</td><td>'+rl.material+'</td><td style="font-weight:700;color:#1a73e8">'+rl.pie+'</td></tr>';
  }

  function adaRow(label,tam,pie){ return '<tr><td>'+label+'</td><td class="mono">'+tam+'</td><td class="mono">'+r2(pie)+' pie</td></tr>'; }

  var desgloseBlocks="";
  for(var di=0;di<lines.length;di++){
    var l=lines[di];
    var rows="";
    if(l.tipo==="cor"){
      rows=adaRow("Lateral Marco (GK-40/43)",l.dim.lt,l.pies.lat)+
           adaRow("Cabezal Marco (GK-44)",l.dim.ct,l.pies.cab)+
           adaRow("Riel Marco",l.dim.ct,l.pies.rie)+
           adaRow("Cabezal Hoja (GK-37)",l.dim.cht,l.pies.chb)+
           adaRow("Alfeizal Hoja (GK-41)",l.dim.cht,l.pies.alf)+
           adaRow("Jamba Llavin (DS-70)",l.dim.jt,l.pies.jll)+
           adaRow("Jamba Enganche (GK-42)",l.dim.jt,l.pies.jng);
      if(l.pies.ada>0){ rows+=adaRow("Adaptador D276A",l.dim.jt,l.pies.ada); }
      var glassTxt=(l.glass&&l.glass.sqft!==undefined)?(l.glass.sqft+"ft2 ("+l.glass.cant+" pzas - "+l.dim.vw+"x"+l.dim.vh+")"):"-";
      rows+='<tr style="background:#f8f9fa"><td colspan="3"><b>Herrajes:</b> Ruedas:'+l.hw.rue+' - Guias:'+l.hw.gui+' - Tornillos:'+l.hw.tor+' - Cerraduras:'+l.hw.cer+' - Goma:'+l.hw.gom+' pie - Felpa:'+l.hw.fel+' pie - Vidrio:'+glassTxt+'</td></tr>';
    } else if(l.tipo==="pa"||l.tipo==="paa"){
      rows=adaRow("Celosias (GK-61)",l.dim.tce,l.pies.cel)+
           adaRow("Balancin (GK-62)",l.dim.lb,l.pies.bal)+
           adaRow("Cabezal Hoja",l.dim.tc,l.pies.cab)+
           adaRow("Alfeizal Hoja",l.dim.tc,l.pies.alf)+
           adaRow("Jamba Lisa",l.dim.jt,l.pies.jll);
      if(l.cnt&&l.cnt.jm>0){ rows+=adaRow("Jamba c/Munon",l.dim.jt,l.pies.jmm); }
      var vidTxt=l.tipoPer==="Vidrio"?(" - Vidrio:"+l.lam+" pie ("+l.vidrio+") - Clips:"+l.hw.cli):"";
      rows+='<tr style="background:#f8f9fa"><td colspan="3"><b>Bal.1:</b>'+((l.bl&&l.bl.b1)||"-")+' - <b>Bal.2:</b>'+((l.bl&&l.bl.b2)||"-")+' - <b>Op:</b>'+l.hw.op+' - <b>Goma:</b>'+l.hw.gom+' pie - <b>Remaches:</b>'+l.hw.rem+vidTxt+'</td></tr>';
    } else if(l.tipo==="p65"||l.tipo==="p92"){
      var isP92=l.tipo==="p92";
      var latCode=isP92?"ALD-901":"ALD-602";
      var cabCode=isP92?"ALD-902":"ALD-602";
      var rielCode=isP92?"ALD-900":(l.riel==="Exterior (E)"?"ALD-601":"ALD-625");
      var chCode=isP92?"ALD-904":"ALD-606";
      var jllCode=isP92?"ALD-906":"ALD-607";
      var jengCode=isP92?"ALD-907":"ALD-608";
      var adaCode=isP92?"ALD-910":"ALD-610";
      var rielLabel=l.riel==="Exterior (E)"?"Ext.":"Int.";
      rows=adaRow("Lateral Marco ("+latCode+")",l.dim.lt,l.pies.lat)+
           adaRow("Cabezal Marco ("+cabCode+")",l.dim.ct,l.pies.cab)+
           adaRow("Riel Marco "+rielLabel+" ("+rielCode+")",l.dim.ct,l.pies.rie)+
           adaRow("Cabezal Hoja ("+chCode+")",l.dim.cht,l.pies.chb)+
           adaRow("Alfeizal Hoja ("+chCode+")",l.dim.cht,l.pies.alf)+
           adaRow("Jamba Llavin ("+jllCode+")",l.dim.jt,l.pies.jll)+
           adaRow("Jamba Enganche ("+jengCode+")",l.dim.jt,l.pies.jng);
      if(l.pies.ada>0){ rows+=adaRow("Adaptador ("+adaCode+")",l.dim.jt,l.pies.ada); }
      var glassTxt2=(l.glass&&l.glass.sqft!==undefined)?(l.glass.sqft+"ft2 ("+l.glass.cant+" pzas - "+l.dim.vw+"x"+l.dim.vh+")"):"-";
      rows+='<tr style="background:#f8f9fa"><td colspan="3"><b>Herrajes:</b> Ruedas:'+l.hw.rue+' - Guias:'+l.hw.gui+' - Tornillos:'+l.hw.tor+' - Cerraduras:'+l.hw.cer+' - Goma:'+l.hw.gom+' pie - Felpa:'+l.hw.fel+' pie - Riel:'+l.riel+' - Vidrio:'+glassTxt2+'</td></tr>';
    } else if(l.tipo==="pu"){
      rows=adaRow("Lateral Marco (GK-48)",l.dim.lat_t,l.pies.lat)+
           adaRow("Cabezal / Roda (GK-48)",l.dim.cab_t,l.pies.cab)+
           adaRow("Piel Marco (DS-50)",l.dim.cab_t,l.pies.pie)+
           adaRow("Cabezal Hoja (GK-50)",l.dim.cht,l.pies.chb)+
           adaRow("Alfeizal Hoja (GK-52)",l.dim.cht,l.pies.alf)+
           adaRow("Jambas Hoja (GK-50)",l.dim.jam_t,l.pies.jam);
      if(l.pies.emp>0){ rows+=adaRow("Barra Empuje (GK-85)",l.dim.barra_empuje,l.pies.emp); }
      rows+=adaRow("Soporte Empuje (GK-84)",l.dim.jam_t,l.pies.sop);
      rows+=adaRow("Tapa Moldura (GK-46)",l.dim.tope_ancho+"+"+l.dim.tope_alto,l.pies.top);
      var pestilloTxt=l.hw.pestillo?(" - Pestillo:"+l.hw.pestillo):"";
      var roscadaTxt=l.dim.barra_roscada!=="—"?(" - Roscada:"+l.dim.barra_roscada+"x"+l.hw.roscada):"";
      var glassTxt3=(l.glass&&l.glass.sqft!==undefined)?(l.glass.sqft+"ft2 ("+l.glass.cant+" pzas - "+l.dim.tope_ancho+"x"+l.dim.tope_alto+")"):"-";
      rows+='<tr style="background:#f8f9fa"><td colspan="3"><b>Herrajes:</b> Pivot:'+l.hw.pivot+' - Cierre:'+l.hw.cierre+' - Cerradura:'+l.hw.cerradura+pestilloTxt+' - Puno:'+l.hw.puno+' - Goma:'+l.hw.goma+' pie - Felpa:'+l.hw.felpa+' pie'+roscadaTxt+' - Vidrio:'+glassTxt3+'</td></tr>';
    } else {
      rows='<tr><td colspan="3" style="color:#5f6368">Tipo no reconocido</td></tr>';
    }
    desgloseBlocks+='<table style="margin-bottom:14px"><thead><tr><th colspan="3" style="color:#1557b0;background:#e8f0fe">'+(di+1)+'. '+l.label+' - '+l.pie+' pies2</th></tr><tr><th>Perfil</th><th>Tamano de Corte</th><th>Pies Lineales</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }

  var bodyHtml=""+
    '<div class="hdr"><div><div class="logo">Ventaneros</div><div class="logo-sub">Sistema de Gestion de Ventanas</div></div><div><div class="ord-num">Orden #'+(info.numero||"001")+'</div><div class="ord-date">'+now+'</div></div></div>'+
    '<div class="info-grid"><div><div class="il">Cliente</div><div class="iv">'+(info.cliente||"-")+'</div></div><div><div class="il">Proyecto</div><div class="iv">'+(info.proyecto||"-")+'</div></div><div><div class="il">Responsable</div><div class="iv">'+(info.responsable||"-")+'</div></div><div><div class="il">Fecha Entrega</div><div class="iv">'+(info.entrega||"-")+'</div></div></div>'+
    notaHtml+
    '<div class="hero"><div><div class="hero-l">Pietaje Total de la Orden</div><div style="font-size:10px;opacity:.7;margin-top:3px">'+lines.length+' linea(s) - '+lines.reduce(function(s,l){return s+l.cantidad;},0)+' unidades</div></div><div style="text-align:right"><div class="hero-n">'+tot.pie+'</div><div class="hero-u">pies2</div></div></div>'+
    '<div class="sec"><div class="sec-ttl">Resumen de Ventanas</div>'+
    '<table><thead><tr><th>#</th><th>Descripcion</th><th>Tipo</th><th>Ancho</th><th>Alto</th><th>Cant.</th><th>Material</th><th>Pies2</th></tr></thead><tbody>'+
    resumenRows+
    '<tr class="tot"><td colspan="7" style="text-align:right">TOTAL</td><td>'+tot.pie+' ft2</td></tr>'+
    '</tbody></table></div>'+
    '<div class="sec"><div class="sec-ttl">Desglose de Materiales por Linea</div>'+
    desgloseBlocks+
    '</div>'+
    '<div class="sec"><div class="sec-ttl">Totales de Herrajes</div>'+
    '<div class="kpi-grid"><div class="kpi"><div class="kpi-l">Pietaje Total</div><div class="kpi-n">'+tot.pie+'</div><div class="kpi-u">pies2</div></div><div class="kpi"><div class="kpi-l">Goma Total</div><div class="kpi-n">'+tot.gom+'</div><div class="kpi-u">pie lineal</div></div><div class="kpi"><div class="kpi-l">Remaches</div><div class="kpi-n">'+tot.rem+'</div><div class="kpi-u">unidades</div></div><div class="kpi"><div class="kpi-l">Operadores</div><div class="kpi-n">'+tot.op+'</div><div class="kpi-u">unidades</div></div></div>'+
    '</div>'+
    '<div class="footer"><div>Ventaneros - '+now+'</div><div class="sig">Firma y sello del responsable</div></div>';

  var filename="Orden-"+(info.numero||"001")+"-"+(info.cliente||"Ventaneros").replace(/\s+/g,"-")+".pdf";
  downloadAsPDF(styleBlock, bodyHtml, filename);
}

// ═══ LICENSE ═════════════════════════════════════════════════════════════════
function LicenseScreen({onUnlock,brand}){
  const [mode,setMode]=useState("login"); // "login" | "signup"
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [err,setErr]=useState("");
  const [info,setInfo]=useState("");
  const [ld,setLd]=useState(false);
  const b=brand||DEFAULT_BRAND;

  async function go(){
    setErr("");setInfo("");setLd(true);
    try{
      if(mode==="login"){
        await loginWithEmail(email.trim(),password);
        onUnlock();
      } else {
        const data=await signupWithEmail(email.trim(),password);
        if(data.access_token){
          onUnlock();
        } else {
          setInfo("Cuenta creada. Revisa tu correo para confirmar, luego inicia sesión.");
          setMode("login");
        }
      }
    } catch(e){
      setErr(e.message||"Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLd(false);
    }
  }

  return(<div className="lic-screen"><div className="lic-box">
    {b.logo
      ?<img src={b.logo} style={{width:80,height:80,objectFit:"contain",borderRadius:16,marginBottom:12,display:"block",marginLeft:"auto",marginRight:"auto"}} alt="logo"/>
      :<div className="lic-icon" style={{background:b.colorPri,color:"#fff",fontSize:28,width:64,height:64,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontWeight:700}}>{b.iniciales.slice(0,2)}</div>}
    <div className="lic-title" style={{color:b.colorPri||"var(--pri)"}}>{b.nombre}</div>
    <div className="lic-sub">{b.slogan}</div>

    <div style={{display:"flex",gap:8,marginBottom:16,justifyContent:"center"}}>
      <button onClick={()=>{setMode("login");setErr("");setInfo("");}} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",fontWeight:600,background:mode==="login"?b.colorPri:"#eee",color:mode==="login"?"#fff":"#555"}}>Iniciar sesión</button>
      <button onClick={()=>{setMode("signup");setErr("");setInfo("");}} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",fontWeight:600,background:mode==="signup"?b.colorPri:"#eee",color:mode==="signup"?"#fff":"#555"}}>Crear cuenta</button>
    </div>

    <div className="lic-lbl">Correo electrónico</div>
    <input className="lic-in" type="email" placeholder="tu@empresa.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/>
    <div className="lic-lbl" style={{marginTop:10}}>Contraseña</div>
    <input className="lic-in" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/>

    <button className="lic-btn" style={{background:b.colorPri,marginTop:14}} onClick={go} disabled={ld}>
      {ld?"Verificando...":mode==="login"?"Iniciar sesión":"Crear cuenta"}
    </button>
    {err&&<div className="lic-err">{err}</div>}
    {info&&<div className="lic-hint" style={{color:b.colorPri}}>{info}</div>}
  </div></div>);
}

// ═══ ORDER MODAL ══════════════════════════════════════════════════════════════
function OrderModal({lines,onClose}){
  const [info,setInfo]=useState({numero:"001",cliente:"",proyecto:"",responsable:"",entrega:"",notas:""});
  const [loadingPdf,setLoadingPdf]=useState(false);
  const [pdfErr,setPdfErr]=useState("");
  const sf=k=>e=>setInfo(f=>({...f,[k]:e.target.value}));
  const [siscopProds,setSiscopProds]=useState([]);
  const [siscopCod,setSiscopCod]=useState("");
  const [siscopQ,setSiscopQ]=useState("");
  useEffect(()=>{
    if(sel==="siscop"&&siscopProds.length===0){
      import("./api.js").then(m=>m.listarProductosSiscop()).then(setSiscopProds).catch(()=>{});
    }
  },[sel]);
  const tot=sumOrder(lines);

  async function handleDownload(){
    setPdfErr("");setLoadingPdf(true);
    try{
      await descargarOrdenPDF(lines,info);
      onClose();
    } catch(e){
      setPdfErr(e.message||"No se pudo generar el PDF.");
    } finally {
      setLoadingPdf(false);
    }
  }

  return(<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
    <div className="modal">
      <div className="modal-hdr">
        <div className="modal-ttl">Datos de la Orden</div>
        <button className="icon-btn" onClick={onClose}>✕</button>
      </div>
      <div className="modal-bdy">
        <div style={{background:"var(--pri-light)",borderRadius:"var(--r-md)",padding:"12px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:13,color:"var(--pri-dark)",fontWeight:500}}>📋 {lines.length} línea(s) · {lines.reduce((s,l)=>s+l.cantidad,0)} unidades</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:16,fontWeight:600,color:"var(--pri-dark)"}}>{tot.pie} ft²</div>
        </div>
        <div className="fgrid f2" style={{gap:14}}>
          <div className="fld"><label>Número de Orden</label><input value={info.numero} onChange={sf("numero")} placeholder="001"/></div>
          <div className="fld"><label>Fecha de Entrega</label><input type="date" value={info.entrega} onChange={sf("entrega")}/></div>
          <div className="fld" style={{gridColumn:"1/-1"}}><label>Cliente</label><input value={info.cliente} onChange={sf("cliente")} placeholder="Nombre del cliente o empresa"/></div>
          <div className="fld" style={{gridColumn:"1/-1"}}><label>Proyecto / Referencia</label><input value={info.proyecto} onChange={sf("proyecto")} placeholder="Ej: Residencia Las Palmas — Sala principal"/></div>
          <div className="fld" style={{gridColumn:"1/-1"}}><label>Responsable de producción</label><input value={info.responsable} onChange={sf("responsable")}/></div>
          <div className="fld" style={{gridColumn:"1/-1"}}><label>Notas adicionales</label><textarea value={info.notas} onChange={sf("notas")} placeholder="Instrucciones especiales para el taller..."/></div>
        </div>
        {pdfErr&&<div style={{marginTop:12,color:"#dc2626",fontSize:13}}>{pdfErr}</div>}
      </div>
      <div className="modal-ftr">
        <button className="btn btn-text" onClick={onClose}>Cancelar</button>
        <button className="btn btn-filled" onClick={handleDownload} disabled={loadingPdf}>{loadingPdf?"Generando PDF...":"⬇ Descargar PDF"}</button>
      </div>
    </div>
  </div>);
}

// ═══ UNIFIED RESULT COMPONENT ════════════════════════════════════════════════
function ProfileTable({title, badge, color="#1a73e8", rows}){
  // rows: [{perfil, codigo, tamano, cant, pies}]
  if(!rows || rows.length===0) return null;
  return(
    <div className="card card-outlined">
      <div className="card-hdr">
        <div className="card-ttl">{title}</div>
        {badge&&<span className="chip" style={{background:`rgba(${color==="green"?"42,92,63":"26,115,232"},.1)`,color:color==="green"?"var(--sec)":"var(--pri)",fontSize:11,border:"none"}}>{badge}</span>}
      </div>
      <div className="twrap">
        <table>
          <thead>
            <tr>
              <th>Perfil</th>
              <th>Código</th>
              <th style={{textAlign:"center"}}>Cant.</th>
              <th>Tamaño de corte</th>
              <th style={{textAlign:"right"}}>Pies lineales</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((rw,i)=>(
              <tr key={i}>
                <td style={{fontWeight:500,color:"var(--on-sur)"}}>{rw.perfil}</td>
                <td><span className="mono" style={{fontSize:11,color:"var(--on-sur3)",background:"var(--sur2)",padding:"2px 7px",borderRadius:4}}>{rw.codigo}</span></td>
                <td style={{textAlign:"center"}}>
                  {rw.cant!==undefined&&rw.cant!=="—"
                    ?<span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:"var(--pri)",fontSize:13}}>{rw.cant}</span>
                    :<span style={{color:"var(--on-sur4)"}}>—</span>}
                </td>
                <td><span className="mono" style={{color:"var(--sec)",fontWeight:600,fontSize:13}}>{rw.tamano}</span></td>
                <td style={{textAlign:"right",fontWeight:700,fontSize:14}}>{rw.pies} <span style={{fontSize:11,color:"var(--on-sur4)",fontWeight:400}}>pie</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HwRow({label, value, unit, highlight=false}){
  if(!value && value!==0) return null;
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--out)"}}>
      <span style={{fontSize:13,color:"var(--on-sur3)"}}>{label}</span>
      <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:highlight?700:500,fontSize:13,color:highlight?"var(--sec)":"var(--on-sur)"}}>{value} <span style={{fontSize:11,color:"var(--on-sur4)",fontWeight:400}}>{unit}</span></span>
    </div>
  );
}

function CalcResult({r, f, onAdd}){
  if(!r) return null;
  const tipo = r.tipo;
  if(tipo==="siscop"){
    return(<div className="cr">
      <div className="hero">
        <div>
          <div className="hl">Materiales · {r.cod_prod}</div>
          <div className="hs">
            <span className="ht">{r.dim.ancho} × {r.dim.alto}</span>
            <span className="ht">{r.hojas} hojas</span>
            <span className="ht">{r.cantidad} und</span>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div className="hn">{r.pie}</div>
          <div className="hu">pies²</div>
        </div>
      </div>
      <div className="card card-outlined">
        <div className="card-hdr"><div className="card-ttl">{r.nombre||r.cod_prod}</div></div>
        <div className="twrap">
          <table>
            <thead><tr>
              <th>Componente</th><th>Código</th>
              <th style={{textAlign:"center"}}>Cant.</th>
              <th>Medida</th>
              <th style={{textAlign:"right"}}>Cantidad</th>
            </tr></thead>
            <tbody>
              {r.components.map((c,i)=>(
                <tr key={i}>
                  <td style={{fontWeight:500}}>{c.descrip}</td>
                  <td><span className="mono" style={{fontSize:11,color:"var(--on-sur3)"}}>{c.codigo}</span></td>
                  <td style={{textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:"var(--pri)"}}>{c.qty}</td>
                  <td><span className="mono" style={{color:"var(--sec)",fontWeight:600}}>{c.medida_v?`${c.medida} × ${c.medida_v}`:(c.medida||"—")}</span></td>
                  <td style={{textAlign:"right",fontWeight:700}}>{c.measure} <span style={{fontSize:11,color:"var(--on-sur4)"}}>{c.unit}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <button className="add-line-btn" onClick={onAdd}>＋ Agregar a la orden de producción</button>
    </div>);
  }

  // ── build profile tables per type ─────────────────────────────────────────
  let marcoRows=[], hojaRows=[], extraRows=[], balaRows=[];

  if(tipo==="cor"){
    marcoRows=[
      {perfil:"Lateral Marco",    codigo:"GK-40/43", cant:r.counts?.lat_c||2*f.cantidad,  tamano:r.dim.lt,  pies:r.pies.lat},
      {perfil:"Cabezal Marco",    codigo:"GK-44",    cant:r.counts?.cab_c||f.cantidad,     tamano:r.dim.ct,  pies:r.pies.cab},
      {perfil:"Riel Marco",       codigo:"GK-39/86", cant:r.counts?.cab_c||f.cantidad,     tamano:r.dim.ct,  pies:r.pies.rie},
    ];
    hojaRows=[
      {perfil:"Cabezal Hoja",     codigo:"GK-37",    cant:r.counts?.chc,                   tamano:r.dim.cht, pies:r.pies.chb},
      {perfil:"Alfeizal Hoja",    codigo:"GK-41",    cant:r.counts?.chc,                   tamano:r.dim.cht, pies:r.pies.alf},
      {perfil:"Jamba Llavin",     codigo:"DS-70",    cant:r.counts?.jlc,                   tamano:r.dim.jt,  pies:r.pies.jll},
      {perfil:"Jamba Enganche",   codigo:"GK-42",    cant:r.counts?.jec,                   tamano:r.dim.jt,  pies:r.pies.jng},
      ...(r.pies?.ada>0?[{perfil:"Adaptador",codigo:"D276A",cant:r.counts?.ac,tamano:r.dim.jt,pies:r.pies.ada}]:[]),
    ];
  }

  if(tipo==="pa"||tipo==="paa"){
    hojaRows=[
      {perfil:"Celosías",         codigo:"GK-61",    cant:r.cnt?.cc,  tamano:r.dim.tce, pies:r.pies.cel},
      {perfil:"Balancín",         codigo:"GK-62",    cant:"—",        tamano:r.dim.lb,  pies:r.pies.bal},
      {perfil:"Cabezal Hoja",     codigo:"GK-59",    cant:r.cnt?.cab, tamano:r.dim.tc,  pies:r.pies.cab},
      {perfil:"Alfeizal Hoja",    codigo:"GK-55",    cant:r.cnt?.cab, tamano:r.dim.tc,  pies:r.pies.alf},
      {perfil:"Jamba Lisa",       codigo:"GK-bk",    cant:r.cnt?.jl,  tamano:r.dim.jt,  pies:r.pies.jll},
      ...(r.cnt?.jm>0?[{perfil:"Jamba c/Muñón",codigo:"GK-65",cant:r.cnt.jm,tamano:r.dim.jt,pies:r.pies.jmm}]:[]),
    ];
    balaRows=[
      {perfil:"Balancín 1",       codigo:"—",        cant:"—",        tamano:r.bl?.b1||"—", pies:"—"},
      ...(r.bl?.b2?[{perfil:"Balancín 2",codigo:"—",cant:"—",tamano:r.bl.b2,pies:"—"}]:[]),
    ];
  }

  if(tipo==="p65"||tipo==="p92"){
    const isP92=tipo==="p92";
    marcoRows=[
      {perfil:"Lateral Marco 2-vía", codigo:isP92?"ALD-901":"ALD-602", cant:2*f.cantidad, tamano:r.dim.lt, pies:r.pies.lat},
      {perfil:"Lateral Marco 3-vía", codigo:isP92?"ALD-901":"ALD-624", cant:2*f.cantidad, tamano:r.dim.lt, pies:r.pies.lat},
      {perfil:"Cabezal Marco",        codigo:isP92?"ALD-902":"ALD-602", cant:f.cantidad,   tamano:r.dim.ct, pies:r.pies.cab},
      {perfil:"Cabezal Marco 3-vía",  codigo:isP92?"ALD-902":"ALD-622", cant:f.cantidad,   tamano:r.dim.ct, pies:r.pies.cab},
      {perfil:`Riel Marco ${r.riel==="Exterior (E)"?"Ext.":"Int."}`, codigo:isP92?"ALD-900":r.riel==="Exterior (E)"?"ALD-601":"ALD-625", cant:f.cantidad, tamano:r.dim.ct, pies:r.pies.rie},
    ];
    hojaRows=[
      {perfil:"Cabezal Hoja",     codigo:isP92?"ALD-904":"ALD-606", cant:f.hojas*f.cantidad, tamano:r.dim.cht, pies:r.pies.chb},
      {perfil:"Alfeizal Hoja",    codigo:isP92?"ALD-904":"ALD-606", cant:f.hojas*f.cantidad, tamano:r.dim.cht, pies:r.pies.alf},
      {perfil:"Jamba Llavin",     codigo:isP92?"ALD-906":"ALD-607", cant:"—",                tamano:r.dim.jt,  pies:r.pies.jll},
      {perfil:"Jamba Enganche",   codigo:isP92?"ALD-907":"ALD-608", cant:"—",                tamano:r.dim.jt,  pies:r.pies.jng},
      ...(r.pies?.ada>0?[{perfil:"Adaptador",codigo:isP92?"ALD-910":"ALD-610",cant:"—",tamano:r.dim.jt,pies:r.pies.ada}]:[]),
    ];
  }

  if(tipo==="pu"){
    marcoRows=[
      {perfil:"Lateral Marco",    codigo:"GK-48",  cant:r.counts?.lat_c, tamano:r.dim.lat_t, pies:r.pies.lat},
      {perfil:"Cabezal / Roda",   codigo:"GK-48",  cant:r.counts?.cab_c, tamano:r.dim.cab_t, pies:r.pies.cab},
      {perfil:"Piel Marco",       codigo:"DS-50",  cant:r.counts?.cab_c, tamano:r.dim.cab_t, pies:r.pies.pie},
    ];
    hojaRows=[
      {perfil:"Cabezal Hoja",     codigo:"GK-50",  cant:r.counts?.chc,   tamano:r.dim.cht,   pies:r.pies.chb},
      {perfil:"Alfeizal Hoja",    codigo:"GK-52",  cant:r.counts?.chc,   tamano:r.dim.cht,   pies:r.pies.alf},
      {perfil:"Jambas Hoja",      codigo:"GK-50",  cant:r.counts?.jamc,  tamano:r.dim.jam_t, pies:r.pies.jam},
    ];
    extraRows=[
      ...(r.pies?.emp>0?[{perfil:"Barra Empuje",codigo:"GK-85",cant:r.counts?.chc,tamano:r.dim.barra_empuje,pies:r.pies.emp}]:[]),
      {perfil:"Soporte Empuje",   codigo:"GK-84",  cant:r.counts?.lat_c, tamano:r.dim.jam_t, pies:r.pies.sop},
      {perfil:"Tapa Moldura",     codigo:"GK-46",  cant:r.counts?.tope_can, tamano:`${r.dim.tope_ancho}+${r.dim.tope_alto}`, pies:r.pies.top},
    ];
  }

  // ── dimension boxes ────────────────────────────────────────────────────────
  const dims = tipo==="pu"
    ? [["Ancho",r.dim.ancho],["Alto",r.dim.alto],["Lat. Marco",r.dim.lat_t],["Cab. Marco",r.dim.cab_t],["Jamba Hoja",r.dim.jam_t],["Cab./Alf. Hoja",r.dim.cht],["Tope Ancho",r.dim.tope_ancho],["Tope Alto",r.dim.tope_alto]]
    : tipo==="pa"||tipo==="paa"
    ? [["Ancho",r.dim.ancho],["Alto",r.dim.alto],["Celosía",r.dim.tce],["Cabezal/Alf.",r.dim.tc],["Jamba",r.dim.jt],["Balancín",r.dim.lb]]
    : [["Ancho",r.dim.ancho],["Alto",r.dim.alto],["Lat. Marco",r.dim.lt||r.dim.lat_t],["Cab. Marco",r.dim.ct||r.dim.cab_t],["Jamba Hoja",r.dim.jt||r.dim.jam_t],["Cab. Hoja",r.dim.cht],["Vidrio A.",r.dim.vw||r.dim.vid_ancho],["Vidrio H.",r.dim.vh||r.dim.vid_alto]];

  // ── hardware items ─────────────────────────────────────────────────────────
  const hw = r.hw||{};
  const hwItems = tipo==="cor"
    ? [["Ruedas",hw.rue,"u"],["Guías",hw.gui,"u"],["Tornillos",hw.tor,"u"],["Cerraduras",hw.cer,"u"],["Goma",hw.gom,"pie"],["Felpa",hw.fel,"pie"]]
    : tipo==="pa"||tipo==="paa"
    ? [["Goma",hw.gom,"pie"],["Remaches",hw.rem,"u"],["Operadores",hw.op,"u"],["Torn. 10×5/8",hw.tc,"u"],["Torn. Empate",hw.te,"u"],...(r.tipoPer==="Vidrio"?[["Clips",hw.cli,"u"]]:[])]
    : tipo==="p65"||tipo==="p92"
    ? [["Ruedas",hw.rue,"u"],["Guías",hw.gui,"u"],["Tornillos",hw.tor,"u"],["Cerraduras",hw.cer,"u"],["Goma",hw.gom,"pie"],["Felpa",hw.fel,"pie"]]
    : [["Pivot",hw.pivot,"u"],["Cierre Automático",hw.cierre,"u"],["Cerradura",hw.cerradura,"u"],...(hw.pestillo?[["Pestillo",hw.pestillo,"u"]]:[]),["Puño",hw.puno,"u"],["Goma",hw.goma,"pie"],["Felpa",hw.felpa,"pie"]];

  const tipoPuerta = r.tipoPuerta;
  const tipoLabel = {cor:"Corrediza Tradicional",pa:"Persiana A",paa:"Persiana AA",p65:"P-65",p92:"P-92",pu:"Puertas"}[tipo];

  return(<div className="cr">
    {/* HERO */}
    <div className="hero">
      <div>
        <div className="hl">Pietaje Total · {tipoLabel}</div>
        <div className="hs">
          {f.hojas&&<span className="ht">{f.hojas} {tipo==="pu"?"hoja(s)":"hojas"}</span>}
          {f.cuerpo&&(tipo==="pa"||tipo==="paa")&&<span className="ht">{f.cuerpo} cuerpo(s)</span>}
          <span className="ht">{f.cantidad} hueco(s)</span>
          {r.material&&<span className="ht">{r.material}</span>}
          {r.riel&&<span className="ht">{r.riel}</span>}
          {tipoPuerta&&<span className="ht">{tipoPuerta}</span>}
          {r.tipoPer&&<span className="ht">{r.tipoPer}</span>}
        </div>
      </div>
      <div style={{textAlign:"right"}}>
        <div className="hn">{r.pie}</div>
        <div className="hu">pies²</div>
      </div>
    </div>

    {/* DIMENSIONES DE CORTE */}
    <div className="card card-outlined">
      <div className="card-hdr"><div className="card-ttl">Dimensiones de corte</div></div>
      <div className="card-bdy">
        <div className="dg">
          {dims.map(([l,v])=>v?(
            <div key={l} className="db">
              <div className="dl">{l}</div>
              <div className="dv">{v}</div>
            </div>
          ):null)}
        </div>
      </div>
    </div>

    {/* PERFILES — MARCO DEL CUADRO */}
    {marcoRows.length>0&&<ProfileTable title="Marco del cuadro" rows={marcoRows} badge={r.riel?"Riel "+r.riel:undefined}/>}

    {/* PERFILES — MARCO DE LA HOJA */}
    {hojaRows.length>0&&<ProfileTable title="Marco de la hoja" rows={hojaRows} color="green"/>}

    {/* PERFILES — EXTRAS (Puertas: empuje, soporte, tapa) */}
    {extraRows.length>0&&<ProfileTable title="Accesorios de marco" rows={extraRows}/>}

    {/* BALANCINES (Persianas) */}
    {(tipo==="pa"||tipo==="paa")&&<div className="card card-outlined">
      <div className="card-hdr"><div className="card-ttl">Balancines y operadores</div></div>
      <div className="card-bdy">
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[["Balancín 1",r.bl?.b1||"—"],["Balancín 2",r.bl?.b2||"—"],["Operadores",r.bl?.op+" unid"]].map(([l,v])=>(
            <div key={l} className="db">
              <div className="dl">{l}</div>
              <div className="dv">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>}

    {/* ROSCADA (Puertas) */}
    {tipo==="pu"&&r.dim?.barra_roscada&&r.dim.barra_roscada!=="—"&&<div style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13}}>
      <span style={{fontWeight:500}}>Barra Roscada</span>
      <span className="mono" style={{color:"var(--pri)",fontWeight:600}}>{r.dim.barra_roscada} × {r.hw?.roscada} unid</span>
    </div>}

    {/* VIDRIO */}
    {(tipo==="cor"||tipo==="p65"||tipo==="p92"||tipo==="pu"||(tipo==="pa"||tipo==="paa")&&r.tipoPer==="Vidrio")&&
    <div className="card card-outlined">
      <div className="card-hdr"><div className="card-ttl">Vidrio</div></div>
      <div className="card-bdy">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <div className="db"><div className="dl">Tipo</div><div style={{fontSize:13,fontWeight:600,color:"var(--sec)",marginTop:2}}>{r.glass?.tipo||r.vidrio||"—"}</div></div>
          <div className="db"><div className="dl">Cantidad</div><div className="dv">{r.glass?.cant||r.counts?.vid_can||"—"} <span style={{fontSize:11,color:"var(--on-sur3)"}}>pzas</span></div></div>
          <div className="db"><div className="dl">{tipo==="pa"||tipo==="paa"?"Pie lineal":"Pie²"}</div><div className="dv">{tipo==="pa"||tipo==="paa"?r.lam:r.glass?.sqft} <span style={{fontSize:11,color:"var(--on-sur3)"}}>{tipo==="pa"||tipo==="paa"?"pie":"ft²"}</span></div></div>
          {(tipo==="cor"||tipo==="p65"||tipo==="p92")&&<><div className="db"><div className="dl">Vidrio Ancho</div><div className="dv">{r.dim.vw}</div></div><div className="db"><div className="dl">Vidrio Alto</div><div className="dv">{r.dim.vh}</div></div></>}
          {tipo==="pu"&&<><div className="db"><div className="dl">Tope Ancho</div><div className="dv">{r.dim.tope_ancho}</div></div><div className="db"><div className="dl">Tope Alto</div><div className="dv">{r.dim.tope_alto}</div></div></>}
        </div>
      </div>
    </div>}

    {/* HERRAJES */}
    <div className="card card-outlined">
      <div className="card-hdr"><div className="card-ttl">Herrajes y accesorios</div></div>
      <div style={{padding:"4px 20px 16px"}}>
        {hwItems.filter(([,v])=>v!==undefined&&v!==null&&v!=="").map(([l,v,u])=>(
          <HwRow key={l} label={l} value={v} unit={u} highlight={l==="Goma"||l==="Felpa"}/>
        ))}
      </div>
    </div>

    {/* ADD TO ORDER */}
    <button className="add-line-btn" onClick={onAdd}>＋ Agregar a la orden de producción</button>
  </div>);
}


// ═══ ORDER TABLE ══════════════════════════════════════════════════════════════
function OrderTable({lines,onDelete,onPrint}){
  if(!lines.length) return null;
  const tot=sumOrder(lines);
  const typeLabel=t=>t==="cor"?"Corrediza":t==="pa"?"Persiana A":"Persiana AA";
  const typeColor=t=>t==="cor"?"chip-filled-pri":t==="pa"?"chip-filled-sec":"";
  return(
    <div className="order-wrap">
      <div className="order-hdr">
        <div>
          <div className="order-hdr-ttl">📋 Orden de Producción</div>
          <div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>{lines.length} línea(s) · {lines.reduce((s,l)=>s+l.cantidad,0)} unidades</div>
        </div>
        <div className="order-stats">
          <div className="order-stat"><div className="order-stat-n">{tot.pie}</div><div>pies²</div></div>
          <div className="order-stat"><div className="order-stat-n">{tot.gom}</div><div>pie goma</div></div>
          {tot.rem>0&&<div className="order-stat"><div className="order-stat-n">{tot.rem}</div><div>remaches</div></div>}
        </div>
        <button className="btn btn-filled btn-sm" onClick={onPrint}>⬇ Descargar PDF</button>
      </div>
      <div className="twrap">
        <table>
          <thead><tr><th>#</th><th>Descripción</th><th>Tipo</th><th>Ancho</th><th>Alto</th><th>Cant.</th><th>Material</th><th>Pies²</th><th></th></tr></thead>
          <tbody>
            {lines.map((l,i)=>(
              <tr key={l.id}>
                <td style={{fontWeight:700,color:"var(--pri)",fontSize:13}}>{i+1}</td>
                <td style={{fontWeight:500}}>{l.label}</td>
                <td><span className={`chip ${typeColor(l.tipo)}`}>{typeLabel(l.tipo)}</span></td>
                <td><span className="mono">{l.dim.ancho}</span></td>
                <td><span className="mono">{l.dim.alto}</span></td>
                <td style={{textAlign:"center",fontWeight:600}}>{l.cantidad}</td>
                <td style={{color:"var(--on-sur3)"}}>{l.material}</td>
                <td style={{fontWeight:700,color:"var(--pri)"}}>{l.pie}</td>
                <td><button className="icon-btn danger del-btn" onClick={()=>onDelete(l.id)} title="Eliminar línea">🗑️</button></td>
              </tr>
            ))}
            <tr style={{background:"var(--sur2)"}}>
              <td colSpan={7} style={{fontWeight:600,textAlign:"right",fontSize:12,color:"var(--on-sur3)",letterSpacing:".5px"}}>TOTAL PIETAJE</td>
              <td style={{fontWeight:700,color:"var(--pri)",fontSize:15}}>{tot.pie} ft²</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="summary-row">
        <div className="summary-item">Goma total: <span className="summary-val">{tot.gom} pie</span></div>
        {tot.rem>0&&<div className="summary-item">· Remaches: <span className="summary-val">{tot.rem}</span></div>}
        {tot.op>0&&<div className="summary-item">· Operadores: <span className="summary-val">{tot.op}</span></div>}
      </div>
    </div>
  );
}
// ═══ CALCULADORAS ════════════════════════════════════════════════════════════
function Calculadoras({init}){
  const [sel,setSel]=useState(init||null);
  const [form,setForm]=useState({unidad:"Pulgadas",ancho:"",alto:"",hojas:2,cuerpo:1,cantidad:1,material:"Natural",vidrio:"Natural transparente",tipo:"Aluminio",riel:"Exterior (E)",tipoPuerta:"Comercial",posicion:"Derecha"});
  const [res,setRes]=useState(null);const [errs,setErrs]=useState([]);
  const [lines,setLines]=useState([]);const [showModal,setShowModal]=useState(false);
  const [loading,setLoading]=useState(false);
  const sf=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  async function calc(){
    setErrs([]);setRes(null);const e=[];
    if(!form.ancho)e.push("Ingrese el ancho.");if(!form.alto)e.push("Ingrese el alto.");if(e.length){setErrs(e);return;}

    // Build the payload the backend expects (field names match app/models/schemas.py)
    const payload={
      ancho:parseFloat(form.ancho),
      alto:parseFloat(form.alto),
      unidad:form.unidad,
      cantidad:parseInt(form.cantidad),
      material:form.material,
      vidrio:form.vidrio,
    };
    if(sel==="cor"){
      payload.hojas=parseInt(form.hojas);
    } else if(sel==="pa"||sel==="paa"){
      payload.cuerpo=parseInt(form.cuerpo);
      payload.tipo_persiana=form.tipo;
    } else if(sel==="p65"||sel==="p92"){
      payload.hojas=parseInt(form.hojas);
      payload.riel=form.riel;
    } else if(sel==="pu"){
      payload.hojas=parseInt(form.hojas);
      payload.tipo_puerta=form.tipoPuerta;
      payload.posicion=form.posicion;
    } else if(sel==="siscop"){
      if(!siscopCod){ setErrs(["Selecciona un producto."]); return; }
      payload.cod_prod=siscopCod;
      payload.hojas=parseInt(form.hojas)||2;
    }

    setLoading(true);
    try{
      const r=await calcularEnServidor(sel,payload);
      setRes(r);
    } catch(err){
      setErrs([err.message||"Error al calcular. Intenta de nuevo."]);
    } finally {
      setLoading(false);
    }
  }

  function addLine(){if(!res)return;setLines(l=>[...l,{...res,id:Date.now()}]);setRes(null);setErrs([]);setForm(f=>({...f,ancho:"",alto:""}));}
  function delLine(id){setLines(l=>l.filter(x=>x.id!==id));}
  const isPer=sel==="pa"||sel==="paa";
  const isP65=sel==="p65";
  const isP92=sel==="p92";
  const isMed=isP65||isP92;
  const isPuerta=sel==="pu";
  const vInfo=VENTANAS.find(v=>v.id===sel);

  if(!sel)return(
    <div>
      <p style={{color:"var(--on-sur3)",marginBottom:20,fontSize:14}}>Selecciona el tipo de ventana o persiana para calcular los materiales.</p>
      <div className="vg">
        {VENTANAS.filter(v=>!v.hidden).map(v=>(
          <div key={v.id} className={"vc"+(v.on?"":" off")} onClick={()=>v.on&&setSel(v.id)}>
            <span className={"chip vbg "+(v.on?"chip-filled-sec":"")}>
              {v.on?"✓ Disponible":"Próximamente"}
            </span>
            <div className="vi">{v.icon}</div>
            <div className="vn">{v.nombre}</div>
            <div className="vd">{v.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button className="btn btn-outlined btn-sm" onClick={()=>{setSel(null);setRes(null);setErrs([]);}}>← Volver</button>
        <span style={{fontSize:16,fontWeight:500,color:"var(--on-sur)"}}>{vInfo.icon} {vInfo.nombre}</span>
        {lines.length>0&&(
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
            <span className="chip chip-filled-pri">{lines.length} en orden</span>
            <button className="btn btn-filled btn-sm" onClick={()=>setShowModal(true)}>⬇ Descargar PDF</button>
          </div>
        )}
      </div>
      <div className="cl">
        {/* Form */}
        <div className="card">
          <div className="card-hdr" style={{paddingBottom:16}}><div className="card-ttl">Datos del hueco</div></div>
          <div className="card-bdy"><div className="fgrid" style={{gap:14}}>
            {sel==="siscop"&&<>
              <div className="fld"><label>Buscar producto</label>
                <input value={siscopQ} onChange={e=>setSiscopQ(e.target.value)} placeholder="Ej: CORR P92, persiana..."/>
              </div>
              <div className="fld"><label>Producto ({siscopProds.length})</label>
                <select value={siscopCod} onChange={e=>setSiscopCod(e.target.value)}>
                  <option value="">— Selecciona —</option>
                  {siscopProds.filter(p=>(p.nombre+" "+p.cod_prod).toLowerCase().includes(siscopQ.toLowerCase())).slice(0,200).map(p=>(
                    <option key={p.cod_prod} value={p.cod_prod}>{p.nombre} ({p.serie})</option>
                  ))}
                </select>
              </div>
            </>}
            <div className="fld"><label>Unidad de medida</label><select value={form.unidad} onChange={sf("unidad")}><option>Pulgadas</option><option>Metros</option></select></div>
            <div className="fgrid f2">
              <div className="fld"><label>Ancho</label><input type="number" step="0.0625" value={form.ancho} onChange={sf("ancho")} placeholder={form.unidad==="Metros"?"1.20":"48"}/></div>
              <div className="fld"><label>Alto</label><input type="number" step="0.0625" value={form.alto} onChange={sf("alto")} placeholder={form.unidad==="Metros"?"1.50":"60"}/></div>
            </div>
            {(isMed||sel==="siscop"||!isPer&&!isPuerta)&&<div className="fgrid f2">
              <div className="fld"><label>Hojas</label><select value={form.hojas} onChange={sf("hojas")}>{[2,3,4,6].map(h=><option key={h} value={h}>{h} hojas</option>)}</select></div>
              <div className="fld"><label>Cantidad</label><input type="number" min="1" value={form.cantidad} onChange={sf("cantidad")}/></div>
            </div>}
            {isPuerta&&<div className="fgrid f2">
              <div className="fld"><label>Tipo de Puerta</label><select value={form.tipoPuerta} onChange={sf("tipoPuerta")}><option>Comercial</option><option>Residencial</option></select></div>
              <div className="fld"><label>Hojas</label><select value={form.hojas} onChange={e=>setForm(f=>({...f,hojas:parseInt(e.target.value)}))}><option value={1}>1 Hoja</option><option value={2}>2 Hojas</option></select></div>
            </div>}
            {isPuerta&&<div className="fgrid f2">
              <div className="fld"><label>Posición</label><select value={form.posicion} onChange={sf("posicion")}><option>Derecha</option><option>Izquierda</option></select></div>
              <div className="fld"><label>Cantidad</label><input type="number" min="1" value={form.cantidad} onChange={sf("cantidad")}/></div>
            </div>}
            {isMed&&<div className="fld"><label>Tipo de Riel</label>
              <select value={form.riel} onChange={sf("riel")}><option>Exterior (E)</option><option>Interior (I)</option></select>
            </div>}
            {isPer&&<div className="fgrid f2">
              <div className="fld"><label>Cuerpos</label><select value={form.cuerpo} onChange={sf("cuerpo")}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?"cuerpo":"cuerpos"}</option>)}</select></div>
              <div className="fld"><label>Cantidad</label><input type="number" min="1" value={form.cantidad} onChange={sf("cantidad")}/></div>
            </div>}
            {isPer&&<div className="fld"><label>Tipo</label><select value={form.tipo} onChange={sf("tipo")}><option>Aluminio</option><option>Vidrio</option></select></div>}
            {isPer&&form.tipo==="Vidrio"&&<div className="fld"><label>Tipo de vidrio</label><select value={form.vidrio} onChange={sf("vidrio")}>{VIDS.map(v=><option key={v}>{v}</option>)}</select></div>}
            <div className="fld"><label>Material</label><select value={form.material} onChange={sf("material")}>{MATS.map(m=><option key={m}>{m}</option>)}</select></div>
            {!isPer&&<div className="fld"><label>Tipo de vidrio</label><select value={form.vidrio} onChange={sf("vidrio")}>{VIDS.map(v=><option key={v}>{v}</option>)}</select></div>}
            {errs.length>0&&<div style={{background:"var(--err-light)",border:"1px solid #fad2cf",borderRadius:"var(--r-sm)",padding:"10px 14px",fontSize:13,color:"var(--err)"}}>{errs.map((e,i)=><div key={i}>⚠ {e}</div>)}</div>}
            <button className="btn btn-filled" style={{width:"100%",borderRadius:"var(--r-sm)"}} onClick={calc} disabled={loading}>{loading?"Calculando...":"Calcular materiales"}</button>
            {res&&<button className="btn btn-outlined" style={{width:"100%",borderRadius:"var(--r-sm)"}} onClick={()=>{setRes(null);setErrs([]);}}>Limpiar</button>}
          </div></div>
        </div>
        {/* Results */}
        <div>
          {!res&&<div className="card" style={{padding:"64px 20px",textAlign:"center",border:"1px solid var(--out)",boxShadow:"none"}}>
            <div style={{fontSize:40,marginBottom:12,opacity:.4}}>{vInfo.icon}</div>
            <div style={{fontSize:16,color:"var(--on-sur3)",fontWeight:400,marginBottom:6}}>Ingresa las medidas del hueco</div>
            <div style={{fontSize:13,color:"var(--on-sur4)"}}>El desglose completo aparecerá aquí</div>
          </div>}
          {res&&<CalcResult r={res} f={form} onAdd={addLine}/>}
        </div>
      </div>
      <OrderTable lines={lines} onDelete={delLine} onPrint={()=>setShowModal(true)}/>
      {showModal&&<OrderModal lines={lines} onClose={()=>setShowModal(false)}/>}
    </div>
  );
}

// ═══ CLIENTES ════════════════════════════════════════════════════════════════
function Clientes(){
  const [lista,setLista]=useState(DC);const [q,setQ]=useState("");const [tab,setTab]=useState("todos");const [modal,setModal]=useState(false);const [edit,setEdit]=useState(null);const [confirm,setConfirm]=useState(null);
  const [form,setForm]=useState({nombre:"",contacto:"",tel:"",email:"",ciudad:"",tipo:"Empresa",estado:"Activo",notas:""});
  const filtered=lista.filter(c=>{const m=c.nombre.toLowerCase().includes(q.toLowerCase())||c.contacto.toLowerCase().includes(q.toLowerCase());if(tab==="activos")return m&&c.estado==="Activo";if(tab==="inactivos")return m&&c.estado==="Inactivo";return m;});
  function openNew(){setEdit(null);setForm({nombre:"",contacto:"",tel:"",email:"",ciudad:"",tipo:"Empresa",estado:"Activo",notas:""});setModal(true);}
  function openEdit(c){setEdit(c);setForm({...c});setModal(true);}
  function save(){if(!form.nombre.trim())return;if(edit){setLista(l=>l.map(x=>x.id===edit.id?{...x,...form}:x));}else{setLista(l=>[...l,{...form,id:Date.now(),ordenes:0}]);}setModal(false);}
  const sf=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const statusColor=s=>s==="Activo"?"chip-filled-sec":"chip-filled-err";
  const typeColor=t=>t==="Empresa"?"chip-filled-pri":"";
  return(<div>
    <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:20}}>
      <div className="sbar"><span style={{color:"var(--on-sur4)"}}>🔍</span><input placeholder="Buscar clientes..." value={q} onChange={e=>setQ(e.target.value)}/></div>
      <button className="btn btn-filled" onClick={openNew}>＋ Nuevo cliente</button>
    </div>
    <div className="seg-tabs">{[["todos","Todos"],["activos","Activos"],["inactivos","Inactivos"]].map(([v,l])=>(<button key={v} className={"seg-tab"+(tab===v?" on":"")} onClick={()=>setTab(v)}>{l}</button>))}</div>
    <div className="card">
      <div className="twrap">
        <table>
          <thead><tr><th>Cliente</th><th>Teléfono</th><th>Ciudad</th><th>Tipo</th><th>Estado</th><th>Órdenes</th><th></th></tr></thead>
          <tbody>
            {filtered.length===0&&<tr><td colSpan={7} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin resultados</td></tr>}
            {filtered.map(c=>(<tr key={c.id}>
              <td><div style={{fontWeight:500}}>{c.nombre}</div><div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>{c.contacto} · {c.email}</div></td>
              <td><span className="mono">{c.tel}</span></td><td style={{color:"var(--on-sur3)"}}>{c.ciudad}</td>
              <td><span className={`chip ${typeColor(c.tipo)}`}>{c.tipo}</span></td>
              <td><span className={`chip ${statusColor(c.estado)}`}>{c.estado}</span></td>
              <td><span className="chip chip-filled-warn">{c.ordenes}</span></td>
              <td><div style={{display:"flex",gap:4}}><button className="icon-btn" onClick={()=>openEdit(c)} title="Editar">✏️</button><button className="icon-btn danger" onClick={()=>setConfirm(c.id)} title="Eliminar">🗑️</button></div></td>
            </tr>))}
          </tbody>
        </table>
      </div>
    </div>
    {modal&&<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}><div className="modal">
      <div className="modal-hdr"><div className="modal-ttl">{edit?"Editar cliente":"Nuevo cliente"}</div><button className="icon-btn" onClick={()=>setModal(false)}>✕</button></div>
      <div className="modal-bdy"><div className="fgrid f2" style={{gap:14}}>
        <div className="fld" style={{gridColumn:"1/-1"}}><label>Nombre / Empresa *</label><input value={form.nombre} onChange={sf("nombre")} placeholder="Constructora Pérez SRL"/></div>
        <div className="fld"><label>Persona de contacto</label><input value={form.contacto} onChange={sf("contacto")}/></div>
        <div className="fld"><label>Teléfono</label><input value={form.tel} onChange={sf("tel")} placeholder="809-000-0000"/></div>
        <div className="fld"><label>Email</label><input value={form.email} onChange={sf("email")}/></div>
        <div className="fld"><label>Ciudad</label><input value={form.ciudad} onChange={sf("ciudad")}/></div>
        <div className="fld"><label>Tipo</label><select value={form.tipo} onChange={sf("tipo")}><option>Empresa</option><option>Particular</option></select></div>
        <div className="fld"><label>Estado</label><select value={form.estado} onChange={sf("estado")}><option>Activo</option><option>Inactivo</option></select></div>
        <div className="fld" style={{gridColumn:"1/-1"}}><label>Notas</label><textarea value={form.notas} onChange={sf("notas")} placeholder="Notas adicionales..."/></div>
      </div></div>
      <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-filled" onClick={save}>Guardar</button></div>
    </div></div>}
    {confirm&&<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setConfirm(null)}}><div className="modal" style={{maxWidth:380}}>
      <div className="modal-hdr"><div className="modal-ttl">¿Eliminar cliente?</div></div>
      <div className="modal-bdy"><p style={{fontSize:14,color:"var(--on-sur3)",paddingBottom:8}}>Esta acción no se puede deshacer.</p></div>
      <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setConfirm(null)}>Cancelar</button><button className="btn btn-err" onClick={()=>{setLista(l=>l.filter(x=>x.id!==confirm));setConfirm(null);}}>Eliminar</button></div>
    </div></div>}
  </div>);
}

// ═══ PROVEEDORES ═════════════════════════════════════════════════════════════
function Proveedores(){
  const [lista,setLista]=useState(DP);const [q,setQ]=useState("");const [modal,setModal]=useState(false);const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({nombre:"",contacto:"",tel:"",ciudad:"",producto:"",estado:"Activo"});
  const filtered=lista.filter(p=>p.nombre.toLowerCase().includes(q.toLowerCase())||p.producto.toLowerCase().includes(q.toLowerCase()));
  function openNew(){setEdit(null);setForm({nombre:"",contacto:"",tel:"",ciudad:"",producto:"",estado:"Activo"});setModal(true);}
  function openEdit(p){setEdit(p);setForm({...p});setModal(true);}
  function save(){if(!form.nombre.trim())return;if(edit){setLista(l=>l.map(x=>x.id===edit.id?{...x,...form}:x));}else{setLista(l=>[...l,{...form,id:Date.now()}]);}setModal(false);}
  const sf=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  return(<div>
    <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:20}}>
      <div className="sbar"><span style={{color:"var(--on-sur4)"}}>🔍</span><input placeholder="Buscar proveedores..." value={q} onChange={e=>setQ(e.target.value)}/></div>
      <button className="btn btn-filled" onClick={openNew}>＋ Nuevo proveedor</button>
    </div>
    <div className="card">
      <div className="twrap"><table>
        <thead><tr><th>Proveedor</th><th>Teléfono</th><th>Ciudad</th><th>Producto</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {filtered.map(p=>(<tr key={p.id}>
            <td><div style={{fontWeight:500}}>{p.nombre}</div><div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>{p.contacto}</div></td>
            <td><span className="mono">{p.tel}</span></td><td style={{color:"var(--on-sur3)"}}>{p.ciudad}</td>
            <td><span className="chip chip-filled-pri">{p.producto}</span></td>
            <td><span className={`chip ${p.estado==="Activo"?"chip-filled-sec":""}`}>{p.estado}</span></td>
            <td><button className="icon-btn" onClick={()=>openEdit(p)}>✏️</button></td>
          </tr>))}
        </tbody>
      </table></div>
    </div>
    {modal&&<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}><div className="modal">
      <div className="modal-hdr"><div className="modal-ttl">{edit?"Editar proveedor":"Nuevo proveedor"}</div><button className="icon-btn" onClick={()=>setModal(false)}>✕</button></div>
      <div className="modal-bdy"><div className="fgrid f2" style={{gap:14}}>
        <div className="fld" style={{gridColumn:"1/-1"}}><label>Nombre *</label><input value={form.nombre} onChange={sf("nombre")}/></div>
        <div className="fld"><label>Contacto</label><input value={form.contacto} onChange={sf("contacto")}/></div>
        <div className="fld"><label>Teléfono</label><input value={form.tel} onChange={sf("tel")}/></div>
        <div className="fld"><label>Ciudad</label><input value={form.ciudad} onChange={sf("ciudad")}/></div>
        <div className="fld" style={{gridColumn:"1/-1"}}><label>Producto principal</label><input value={form.producto} onChange={sf("producto")}/></div>
        <div className="fld"><label>Estado</label><select value={form.estado} onChange={sf("estado")}><option>Activo</option><option>Inactivo</option></select></div>
      </div></div>
      <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-filled" onClick={save}>Guardar</button></div>
    </div></div>}
  </div>);
}

// ═══ DASHBOARD ════════════════════════════════════════════════════════════════
function Dashboard({onNav}){
  const acts=[
    {c:"#1a73e8",t:"Presupuesto generado — Constructora Pérez",s:"Hace 12 min"},
    {c:"#188038",t:"Nuevo cliente — Inmobiliaria Vista Verde",s:"Hace 1h"},
    {c:"#1a73e8",t:"Corrediza 48×60\" × 3 huecos calculada",s:"Hace 2h"},
    {c:"#f9ab00",t:"Persiana AA 36×84\" calculada",s:"Hoy 9:15am"},
    {c:"#188038",t:"Proveedor Aluminio del Caribe actualizado",s:"Ayer"},
  ];
  return(<div>
    <div className="stats-grid">
      {[
        {l:"Clientes",n:"24",s:"↑ 3 este mes",sc:"var(--sec)",i:"👥",bg:"var(--sec-light)"},
        {l:"Presupuestos",n:"87",s:"↑ 12 este mes",sc:"var(--pri)",i:"📋",bg:"var(--pri-light)"},
        {l:"Pietaje total",n:"1,240",s:"pies² calculados",sc:"var(--on-sur3)",i:"📐",bg:"var(--sur3)"},
        {l:"Proveedores",n:"8",s:"3 activos hoy",sc:"var(--on-sur3)",i:"🏭",bg:"var(--sur3)"},
      ].map(s=>(<div key={s.l} className="stat-card">
        <div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div>
        <div className="stat-num">{s.n}</div>
        <div className="stat-lbl">{s.l}</div>
        <div className="stat-sub" style={{color:s.sc}}>{s.s}</div>
      </div>))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
      <div className="card"><div className="card-hdr" style={{paddingBottom:0}}><div className="card-ttl">Actividad reciente</div></div><div className="card-bdy">
        {acts.map((a,i)=>(<div key={i} className="act-i"><div className="act-d" style={{background:a.c}}/><div><div className="act-t">{a.t}</div><div className="act-s">{a.s}</div></div></div>))}
      </div></div>
      <div className="card"><div className="card-hdr" style={{paddingBottom:0}}><div className="card-ttl">Calculadoras</div></div><div className="card-bdy">
        {VENTANAS.filter(v=>!v.hidden).map(v=>(<div key={v.id} className="act-i"><div style={{fontSize:18}}>{v.icon}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{v.nombre}</div><div className="act-s">{v.desc}</div></div><span className={`chip ${v.on?"chip-filled-sec":""}`}>{v.on?"Listo":"Pronto"}</span></div>))}
      </div></div>
    </div>
    <div className="card"><div className="card-hdr"><div className="card-ttl">Acceso rápido</div></div><div className="card-bdy" style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      {VENTANAS.filter(v=>v.on).map(v=>(<button key={v.id} className="btn btn-tonal btn-sm" onClick={()=>onNav("calc",v.id)}>{v.icon} {v.nombre}</button>))}
    </div></div>
  </div>);
}

// ═══ COMING SOON ═════════════════════════════════════════════════════════════
function ComingSoon({name,icon}){
  return(<div className="card" style={{padding:"80px 40px",textAlign:"center",border:"1px solid var(--out)",boxShadow:"none"}}>
    <div style={{width:64,height:64,background:"var(--pri-light)",borderRadius:"var(--r-xl)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 20px"}}>{icon}</div>
    <div style={{fontSize:20,fontWeight:400,color:"var(--on-sur)",marginBottom:8}}>{name}</div>
    <div style={{fontSize:14,color:"var(--on-sur3)",maxWidth:360,margin:"0 auto"}}>Este módulo estará disponible en la próxima fase. Sube los archivos de cálculo para activarlo.</div>
  </div>);
}

// ═══ NAV CONFIG ══════════════════════════════════════════════════════════════
const NAV=[
  {id:"dash",label:"Dashboard",icon:"🏠"},
  {id:"calc",label:"Calculadoras",icon:"📐"},
  {divider:true},
  {id:"cli",label:"Clientes",icon:"👥"},
  {id:"prov",label:"Proveedores",icon:"🏭"},
  {id:"alm",label:"Almacén",icon:"📦"},
  {divider:true},
  {id:"pre",label:"Precios & Ganancias",icon:"💲"},
  {id:"pres",label:"Presupuestos",icon:"📋"},
  {id:"fac",label:"Facturación",icon:"🧾"},
  {id:"ord",label:"Órdenes",icon:"🗂️"},
  {divider:true},
  {id:"lic",label:"Licencias",icon:"🔑"},
  {id:"ref",label:"Referidos",icon:"🤝"},
];
const TT={dash:"Dashboard",calc:"Calculadoras",cli:"Clientes",prov:"Proveedores",alm:"Almacén",pre:"Precios & Ganancias",pres:"Presupuestos",fac:"Facturación",ord:"Historial de Órdenes",lic:"Licencias",ref:"Programa de Referidos"};

// ═══ APP ════════════════════════════════════════════════════════════════════
// ═══ ALMACÉN ═════════════════════════════════════════════════════════════════
const CATEGORIAS_ALM = ["Perfiles de Marco","Perfiles de Hoja","Rieles","Vidrios","Herrajes","Accesorios","Otros"];
const UNIDADES_ALM   = ["Barra (20 pie)","Barra (21 pie)","Unidad","Pie lineal","Pie²","Rollo","Caja"];
const INIT_ALM = [
  {id:1,codigo:"GK-48",nombre:"Lateral / Cabezal Marco GK-48",categoria:"Perfiles de Marco",unidad:"Barra (20 pie)",stock:24,minimo:10,costo:850,material:"Natural"},
  {id:2,codigo:"GK-50",nombre:"Cabezal / Jamba Hoja GK-50",categoria:"Perfiles de Hoja",unidad:"Barra (20 pie)",stock:18,minimo:8,costo:780,material:"Natural"},
  {id:3,codigo:"GK-40",nombre:"Lateral Marco Corrediza GK-40",categoria:"Perfiles de Marco",unidad:"Barra (20 pie)",stock:30,minimo:12,costo:720,material:"Natural"},
  {id:4,codigo:"ALD-601",nombre:"Riel Marco Ext. 3-vía ALD-601",categoria:"Rieles",unidad:"Barra (20 pie)",stock:15,minimo:6,costo:1100,material:"Natural"},
  {id:5,codigo:"ALD-900",nombre:"Riel Marco P-92 ALD-900",categoria:"Rieles",unidad:"Barra (20 pie)",stock:8,minimo:4,costo:1250,material:"Natural"},
  {id:6,codigo:"VID-NAT",nombre:"Vidrio Natural Transparente",categoria:"Vidrios",unidad:"Pie²",stock:320,minimo:100,costo:45,material:"—"},
  {id:7,codigo:"VID-BCE",nombre:"Vidrio Bronce liso",categoria:"Vidrios",unidad:"Pie²",stock:180,minimo:60,costo:55,material:"—"},
  {id:8,codigo:"RUE-01",nombre:"Ruedas para corrediza",categoria:"Herrajes",unidad:"Unidad",stock:120,minimo:40,costo:85,material:"—"},
  {id:9,codigo:"GOM-01",nombre:"Goma de sello",categoria:"Accesorios",unidad:"Rollo",stock:12,minimo:4,costo:320,material:"—"},
  {id:10,codigo:"FEL-01",nombre:"Felpa de sello",categoria:"Accesorios",unidad:"Rollo",stock:8,minimo:3,costo:280,material:"—"},
];

function Almacen(){
  const [lista,setLista]=useState(INIT_ALM);
  const [q,setQ]=useState("");const [cat,setCat]=useState("todas");
  const [modal,setModal]=useState(false);const [edit,setEdit]=useState(null);
  const [ajModal,setAjModal]=useState(null);const [ajQty,setAjQty]=useState("");const [ajNota,setAjNota]=useState("");
  const [form,setForm]=useState({codigo:"",nombre:"",categoria:"Perfiles de Marco",unidad:"Barra (20 pie)",stock:0,minimo:5,costo:0,material:"Natural"});
  const sf=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const filtered=lista.filter(m=>{
    const mq=m.nombre.toLowerCase().includes(q.toLowerCase())||m.codigo.toLowerCase().includes(q.toLowerCase());
    return cat==="todas"?mq:mq&&m.categoria===cat;
  });
  const bajoStock=lista.filter(m=>m.stock<=m.minimo).length;
  const totalVal=lista.reduce((s,m)=>s+m.stock*m.costo,0);

  function openNew(){setEdit(null);setForm({codigo:"",nombre:"",categoria:"Perfiles de Marco",unidad:"Barra (20 pie)",stock:0,minimo:5,costo:0,material:"Natural"});setModal(true);}
  function openEdit(m){setEdit(m);setForm({...m});setModal(true);}
  function save(){if(!form.nombre.trim())return;
    if(edit)setLista(l=>l.map(x=>x.id===edit.id?{...x,...form,stock:parseFloat(form.stock),minimo:parseFloat(form.minimo),costo:parseFloat(form.costo)}:x));
    else setLista(l=>[...l,{...form,id:Date.now(),stock:parseFloat(form.stock),minimo:parseFloat(form.minimo),costo:parseFloat(form.costo)}]);
    setModal(false);}
  function ajustar(tipo){
    const qty=parseFloat(ajQty);if(!qty||isNaN(qty))return;
    setLista(l=>l.map(x=>x.id===ajModal.id?{...x,stock:Math.max(0,x.stock+(tipo==="entrada"?qty:-qty))}:x));
    setAjModal(null);setAjQty("");setAjNota("");}

  const statusColor=m=>m.stock<=0?"chip-filled-err":m.stock<=m.minimo?"chip-filled-warn":"chip-filled-sec";
  const statusLabel=m=>m.stock<=0?"Sin stock":m.stock<=m.minimo?"Bajo mínimo":"En stock";

  return(<div>
    {/* Stats */}
    <div className="stats-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
      {[{l:"Total Materiales",n:lista.length,s:"referencias",sc:"var(--on-sur3)",i:"📦",bg:"var(--sur3)"},
        {l:"Bajo Mínimo",n:bajoStock,s:"requieren reorden",sc:bajoStock>0?"var(--err)":"var(--sec)",i:"⚠️",bg:bajoStock>0?"#fce8e6":"var(--sec-lt)"},
        {l:"Valor en Inventario",n:`RD$${totalVal.toLocaleString()}`,s:"costo total",sc:"var(--pri)",i:"💰",bg:"var(--pri-lt)"},
      ].map(s=>(<div key={s.l} className="stat-card"><div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div><div className="stat-num" style={{fontSize:22}}>{s.n}</div><div className="stat-lbl">{s.l}</div><div className="stat-sub" style={{color:s.sc}}>{s.s}</div></div>))}
    </div>
    {/* Toolbar */}
    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
      <div className="sbar"><span style={{color:"var(--on-sur4)"}}>🔍</span><input placeholder="Buscar materiales..." value={q} onChange={e=>setQ(e.target.value)}/></div>
      <select style={{padding:"8px 14px",borderRadius:"var(--rfull)",border:"1px solid var(--out)",background:"var(--sur)",fontFamily:"inherit",fontSize:13,color:"var(--on-sur)",cursor:"pointer",outline:"none"}} value={cat} onChange={e=>setCat(e.target.value)}>
        <option value="todas">Todas las categorías</option>
        {CATEGORIAS_ALM.map(c=><option key={c}>{c}</option>)}
      </select>
      <button className="btn btn-filled" onClick={openNew}>＋ Nuevo Material</button>
    </div>
    {/* Table */}
    <div className="card">
      <div className="twrap"><table>
        <thead><tr><th>Código</th><th>Material</th><th>Categoría</th><th>Stock</th><th>Mínimo</th><th>Costo Unit.</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {filtered.length===0&&<tr><td colSpan={8} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin resultados</td></tr>}
          {filtered.map(m=>(
            <tr key={m.id}>
              <td><span className="mono" style={{fontWeight:600,color:"var(--pri)"}}>{m.codigo}</span></td>
              <td><div style={{fontWeight:500}}>{m.nombre}</div><div style={{fontSize:11,color:"var(--on-sur3)",marginTop:2}}>{m.unidad} · {m.material}</div></td>
              <td><span className="chip">{m.categoria}</span></td>
              <td><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:15,color:m.stock<=m.minimo?"var(--err)":"var(--on-sur)"}}>{m.stock}</span></td>
              <td><span className="mono" style={{color:"var(--on-sur3)"}}>{m.minimo}</span></td>
              <td><span className="mono">RD${m.costo.toLocaleString()}</span></td>
              <td><span className={`chip ${statusColor(m)}`}>{statusLabel(m)}</span></td>
              <td><div style={{display:"flex",gap:5}}>
                <button className="btn btn-tonal btn-sm" onClick={()=>setAjModal(m)}>+ / −</button>
                <button className="icon-btn" onClick={()=>openEdit(m)}>✏️</button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>

    {/* Modal nuevo/editar */}
    {modal&&<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}><div className="modal">
      <div className="modal-hdr"><div className="modal-ttl">{edit?"Editar Material":"Nuevo Material"}</div><button className="icon-btn" onClick={()=>setModal(false)}>✕</button></div>
      <div className="modal-bdy"><div className="fgrid f2" style={{gap:14}}>
        <div className="fld"><label>Código</label><input value={form.codigo} onChange={sf("codigo")} placeholder="GK-48"/></div>
        <div className="fld"><label>Categoría</label><select value={form.categoria} onChange={sf("categoria")}>{CATEGORIAS_ALM.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="fld" style={{gridColumn:"1/-1"}}><label>Nombre del material *</label><input value={form.nombre} onChange={sf("nombre")} placeholder="Lateral Marco GK-48"/></div>
        <div className="fld"><label>Unidad</label><select value={form.unidad} onChange={sf("unidad")}>{UNIDADES_ALM.map(u=><option key={u}>{u}</option>)}</select></div>
        <div className="fld"><label>Material / Acabado</label><input value={form.material} onChange={sf("material")} placeholder="Natural"/></div>
        <div className="fld"><label>Stock inicial</label><input type="number" min="0" step="0.5" value={form.stock} onChange={sf("stock")}/></div>
        <div className="fld"><label>Stock mínimo</label><input type="number" min="0" step="0.5" value={form.minimo} onChange={sf("minimo")}/></div>
        <div className="fld" style={{gridColumn:"1/-1"}}><label>Costo unitario (RD$)</label><input type="number" min="0" value={form.costo} onChange={sf("costo")}/></div>
      </div></div>
      <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-filled" onClick={save}>Guardar</button></div>
    </div></div>}

    {/* Modal ajuste */}
    {ajModal&&<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setAjModal(null)}}><div className="modal" style={{maxWidth:420}}>
      <div className="modal-hdr"><div className="modal-ttl">Ajustar Stock</div><button className="icon-btn" onClick={()=>setAjModal(null)}>✕</button></div>
      <div className="modal-bdy">
        <div style={{background:"var(--pri-lt)",borderRadius:"var(--r-sm)",padding:"12px 16px",marginBottom:16}}>
          <div style={{fontWeight:600,fontSize:14}}>{ajModal.nombre}</div>
          <div style={{fontSize:13,color:"var(--on-sur3)",marginTop:3}}>Stock actual: <b style={{color:"var(--pri)"}}>{ajModal.stock} {ajModal.unidad}</b></div>
        </div>
        <div className="fgrid" style={{gap:12}}>
          <div className="fld"><label>Cantidad a ajustar</label><input type="number" min="0" step="0.5" value={ajQty} onChange={e=>setAjQty(e.target.value)} placeholder="0"/></div>
          <div className="fld"><label>Nota / Razón</label><input value={ajNota} onChange={e=>setAjNota(e.target.value)} placeholder="Ej: Recibo de mercancía #001"/></div>
        </div>
      </div>
      <div className="modal-ftr">
        <button className="btn btn-text" onClick={()=>setAjModal(null)}>Cancelar</button>
        <button className="btn btn-err" style={{background:"var(--err-lt)",color:"var(--err)",border:"1px solid #fad2cf"}} onClick={()=>ajustar("salida")}>− Salida</button>
        <button className="btn btn-filled" onClick={()=>ajustar("entrada")}>+ Entrada</button>
      </div>
    </div></div>}
  </div>);
}

// ═══ PRECIOS ══════════════════════════════════════════════════════════════════
// ═══ PRECIOS & GANANCIAS ═════════════════════════════════════════════════════
const INIT_PRECIOS = [
  {id:1,codigo:"GK-40",nombre:"Lateral Marco Corrediza GK-40",categoria:"Perfiles de Marco",unidad:"Barra (20 pie)",pie_barra:20,costo_barra:720,costo_pie:36,venta_barra:950,venta_pie:47.5,material:"Natural"},
  {id:2,codigo:"GK-44",nombre:"Cabezal Marco GK-44",categoria:"Perfiles de Marco",unidad:"Barra (20 pie)",pie_barra:20,costo_barra:680,costo_pie:34,venta_barra:900,venta_pie:45,material:"Natural"},
  {id:3,codigo:"GK-37",nombre:"Cabezal Hoja GK-37",categoria:"Perfiles de Hoja",unidad:"Barra (20 pie)",pie_barra:20,costo_barra:650,costo_pie:32.5,venta_barra:860,venta_pie:43,material:"Natural"},
  {id:4,codigo:"GK-48",nombre:"Lateral Marco Puerta GK-48",categoria:"Perfiles de Marco",unidad:"Barra (20 pie)",pie_barra:20,costo_barra:850,costo_pie:42.5,venta_barra:1100,venta_pie:55,material:"Natural"},
  {id:5,codigo:"ALD-601",nombre:"Riel Marco Ext. P-65 ALD-601",categoria:"Rieles",unidad:"Barra (20 pie)",pie_barra:20,costo_barra:1100,costo_pie:55,venta_barra:1420,venta_pie:71,material:"Natural"},
  {id:6,codigo:"ALD-900",nombre:"Riel Marco P-92 ALD-900",categoria:"Rieles",unidad:"Barra (20 pie)",pie_barra:20,costo_barra:1250,costo_pie:62.5,venta_barra:1600,venta_pie:80,material:"Natural"},
  {id:7,codigo:"VID-NAT",nombre:"Vidrio Natural Transparente",categoria:"Vidrios",unidad:"Pie²",pie_barra:1,costo_barra:45,costo_pie:45,venta_barra:75,venta_pie:75,material:"—"},
  {id:8,codigo:"VID-BCE",nombre:"Vidrio Bronce liso",categoria:"Vidrios",unidad:"Pie²",pie_barra:1,costo_barra:55,costo_pie:55,venta_barra:85,venta_pie:85,material:"—"},
  {id:9,codigo:"RUE-01",nombre:"Ruedas Corrediza",categoria:"Herrajes",unidad:"Unidad",pie_barra:1,costo_barra:85,costo_pie:85,venta_barra:130,venta_pie:130,material:"—"},
  {id:10,codigo:"GOM-01",nombre:"Goma de Sello",categoria:"Accesorios",unidad:"Pie lineal",pie_barra:1,costo_barra:18,costo_pie:18,venta_barra:28,venta_pie:28,material:"—"},
  {id:11,codigo:"PIV-01",nombre:"Pivot para Puerta",categoria:"Herrajes",unidad:"Unidad",pie_barra:1,costo_barra:380,costo_pie:380,venta_barra:580,venta_pie:580,material:"—"},
  {id:12,codigo:"FEL-01",nombre:"Felpa de Sello",categoria:"Accesorios",unidad:"Pie lineal",pie_barra:1,costo_barra:16,costo_pie:16,venta_barra:25,venta_pie:25,material:"—"},
];

// Profit calculator — calculates cost, sale price and margin
// for a given list of materials from a calculator result
function calcProfit(lines, precios, metodo, margen, precioFijo) {
  let totalCosto = 0, totalVenta = 0;
  const desglose = [];
  lines.forEach(l => {
    // For each line, estimate cost from pies
    const allPies = l.pies || {};
    Object.entries(allPies).forEach(([k, pie]) => {
      if (!pie || pie <= 0) return;
      // Try to match a price by partial key
      const match = precios.find(p =>
        k.includes("lat") ? p.codigo.includes("GK-40") || p.codigo.includes("ALD-901") :
        k.includes("cab") ? p.codigo.includes("GK-44") || p.codigo.includes("ALD-902") :
        k.includes("chb") || k.includes("alf") ? p.codigo.includes("GK-37") || p.codigo.includes("ALD-904") :
        k.includes("jll") || k.includes("jng") || k.includes("jam") ? p.codigo.includes("GK-41") || p.codigo.includes("ALD-607") :
        false
      );
      if (match) {
        const c = r2(pie * match.costo_pie);
        const v = r2(pie * match.venta_pie);
        totalCosto += c; totalVenta += v;
        desglose.push({label: match.nombre, pie, costo: c, venta: v});
      }
    });
    // Add glass cost
    if (l.glass?.sqft > 0) {
      const gm = precios.find(p => p.codigo.includes("VID"));
      if (gm) {
        const c = r2(l.glass.sqft * gm.costo_pie);
        const v = r2(l.glass.sqft * gm.venta_pie);
        totalCosto += c; totalVenta += v;
        desglose.push({label: gm.nombre, pie: l.glass.sqft, costo: c, venta: v});
      }
    }
  });

  let precioFinal = 0;
  if (metodo === "margen") precioFinal = r2(totalCosto * (1 + margen / 100));
  else if (metodo === "pietaje") {
    const totalPie = lines.reduce((s, l) => s + (l.pie || 0), 0);
    precioFinal = r2(totalPie * precioFijo);
  } else precioFinal = totalVenta;

  const ganancia = r2(precioFinal - totalCosto);
  const margenReal = totalCosto > 0 ? r2((ganancia / totalCosto) * 100) : 0;
  return { totalCosto: r2(totalCosto), totalVenta: r2(totalVenta), precioFinal, ganancia, margenReal, desglose };
}

function Precios() {
  const [lista, setLista] = useState(INIT_PRECIOS);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todas");
  const [tab, setTab] = useState("lista");
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  // Profit simulator state
  const [simPietaje, setSimPietaje] = useState(100);
  const [simMargen, setSimMargen] = useState(35);
  const [simPrecioFijo, setSimPrecioFijo] = useState(450);
  const [simMetodo, setSimMetodo] = useState("margen");

  const emptyForm = {codigo:"",nombre:"",categoria:"Perfiles de Marco",unidad:"Barra (20 pie)",pie_barra:20,costo_barra:0,costo_pie:0,venta_barra:0,venta_pie:0,material:"Natural"};
  const [form, setForm] = useState(emptyForm);
  const sf = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const filtered = lista.filter(m => {
    const mq = m.nombre.toLowerCase().includes(q.toLowerCase()) || m.codigo.toLowerCase().includes(q.toLowerCase());
    return cat === "todas" ? mq : mq && m.categoria === cat;
  });

  function openNew() { setEdit(null); setForm(emptyForm); setModal(true); }
  function openEdit(m) { setEdit(m); setForm({...m}); setModal(true); }
  function save() {
    if (!form.nombre.trim()) return;
    const n = {...form,
      pie_barra: parseFloat(form.pie_barra)||20,
      costo_barra: parseFloat(form.costo_barra)||0,
      costo_pie: parseFloat(form.costo_pie)||0,
      venta_barra: parseFloat(form.venta_barra)||0,
      venta_pie: parseFloat(form.venta_pie)||0,
    };
    // Auto-calc pie from barra if empty
    if (!n.costo_pie && n.costo_barra) n.costo_pie = r2(n.costo_barra / n.pie_barra);
    if (!n.venta_pie && n.venta_barra) n.venta_pie = r2(n.venta_barra / n.pie_barra);
    if (edit) setLista(l => l.map(x => x.id === edit.id ? {...x, ...n} : x));
    else setLista(l => [...l, {...n, id: Date.now()}]);
    setModal(false);
  }

  // Simulator: simple demo with average costs
  const avgCostoPie = r2(lista.filter(m=>m.categoria.includes("Perf")).reduce((s,m)=>s+m.costo_pie,0) / lista.filter(m=>m.categoria.includes("Perf")).length);
  const costoSim = r2(simPietaje * avgCostoPie * 0.8); // rough estimate
  const ventaSim = simMetodo==="margen" ? r2(costoSim*(1+simMargen/100)) : simMetodo==="pietaje" ? r2(simPietaje*simPrecioFijo) : r2(costoSim*1.4);
  const gananciaSim = r2(ventaSim - costoSim);
  const margenSim = costoSim>0 ? r2((gananciaSim/costoSim)*100) : 0;

  const margenColor = m => m >= 40 ? "var(--sec)" : m >= 25 ? "var(--warn)" : "var(--err)";

  return (<div>
    {/* Tabs */}
    <div className="seg-tabs" style={{marginBottom:20}}>
      {[["lista","Lista de Precios"],["simulador","Simulador de Ganancias"]].map(([v,l])=>(
        <button key={v} className={"seg-tab"+(tab===v?" on":"")} onClick={()=>setTab(v)}>{l}</button>
      ))}
    </div>

    {tab==="lista"&&(<div>
      {/* Summary cards */}
      <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)",marginBottom:20}}>
        {[
          {l:"Materiales",n:lista.length,i:"📦",bg:"var(--sur3)"},
          {l:"Margen Promedio",n:r2(lista.reduce((s,m)=>s+(m.venta_pie-m.costo_pie)/m.costo_pie*100,0)/lista.length)+"%",i:"📈",bg:"var(--sec-lt)"},
          {l:"Costo Promedio/Pie",n:"RD$"+r2(lista.reduce((s,m)=>s+m.costo_pie,0)/lista.length),i:"💸",bg:"#fce8e6"},
          {l:"Venta Promedio/Pie",n:"RD$"+r2(lista.reduce((s,m)=>s+m.venta_pie,0)/lista.length),i:"💰",bg:"var(--pri-lt)"},
        ].map(s=>(<div key={s.l} className="stat-card"><div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div><div className="stat-num" style={{fontSize:20}}>{s.n}</div><div className="stat-lbl">{s.l}</div></div>))}
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
        <div className="sbar"><span style={{color:"var(--on-sur4)"}}>🔍</span><input placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)}/></div>
        <select style={{padding:"8px 14px",borderRadius:"var(--rfull)",border:"1px solid var(--out)",background:"var(--sur)",fontFamily:"inherit",fontSize:13,color:"var(--on-sur)",cursor:"pointer",outline:"none"}} value={cat} onChange={e=>setCat(e.target.value)}>
          <option value="todas">Todas</option>
          {CATEGORIAS_ALM.map(c=><option key={c}>{c}</option>)}
        </select>
        <button className="btn btn-filled" onClick={openNew}>＋ Nuevo Material</button>
      </div>
      <div className="card">
        <div className="twrap"><table>
          <thead>
            <tr>
              <th>Código</th><th>Material</th><th>Unidad</th>
              <th style={{background:"#fce8e6",color:"var(--err)"}}>Costo/Barra</th>
              <th style={{background:"#fce8e6",color:"var(--err)"}}>Costo/Pie</th>
              <th style={{background:"#e6f4ea",color:"var(--sec)"}}>Venta/Barra</th>
              <th style={{background:"#e6f4ea",color:"var(--sec)"}}>Venta/Pie</th>
              <th style={{background:"var(--pri-lt)",color:"var(--pri)"}}>Margen</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin resultados</td></tr>}
            {filtered.map(m => {
              const margen = m.costo_pie > 0 ? r2(((m.venta_pie - m.costo_pie) / m.costo_pie) * 100) : 0;
              return (
                <tr key={m.id}>
                  <td><span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{m.codigo}</span></td>
                  <td><div style={{fontWeight:500}}>{m.nombre}</div><div style={{fontSize:11,color:"var(--on-sur3)"}}>{m.categoria} · {m.material}</div></td>
                  <td style={{fontSize:12,color:"var(--on-sur3)"}}>{m.unidad}</td>
                  <td><span className="mono" style={{color:"var(--err)",fontWeight:500}}>RD${m.costo_barra.toLocaleString()}</span></td>
                  <td><span className="mono" style={{color:"var(--err)"}}>RD${m.costo_pie}</span></td>
                  <td><span className="mono" style={{color:"var(--sec)",fontWeight:500}}>RD${m.venta_barra.toLocaleString()}</span></td>
                  <td><span className="mono" style={{color:"var(--sec)"}}>RD${m.venta_pie}</span></td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{flex:1,height:6,background:"var(--sur3)",borderRadius:3,overflow:"hidden",minWidth:40}}>
                        <div style={{height:"100%",width:Math.min(margen,100)+"%",background:margenColor(margen),borderRadius:3,transition:"width .3s"}}/>
                      </div>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:margenColor(margen),minWidth:36}}>{margen}%</span>
                    </div>
                  </td>
                  <td><button className="icon-btn" onClick={()=>openEdit(m)}>✏️</button></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </div>
    </div>)}

    {tab==="simulador"&&(<div>
      <div style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:20,alignItems:"start"}}>
        {/* Controls */}
        <div className="card">
          <div className="card-hdr"><div className="card-ttl">Parámetros del Simulador</div></div>
          <div className="card-bdy"><div className="fgrid" style={{gap:16}}>
            <div className="fld">
              <label>Pietaje a cotizar (pie²)</label>
              <input type="number" min="1" value={simPietaje} onChange={e=>setSimPietaje(parseFloat(e.target.value)||0)}/>
            </div>
            <div className="fld">
              <label>Método de precio de venta</label>
              <select value={simMetodo} onChange={e=>setSimMetodo(e.target.value)}>
                <option value="margen">% Margen sobre costo</option>
                <option value="pietaje">Precio fijo por pie²</option>
                <option value="desglose">Por perfil + vidrio + herrajes</option>
              </select>
            </div>
            {simMetodo==="margen"&&<div className="fld">
              <label>Margen deseado (%)</label>
              <input type="number" min="1" max="200" value={simMargen} onChange={e=>setSimMargen(parseFloat(e.target.value)||0)}/>
            </div>}
            {simMetodo==="pietaje"&&<div className="fld">
              <label>Precio por pie² (RD$)</label>
              <input type="number" min="1" value={simPrecioFijo} onChange={e=>setSimPrecioFijo(parseFloat(e.target.value)||0)}/>
            </div>}
          </div></div>
        </div>

        {/* Results */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Hero */}
          <div style={{background:`linear-gradient(135deg,${margenSim>=30?"#188038":"#f9ab00"} 0%,${margenSim>=30?"#0d6b2d":"#e37400"} 100%)`,borderRadius:16,padding:"22px 26px",color:"#fff",boxShadow:"var(--sh3)"}}>
            <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:3,opacity:.7,marginBottom:4}}>Ganancia Estimada</div>
            <div style={{fontSize:48,fontWeight:300,lineHeight:1}}>RD${gananciaSim.toLocaleString()}</div>
            <div style={{fontSize:12,opacity:.7,marginTop:6}}>Margen real: <b>{margenSim}%</b> sobre el costo</div>
          </div>

          {/* Breakdown */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            {[
              {l:"Costo Total",v:`RD$${costoSim.toLocaleString()}`,c:"var(--err)",i:"💸"},
              {l:"Precio de Venta",v:`RD$${ventaSim.toLocaleString()}`,c:"var(--sec)",i:"💰"},
              {l:"Ganancia",v:`RD$${gananciaSim.toLocaleString()}`,c:margenSim>=30?"var(--sec)":"var(--warn)",i:"📈"},
            ].map(k=>(
              <div key={k.l} className="card" style={{padding:"16px 18px",textAlign:"center"}}>
                <div style={{fontSize:22,marginBottom:8}}>{k.i}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:600,color:k.c}}>{k.v}</div>
                <div style={{fontSize:11,color:"var(--on-sur3)",marginTop:4,textTransform:"uppercase",letterSpacing:1}}>{k.l}</div>
              </div>
            ))}
          </div>

          {/* Scenarios table */}
          <div className="card">
            <div className="card-hdr"><div className="card-ttl">Comparación de Escenarios</div></div>
            <table>
              <thead><tr><th>Escenario</th><th>Precio Venta</th><th>Ganancia</th><th>Margen</th></tr></thead>
              <tbody>
                {[
                  {name:"Margen 20%",venta:r2(costoSim*1.20)},
                  {name:"Margen 30%",venta:r2(costoSim*1.30)},
                  {name:"Margen 35% ★",venta:r2(costoSim*1.35)},
                  {name:"Margen 40%",venta:r2(costoSim*1.40)},
                  {name:"Margen 50%",venta:r2(costoSim*1.50)},
                  {name:`Precio fijo RD$${simPrecioFijo}/pie²`,venta:r2(simPietaje*simPrecioFijo)},
                ].map((s,i)=>{
                  const gan=r2(s.venta-costoSim);
                  const mrg=costoSim>0?r2((gan/costoSim)*100):0;
                  return(<tr key={i} style={s.name.includes("★")?{background:"var(--pri-lt)"}:{}}>
                    <td style={{fontWeight:s.name.includes("★")?700:400}}>{s.name}</td>
                    <td><span className="mono" style={{color:"var(--sec)",fontWeight:600}}>RD${s.venta.toLocaleString()}</span></td>
                    <td><span className="mono" style={{color:margenColor(mrg),fontWeight:600}}>RD${gan.toLocaleString()}</span></td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:50,height:5,background:"var(--sur3)",borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:Math.min(mrg,100)+"%",background:margenColor(mrg),borderRadius:3}}/>
                        </div>
                        <span className="mono" style={{fontSize:12,fontWeight:700,color:margenColor(mrg)}}>{mrg}%</span>
                      </div>
                    </td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>)}

    {/* Modal */}
    {modal&&<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}><div className="modal" style={{maxWidth:600}}>
      <div className="modal-hdr"><div className="modal-ttl">{edit?"Editar Material":"Nuevo Material"}</div><button className="icon-btn" onClick={()=>setModal(false)}>✕</button></div>
      <div className="modal-bdy"><div className="fgrid f2" style={{gap:14}}>
        <div className="fld"><label>Código</label><input value={form.codigo} onChange={sf("codigo")} placeholder="GK-40"/></div>
        <div className="fld"><label>Categoría</label><select value={form.categoria} onChange={sf("categoria")}>{CATEGORIAS_ALM.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="fld" style={{gridColumn:"1/-1"}}><label>Nombre *</label><input value={form.nombre} onChange={sf("nombre")}/></div>
        <div className="fld"><label>Unidad</label><select value={form.unidad} onChange={sf("unidad")}>{UNIDADES_ALM.map(u=><option key={u}>{u}</option>)}</select></div>
        <div className="fld"><label>Pies por barra</label><input type="number" value={form.pie_barra} onChange={sf("pie_barra")}/></div>
        <div className="fld"><label>Material / Acabado</label><input value={form.material} onChange={sf("material")}/></div>
        {/* Supplier prices */}
        <div style={{gridColumn:"1/-1",padding:"10px 14px",background:"#fce8e6",borderRadius:"var(--r-sm)",fontSize:12,fontWeight:600,color:"var(--err)"}}>💸 PRECIO PROVEEDOR (Costo)</div>
        <div className="fld"><label>Costo por Barra (RD$)</label><input type="number" min="0" value={form.costo_barra} onChange={e=>{const v=parseFloat(e.target.value)||0;setForm(f=>({...f,costo_barra:v,costo_pie:r2(v/(parseFloat(f.pie_barra)||20))}));}}/></div>
        <div className="fld"><label>Costo por Pie (RD$)</label><input type="number" min="0" value={form.costo_pie} onChange={e=>{const v=parseFloat(e.target.value)||0;setForm(f=>({...f,costo_pie:v,costo_barra:r2(v*(parseFloat(f.pie_barra)||20))}))}}/></div>
        {/* Sales prices */}
        <div style={{gridColumn:"1/-1",padding:"10px 14px",background:"#e6f4ea",borderRadius:"var(--r-sm)",fontSize:12,fontWeight:600,color:"var(--sec)"}}>💰 PRECIO DE VENTA</div>
        <div className="fld"><label>Venta por Barra (RD$)</label><input type="number" min="0" value={form.venta_barra} onChange={e=>{const v=parseFloat(e.target.value)||0;setForm(f=>({...f,venta_barra:v,venta_pie:r2(v/(parseFloat(f.pie_barra)||20))}));}}/></div>
        <div className="fld"><label>Venta por Pie (RD$)</label><input type="number" min="0" value={form.venta_pie} onChange={e=>{const v=parseFloat(e.target.value)||0;setForm(f=>({...f,venta_pie:v,venta_barra:r2(v*(parseFloat(f.pie_barra)||20))}))}}/></div>
        {/* Live margin preview */}
        {form.costo_pie>0&&form.venta_pie>0&&<div style={{gridColumn:"1/-1",padding:"12px 16px",background:"var(--pri-lt)",borderRadius:"var(--r-sm)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,color:"var(--pri-dk)"}}>Margen calculado</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:700,color:margenColor(r2(((form.venta_pie-form.costo_pie)/form.costo_pie)*100))}}>
            {r2(((form.venta_pie-form.costo_pie)/form.costo_pie)*100)}%
          </span>
        </div>}
      </div></div>
      <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-filled" onClick={save}>Guardar</button></div>
    </div></div>}
  </div>);
}

// ═══ PRESUPUESTOS & FACTURAS ══════════════════════════════════════════════════
const ITBIS = 0.18;
const INIT_PRES = [
  {id:1,numero:"PRE-001",cliente:"Constructora Pérez & Asociados",rnc:"101-12345-6",fecha:"2025-06-01",entrega:"2025-06-15",estado:"Aprobado",pietaje:248,subtotal:42800,lineas:[{desc:"Corrediza 48×60\" 2H ×4",pie:128,precio:21400},{desc:"Persiana A 36×48\" 1C ×6",pie:120,precio:21400}]},
  {id:2,numero:"PRE-002",cliente:"Ferretería El Martillo",rnc:"102-56789-1",fecha:"2025-06-05",entrega:"2025-06-20",estado:"Pendiente",pietaje:96,subtotal:18500,lineas:[{desc:"P-65 60×72\" 2H ×2",pie:96,precio:18500}]},
  {id:3,numero:"PRE-003",cliente:"María González",rnc:"",fecha:"2025-06-08",entrega:"2025-06-25",estado:"Borrador",pietaje:64,subtotal:12000,lineas:[{desc:"Puerta Comercial 36×84\" 1H ×1",pie:21,precio:5500},{desc:"Corrediza 60×48\" 4H ×1",pie:43,precio:6500}]},
  {id:4,numero:"PRE-004",cliente:"Inmobiliaria Vista Verde",rnc:"130-98765-4",fecha:"2025-05-28",entrega:"2025-06-10",estado:"Rechazado",pietaje:320,subtotal:58000,lineas:[{desc:"P-92 72×84\" 4H ×4",pie:320,precio:58000}]},
];

// Invoice PDF generator
function generateInvoice(pres, tipo, empresa) {
  const subtotal = pres.subtotal;
  const itbis = tipo === "fiscal" ? r2(subtotal * ITBIS) : 0;
  const total = r2(subtotal + itbis);
  const now = new Date().toLocaleDateString("es-DO", {day:"2-digit",month:"long",year:"numeric"});
  const isFiscal = tipo === "fiscal";

  var empNombre = (empresa&&empresa.nombre)||"Ventaneros";
  var empSlogan = (empresa&&empresa.slogan)||"Fabricacion de Ventanas y Puertas";
  var empRnc = empresa&&empresa.rnc;
  var empTel = empresa&&empresa.tel;
  var empDireccion = (empresa&&empresa.direccion)||"Santo Domingo, Republica Dominicana";

  var styleBlock=""+
    "*{box-sizing:border-box;margin:0;padding:0}"+
    "body{font-family:Arial,sans-serif;font-size:11px;color:#202124;padding:28px;background:#fff}"+
    ".hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px}"+
    ".logo{font-size:26px;font-weight:800;color:#1a73e8}.logo-sub{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#5f6368;margin-top:2px}"+
    ".doc-type{text-align:right}"+
    ".doc-badge{display:inline-block;padding:4px 14px;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:6px;"+(isFiscal?"background:#188038;color:#fff":"background:#1a73e8;color:#fff")+"}"+
    ".doc-num{font-size:20px;font-weight:700;color:#202124;margin-bottom:3px}"+
    ".doc-date{font-size:11px;color:#5f6368}"+
    (isFiscal?".fiscal-banner{background:#188038;color:#fff;padding:8px 16px;border-radius:5px;margin-bottom:16px;font-size:11px;font-weight:700;letter-spacing:1px;text-align:center}":"")+
    ".parties{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:18px;padding:14px 16px;background:#f8f9fa;border-radius:6px;border:1px solid #e8eaed}"+
    ".party-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#5f6368;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #e8eaed}"+
    ".party-name{font-size:13px;font-weight:700;color:#202124;margin-bottom:3px}"+
    ".party-info{font-size:11px;color:#5f6368}"+
    "table{width:100%;border-collapse:collapse;margin-bottom:16px}"+
    "th{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#5f6368;padding:7px 10px;text-align:left;background:#f8f9fa;border-bottom:2px solid #e8eaed}"+
    "td{padding:9px 10px;border-bottom:1px solid #f1f3f4;font-size:11px;vertical-align:middle}"+
    ".td-right{text-align:right}"+
    ".td-num{font-family:Courier New,monospace;font-weight:600}"+
    ".totals{margin-left:auto;width:280px}"+
    ".tot-row{display:flex;justify-content:space-between;padding:6px 12px;font-size:12px}"+
    ".tot-row.sub{border-top:1px solid #e8eaed;margin-top:4px}"+
    ".tot-row.itbis{color:#188038;font-weight:600}"+
    ".tot-row.total{background:#202124;color:#fff;border-radius:5px;font-size:14px;font-weight:700;margin-top:6px;padding:10px 14px}"+
    (isFiscal?".tot-row.itbis{background:#e6f4ea;border-radius:4px;padding:8px 12px;margin:4px 0}":"")+
    ".ncf-box{border:2px dashed #188038;border-radius:6px;padding:10px 14px;margin-top:16px;display:flex;justify-content:space-between;align-items:center}"+
    ".ncf-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#188038}"+
    ".ncf-num{font-size:16px;font-weight:700;font-family:Courier New,monospace;color:#188038;letter-spacing:3px}"+
    ".notes{background:#fef7e0;border:1px solid #f9ab00;border-radius:5px;padding:10px 14px;margin-top:12px;font-size:11px;color:#594300}"+
    ".footer{margin-top:20px;padding-top:12px;border-top:1px solid #e8eaed;display:flex;justify-content:space-between;color:#80868b;font-size:10px}"+
    ".sig-area{display:flex;gap:40px;margin-top:40px}"+
    ".sig-line{border-top:1px solid #202124;min-width:160px;padding-top:4px;font-size:10px;color:#5f6368;text-align:center}";

  var rncLogoHtml = empRnc ? ('<div class="logo-sub" style="margin-top:2px">RNC: '+empRnc+'</div>') : "";
  var telLogoHtml = empTel ? ('<div class="logo-sub">Tel: '+empTel+'</div>') : "";
  var docBadgeText = isFiscal ? "FACTURA CON VALOR FISCAL" : "COTIZACION / PRESUPUESTO";
  var fiscalBannerHtml = isFiscal ? '<div class="fiscal-banner">DOCUMENTO CON VALOR FISCAL - APLICA ITBIS 18% - DGII Republica Dominicana</div>' : "";
  var empRncPartyHtml = empRnc ? ('<div class="party-info">RNC: '+empRnc+'</div>') : "";
  var receptorLabel = isFiscal ? "Receptor (Cliente)" : "Cliente";
  var presRncHtml = pres.rnc ? ('<div class="party-info" style="font-weight:700;color:#188038">RNC/Cedula: '+pres.rnc+'</div>') : "";

  var lineRows="";
  for(var i=0;i<pres.lineas.length;i++){
    var l=pres.lineas[i];
    var unit = r2(l.precio/l.pie).toLocaleString();
    lineRows+='<tr><td style="color:#1a73e8;font-weight:700">'+(i+1)+'</td><td style="font-weight:500">'+l.desc+'</td><td class="td-right td-num">'+l.pie+'</td><td class="td-right td-num">RD$'+unit+'/ft2</td><td class="td-right td-num" style="font-weight:700">RD$'+l.precio.toLocaleString()+'</td></tr>';
  }

  var itbisRowHtml = isFiscal
    ? ('<div class="tot-row itbis"><span>ITBIS (18%)</span><span class="td-num">RD$'+itbis.toLocaleString()+'</span></div>')
    : ('<div class="tot-row" style="color:#5f6368;font-size:10px"><span>Sin ITBIS (precio normal)</span><span>-</span></div>');

  var ncfBoxHtml = isFiscal
    ? '<div class="ncf-box"><div><div class="ncf-label">Numero de Comprobante Fiscal (NCF)</div><div class="ncf-num">B01-00000001</div></div><div style="text-align:right"><div class="ncf-label">Tipo de NCF</div><div style="font-size:12px;font-weight:700;color:#188038">01 - Credito Fiscal</div></div></div>'
    : "";

  var footerNote = isFiscal ? "Documento con valor fiscal ante la DGII" : "Cotizacion sin valor fiscal";

  var bodyHtml=""+
    '<div class="hdr"><div><div class="logo">'+empNombre+'</div><div class="logo-sub">'+empSlogan+'</div>'+rncLogoHtml+telLogoHtml+'</div>'+
      '<div class="doc-type"><div class="doc-badge">'+docBadgeText+'</div><div class="doc-num">'+pres.numero+'</div><div class="doc-date">Fecha: '+now+' - Entrega: '+pres.entrega+'</div></div>'+
    '</div>'+
    fiscalBannerHtml+
    '<div class="parties">'+
      '<div><div class="party-label">Emisor</div><div class="party-name">'+empNombre+'</div><div class="party-info">'+empDireccion+'</div>'+empRncPartyHtml+'</div>'+
      '<div><div class="party-label">'+receptorLabel+'</div><div class="party-name">'+pres.cliente+'</div>'+presRncHtml+'<div class="party-info">Fecha entrega: '+pres.entrega+'</div></div>'+
    '</div>'+
    '<table><thead><tr><th>#</th><th>Descripcion</th><th class="td-right">Pie2</th><th class="td-right">Precio Unit.</th><th class="td-right">Total</th></tr></thead><tbody>'+
    lineRows+
    '</tbody></table>'+
    '<div class="totals">'+
      '<div class="tot-row sub"><span>Subtotal</span><span class="td-num">RD$'+subtotal.toLocaleString()+'</span></div>'+
      itbisRowHtml+
      '<div class="tot-row total"><span>TOTAL A PAGAR</span><span>RD$'+total.toLocaleString()+'</span></div>'+
    '</div>'+
    ncfBoxHtml+
    '<div class="sig-area">'+
      '<div class="sig-line">Firma Autorizada - '+empNombre+'</div>'+
      '<div class="sig-line">Sello de la Empresa</div>'+
      '<div class="sig-line">Recibi Conforme - '+pres.cliente+'</div>'+
    '</div>'+
    '<div class="footer"><div>'+empNombre+' - '+now+' - '+pres.numero+'</div><div>'+footerNote+'</div></div>';

  var filename = (isFiscal?"Factura":"Cotizacion")+"-"+pres.numero+"-"+pres.cliente.replace(/\s+/g,"-")+".pdf";
  downloadAsPDF(styleBlock, bodyHtml, filename);
}

function Presupuestos({onNav}){
  const [lista, setLista] = useState(INIT_PRES);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("todos");
  const [detail, setDetail] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(null);
  const [empresa, setEmpresa] = useState({nombre:"Ventaneros SRL",slogan:"Fabricación de Ventanas y Puertas de Aluminio",rnc:"1-31-12345-6",tel:"809-000-0000",direccion:"Santo Domingo, República Dominicana"});
  const [showEmpresa, setShowEmpresa] = useState(false);

  const tabs=[["todos","Todos"],["Aprobado","Aprobados"],["Pendiente","Pendientes"],["Borrador","Borradores"],["Rechazado","Rechazados"]];
  const filtered=lista.filter(p=>{
    const m=p.cliente.toLowerCase().includes(q.toLowerCase())||p.numero.toLowerCase().includes(q.toLowerCase());
    return tab==="todos"?m:m&&p.estado===tab;
  });
  const statusCls={Aprobado:"chip-filled-sec",Pendiente:"chip-filled-warn",Borrador:"chip",Rechazado:"chip-filled-err"};
  const mrr=lista.filter(p=>p.estado==="Aprobado").reduce((s,p)=>s+p.subtotal,0);
  const sf=k=>e=>setEmpresa(f=>({...f,[k]:e.target.value}));

  return(<div>
    <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
      {[
        {l:"Total Presupuestos",n:lista.length,s:"emitidos",i:"📋",bg:"var(--sur3)"},
        {l:"Aprobados",n:lista.filter(p=>p.estado==="Aprobado").length,s:"confirmados",i:"✅",bg:"var(--sec-lt)"},
        {l:"Pendientes",n:lista.filter(p=>p.estado==="Pendiente").length,s:"por confirmar",i:"⏳",bg:"#fef7e0"},
        {l:"Monto Aprobado",n:`RD$${mrr.toLocaleString()}`,s:"sin ITBIS",i:"💰",bg:"var(--pri-lt)"},
      ].map(s=>(<div key={s.l} className="stat-card"><div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div><div className="stat-num" style={{fontSize:s.l==="Monto Aprobado"?16:28}}>{s.n}</div><div className="stat-lbl">{s.l}</div><div style={{fontSize:11,color:"var(--on-sur3)",marginTop:4}}>{s.s}</div></div>))}
    </div>

    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
      <div className="sbar"><span style={{color:"var(--on-sur4)"}}>🔍</span><input placeholder="Buscar presupuestos..." value={q} onChange={e=>setQ(e.target.value)}/></div>
      <button className="btn btn-filled" onClick={()=>onNav("calc")}>＋ Nuevo Presupuesto</button>
      <button className="btn btn-outlined" onClick={()=>setShowEmpresa(true)}>🏢 Datos de mi Empresa</button>
    </div>

    <div className="seg-tabs">{tabs.map(([v,l])=>(<button key={v} className={"seg-tab"+(tab===v?" on":"")} onClick={()=>setTab(v)}>{l}</button>))}</div>

    <div className="card">
      <div className="twrap"><table>
        <thead><tr><th>Número</th><th>Cliente</th><th>RNC/Cédula</th><th>Fecha</th><th>Pietaje</th><th>Subtotal</th><th>+ITBIS</th><th>Estado</th><th>Facturar</th></tr></thead>
        <tbody>
          {filtered.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin presupuestos</td></tr>}
          {filtered.map(p=>(
            <tr key={p.id} style={{cursor:"pointer"}} onClick={()=>setDetail(p)}>
              <td><span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{p.numero}</span></td>
              <td style={{fontWeight:500}}>{p.cliente}</td>
              <td><span className="mono" style={{fontSize:11,color:p.rnc?"var(--sec)":"var(--on-sur4)"}}>{p.rnc||"Sin RNC"}</span></td>
              <td className="mono">{p.fecha}</td>
              <td><span className="mono">{p.pietaje} ft²</span></td>
              <td><span className="mono" style={{fontWeight:600}}>RD${p.subtotal.toLocaleString()}</span></td>
              <td><span className="mono" style={{color:"var(--sec)",fontSize:12}}>RD${r2(p.subtotal*ITBIS).toLocaleString()}</span></td>
              <td><span className={`chip ${statusCls[p.estado]||"chip"}`}>{p.estado}</span></td>
              <td onClick={e=>e.stopPropagation()}>
                <div style={{display:"flex",gap:4}}>
                  <button className="btn btn-sm" style={{background:"var(--pri-lt)",color:"var(--pri)",border:"1px solid var(--pri-lt2)",fontSize:11,padding:"4px 10px",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600}} onClick={()=>setInvoiceModal({pres:p,tipo:"normal"})}>
                    📄 Normal
                  </button>
                  <button className="btn btn-sm" style={{background:"var(--sec-lt)",color:"var(--sec)",border:"1px solid #a8d5b5",fontSize:11,padding:"4px 10px",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600}} onClick={()=>setInvoiceModal({pres:p,tipo:"fiscal"})}>
                    🏛️ Fiscal
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>

    {/* INVOICE MODAL — choose type and download */}
    {invoiceModal&&<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setInvoiceModal(null)}}><div className="modal" style={{maxWidth:480}}>
      <div className="modal-hdr">
        <div className="modal-ttl">Generar Factura</div>
        <button className="icon-btn" onClick={()=>setInvoiceModal(null)}>✕</button>
      </div>
      <div className="modal-bdy">
        {/* Cliente info */}
        <div style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"12px 16px",marginBottom:16}}>
          <div style={{fontWeight:600,fontSize:14}}>{invoiceModal.pres.cliente}</div>
          <div style={{fontSize:12,color:"var(--on-sur3)",marginTop:3}}>
            {invoiceModal.pres.rnc?`RNC: ${invoiceModal.pres.rnc}`:"Sin RNC registrado"} · {invoiceModal.pres.numero}
          </div>
        </div>

        {/* Two options */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          {/* Normal */}
          <div style={{border:"2px solid var(--pri)",borderRadius:12,padding:"16px 14px",cursor:"pointer",background:invoiceModal.tipo==="normal"?"var(--pri-lt)":"var(--sur)"}}
            onClick={()=>setInvoiceModal(m=>({...m,tipo:"normal"}))}>
            <div style={{fontSize:22,marginBottom:8}}>📄</div>
            <div style={{fontWeight:700,fontSize:14,color:"var(--pri)",marginBottom:4}}>Precio Normal</div>
            <div style={{fontSize:12,color:"var(--on-sur3)",lineHeight:1.5}}>Sin ITBIS · Sin valor fiscal · Para clientes sin RNC</div>
            <div style={{marginTop:10,fontFamily:"'JetBrains Mono',monospace",fontSize:16,fontWeight:700,color:"var(--pri)"}}>
              RD${invoiceModal.pres.subtotal.toLocaleString()}
            </div>
            <div style={{fontSize:10,color:"var(--on-sur3)"}}>Total a pagar</div>
          </div>
          {/* Fiscal */}
          <div style={{border:"2px solid var(--sec)",borderRadius:12,padding:"16px 14px",cursor:"pointer",background:invoiceModal.tipo==="fiscal"?"var(--sec-lt)":"var(--sur)"}}
            onClick={()=>setInvoiceModal(m=>({...m,tipo:"fiscal"}))}>
            <div style={{fontSize:22,marginBottom:8}}>🏛️</div>
            <div style={{fontWeight:700,fontSize:14,color:"var(--sec)",marginBottom:4}}>Valor Fiscal</div>
            <div style={{fontSize:12,color:"var(--on-sur3)",lineHeight:1.5}}>Con ITBIS 18% · NCF · Para empresas con RNC</div>
            <div style={{marginTop:10}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:16,fontWeight:700,color:"var(--sec)"}}>
                RD${r2(invoiceModal.pres.subtotal*(1+ITBIS)).toLocaleString()}
              </div>
              <div style={{fontSize:10,color:"var(--sec)"}}>+ITBIS RD${r2(invoiceModal.pres.subtotal*ITBIS).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* ITBIS breakdown */}
        <div style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"12px 16px",fontSize:13}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid var(--out)"}}>
            <span style={{color:"var(--on-sur3)"}}>Subtotal</span>
            <span className="mono" style={{fontWeight:600}}>RD${invoiceModal.pres.subtotal.toLocaleString()}</span>
          </div>
          {invoiceModal.tipo==="fiscal"&&<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid var(--out)",color:"var(--sec)"}}>
            <span>ITBIS 18%</span>
            <span className="mono" style={{fontWeight:600}}>+ RD${r2(invoiceModal.pres.subtotal*ITBIS).toLocaleString()}</span>
          </div>}
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontWeight:700,fontSize:15}}>
            <span>Total</span>
            <span className="mono" style={{color:invoiceModal.tipo==="fiscal"?"var(--sec)":"var(--pri)"}}>
              RD${invoiceModal.tipo==="fiscal"?r2(invoiceModal.pres.subtotal*(1+ITBIS)).toLocaleString():invoiceModal.pres.subtotal.toLocaleString()}
            </span>
          </div>
        </div>

        {invoiceModal.tipo==="fiscal"&&!invoiceModal.pres.rnc&&<div style={{background:"#fef7e0",border:"1px solid #f9ab00",borderRadius:"var(--r-sm)",padding:"10px 14px",fontSize:12,color:"#92400e",marginTop:10}}>
          ⚠ Este cliente no tiene RNC registrado. Puedes agregar uno en el módulo de Clientes.
        </div>}
      </div>
      <div className="modal-ftr">
        <button className="btn btn-text" onClick={()=>setInvoiceModal(null)}>Cancelar</button>
        <button className="btn btn-filled" style={{background:invoiceModal.tipo==="fiscal"?"var(--sec)":"var(--pri)"}}
          onClick={()=>{generateInvoice(invoiceModal.pres, invoiceModal.tipo, empresa);setInvoiceModal(null);}}>
          ⬇ Descargar {invoiceModal.tipo==="fiscal"?"Factura Fiscal":"Cotización"} (PDF)
        </button>
      </div>
    </div></div>}

    {/* DETAIL MODAL */}
    {detail&&<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setDetail(null)}}><div className="modal">
      <div className="modal-hdr">
        <div><div className="modal-ttl">{detail.numero}</div><div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>{detail.cliente}</div></div>
        <span className={`chip ${statusCls[detail.estado]||"chip"}`}>{detail.estado}</span>
        <button className="icon-btn" onClick={()=>setDetail(null)}>✕</button>
      </div>
      <div className="modal-bdy">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {[["Fecha",detail.fecha],["Entrega",detail.entrega],
            ["Pietaje",detail.pietaje+" ft²"],
            ["Subtotal","RD$"+detail.subtotal.toLocaleString()],
            ["ITBIS (18%)","RD$"+r2(detail.subtotal*ITBIS).toLocaleString()],
            ["Total c/ITBIS","RD$"+r2(detail.subtotal*(1+ITBIS)).toLocaleString()],
          ].map(([l,v])=>(
            <div key={l} style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"10px 14px"}}>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1.5,color:"var(--on-sur3)",marginBottom:3}}>{l}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:13}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,color:"var(--on-sur3)",marginBottom:8}}>Líneas</div>
        {detail.lineas.map((l,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 14px",background:"var(--sur2)",borderRadius:"var(--r-sm)",marginBottom:6,fontSize:13}}>
            <span>{l.desc}</span>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <span className="mono" style={{color:"var(--on-sur3)",fontSize:11}}>{l.pie} ft²</span>
              <span className="mono" style={{fontWeight:600,color:"var(--pri)"}}>RD${l.precio.toLocaleString()}</span>
            </div>
          </div>
        ))}
        <div style={{marginTop:12}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,color:"var(--on-sur3)",marginBottom:8}}>Cambiar Estado</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {["Borrador","Pendiente","Aprobado","Rechazado"].map(s=>(
              <button key={s} className={`btn btn-sm ${detail.estado===s?"btn-filled":"btn-outlined"}`}
                onClick={()=>{setLista(l=>l.map(x=>x.id===detail.id?{...x,estado:s}:x));setDetail(d=>({...d,estado:s}));}}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="modal-ftr">
        <button className="btn btn-text" onClick={()=>setDetail(null)}>Cerrar</button>
        <button className="btn btn-outlined" onClick={()=>{setDetail(null);setInvoiceModal({pres:detail,tipo:"normal"});}}>📄 Normal</button>
        <button className="btn btn-filled" style={{background:"var(--sec)"}} onClick={()=>{setDetail(null);setInvoiceModal({pres:detail,tipo:"fiscal"});}}>🏛️ Fiscal</button>
      </div>
    </div></div>}

    {/* EMPRESA MODAL */}
    {showEmpresa&&<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setShowEmpresa(false)}}><div className="modal">
      <div className="modal-hdr"><div className="modal-ttl">Datos de mi Empresa</div><button className="icon-btn" onClick={()=>setShowEmpresa(false)}>✕</button></div>
      <div className="modal-bdy">
        <div style={{background:"var(--pri-lt)",borderRadius:"var(--r-sm)",padding:"10px 14px",marginBottom:14,fontSize:12,color:"var(--pri-dk)"}}>
          Estos datos aparecen en todas las facturas y cotizaciones que generes.
        </div>
        <div className="fgrid f2" style={{gap:14}}>
          <div className="fld" style={{gridColumn:"1/-1"}}><label>Nombre de la Empresa</label><input value={empresa.nombre} onChange={sf("nombre")}/></div>
          <div className="fld" style={{gridColumn:"1/-1"}}><label>Slogan / Descripción</label><input value={empresa.slogan} onChange={sf("slogan")}/></div>
          <div className="fld"><label>RNC</label><input value={empresa.rnc} onChange={sf("rnc")} placeholder="1-31-12345-6"/></div>
          <div className="fld"><label>Teléfono</label><input value={empresa.tel} onChange={sf("tel")} placeholder="809-000-0000"/></div>
          <div className="fld" style={{gridColumn:"1/-1"}}><label>Dirección</label><input value={empresa.direccion} onChange={sf("direccion")}/></div>
        </div>
      </div>
      <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setShowEmpresa(false)}>Cancelar</button><button className="btn btn-filled" onClick={()=>setShowEmpresa(false)}>Guardar</button></div>
    </div></div>}
  </div>);
}

// ═══ HISTORIAL DE ÓRDENES ════════════════════════════════════════════════════
const INIT_ORDENES = [
  {id:1,numero:"ORD-001",cliente:"Constructora Pérez",fecha:"2025-06-01",tipo:"Corrediza Tradicional",lineas:3,pietaje:96,estado:"Completada",responsable:"Carlos M."},
  {id:2,numero:"ORD-002",cliente:"Ferretería El Martillo",fecha:"2025-06-03",tipo:"P-65",lineas:2,pietaje:64,estado:"En producción",responsable:"Ana R."},
  {id:3,numero:"ORD-003",cliente:"María González",fecha:"2025-06-05",tipo:"Puertas",lineas:1,pietaje:21,estado:"Pendiente",responsable:"Carlos M."},
  {id:4,numero:"ORD-004",cliente:"Vista Verde",fecha:"2025-06-07",tipo:"Persiana AA",lineas:4,pietaje:128,estado:"En producción",responsable:"Ana R."},
  {id:5,numero:"ORD-005",cliente:"Constructora Pérez",fecha:"2025-06-09",tipo:"P-92",lineas:2,pietaje:80,estado:"Pendiente",responsable:"—"},
];

function Ordenes(){
  const [lista,setLista]=useState(INIT_ORDENES);
  const [q,setQ]=useState("");const [tab,setTab]=useState("todas");

  const tabs=[["todas","Todas"],["Pendiente","Pendientes"],["En producción","En producción"],["Completada","Completadas"]];
  const statusCls={Completada:"chip-filled-sec","En producción":"chip-filled-pri",Pendiente:"chip-filled-warn"};
  const filtered=lista.filter(o=>{
    const m=o.cliente.toLowerCase().includes(q.toLowerCase())||o.numero.toLowerCase().includes(q.toLowerCase());
    return tab==="todas"?m:m&&o.estado===tab;
  });

  return(<div>
    <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
      {[
        {l:"Total Órdenes",n:lista.length,i:"📋",bg:"var(--sur3)"},
        {l:"Pendientes",n:lista.filter(o=>o.estado==="Pendiente").length,i:"⏳",bg:"#fef7e0"},
        {l:"En Producción",n:lista.filter(o=>o.estado==="En producción").length,i:"🏭",bg:"var(--pri-lt)"},
        {l:"Completadas",n:lista.filter(o=>o.estado==="Completada").length,i:"✅",bg:"var(--sec-lt)"},
      ].map(s=>(<div key={s.l} className="stat-card"><div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div><div className="stat-num">{s.n}</div><div className="stat-lbl">{s.l}</div></div>))}
    </div>
    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
      <div className="sbar"><span style={{color:"var(--on-sur4)"}}>🔍</span><input placeholder="Buscar órdenes..." value={q} onChange={e=>setQ(e.target.value)}/></div>
    </div>
    <div className="seg-tabs">{tabs.map(([v,l])=>(<button key={v} className={"seg-tab"+(tab===v?" on":"")} onClick={()=>setTab(v)}>{l}</button>))}</div>
    <div className="card">
      <div className="twrap"><table>
        <thead><tr><th>Número</th><th>Cliente</th><th>Fecha</th><th>Tipo</th><th>Líneas</th><th>Pietaje</th><th>Responsable</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {filtered.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin órdenes</td></tr>}
          {filtered.map(o=>(
            <tr key={o.id}>
              <td><span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{o.numero}</span></td>
              <td style={{fontWeight:500}}>{o.cliente}</td>
              <td className="mono">{o.fecha}</td>
              <td><span className="chip">{o.tipo}</span></td>
              <td style={{textAlign:"center"}}>{o.lineas}</td>
              <td><span className="mono">{o.pietaje} ft²</span></td>
              <td style={{color:"var(--on-sur3)",fontSize:13}}>{o.responsable}</td>
              <td><span className={`chip ${statusCls[o.estado]||"chip"}`}>{o.estado}</span></td>
              <td>
                <select style={{fontSize:12,padding:"4px 8px",borderRadius:"var(--rfull)",border:"1px solid var(--out)",background:"var(--sur)",fontFamily:"inherit",color:"var(--on-sur)",cursor:"pointer",outline:"none"}}
                  value={o.estado} onChange={e=>setLista(l=>l.map(x=>x.id===o.id?{...x,estado:e.target.value}:x))}>
                  <option>Pendiente</option><option>En producción</option><option>Completada</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  </div>);
}
// ═══ LICENCIAS ═══════════════════════════════════════════════════════════════
const PLANES_FIJOS=[
  {id:"basico",nombre:"Básico",precio:990,usuarios:1,desc:"1 usuario, todas las calculadoras"},
  {id:"pro",nombre:"Pro",precio:2490,usuarios:3,desc:"3 usuarios, todas las funciones"},
  {id:"empresa",nombre:"Empresarial",precio:4990,usuarios:999,desc:"Usuarios ilimitados, soporte prioritario"},
  {id:"custom",nombre:"Personalizado",precio:0,usuarios:0,desc:"Precio y condiciones personalizadas"},
];
function genLicKey(){const s=()=>Math.random().toString(36).slice(2,6).toUpperCase();return`VENT-${s()}-${s()}-${s()}`;}
function addMonthsLic(m){const d=new Date();d.setMonth(d.getMonth()+m);return d.toISOString().slice(0,10);}
function daysLeft(d){return Math.ceil((new Date(d)-new Date())/86400000);}
function fmtDate(d){return new Date(d).toLocaleDateString("es-DO",{day:"2-digit",month:"short",year:"numeric"});}

const INIT_LICENCIAS=[
  {id:1,empresa:"Aluminios El Cibao SRL",contacto:"Rafael Núñez",email:"rnunez@elcibao.do",tel:"809-555-1111",ciudad:"Santiago",plan:"Pro",planCustom:"",precioCustom:0,estado:"Activo",key:genLicKey(),device:"MacBook Pro · Chrome 124",vencimiento:"2025-08-15",meses:1,usuarios:2,maxUsuarios:3,pagos:[{fecha:"2025-05-15",monto:2490,metodo:"Transferencia",ref:"TRF-001"}],notas:"Cliente fundador · descuento 20%",created:"2025-03-01"},
  {id:2,empresa:"Ventanas & Persianas Pérez",contacto:"Carmen Pérez",email:"carmen@vp.do",tel:"829-555-2222",ciudad:"Sto. Domingo",plan:"Básico",planCustom:"",precioCustom:0,estado:"Activo",key:genLicKey(),device:"HP Pavilion · Firefox 125",vencimiento:"2025-07-01",meses:1,usuarios:1,maxUsuarios:1,pagos:[{fecha:"2025-06-01",monto:990,metodo:"Efectivo",ref:""}],notas:"",created:"2025-05-01"},
  {id:3,empresa:"Constructora Moderna SRL",contacto:"Jorge Marte",email:"jmarte@cm.do",tel:"849-555-3333",ciudad:"Punta Cana",plan:"Empresarial",planCustom:"",precioCustom:0,estado:"Activo",key:genLicKey(),device:"Dell XPS · Chrome 124",vencimiento:"2026-01-10",meses:12,usuarios:5,maxUsuarios:999,pagos:[{fecha:"2025-01-10",monto:4990,metodo:"Transferencia",ref:"TRF-100"}],notas:"Pago anual",created:"2025-01-10"},
  {id:4,empresa:"Taller Aluminio Díaz",contacto:"Pedro Díaz",email:"pedro@tad.do",tel:"809-555-4444",ciudad:"La Romana",plan:"Básico",planCustom:"",precioCustom:0,estado:"Suspendido",key:genLicKey(),device:"—",vencimiento:"2025-05-01",meses:1,usuarios:0,maxUsuarios:1,pagos:[{fecha:"2025-04-01",monto:990,metodo:"Efectivo",ref:""}],notas:"Suspendido por mora",created:"2025-04-01"},
  {id:5,empresa:"Persianas del Norte",contacto:"Ana Guzmán",email:"ana@pn.do",tel:"829-555-5555",ciudad:"Santiago",plan:"Personalizado",planCustom:"Pro Especial",precioCustom:1800,estado:"Activo",key:genLicKey(),device:"Lenovo ThinkPad · Chrome 123",vencimiento:"2025-09-20",meses:1,usuarios:2,maxUsuarios:3,pagos:[{fecha:"2025-05-20",monto:1800,metodo:"Transferencia",ref:"TRF-200"}],notas:"Precio especial 6 meses",created:"2025-05-20"},
];

function Licencias(){
  const [lista,setLista]=useState(INIT_LICENCIAS);
  const [q,setQ]=useState("");
  const [tab,setTab]=useState("todas");
  const [modal,setModal]=useState(null);
  const [sel,setSel]=useState(null);
  const [pagoForm,setPagoForm]=useState({fecha:new Date().toISOString().slice(0,10),monto:"",metodo:"Transferencia",ref:""});
  const [renovarMeses,setRenovarMeses]=useState(1);
  const [newForm,setNewForm]=useState({empresa:"",contacto:"",email:"",tel:"",ciudad:"",plan:"Pro",planCustom:"",precioCustom:0,meses:1,notas:""});
  const nf=k=>e=>setNewForm(f=>({...f,[k]:e.target.value}));

  const tabs=[["todas","Todas"],["Activo","Activas"],["Suspendido","Suspendidas"],["vence","Vencen pronto"]];
  const filtered=lista.filter(l=>{
    const m=l.empresa.toLowerCase().includes(q.toLowerCase())||l.contacto.toLowerCase().includes(q.toLowerCase());
    if(tab==="Activo")return m&&l.estado==="Activo";
    if(tab==="Suspendido")return m&&l.estado==="Suspendido";
    if(tab==="vence")return m&&l.estado==="Activo"&&daysLeft(l.vencimiento)<=30;
    return m;
  });

  const activas=lista.filter(l=>l.estado==="Activo").length;
  const vencen=lista.filter(l=>l.estado==="Activo"&&daysLeft(l.vencimiento)<=30).length;
  const mrr=lista.filter(l=>l.estado==="Activo").reduce((s,l)=>{
    const p=PLANES_FIJOS.find(p=>p.nombre===l.plan);
    return s+(l.plan==="Personalizado"?l.precioCustom:(p?.precio||0));
  },0);

  function planPrecio(l){
    if(l.plan==="Personalizado")return l.precioCustom;
    return PLANES_FIJOS.find(p=>p.nombre===l.plan)?.precio||0;
  }
  function toggle(l){setLista(ls=>ls.map(x=>x.id===l.id?{...x,estado:x.estado==="Activo"?"Suspendido":"Activo"}:x));}
  function regenKey(id){setLista(ls=>ls.map(x=>x.id===id?{...x,key:genLicKey(),device:"—"}:x));}
  function renovar(){
    const base=sel&&daysLeft(sel.vencimiento)>0?sel.vencimiento:new Date().toISOString().slice(0,10);
    const d=new Date(base);d.setMonth(d.getMonth()+renovarMeses);
    const monto=planPrecio(sel)*renovarMeses;
    setLista(ls=>ls.map(x=>x.id===sel.id?{...x,vencimiento:d.toISOString().slice(0,10),estado:"Activo",pagos:[{fecha:new Date().toISOString().slice(0,10),monto,metodo:"Transferencia",ref:""},...x.pagos]}:x));
    setModal(null);
  }
  function registrarPago(){
    if(!pagoForm.monto)return;
    setLista(ls=>ls.map(x=>x.id===sel.id?{...x,pagos:[{...pagoForm,monto:parseFloat(pagoForm.monto)},...x.pagos]}:x));
    setModal(null);
  }
  function crearLicencia(){
    if(!newForm.empresa.trim())return;
    const plan=PLANES_FIJOS.find(p=>p.nombre===newForm.plan);
    const d=new Date();d.setMonth(d.getMonth()+parseInt(newForm.meses));
    setLista(ls=>[...ls,{...newForm,id:Date.now(),key:genLicKey(),device:"—",estado:"Activo",usuarios:0,maxUsuarios:newForm.plan==="Personalizado"?3:(plan?.usuarios||1),precioCustom:parseFloat(newForm.precioCustom)||0,vencimiento:d.toISOString().slice(0,10),pagos:[],created:new Date().toISOString().slice(0,10)}]);
    setModal(null);
    setNewForm({empresa:"",contacto:"",email:"",tel:"",ciudad:"",plan:"Pro",planCustom:"",precioCustom:0,meses:1,notas:""});
  }

  const dColor=l=>{const d=daysLeft(l.vencimiento);return d<0?"var(--err)":d<=14?"var(--warn)":d<=30?"#e37400":"var(--on-sur3)";};
  const dLabel=l=>{const d=daysLeft(l.vencimiento);return d<0?`Vencido ${Math.abs(d)}d`:d<=30?`⚠ ${d} días`:`${d} días`;};
  const planColor=p=>p==="Empresarial"?"chip-filled-warn":p==="Pro"?"chip-filled-pri":p==="Personalizado"?"chip-filled-sec":"chip";

  return(<div>
    <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
      {[
        {l:"Licencias Activas",n:activas,s:`de ${lista.length} totales`,i:"🔑",bg:"var(--sec-lt)"},
        {l:"MRR",n:`RD$${mrr.toLocaleString()}`,s:"ingresos mensuales",i:"💰",bg:"var(--pri-lt)"},
        {l:"ARR Proyectado",n:`RD$${(mrr*12).toLocaleString()}`,s:"ingresos anuales",i:"📈",bg:"var(--sur3)"},
        {l:"Vencen Pronto",n:vencen,s:"próximos 30 días",i:"⏰",bg:vencen>0?"#fef7e0":"var(--sec-lt)"},
      ].map(s=>(<div key={s.l} className="stat-card"><div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div><div className="stat-num" style={{fontSize:s.l==="MRR"||s.l==="ARR Proyectado"?16:28}}>{s.n}</div><div className="stat-lbl">{s.l}</div><div style={{fontSize:11,color:"var(--on-sur3)",marginTop:4}}>{s.s}</div></div>))}
    </div>

    {vencen>0&&<div style={{background:"#fef7e0",border:"1px solid #f9ab00",borderRadius:"var(--r-sm)",padding:"10px 16px",marginBottom:16,fontSize:13,color:"#92400e",display:"flex",alignItems:"center",gap:10}}>⚠ <b>{vencen} licencia(s)</b> vencen en los próximos 30 días.</div>}

    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
      <div className="sbar"><span style={{color:"var(--on-sur4)"}}>🔍</span><input placeholder="Buscar empresa, contacto..." value={q} onChange={e=>setQ(e.target.value)}/></div>
      <button className="btn btn-filled" onClick={()=>setModal("new")}>＋ Nueva Licencia</button>
    </div>

    <div className="seg-tabs">{tabs.map(([v,l])=>(<button key={v} className={"seg-tab"+(tab===v?" on":"")} onClick={()=>setTab(v)}>{l}</button>))}</div>

    <div className="card"><div className="twrap"><table>
      <thead><tr><th>Empresa</th><th>Plan</th><th>Estado</th><th>Vencimiento</th><th>Dispositivo</th><th>Clave</th><th>MRR</th><th>Acciones</th></tr></thead>
      <tbody>
        {filtered.length===0&&<tr><td colSpan={8} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin resultados</td></tr>}
        {filtered.map(l=>(
          <tr key={l.id}>
            <td><div style={{fontWeight:600,cursor:"pointer"}} onClick={()=>{setSel(l);setModal("detail");}}>{l.empresa}</div><div style={{fontSize:11,color:"var(--on-sur3)",marginTop:2}}>{l.contacto} · {l.email}</div></td>
            <td><span className={`chip ${planColor(l.plan)}`}>{l.plan==="Personalizado"?l.planCustom||"Custom":l.plan}</span></td>
            <td><span className={`chip ${l.estado==="Activo"?"chip-filled-sec":"chip-filled-err"}`}>{l.estado}</span></td>
            <td><div className="mono" style={{fontSize:12,color:dColor(l)}}>{fmtDate(l.vencimiento)}</div><div style={{fontSize:11,color:dColor(l),fontWeight:600}}>{dLabel(l)}</div></td>
            <td style={{fontSize:12,color:"var(--on-sur3)"}}>{l.device==="—"?<span style={{color:"var(--out2)"}}>Sin registrar</span>:l.device}</td>
            <td><span className="mono" style={{fontSize:11,color:"var(--pri)",letterSpacing:1}}>{l.key.slice(0,14)}…</span></td>
            <td><span className="mono" style={{fontWeight:600,color:"var(--sec)"}}>RD${planPrecio(l).toLocaleString()}</span></td>
            <td><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              <button style={{fontSize:11,padding:"4px 8px",background:"var(--pri-lt)",color:"var(--pri)",border:"1px solid var(--pri-lt2)",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600}} onClick={()=>{setSel(l);setModal("detail");}}>Ver</button>
              <button style={{fontSize:11,padding:"4px 8px",background:"var(--sec-lt)",color:"var(--sec)",border:"1px solid #a8d5b5",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600}} onClick={()=>{setSel(l);setRenovarMeses(1);setModal("renovar");}}>Renovar</button>
              <button style={{fontSize:11,padding:"4px 8px",background:l.estado==="Activo"?"#fce8e6":"var(--sec-lt)",color:l.estado==="Activo"?"var(--err)":"var(--sec)",border:`1px solid ${l.estado==="Activo"?"#fad2cf":"#a8d5b5"}`,borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600}} onClick={()=>toggle(l)}>{l.estado==="Activo"?"Suspender":"Activar"}</button>
            </div></td>
          </tr>
        ))}
      </tbody>
    </table></div></div>

    {/* MODAL: NUEVA LICENCIA */}
    {modal==="new"&&<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}><div className="modal" style={{maxWidth:560}}>
      <div className="modal-hdr"><div className="modal-ttl">Nueva Licencia</div><button className="icon-btn" onClick={()=>setModal(null)}>✕</button></div>
      <div className="modal-bdy"><div className="fgrid f2" style={{gap:13}}>
        <div className="fld" style={{gridColumn:"1/-1"}}><label>Empresa *</label><input value={newForm.empresa} onChange={nf("empresa")} placeholder="Aluminios del Norte SRL"/></div>
        <div className="fld"><label>Contacto</label><input value={newForm.contacto} onChange={nf("contacto")}/></div>
        <div className="fld"><label>Teléfono</label><input value={newForm.tel} onChange={nf("tel")} placeholder="809-000-0000"/></div>
        <div className="fld" style={{gridColumn:"1/-1"}}><label>Email</label><input value={newForm.email} onChange={nf("email")}/></div>
        <div className="fld"><label>Ciudad</label><input value={newForm.ciudad} onChange={nf("ciudad")}/></div>
        <div className="fld"><label>Plan</label><select value={newForm.plan} onChange={nf("plan")}>{PLANES_FIJOS.map(p=><option key={p.id} value={p.nombre}>{p.nombre}{p.precio>0?` — RD$${p.precio}/mes`:""}</option>)}</select></div>
        {newForm.plan==="Personalizado"&&<>
          <div className="fld"><label>Nombre del Plan</label><input value={newForm.planCustom} onChange={nf("planCustom")} placeholder="Pro Especial"/></div>
          <div className="fld"><label>Precio/mes (RD$)</label><input type="number" value={newForm.precioCustom} onChange={nf("precioCustom")}/></div>
        </>}
        <div className="fld"><label>Meses iniciales</label><select value={newForm.meses} onChange={nf("meses")}>{[1,2,3,6,12].map(m=><option key={m} value={m}>{m} {m===1?"mes":"meses"}</option>)}</select></div>
        <div style={{gridColumn:"1/-1",background:"var(--pri-lt)",borderRadius:"var(--r-sm)",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:12,color:"var(--pri-dk)",fontWeight:600}}>{newForm.plan==="Personalizado"?newForm.planCustom||"Personalizado":newForm.plan}</div><div style={{fontSize:11,color:"var(--on-sur3)",marginTop:2}}>Vence: {new Date(addMonthsLic(parseInt(newForm.meses)||1)).toLocaleDateString("es-DO",{day:"2-digit",month:"short",year:"numeric"})}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:700,color:"var(--pri)"}}>RD${((newForm.plan==="Personalizado"?parseFloat(newForm.precioCustom)||0:(PLANES_FIJOS.find(p=>p.nombre===newForm.plan)?.precio||0))*(parseInt(newForm.meses)||1)).toLocaleString()}</div><div style={{fontSize:10,color:"var(--on-sur3)"}}>Total a cobrar</div></div>
        </div>
        <div className="fld" style={{gridColumn:"1/-1"}}><label>Notas</label><textarea value={newForm.notas} onChange={nf("notas")} style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"8px 12px",fontFamily:"inherit",fontSize:13,color:"var(--on-sur)",outline:"none",width:"100%",resize:"vertical",minHeight:56}}/></div>
      </div></div>
      <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setModal(null)}>Cancelar</button><button className="btn btn-filled" onClick={crearLicencia}>Generar Licencia</button></div>
    </div></div>}

    {/* MODAL: DETALLE */}
    {modal==="detail"&&sel&&(()=>{
      const l=lista.find(x=>x.id===sel.id)||sel;const precio=planPrecio(l);
      return(<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}><div className="modal" style={{maxWidth:600}}>
        <div className="modal-hdr"><div><div className="modal-ttl">{l.empresa}</div><div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>{l.contacto} · {l.email}</div></div><span className={`chip ${l.estado==="Activo"?"chip-filled-sec":"chip-filled-err"}`}>{l.estado}</span><button className="icon-btn" onClick={()=>setModal(null)}>✕</button></div>
        <div className="modal-bdy">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
            {[["Plan",<span className={`chip ${planColor(l.plan)}`}>{l.plan==="Personalizado"?l.planCustom||"Custom":l.plan}</span>],["MRR",<span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:"var(--sec)"}}>RD${precio.toLocaleString()}</span>],["Usuarios",`${l.usuarios}/${l.maxUsuarios===999?"∞":l.maxUsuarios}`],["Vencimiento",<span className="mono" style={{color:dColor(l),fontSize:12}}>{fmtDate(l.vencimiento)}</span>],["Días restantes",<span style={{color:dColor(l),fontWeight:700}}>{dLabel(l)}</span>],["Desde",fmtDate(l.created)]].map(([k,v])=>(
              <div key={k} style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"10px 14px"}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1.5,color:"var(--on-sur3)",marginBottom:4}}>{k}</div><div style={{fontSize:13,fontWeight:600}}>{v}</div></div>
            ))}
          </div>
          <div style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:"var(--on-sur3)",marginBottom:4}}>Clave de Licencia</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,color:"var(--pri)",letterSpacing:2,fontWeight:600}}>{l.key}</div></div>
            <button className="btn btn-sm btn-outlined" onClick={()=>regenKey(l.id)}>🔄 Regenerar</button>
          </div>
          <div style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"12px 16px",marginBottom:14}}>
            <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:"var(--on-sur3)",marginBottom:4}}>Dispositivo</div>
            <div style={{fontSize:13,color:l.device==="—"?"var(--on-sur4)":"var(--on-sur)"}}>{l.device==="—"?"Sin registrar — se registra al primer uso":l.device}</div>
          </div>
          {l.notas&&<div style={{background:"#fef7e0",border:"1px solid #f9ab00",borderRadius:"var(--r-sm)",padding:"10px 14px",marginBottom:14,fontSize:13,color:"#92400e"}}>📝 {l.notas}</div>}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:"var(--on-sur3)",marginBottom:8}}>Renovar</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{[1,3,6,12].map(m=>(<button key={m} className="btn btn-sm btn-outlined" onClick={()=>{setSel(l);setRenovarMeses(m);setModal("renovar");}}>+{m} {m===1?"mes":"meses"}</button>))}</div>
          </div>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:"var(--on-sur3)",marginBottom:8}}>Historial de Pagos</div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Fecha","Monto","Método","Ref."].map(h=>(<th key={h} style={{fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"var(--on-sur3)",padding:"6px 10px",textAlign:"left",borderBottom:"1px solid var(--out)",background:"var(--sur2)"}}>{h}</th>))}</tr></thead>
            <tbody>
              {l.pagos.length===0&&<tr><td colSpan={4} style={{padding:"14px 10px",textAlign:"center",color:"var(--on-sur4)",fontSize:12}}>Sin pagos</td></tr>}
              {l.pagos.map((p,i)=>(<tr key={i}><td style={{padding:"8px 10px",fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>{p.fecha}</td><td style={{padding:"8px 10px",color:"var(--sec)",fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>RD${parseFloat(p.monto).toLocaleString()}</td><td style={{padding:"8px 10px",fontSize:12}}>{p.metodo}</td><td style={{padding:"8px 10px",fontSize:12,color:"var(--on-sur3)"}}>{p.ref||"—"}</td></tr>))}
            </tbody>
          </table>
        </div>
        <div className="modal-ftr">
          <button className="btn btn-text" onClick={()=>toggle(l)}>{l.estado==="Activo"?"🔴 Suspender":"🟢 Activar"}</button>
          <button className="btn btn-outlined" onClick={()=>{setPagoForm({fecha:new Date().toISOString().slice(0,10),monto:precio,metodo:"Transferencia",ref:""});setModal("pago");}}>💳 Pago</button>
          <button className="btn btn-filled" onClick={()=>{setRenovarMeses(1);setModal("renovar");}}>🔄 Renovar</button>
        </div>
      </div></div>);
    })()}

    {/* MODAL: RENOVAR */}
    {modal==="renovar"&&sel&&<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}><div className="modal" style={{maxWidth:420}}>
      <div className="modal-hdr"><div className="modal-ttl">Renovar Licencia</div><button className="icon-btn" onClick={()=>setModal(null)}>✕</button></div>
      <div className="modal-bdy">
        <div style={{background:"var(--pri-lt)",borderRadius:"var(--r-sm)",padding:"12px 16px",marginBottom:14}}><div style={{fontWeight:600,fontSize:14}}>{sel.empresa}</div><div style={{fontSize:12,color:"var(--on-sur3)",marginTop:3}}>Vence: {fmtDate(sel.vencimiento)} · {dLabel(sel)}</div></div>
        <div className="fgrid" style={{gap:12}}>
          <div className="fld"><label>Meses a renovar</label><select value={renovarMeses} onChange={e=>setRenovarMeses(parseInt(e.target.value))}>{[1,2,3,6,12].map(m=><option key={m} value={m}>{m} {m===1?"mes":"meses"}</option>)}</select></div>
          <div style={{background:"var(--sec-lt)",borderRadius:"var(--r-sm)",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:12,color:"var(--sec)",fontWeight:600}}>Total a cobrar</div></div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:700,color:"var(--sec)"}}>RD${(planPrecio(sel)*renovarMeses).toLocaleString()}</div>
          </div>
        </div>
      </div>
      <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setModal(null)}>Cancelar</button><button className="btn btn-filled" style={{background:"var(--sec)"}} onClick={renovar}>Confirmar Renovación</button></div>
    </div></div>}

    {/* MODAL: PAGO */}
    {modal==="pago"&&sel&&<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}><div className="modal" style={{maxWidth:420}}>
      <div className="modal-hdr"><div className="modal-ttl">Registrar Pago</div><button className="icon-btn" onClick={()=>setModal(null)}>✕</button></div>
      <div className="modal-bdy">
        <div style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"10px 14px",marginBottom:14,fontSize:13}}><b>{sel.empresa}</b> · <span className={`chip ${planColor(sel.plan)}`}>{sel.plan}</span></div>
        <div className="fgrid f2" style={{gap:12}}>
          <div className="fld"><label>Fecha</label><input type="date" value={pagoForm.fecha} onChange={e=>setPagoForm(f=>({...f,fecha:e.target.value}))}/></div>
          <div className="fld"><label>Monto (RD$)</label><input type="number" value={pagoForm.monto} onChange={e=>setPagoForm(f=>({...f,monto:e.target.value}))}/></div>
          <div className="fld"><label>Método</label><select value={pagoForm.metodo} onChange={e=>setPagoForm(f=>({...f,metodo:e.target.value}))}><option>Transferencia</option><option>Efectivo</option><option>Tarjeta</option><option>Cheque</option></select></div>
          <div className="fld"><label>Referencia</label><input value={pagoForm.ref} onChange={e=>setPagoForm(f=>({...f,ref:e.target.value}))} placeholder="TRF-XXX"/></div>
        </div>
      </div>
      <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setModal(null)}>Cancelar</button><button className="btn btn-filled" onClick={registrarPago}>Guardar Pago</button></div>
    </div></div>}
  </div>);
}

// ═══ REFERIDOS ═══════════════════════════════════════════════════════════════
function genRefCode(empresa){
  return "REF-"+empresa.replace(/[^A-Z0-9]/gi,"").slice(0,4).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase();
}
const REWARD_TYPES=[
  {id:"pct",label:"% Descuento",desc:"Ej: 20% off el primer mes"},
  {id:"free",label:"Mes gratis",desc:"1 mes adicional sin costo"},
  {id:"months",label:"N Meses gratis",desc:"Tú decides cuántos meses"},
  {id:"fixed",label:"Monto fijo RD$",desc:"Crédito en dinero"},
];
const INIT_CONFIG_REF={rewardType:"pct",rewardValue:20,referrerType:"pct",referrerValue:10,active:true,message:"¡Usa mi código {CODE} y obtén {REWARD} en tu primera suscripción a Ventaneros!"};
const INIT_REF=[
  {id:1,referrer:"Aluminios El Cibao SRL",refCode:"REF-ALUM-X7K2",referred:"Metales Santo Domingo",email:"info@metalsd.do",fecha:"2025-05-10",plan:"Pro",estado:"Activo",rewarded:true,rewardDesc:"20% descuento primer mes",refRewardDesc:"10% descuento"},
  {id:2,referrer:"Ventanas & Persianas Pérez",refCode:"REF-VENT-P3M8",referred:"Aluminios del Este",email:"aleste@gmail.com",fecha:"2025-05-22",plan:"Básico",estado:"Pendiente",rewarded:false,rewardDesc:"20% descuento primer mes",refRewardDesc:"10% descuento"},
  {id:3,referrer:"Persianas del Norte",refCode:"REF-PERS-Q9N1",referred:"Ventanas Caribe SRL",email:"vc@caribe.do",fecha:"2025-06-01",plan:"Empresarial",estado:"Activo",rewarded:true,rewardDesc:"20% descuento primer mes",refRewardDesc:"10% descuento"},
];
const LIC_CLIENTS=[
  {empresa:"Aluminios El Cibao SRL",code:"REF-ALUM-X7K2"},
  {empresa:"Ventanas & Persianas Pérez",code:"REF-VENT-P3M8"},
  {empresa:"Constructora Moderna SRL",code:"REF-CONS-M4P9"},
  {empresa:"Persianas del Norte",code:"REF-PERS-Q9N1"},
];

function Referidos(){
  const [lista,setLista]=useState(INIT_REF);
  const [config,setConfig]=useState(INIT_CONFIG_REF);
  const [tab,setTab]=useState("overview");
  const [showConfig,setShowConfig]=useState(false);
  const [newModal,setNewModal]=useState(false);
  const [newForm,setNewForm]=useState({referrer:"",referred:"",email:"",plan:"Básico"});
  const nf=k=>e=>setNewForm(f=>({...f,[k]:e.target.value}));
  const cf=k=>e=>setConfig(f=>({...f,[k]:e.target.value}));

  function buildRew(type,val){
    if(type==="pct")    return `${val}% descuento primer mes`;
    if(type==="free")   return `1 mes gratis`;
    if(type==="months") return `${val} meses gratis`;
    return `RD$${val} de crédito`;
  }
  const rewDesc=()=>buildRew(config.rewardType,config.rewardValue);
  const refDesc=()=>buildRew(config.referrerType,config.referrerValue);
  const prevMsg=(code)=>config.message.replace("{CODE}",code||"REF-XXXX-XXXX").replace("{REWARD}",rewDesc());

  function applyReward(id){setLista(l=>l.map(x=>x.id===id?{...x,rewarded:true,estado:"Activo"}:x));}
  function addRef(){
    if(!newForm.referrer||!newForm.referred)return;
    const ref=LIC_CLIENTS.find(c=>c.empresa===newForm.referrer)||{code:genRefCode(newForm.referrer)};
    setLista(l=>[...l,{id:Date.now(),referrer:newForm.referrer,refCode:ref.code,referred:newForm.referred,email:newForm.email,fecha:new Date().toISOString().slice(0,10),plan:newForm.plan,estado:"Pendiente",rewarded:false,rewardDesc:rewDesc(),refRewardDesc:refDesc()}]);
    setNewModal(false);setNewForm({referrer:"",referred:"",email:"",plan:"Básico"});
  }

  const activos=lista.filter(r=>r.estado==="Activo").length;
  const statusCls={Activo:"chip-filled-sec",Pendiente:"chip-filled-warn",Cancelado:"chip-filled-err"};

  return(<div>
    <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
      {[{l:"Total Referidos",n:lista.length,s:"registrados",i:"🤝",bg:"var(--pri-lt)"},
        {l:"Activos",n:activos,s:"convertidos",i:"✅",bg:"var(--sec-lt)"},
        {l:"Pendientes",n:lista.filter(r=>r.estado==="Pendiente").length,s:"por confirmar",i:"⏳",bg:"#fef7e0"},
        {l:"Tasa Conversión",n:lista.length>0?Math.round(activos/lista.length*100)+"%":"—",s:"referidos activos",i:"📈",bg:"var(--sur3)"},
      ].map(s=>(<div key={s.l} className="stat-card"><div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div><div className="stat-num" style={{fontSize:22}}>{s.n}</div><div className="stat-lbl">{s.l}</div><div style={{fontSize:11,color:"var(--on-sur3)",marginTop:4}}>{s.s}</div></div>))}
    </div>

    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
      <div className="seg-tabs" style={{marginBottom:0}}>
        {[["overview","Resumen"],["codes","Códigos"],["history","Historial"]].map(([v,l])=>(
          <button key={v} className={"seg-tab"+(tab===v?" on":"")} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>
      <div style={{marginLeft:"auto",display:"flex",gap:8}}>
        <button className="btn btn-outlined" onClick={()=>setShowConfig(true)}>⚙️ Configurar</button>
        <button className="btn btn-filled" onClick={()=>setNewModal(true)}>＋ Registrar Referido</button>
      </div>
    </div>

    {/* Program banner */}
    <div style={{background:config.active?"var(--sec-lt)":"#fef7e0",border:`1px solid ${config.active?"#a8d5b5":"#f9ab00"}`,borderRadius:"var(--r-sm)",padding:"12px 18px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{fontSize:20}}>{config.active?"🟢":"🟡"}</div>
        <div>
          <div style={{fontWeight:600,fontSize:14,color:config.active?"var(--sec)":"#92400e"}}>Programa de Referidos {config.active?"Activo":"Pausado"}</div>
          <div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>
            Referido recibe: <b>{rewDesc()}</b> · Referidor recibe: <b>{refDesc()}</b>
          </div>
        </div>
      </div>
      <button style={{background:config.active?"#fef7e0":"var(--sec-lt)",color:config.active?"#92400e":"var(--sec)",border:`1px solid ${config.active?"#f9ab00":"#a8d5b5"}`,borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12,padding:"6px 16px"}}
        onClick={()=>setConfig(c=>({...c,active:!c.active}))}>
        {config.active?"Pausar":"Activar"}
      </button>
    </div>

    {/* TAB: OVERVIEW */}
    {tab==="overview"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div className="card"><div className="card-hdr"><div className="card-ttl">🎁 Premio para el Referido</div></div><div className="card-bdy">
        <div style={{background:"var(--pri-lt)",borderRadius:"var(--r-sm)",padding:"20px",textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:40,fontWeight:300,color:"var(--pri)"}}>
            {config.rewardType==="pct"?`${config.rewardValue}%`:config.rewardType==="free"?"1 mes":config.rewardType==="months"?`${config.rewardValue} meses`:`RD$${config.rewardValue}`}
          </div>
          <div style={{fontSize:13,color:"var(--pri-dk)",marginTop:4,fontWeight:600}}>{rewDesc()}</div>
        </div>
        <div style={{fontSize:12,color:"var(--on-sur3)",lineHeight:1.7}}>El nuevo cliente que se registre con un código de referido recibe este beneficio automáticamente en su primera suscripción.</div>
      </div></div>
      <div className="card"><div className="card-hdr"><div className="card-ttl">🏆 Premio para el que Refiere</div></div><div className="card-bdy">
        <div style={{background:"var(--sec-lt)",borderRadius:"var(--r-sm)",padding:"20px",textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:40,fontWeight:300,color:"var(--sec)"}}>
            {config.referrerType==="pct"?`${config.referrerValue}%`:config.referrerType==="free"?"1 mes":config.referrerType==="months"?`${config.referrerValue} meses`:`RD$${config.referrerValue}`}
          </div>
          <div style={{fontSize:13,color:"var(--sec)",marginTop:4,fontWeight:600}}>{refDesc()}</div>
        </div>
        <div style={{fontSize:12,color:"var(--on-sur3)",lineHeight:1.7}}>Cada cliente activo que trae un nuevo suscriptor recibe este beneficio aplicado en su próxima renovación.</div>
      </div></div>
      <div className="card" style={{gridColumn:"1/-1"}}><div className="card-hdr"><div className="card-ttl">💬 Mensaje que comparte el cliente</div></div><div className="card-bdy">
        <div style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"16px 18px",fontSize:14,lineHeight:1.8,fontStyle:"italic",color:"var(--on-sur)"}}>"{prevMsg("REF-ALUM-X7K2")}"</div>
        <div style={{fontSize:11,color:"var(--on-sur3)",marginTop:8}}>{"{CODE}"} y {"{REWARD}"} se reemplazan automáticamente con los datos reales de cada cliente.</div>
      </div></div>
    </div>}

    {/* TAB: CODES */}
    {tab==="codes"&&<div className="card"><div className="card-hdr"><div className="card-ttl">Códigos por Suscriptor</div></div>
      <div className="twrap"><table>
        <thead><tr><th>Cliente</th><th>Código de Referido</th><th>Referidos</th><th>Premio acumulado</th><th>Mensaje para compartir</th></tr></thead>
        <tbody>{LIC_CLIENTS.map((c,i)=>{
          const refs=lista.filter(r=>r.referrer===c.empresa);
          const act=refs.filter(r=>r.estado==="Activo").length;
          return(<tr key={i}>
            <td style={{fontWeight:500}}>{c.empresa}</td>
            <td><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"var(--pri)",fontWeight:600,background:"var(--pri-lt)",padding:"3px 10px",borderRadius:20}}>{c.code}</span></td>
            <td><b>{refs.length}</b> <span style={{color:"var(--on-sur3)",fontSize:12}}>({act} activos)</span></td>
            <td>{act>0?<span className="chip chip-filled-sec">{act}× {refDesc()}</span>:<span style={{color:"var(--on-sur4)",fontSize:12}}>Sin referidos</span>}</td>
            <td style={{fontSize:12,color:"var(--on-sur3)",maxWidth:260,fontStyle:"italic"}}>"{prevMsg(c.code).slice(0,70)}..."</td>
          </tr>);
        })}</tbody>
      </table></div>
    </div>}

    {/* TAB: HISTORY */}
    {tab==="history"&&<div className="card"><div className="card-hdr"><div className="card-ttl">Historial de Referidos</div></div>
      <div className="twrap"><table>
        <thead><tr><th>Referidor</th><th>Nuevo Cliente</th><th>Código</th><th>Fecha</th><th>Plan</th><th>Estado</th><th>Premio Referido</th><th>Premio Referidor</th><th></th></tr></thead>
        <tbody>{lista.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin referidos registrados</td></tr>}
          {lista.map(r=>(<tr key={r.id}>
            <td style={{fontWeight:500,fontSize:13}}>{r.referrer}</td>
            <td><div style={{fontWeight:500}}>{r.referred}</div><div style={{fontSize:11,color:"var(--on-sur3)"}}>{r.email}</div></td>
            <td><span className="mono" style={{fontSize:11,color:"var(--pri)"}}>{r.refCode}</span></td>
            <td className="mono" style={{fontSize:12}}>{r.fecha}</td>
            <td><span className="chip">{r.plan}</span></td>
            <td><span className={`chip ${statusCls[r.estado]||"chip"}`}>{r.estado}</span></td>
            <td><span style={{fontSize:12,color:r.rewarded?"var(--sec)":"var(--on-sur4)",fontWeight:r.rewarded?600:400}}>{r.rewarded?"✓ ":""}{r.rewardDesc}</span></td>
            <td><span style={{fontSize:12,color:r.rewarded?"var(--sec)":"var(--on-sur4)",fontWeight:r.rewarded?600:400}}>{r.rewarded?"✓ ":""}{r.refRewardDesc}</span></td>
            <td>{!r.rewarded&&r.estado!=="Cancelado"&&<button style={{background:"var(--sec-lt)",color:"var(--sec)",border:"1px solid #a8d5b5",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:11,padding:"4px 10px"}} onClick={()=>applyReward(r.id)}>Aplicar</button>}</td>
          </tr>))}
        </tbody>
      </table></div>
    </div>}

    {/* CONFIG MODAL */}
    {showConfig&&<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setShowConfig(false)}}><div className="modal" style={{maxWidth:580}}>
      <div className="modal-hdr"><div className="modal-ttl">⚙️ Configurar Programa</div><button className="icon-btn" onClick={()=>setShowConfig(false)}>✕</button></div>
      <div className="modal-bdy">
        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:"var(--on-sur3)",marginBottom:10}}>🎁 Premio para el Nuevo Cliente</div>
        <div className="fgrid f2" style={{gap:12,marginBottom:20}}>
          <div className="fld"><label>Tipo</label><select value={config.rewardType} onChange={cf("rewardType")}>{REWARD_TYPES.map(t=><option key={t.id} value={t.id}>{t.label} — {t.desc}</option>)}</select></div>
          {config.rewardType!=="free"&&<div className="fld"><label>{config.rewardType==="pct"?"%":config.rewardType==="months"?"Meses":"RD$"}</label><input type="number" min="1" value={config.rewardValue} onChange={cf("rewardValue")}/></div>}
          <div className="fld" style={{gridColumn:"1/-1"}}><label>Preview</label><div style={{background:"var(--pri-lt)",borderRadius:"var(--r-sm)",padding:"10px 14px",fontSize:13,color:"var(--pri-dk)",fontWeight:600}}>{rewDesc()}</div></div>
        </div>
        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:"var(--on-sur3)",marginBottom:10}}>🏆 Premio para el que Refiere</div>
        <div className="fgrid f2" style={{gap:12,marginBottom:20}}>
          <div className="fld"><label>Tipo</label><select value={config.referrerType} onChange={cf("referrerType")}>{REWARD_TYPES.map(t=><option key={t.id} value={t.id}>{t.label} — {t.desc}</option>)}</select></div>
          {config.referrerType!=="free"&&<div className="fld"><label>{config.referrerType==="pct"?"%":config.referrerType==="months"?"Meses":"RD$"}</label><input type="number" min="1" value={config.referrerValue} onChange={cf("referrerValue")}/></div>}
          <div className="fld" style={{gridColumn:"1/-1"}}><label>Preview</label><div style={{background:"var(--sec-lt)",borderRadius:"var(--r-sm)",padding:"10px 14px",fontSize:13,color:"var(--sec)",fontWeight:600}}>{refDesc()}</div></div>
        </div>
        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:"var(--on-sur3)",marginBottom:10}}>💬 Mensaje</div>
        <div className="fld" style={{marginBottom:12}}><label>Plantilla (usa {"{CODE}"} y {"{REWARD}"})</label><textarea value={config.message} onChange={cf("message")} style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"9px 12px",fontFamily:"inherit",fontSize:13,color:"var(--on-sur)",outline:"none",width:"100%",resize:"vertical",minHeight:68}}/></div>
        <div style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"12px 14px",fontSize:13,color:"var(--on-sur3)",fontStyle:"italic"}}>Preview: "{prevMsg("REF-ALUM-X7K2")}"</div>
      </div>
      <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setShowConfig(false)}>Cancelar</button><button className="btn btn-filled" onClick={()=>setShowConfig(false)}>Guardar</button></div>
    </div></div>}

    {/* NEW REFERRAL MODAL */}
    {newModal&&<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setNewModal(false)}}><div className="modal" style={{maxWidth:460}}>
      <div className="modal-hdr"><div className="modal-ttl">Registrar Referido</div><button className="icon-btn" onClick={()=>setNewModal(false)}>✕</button></div>
      <div className="modal-bdy">
        <div style={{background:"var(--pri-lt)",borderRadius:"var(--r-sm)",padding:"10px 14px",marginBottom:14,fontSize:13,color:"var(--pri-dk)"}}>
          Referido recibe: <b>{rewDesc()}</b> · Referidor recibe: <b>{refDesc()}</b>
        </div>
        <div className="fgrid" style={{gap:13}}>
          <div className="fld"><label>Cliente que refiere *</label>
            <select value={newForm.referrer} onChange={nf("referrer")}>
              <option value="">— Seleccionar —</option>
              {LIC_CLIENTS.map(c=><option key={c.empresa} value={c.empresa}>{c.empresa} ({c.code})</option>)}
            </select>
          </div>
          <div className="fld"><label>Empresa referida *</label><input value={newForm.referred} onChange={nf("referred")} placeholder="Nuevo cliente"/></div>
          <div className="fld"><label>Email</label><input value={newForm.email} onChange={nf("email")} placeholder="contacto@empresa.do"/></div>
          <div className="fld"><label>Plan de interés</label>
            <select value={newForm.plan} onChange={nf("plan")}><option>Básico</option><option>Pro</option><option>Empresarial</option></select>
          </div>
        </div>
      </div>
      <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setNewModal(false)}>Cancelar</button><button className="btn btn-filled" onClick={addRef}>Registrar</button></div>
    </div></div>}
  </div>);
}

// ═══ FACTURACIÓN ══════════════════════════════════════════════════════════════
const NCF_SERIES={
  B01:{desc:"Crédito Fiscal (empresas con RNC)",prefix:"B01"},
  B02:{desc:"Consumidor Final (personas sin RNC)",prefix:"B02"},
  B15:{desc:"Gubernamental",prefix:"B15"},
};

const INIT_NCF={B01:1,B02:1,B15:1};

const INIT_FACTURAS=[
  {id:1,numero:"FAC-001",ncf:"B01-00000001",tipo:"fiscal",serie:"B01",cliente:"Constructora Pérez & Asociados",rnc:"101-12345-6",fecha:"2025-06-01",vence:"2025-06-30",estado:"Pagada",items:[{desc:"Corrediza 48×60\" 2H ×4",cant:4,precio:10700,subtotal:42800}],subtotal:42800,itbis:7704,total:50504,pagos:[{fecha:"2025-06-05",monto:50504,metodo:"Transferencia",ref:"TRF-001"}],notas:""},
  {id:2,numero:"FAC-002",ncf:"B02-00000001",tipo:"normal",serie:"B02",cliente:"María González",rnc:"",fecha:"2025-06-05",vence:"2025-06-20",estado:"Pendiente",items:[{desc:"Puerta Comercial 36×84\" 1H",cant:1,precio:5500,subtotal:5500},{desc:"Persiana A 24×48\" 1C ×2",cant:2,precio:3250,subtotal:6500}],subtotal:12000,itbis:0,total:12000,pagos:[],notas:"Pago en efectivo acordado"},
  {id:3,numero:"FAC-003",ncf:"B01-00000002",tipo:"fiscal",serie:"B01",cliente:"Inmobiliaria Vista Verde",rnc:"130-98765-4",fecha:"2025-05-28",vence:"2025-06-28",estado:"Vencida",items:[{desc:"P-92 72×84\" 4H ×4",cant:4,precio:14500,subtotal:58000}],subtotal:58000,itbis:10440,total:68440,pagos:[{fecha:"2025-06-01",monto:30000,metodo:"Transferencia",ref:"TRF-002"}],notas:"Pago parcial recibido"},
];

const CLIENTES_FACT=["Constructora Pérez & Asociados","Ferretería El Martillo","María González","Inmobiliaria Vista Verde","Persianas del Norte"];

function genFactPDF(fac,brand){
  const now=new Date().toLocaleDateString("es-DO",{day:"2-digit",month:"long",year:"numeric"});
  const b=brand||DEFAULT_BRAND;
  const pagado=fac.pagos.reduce((s,p)=>s+p.monto,0);
  const pendiente=r2(fac.total-pagado);
  const isFiscal=fac.tipo==="fiscal";

  // Pre-build all conditional HTML chunks as plain strings (no nested templates)
  var logoHtml="";
  if(b.logo){ logoHtml='<img src="'+b.logo+'" class="logo-img" alt="logo"/>'; }
  else{ logoHtml='<div class="logo-initials">'+b.iniciales.slice(0,2)+'</div>'; }

  var fiscalBar="";
  if(isFiscal){ fiscalBar='<div class="fiscal-bar">DOCUMENTO CON VALOR FISCAL · ITBIS 18% · DGII Republica Dominicana</div>'; }

  var rncHtml="";
  if(fac.rnc){ rncHtml='<div class="pi" style="color:#188038;font-weight:700">RNC: '+fac.rnc+'</div>'; }

  var itemsRows="";
  for(var i=0;i<fac.items.length;i++){
    var it=fac.items[i];
    itemsRows+='<tr><td style="font-weight:500">'+it.desc+'</td><td class="r">'+it.cant+'</td><td class="r" style="font-family:Courier New,monospace">RD$'+r2(it.precio).toLocaleString()+'</td><td class="r" style="font-family:Courier New,monospace;font-weight:700">RD$'+it.subtotal.toLocaleString()+'</td></tr>';
  }

  var itbisRow="";
  if(isFiscal){
    itbisRow='<div class="tr itbis"><span>ITBIS 18%</span><span style="font-family:Courier New,monospace">RD$'+fac.itbis.toLocaleString()+'</span></div>';
  } else {
    itbisRow='<div class="tr" style="color:#5f6368;font-size:10px"><span>Sin ITBIS</span><span>-</span></div>';
  }

  var pendRow="";
  if(pendiente>0&&pagado>0){
    pendRow='<div class="tr pend"><span>Pendiente</span><span>RD$'+pendiente.toLocaleString()+'</span></div>';
  }

  var ncfHtml="";
  if(isFiscal){
    var serieDesc=(NCF_SERIES[fac.serie]&&NCF_SERIES[fac.serie].desc)||"";
    ncfHtml='<div class="ncf"><div><div class="ncfl">Numero de Comprobante Fiscal (NCF)</div><div class="ncfn">'+fac.ncf+'</div></div><div style="text-align:right"><div class="ncfl">Serie</div><div style="font-size:12px;font-weight:700;color:#188038">'+serieDesc+'</div></div></div>';
  }

  var pagosHtml="";
  if(fac.pagos.length>0){
    var pagoRows="";
    for(var j=0;j<fac.pagos.length;j++){
      var p=fac.pagos[j];
      var refTxt=p.ref?(" · "+p.ref):"";
      pagoRows+='<div class="pago-row"><span>'+p.fecha+' · '+p.metodo+refTxt+'</span><span style="font-family:Courier New,monospace;font-weight:600;color:#188038">RD$'+parseFloat(p.monto).toLocaleString()+'</span></div>';
    }
    pagosHtml='<div class="pagos"><div class="pagos-ttl">Historial de Pagos</div>'+pagoRows+'</div>';
  }

  var notaHtml="";
  if(fac.notas){ notaHtml='<div class="note">Nota: '+fac.notas+'</div>'; }

  var docBadgeText=isFiscal?"FACTURA CON VALOR FISCAL":"FACTURA / COTIZACION";
  var docBadgeBg=isFiscal?"background:#188038;color:#fff":("background:"+b.colorPri+";color:#fff");
  var receptorLabel=isFiscal?"Receptor":"Cliente";
  var footerNote=isFiscal?("NCF: "+fac.ncf):"Sin valor fiscal";

  var styleBlock=""+
    "*{box-sizing:border-box;margin:0;padding:0}"+
    "body{font-family:Arial,sans-serif;font-size:11px;color:#202124;padding:28px;background:#fff}"+
    ".hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px;padding-bottom:16px;border-bottom:3px solid "+b.colorPri+"}"+
    ".logo-wrap{display:flex;align-items:center;gap:14px}"+
    ".logo-img{width:52px;height:52px;object-fit:contain;border-radius:8px}"+
    ".logo-initials{width:52px;height:52px;border-radius:8px;background:"+b.colorPri+";color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800}"+
    ".biz-name{font-size:20px;font-weight:800;color:"+b.colorPri+"}"+
    ".biz-sub{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#5f6368;margin-top:2px}"+
    ".doc-right{text-align:right}"+
    ".doc-badge{display:inline-block;padding:4px 14px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:6px;"+docBadgeBg+"}"+
    ".doc-num{font-size:22px;font-weight:700;margin-bottom:3px}"+
    ".doc-date{font-size:11px;color:#5f6368}"+
    ".fiscal-bar{background:#188038;color:#fff;padding:8px 16px;border-radius:5px;margin-bottom:16px;font-size:10px;font-weight:700;letter-spacing:2px;text-align:center}"+
    ".parties{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px;background:#f8f9fa;border-radius:6px;padding:14px 16px;border:1px solid #e8eaed}"+
    ".pl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#5f6368;margin-bottom:5px;padding-bottom:4px;border-bottom:1px solid #e8eaed}"+
    ".pn{font-size:13px;font-weight:700;margin-bottom:3px}"+
    ".pi{font-size:11px;color:#5f6368}"+
    "table{width:100%;border-collapse:collapse;margin-bottom:16px}"+
    "th{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#5f6368;padding:8px 10px;text-align:left;background:#f8f9fa;border-bottom:2px solid #e8eaed}"+
    "th.r,td.r{text-align:right}"+
    "td{padding:9px 10px;border-bottom:1px solid #f1f3f4;font-size:11px}"+
    "tr:last-child td{border-bottom:none}"+
    ".totals{margin-left:auto;width:280px}"+
    ".tr{display:flex;justify-content:space-between;padding:6px 12px;font-size:12px}"+
    ".tr.itbis{color:#188038;font-weight:600;background:#e6f4ea;border-radius:4px;margin:3px 0;padding:7px 12px}"+
    ".tr.total{background:#202124;color:#fff;border-radius:5px;font-size:14px;font-weight:700;padding:10px 14px;margin-top:6px}"+
    ".tr.pend{background:#fef7e0;color:#92400e;border-radius:4px;margin:3px 0;padding:7px 12px;font-weight:600}"+
    ".ncf{border:2px dashed #188038;border-radius:6px;padding:10px 14px;margin-top:14px;display:flex;justify-content:space-between;align-items:center}"+
    ".ncfl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#188038}"+
    ".ncfn{font-size:16px;font-weight:700;font-family:Courier New,monospace;color:#188038;letter-spacing:3px}"+
    ".pagos{margin-top:14px;background:#f8f9fa;border-radius:6px;padding:12px 14px;border:1px solid #e8eaed}"+
    ".pagos-ttl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#5f6368;margin-bottom:8px}"+
    ".pago-row{display:flex;justify-content:space-between;font-size:11px;padding:4px 0;border-bottom:1px solid #e8eaed}"+
    ".pago-row:last-child{border-bottom:none}"+
    ".note{background:#fef7e0;border:1px solid #f9ab00;border-radius:5px;padding:9px 12px;margin-top:12px;font-size:11px;color:#594300}"+
    ".footer{margin-top:20px;padding-top:12px;border-top:1px solid #e8eaed;display:flex;justify-content:space-between;color:#80868b;font-size:10px}"+
    ".sig-area{display:flex;gap:40px;margin-top:36px}"+
    ".sig{border-top:1px solid #202124;padding-top:4px;min-width:160px;text-align:center;font-size:10px;color:#5f6368}";

  var bodyHtml=""+
    '<div class="hdr">'+
      '<div class="logo-wrap">'+logoHtml+
        '<div><div class="biz-name">'+b.nombre+'</div><div class="biz-sub">'+b.slogan+'</div></div>'+
      '</div>'+
      '<div class="doc-right">'+
        '<div class="doc-badge">'+docBadgeText+'</div>'+
        '<div class="doc-num">'+fac.numero+'</div>'+
        '<div class="doc-date">Fecha: '+fac.fecha+' - Vence: '+fac.vence+'</div>'+
      '</div>'+
    '</div>'+
    fiscalBar+
    '<div class="parties">'+
      '<div><div class="pl">Emisor</div><div class="pn">'+b.nombre+'</div><div class="pi">'+b.slogan+'</div></div>'+
      '<div><div class="pl">'+receptorLabel+'</div><div class="pn">'+fac.cliente+'</div>'+rncHtml+'</div>'+
    '</div>'+
    '<table><thead><tr><th>Descripcion</th><th class="r">Cant.</th><th class="r">Precio Unit.</th><th class="r">Subtotal</th></tr></thead><tbody>'+itemsRows+'</tbody></table>'+
    '<div class="totals">'+
      '<div class="tr"><span>Subtotal</span><span style="font-family:Courier New,monospace">RD$'+fac.subtotal.toLocaleString()+'</span></div>'+
      itbisRow+
      '<div class="tr total"><span>TOTAL</span><span style="font-family:Courier New,monospace">RD$'+fac.total.toLocaleString()+'</span></div>'+
      pendRow+
    '</div>'+
    ncfHtml+
    pagosHtml+
    notaHtml+
    '<div class="sig-area">'+
      '<div class="sig">Firma Autorizada - '+b.nombre+'</div>'+
      '<div class="sig">Sello de la Empresa</div>'+
      '<div class="sig">Recibi Conforme - '+fac.cliente+'</div>'+
    '</div>'+
    '<div class="footer"><div>'+b.nombre+' - '+now+' - '+fac.numero+'</div><div>'+footerNote+'</div></div>';

  var filename=fac.numero+"-"+fac.cliente.replace(/\s+/g,"-")+".pdf";
  downloadAsPDF(styleBlock, bodyHtml, filename);
}


function Facturacion({brand}){
  const [lista,setLista]=useState(INIT_FACTURAS);
  const [ncfSeq,setNcfSeq]=useState(INIT_NCF);
  const [tab,setTab]=useState("facturas");
  const [q,setQ]=useState("");
  const [estado,setEstado]=useState("todas");
  const [modal,setModal]=useState(null); // null|'new'|'detail'|'pago'|'ncf'
  const [sel,setSel]=useState(null);
  const [pagoForm,setPagoForm]=useState({fecha:new Date().toISOString().slice(0,10),monto:"",metodo:"Transferencia",ref:""});

  // New invoice form
  const [form,setForm]=useState({
    cliente:"",rnc:"",tipo:"fiscal",serie:"B01",
    fecha:new Date().toISOString().slice(0,10),
    vence:"",notas:"",
    items:[{desc:"",cant:1,precio:0,subtotal:0}],
  });
  const sf=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  function addItem(){setForm(f=>({...f,items:[...f.items,{desc:"",cant:1,precio:0,subtotal:0}]}));}
  function removeItem(i){setForm(f=>({...f,items:f.items.filter((_,idx)=>idx!==i)}));}
  function updateItem(i,k,v){
    setForm(f=>{const items=[...f.items];items[i]={...items[i],[k]:v};
      if(k==="cant"||k==="precio") items[i].subtotal=r2((parseFloat(items[i].cant)||0)*(parseFloat(items[i].precio)||0));
      return{...f,items};
    });
  }

  const subtotal=form.items.reduce((s,it)=>s+(parseFloat(it.subtotal)||0),0);
  const itbis=form.tipo==="fiscal"?r2(subtotal*0.18):0;
  const total=r2(subtotal+itbis);

  function genNCF(serie){
    const n=ncfSeq[serie]||1;
    const ncf=`${serie}-${String(n).padStart(8,"0")}`;
    setNcfSeq(s=>({...s,[serie]:n+1}));
    return ncf;
  }

  function crearFactura(){
    if(!form.cliente.trim()||form.items.every(it=>!it.desc.trim())) return;
    const ncf=form.tipo==="fiscal"?genNCF(form.serie):"—";
    const num=`FAC-${String(lista.length+1).padStart(3,"0")}`;
    const nueva={
      id:Date.now(),numero:num,ncf,tipo:form.tipo,serie:form.serie,
      cliente:form.cliente,rnc:form.rnc,
      fecha:form.fecha,vence:form.vence||"—",
      estado:"Pendiente",
      items:form.items.filter(it=>it.desc.trim()),
      subtotal,itbis,total,pagos:[],notas:form.notas,
    };
    setLista(l=>[nueva,...l]);
    setModal(null);
    setForm({cliente:"",rnc:"",tipo:"fiscal",serie:"B01",fecha:new Date().toISOString().slice(0,10),vence:"",notas:"",items:[{desc:"",cant:1,precio:0,subtotal:0}]});
    // Open detail immediately
    setTimeout(()=>{setSel(nueva);setModal("detail");},100);
  }

  function registrarPago(){
    if(!pagoForm.monto)return;
    const monto=parseFloat(pagoForm.monto);
    setLista(l=>l.map(x=>{
      if(x.id!==sel.id)return x;
      const pagos=[{...pagoForm,monto},...x.pagos];
      const pagado=pagos.reduce((s,p)=>s+p.monto,0);
      const estado=pagado>=x.total?"Pagada":pagado>0?"Parcial":"Pendiente";
      return{...x,pagos,estado};
    }));
    setModal("detail");
  }

  // Stats
  const totalFacs=lista.length;
  const totalCobrado=lista.flatMap(f=>f.pagos).reduce((s,p)=>s+p.monto,0);
  const totalPendiente=lista.filter(f=>f.estado!=="Pagada").reduce((s,f)=>s+r2(f.total-f.pagos.reduce((a,p)=>a+p.monto,0)),0);
  const totalITBIS=lista.filter(f=>f.tipo==="fiscal").reduce((s,f)=>s+f.itbis,0);

  const filtered=lista.filter(f=>{
    const m=f.cliente.toLowerCase().includes(q.toLowerCase())||f.numero.toLowerCase().includes(q.toLowerCase());
    return estado==="todas"?m:m&&f.estado===estado;
  });

  const statusCls={Pagada:"chip-filled-sec",Pendiente:"chip-filled-warn",Parcial:"chip-filled-pri",Vencida:"chip-filled-err"};

  // ITBIS report by month
  const itbisReport=lista.filter(f=>f.tipo==="fiscal").reduce((acc,f)=>{
    const mes=f.fecha.slice(0,7);
    if(!acc[mes])acc[mes]={mes,base:0,itbis:0,count:0};
    acc[mes].base+=f.subtotal;acc[mes].itbis+=f.itbis;acc[mes].count++;
    return acc;
  },{});

  return(<div>
    {/* Stats */}
    <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
      {[
        {l:"Facturas Emitidas",n:totalFacs,s:`${lista.filter(f=>f.tipo==="fiscal").length} fiscales`,i:"🧾",bg:"var(--pri-lt)"},
        {l:"Total Cobrado",n:`RD$${Math.round(totalCobrado).toLocaleString()}`,s:"pagos recibidos",i:"💰",bg:"var(--sec-lt)"},
        {l:"Pendiente por Cobrar",n:`RD$${Math.round(totalPendiente).toLocaleString()}`,s:`${lista.filter(f=>f.estado!=="Pagada").length} facturas`,i:"⏳",bg:"#fef7e0"},
        {l:"ITBIS Generado",n:`RD$${Math.round(totalITBIS).toLocaleString()}`,s:"a declarar a DGII",i:"🏛️",bg:"var(--sec-lt)"},
      ].map(s=>(<div key={s.l} className="stat-card"><div className="stat-icon-wrap" style={{background:s.bg}}>{s.i}</div><div className="stat-num" style={{fontSize:16}}>{s.n}</div><div className="stat-lbl">{s.l}</div><div style={{fontSize:11,color:"var(--on-sur3)",marginTop:4}}>{s.s}</div></div>))}
    </div>

    {/* Tabs */}
    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
      <div className="seg-tabs" style={{marginBottom:0}}>
        {[["facturas","Facturas"],["itbis","Reporte ITBIS"],["ncf","Control NCF"]].map(([v,l])=>(
          <button key={v} className={"seg-tab"+(tab===v?" on":"")} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>
      <div style={{marginLeft:"auto",display:"flex",gap:8}}>
        <button className="btn btn-filled" onClick={()=>setModal("new")}>＋ Nueva Factura</button>
      </div>
    </div>

    {/* TAB: FACTURAS */}
    {tab==="facturas"&&<div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
        <div className="sbar"><span style={{color:"var(--on-sur4)"}}>🔍</span><input placeholder="Buscar factura o cliente..." value={q} onChange={e=>setQ(e.target.value)}/></div>
        <select style={{padding:"8px 14px",borderRadius:"var(--rfull)",border:"1px solid var(--out)",background:"var(--sur)",fontFamily:"inherit",fontSize:13,cursor:"pointer",outline:"none"}} value={estado} onChange={e=>setEstado(e.target.value)}>
          <option value="todas">Todos los estados</option>
          {["Pendiente","Parcial","Pagada","Vencida"].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="card"><div className="twrap"><table>
        <thead><tr><th>Número</th><th>Cliente</th><th>NCF</th><th>Fecha</th><th>Vence</th><th>Total</th><th>Pagado</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {filtered.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:48,color:"var(--on-sur4)"}}>Sin facturas</td></tr>}
          {filtered.map(f=>{
            const pagado=f.pagos.reduce((s,p)=>s+p.monto,0);
            return(<tr key={f.id} style={{cursor:"pointer"}} onClick={()=>{setSel(f);setModal("detail");}}>
              <td><span className="mono" style={{fontWeight:700,color:"var(--pri)"}}>{f.numero}</span></td>
              <td><div style={{fontWeight:500}}>{f.cliente}</div>{f.rnc&&<div style={{fontSize:11,color:"var(--sec)"}}>RNC: {f.rnc}</div>}</td>
              <td><span className="mono" style={{fontSize:11,color:f.tipo==="fiscal"?"var(--sec)":"var(--on-sur4)"}}>{f.ncf==="—"?"Sin NCF":f.ncf}</span></td>
              <td className="mono" style={{fontSize:12}}>{f.fecha}</td>
              <td className="mono" style={{fontSize:12,color:(f.vence&&f.vence<new Date().toISOString().slice(0,10)&&f.estado!=="Pagada")?"var(--err)":"var(--on-sur3)"}}>{f.vence}</td>
              <td><span className="mono" style={{fontWeight:700}}>RD${f.total.toLocaleString()}</span></td>
              <td><span className="mono" style={{color:pagado>=f.total?"var(--sec)":pagado>0?"var(--warn)":"var(--on-sur4)"}}>RD${pagado.toLocaleString()}</span></td>
              <td><span className={`chip ${statusCls[f.estado]||"chip"}`}>{f.estado}</span></td>
              <td onClick={e=>e.stopPropagation()}><div style={{display:"flex",gap:4}}>
                <button style={{fontSize:11,padding:"4px 8px",background:"var(--pri-lt)",color:"var(--pri)",border:"1px solid var(--pri-lt2)",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600}} onClick={()=>{setSel(f);setModal("detail");}}>Ver</button>
                <button style={{fontSize:11,padding:"4px 8px",background:"var(--sec-lt)",color:"var(--sec)",border:"1px solid #a8d5b5",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600}} onClick={()=>genFactPDF(f,brand)}>⬇ PDF</button>
              </div></td>
            </tr>);
          })}
        </tbody>
      </table></div></div>
    </div>}

    {/* TAB: ITBIS REPORT */}
    {tab==="itbis"&&<div>
      <div style={{background:"var(--sec-lt)",border:"1px solid #a8d5b5",borderRadius:"var(--r-sm)",padding:"12px 16px",marginBottom:16,fontSize:13,color:"var(--sec)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>🏛️ <b>Reporte de ITBIS para DGII</b> — Solo facturas con valor fiscal (Serie B01)</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:15}}>Total ITBIS: RD${Math.round(totalITBIS).toLocaleString()}</div>
      </div>
      <div className="card"><div className="twrap"><table>
        <thead><tr><th>Mes</th><th>Facturas</th><th>Base Imponible</th><th>ITBIS 18%</th><th>Total con ITBIS</th></tr></thead>
        <tbody>
          {Object.values(itbisReport).sort((a,b)=>b.mes.localeCompare(a.mes)).map(r=>(
            <tr key={r.mes}>
              <td style={{fontWeight:600}}>{new Date(r.mes+"-01").toLocaleDateString("es-DO",{month:"long",year:"numeric"})}</td>
              <td style={{textAlign:"center"}}>{r.count}</td>
              <td><span className="mono">RD${Math.round(r.base).toLocaleString()}</span></td>
              <td><span className="mono" style={{color:"var(--sec)",fontWeight:700}}>RD${Math.round(r.itbis).toLocaleString()}</span></td>
              <td><span className="mono" style={{fontWeight:700}}>RD${Math.round(r.base+r.itbis).toLocaleString()}</span></td>
            </tr>
          ))}
          <tr style={{background:"var(--sur2)"}}>
            <td style={{fontWeight:700}}>TOTAL</td>
            <td style={{textAlign:"center",fontWeight:700}}>{lista.filter(f=>f.tipo==="fiscal").length}</td>
            <td><span className="mono" style={{fontWeight:700}}>RD${Math.round(lista.filter(f=>f.tipo==="fiscal").reduce((s,f)=>s+f.subtotal,0)).toLocaleString()}</span></td>
            <td><span className="mono" style={{fontWeight:700,color:"var(--sec)"}}>RD${Math.round(totalITBIS).toLocaleString()}</span></td>
            <td><span className="mono" style={{fontWeight:700}}>RD${Math.round(lista.filter(f=>f.tipo==="fiscal").reduce((s,f)=>s+f.total,0)).toLocaleString()}</span></td>
          </tr>
        </tbody>
      </table></div></div>
      <div style={{marginTop:12,fontSize:12,color:"var(--on-sur3)",textAlign:"right"}}>* Declara el ITBIS mensualmente ante la DGII usando el formulario IT-1</div>
    </div>}

    {/* TAB: NCF CONTROL */}
    {tab==="ncf"&&<div>
      <div style={{background:"var(--pri-lt)",border:"1px solid var(--pri-lt2)",borderRadius:"var(--r-sm)",padding:"12px 16px",marginBottom:16,fontSize:13,color:"var(--pri-dk)"}}>
        📋 Los NCF son asignados automáticamente al crear una factura fiscal. Puedes ajustar el próximo número si es necesario.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
        {Object.entries(NCF_SERIES).map(([serie,info])=>(
          <div key={serie} className="card">
            <div className="card-hdr"><div className="card-ttl">Serie {serie}</div></div>
            <div className="card-bdy">
              <div style={{fontSize:11,color:"var(--on-sur3)",marginBottom:12}}>{info.desc}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:700,color:"var(--pri)",marginBottom:4}}>{serie}-{String(ncfSeq[serie]||1).padStart(8,"0")}</div>
              <div style={{fontSize:11,color:"var(--on-sur3)",marginBottom:12}}>Próximo NCF a emitir</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="number" min="1" value={ncfSeq[serie]||1} onChange={e=>setNcfSeq(s=>({...s,[serie]:parseInt(e.target.value)||1}))} style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"6px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"var(--on-sur)",outline:"none",width:"100%"}}/>
              </div>
              <div style={{marginTop:10,fontSize:11,color:"var(--on-sur3)"}}>Usados: <b>{lista.filter(f=>f.tipo==="fiscal"&&f.ncf.startsWith(serie)).length}</b></div>
            </div>
          </div>
        ))}
      </div>
      <div className="card"><div className="card-hdr"><div className="card-ttl">Facturas Fiscales Emitidas</div></div>
        <div className="twrap"><table>
          <thead><tr><th>NCF</th><th>Serie</th><th>Cliente</th><th>RNC Cliente</th><th>Fecha</th><th>Base</th><th>ITBIS</th><th>Total</th></tr></thead>
          <tbody>
            {lista.filter(f=>f.tipo==="fiscal").map(f=>(
              <tr key={f.id}>
                <td><span className="mono" style={{fontWeight:600,color:"var(--sec)",fontSize:12}}>{f.ncf}</span></td>
                <td><span className="chip chip-filled-sec">{f.serie}</span></td>
                <td style={{fontWeight:500}}>{f.cliente}</td>
                <td className="mono" style={{fontSize:11,color:"var(--sec)"}}>{f.rnc||"—"}</td>
                <td className="mono" style={{fontSize:12}}>{f.fecha}</td>
                <td className="mono">RD${f.subtotal.toLocaleString()}</td>
                <td className="mono" style={{color:"var(--sec)",fontWeight:600}}>RD${f.itbis.toLocaleString()}</td>
                <td className="mono" style={{fontWeight:700}}>RD${f.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>}

    {/* MODAL: NUEVA FACTURA */}
    {modal==="new"&&<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}><div className="modal" style={{maxWidth:620}}>
      <div className="modal-hdr"><div className="modal-ttl">Nueva Factura</div><button className="icon-btn" onClick={()=>setModal(null)}>✕</button></div>
      <div className="modal-bdy">
        <div className="fgrid f2" style={{gap:13,marginBottom:14}}>
          <div className="fld" style={{gridColumn:"1/-1"}}><label>Cliente *</label>
            <input value={form.cliente} onChange={sf("cliente")} placeholder="Nombre o empresa" list="cl-list"/>
            <datalist id="cl-list">{CLIENTES_FACT.map(c=><option key={c} value={c}/>)}</datalist>
          </div>
          <div className="fld"><label>RNC / Cédula</label><input value={form.rnc} onChange={sf("rnc")} placeholder="101-00000-0"/></div>
          <div className="fld"><label>Tipo de Factura</label>
            <select value={form.tipo} onChange={sf("tipo")}>
              <option value="fiscal">🏛️ Fiscal (con ITBIS + NCF)</option>
              <option value="normal">📄 Normal (sin ITBIS)</option>
            </select>
          </div>
          {form.tipo==="fiscal"&&<div className="fld"><label>Serie NCF</label>
            <select value={form.serie} onChange={sf("serie")}>
              {Object.entries(NCF_SERIES).map(([k,v])=><option key={k} value={k}>{k} — {v.desc}</option>)}
            </select>
          </div>}
          <div className="fld"><label>Fecha</label><input type="date" value={form.fecha} onChange={sf("fecha")}/></div>
          <div className="fld"><label>Fecha de Vencimiento</label><input type="date" value={form.vence} onChange={sf("vence")}/></div>
        </div>

        {/* Items */}
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:"var(--on-sur3)",marginBottom:10}}>Ítems</div>
        {form.items.map((it,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 60px 100px 100px 32px",gap:8,marginBottom:8,alignItems:"end"}}>
            <div className="fld"><label>{i===0?"Descripción":""}</label><input value={it.desc} onChange={e=>updateItem(i,"desc",e.target.value)} placeholder={'Ej: Corrediza 48×60" 2H ×4'}/></div>
            <div className="fld"><label>{i===0?"Cant.":""}</label><input type="number" min="1" value={it.cant} onChange={e=>updateItem(i,"cant",e.target.value)} style={{textAlign:"center"}}/></div>
            <div className="fld"><label>{i===0?"Precio unit.":""}</label><input type="number" min="0" value={it.precio} onChange={e=>updateItem(i,"precio",e.target.value)}/></div>
            <div className="fld"><label>{i===0?"Subtotal":""}</label><div style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"8px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"var(--sec)",fontWeight:600}}>RD${(parseFloat(it.subtotal)||0).toLocaleString()}</div></div>
            <button style={{background:"var(--err-lt)",color:"var(--err)",border:"1px solid #fad2cf",borderRadius:6,cursor:"pointer",fontWeight:700,fontSize:14,padding:"0 8px",height:36,alignSelf:"end"}} onClick={()=>removeItem(i)}>×</button>
          </div>
        ))}
        <button className="btn btn-sm btn-outlined" style={{marginBottom:16}} onClick={addItem}>＋ Agregar ítem</button>

        {/* Totals preview */}
        <div style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"12px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid var(--out)",fontSize:13}}><span style={{color:"var(--on-sur3)"}}>Subtotal</span><span className="mono">RD${subtotal.toLocaleString()}</span></div>
          {form.tipo==="fiscal"&&<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid var(--out)",fontSize:13,color:"var(--sec)"}}><span>ITBIS 18%</span><span className="mono" style={{fontWeight:600}}>RD${itbis.toLocaleString()}</span></div>}
          {form.tipo==="fiscal"&&<div style={{fontSize:10,color:"var(--on-sur3)",marginBottom:4}}>NCF asignado: <b>{form.serie}-{String(ncfSeq[form.serie]||1).padStart(8,"0")}</b></div>}
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:15,fontWeight:700}}><span>Total</span><span className="mono" style={{color:"var(--pri)"}}>RD${total.toLocaleString()}</span></div>
        </div>
        <div className="fld" style={{marginTop:12}}><label>Notas</label><textarea value={form.notas} onChange={sf("notas")} style={{background:"var(--sur2)",border:"1px solid var(--out)",borderRadius:"var(--r-sm)",padding:"8px 12px",fontFamily:"inherit",fontSize:13,color:"var(--on-sur)",outline:"none",width:"100%",resize:"vertical",minHeight:52}}/></div>
      </div>
      <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setModal(null)}>Cancelar</button><button className="btn btn-filled" onClick={crearFactura}>Crear Factura</button></div>
    </div></div>}

    {/* MODAL: DETALLE */}
    {modal==="detail"&&sel&&(()=>{
      const f=lista.find(x=>x.id===sel.id)||sel;
      const pagado=f.pagos.reduce((s,p)=>s+p.monto,0);
      const pendiente=r2(f.total-pagado);
      return(<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}><div className="modal" style={{maxWidth:620}}>
        <div className="modal-hdr">
          <div><div className="modal-ttl">{f.numero}</div><div style={{fontSize:12,color:"var(--on-sur3)",marginTop:2}}>{f.cliente}{f.rnc?` · RNC: ${f.rnc}`:""}</div></div>
          <span className={`chip ${statusCls[f.estado]||"chip"}`}>{f.estado}</span>
          {f.tipo==="fiscal"&&<span className="chip chip-filled-sec" style={{marginLeft:4}}>NCF {f.ncf}</span>}
          <button className="icon-btn" onClick={()=>setModal(null)}>✕</button>
        </div>
        <div className="modal-bdy">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
            {[["Subtotal",`RD$${f.subtotal.toLocaleString()}`],["ITBIS",f.tipo==="fiscal"?`RD$${f.itbis.toLocaleString()}`:"—"],["Total",`RD$${f.total.toLocaleString()}`],["Pagado",`RD$${pagado.toLocaleString()}`],["Pendiente",pendiente>0?`RD$${pendiente.toLocaleString()}`:"✓ Pagada"],["Fecha",f.fecha]].map(([l,v])=>(
              <div key={l} style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"10px 14px"}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1.5,color:"var(--on-sur3)",marginBottom:4}}>{l}</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:13}}>{v}</div></div>
            ))}
          </div>
          {/* Items */}
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}>
            <thead><tr>{["Descripción","Cant.","Precio","Subtotal"].map(h=>(<th key={h} style={{fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"var(--on-sur3)",padding:"6px 10px",textAlign:"left",borderBottom:"1px solid var(--out)",background:"var(--sur2)"}}>{h}</th>))}</tr></thead>
            <tbody>{f.items.map((it,i)=>(<tr key={i}><td style={{padding:"8px 10px",fontWeight:500}}>{it.desc}</td><td style={{padding:"8px 10px",textAlign:"center"}}>{it.cant}</td><td style={{padding:"8px 10px",fontFamily:"'JetBrains Mono',monospace"}}>RD${r2(it.precio).toLocaleString()}</td><td style={{padding:"8px 10px",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:"var(--pri)"}}>RD${it.subtotal.toLocaleString()}</td></tr>))}</tbody>
          </table>
          {/* Payment history */}
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:"var(--on-sur3)",marginBottom:8}}>Pagos recibidos</div>
          {f.pagos.length===0&&<div style={{fontSize:13,color:"var(--on-sur4)",padding:"10px 0",marginBottom:8}}>Sin pagos registrados</div>}
          {f.pagos.map((p,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 12px",background:"var(--sur2)",borderRadius:"var(--r-sm)",marginBottom:5,fontSize:13}}><span style={{color:"var(--on-sur3)"}}>{p.fecha} · {p.metodo}{p.ref?` · ${p.ref}`:""}</span><span className="mono" style={{fontWeight:600,color:"var(--sec)"}}>RD${parseFloat(p.monto).toLocaleString()}</span></div>))}
          {/* Estado quick change */}
          <div style={{marginTop:12}}>
            <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:"var(--on-sur3)",marginBottom:8}}>Cambiar estado</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {["Pendiente","Parcial","Pagada","Vencida"].map(s=>(
                <button key={s} className={`btn btn-sm ${f.estado===s?"btn-filled":"btn-outlined"}`} onClick={()=>{setLista(l=>l.map(x=>x.id===f.id?{...x,estado:s}:x));setSel(p=>({...p,estado:s}));}}>{s}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-ftr">
          <button className="btn btn-text" onClick={()=>setModal(null)}>Cerrar</button>
          <button className="btn btn-outlined" onClick={()=>{setPagoForm({fecha:new Date().toISOString().slice(0,10),monto:pendiente,metodo:"Transferencia",ref:""});setModal("pago");}}>💳 Registrar Pago</button>
          <button className="btn btn-filled" onClick={()=>genFactPDF(f,brand)}>⬇ Descargar PDF</button>
        </div>
      </div></div>);
    })()}

    {/* MODAL: PAGO */}
    {modal==="pago"&&sel&&<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)setModal("detail")}}><div className="modal" style={{maxWidth:420}}>
      <div className="modal-hdr"><div className="modal-ttl">Registrar Pago</div><button className="icon-btn" onClick={()=>setModal("detail")}>✕</button></div>
      <div className="modal-bdy">
        <div style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"10px 14px",marginBottom:14,fontSize:13}}><b>{sel.cliente}</b> · <span className="mono">RD${sel.total.toLocaleString()}</span></div>
        <div className="fgrid f2" style={{gap:12}}>
          <div className="fld"><label>Fecha</label><input type="date" value={pagoForm.fecha} onChange={e=>setPagoForm(f=>({...f,fecha:e.target.value}))}/></div>
          <div className="fld"><label>Monto (RD$)</label><input type="number" value={pagoForm.monto} onChange={e=>setPagoForm(f=>({...f,monto:e.target.value}))}/></div>
          <div className="fld"><label>Método</label><select value={pagoForm.metodo} onChange={e=>setPagoForm(f=>({...f,metodo:e.target.value}))}><option>Transferencia</option><option>Efectivo</option><option>Tarjeta</option><option>Cheque</option></select></div>
          <div className="fld"><label>Referencia</label><input value={pagoForm.ref} onChange={e=>setPagoForm(f=>({...f,ref:e.target.value}))} placeholder="TRF-XXX"/></div>
        </div>
      </div>
      <div className="modal-ftr"><button className="btn btn-text" onClick={()=>setModal("detail")}>Cancelar</button><button className="btn btn-filled" onClick={registrarPago}>Guardar Pago</button></div>
    </div></div>}
  </div>);
}

const DEFAULT_BRAND={
  nombre:"Mi Empresa",
  slogan:"Sistema de Gestión de Ventanas",
  logo:"",           // base64 data URL
  colorPri:"#1a73e8",
  colorSec:"#188038",
  iniciales:"ME",
};

function BrandSettings({brand,setBrand,onClose}){
  const [form,setForm]=useState({...brand});
  const sf=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  function handleLogo(e){
    const file=e.target.files[0];
    if(!file)return;
    if(file.size>500000){alert("El logo debe ser menor a 500KB");return;}
    const reader=new FileReader();
    reader.onload=ev=>setForm(f=>({...f,logo:ev.target.result}));
    reader.readAsDataURL(file);
  }

  function save(){
    setBrand({...form});
    // persist to localStorage
    localStorage.setItem("vbrand",JSON.stringify({...form}));
    onClose();
  }

  // Live preview colors
  const previewStyle={
    "--pri":form.colorPri,
    "--pri-dk":form.colorPri,
    "--pri-lt":form.colorPri+"22",
    "--pri-lt2":form.colorPri+"33",
  };

  return(<div className="modal-bd" onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal" style={{maxWidth:560}}>
    <div className="modal-hdr">
      <div className="modal-ttl">🎨 Personalizar mi Empresa</div>
      <button className="icon-btn" onClick={onClose}>✕</button>
    </div>
    <div className="modal-bdy">
      <div style={{background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"12px 14px",marginBottom:16,fontSize:12,color:"var(--on-sur3)"}}>
        Estos datos aparecen en el logo del menú, en los PDFs y en las facturas que generes.
      </div>

      {/* Logo upload */}
      <div style={{marginBottom:18}}>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:"var(--on-sur3)",marginBottom:10}}>Logo de la empresa</div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          {/* Preview */}
          <div style={{width:72,height:72,borderRadius:12,background:form.logo?"transparent":form.colorPri,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",border:"2px solid var(--out)",flexShrink:0}}>
            {form.logo
              ?<img src={form.logo} style={{width:"100%",height:"100%",objectFit:"contain"}} alt="logo"/>
              :<span style={{fontSize:22,fontWeight:700,color:"#fff"}}>{form.iniciales.slice(0,2)}</span>}
          </div>
          <div style={{flex:1}}>
            <label style={{display:"block",background:"var(--pri-lt)",color:"var(--pri)",border:"1px solid var(--pri-lt2)",borderRadius:"var(--rfull)",padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer",textAlign:"center",marginBottom:8}}>
              📁 Subir Logo (PNG, JPG · máx 500KB)
              <input type="file" accept="image/*" style={{display:"none"}} onChange={handleLogo}/>
            </label>
            {form.logo&&<button style={{width:"100%",background:"var(--err-lt)",color:"var(--err)",border:"1px solid #fad2cf",borderRadius:"var(--rfull)",padding:"6px 16px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>setForm(f=>({...f,logo:""}))}>🗑️ Quitar logo</button>}
            <div style={{fontSize:11,color:"var(--on-sur4)",marginTop:6,textAlign:"center"}}>Si no subes logo, se muestran tus iniciales</div>
          </div>
        </div>
      </div>

      <div className="fgrid f2" style={{gap:14}}>
        <div className="fld" style={{gridColumn:"1/-1"}}><label>Nombre de la Empresa *</label>
          <input value={form.nombre} onChange={sf("nombre")} placeholder="Aluminios del Norte SRL"/>
        </div>
        <div className="fld" style={{gridColumn:"1/-1"}}><label>Slogan / Descripción</label>
          <input value={form.slogan} onChange={sf("slogan")} placeholder="Fabricación de Ventanas y Puertas"/>
        </div>
        <div className="fld"><label>Iniciales (sin logo)</label>
          <input value={form.iniciales} onChange={sf("iniciales")} placeholder="AN" maxLength={3}/>
        </div>
        <div className="fld"><label>Color principal</label>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="color" value={form.colorPri} onChange={sf("colorPri")} style={{width:44,height:36,padding:2,borderRadius:6,border:"1px solid var(--out)",cursor:"pointer"}}/>
            <input value={form.colorPri} onChange={sf("colorPri")} placeholder="#1a73e8" style={{flex:1,fontFamily:"'JetBrains Mono',monospace"}}/>
          </div>
        </div>

        {/* Color presets */}
        <div style={{gridColumn:"1/-1"}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:"var(--on-sur3)",marginBottom:8}}>Paletas rápidas</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[
              {name:"Azul Google",c:"#1a73e8"},
              {name:"Verde",c:"#188038"},
              {name:"Naranja",c:"#e37400"},
              {name:"Rojo",c:"#d93025"},
              {name:"Morado",c:"#7c3aed"},
              {name:"Gris oscuro",c:"#3c4043"},
              {name:"Negro",c:"#202124"},
              {name:"Dorado",c:"#b45309"},
            ].map(p=>(
              <button key={p.c} title={p.name}
                style={{width:28,height:28,borderRadius:"50%",background:p.c,border:form.colorPri===p.c?"3px solid var(--on-sur)":"3px solid transparent",cursor:"pointer",transition:"border .15s"}}
                onClick={()=>setForm(f=>({...f,colorPri:p.c}))}/>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div style={{gridColumn:"1/-1",background:"var(--sur2)",borderRadius:"var(--r-sm)",padding:"14px 16px"}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:"var(--on-sur3)",marginBottom:10}}>Vista previa del menú</div>
          <div style={{display:"flex",alignItems:"center",gap:12,background:"#202124",borderRadius:8,padding:"10px 14px"}}>
            <div style={{width:36,height:36,borderRadius:8,background:form.logo?"transparent":form.colorPri,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
              {form.logo?<img src={form.logo} style={{width:"100%",height:"100%",objectFit:"contain"}} alt="logo"/>:<span style={{fontSize:14,fontWeight:700,color:"#fff"}}>{form.iniciales.slice(0,2)}</span>}
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:600,color:"#fff"}}>{form.nombre||"Mi Empresa"}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:2,marginTop:2}}>{form.slogan||"Slogan"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="modal-ftr">
      <button className="btn btn-text" onClick={onClose}>Cancelar</button>
      <button className="btn btn-filled" style={{background:form.colorPri}} onClick={save}>Guardar y Aplicar</button>
    </div>
  </div></div>);
}

export default function App(){
  const [ok,setOk]=useState(()=>isLoggedIn());
  const [page,setPage]=useState("dash");
  const [ci,setCi]=useState(null);
  const [expanded,setExpanded]=useState(true);
  const [showBrand,setShowBrand]=useState(false);

  // Load brand from localStorage or use defaults
  const [brand,setBrand]=useState(()=>{
    try{const b=localStorage.getItem("vbrand");return b?JSON.parse(b):DEFAULT_BRAND;}
    catch{return DEFAULT_BRAND;}
  });

  // Apply brand color to CSS variable
  const brandStyle={"--pri":brand.colorPri,"--pri-dk":brand.colorPri,"--pri-lt":brand.colorPri+"22","--pri-lt2":brand.colorPri+"44"};

  function go(p,sub=null){setPage(p);setCi(sub);}

  function render(){
    if(page==="dash")return <Dashboard onNav={go}/>;
    if(page==="calc")return <Calculadoras init={ci}/>;
    if(page==="cli")return <Clientes/>;
    if(page==="prov")return <Proveedores/>;
    if(page==="alm")return <Almacen/>;
    if(page==="pre")return <Precios/>;
    if(page==="pres")return <Presupuestos onNav={go}/>;
    if(page==="ord")return <Ordenes/>;
    if(page==="lic")return <Licencias/>;
    if(page==="ref")return <Referidos/>;
    if(page==="fac")return <Facturacion brand={brand}/>;
    const n=NAV.find(x=>x.id===page);
    return <ComingSoon name={TT[page]} icon={n?.icon||"🔧"}/>;
  }

  if(!ok)return <><style>{G}</style><LicenseScreen brand={brand} onUnlock={()=>setOk(true)}/></>;

  return(<><style>{G}</style>
    <div className="shell" style={brandStyle}>
      {/* Navigation Rail */}
      <nav className={`nav-rail${expanded?" expanded":""}`}>
        <div className="rail-header">
          {/* Brand logo */}
          <div className="rail-logo" onClick={()=>setExpanded(e=>!e)} title={expanded?"Colapsar menú":"Expandir menú"}
            style={{background:brand.logo?"transparent":brand.colorPri,overflow:"hidden"}}>
            {brand.logo
              ?<img src={brand.logo} style={{width:"100%",height:"100%",objectFit:"contain",borderRadius:"50%"}} alt="logo"/>
              :<span style={{fontSize:14,fontWeight:700,color:"#fff"}}>{brand.iniciales.slice(0,2)}</span>}
          </div>
          {expanded&&<div>
            <div className="rail-wordmark">{brand.nombre}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,.3)",letterSpacing:1,marginTop:1}}>{brand.slogan}</div>
          </div>}
        </div>
        <div className="sb-nav" style={{width:"100%",padding:"4px 8px",flex:1,overflowY:"auto"}}>
          {NAV.map((item,i)=>{
            if(item.divider)return <div key={i} className="nav-divider"/>;
            return(
              <div key={item.id} className={"ni"+(page===item.id?" on":"")} onClick={()=>go(item.id)} title={item.label}>
                <span className="ni-icon">{item.icon}</span>
                <span className="ni-lbl">{item.label}</span>
                {item.badge&&<span className={`ni-badge ${item.bg||""}`}>{item.badge}</span>}
              </div>
            );
          })}
        </div>
        <div className="sb-user-row">
          {/* Branding button */}
          {expanded&&<button onClick={()=>setShowBrand(true)} style={{width:"100%",padding:"8px 10px",background:"transparent",border:"1px dashed rgba(255,255,255,.2)",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:6,display:"flex",alignItems:"center",gap:8,transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.2)"}>
            🎨 <span>Personalizar marca</span>
          </button>}
          <div className="sb-user" onClick={()=>{logout();setOk(false);}}>
            <div className="sb-av" style={{background:brand.colorPri,overflow:"hidden"}}>
              {brand.logo?<img src={brand.logo} style={{width:"100%",height:"100%",objectFit:"contain"}} alt="logo"/>:<span style={{fontSize:11}}>{brand.iniciales.slice(0,2)}</span>}
            </div>
            <div className="sb-info">
              <div className="sb-un">{brand.nombre}</div>
              <div className="sb-ur">Cerrar sesión</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{TT[page]}</div>
          <div className="topbar-search">
            <span style={{color:"var(--on-sur4)",fontSize:16}}>🔍</span>
            <input placeholder={`Buscar en ${brand.nombre}...`}/>
          </div>
          <button className="icon-btn" title="Notificaciones">🔔</button>
          <div onClick={()=>setShowBrand(true)} title="Personalizar marca" style={{width:36,height:36,borderRadius:"50%",background:brand.logo?"transparent":brand.colorPri,overflow:"hidden",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {brand.logo?<img src={brand.logo} style={{width:"100%",height:"100%",objectFit:"contain"}} alt="logo"/>:<span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{brand.iniciales.slice(0,2)}</span>}
          </div>
        </div>
        <div className="content">
          <div style={{height:16}}/>
          {render()}
        </div>
      </div>
    </div>
    {showBrand&&<BrandSettings brand={brand} setBrand={setBrand} onClose={()=>setShowBrand(false)}/>}
  </>);
}
