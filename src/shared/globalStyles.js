// Reused from the original Ventaneros app — proven, working styles.
export const G = `
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

/* ── DARK THEME ── */
[data-theme="dark"]{
  --sur:#1e1e2e;--sur2:#252538;--sur3:#2e2e45;--sur4:#383852;--sur5:#42425e;
  --on-sur:#e2e2f0;--on-sur2:#c4c4d8;--on-sur3:#9090aa;--on-sur4:#6a6a84;
  --out:#3a3a54;--out2:#4a4a68;
  --pri-light:#1a3a6e;--pri-light2:#1a3060;--pri-dark:#60a0ff;
  --sec-light:#1a3a28;
  --err-light:#3a1a1a;
  --warn-light:#3a2e00;
  --sh1:0 1px 2px rgba(0,0,0,.5),0 1px 3px 1px rgba(0,0,0,.3);
  --sh2:0 1px 2px rgba(0,0,0,.5),0 2px 6px 2px rgba(0,0,0,.3);
  --sh3:0 4px 8px 3px rgba(0,0,0,.4),0 1px 3px rgba(0,0,0,.5);
}
[data-theme="dark"] html,[data-theme="dark"] body,[data-theme="dark"] #root{background:var(--sur2)}
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
.nav-cat-label{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.35);padding:14px 12px 6px;}
.nav-cat-label:first-child{padding-top:6px}
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
.btn-sm-ghost{background:none;border:none;cursor:pointer;font-size:16px;padding:4px 6px;border-radius:6px;transition:background .15s}
.btn-sm-ghost:hover{background:var(--sur3)}
.btn-full{width:100%}
.toast-msg{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#202124;color:#fff;padding:10px 22px;border-radius:var(--rfull);font-size:13px;font-weight:500;z-index:9999;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.25);animation:toast-in .2s ease}
@keyframes toast-in{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
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
