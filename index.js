// index.js
var index_default = {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    return new Response(HTML, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache"
      }
    });
  }
};
var HTML = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>\u0645\u064A\u0632\u0627\u0646 \xB7 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0642\u0648\u0627\u0626\u0645 \u0627\u0644\u0645\u0627\u0644\u064A\u0629</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"><\/script>
<style>
:root{
  --bg:#080c14;--s1:#0c1220;--s2:#101828;
  --glass:rgba(255,255,255,.04);--glass2:rgba(255,255,255,.07);
  --b:rgba(255,255,255,.08);--b2:rgba(255,255,255,.13);
  --blue:#5b9cf6;--blue2:#2563eb;--blue3:#1e40af;
  --teal:#14b8a6;--indigo:#818cf8;
  --green:#8b9ab0;--red:#f87171;
  --w:#f0f4ff;--d:#6b7a99;
  --f:-apple-system,"SF Arabic",Tahoma,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html{scroll-behavior:smooth;scroll-snap-type:y mandatory}
body{font-family:var(--f);background:var(--bg);color:var(--w);min-height:100vh;overflow-x:hidden}
.screen{display:none}.screen.on{display:block;animation:ri .4s ease}
@keyframes ri{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.nav{position:fixed;top:0;inset-inline:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:0 22px;height:58px;background:rgba(8,12,20,.9);backdrop-filter:blur(24px);border-bottom:1px solid var(--b)}
.nlogo{display:flex;align-items:center;gap:10px}
.nmark{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,var(--blue2),var(--blue3));display:grid;place-items:center;color:#fff;font-weight:900;font-size:14px;box-shadow:0 0 16px rgba(91,156,246,.3)}
.nname{font-size:16px;font-weight:900;letter-spacing:-.2px}
.npill{font-size:9px;font-weight:800;letter-spacing:.18em;padding:4px 10px;border-radius:20px;background:rgba(91,156,246,.1);color:var(--blue);border:1px solid rgba(91,156,246,.22)}
#landing{padding-top:58px}
.snap{scroll-snap-align:start;min-height:100svh;display:flex;flex-direction:column;justify-content:center;padding:44px 22px 36px;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 100% 60% at 50% -10%,rgba(91,156,246,.12),transparent 60%),radial-gradient(ellipse 60% 40% at 90% 90%,rgba(129,140,248,.06),transparent 60%)}
.hero-grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:52px 52px;mask-image:radial-gradient(ellipse 80% 55% at 50% 0%,black,transparent)}
.hero-tag{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:700;letter-spacing:.18em;color:var(--teal);background:rgba(20,184,166,.08);border:1px solid rgba(20,184,166,.2);padding:6px 13px;border-radius:20px;margin-bottom:24px;position:relative;z-index:1}
.hero-tag::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--teal);animation:bl 2s infinite}
@keyframes bl{0%,100%{opacity:1}50%{opacity:.2}}
.hero-h{font-size:46px;font-weight:900;line-height:1.05;letter-spacing:-1.8px;margin-bottom:18px;position:relative;z-index:1}
.g1{background:linear-gradient(135deg,var(--w),rgba(240,244,255,.7));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.g2{background:linear-gradient(135deg,var(--blue),#93c5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.g3{background:linear-gradient(135deg,var(--teal),#5eead4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-p{color:var(--d);font-size:15px;line-height:1.8;margin-bottom:20px;max-width:340px;position:relative;z-index:1}
.hero-p strong{color:var(--w)}
.socpa-ref{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--d);background:var(--glass);border:1px solid var(--b2);padding:7px 12px;border-radius:10px;margin-bottom:28px;position:relative;z-index:1}
.socpa-ref span{color:var(--w);font-weight:700}
.btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:17px;border-radius:15px;font-family:var(--f);font-size:15px;font-weight:800;border:none;cursor:pointer;transition:.15s;position:relative;z-index:1}
.btn:active{opacity:.85;transform:scale(.98)}.btn:disabled{opacity:.35;cursor:not-allowed}
.bp{background:linear-gradient(135deg,var(--blue),var(--blue3));color:#fff;box-shadow:0 4px 22px rgba(91,156,246,.28)}
.bg2{background:var(--glass2);border:1px solid var(--b2);color:var(--w);margin-top:10px}
.fcard{border-radius:24px;overflow:hidden;background:linear-gradient(160deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid var(--b2);padding:26px 22px 22px;position:relative}
.fcard-glow{position:absolute;width:180px;height:180px;border-radius:50%;top:-60px;right:-40px;filter:blur(60px);pointer-events:none;opacity:.35}
.ftag{font-size:9px;font-weight:800;letter-spacing:.2em;margin-bottom:10px;padding:4px 10px;border-radius:20px;display:inline-block}
.ftag-blue{background:rgba(91,156,246,.1);color:var(--blue);border:1px solid rgba(91,156,246,.22)}
.ftag-teal{background:rgba(20,184,166,.1);color:var(--teal);border:1px solid rgba(20,184,166,.22)}
.ftag-ind{background:rgba(129,140,248,.1);color:var(--indigo);border:1px solid rgba(129,140,248,.22)}
.fh{font-size:22px;font-weight:900;letter-spacing:-.5px;margin-bottom:8px}
.fb{color:var(--d);font-size:14px;line-height:1.75;margin-bottom:16px}
.fchecks{display:flex;flex-direction:column;gap:9px;margin-bottom:18px}
.fcheck{display:flex;align-items:center;gap:10px;font-size:13px}
.fckd{width:20px;height:20px;border-radius:50%;flex-shrink:0;background:rgba(139,154,176,.1);border:1px solid rgba(139,154,176,.2);display:grid;place-items:center;font-size:10px;color:var(--green)}
.mock{background:rgba(0,0,0,.35);border-radius:14px;padding:13px;border:1px solid rgba(255,255,255,.06)}
.mt{font-size:9px;color:var(--d);margin-bottom:9px;font-weight:700;letter-spacing:.1em}
.mbars{display:flex;align-items:flex-end;gap:5px;height:50px}
.mb{flex:1;border-radius:3px 3px 0 0}
.mls{display:flex;gap:5px;margin-top:5px}
.ml{flex:1;text-align:center;font-size:9px;color:var(--d)}
.mkpis{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.mk{background:rgba(0,0,0,.25);border-radius:9px;padding:9px;border:1px solid rgba(255,255,255,.05)}
.mkl{font-size:9px;color:var(--d);margin-bottom:3px}
.mkv{font-size:15px;font-weight:900}
.mkc{font-size:9px;font-weight:700;color:var(--green);margin-top:2px}
.mratios{display:flex;flex-direction:column;gap:5px}
.mr{display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,.2);border-radius:8px;padding:8px 11px;border:1px solid rgba(255,255,255,.05);border-right:3px solid var(--blue)}
.mrl{font-size:10px;color:var(--d)}.mrv{font-size:14px;font-weight:900;color:var(--blue)}
.cta-snap{scroll-snap-align:start;min-height:65svh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:50px 22px;background:linear-gradient(160deg,rgba(91,156,246,.07),rgba(20,184,166,.03));border-top:1px solid var(--b)}
.ctah{font-size:32px;font-weight:900;letter-spacing:-.8px;margin-bottom:10px}
.ctah em{font-style:normal;background:linear-gradient(135deg,var(--blue),var(--teal));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ctap{color:var(--d);font-size:14px;margin-bottom:28px;line-height:1.8;max-width:300px}
.disc{font-size:11px;color:rgba(107,122,153,.6);margin-top:13px}
.foot{text-align:center;font-size:10px;color:rgba(107,122,153,.3);letter-spacing:.25em;padding:18px;border-top:1px solid var(--b)}
#upload{padding-top:58px}
.wr{padding:20px 20px 60px}
.tnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}
.bk{background:var(--glass2);border:1px solid var(--b);border-radius:50%;width:38px;height:38px;color:var(--w);font-size:17px;cursor:pointer;display:grid;place-items:center;font-family:var(--f)}
.dts{display:flex;gap:5px}
.dt{width:22px;height:3px;background:rgba(255,255,255,.1);border-radius:2px}
.dt.on{background:var(--blue)}
.pgh{font-size:26px;font-weight:900;letter-spacing:-.5px;margin-bottom:6px}
.pgp{color:var(--d);font-size:14px;margin-bottom:22px}
.drop{border:2px dashed rgba(255,255,255,.1);border-radius:16px;padding:30px 20px;text-align:center;cursor:pointer;background:var(--glass);margin-bottom:14px;display:block;transition:.2s}
.drop.ok{border-style:solid;border-color:var(--green);background:rgba(139,154,176,.04)}
.dic{font-size:36px;margin-bottom:10px;display:block}
.dt2{font-weight:700;font-size:14px;margin-bottom:4px}
.ds{font-size:12px;color:var(--d)}
.dfn{font-size:13px;color:var(--green);font-weight:700;word-break:break-all}
input[type=file]{display:none}
.fld{margin-bottom:14px}
.lb{display:block;font-size:12px;font-weight:700;color:var(--d);margin-bottom:6px}
.rq{color:var(--red)}
.inp{width:100%;padding:13px 15px;background:var(--glass2);border:1.5px solid var(--b2);border-radius:12px;color:var(--w);font-family:var(--f);font-size:15px;outline:none;transition:.2s}
.inp:focus{border-color:var(--blue)}
.inp::placeholder{color:rgba(107,122,153,.4)}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{padding:8px 13px;background:var(--glass);border:1px solid var(--b2);border-radius:10px;color:var(--d);font-family:var(--f);font-size:13px;cursor:pointer;font-weight:600;transition:.15s}
.chip.sel{background:rgba(91,156,246,.12);border-color:var(--blue);color:var(--blue)}
.inf{background:rgba(91,156,246,.06);border:1px solid rgba(91,156,246,.18);border-radius:11px;padding:11px 13px;font-size:12px;color:var(--blue);margin-bottom:14px}
#loading{padding-top:58px}
.ldw{text-align:center;padding:80px 20px}
.ring{width:66px;height:66px;border-radius:50%;border:3px solid rgba(91,156,246,.12);border-top-color:var(--blue);animation:sp 1s linear infinite;margin:0 auto 24px}
@keyframes sp{to{transform:rotate(360deg)}}
.ldh{font-size:22px;font-weight:800;margin-bottom:8px}
.lds{color:var(--d);font-size:14px}
.ldst{margin-top:18px;font-size:13px;color:var(--blue);min-height:18px}
.pbw{margin:14px auto 0;width:180px;height:3px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden}
.pbf{height:100%;background:linear-gradient(90deg,var(--blue),#93c5fd);transition:width .5s;width:0%}
#error{padding-top:58px}
.erw{text-align:center;padding:60px 20px}
.eri{font-size:52px;margin-bottom:20px;display:block}
.erh{font-size:22px;font-weight:800;margin-bottom:10px}
.ers{color:var(--d);font-size:14px;margin-bottom:28px;line-height:1.7}
#results{padding-top:58px}
.rw{padding:16px 20px 60px}
.cb{display:flex;align-items:flex-start;gap:10px;border-radius:13px;padding:12px 14px;margin-bottom:14px;font-size:13px;font-weight:700;line-height:1.6}
.cb .ci{font-size:18px;flex-shrink:0}.cb .ct{flex:1}.cb .cs{font-weight:600;font-size:12px;margin-top:3px;opacity:.85}
.ch{background:rgba(139,154,176,.08);border:1px solid rgba(139,154,176,.22);color:rgba(200,210,225,.95)}
.cm{background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.25);color:rgba(253,230,138,.95)}
.cl{background:rgba(248,113,113,.07);border:1px solid rgba(248,113,113,.22);color:rgba(252,165,165,.95)}
.cws{margin:5px 0 0;padding:0;list-style:none}
.cws li{font-size:11px;font-weight:600;padding:2px 0;padding-right:15px;position:relative;opacity:.9}
.cws li::before{content:'\u26A0';position:absolute;right:0}
.rh{background:linear-gradient(145deg,rgba(91,156,246,.14),rgba(37,99,235,.06));border:1px solid rgba(91,156,246,.22);border-radius:20px;padding:20px;margin-bottom:16px;position:relative;overflow:hidden}
.rh::before{content:'';position:absolute;top:-40px;left:-40px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(91,156,246,.07),transparent);pointer-events:none}
.rco{font-size:22px;font-weight:900;margin-bottom:4px;letter-spacing:-.3px}
.rp{font-size:10px;letter-spacing:.18em;opacity:.45;margin-bottom:12px;text-transform:uppercase}
.rs{background:rgba(0,0,0,.2);border-right:3px solid rgba(91,156,246,.5);padding:11px 13px;border-radius:0 9px 9px 0;font-size:13px;line-height:1.75}
.ey{display:flex;align-items:center;gap:8px;font-size:10px;font-weight:800;color:var(--blue);letter-spacing:.2em;margin:20px 0 10px;text-transform:uppercase}
.ey::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.05)}
.kg{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.kc{background:linear-gradient(145deg,var(--glass2),var(--glass));border:1px solid var(--b2);border-radius:15px;padding:14px}
.kl{font-size:11px;color:var(--d);margin-bottom:6px;line-height:1.4}
.kv{font-size:19px;font-weight:900;letter-spacing:-.3px;line-height:1.2;word-break:break-all}
.ku{font-size:10px;color:var(--d);margin-top:3px}
.kch{font-size:11px;font-weight:700;margin-top:6px;display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:6px}
.kch.up{background:rgba(139,154,176,.1);color:var(--green)}
.kch.down{background:rgba(248,113,113,.1);color:var(--red)}
.kch.flat{background:rgba(255,255,255,.06);color:var(--d)}
.si{display:inline-block;width:13px;height:13px;line-height:13px;text-align:center;font-size:9px;border-radius:50%;background:rgba(91,156,246,.15);color:var(--blue);font-weight:800;cursor:help;margin-right:3px;font-style:normal}
.ri2{background:var(--glass);border:1px solid var(--b2);border-radius:13px;padding:13px;border-right:3px solid var(--blue);margin-bottom:8px}
.rih{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px}
.ril{font-size:13px;font-weight:700}.riv{font-size:20px;font-weight:900;color:var(--blue)}
.rip{font-size:11px;color:var(--d)}.rin{font-size:12px;color:var(--d);margin-top:4px;line-height:1.6}
.ris{font-size:10px;color:rgba(107,122,153,.6);margin-top:3px}
.fct{font-size:12px;font-weight:800;color:var(--blue);margin-bottom:5px;margin-top:4px}
.ft{width:100%;border-collapse:collapse;background:var(--glass);border:1px solid var(--b);border-radius:12px;overflow:hidden;margin-bottom:12px}
.ft th{font-size:11px;color:var(--d);font-weight:700;padding:7px 10px;text-align:right;background:rgba(255,255,255,.03);border-bottom:1px solid var(--b)}
.ft td{font-size:12px;padding:8px 10px;text-align:right;border-bottom:1px solid rgba(255,255,255,.03)}
.ft tr:last-child td{border-bottom:none}
.ft tr.subtotal td{font-weight:800;background:rgba(91,156,246,.05)}
.fc{color:var(--blue);font-weight:800}.fp{color:var(--d)}.fu{color:rgba(107,122,153,.5);font-size:11px}
.cc{background:var(--glass);border:1px solid var(--b2);border-radius:14px;padding:14px;margin-bottom:12px}
.ct2{font-size:11px;color:var(--d);font-weight:600;margin-bottom:11px}
.cpl{display:flex;gap:12px;margin-bottom:12px;justify-content:flex-end}
.cpi{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--d)}
.cpd{width:8px;height:8px;border-radius:50%}
.cpg{margin-bottom:10px}.cgl{font-size:12px;color:var(--d);margin-bottom:4px;font-weight:600}
.ctr{background:rgba(255,255,255,.04);border-radius:5px;overflow:hidden;height:23px;margin-bottom:4px}
.cfi{height:100%;border-radius:5px;display:flex;align-items:center;padding-right:9px;min-width:25px;transition:width .6s}
.cfv{color:#fff;font-size:11px;font-weight:800;white-space:nowrap}
.dw{display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:center;padding:4px 0}
.dl{flex:1;min-width:130px}
.dr{display:flex;align-items:center;gap:7px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:12px}
.dr:last-child{border-bottom:none}
.dd{width:8px;height:8px;border-radius:2px;flex-shrink:0}
.dn{flex:1;color:var(--d)}.dpct{color:var(--blue);font-weight:700}
.gsv{width:100%;height:155px;display:block}
.hl{background:var(--glass);border:1px solid var(--b2);border-radius:13px;padding:13px;margin-bottom:14px}
.hi{display:flex;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:13px;line-height:1.6;color:var(--d)}
.hi:last-child{border:none}.hb{color:var(--blue);font-weight:800;flex-shrink:0}
.nb{background:rgba(139,154,176,.06);border:1px solid rgba(139,154,176,.16);border-radius:11px;padding:11px 14px;font-size:12px;color:rgba(200,210,225,.9);margin-bottom:12px;line-height:1.7}
.ii{background:rgba(91,156,246,.05);border:1px solid rgba(91,156,246,.13);border-radius:11px;padding:11px 14px;font-size:13px;margin-bottom:8px;line-height:1.75;color:var(--d)}
.rki{background:rgba(248,113,113,.05);border:1px solid rgba(248,113,113,.14);border-radius:11px;padding:11px 14px;font-size:13px;margin-bottom:8px;line-height:1.7;color:rgba(252,165,165,.85)}
.db{background:rgba(255,255,255,.03);border:1px solid var(--b);border-radius:11px;padding:12px 14px;font-size:12px;color:var(--d);line-height:1.75;margin-bottom:14px}

@media print {
  /* \u2500\u2500\u2500 \u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637 \u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u2500\u2500\u2500 */
  :root {
    --bg:#ffffff; --s1:#f8f9fa; --s2:#f1f3f5;
    --glass:rgba(0,0,0,.03); --glass2:rgba(0,0,0,.05);
    --b:rgba(0,0,0,.1); --b2:rgba(0,0,0,.15);
    --blue:#1a56db; --blue2:#1a56db; --blue3:#1e40af;
    --teal:#0d9488; --indigo:#6366f1;
    --green:#166534; --red:#991b1b;
    --w:#111827; --d:#4b5563;
    --profit-pos:#166534; --profit-neg:#991b1b;
  }

  /* \u2500\u2500\u2500 \u0625\u062E\u0641\u0627\u0621 \u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0634\u0627\u0634\u0629 \u2500\u2500\u2500 */
  .nav, #landing, #upload, #loading, #error,
  .btn, .bk, .dts, .foot, .disc, .hero-bg, .hero-grid,
  .fcard-glow, .hero-tag, button { display:none !important; }

  /* \u2500\u2500\u2500 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0635\u0641\u062D\u0629 \u2500\u2500\u2500 */
  @page { margin: 20mm 15mm; size: A4; }
  html, body { background:#fff !important; color:#111827 !important; font-size:13px; }
  #results { padding-top: 0 !important; display:block !important; }
  .rw { padding: 0 !important; }

  /* \u2500\u2500\u2500 \u0634\u0631\u064A\u0637 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u2500\u2500\u2500 */
  .nav-print {
    display:flex !important;
    align-items:center;
    justify-content:space-between;
    border-bottom:2px solid #1a56db;
    padding-bottom:10px;
    margin-bottom:20px;
  }

  /* \u2500\u2500\u2500 \u0628\u0637\u0627\u0642\u0627\u062A KPI \u2500\u2500\u2500 */
  .kg { grid-template-columns:1fr 1fr 1fr 1fr !important; gap:8px !important; }
  .kc {
    background:#f8f9fa !important;
    border:1px solid #e5e7eb !important;
    border-radius:8px !important;
    padding:10px !important;
    break-inside:avoid;
  }
  .kv { color:#111827 !important; font-size:16px !important; }
  .kl { color:#6b7280 !important; }
  .ku { color:#9ca3af !important; }

  /* \u2500\u2500\u2500 \u0627\u0644\u0623\u0631\u0628\u0627\u062D \u0648\u0627\u0644\u062E\u0633\u0627\u0626\u0631 \u2014 \u0644\u0648\u0646 \u062A\u0639\u0628\u064A\u0631\u064A \u2500\u2500\u2500 */
  .kch.up { background:#dcfce7 !important; color:#166534 !important; border-radius:4px; padding:2px 6px; }
  .kch.down { background:#fee2e2 !important; color:#991b1b !important; border-radius:4px; padding:2px 6px; }

  /* \u2500\u2500\u2500 \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u0643\u0628\u064A\u0631\u0629 \u0627\u0644\u0625\u064A\u062C\u0627\u0628\u064A\u0629 \u2500\u2500\u2500 */
  .kv.pos, .riv.pos { color:#166534 !important; }
  .kv.neg, .riv.neg { color:#991b1b !important; }

  /* \u2500\u2500\u2500 \u0627\u0644\u0646\u0633\u0628 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u2500\u2500\u2500 */
  .ri2 {
    background:#f8f9fa !important;
    border:1px solid #e5e7eb !important;
    border-right:3px solid #1a56db !important;
    border-radius:6px !important;
    padding:10px 12px !important;
    margin-bottom:6px !important;
    break-inside:avoid;
  }
  .riv { color:#1a56db !important; }
  .ril { color:#111827 !important; }
  .rin { color:#4b5563 !important; }

  /* \u2500\u2500\u2500 \u0627\u0644\u062C\u062F\u0627\u0648\u0644 \u2500\u2500\u2500 */
  .ft { border:1px solid #e5e7eb !important; }
  .ft th { background:#f1f3f5 !important; color:#374151 !important; }
  .ft td { color:#111827 !important; border-bottom:1px solid #f3f4f6 !important; }
  .fc { color:#1a56db !important; }

  /* \u2500\u2500\u2500 \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u062E\u0636\u0631\u0627\u0621 (\u0625\u064A\u062C\u0627\u0628\u064A\u0629) \u2500\u2500\u2500 */
  .fc-pos { color:#166534 !important; font-weight:800; }
  /* \u2500\u2500\u2500 \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u062D\u0645\u0631\u0627\u0621 (\u0633\u0627\u0644\u0628\u0629) \u2500\u2500\u2500 */
  .fc-neg { color:#991b1b !important; font-weight:800; }

  /* \u2500\u2500\u2500 \u0635\u0646\u062F\u0648\u0642 \u0627\u0644\u0645\u0648\u062B\u0648\u0642\u064A\u0629 \u2500\u2500\u2500 */
  .cb { border-radius:8px !important; break-inside:avoid; }
  .ch { background:#f0fdf4 !important; border-color:#86efac !important; color:#166534 !important; }
  .cm { background:#fffbeb !important; border-color:#fcd34d !important; color:#92400e !important; }
  .cl { background:#fef2f2 !important; border-color:#fca5a5 !important; color:#991b1b !important; }

  /* \u2500\u2500\u2500 \u0627\u0644\u0631\u0623\u0633 \u0627\u0644\u0631\u0626\u064A\u0633\u064A \u2500\u2500\u2500 */
  .rh {
    background:#eff6ff !important;
    border:1px solid #bfdbfe !important;
    border-radius:12px !important;
    break-inside:avoid;
  }
  .rco { color:#1e3a8a !important; }
  .rs { background:#dbeafe !important; border-right:3px solid #1a56db !important; color:#1e3a8a !important; }

  /* \u2500\u2500\u2500 \u0627\u0644\u0645\u062E\u0627\u0637\u0631 \u2500\u2500\u2500 */
  .rki { background:#fff7ed !important; border-color:#fed7aa !important; color:#9a3412 !important; }
  .hl { background:#f8f9fa !important; border-color:#e5e7eb !important; }
  .hi { color:#374151 !important; }
  .hb { color:#1a56db !important; }

  /* \u2500\u2500\u2500 \u0627\u0644\u062A\u062F\u0641\u0642\u0627\u062A \u0627\u0644\u0646\u0642\u062F\u064A\u0629 \u0648\u062D\u0642\u0648\u0642 \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u064A\u0646 \u2500\u2500\u2500 */
  .cc { background:#f8f9fa !important; border-color:#e5e7eb !important; }
  .ct2 { color:#374151 !important; }
  .cgl { color:#374151 !important; }

  /* \u2500\u2500\u2500 \u0627\u0644\u0641\u0627\u0635\u0644 \u2500\u2500\u2500 */
  .ey { color:#1a56db !important; }
  .ey::after { background:#e5e7eb !important; }

  /* \u2500\u2500\u2500 \u062A\u062C\u0646\u0628 \u0627\u0644\u0642\u0637\u0639 \u0628\u064A\u0646 \u0627\u0644\u0635\u0641\u062D\u0627\u062A \u2500\u2500\u2500 */
  .ri2, .kc, .cb, .rh, .hl, .cc, .rki, .nb, .ii { break-inside:avoid; }
  .ey { break-before:auto; }

  /* \u2500\u2500\u2500 \u0627\u0644\u0640 footer \u2500\u2500\u2500 */
  .print-footer {
    display:block !important;
    text-align:center;
    font-size:10px;
    color:#9ca3af;
    border-top:1px solid #e5e7eb;
    padding-top:10px;
    margin-top:20px;
  }
}
</style>
</head>
<body>
<nav class="nav">
  <div class="nlogo"><div class="nmark">\u0645</div><div class="nname">\u0645\u064A\u0632\u0627\u0646</div></div>
  <div class="npill">v16 \xB7 SOCPA</div>
</nav>

<div class="screen on" id="landing">
  <div class="snap" style="background:var(--s1)">
    <div class="hero-bg"></div><div class="hero-grid"></div>
    <div class="hero-tag">\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0642\u0648\u0627\u0626\u0645 \u0627\u0644\u0645\u0627\u0644\u064A\u0629</div>
    <h1 class="hero-h"><span class="g1">\u0627\u0642\u0631\u0623</span><br><span class="g2">\u0642\u0648\u0627\u0626\u0645\u0643 \u0627\u0644\u0645\u0627\u0644\u064A\u0629</span><br><span class="g3">\u0628\u0627\u062D\u062A\u0631\u0627\u0641.</span></h1>
    <p class="hero-p">\u0627\u0631\u0641\u0639 PDF \u0644\u0623\u064A \u0634\u0631\u0643\u0629 \u0633\u0639\u0648\u062F\u064A\u0629 \u2190 \u0646\u0633\u062A\u062E\u0631\u062C \u0627\u0644\u0628\u0646\u0648\u062F \u0648\u0646\u062D\u0644\u0651\u0644\u0647\u0627. <strong>\u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0645\u062D\u0633\u0648\u0628\u0629 \u0628\u0631\u0645\u062C\u064A\u064B\u0627\u060C \u0644\u0627 \u062A\u062E\u0645\u064A\u0646.</strong></p>
    <div class="socpa-ref">\u2696\uFE0F \u0645\u0635\u0637\u0644\u062D\u0627\u062A \u0648\u0641\u0642 <span>SOCPA / IFRS</span> \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0641\u064A \u0627\u0644\u0645\u0645\u0644\u0643\u0629</div>
    <button class="btn bp" onclick="go('upload')">\u26A1 \u0627\u0628\u062F\u0623 \u0627\u0644\u062A\u062D\u0644\u064A\u0644</button>
    <button class="btn bg2" onclick="document.getElementById('s2').scrollIntoView({behavior:'smooth'})">\u0627\u0643\u062A\u0634\u0641 \u0627\u0644\u0645\u064A\u0632\u0627\u062A \u2193</button>
  </div>

  <div class="snap" style="background:var(--s2)" id="s2">
    <div class="fcard">
      <div class="fcard-glow" style="background:var(--blue)"></div>
      <div class="ftag ftag-blue">\u0660\u0661 \xB7 \u0627\u0644\u0623\u0631\u0642\u0627\u0645</div>
      <div class="fh">\u0623\u0631\u0642\u0627\u0645 \u062F\u0642\u064A\u0642\u0629 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629</div>
      <div class="fb">\u0646\u0633\u062A\u062E\u0631\u062C \u0627\u0644\u0628\u0646\u0648\u062F \u0645\u0628\u0627\u0634\u0631\u0629 \u0648\u0641\u0642 \u0645\u0635\u0637\u0644\u062D\u0627\u062A SOCPA / IFRS \u2014 Gross Profit\u060C Operating Profit\u060C Net Profit.</div>
      <div class="fchecks">
        <div class="fcheck"><div class="fckd">\u2713</div>\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0631\u0628\u062D\u060C \u0627\u0644\u0631\u0628\u062D \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A\u060C \u0635\u0627\u0641\u064A \u0627\u0644\u0631\u0628\u062D</div>
        <div class="fcheck"><div class="fckd">\u2713</div>EBITDA \u0648\u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643 \u0648\u0627\u0644\u0625\u0637\u0641\u0627\u0621</div>
        <div class="fcheck"><div class="fckd">\u2713</div>\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u062A\u0645\u0648\u064A\u0644 \u0648\u0627\u0644\u0632\u0643\u0627\u0629 \u0648\u0627\u0644\u0636\u0631\u064A\u0628\u0629</div>
      </div>
      <div class="mock">
        <div class="mt">\u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A (\u0645\u0644\u064A\u0627\u0631 \u0631\u064A\u0627\u0644)</div>
        <div class="mbars">
          <div class="mb" style="height:62%;background:linear-gradient(180deg,rgba(91,156,246,.45),rgba(37,99,235,.1))"></div>
          <div class="mb" style="height:70%;background:linear-gradient(180deg,rgba(91,156,246,.45),rgba(37,99,235,.1))"></div>
          <div class="mb" style="height:66%;background:linear-gradient(180deg,rgba(91,156,246,.45),rgba(37,99,235,.1))"></div>
          <div class="mb" style="height:78%;background:linear-gradient(180deg,rgba(91,156,246,.45),rgba(37,99,235,.1))"></div>
          <div class="mb" style="height:100%;background:linear-gradient(180deg,var(--blue),rgba(37,99,235,.25))"></div>
        </div>
        <div class="mls"><div class="ml">Q1</div><div class="ml">Q2</div><div class="ml">Q3</div><div class="ml">Q4</div><div class="ml" style="color:var(--blue)">Q1\u2191</div></div>
      </div>
    </div>
  </div>

  <div class="snap" style="background:var(--s1)">
    <div class="fcard">
      <div class="fcard-glow" style="background:var(--teal)"></div>
      <div class="ftag ftag-teal">\u0660\u0662 \xB7 \u0627\u0644\u062A\u062D\u0644\u064A\u0644</div>
      <div class="fh">\u0642\u0631\u0627\u0621\u0629 \u0645\u062E\u062A\u0635\u0631\u0629 \u0630\u0643\u064A\u0629</div>
      <div class="fb">\u064A\u0631\u0628\u0637 \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0628\u0628\u0639\u0636\u0647\u0627 \u0648\u064A\u0634\u0631\u062D \u0627\u0644\u0641\u0631\u0648\u0642 \u0628\u0644\u063A\u0629 \u0648\u0627\u0636\u062D\u0629 \u2014 \u0644\u0627 \u0645\u062C\u0631\u062F \u0623\u0631\u0642\u0627\u0645.</div>
      <div class="fchecks">
        <div class="fcheck"><div class="fckd">\u2713</div>\u0645\u0642\u0627\u0631\u0646\u0629 \u0646\u0645\u0648 \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0628\u0646\u0645\u0648 \u0627\u0644\u0623\u0631\u0628\u0627\u062D</div>
        <div class="fcheck"><div class="fckd">\u2713</div>\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0647\u0648\u0627\u0645\u0634 \u0648\u062A\u063A\u064A\u0631\u0647\u0627 \u0628\u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0645\u0626\u0648\u064A\u0629</div>
        <div class="fcheck"><div class="fckd">\u2713</div>\u062A\u0641\u0633\u064A\u0631 \u0623\u062B\u0631 \u0645\u0635\u0627\u0631\u064A\u0641 \u0627\u0644\u062A\u0645\u0648\u064A\u0644 \u0648\u0627\u0644\u0632\u0643\u0627\u0629</div>
      </div>
      <div class="mock">
        <div class="mkpis">
          <div class="mk"><div class="mkl">\u0635\u0627\u0641\u064A \u0627\u0644\u0631\u0628\u062D</div><div class="mkv">3.77B</div><div class="mkc">\u25B2 +1.4%</div></div>
          <div class="mk"><div class="mkl">\u0647\u0627\u0645\u0634 \u0627\u0644\u062A\u0634\u063A\u064A\u0644</div><div class="mkv">20.0%</div><div class="mkc">\u25B2 +0.6pt</div></div>
          <div class="mk"><div class="mkl">\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0631\u0628\u062D</div><div class="mkv">9.77B</div><div class="mkc">\u25B2 +7.4%</div></div>
          <div class="mk"><div class="mkl">EBITDA</div><div class="mkv">6.55B</div><div class="mkc">\u25B2 +8.9%</div></div>
        </div>
      </div>
    </div>
  </div>

  <div class="snap" style="background:var(--s2)">
    <div class="fcard">
      <div class="fcard-glow" style="background:var(--indigo)"></div>
      <div class="ftag ftag-ind">\u0660\u0663 \xB7 \u0627\u0644\u0645\u0648\u062B\u0648\u0642\u064A\u0629</div>
      <div class="fh">\u062F\u0631\u062C\u0629 \u0645\u0648\u062B\u0648\u0642\u064A\u0629 \u0627\u0644\u0623\u0631\u0642\u0627\u0645</div>
      <div class="fb">\u0646\u062A\u062D\u0642\u0642 \u0645\u0646 \u062A\u0648\u0627\u0632\u0646 \u0627\u0644\u0642\u0648\u0627\u0626\u0645 \u0642\u0628\u0644 \u0639\u0631\u0636 \u0627\u0644\u0646\u062A\u0627\u0626\u062C \u0648\u0646\u0639\u0637\u064A\u0643 \u062F\u0631\u062C\u0629 \u062B\u0642\u0629 \u0648\u0627\u0636\u062D\u0629.</div>
      <div class="fchecks">
        <div class="fcheck"><div class="fckd">\u2713</div>\u062A\u062D\u0642\u0642 \u0645\u062D\u0627\u0633\u0628\u064A \u062A\u0644\u0642\u0627\u0626\u064A \u0642\u0628\u0644 \u0627\u0644\u0639\u0631\u0636</div>
        <div class="fcheck"><div class="fckd">\u2713</div>\u062F\u0631\u062C\u0629 \u0645\u0648\u062B\u0648\u0642\u064A\u0629: \u0639\u0627\u0644\u064A\u0629 / \u0645\u062A\u0648\u0633\u0637\u0629 / \u0645\u0646\u062E\u0641\u0636\u0629</div>
        <div class="fcheck"><div class="fckd">\u2713</div>\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0639\u0646\u062F \u0627\u0643\u062A\u0634\u0627\u0641 \u062A\u0646\u0627\u0642\u0636\u0627\u062A \u0641\u064A \u0627\u0644\u0623\u0631\u0642\u0627\u0645</div>
      </div>
      <div class="mock">
        <div class="mratios">
          <div class="mr"><span class="mrl">\u0647\u0627\u0645\u0634 \u0635\u0627\u0641\u064A \u0627\u0644\u0631\u0628\u062D</span><span class="mrv">18.9%</span></div>
          <div class="mr"><span class="mrl">\u0647\u0627\u0645\u0634 \u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0631\u0628\u062D</span><span class="mrv">49.0%</span></div>
          <div class="mr"><span class="mrl">\u0647\u0627\u0645\u0634 \u0627\u0644\u0631\u0628\u062D \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A</span><span class="mrv">20.0%</span></div>
        </div>
      </div>
    </div>
  </div>

  <div class="cta-snap">
    <div class="ctah">\u062C\u0627\u0647\u0632\u061F<br><em>\u0627\u0628\u062F\u0623 \u0627\u0644\u0622\u0646.</em></div>
    <div class="ctap">\u0627\u0631\u0641\u0639 PDF \u0645\u0646 \u062A\u062F\u0627\u0648\u0644 \u0623\u0648 \u0645\u0648\u0642\u0639 \u0627\u0644\u0634\u0631\u0643\u0629 \u0648\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u062C\u0627\u0647\u0632 \u0641\u064A \u062B\u0648\u0627\u0646\u064D</div>
    <button class="btn bp" style="max-width:300px" onclick="go('upload')">\u26A1 \u0627\u0628\u062F\u0623 \u0627\u0644\u062A\u062D\u0644\u064A\u0644</button>
    <div class="disc">\u0644\u0627 \u064A\u064F\u062D\u0641\u0638 \u0623\u064A \u0645\u0644\u0641 \xB7 \u0644\u064A\u0633 \u062A\u0648\u0635\u064A\u0629 \u0627\u0633\u062A\u062B\u0645\u0627\u0631\u064A\u0629</div>
  </div>
  <div class="foot">MIZAN \xB7 \u0645\u064A\u0632\u0627\u0646 \xB7 SOCPA / IFRS \xB7 \u0662\u0660\u0662\u0666</div>
</div>

<div class="screen" id="upload">
  <div class="wr">
    <div class="tnav">
      <button class="bk" onclick="go('landing')">\u2192</button>
      <div class="dts"><div class="dt on"></div><div class="dt"></div><div class="dt"></div></div>
      <div style="width:38px"></div>
    </div>
    <div class="pgh">\u0627\u0631\u0641\u0639 \u0627\u0644\u0642\u0627\u0626\u0645\u0629</div>
    <div class="pgp">PDF \u0646\u0635\u0651\u064A \u0645\u0646 \u062A\u062F\u0627\u0648\u0644 \u0623\u0648 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0631\u0633\u0645\u064A</div>
    <label class="drop" id="upZone" for="fileInput">
      <span id="upDefault"><span class="dic">\u{1F4C4}</span><div class="dt2">\u0627\u0636\u063A\u0637 \u0644\u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0644\u0641</div><div class="ds">PDF \u0641\u0642\u0637 \xB7 \u062D\u062A\u0649 10MB</div></span>
      <span id="upSelected" style="display:none"><span class="dic">\u2705</span><div class="dfn" id="fileName"></div><div class="ds" id="fileSize"></div><div style="margin-top:8px;font-size:12px;color:var(--blue)">\u0627\u0636\u063A\u0637 \u0644\u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0645\u0644\u0641</div></span>
    </label>
    <input type="file" id="fileInput" accept="application/pdf,.pdf" onchange="onFile(event)">
    <div class="fld"><label class="lb">\u0627\u0633\u0645 \u0627\u0644\u0634\u0631\u0643\u0629 <span class="rq">*</span></label><input type="text" class="inp" id="company" placeholder="\u0645\u062B\u0644\u0627\u064B: stc\u060C \u0623\u0631\u0627\u0645\u0643\u0648\u060C \u0627\u0644\u0631\u0627\u062C\u062D\u064A..." oninput="check()"></div>
    <div class="fld">
      <label class="lb">\u0627\u0644\u0641\u062A\u0631\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 <span class="rq">*</span></label>
      <div class="chips" id="periodChips">
        <button class="chip" data-period="\u0627\u0644\u0631\u0628\u0639 \u0627\u0644\u0623\u0648\u0644 2026" onclick="pickPeriod(this)">Q1 2026</button>
        <button class="chip" data-period="\u0633\u0646\u0648\u064A 2025" onclick="pickPeriod(this)">\u0633\u0646\u0648\u064A 2025</button>
        <button class="chip" data-period="\u0627\u0644\u0631\u0628\u0639 \u0627\u0644\u0631\u0627\u0628\u0639 2025" onclick="pickPeriod(this)">Q4 2025</button>
        <button class="chip" data-period="\u0627\u0644\u0631\u0628\u0639 \u0627\u0644\u062B\u0627\u0644\u062B 2025" onclick="pickPeriod(this)">Q3 2025</button>
        <button class="chip" data-period="\u0627\u0644\u0631\u0628\u0639 \u0627\u0644\u062B\u0627\u0646\u064A 2025" onclick="pickPeriod(this)">Q2 2025</button>
        <button class="chip" data-period="\u0627\u0644\u0631\u0628\u0639 \u0627\u0644\u0623\u0648\u0644 2025" onclick="pickPeriod(this)">Q1 2025</button>
        <button class="chip" data-period="\u0633\u0646\u0648\u064A 2024" onclick="pickPeriod(this)">\u0633\u0646\u0648\u064A 2024</button>
      </div>
    </div>
    <div class="inf">\u{1F4A1} \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u064A\u0633\u062A\u063A\u0631\u0642 \u0661\u0660\u2013\u0663\u0660 \u062B\u0627\u0646\u064A\u0629. \u0627\u0644\u0645\u0644\u0641 \u0644\u0627 \u064A\u064F\u062D\u0641\u0638.</div>
    <button class="btn bp" id="submitBtn" onclick="analyze()" disabled>\u26A1 \u0627\u0628\u062F\u0623 \u0627\u0644\u062A\u062D\u0644\u064A\u0644</button>
  </div>
</div>

<div class="screen" id="loading">
  <div class="ldw">
    <div class="ring"></div>
    <div class="ldh">\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0644\u064A\u0644...</div>
    <div class="lds">\u0661\u0660\u2013\u0663\u0660 \u062B\u0627\u0646\u064A\u0629</div>
    <div class="ldst" id="loadStep">\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0645\u0644\u0641...</div>
    <div class="pbw"><div class="pbf" id="loadBar"></div></div>
  </div>
</div>

<div class="screen" id="error">
  <div class="erw">
    <span class="eri">\u26A0\uFE0F</span>
    <div class="erh">\u0635\u0627\u0631 \u062E\u0637\u0623</div>
    <div class="ers" id="errMsg">\u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u0644\u0645\u0644\u0641 \u0648\u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u062B\u0627\u0646\u064A\u0629.</div>
    <button class="btn bp" style="max-width:280px;margin:0 auto 10px" onclick="analyze()">\u21BB \u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u062B\u0627\u0646\u064A\u0629</button>
    <button class="btn bg2" style="max-width:280px;margin:0 auto" onclick="go('upload')">\u0631\u062C\u0648\u0639</button>
  </div>
</div>

<div class="screen" id="results">
  <div class="rw">
    <div class="tnav">
      <button class="bk" onclick="reset()">\u2192</button>
      <div class="dts"><div class="dt on"></div><div class="dt on"></div><div class="dt on"></div></div>
      <div style="width:38px"></div>
    </div>
    <div id="confBanner"></div>
    <div class="rh"><div class="rco" id="resCo"></div><div class="rp" id="resPeriod"></div><div class="rs" id="resSummary"></div></div>
    <div class="ey">\u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629</div><div class="kg" id="kpiGrid"></div>
    <div id="aboutSection" style="display:none;margin-top:12px"><div style="background:var(--glass);border:1px solid var(--b2);border-radius:12px;padding:13px;font-size:13px;color:var(--d);line-height:1.8" id="aboutText"></div></div>
    <div id="insightSection" style="display:none"><div class="ey">\u{1F4A1} \u0642\u0631\u0627\u0621\u0629 \u0645\u062E\u062A\u0635\u0631\u0629</div><div id="insightList"></div></div>
    <div id="ratiosSection" style="display:none"><div class="ey">\u0627\u0644\u0646\u0633\u0628 \u0627\u0644\u0645\u0627\u0644\u064A\u0629</div><div id="ratiosList"></div></div>
    <div id="figuresSection" style="display:none"><div class="ey">\u0627\u0644\u0628\u0646\u0648\u062F \u0627\u0644\u062A\u0641\u0635\u064A\u0644\u064A\u0629</div><div id="figuresList"></div></div>
    <div id="growthSection" style="display:none"><div class="ey">\u{1F4C8} \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A</div><div class="cc"><div class="ct2" id="growthTitle"></div><div id="growthWrap"></div></div></div>
    <div id="compareSection" style="display:none"><div class="ey">\u{1F4CA} \u0645\u0642\u0627\u0631\u0646\u0629</div><div class="cc"><div class="ct2" id="compareTitle"></div><div id="compareWrap"></div></div></div>
    <div id="compositionSection" style="display:none"><div class="ey">\u{1F369} \u0627\u0644\u062A\u0631\u0643\u064A\u0628\u0629</div><div class="cc"><div class="ct2" id="compositionTitle"></div><div id="compositionWrap"></div></div></div>
    <div id="cashflowSection" style="display:none"><div class="ey">\u{1F4B5} \u0627\u0644\u062A\u062F\u0641\u0642\u0627\u062A \u0627\u0644\u0646\u0642\u062F\u064A\u0629</div><div class="kg" id="cashflowGrid"></div></div>
    <div id="equitySection" style="display:none"><div class="ey">\u{1F3DB} \u062D\u0642\u0648\u0642 \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u064A\u0646</div><div class="kg" id="equityGrid"></div></div>
    <div id="risksSection" style="display:none"><div class="ey">\u26A0 \u0645\u062E\u0627\u0637\u0631</div><div id="risksList"></div></div>
    <div class="ey">\u0623\u0631\u0642\u0627\u0645 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629</div><div class="hl" id="highlightsList"></div>
    <div class="nb">\u2713 <strong>\u0639\u0631\u0636 \u0645\u0648\u0636\u0648\u0639\u064A \u0644\u0644\u0628\u0646\u0648\u062F \u0643\u0645\u0627 \u0648\u0631\u062F\u062A \u0641\u064A \u0627\u0644\u0642\u0627\u0626\u0645\u0629\u060C \u0648\u0627\u0644\u0646\u0633\u0628 \u0645\u062D\u0633\u0648\u0628\u0629 \u0628\u0631\u0645\u062C\u064A\u064B\u0627.</strong></div>
    <div class="db" id="disclaimerBox"></div>
    <button class="btn bp" style="margin-bottom:10px" onclick="window.print()">\u{1F4E5} \u062A\u062D\u0645\u064A\u0644 PDF</button>
    <button class="btn bg2" onclick="reset()">\u062A\u062D\u0644\u064A\u0644 \u0645\u0644\u0641 \u062B\u0627\u0646\u064A</button>
    <div class="foot" style="margin-top:24px">MIZAN \xB7 \u0645\u064A\u0632\u0627\u0646 \xB7 SOCPA \xB7 \u0662\u0660\u0662\u0666</div>
    <div class="print-footer" style="display:none">\u0645\u064A\u0632\u0627\u0646 \xB7 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0642\u0648\u0627\u0626\u0645 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \xB7 SOCPA / IFRS \xB7 \u0662\u0660\u0662\u0666 \xB7 mizan-clean.fhad779977.workers.dev</div>
  </div>
</div>

<script>
if(typeof pdfjsLib!=='undefined'){pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';}
const WH='https://fahadn.app.n8n.cloud/webhook/mizan-analyze';
const state={file:null,company:'',period:''};
function go(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));document.getElementById(id).classList.add('on');window.scrollTo(0,0);}
function onFile(e){const f=e.target.files[0];if(!f)return;if(f.type!=='application/pdf'&&!f.name.toLowerCase().endsWith('.pdf')){alert('PDF \u0641\u0642\u0637');return;}if(f.size>10485760){alert('\u062D\u062C\u0645 \u0643\u0628\u064A\u0631. \u0627\u0644\u062D\u062F 10MB');return;}state.file=f;document.getElementById('upZone').classList.add('ok');document.getElementById('upDefault').style.display='none';document.getElementById('upSelected').style.display='block';document.getElementById('fileName').textContent=f.name;document.getElementById('fileSize').textContent=(f.size/1048576).toFixed(2)+' MB';check();}
function pickPeriod(b){document.querySelectorAll('#periodChips .chip').forEach(c=>c.classList.remove('sel'));b.classList.add('sel');state.period=b.dataset.period;check();}
function check(){state.company=document.getElementById('company').value.trim();document.getElementById('submitBtn').disabled=!(state.file&&state.company&&state.period);}
function setStep(t,p){document.getElementById('loadStep').textContent=t;if(p!==undefined)document.getElementById('loadBar').style.width=p+'%';}

async function extractPdfText(file){
  const buf=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:buf}).promise;
  const totalPages=pdf.numPages;
  const scanCap=Math.min(totalPages,200); // \u062D\u062F \u0623\u0642\u0635\u0649 \u0644\u0644\u0645\u0633\u062D \u0627\u0644\u0643\u0627\u0645\u0644 \u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0633\u0646\u0648\u064A\u0629 \u0636\u062E\u0645\u0629
  const pageTexts=[];

  // \u0627\u0644\u0645\u0631\u062D\u0644\u0629 1: \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0646\u0635 \u0643\u0644 \u0635\u0641\u062D\u0629 (\u0645\u0631\u062A\u0628 \u062D\u0633\u0628 \u0627\u0644\u0635\u0641\u0648\u0641 \u0648\u0627\u0644\u0623\u0639\u0645\u062F\u0629 \u0644\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0628\u0646\u064A\u0629 \u0627\u0644\u062C\u062F\u0627\u0648\u0644)
  for(let i=1;i<=scanCap;i++){
    const page=await pdf.getPage(i);
    const content=await page.getTextContent();
    const vp=page.getViewport({scale:1});
    const h=vp.height;
    const items=content.items
      .filter(it=>it.str&&it.str.trim())
      .map(it=>({str:it.str,x:it.transform[4],y:Math.round((h-it.transform[5])/8)*8}))
      .sort((a,b)=>a.y-b.y||a.x-b.x);
    const rows={};
    items.forEach(it=>{if(!rows[it.y])rows[it.y]=[];rows[it.y].push(it.str);});
    pageTexts.push(Object.values(rows).map(r=>r.join(' | ')).join('\\n'));
    if(i%5===0||i===scanCap)setStep(\`\u0645\u0633\u062D \u0627\u0644\u0635\u0641\u062D\u0629 \${i} \u0645\u0646 \${scanCap}\`,5+(i/scanCap)*20);
  }

  // \u0627\u0644\u0645\u0631\u062D\u0644\u0629 2: \u062A\u062D\u062F\u064A\u062F \u0635\u0641\u062D\u0627\u062A \u0627\u0644\u0642\u0648\u0627\u0626\u0645 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0639\u0628\u0631 \u0643\u0644\u0645\u0627\u062A \u0645\u0641\u062A\u0627\u062D\u064A\u0629 (\u0645\u0647\u0645 \u0644\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0633\u0646\u0648\u064A\u0629 \u0627\u0644\u0637\u0648\u064A\u0644\u0629)
  const keywords=['\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0627\u0644\u064A','\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062F\u062E\u0644','\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0631\u0628\u062D \u0623\u0648 \u0627\u0644\u062E\u0633\u0627\u0631\u0629','\u0627\u0644\u062A\u062F\u0641\u0642\u0627\u062A \u0627\u0644\u0646\u0642\u062F\u064A\u0629','\u0627\u0644\u062A\u063A\u064A\u0631\u0627\u062A \u064A\u0641 \u062D\u0642\u0648\u0642 \u0627\u0644\u0645\u0644\u0643\u064A\u0629','\u0627\u0644\u062A\u063A\u064A\u0631\u0627\u062A \u0641\u064A \u062D\u0642\u0648\u0642 \u0627\u0644\u0645\u0644\u0643\u064A\u0629'];
  let firstIdx=-1,lastIdx=-1;
  pageTexts.forEach((t,idx)=>{
    if(keywords.some(k=>t.includes(k))){
      if(firstIdx===-1)firstIdx=idx;
      lastIdx=idx;
    }
  });

  let selected;
  if(firstIdx!==-1){
    const start=Math.max(0,firstIdx-1);
    const end=Math.min(pageTexts.length-1,lastIdx+12);
    selected=pageTexts.slice(start,end+1).map((t,i)=>({num:start+i+1,text:t}));
    setStep('\u062A\u0645 \u062A\u062D\u062F\u064A\u062F \u0635\u0641\u062D\u0627\u062A \u0627\u0644\u0642\u0648\u0627\u0626\u0645 \u0627\u0644\u0645\u0627\u0644\u064A\u0629',28);
  }else{
    selected=pageTexts.slice(0,Math.min(30,pageTexts.length)).map((t,i)=>({num:i+1,text:t}));
  }

  let all=selected.map(p=>\`--- \u0635\u0641\u062D\u0629 \${p.num} ---\\n\${p.text}\\n\\n\`).join('');
  if(all.length>70000)all=all.substring(0,70000);

  // \u0643\u0634\u0641 \u0627\u0644\u0635\u0641\u062D\u0627\u062A \u0627\u0644\u0645\u0645\u0633\u0648\u062D\u0629 \u0648\u062A\u062D\u0648\u064A\u0644\u0647\u0627 \u0644\u0635\u0648\u0631 (Vision)
  const scannedImages=[];
  const emptyPages=[];
  pageTexts.forEach((t,idx)=>{if(t.trim().length<100)emptyPages.push(idx+1);});
  // \u0646\u062D\u062F\u062F \u0627\u0644\u0635\u0641\u062D\u0627\u062A \u0627\u0644\u0645\u0645\u0633\u0648\u062D\u0629 \u2014 \u0646\u0623\u062E\u0630 \u0623\u0648\u0644 5 \u0641\u0627\u0636\u064A\u0629 \u0641\u0642\u0637 \u0644\u062A\u062C\u0646\u0628 \u062B\u0642\u0644 \u0627\u0644\u062D\u0645\u0644
  const targetEmpty=emptyPages.slice(0,5);
  if(targetEmpty.length>0){
    setStep(\`\u062A\u062D\u0648\u064A\u0644 \${targetEmpty.length} \u0635\u0641\u062D\u0629 \u0645\u0645\u0633\u0648\u062D\u0629 \u0644\u0635\u0648\u0631...\`,30);
    for(let k=0;k<targetEmpty.length;k++){
      const pageNum=targetEmpty[k];
      try{
        const page=await pdf.getPage(pageNum);
        const vp=page.getViewport({scale:1.4});
        const canvas=document.createElement('canvas');
        canvas.width=vp.width;canvas.height=vp.height;
        const ctx=canvas.getContext('2d');
        await page.render({canvasContext:ctx,viewport:vp}).promise;
        const b64=canvas.toDataURL('image/jpeg',0.55).split(',')[1];
        scannedImages.push({page:pageNum,data:b64,media_type:'image/jpeg'});
      }catch(e){}
      setStep(\`\u062A\u062D\u0648\u064A\u0644 \u0635\u0641\u062D\u0629 \${pageNum}...\`,30+(k+1)/targetEmpty.length*8);
    }
  }

  return {text:pageTexts.join(' '), scannedImages};
}


async function analyze(){if(!state.file)return;go('loading');setStep('\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0645\u0644\u0641...',10);try{const {text:txt,scannedImages}=await extractPdfText(state.file);setStep('\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0648\u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u064A...',40);const d=await callAI(txt,state.company,state.period,scannedImages);setStep('\u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u062A\u0642\u0631\u064A\u0631...',90);await new Promise(r=>setTimeout(r,300));showResults(d);await new Promise(r=>setTimeout(r,200));go('results');}catch(e){document.getElementById('errMsg').textContent=e.message||'\u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u0644\u0645\u0644\u0641 \u0648\u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u062B\u0627\u0646\u064A\u0629.';go('error');}}

async function callAI(txt,co,period,scannedImages=[]){const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),180000);let res;try{res=await fetch(WH,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:txt,company:co,period,scanned_images:scannedImages}),signal:ctrl.signal});}catch(e){clearTimeout(tid);if(e.name==='AbortError')throw new Error('\u0627\u0646\u062A\u0647\u062A \u0627\u0644\u0645\u0647\u0644\u0629. \u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u062B\u0627\u0646\u064A\u0629.');throw new Error('\u0641\u0634\u0644 \u0627\u0644\u0627\u062A\u0635\u0627\u0644. \u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A.');}clearTimeout(tid);let raw;try{raw=await res.json();}catch{throw new Error('\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0641\u0627\u0631\u063A\u0629.');}if(!res.ok)throw new Error(raw.error||'\u0641\u0634\u0644 \u0627\u0644\u062A\u062D\u0644\u064A\u0644.');if(raw.ok&&raw.report&&typeof raw.report==='object')return raw.report;if(raw.summary||raw.kpis)return raw;if(raw.content&&Array.isArray(raw.content)){const t=raw.content.filter(c=>c?.type==='text').map(c=>c.text||'').join('');const p=rp(t);if(p)return p;}throw new Error('\u062A\u0639\u0630\u0651\u0631 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0646\u062A\u064A\u062C\u0629. \u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u062B\u0627\u0646\u064A\u0629.');}

function rp(s){if(!s)return null;s=s.replace(/\`\`\`json/gi,'').replace(/\`\`\`/g,'').trim();const st=s.indexOf('{');if(st<0)return null;s=s.slice(st);const en=s.lastIndexOf('}');if(en>0){try{return JSON.parse(s.slice(0,en+1));}catch{}try{return JSON.parse(s.slice(0,en+1).replace(/,\\s*([}\\]])/g,'$1'));}catch{}}return null;}

const PAL=['#5b9cf6','#60a5fa','#14b8a6','#818cf8','#94a3b8','#475569'];
function es(s){if(s==null)return '';return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fn(n){if(typeof n!=='number')n=parseFloat(n);if(isNaN(n))return '0';return n.toLocaleString('en-US',{maximumFractionDigits:2});}

function drawGrowth(data){const sec=document.getElementById('growthSection');if(!data?.points||data.points.length<2){sec.style.display='none';return;}sec.style.display='block';document.getElementById('growthTitle').textContent=(data.title||'')+(data.unit?\` (\${data.unit})\`:'');const pts=data.points,vals=pts.map(p=>parseFloat(p.value)||0),max=Math.max(...vals)*1.15||1;const W=320,H=150,pL=38,pR=18,pT=22,pB=30,cW=W-pL-pR,cH=H-pT-pB;const x=i=>pL+(i/(pts.length-1))*cW,y=v=>pT+cH-(v/max)*cH;const path=pts.map((p,i)=>\`\${i===0?'M':'L'}\${x(i)},\${y(vals[i])}\`).join(' '),area=\`M\${x(0)},\${H-pB} \`+pts.map((_,i)=>\`L\${x(i)},\${y(vals[i])}\`).join(' ')+\` L\${x(pts.length-1)},\${H-pB} Z\`;document.getElementById('growthWrap').innerHTML=\`<svg viewBox="0 0 \${W} \${H}" class="gsv"><defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5b9cf6" stop-opacity=".22"/><stop offset="100%" stop-color="#5b9cf6" stop-opacity="0"/></linearGradient></defs><path d="\${area}" fill="url(#gg)"/><path d="\${path}" fill="none" stroke="#5b9cf6" stroke-width="2.5" stroke-linejoin="round"/>\${pts.map((p,i)=>\`<circle cx="\${x(i)}" cy="\${y(vals[i])}" r="4" fill="#5b9cf6"/><text x="\${x(i)}" y="\${y(vals[i])-8}" fill="#f0f4ff" font-size="10" font-weight="700" text-anchor="middle">\${fn(vals[i])}</text><text x="\${x(i)}" y="\${H-4}" fill="#6b7a99" font-size="10" text-anchor="middle">\${es(p.label)}</text>\`).join('')}</svg>\`;}

function drawComparison(data){const sec=document.getElementById('compareSection');if(!data?.labels||!data.current?.values){sec.style.display='none';return;}const allV=[...(data.current.values||[]),...(data.previous?.values||[])].map(Number).filter(v=>!isNaN(v)&&v!==0);if(!allV.length){sec.style.display='none';return;}sec.style.display='block';document.getElementById('compareTitle').textContent=data.title||'\u0645\u0642\u0627\u0631\u0646\u0629';const max=Math.max(...allV)*1.15;let h=\`<div class="cpl"><div class="cpi"><div class="cpd" style="background:#5b9cf6"></div>\${es(data.current.name||'\u0627\u0644\u062D\u0627\u0644\u064A')}</div>\${data.previous?\`<div class="cpi"><div class="cpd" style="background:#475569"></div>\${es(data.previous.name||'\u0627\u0644\u0633\u0627\u0628\u0642')}</div>\`:''}</div>\`;data.labels.forEach((l,i)=>{const cV=parseFloat(data.current.values[i]),pV=data.previous?parseFloat(data.previous.values[i]):null;if(isNaN(cV)||cV===0)return;h+=\`<div class="cpg"><div class="cgl">\${es(l)}</div><div class="ctr"><div class="cfi" style="width:\${(cV/max)*100}%;background:#5b9cf6"><span class="cfv">\${fn(cV)}</span></div></div>\${pV&&!isNaN(pV)&&pV!==0?\`<div class="ctr"><div class="cfi" style="width:\${(pV/max)*100}%;background:#475569"><span class="cfv">\${fn(pV)}</span></div></div>\`:''}</div>\`;});document.getElementById('compareWrap').innerHTML=h;}

function drawComposition(data){const sec=document.getElementById('compositionSection');if(!data?.items||data.items.length<2){sec.style.display='none';return;}const total=data.items.reduce((s,i)=>s+(Number(i.value)||0),0);if(total<=0){sec.style.display='none';return;}sec.style.display='block';document.getElementById('compositionTitle').textContent=data.title||'\u0627\u0644\u062A\u0631\u0643\u064A\u0628\u0629';const items=data.items.map(i=>({...i,value:(Number(i.value)||0)/total*100}));const cx=100,cy=100,r=68,sw=20,C=2*Math.PI*r;let acc=0,segs='';items.forEach((it,idx)=>{const len=(it.value/100)*C;segs+=\`<circle cx="\${cx}" cy="\${cy}" r="\${r}" fill="none" stroke="\${PAL[idx%PAL.length]}" stroke-width="\${sw}" stroke-dasharray="\${len} \${C-len}" stroke-dashoffset="\${-acc}" transform="rotate(-90 \${cx} \${cy})"/>\`;acc+=len;});let leg='<div class="dl">';items.forEach((it,idx)=>{leg+=\`<div class="dr"><div class="dd" style="background:\${PAL[idx%PAL.length]}"></div><span class="dn">\${es(it.label)}</span><span class="dpct">\${it.value.toFixed(1)}%</span></div>\`;});leg+='</div>';document.getElementById('compositionWrap').innerHTML=\`<div class="dw"><svg viewBox="0 0 200 200" style="width:120px;height:120px;flex-shrink:0">\${segs}<text x="\${cx}" y="\${cy-4}" fill="#6b7a99" font-size="9" text-anchor="middle">\u0627\u0644\u0645\u062C\u0645\u0648\u0639</text><text x="\${cx}" y="\${cy+12}" fill="#5b9cf6" font-size="13" font-weight="900" text-anchor="middle">100%</text></svg>\${leg}</div>\`;}

function renderConfidence(data){const box=document.getElementById('confBanner');const conf=data.confidence;if(!conf){box.innerHTML='';return;}const map={high:{cls:'ch',ic:'\u2705',t:'\u0645\u0648\u062B\u0648\u0642\u064A\u0629 \u0639\u0627\u0644\u064A\u0629',s:'\u0646\u062C\u062D\u062A \u062C\u0645\u064A\u0639 \u0627\u0644\u062A\u062D\u0642\u0642\u0627\u062A \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u064A\u0629.'},medium:{cls:'cm',ic:'\u26A0\uFE0F',t:'\u0645\u0648\u062B\u0648\u0642\u064A\u0629 \u0645\u062A\u0648\u0633\u0637\u0629',s:'\u064A\u064F\u0646\u0635\u062D \u0628\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0642\u0628\u0644 \u0627\u0639\u062A\u0645\u0627\u062F\u0647\u0627.'},low:{cls:'cl',ic:'\u{1F534}',t:'\u0645\u0648\u062B\u0648\u0642\u064A\u0629 \u0645\u0646\u062E\u0641\u0636\u0629',s:'\u062A\u062D\u0642\u0651\u0642 \u0645\u0646 \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u064A\u062F\u0648\u064A\u064B\u0627.'}};const m=map[conf]||map.medium;const ws=Array.isArray(data.warnings)?data.warnings:[];box.innerHTML=\`<div class="cb \${m.cls}"><span class="ci">\${m.ic}</span><span class="ct">\${m.t}<div class="cs">\${es(m.s)}</div>\${ws.length?\`<ul class="cws">\${ws.map(w=>\`<li>\${es(w)}</li>\`).join('')}</ul>\`:''}</span></div>\`;}

function showResults(data){
  renderConfidence(data);
  document.getElementById('resCo').textContent=state.company;
  document.getElementById('resPeriod').textContent=state.period;
  document.getElementById('resSummary').textContent=data.summary||'';
  const g=document.getElementById('kpiGrid');
  const termDefs={'\u0635\u0627\u0641\u064A \u0627\u0644\u0631\u0628\u062D (Net Profit)':'\u0645\u0627 \u062A\u0628\u0642\u0651\u0649 \u0645\u0646 \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0628\u0639\u062F \u062E\u0635\u0645 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0635\u0627\u0631\u064A\u0641 \u0648\u0627\u0644\u062A\u0643\u0627\u0644\u064A\u0641 \u0648\u0627\u0644\u0632\u0643\u0627\u0629 \u0648\u0627\u0644\u0636\u0631\u064A\u0628\u0629. \u0647\u0648 \u0627\u0644\u0631\u0628\u062D \u0627\u0644\u0641\u0639\u0644\u064A \u0627\u0644\u0630\u064A \u064A\u0639\u0648\u062F \u0644\u0644\u0645\u0633\u0627\u0647\u0645\u064A\u0646.','\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0631\u0628\u062D (Gross Profit)':'\u0627\u0644\u0641\u0631\u0642 \u0628\u064A\u0646 \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0648\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629 \u0641\u0642\u0637\u060C \u0642\u0628\u0644 \u062E\u0635\u0645 \u0627\u0644\u0645\u0635\u0627\u0631\u064A\u0641 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A\u0629 \u0648\u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629.','\u0627\u0644\u0631\u0628\u062D \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A (Operating Profit)':'\u0627\u0644\u0631\u0628\u062D \u0628\u0639\u062F \u062E\u0635\u0645 \u0627\u0644\u0645\u0635\u0627\u0631\u064A\u0641 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A\u0629 \u0648\u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629\u060C \u0642\u0628\u0644 \u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u062A\u0645\u0648\u064A\u0644 \u0648\u0627\u0644\u0632\u0643\u0627\u0629. \u064A\u0642\u064A\u0633 \u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629.','\u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A (Revenue)':'\u0625\u062C\u0645\u0627\u0644\u064A \u0645\u0627 \u062D\u0635\u0644\u062A \u0639\u0644\u064A\u0647 \u0627\u0644\u0634\u0631\u0643\u0629 \u0645\u0646 \u0645\u0628\u064A\u0639\u0627\u062A \u0623\u0648 \u062E\u062F\u0645\u0627\u062A \u062E\u0644\u0627\u0644 \u0627\u0644\u0641\u062A\u0631\u0629\u060C \u0642\u0628\u0644 \u062E\u0635\u0645 \u0623\u064A \u062A\u0643\u0627\u0644\u064A\u0641.'};
  function getTermInfo(label,source){const def=termDefs[label];return def||(source?'\u0645\u0633\u062A\u062E\u0631\u062C \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0645\u0628\u0627\u0634\u0631\u0629':'');}
  if(data.kpis?.length){g.innerHTML=data.kpis.map(k=>{const cls=k.trend==='up'?'up':k.trend==='down'?'down':'flat',arr=k.trend==='up'?'\u25B2':k.trend==='down'?'\u25BC':'\u2014';const info=getTermInfo(k.label,k.source);return\`<div class="kc"><div class="kl">\${k.icon||'\u{1F4CA}'} \${es(k.label)}</div><div class="kv">\${es(k.value)}</div><div class="ku">\${es(k.unit||'')}\${info?\` <span class="si" onclick="alert('\${info.replace(/'/g,'\\\\'+'\\'').replace(/\\n/g,' ')}')">\u24D8</span>\`:''}</div>\${k.change?\`<div class="kch \${cls}">\${arr} \${es(k.change)}</div>\`:''}</div>\`;}).join('');}
  else{g.innerHTML='<div style="grid-column:1/-1;padding:14px;text-align:center;color:var(--d);font-size:13px">\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0624\u0634\u0631\u0627\u062A \u0645\u062A\u0627\u062D\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0644\u0641</div>';}
  const ab=document.getElementById('aboutSection');if(data.about){ab.style.display='block';document.getElementById('aboutText').textContent=data.about;}else ab.style.display='none';
  const ins=document.getElementById('insightSection');if(data.insight){ins.style.display='block';document.getElementById('insightList').innerHTML=\`<div class="ii">\${es(data.insight)}</div>\`;}else ins.style.display='none';
  const rs=document.getElementById('ratiosSection');if(data.ratios?.length){rs.style.display='block';document.getElementById('ratiosList').innerHTML=data.ratios.map(r=>\`<div class="ri2"><div class="rih"><span class="ril">\${es(r.label)}</span><span class="riv">\${es(r.value)}</span></div>\${r.previous?\`<div class="rip">\u0627\u0644\u0633\u0627\u0628\u0642: \${es(r.previous)}</div>\`:''}\${r.note?\`<div class="rin">\${es(r.note)}</div>\`:''}\${r.source?\`<div class="ris">\u24D8 \${es(r.source)}</div>\`:''}</div>\`).join('');}else rs.style.display='none';
  const fs=document.getElementById('figuresSection');if(data.figures?.length){fs.style.display='block';document.getElementById('figuresList').innerHTML=data.figures.map(cat=>{const rows=(cat.items||[]).map(it=>\`<tr class="\${it.subtotal?'subtotal':''}"><td>\${es(it.label)}</td><td class="fc">\${es(it.current)}</td><td class="fp">\${it.previous?es(it.previous):'\u2014'}</td><td class="fu">\${es(it.unit||'')}</td></tr>\`).join('');return\`<div class="fct">\${es(cat.category)}</div><table class="ft"><thead><tr><th>\u0627\u0644\u0628\u0646\u062F</th><th>\u0627\u0644\u062D\u0627\u0644\u064A</th><th>\u0627\u0644\u0633\u0627\u0628\u0642</th><th></th></tr></thead><tbody>\${rows}</tbody></table>\`;}).join('');}else fs.style.display='none';
  drawGrowth(data.growth_chart);drawComparison(data.comparison_chart);drawComposition(data.composition_chart);

  // \u0627\u0644\u062A\u062F\u0641\u0642\u0627\u062A \u0627\u0644\u0646\u0642\u062F\u064A\u0629
  const cfSec=document.getElementById('cashflowSection');
  const cf=data.cashflow_summary;
  if(cf){
    cfSec.style.display='block';
    const cfItems=[
      {ic:'\u2699\uFE0F',lbl:'\u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A',v:cf.operating},
      {ic:'\u{1F3D7}\uFE0F',lbl:'\u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631\u064A',v:cf.investing},
      {ic:'\u{1F3E6}',lbl:'\u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u062A\u0645\u0648\u064A\u0644\u064A',v:cf.financing},
      {ic:'\u{1F4B5}',lbl:'\u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0627\u0644\u062D\u0631',v:cf.free_cash_flow}
    ].filter(x=>x.v!=null);
    document.getElementById('cashflowGrid').innerHTML=cfItems.map(x=>'<div class="kc"><div class="kl">'+x.ic+' '+es(x.lbl)+'</div><div class="kv">'+es(String(x.v))+'</div><div class="ku">'+es(cf.unit||'\u0645\u0644\u064A\u0627\u0631')+' \u0631\u064A\u0627\u0644</div></div>').join('');
  }else cfSec.style.display='none';

  // \u062D\u0642\u0648\u0642 \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u064A\u0646
  const eqSec=document.getElementById('equitySection');
  const eq=data.equity_summary;
  if(eq){
    eqSec.style.display='block';
    const ch=eq.change_pct;
    const eqItems=[
      {ic:'\u{1F4CA}',lbl:'\u0625\u062C\u0645\u0627\u0644\u064A \u062D\u0642\u0648\u0642 \u0627\u0644\u0645\u0644\u0643\u064A\u0629',v:eq.total_equity,chg:ch},
      {ic:'\u{1F4B0}',lbl:'\u0631\u0623\u0633 \u0627\u0644\u0645\u0627\u0644',v:eq.share_capital},
      {ic:'\u{1F4C8}',lbl:'\u0627\u0644\u0623\u0631\u0628\u0627\u062D \u0627\u0644\u0645\u0628\u0642\u0627\u0629',v:eq.retained_earnings}
    ].filter(x=>x.v!=null);
    document.getElementById('equityGrid').innerHTML=eqItems.map(x=>{
      const chg=x.chg!=null?'<div class="kch '+(x.chg>0?'up':x.chg<0?'down':'flat')+'">'+(x.chg>0?'\u25B2':x.chg<0?'\u25BC':'\u2014')+' '+(x.chg>0?'+':'')+x.chg+'%</div>':'';
      return '<div class="kc"><div class="kl">'+x.ic+' '+es(x.lbl)+'</div><div class="kv">'+es(String(x.v))+'</div><div class="ku">'+es(eq.unit||'\u0645\u0644\u064A\u0627\u0631')+' \u0631\u064A\u0627\u0644</div>'+chg+'</div>';
    }).join('');
  }else eqSec.style.display='none';

  const rk=document.getElementById('risksSection');if(data.risks?.length){rk.style.display='block';document.getElementById('risksList').innerHTML=data.risks.map(r=>\`<div class="rki">\u26A0 \${es(r)}</div>\`).join('');}else rk.style.display='none';
  const notes=data.notes||data.highlights||[];document.getElementById('highlightsList').innerHTML=notes.length?notes.map(h=>\`<div class="hi"><span class="hb">\u25C6</span><span>\${es(h)}</span></div>\`).join(''):'<div style="padding:10px;text-align:center;color:var(--d)">\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629</div>';
  document.getElementById('disclaimerBox').textContent=data.disclaimer||'\u0639\u0631\u0636 \u0648\u0635\u0641\u064A \u0644\u0644\u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u0645\u0639\u0644\u0646\u0629 \u0648\u0641\u0642 \u0645\u0635\u0637\u0644\u062D\u0627\u062A SOCPA/IFRS \u062F\u0648\u0646 \u062A\u0648\u0635\u064A\u0629 \u0627\u0633\u062A\u062B\u0645\u0627\u0631\u064A\u0629.';
}

function reset(){state.file=null;state.company='';state.period='';document.getElementById('fileInput').value='';document.getElementById('upZone').classList.remove('ok');document.getElementById('upDefault').style.display='block';document.getElementById('upSelected').style.display='none';document.getElementById('company').value='';document.querySelectorAll('#periodChips .chip').forEach(c=>c.classList.remove('sel'));document.getElementById('submitBtn').disabled=true;go('upload');}
<\/script>
</body>
</html>
`;
export {
  index_default as default
};
//# sourceMappingURL=index.js.map

