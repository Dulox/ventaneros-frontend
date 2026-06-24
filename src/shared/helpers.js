// ═══ SHARED HELPERS ════════════════════════════════════════════════════════
// Funciones reutilizadas del Ventaneros original — ya probadas en producción.

export const FR=[[0,""],[.0625,"1/16"],[.125,"1/8"],[.1875,"3/16"],[.25,"1/4"],[.3125,"5/16"],[.375,"3/8"],[.4375,"7/16"],[.5,"1/2"],[.5625,"9/16"],[.625,"5/8"],[.6875,"11/16"],[.75,"3/4"],[.8125,"13/16"],[.875,"7/8"],[.9375,"15/16"]];

export function tf(v){const i=Math.floor(v),d=v-i;let c=FR[0],mn=99;for(const f of FR){const x=Math.abs(f[0]-d);if(x<mn){mn=x;c=f;}}return c[1]?i+" "+c[1]+'"':i+'"';}

export function r2(n){return Math.round(n*100)/100;}

export function sumOrder(lines){
  const tot={pie:0,gom:0,rem:0,op:0};
  lines.forEach(l=>{
    tot.pie+=l.pie||0;
    tot.gom+=(l.hw?.gom||0);
    if(l.tipo!=="cor"){tot.rem+=(l.hw?.rem||0);tot.op+=(l.hw?.op||0);}
  });
  return{pie:r2(tot.pie),gom:r2(tot.gom),rem:tot.rem,op:tot.op};
}

export function calcProfit(lines, precios, metodo, margen, precioFijo) {
  let totalCosto = 0, totalVenta = 0;
  const desglose = [];
  lines.forEach(l => {
    const allPies = l.pies || {};
    Object.entries(allPies).forEach(([k, pie]) => {
      if (!pie || pie <= 0) return;
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
