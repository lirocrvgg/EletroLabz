/* editor/geom.js - geometria do editor de diagramas (Acionamentos v2, E1). Puro: sem DOM, sem globais legadas.
 * Convencao: c.x/c.y = canto da caixa GIRADA; c.w/c.h = dimensoes SEM rotacao; rot em {0,90,180,270} horario;
 * flip = espelho horizontal aplicado ANTES da rotacao. Com rot 0 e sem flip, portWorld e identico ao legado. */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.editor = EO.editor || {};

  var GRID = 20;
  var SNAP_TOL = 6;
  var EPS = 1e-9;

  function quarter(rot) {
    var q = Math.round((Number(rot) || 0) / 90) % 4;
    return q < 0 ? q + 4 : q;
  }

  /* (u,v) em px locais da caixa w x h sem rotacao -> deslocamento dentro da caixa girada */
  function xform(u, v, w, h, rot, flip) {
    if (flip) u = w - u;
    switch (quarter(rot)) {
      case 1: return { x: h - v, y: u };
      case 2: return { x: w - u, y: h - v };
      case 3: return { x: v, y: w - u };
      default: return { x: u, y: v };
    }
  }

  function boxSize(c) {
    var q = quarter(c.rot);
    return (q & 1) ? { W: c.h, H: c.w } : { W: c.w, H: c.h };
  }

  function portWorld(c, i, defs) {
    var p = defs[c.sym].ports[i];
    var o = xform(p.x * c.w, p.y * c.h, c.w, c.h, c.rot, c.flip);
    return { x: c.x + o.x, y: c.y + o.y };
  }

  function bbox(c) {
    var s = boxSize(c);
    return { x: c.x, y: c.y, w: s.W, h: s.H, x2: c.x + s.W, y2: c.y + s.H };
  }

  function hitComp(comps, x, y, tol) {
    var m = tol || 0;
    for (var i = comps.length - 1; i >= 0; i--) {
      var b = bbox(comps[i]);
      if (x >= b.x - m && x <= b.x2 + m && y >= b.y - m && y <= b.y2 + m) return comps[i];
    }
    return null;
  }

  function closestOnSeg(px, py, x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy, t = 0;
    if (len2 > 1e-6) t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
    var qx = x1 + t * dx, qy = y1 + t * dy;
    return { x: qx, y: qy, d: Math.hypot(px - qx, py - qy) };
  }

  /* polilinha from -> pts -> to, como [{x1,y1,x2,y2}] (um por trecho) */
  function segmentsOf(wire, comps, defs) {
    var a = portWorld(wire.from.comp, wire.from.port, defs);
    var b = portWorld(wire.to.comp, wire.to.port, defs);
    var mid = Array.isArray(wire.pts) ? wire.pts.map(function (p) { return { x: p.x, y: p.y }; }) : [];
    var chain = [a].concat(mid, [b]);
    var out = [];
    for (var i = 0; i < chain.length - 1; i++) out.push({ x1: chain[i].x, y1: chain[i].y, x2: chain[i + 1].x, y2: chain[i + 1].y });
    return out;
  }

  function hitWire(wires, comps, defs, x, y, tol) {
    var best = null, bd = tol;
    for (var wi = 0; wi < wires.length; wi++) {
      var segs = segmentsOf(wires[wi], comps, defs);
      for (var si = 0; si < segs.length; si++) {
        var s = segs[si];
        var r = closestOnSeg(x, y, s.x1, s.y1, s.x2, s.y2);
        if (r.d <= bd) { bd = r.d; best = { wire: wires[wi], segIndex: si, point: { x: r.x, y: r.y } }; }
      }
    }
    return best;
  }

  function nearestTerminal(comps, defs, x, y, raio) {
    var best = null, bd = raio;
    for (var ci = 0; ci < comps.length; ci++) {
      var c = comps[ci], def = defs[c.sym];
      if (!def) continue;
      for (var i = 0; i < def.ports.length; i++) {
        var pw = portWorld(c, i, defs);
        var d = Math.hypot(x - pw.x, y - pw.y);
        if (d <= bd) { bd = d; best = { comp: c, port: i, x: pw.x, y: pw.y, dist: d }; }
      }
    }
    return best;
  }

  /* vertices intermediarios de a -> b em L; firstAxis 'h' (padrao) sai na horizontal, 'v' na vertical */
  function routeL(a, b, firstAxis) {
    if (Math.abs(a.x - b.x) < EPS || Math.abs(a.y - b.y) < EPS) return [];
    return firstAxis === 'v' ? [{ x: a.x, y: b.y }] : [{ x: b.x, y: a.y }];
  }

  /* por eixo: eixo de terminal (a menos de tol) tem prioridade sobre a grade */
  function snapVertex(p, grid, eixos, tol) {
    var g = grid || GRID, t = tol == null ? SNAP_TOL : tol;
    var out = { x: Math.round(p.x / g) * g, y: Math.round(p.y / g) * g, snapX: 'grade', snapY: 'grade' };
    var bx = t, by = t;
    (eixos || []).forEach(function (e) {
      var dx = Math.abs(p.x - e.x), dy = Math.abs(p.y - e.y);
      if (dx < bx) { bx = dx; out.x = e.x; out.snapX = 'terminal'; }
      if (dy < by) { by = dy; out.y = e.y; out.snapY = 'terminal'; }
    });
    return out;
  }

  /* remove duplicados e colineares (inclusive retornos); preserva primeiro e ultimo */
  function simplify(pts) {
    var out = [];
    (pts || []).forEach(function (p) {
      var q = { x: p.x, y: p.y };
      for (;;) {
        var n = out.length;
        if (n && Math.abs(out[n - 1].x - q.x) < EPS && Math.abs(out[n - 1].y - q.y) < EPS) return;
        if (n >= 2) {
          var a = out[n - 2], b = out[n - 1];
          var cross = (b.x - a.x) * (q.y - a.y) - (b.y - a.y) * (q.x - a.x);
          if (Math.abs(cross) < EPS) { out.pop(); continue; }
        }
        break;
      }
      out.push(q);
    });
    return out;
  }

  EO.editor.geom = {
    GRID: GRID, SNAP_TOL: SNAP_TOL,
    xform: xform, boxSize: boxSize, portWorld: portWorld, bbox: bbox, hitComp: hitComp, hitWire: hitWire,
    nearestTerminal: nearestTerminal, routeL: routeL, snapVertex: snapVertex, simplify: simplify, segmentsOf: segmentsOf
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = EO.editor.geom;
})(typeof window !== 'undefined' ? window : globalThis);
