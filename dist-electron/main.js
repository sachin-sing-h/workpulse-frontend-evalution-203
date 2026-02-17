import { powerMonitor as Fo, app as Re, BrowserWindow as eo, ipcMain as hr } from "electron";
import we from "node:path";
import { fileURLToPath as Ao } from "node:url";
import te from "path";
import ae from "util";
import hn from "child_process";
import ie from "fs";
import dn from "url";
import pn from "os";
import vn from "stream";
import Se from "events";
import rr from "buffer";
import tr from "assert";
var oe = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Oo(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
function To(t) {
  if (t.__esModule) return t;
  var s = t.default;
  if (typeof s == "function") {
    var c = function v() {
      return this instanceof v ? Reflect.construct(s, arguments, this.constructor) : s.apply(this, arguments);
    };
    c.prototype = s.prototype;
  } else c = {};
  return Object.defineProperty(c, "__esModule", { value: !0 }), Object.keys(t).forEach(function(v) {
    var d = Object.getOwnPropertyDescriptor(t, v);
    Object.defineProperty(c, v, d.get ? d : {
      enumerable: !0,
      get: function() {
        return t[v];
      }
    });
  }), c;
}
var Be = { exports: {} }, me = { exports: {} }, Tn;
function nr() {
  if (Tn) return me.exports;
  Tn = 1;
  const t = te, { promisify: s } = ae, c = hn, v = s(c.execFile), d = t.join(__dirname, "../main"), i = (o) => {
    try {
      return JSON.parse(o);
    } catch (a) {
      throw console.error(a), new Error("Error parsing window data");
    }
  }, r = (o) => {
    if (!o)
      return [];
    const a = [];
    return o.accessibilityPermission === !1 && a.push("--no-accessibility-permission"), o.screenRecordingPermission === !1 && a.push("--no-screen-recording-permission"), a;
  };
  return me.exports = async (o) => {
    const { stdout: a } = await v(d, r(o));
    return i(a);
  }, me.exports.sync = (o) => {
    const a = c.execFileSync(d, r(o), { encoding: "utf8" });
    return i(a);
  }, me.exports.getOpenWindows = async (o) => {
    const { stdout: a } = await v(d, [...r(o), "--open-windows-list"]);
    return i(a);
  }, me.exports.getOpenWindowsSync = (o) => {
    const a = c.execFileSync(d, [...r(o), "--open-windows-list"], { encoding: "utf8" });
    return i(a);
  }, me.exports;
}
var Ee = { exports: {} }, xn;
function ir() {
  if (xn) return Ee.exports;
  xn = 1;
  const { promisify: t } = ae, s = ie, c = hn, v = t(c.execFile), d = t(s.readFile), i = t(s.readlink), r = "xprop", o = "xwininfo", a = ["-root", "	$0", "_NET_ACTIVE_WINDOW"], f = ["-root", "_NET_CLIENT_LIST_STACKING"], n = ["-id"], D = (h) => {
    const p = {};
    for (const g of h.trim().split(`
`))
      if (g.includes("=")) {
        const [R, C] = g.split("=");
        p[R.trim()] = C.trim();
      } else if (g.includes(":")) {
        const [R, C] = g.split(":");
        p[R.trim()] = C.trim();
      }
    return p;
  }, l = ({ stdout: h, boundsStdout: p, activeWindowId: g }) => {
    const R = D(h), C = D(p), m = "WM_CLIENT_LEADER(WINDOW)", O = Object.keys(R).indexOf(m) > 0 && Number.parseInt(R[m].split("#").pop(), 16) || g, T = Number.parseInt(R["_NET_WM_PID(CARDINAL)"], 10);
    if (Number.isNaN(T))
      throw new Error("Failed to parse process ID");
    return {
      platform: "linux",
      title: JSON.parse(R["_NET_WM_NAME(UTF8_STRING)"] || R["WM_NAME(STRING)"]) || null,
      id: O,
      owner: {
        name: JSON.parse(R["WM_CLASS(STRING)"].split(",").pop()),
        processId: T
      },
      bounds: {
        x: Number.parseInt(C["Absolute upper-left X"], 10),
        y: Number.parseInt(C["Absolute upper-left Y"], 10),
        width: Number.parseInt(C.Width, 10),
        height: Number.parseInt(C.Height, 10)
      }
    };
  }, E = (h) => Number.parseInt(h.split("	")[1], 16), y = async (h) => {
    const p = await d(`/proc/${h}/statm`, "utf8");
    return Number.parseInt(p.split(" ")[1], 10) * 4096;
  }, u = (h) => {
    const p = ie.readFileSync(`/proc/${h}/statm`, "utf8");
    return Number.parseInt(p.split(" ")[1], 10) * 4096;
  }, b = (h) => i(`/proc/${h}/exe`), e = (h) => {
    try {
      return s.readlinkSync(`/proc/${h}/exe`);
    } catch {
    }
  };
  async function _(h) {
    const [{ stdout: p }, { stdout: g }] = await Promise.all([
      v(r, [...n, h], { env: { ...process.env, LC_ALL: "C.utf8" } }),
      v(o, [...n, h])
    ]), R = l({
      activeWindowId: h,
      boundsStdout: g,
      stdout: p
    }), [C, m] = await Promise.all([
      y(R.owner.processId),
      b(R.owner.processId).catch(() => {
      })
    ]);
    return R.memoryUsage = C, R.owner.path = m, R;
  }
  function w(h) {
    const p = c.execFileSync(r, [...n, h], { encoding: "utf8", env: { ...process.env, LC_ALL: "C.utf8" } }), g = c.execFileSync(o, [...n, h], { encoding: "utf8" }), R = l({
      activeWindowId: h,
      boundsStdout: g,
      stdout: p
    });
    return R.memoryUsage = u(R.owner.processId), R.owner.path = e(R.owner.processId), R;
  }
  return Ee.exports = async () => {
    try {
      const { stdout: h } = await v(r, a), p = E(h);
      return p ? _(p) : void 0;
    } catch {
      return;
    }
  }, Ee.exports.sync = () => {
    try {
      const h = c.execFileSync(r, a, { encoding: "utf8" }), p = E(h);
      return p ? w(p) : void 0;
    } catch {
      return;
    }
  }, Ee.exports.getOpenWindows = async () => {
    try {
      const { stdout: h } = await v(r, f), p = h.split("#")[1].trim().replace(`
`, "").split(",");
      if (!p || p.length === 0)
        return;
      const g = [];
      for await (const R of p)
        g.push(await _(Number.parseInt(R, 16)));
      return g;
    } catch {
      return;
    }
  }, Ee.exports.getOpenWindowsSync = () => {
    try {
      const p = c.execFileSync(r, f, { encoding: "utf8" }).split("#")[1].trim().replace(`
`, "").split(",");
      if (!p || p.length === 0)
        return;
      const g = [];
      for (const R of p) {
        const C = w(Number.parseInt(R, 16));
        g.push(C);
      }
      return g;
    } catch (h) {
      console.log(h);
      return;
    }
  }, Ee.exports;
}
var ye = { exports: {} };
function er(t) {
  throw new Error('Could not dynamically require "' + t + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var $e = { exports: {} }, Me = { exports: {} };
const xo = {}, Io = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: xo
}, Symbol.toStringTag, { value: "Module" })), dr = /* @__PURE__ */ To(Io);
var In;
function Lo() {
  return In || (In = 1, function(t, s) {
    t.exports = s;
    const c = dn, v = ie, d = te;
    t.exports.detect = function(i, r) {
      const o = i.hosted_path, a = c.parse(o);
      if (r.prefix = !a.pathname || a.pathname === "/" ? "" : a.pathname.replace("/", ""), i.bucket && i.region)
        r.bucket = i.bucket, r.region = i.region, r.endpoint = i.host, r.s3ForcePathStyle = i.s3ForcePathStyle;
      else {
        const f = a.hostname.split(".s3"), n = f[0];
        if (!n)
          return;
        if (r.bucket || (r.bucket = n), !r.region) {
          const D = f[1].slice(1).split(".")[0];
          D === "amazonaws" ? r.region = "us-east-1" : r.region = D;
        }
      }
    }, t.exports.get_s3 = function(i) {
      if (process.env.node_pre_gyp_mock_s3) {
        const a = dr, f = pn;
        a.config.basePath = `${f.tmpdir()}/mock`;
        const n = a.S3(), D = (l) => (E, ...y) => (E && E.code === "ENOENT" && (E.code = "NotFound"), l(E, ...y));
        return {
          listObjects(l, E) {
            return n.listObjects(l, D(E));
          },
          headObject(l, E) {
            return n.headObject(l, D(E));
          },
          deleteObject(l, E) {
            return n.deleteObject(l, D(E));
          },
          putObject(l, E) {
            return n.putObject(l, D(E));
          }
        };
      }
      const r = dr;
      r.config.update(i);
      const o = new r.S3();
      return {
        listObjects(a, f) {
          return o.listObjects(a, f);
        },
        headObject(a, f) {
          return o.headObject(a, f);
        },
        deleteObject(a, f) {
          return o.deleteObject(a, f);
        },
        putObject(a, f) {
          return o.putObject(a, f);
        }
      };
    }, t.exports.get_mockS3Http = function() {
      let i = !1;
      if (!process.env.node_pre_gyp_mock_s3)
        return () => i;
      const r = dr, o = "https://mapbox-node-pre-gyp-public-testing-bucket.s3.us-east-1.amazonaws.com", a = process.env.node_pre_gyp_mock_s3 + "/mapbox-node-pre-gyp-public-testing-bucket";
      return (() => {
        function D(l, E) {
          const y = d.join(a, l.replace("%2B", "+"));
          try {
            v.accessSync(y, v.constants.R_OK);
          } catch {
            return [404, `not found
`];
          }
          return [200, v.createReadStream(y)];
        }
        return r(o).persist().get(() => i).reply(D);
      })(), (D) => {
        const l = i;
        if (D === "off")
          i = !1;
        else if (D === "on")
          i = !0;
        else if (D !== "get")
          throw new Error(`illegal action for setMockHttp ${D}`);
        return l;
      };
    };
  }(Me, Me.exports)), Me.exports;
}
var je = { exports: {} }, pr = { exports: {} }, Ln;
function No() {
  return Ln || (Ln = 1, function(t, s) {
    t.exports = v.abbrev = v, v.monkeyPatch = c;
    function c() {
      Object.defineProperty(Array.prototype, "abbrev", {
        value: function() {
          return v(this);
        },
        enumerable: !1,
        configurable: !0,
        writable: !0
      }), Object.defineProperty(Object.prototype, "abbrev", {
        value: function() {
          return v(Object.keys(this));
        },
        enumerable: !1,
        configurable: !0,
        writable: !0
      });
    }
    function v(i) {
      (arguments.length !== 1 || !Array.isArray(i)) && (i = Array.prototype.slice.call(arguments, 0));
      for (var r = 0, o = i.length, a = []; r < o; r++)
        a[r] = typeof i[r] == "string" ? i[r] : String(i[r]);
      a = a.sort(d);
      for (var f = {}, n = "", r = 0, o = a.length; r < o; r++) {
        var D = a[r], l = a[r + 1] || "", E = !0, y = !0;
        if (D !== l) {
          for (var u = 0, b = D.length; u < b; u++) {
            var e = D.charAt(u);
            if (E = E && e === l.charAt(u), y = y && e === n.charAt(u), !E && !y) {
              u++;
              break;
            }
          }
          if (n = D, u === b) {
            f[D] = D;
            continue;
          }
          for (var _ = D.substr(0, u); u <= b; u++)
            f[_] = D, _ += D.charAt(u);
        }
      }
      return f;
    }
    function d(i, r) {
      return i === r ? 0 : i > r ? 1 : -1;
    }
  }(pr)), pr.exports;
}
var Nn;
function Bo() {
  return Nn || (Nn = 1, function(t, s) {
    var c = process.env.DEBUG_NOPT || process.env.NOPT_DEBUG ? function() {
      console.error.apply(console, arguments);
    } : function() {
    }, v = dn, d = te, i = vn.Stream, r = No(), o = pn;
    t.exports = s = a, s.clean = f, s.typeDefs = {
      String: { type: String, validate: n },
      Boolean: { type: Boolean, validate: y },
      url: { type: v, validate: u },
      Number: { type: Number, validate: l },
      path: { type: d, validate: D },
      Stream: { type: i, validate: b },
      Date: { type: Date, validate: E }
    };
    function a(h, p, g, R) {
      g = g || process.argv, h = h || {}, p = p || {}, typeof R != "number" && (R = 2), c(h, p, g, R), g = g.slice(R);
      var C = {}, m = {
        remain: [],
        cooked: g,
        original: g.slice(0)
      };
      return _(g, C, m.remain, h, p), f(C, h, s.typeDefs), C.argv = m, Object.defineProperty(C.argv, "toString", { value: function() {
        return this.original.map(JSON.stringify).join(" ");
      }, enumerable: !1 }), C;
    }
    function f(h, p, g) {
      g = g || s.typeDefs;
      var R = {}, C = [!1, !0, null, String, Array];
      Object.keys(h).forEach(function(m) {
        if (m !== "argv") {
          var F = h[m], O = Array.isArray(F), T = p[m];
          O || (F = [F]), T || (T = C), T === Array && (T = C.concat(Array)), Array.isArray(T) || (T = [T]), c("val=%j", F), c("types=", T), F = F.map(function(x) {
            if (typeof x == "string" && (c("string %j", x), x = x.trim(), x === "null" && ~T.indexOf(null) || x === "true" && (~T.indexOf(!0) || ~T.indexOf(Boolean)) || x === "false" && (~T.indexOf(!1) || ~T.indexOf(Boolean)) ? (x = JSON.parse(x), c("jsonable %j", x)) : ~T.indexOf(Number) && !isNaN(x) ? (c("convert to number", x), x = +x) : ~T.indexOf(Date) && !isNaN(Date.parse(x)) && (c("convert to date", x), x = new Date(x))), !p.hasOwnProperty(m))
              return x;
            x === !1 && ~T.indexOf(null) && !(~T.indexOf(!1) || ~T.indexOf(Boolean)) && (x = null);
            var B = {};
            return B[m] = x, c("prevalidated val", B, x, p[m]), e(B, m, x, p[m], g) ? (c("validated val", B, x, p[m]), B[m]) : (s.invalidHandler ? s.invalidHandler(m, x, p[m], h) : s.invalidHandler !== !1 && c("invalid: " + m + "=" + x, p[m]), R);
          }).filter(function(x) {
            return x !== R;
          }), !F.length && T.indexOf(Array) === -1 ? (c("VAL HAS NO LENGTH, DELETE IT", F, m, T.indexOf(Array)), delete h[m]) : O ? (c(O, h[m], F), h[m] = F) : h[m] = F[0], c("k=%s val=%j", m, F, h[m]);
        }
      });
    }
    function n(h, p, g) {
      h[p] = String(g);
    }
    function D(h, p, g) {
      if (g === !0) return !1;
      if (g === null) return !0;
      g = String(g);
      var R = process.platform === "win32", C = R ? /^~(\/|\\)/ : /^~\//, m = o.homedir();
      return m && g.match(C) ? h[p] = d.resolve(m, g.substr(2)) : h[p] = d.resolve(g), !0;
    }
    function l(h, p, g) {
      if (c("validate Number %j %j %j", p, g, isNaN(g)), isNaN(g)) return !1;
      h[p] = +g;
    }
    function E(h, p, g) {
      var R = Date.parse(g);
      if (c("validate Date %j %j %j", p, g, R), isNaN(R)) return !1;
      h[p] = new Date(g);
    }
    function y(h, p, g) {
      g instanceof Boolean ? g = g.valueOf() : typeof g == "string" ? isNaN(g) ? g === "null" || g === "false" ? g = !1 : g = !0 : g = !!+g : g = !!g, h[p] = g;
    }
    function u(h, p, g) {
      if (g = v.parse(String(g)), !g.host) return !1;
      h[p] = g.href;
    }
    function b(h, p, g) {
      if (!(g instanceof i)) return !1;
      h[p] = g;
    }
    function e(h, p, g, R, C) {
      if (Array.isArray(R)) {
        for (var m = 0, F = R.length; m < F; m++)
          if (R[m] !== Array && e(h, p, g, R[m], C))
            return !0;
        return delete h[p], !1;
      }
      if (R === Array) return !0;
      if (R !== R)
        return c("Poison NaN", p, g, R), delete h[p], !1;
      if (g === R)
        return c("Explicitly allowed %j", g), h[p] = g, !0;
      for (var O = !1, T = Object.keys(C), m = 0, F = T.length; m < F; m++) {
        c("test type %j %j %j", p, g, T[m]);
        var x = C[T[m]];
        if (x && (R && R.name && x.type && x.type.name ? R.name === x.type.name : R === x.type)) {
          var B = {};
          if (O = x.validate(B, p, g) !== !1, g = B[p], O) {
            h[p] = g;
            break;
          }
        }
      }
      return c("OK? %j (%j %j %j)", O, p, g, T[m]), O || delete h[p], O;
    }
    function _(h, p, g, R, C) {
      c("parse", h, p, g);
      for (var m = r(Object.keys(R)), F = r(Object.keys(C)), O = 0; O < h.length; O++) {
        var T = h[O];
        if (c("arg", T), T.match(/^-{2,}$/)) {
          g.push.apply(g, h.slice(O + 1)), h[O] = "--";
          break;
        }
        var x = !1;
        if (T.charAt(0) === "-" && T.length > 1) {
          var B = T.indexOf("=");
          if (B > -1) {
            x = !0;
            var k = T.substr(B + 1);
            T = T.substr(0, B), h.splice(O, 1, T, k);
          }
          var U = w(T, C, F, m);
          if (c("arg=%j shRes=%j", T, U), U && (c(T, U), h.splice.apply(h, [O, 1].concat(U)), T !== U[0])) {
            O--;
            continue;
          }
          T = T.replace(/^-+/, "");
          for (var q = null; T.toLowerCase().indexOf("no-") === 0; )
            q = !q, T = T.substr(3);
          m[T] && (T = m[T]);
          var P = R[T], M = Array.isArray(P);
          M && P.length === 1 && (M = !1, P = P[0]);
          var W = P === Array || M && P.indexOf(Array) !== -1;
          !R.hasOwnProperty(T) && p.hasOwnProperty(T) && (Array.isArray(p[T]) || (p[T] = [p[T]]), W = !0);
          var V, N = h[O + 1], G = typeof q == "boolean" || P === Boolean || M && P.indexOf(Boolean) !== -1 || typeof P > "u" && !x || N === "false" && (P === null || M && ~P.indexOf(null));
          if (G) {
            V = !q, (N === "true" || N === "false") && (V = JSON.parse(N), N = null, q && (V = !V), O++), M && N && (~P.indexOf(N) ? (V = N, O++) : N === "null" && ~P.indexOf(null) ? (V = null, O++) : !N.match(/^-{2,}[^-]/) && !isNaN(N) && ~P.indexOf(Number) ? (V = +N, O++) : !N.match(/^-[^-]/) && ~P.indexOf(String) && (V = N, O++)), W ? (p[T] = p[T] || []).push(V) : p[T] = V;
            continue;
          }
          P === String && (N === void 0 ? N = "" : N.match(/^-{1,2}[^-]+/) && (N = "", O--)), N && N.match(/^-{2,}$/) && (N = void 0, O--), V = N === void 0 ? !0 : N, W ? (p[T] = p[T] || []).push(V) : p[T] = V, O++;
          continue;
        }
        g.push(T);
      }
    }
    function w(h, p, g, R) {
      if (h = h.replace(/^-+/, ""), R[h] === h)
        return null;
      if (p[h])
        return p[h] && !Array.isArray(p[h]) && (p[h] = p[h].split(/\s+/)), p[h];
      var C = p.___singles;
      C || (C = Object.keys(p).filter(function(F) {
        return F.length === 1;
      }).reduce(function(F, O) {
        return F[O] = !0, F;
      }, {}), p.___singles = C, c("shorthand singles", C));
      var m = h.split("").filter(function(F) {
        return C[F];
      });
      return m.join("") === h ? m.map(function(F) {
        return p[F];
      }).reduce(function(F, O) {
        return F.concat(O);
      }, []) : R[h] && !p[h] ? null : (g[h] && (h = g[h]), p[h] && !Array.isArray(p[h]) && (p[h] = p[h].split(/\s+/)), p[h]);
    }
  }(je, je.exports)), je.exports;
}
var vr = { exports: {} }, Te = {}, Dr = { exports: {} }, _r = { exports: {} }, Bn;
function ro() {
  if (Bn) return _r.exports;
  Bn = 1;
  var t = Se.EventEmitter, s = ae, c = 0, v = _r.exports = function(d) {
    t.call(this), this.id = ++c, this.name = d;
  };
  return s.inherits(v, t), _r.exports;
}
var br = { exports: {} }, kn;
function Dn() {
  if (kn) return br.exports;
  kn = 1;
  var t = ae, s = ro(), c = br.exports = function(v, d) {
    s.call(this, v), this.workDone = 0, this.workTodo = d || 0;
  };
  return t.inherits(c, s), c.prototype.completed = function() {
    return this.workTodo === 0 ? 0 : this.workDone / this.workTodo;
  }, c.prototype.addWork = function(v) {
    this.workTodo += v, this.emit("change", this.name, this.completed(), this);
  }, c.prototype.completeWork = function(v) {
    this.workDone += v, this.workDone > this.workTodo && (this.workDone = this.workTodo), this.emit("change", this.name, this.completed(), this);
  }, c.prototype.finish = function() {
    this.workTodo = this.workDone = 1, this.emit("change", this.name, 1, this);
  }, br.exports;
}
var gr = { exports: {} }, Ue = { exports: {} }, mr, qn;
function to() {
  return qn || (qn = 1, mr = vn), mr;
}
var Er, Pn;
function ko() {
  if (Pn) return Er;
  Pn = 1;
  function t(y, u) {
    var b = Object.keys(y);
    if (Object.getOwnPropertySymbols) {
      var e = Object.getOwnPropertySymbols(y);
      u && (e = e.filter(function(_) {
        return Object.getOwnPropertyDescriptor(y, _).enumerable;
      })), b.push.apply(b, e);
    }
    return b;
  }
  function s(y) {
    for (var u = 1; u < arguments.length; u++) {
      var b = arguments[u] != null ? arguments[u] : {};
      u % 2 ? t(Object(b), !0).forEach(function(e) {
        c(y, e, b[e]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(y, Object.getOwnPropertyDescriptors(b)) : t(Object(b)).forEach(function(e) {
        Object.defineProperty(y, e, Object.getOwnPropertyDescriptor(b, e));
      });
    }
    return y;
  }
  function c(y, u, b) {
    return u = r(u), u in y ? Object.defineProperty(y, u, { value: b, enumerable: !0, configurable: !0, writable: !0 }) : y[u] = b, y;
  }
  function v(y, u) {
    if (!(y instanceof u))
      throw new TypeError("Cannot call a class as a function");
  }
  function d(y, u) {
    for (var b = 0; b < u.length; b++) {
      var e = u[b];
      e.enumerable = e.enumerable || !1, e.configurable = !0, "value" in e && (e.writable = !0), Object.defineProperty(y, r(e.key), e);
    }
  }
  function i(y, u, b) {
    return u && d(y.prototype, u), Object.defineProperty(y, "prototype", { writable: !1 }), y;
  }
  function r(y) {
    var u = o(y, "string");
    return typeof u == "symbol" ? u : String(u);
  }
  function o(y, u) {
    if (typeof y != "object" || y === null) return y;
    var b = y[Symbol.toPrimitive];
    if (b !== void 0) {
      var e = b.call(y, u);
      if (typeof e != "object") return e;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(y);
  }
  var a = rr, f = a.Buffer, n = ae, D = n.inspect, l = D && D.custom || "inspect";
  function E(y, u, b) {
    f.prototype.copy.call(y, u, b);
  }
  return Er = /* @__PURE__ */ function() {
    function y() {
      v(this, y), this.head = null, this.tail = null, this.length = 0;
    }
    return i(y, [{
      key: "push",
      value: function(b) {
        var e = {
          data: b,
          next: null
        };
        this.length > 0 ? this.tail.next = e : this.head = e, this.tail = e, ++this.length;
      }
    }, {
      key: "unshift",
      value: function(b) {
        var e = {
          data: b,
          next: this.head
        };
        this.length === 0 && (this.tail = e), this.head = e, ++this.length;
      }
    }, {
      key: "shift",
      value: function() {
        if (this.length !== 0) {
          var b = this.head.data;
          return this.length === 1 ? this.head = this.tail = null : this.head = this.head.next, --this.length, b;
        }
      }
    }, {
      key: "clear",
      value: function() {
        this.head = this.tail = null, this.length = 0;
      }
    }, {
      key: "join",
      value: function(b) {
        if (this.length === 0) return "";
        for (var e = this.head, _ = "" + e.data; e = e.next; ) _ += b + e.data;
        return _;
      }
    }, {
      key: "concat",
      value: function(b) {
        if (this.length === 0) return f.alloc(0);
        for (var e = f.allocUnsafe(b >>> 0), _ = this.head, w = 0; _; )
          E(_.data, e, w), w += _.data.length, _ = _.next;
        return e;
      }
      // Consumes a specified amount of bytes or characters from the buffered data.
    }, {
      key: "consume",
      value: function(b, e) {
        var _;
        return b < this.head.data.length ? (_ = this.head.data.slice(0, b), this.head.data = this.head.data.slice(b)) : b === this.head.data.length ? _ = this.shift() : _ = e ? this._getString(b) : this._getBuffer(b), _;
      }
    }, {
      key: "first",
      value: function() {
        return this.head.data;
      }
      // Consumes a specified amount of characters from the buffered data.
    }, {
      key: "_getString",
      value: function(b) {
        var e = this.head, _ = 1, w = e.data;
        for (b -= w.length; e = e.next; ) {
          var h = e.data, p = b > h.length ? h.length : b;
          if (p === h.length ? w += h : w += h.slice(0, b), b -= p, b === 0) {
            p === h.length ? (++_, e.next ? this.head = e.next : this.head = this.tail = null) : (this.head = e, e.data = h.slice(p));
            break;
          }
          ++_;
        }
        return this.length -= _, w;
      }
      // Consumes a specified amount of bytes from the buffered data.
    }, {
      key: "_getBuffer",
      value: function(b) {
        var e = f.allocUnsafe(b), _ = this.head, w = 1;
        for (_.data.copy(e), b -= _.data.length; _ = _.next; ) {
          var h = _.data, p = b > h.length ? h.length : b;
          if (h.copy(e, e.length - b, 0, p), b -= p, b === 0) {
            p === h.length ? (++w, _.next ? this.head = _.next : this.head = this.tail = null) : (this.head = _, _.data = h.slice(p));
            break;
          }
          ++w;
        }
        return this.length -= w, e;
      }
      // Make sure the linked list only shows the minimal necessary information.
    }, {
      key: l,
      value: function(b, e) {
        return D(this, s(s({}, e), {}, {
          // Only inspect one level.
          depth: 0,
          // It should not recurse.
          customInspect: !1
        }));
      }
    }]), y;
  }(), Er;
}
var yr, $n;
function no() {
  if ($n) return yr;
  $n = 1;
  function t(r, o) {
    var a = this, f = this._readableState && this._readableState.destroyed, n = this._writableState && this._writableState.destroyed;
    return f || n ? (o ? o(r) : r && (this._writableState ? this._writableState.errorEmitted || (this._writableState.errorEmitted = !0, process.nextTick(d, this, r)) : process.nextTick(d, this, r)), this) : (this._readableState && (this._readableState.destroyed = !0), this._writableState && (this._writableState.destroyed = !0), this._destroy(r || null, function(D) {
      !o && D ? a._writableState ? a._writableState.errorEmitted ? process.nextTick(c, a) : (a._writableState.errorEmitted = !0, process.nextTick(s, a, D)) : process.nextTick(s, a, D) : o ? (process.nextTick(c, a), o(D)) : process.nextTick(c, a);
    }), this);
  }
  function s(r, o) {
    d(r, o), c(r);
  }
  function c(r) {
    r._writableState && !r._writableState.emitClose || r._readableState && !r._readableState.emitClose || r.emit("close");
  }
  function v() {
    this._readableState && (this._readableState.destroyed = !1, this._readableState.reading = !1, this._readableState.ended = !1, this._readableState.endEmitted = !1), this._writableState && (this._writableState.destroyed = !1, this._writableState.ended = !1, this._writableState.ending = !1, this._writableState.finalCalled = !1, this._writableState.prefinished = !1, this._writableState.finished = !1, this._writableState.errorEmitted = !1);
  }
  function d(r, o) {
    r.emit("error", o);
  }
  function i(r, o) {
    var a = r._readableState, f = r._writableState;
    a && a.autoDestroy || f && f.autoDestroy ? r.destroy(o) : r.emit("error", o);
  }
  return yr = {
    destroy: t,
    undestroy: v,
    errorOrDestroy: i
  }, yr;
}
var wr = {}, Mn;
function ve() {
  if (Mn) return wr;
  Mn = 1;
  const t = {};
  function s(r, o, a) {
    a || (a = Error);
    function f(D, l, E) {
      return typeof o == "string" ? o : o(D, l, E);
    }
    class n extends a {
      constructor(l, E, y) {
        super(f(l, E, y));
      }
    }
    n.prototype.name = a.name, n.prototype.code = r, t[r] = n;
  }
  function c(r, o) {
    if (Array.isArray(r)) {
      const a = r.length;
      return r = r.map((f) => String(f)), a > 2 ? `one of ${o} ${r.slice(0, a - 1).join(", ")}, or ` + r[a - 1] : a === 2 ? `one of ${o} ${r[0]} or ${r[1]}` : `of ${o} ${r[0]}`;
    } else
      return `of ${o} ${String(r)}`;
  }
  function v(r, o, a) {
    return r.substr(0, o.length) === o;
  }
  function d(r, o, a) {
    return (a === void 0 || a > r.length) && (a = r.length), r.substring(a - o.length, a) === o;
  }
  function i(r, o, a) {
    return typeof a != "number" && (a = 0), a + o.length > r.length ? !1 : r.indexOf(o, a) !== -1;
  }
  return s("ERR_INVALID_OPT_VALUE", function(r, o) {
    return 'The value "' + o + '" is invalid for option "' + r + '"';
  }, TypeError), s("ERR_INVALID_ARG_TYPE", function(r, o, a) {
    let f;
    typeof o == "string" && v(o, "not ") ? (f = "must not be", o = o.replace(/^not /, "")) : f = "must be";
    let n;
    if (d(r, " argument"))
      n = `The ${r} ${f} ${c(o, "type")}`;
    else {
      const D = i(r, ".") ? "property" : "argument";
      n = `The "${r}" ${D} ${f} ${c(o, "type")}`;
    }
    return n += `. Received type ${typeof a}`, n;
  }, TypeError), s("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF"), s("ERR_METHOD_NOT_IMPLEMENTED", function(r) {
    return "The " + r + " method is not implemented";
  }), s("ERR_STREAM_PREMATURE_CLOSE", "Premature close"), s("ERR_STREAM_DESTROYED", function(r) {
    return "Cannot call " + r + " after a stream was destroyed";
  }), s("ERR_MULTIPLE_CALLBACK", "Callback called multiple times"), s("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable"), s("ERR_STREAM_WRITE_AFTER_END", "write after end"), s("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError), s("ERR_UNKNOWN_ENCODING", function(r) {
    return "Unknown encoding: " + r;
  }, TypeError), s("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event"), wr.codes = t, wr;
}
var Rr, jn;
function io() {
  if (jn) return Rr;
  jn = 1;
  var t = ve().codes.ERR_INVALID_OPT_VALUE;
  function s(v, d, i) {
    return v.highWaterMark != null ? v.highWaterMark : d ? v[i] : null;
  }
  function c(v, d, i, r) {
    var o = s(d, r, i);
    if (o != null) {
      if (!(isFinite(o) && Math.floor(o) === o) || o < 0) {
        var a = r ? i : "highWaterMark";
        throw new t(a, o);
      }
      return Math.floor(o);
    }
    return v.objectMode ? 16 : 16 * 1024;
  }
  return Rr = {
    getHighWaterMark: c
  }, Rr;
}
var We = { exports: {} }, Ge = { exports: {} }, Un;
function qo() {
  return Un || (Un = 1, typeof Object.create == "function" ? Ge.exports = function(s, c) {
    c && (s.super_ = c, s.prototype = Object.create(c.prototype, {
      constructor: {
        value: s,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }));
  } : Ge.exports = function(s, c) {
    if (c) {
      s.super_ = c;
      var v = function() {
      };
      v.prototype = c.prototype, s.prototype = new v(), s.prototype.constructor = s;
    }
  }), Ge.exports;
}
var Wn;
function Fe() {
  if (Wn) return We.exports;
  Wn = 1;
  try {
    var t = require("util");
    if (typeof t.inherits != "function") throw "";
    We.exports = t.inherits;
  } catch {
    We.exports = qo();
  }
  return We.exports;
}
var Cr, Gn;
function Po() {
  return Gn || (Gn = 1, Cr = ae.deprecate), Cr;
}
var Sr, Hn;
function ao() {
  if (Hn) return Sr;
  Hn = 1, Sr = C;
  function t(I) {
    var L = this;
    this.next = null, this.entry = null, this.finish = function() {
      Z(L, I);
    };
  }
  var s;
  C.WritableState = g;
  var c = {
    deprecate: Po()
  }, v = to(), d = rr.Buffer, i = (typeof oe < "u" ? oe : typeof window < "u" ? window : typeof self < "u" ? self : {}).Uint8Array || function() {
  };
  function r(I) {
    return d.from(I);
  }
  function o(I) {
    return d.isBuffer(I) || I instanceof i;
  }
  var a = no(), f = io(), n = f.getHighWaterMark, D = ve().codes, l = D.ERR_INVALID_ARG_TYPE, E = D.ERR_METHOD_NOT_IMPLEMENTED, y = D.ERR_MULTIPLE_CALLBACK, u = D.ERR_STREAM_CANNOT_PIPE, b = D.ERR_STREAM_DESTROYED, e = D.ERR_STREAM_NULL_VALUES, _ = D.ERR_STREAM_WRITE_AFTER_END, w = D.ERR_UNKNOWN_ENCODING, h = a.errorOrDestroy;
  Fe()(C, v);
  function p() {
  }
  function g(I, L, j) {
    s = s || Ce(), I = I || {}, typeof j != "boolean" && (j = L instanceof s), this.objectMode = !!I.objectMode, j && (this.objectMode = this.objectMode || !!I.writableObjectMode), this.highWaterMark = n(this, I, "writableHighWaterMark", j), this.finalCalled = !1, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1, this.destroyed = !1;
    var Y = I.decodeStrings === !1;
    this.decodeStrings = !Y, this.defaultEncoding = I.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function(z) {
      U(L, z);
    }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.emitClose = I.emitClose !== !1, this.autoDestroy = !!I.autoDestroy, this.bufferedRequestCount = 0, this.corkedRequestsFree = new t(this);
  }
  g.prototype.getBuffer = function() {
    for (var L = this.bufferedRequest, j = []; L; )
      j.push(L), L = L.next;
    return j;
  }, function() {
    try {
      Object.defineProperty(g.prototype, "buffer", {
        get: c.deprecate(function() {
          return this.getBuffer();
        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
      });
    } catch {
    }
  }();
  var R;
  typeof Symbol == "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] == "function" ? (R = Function.prototype[Symbol.hasInstance], Object.defineProperty(C, Symbol.hasInstance, {
    value: function(L) {
      return R.call(this, L) ? !0 : this !== C ? !1 : L && L._writableState instanceof g;
    }
  })) : R = function(L) {
    return L instanceof this;
  };
  function C(I) {
    s = s || Ce();
    var L = this instanceof s;
    if (!L && !R.call(C, this)) return new C(I);
    this._writableState = new g(I, this, L), this.writable = !0, I && (typeof I.write == "function" && (this._write = I.write), typeof I.writev == "function" && (this._writev = I.writev), typeof I.destroy == "function" && (this._destroy = I.destroy), typeof I.final == "function" && (this._final = I.final)), v.call(this);
  }
  C.prototype.pipe = function() {
    h(this, new u());
  };
  function m(I, L) {
    var j = new _();
    h(I, j), process.nextTick(L, j);
  }
  function F(I, L, j, Y) {
    var z;
    return j === null ? z = new e() : typeof j != "string" && !L.objectMode && (z = new l("chunk", ["string", "Buffer"], j)), z ? (h(I, z), process.nextTick(Y, z), !1) : !0;
  }
  C.prototype.write = function(I, L, j) {
    var Y = this._writableState, z = !1, S = !Y.objectMode && o(I);
    return S && !d.isBuffer(I) && (I = r(I)), typeof L == "function" && (j = L, L = null), S ? L = "buffer" : L || (L = Y.defaultEncoding), typeof j != "function" && (j = p), Y.ending ? m(this, j) : (S || F(this, Y, I, j)) && (Y.pendingcb++, z = T(this, Y, S, I, L, j)), z;
  }, C.prototype.cork = function() {
    this._writableState.corked++;
  }, C.prototype.uncork = function() {
    var I = this._writableState;
    I.corked && (I.corked--, !I.writing && !I.corked && !I.bufferProcessing && I.bufferedRequest && M(this, I));
  }, C.prototype.setDefaultEncoding = function(L) {
    if (typeof L == "string" && (L = L.toLowerCase()), !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((L + "").toLowerCase()) > -1)) throw new w(L);
    return this._writableState.defaultEncoding = L, this;
  }, Object.defineProperty(C.prototype, "writableBuffer", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState && this._writableState.getBuffer();
    }
  });
  function O(I, L, j) {
    return !I.objectMode && I.decodeStrings !== !1 && typeof L == "string" && (L = d.from(L, j)), L;
  }
  Object.defineProperty(C.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function T(I, L, j, Y, z, S) {
    if (!j) {
      var A = O(L, Y, z);
      Y !== A && (j = !0, z = "buffer", Y = A);
    }
    var $ = L.objectMode ? 1 : Y.length;
    L.length += $;
    var H = L.length < L.highWaterMark;
    if (H || (L.needDrain = !0), L.writing || L.corked) {
      var J = L.lastBufferedRequest;
      L.lastBufferedRequest = {
        chunk: Y,
        encoding: z,
        isBuf: j,
        callback: S,
        next: null
      }, J ? J.next = L.lastBufferedRequest : L.bufferedRequest = L.lastBufferedRequest, L.bufferedRequestCount += 1;
    } else
      x(I, L, !1, $, Y, z, S);
    return H;
  }
  function x(I, L, j, Y, z, S, A) {
    L.writelen = Y, L.writecb = A, L.writing = !0, L.sync = !0, L.destroyed ? L.onwrite(new b("write")) : j ? I._writev(z, L.onwrite) : I._write(z, S, L.onwrite), L.sync = !1;
  }
  function B(I, L, j, Y, z) {
    --L.pendingcb, j ? (process.nextTick(z, Y), process.nextTick(G, I, L), I._writableState.errorEmitted = !0, h(I, Y)) : (z(Y), I._writableState.errorEmitted = !0, h(I, Y), G(I, L));
  }
  function k(I) {
    I.writing = !1, I.writecb = null, I.length -= I.writelen, I.writelen = 0;
  }
  function U(I, L) {
    var j = I._writableState, Y = j.sync, z = j.writecb;
    if (typeof z != "function") throw new y();
    if (k(j), L) B(I, j, Y, L, z);
    else {
      var S = W(j) || I.destroyed;
      !S && !j.corked && !j.bufferProcessing && j.bufferedRequest && M(I, j), Y ? process.nextTick(q, I, j, S, z) : q(I, j, S, z);
    }
  }
  function q(I, L, j, Y) {
    j || P(I, L), L.pendingcb--, Y(), G(I, L);
  }
  function P(I, L) {
    L.length === 0 && L.needDrain && (L.needDrain = !1, I.emit("drain"));
  }
  function M(I, L) {
    L.bufferProcessing = !0;
    var j = L.bufferedRequest;
    if (I._writev && j && j.next) {
      var Y = L.bufferedRequestCount, z = new Array(Y), S = L.corkedRequestsFree;
      S.entry = j;
      for (var A = 0, $ = !0; j; )
        z[A] = j, j.isBuf || ($ = !1), j = j.next, A += 1;
      z.allBuffers = $, x(I, L, !0, L.length, z, "", S.finish), L.pendingcb++, L.lastBufferedRequest = null, S.next ? (L.corkedRequestsFree = S.next, S.next = null) : L.corkedRequestsFree = new t(L), L.bufferedRequestCount = 0;
    } else {
      for (; j; ) {
        var H = j.chunk, J = j.encoding, K = j.callback, Q = L.objectMode ? 1 : H.length;
        if (x(I, L, !1, Q, H, J, K), j = j.next, L.bufferedRequestCount--, L.writing)
          break;
      }
      j === null && (L.lastBufferedRequest = null);
    }
    L.bufferedRequest = j, L.bufferProcessing = !1;
  }
  C.prototype._write = function(I, L, j) {
    j(new E("_write()"));
  }, C.prototype._writev = null, C.prototype.end = function(I, L, j) {
    var Y = this._writableState;
    return typeof I == "function" ? (j = I, I = null, L = null) : typeof L == "function" && (j = L, L = null), I != null && this.write(I, L), Y.corked && (Y.corked = 1, this.uncork()), Y.ending || X(this, Y, j), this;
  }, Object.defineProperty(C.prototype, "writableLength", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.length;
    }
  });
  function W(I) {
    return I.ending && I.length === 0 && I.bufferedRequest === null && !I.finished && !I.writing;
  }
  function V(I, L) {
    I._final(function(j) {
      L.pendingcb--, j && h(I, j), L.prefinished = !0, I.emit("prefinish"), G(I, L);
    });
  }
  function N(I, L) {
    !L.prefinished && !L.finalCalled && (typeof I._final == "function" && !L.destroyed ? (L.pendingcb++, L.finalCalled = !0, process.nextTick(V, I, L)) : (L.prefinished = !0, I.emit("prefinish")));
  }
  function G(I, L) {
    var j = W(L);
    if (j && (N(I, L), L.pendingcb === 0 && (L.finished = !0, I.emit("finish"), L.autoDestroy))) {
      var Y = I._readableState;
      (!Y || Y.autoDestroy && Y.endEmitted) && I.destroy();
    }
    return j;
  }
  function X(I, L, j) {
    L.ending = !0, G(I, L), j && (L.finished ? process.nextTick(j) : I.once("finish", j)), L.ended = !0, I.writable = !1;
  }
  function Z(I, L, j) {
    var Y = I.entry;
    for (I.entry = null; Y; ) {
      var z = Y.callback;
      L.pendingcb--, z(j), Y = Y.next;
    }
    L.corkedRequestsFree.next = I;
  }
  return Object.defineProperty(C.prototype, "destroyed", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState === void 0 ? !1 : this._writableState.destroyed;
    },
    set: function(L) {
      this._writableState && (this._writableState.destroyed = L);
    }
  }), C.prototype.destroy = a.destroy, C.prototype._undestroy = a.undestroy, C.prototype._destroy = function(I, L) {
    L(I);
  }, Sr;
}
var Fr, Vn;
function Ce() {
  if (Vn) return Fr;
  Vn = 1;
  var t = Object.keys || function(f) {
    var n = [];
    for (var D in f) n.push(D);
    return n;
  };
  Fr = r;
  var s = oo(), c = ao();
  Fe()(r, s);
  for (var v = t(c.prototype), d = 0; d < v.length; d++) {
    var i = v[d];
    r.prototype[i] || (r.prototype[i] = c.prototype[i]);
  }
  function r(f) {
    if (!(this instanceof r)) return new r(f);
    s.call(this, f), c.call(this, f), this.allowHalfOpen = !0, f && (f.readable === !1 && (this.readable = !1), f.writable === !1 && (this.writable = !1), f.allowHalfOpen === !1 && (this.allowHalfOpen = !1, this.once("end", o)));
  }
  Object.defineProperty(r.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.highWaterMark;
    }
  }), Object.defineProperty(r.prototype, "writableBuffer", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState && this._writableState.getBuffer();
    }
  }), Object.defineProperty(r.prototype, "writableLength", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.length;
    }
  });
  function o() {
    this._writableState.ended || process.nextTick(a, this);
  }
  function a(f) {
    f.end();
  }
  return Object.defineProperty(r.prototype, "destroyed", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState === void 0 || this._writableState === void 0 ? !1 : this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function(n) {
      this._readableState === void 0 || this._writableState === void 0 || (this._readableState.destroyed = n, this._writableState.destroyed = n);
    }
  }), Fr;
}
var Ar = {}, He = { exports: {} };
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
var Yn;
function $o() {
  return Yn || (Yn = 1, function(t, s) {
    var c = rr, v = c.Buffer;
    function d(r, o) {
      for (var a in r)
        o[a] = r[a];
    }
    v.from && v.alloc && v.allocUnsafe && v.allocUnsafeSlow ? t.exports = c : (d(c, s), s.Buffer = i);
    function i(r, o, a) {
      return v(r, o, a);
    }
    i.prototype = Object.create(v.prototype), d(v, i), i.from = function(r, o, a) {
      if (typeof r == "number")
        throw new TypeError("Argument must not be a number");
      return v(r, o, a);
    }, i.alloc = function(r, o, a) {
      if (typeof r != "number")
        throw new TypeError("Argument must be a number");
      var f = v(r);
      return o !== void 0 ? typeof a == "string" ? f.fill(o, a) : f.fill(o) : f.fill(0), f;
    }, i.allocUnsafe = function(r) {
      if (typeof r != "number")
        throw new TypeError("Argument must be a number");
      return v(r);
    }, i.allocUnsafeSlow = function(r) {
      if (typeof r != "number")
        throw new TypeError("Argument must be a number");
      return c.SlowBuffer(r);
    };
  }(He, He.exports)), He.exports;
}
var Xn;
function zn() {
  if (Xn) return Ar;
  Xn = 1;
  var t = $o().Buffer, s = t.isEncoding || function(e) {
    switch (e = "" + e, e && e.toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
      case "raw":
        return !0;
      default:
        return !1;
    }
  };
  function c(e) {
    if (!e) return "utf8";
    for (var _; ; )
      switch (e) {
        case "utf8":
        case "utf-8":
          return "utf8";
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return "utf16le";
        case "latin1":
        case "binary":
          return "latin1";
        case "base64":
        case "ascii":
        case "hex":
          return e;
        default:
          if (_) return;
          e = ("" + e).toLowerCase(), _ = !0;
      }
  }
  function v(e) {
    var _ = c(e);
    if (typeof _ != "string" && (t.isEncoding === s || !s(e))) throw new Error("Unknown encoding: " + e);
    return _ || e;
  }
  Ar.StringDecoder = d;
  function d(e) {
    this.encoding = v(e);
    var _;
    switch (this.encoding) {
      case "utf16le":
        this.text = D, this.end = l, _ = 4;
        break;
      case "utf8":
        this.fillLast = a, _ = 4;
        break;
      case "base64":
        this.text = E, this.end = y, _ = 3;
        break;
      default:
        this.write = u, this.end = b;
        return;
    }
    this.lastNeed = 0, this.lastTotal = 0, this.lastChar = t.allocUnsafe(_);
  }
  d.prototype.write = function(e) {
    if (e.length === 0) return "";
    var _, w;
    if (this.lastNeed) {
      if (_ = this.fillLast(e), _ === void 0) return "";
      w = this.lastNeed, this.lastNeed = 0;
    } else
      w = 0;
    return w < e.length ? _ ? _ + this.text(e, w) : this.text(e, w) : _ || "";
  }, d.prototype.end = n, d.prototype.text = f, d.prototype.fillLast = function(e) {
    if (this.lastNeed <= e.length)
      return e.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
    e.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, e.length), this.lastNeed -= e.length;
  };
  function i(e) {
    return e <= 127 ? 0 : e >> 5 === 6 ? 2 : e >> 4 === 14 ? 3 : e >> 3 === 30 ? 4 : e >> 6 === 2 ? -1 : -2;
  }
  function r(e, _, w) {
    var h = _.length - 1;
    if (h < w) return 0;
    var p = i(_[h]);
    return p >= 0 ? (p > 0 && (e.lastNeed = p - 1), p) : --h < w || p === -2 ? 0 : (p = i(_[h]), p >= 0 ? (p > 0 && (e.lastNeed = p - 2), p) : --h < w || p === -2 ? 0 : (p = i(_[h]), p >= 0 ? (p > 0 && (p === 2 ? p = 0 : e.lastNeed = p - 3), p) : 0));
  }
  function o(e, _, w) {
    if ((_[0] & 192) !== 128)
      return e.lastNeed = 0, "�";
    if (e.lastNeed > 1 && _.length > 1) {
      if ((_[1] & 192) !== 128)
        return e.lastNeed = 1, "�";
      if (e.lastNeed > 2 && _.length > 2 && (_[2] & 192) !== 128)
        return e.lastNeed = 2, "�";
    }
  }
  function a(e) {
    var _ = this.lastTotal - this.lastNeed, w = o(this, e);
    if (w !== void 0) return w;
    if (this.lastNeed <= e.length)
      return e.copy(this.lastChar, _, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
    e.copy(this.lastChar, _, 0, e.length), this.lastNeed -= e.length;
  }
  function f(e, _) {
    var w = r(this, e, _);
    if (!this.lastNeed) return e.toString("utf8", _);
    this.lastTotal = w;
    var h = e.length - (w - this.lastNeed);
    return e.copy(this.lastChar, 0, h), e.toString("utf8", _, h);
  }
  function n(e) {
    var _ = e && e.length ? this.write(e) : "";
    return this.lastNeed ? _ + "�" : _;
  }
  function D(e, _) {
    if ((e.length - _) % 2 === 0) {
      var w = e.toString("utf16le", _);
      if (w) {
        var h = w.charCodeAt(w.length - 1);
        if (h >= 55296 && h <= 56319)
          return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = e[e.length - 2], this.lastChar[1] = e[e.length - 1], w.slice(0, -1);
      }
      return w;
    }
    return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = e[e.length - 1], e.toString("utf16le", _, e.length - 1);
  }
  function l(e) {
    var _ = e && e.length ? this.write(e) : "";
    if (this.lastNeed) {
      var w = this.lastTotal - this.lastNeed;
      return _ + this.lastChar.toString("utf16le", 0, w);
    }
    return _;
  }
  function E(e, _) {
    var w = (e.length - _) % 3;
    return w === 0 ? e.toString("base64", _) : (this.lastNeed = 3 - w, this.lastTotal = 3, w === 1 ? this.lastChar[0] = e[e.length - 1] : (this.lastChar[0] = e[e.length - 2], this.lastChar[1] = e[e.length - 1]), e.toString("base64", _, e.length - w));
  }
  function y(e) {
    var _ = e && e.length ? this.write(e) : "";
    return this.lastNeed ? _ + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : _;
  }
  function u(e) {
    return e.toString(this.encoding);
  }
  function b(e) {
    return e && e.length ? this.write(e) : "";
  }
  return Ar;
}
var Or, Kn;
function _n() {
  if (Kn) return Or;
  Kn = 1;
  var t = ve().codes.ERR_STREAM_PREMATURE_CLOSE;
  function s(i) {
    var r = !1;
    return function() {
      if (!r) {
        r = !0;
        for (var o = arguments.length, a = new Array(o), f = 0; f < o; f++)
          a[f] = arguments[f];
        i.apply(this, a);
      }
    };
  }
  function c() {
  }
  function v(i) {
    return i.setHeader && typeof i.abort == "function";
  }
  function d(i, r, o) {
    if (typeof r == "function") return d(i, null, r);
    r || (r = {}), o = s(o || c);
    var a = r.readable || r.readable !== !1 && i.readable, f = r.writable || r.writable !== !1 && i.writable, n = function() {
      i.writable || l();
    }, D = i._writableState && i._writableState.finished, l = function() {
      f = !1, D = !0, a || o.call(i);
    }, E = i._readableState && i._readableState.endEmitted, y = function() {
      a = !1, E = !0, f || o.call(i);
    }, u = function(w) {
      o.call(i, w);
    }, b = function() {
      var w;
      if (a && !E)
        return (!i._readableState || !i._readableState.ended) && (w = new t()), o.call(i, w);
      if (f && !D)
        return (!i._writableState || !i._writableState.ended) && (w = new t()), o.call(i, w);
    }, e = function() {
      i.req.on("finish", l);
    };
    return v(i) ? (i.on("complete", l), i.on("abort", b), i.req ? e() : i.on("request", e)) : f && !i._writableState && (i.on("end", n), i.on("close", n)), i.on("end", y), i.on("finish", l), r.error !== !1 && i.on("error", u), i.on("close", b), function() {
      i.removeListener("complete", l), i.removeListener("abort", b), i.removeListener("request", e), i.req && i.req.removeListener("finish", l), i.removeListener("end", n), i.removeListener("close", n), i.removeListener("finish", l), i.removeListener("end", y), i.removeListener("error", u), i.removeListener("close", b);
    };
  }
  return Or = d, Or;
}
var Tr, Zn;
function Mo() {
  if (Zn) return Tr;
  Zn = 1;
  var t;
  function s(w, h, p) {
    return h = c(h), h in w ? Object.defineProperty(w, h, { value: p, enumerable: !0, configurable: !0, writable: !0 }) : w[h] = p, w;
  }
  function c(w) {
    var h = v(w, "string");
    return typeof h == "symbol" ? h : String(h);
  }
  function v(w, h) {
    if (typeof w != "object" || w === null) return w;
    var p = w[Symbol.toPrimitive];
    if (p !== void 0) {
      var g = p.call(w, h);
      if (typeof g != "object") return g;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (h === "string" ? String : Number)(w);
  }
  var d = _n(), i = Symbol("lastResolve"), r = Symbol("lastReject"), o = Symbol("error"), a = Symbol("ended"), f = Symbol("lastPromise"), n = Symbol("handlePromise"), D = Symbol("stream");
  function l(w, h) {
    return {
      value: w,
      done: h
    };
  }
  function E(w) {
    var h = w[i];
    if (h !== null) {
      var p = w[D].read();
      p !== null && (w[f] = null, w[i] = null, w[r] = null, h(l(p, !1)));
    }
  }
  function y(w) {
    process.nextTick(E, w);
  }
  function u(w, h) {
    return function(p, g) {
      w.then(function() {
        if (h[a]) {
          p(l(void 0, !0));
          return;
        }
        h[n](p, g);
      }, g);
    };
  }
  var b = Object.getPrototypeOf(function() {
  }), e = Object.setPrototypeOf((t = {
    get stream() {
      return this[D];
    },
    next: function() {
      var h = this, p = this[o];
      if (p !== null)
        return Promise.reject(p);
      if (this[a])
        return Promise.resolve(l(void 0, !0));
      if (this[D].destroyed)
        return new Promise(function(m, F) {
          process.nextTick(function() {
            h[o] ? F(h[o]) : m(l(void 0, !0));
          });
        });
      var g = this[f], R;
      if (g)
        R = new Promise(u(g, this));
      else {
        var C = this[D].read();
        if (C !== null)
          return Promise.resolve(l(C, !1));
        R = new Promise(this[n]);
      }
      return this[f] = R, R;
    }
  }, s(t, Symbol.asyncIterator, function() {
    return this;
  }), s(t, "return", function() {
    var h = this;
    return new Promise(function(p, g) {
      h[D].destroy(null, function(R) {
        if (R) {
          g(R);
          return;
        }
        p(l(void 0, !0));
      });
    });
  }), t), b), _ = function(h) {
    var p, g = Object.create(e, (p = {}, s(p, D, {
      value: h,
      writable: !0
    }), s(p, i, {
      value: null,
      writable: !0
    }), s(p, r, {
      value: null,
      writable: !0
    }), s(p, o, {
      value: null,
      writable: !0
    }), s(p, a, {
      value: h._readableState.endEmitted,
      writable: !0
    }), s(p, n, {
      value: function(C, m) {
        var F = g[D].read();
        F ? (g[f] = null, g[i] = null, g[r] = null, C(l(F, !1))) : (g[i] = C, g[r] = m);
      },
      writable: !0
    }), p));
    return g[f] = null, d(h, function(R) {
      if (R && R.code !== "ERR_STREAM_PREMATURE_CLOSE") {
        var C = g[r];
        C !== null && (g[f] = null, g[i] = null, g[r] = null, C(R)), g[o] = R;
        return;
      }
      var m = g[i];
      m !== null && (g[f] = null, g[i] = null, g[r] = null, m(l(void 0, !0))), g[a] = !0;
    }), h.on("readable", y.bind(null, g)), g;
  };
  return Tr = _, Tr;
}
var xr, Qn;
function jo() {
  if (Qn) return xr;
  Qn = 1;
  function t(f, n, D, l, E, y, u) {
    try {
      var b = f[y](u), e = b.value;
    } catch (_) {
      D(_);
      return;
    }
    b.done ? n(e) : Promise.resolve(e).then(l, E);
  }
  function s(f) {
    return function() {
      var n = this, D = arguments;
      return new Promise(function(l, E) {
        var y = f.apply(n, D);
        function u(e) {
          t(y, l, E, u, b, "next", e);
        }
        function b(e) {
          t(y, l, E, u, b, "throw", e);
        }
        u(void 0);
      });
    };
  }
  function c(f, n) {
    var D = Object.keys(f);
    if (Object.getOwnPropertySymbols) {
      var l = Object.getOwnPropertySymbols(f);
      n && (l = l.filter(function(E) {
        return Object.getOwnPropertyDescriptor(f, E).enumerable;
      })), D.push.apply(D, l);
    }
    return D;
  }
  function v(f) {
    for (var n = 1; n < arguments.length; n++) {
      var D = arguments[n] != null ? arguments[n] : {};
      n % 2 ? c(Object(D), !0).forEach(function(l) {
        d(f, l, D[l]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(f, Object.getOwnPropertyDescriptors(D)) : c(Object(D)).forEach(function(l) {
        Object.defineProperty(f, l, Object.getOwnPropertyDescriptor(D, l));
      });
    }
    return f;
  }
  function d(f, n, D) {
    return n = i(n), n in f ? Object.defineProperty(f, n, { value: D, enumerable: !0, configurable: !0, writable: !0 }) : f[n] = D, f;
  }
  function i(f) {
    var n = r(f, "string");
    return typeof n == "symbol" ? n : String(n);
  }
  function r(f, n) {
    if (typeof f != "object" || f === null) return f;
    var D = f[Symbol.toPrimitive];
    if (D !== void 0) {
      var l = D.call(f, n);
      if (typeof l != "object") return l;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (n === "string" ? String : Number)(f);
  }
  var o = ve().codes.ERR_INVALID_ARG_TYPE;
  function a(f, n, D) {
    var l;
    if (n && typeof n.next == "function")
      l = n;
    else if (n && n[Symbol.asyncIterator]) l = n[Symbol.asyncIterator]();
    else if (n && n[Symbol.iterator]) l = n[Symbol.iterator]();
    else throw new o("iterable", ["Iterable"], n);
    var E = new f(v({
      objectMode: !0
    }, D)), y = !1;
    E._read = function() {
      y || (y = !0, u());
    };
    function u() {
      return b.apply(this, arguments);
    }
    function b() {
      return b = s(function* () {
        try {
          var e = yield l.next(), _ = e.value, w = e.done;
          w ? E.push(null) : E.push(yield _) ? u() : y = !1;
        } catch (h) {
          E.destroy(h);
        }
      }), b.apply(this, arguments);
    }
    return E;
  }
  return xr = a, xr;
}
var Ir, Jn;
function oo() {
  if (Jn) return Ir;
  Jn = 1, Ir = m;
  var t;
  m.ReadableState = C, Se.EventEmitter;
  var s = function(A, $) {
    return A.listeners($).length;
  }, c = to(), v = rr.Buffer, d = (typeof oe < "u" ? oe : typeof window < "u" ? window : typeof self < "u" ? self : {}).Uint8Array || function() {
  };
  function i(S) {
    return v.from(S);
  }
  function r(S) {
    return v.isBuffer(S) || S instanceof d;
  }
  var o = ae, a;
  o && o.debuglog ? a = o.debuglog("stream") : a = function() {
  };
  var f = ko(), n = no(), D = io(), l = D.getHighWaterMark, E = ve().codes, y = E.ERR_INVALID_ARG_TYPE, u = E.ERR_STREAM_PUSH_AFTER_EOF, b = E.ERR_METHOD_NOT_IMPLEMENTED, e = E.ERR_STREAM_UNSHIFT_AFTER_END_EVENT, _, w, h;
  Fe()(m, c);
  var p = n.errorOrDestroy, g = ["error", "close", "destroy", "pause", "resume"];
  function R(S, A, $) {
    if (typeof S.prependListener == "function") return S.prependListener(A, $);
    !S._events || !S._events[A] ? S.on(A, $) : Array.isArray(S._events[A]) ? S._events[A].unshift($) : S._events[A] = [$, S._events[A]];
  }
  function C(S, A, $) {
    t = t || Ce(), S = S || {}, typeof $ != "boolean" && ($ = A instanceof t), this.objectMode = !!S.objectMode, $ && (this.objectMode = this.objectMode || !!S.readableObjectMode), this.highWaterMark = l(this, S, "readableHighWaterMark", $), this.buffer = new f(), this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.paused = !0, this.emitClose = S.emitClose !== !1, this.autoDestroy = !!S.autoDestroy, this.destroyed = !1, this.defaultEncoding = S.defaultEncoding || "utf8", this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, S.encoding && (_ || (_ = zn().StringDecoder), this.decoder = new _(S.encoding), this.encoding = S.encoding);
  }
  function m(S) {
    if (t = t || Ce(), !(this instanceof m)) return new m(S);
    var A = this instanceof t;
    this._readableState = new C(S, this, A), this.readable = !0, S && (typeof S.read == "function" && (this._read = S.read), typeof S.destroy == "function" && (this._destroy = S.destroy)), c.call(this);
  }
  Object.defineProperty(m.prototype, "destroyed", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState === void 0 ? !1 : this._readableState.destroyed;
    },
    set: function(A) {
      this._readableState && (this._readableState.destroyed = A);
    }
  }), m.prototype.destroy = n.destroy, m.prototype._undestroy = n.undestroy, m.prototype._destroy = function(S, A) {
    A(S);
  }, m.prototype.push = function(S, A) {
    var $ = this._readableState, H;
    return $.objectMode ? H = !0 : typeof S == "string" && (A = A || $.defaultEncoding, A !== $.encoding && (S = v.from(S, A), A = ""), H = !0), F(this, S, A, !1, H);
  }, m.prototype.unshift = function(S) {
    return F(this, S, null, !0, !1);
  };
  function F(S, A, $, H, J) {
    a("readableAddChunk", A);
    var K = S._readableState;
    if (A === null)
      K.reading = !1, U(S, K);
    else {
      var Q;
      if (J || (Q = T(K, A)), Q)
        p(S, Q);
      else if (K.objectMode || A && A.length > 0)
        if (typeof A != "string" && !K.objectMode && Object.getPrototypeOf(A) !== v.prototype && (A = i(A)), H)
          K.endEmitted ? p(S, new e()) : O(S, K, A, !0);
        else if (K.ended)
          p(S, new u());
        else {
          if (K.destroyed)
            return !1;
          K.reading = !1, K.decoder && !$ ? (A = K.decoder.write(A), K.objectMode || A.length !== 0 ? O(S, K, A, !1) : M(S, K)) : O(S, K, A, !1);
        }
      else H || (K.reading = !1, M(S, K));
    }
    return !K.ended && (K.length < K.highWaterMark || K.length === 0);
  }
  function O(S, A, $, H) {
    A.flowing && A.length === 0 && !A.sync ? (A.awaitDrain = 0, S.emit("data", $)) : (A.length += A.objectMode ? 1 : $.length, H ? A.buffer.unshift($) : A.buffer.push($), A.needReadable && q(S)), M(S, A);
  }
  function T(S, A) {
    var $;
    return !r(A) && typeof A != "string" && A !== void 0 && !S.objectMode && ($ = new y("chunk", ["string", "Buffer", "Uint8Array"], A)), $;
  }
  m.prototype.isPaused = function() {
    return this._readableState.flowing === !1;
  }, m.prototype.setEncoding = function(S) {
    _ || (_ = zn().StringDecoder);
    var A = new _(S);
    this._readableState.decoder = A, this._readableState.encoding = this._readableState.decoder.encoding;
    for (var $ = this._readableState.buffer.head, H = ""; $ !== null; )
      H += A.write($.data), $ = $.next;
    return this._readableState.buffer.clear(), H !== "" && this._readableState.buffer.push(H), this._readableState.length = H.length, this;
  };
  var x = 1073741824;
  function B(S) {
    return S >= x ? S = x : (S--, S |= S >>> 1, S |= S >>> 2, S |= S >>> 4, S |= S >>> 8, S |= S >>> 16, S++), S;
  }
  function k(S, A) {
    return S <= 0 || A.length === 0 && A.ended ? 0 : A.objectMode ? 1 : S !== S ? A.flowing && A.length ? A.buffer.head.data.length : A.length : (S > A.highWaterMark && (A.highWaterMark = B(S)), S <= A.length ? S : A.ended ? A.length : (A.needReadable = !0, 0));
  }
  m.prototype.read = function(S) {
    a("read", S), S = parseInt(S, 10);
    var A = this._readableState, $ = S;
    if (S !== 0 && (A.emittedReadable = !1), S === 0 && A.needReadable && ((A.highWaterMark !== 0 ? A.length >= A.highWaterMark : A.length > 0) || A.ended))
      return a("read: emitReadable", A.length, A.ended), A.length === 0 && A.ended ? j(this) : q(this), null;
    if (S = k(S, A), S === 0 && A.ended)
      return A.length === 0 && j(this), null;
    var H = A.needReadable;
    a("need readable", H), (A.length === 0 || A.length - S < A.highWaterMark) && (H = !0, a("length less than watermark", H)), A.ended || A.reading ? (H = !1, a("reading or ended", H)) : H && (a("do read"), A.reading = !0, A.sync = !0, A.length === 0 && (A.needReadable = !0), this._read(A.highWaterMark), A.sync = !1, A.reading || (S = k($, A)));
    var J;
    return S > 0 ? J = L(S, A) : J = null, J === null ? (A.needReadable = A.length <= A.highWaterMark, S = 0) : (A.length -= S, A.awaitDrain = 0), A.length === 0 && (A.ended || (A.needReadable = !0), $ !== S && A.ended && j(this)), J !== null && this.emit("data", J), J;
  };
  function U(S, A) {
    if (a("onEofChunk"), !A.ended) {
      if (A.decoder) {
        var $ = A.decoder.end();
        $ && $.length && (A.buffer.push($), A.length += A.objectMode ? 1 : $.length);
      }
      A.ended = !0, A.sync ? q(S) : (A.needReadable = !1, A.emittedReadable || (A.emittedReadable = !0, P(S)));
    }
  }
  function q(S) {
    var A = S._readableState;
    a("emitReadable", A.needReadable, A.emittedReadable), A.needReadable = !1, A.emittedReadable || (a("emitReadable", A.flowing), A.emittedReadable = !0, process.nextTick(P, S));
  }
  function P(S) {
    var A = S._readableState;
    a("emitReadable_", A.destroyed, A.length, A.ended), !A.destroyed && (A.length || A.ended) && (S.emit("readable"), A.emittedReadable = !1), A.needReadable = !A.flowing && !A.ended && A.length <= A.highWaterMark, I(S);
  }
  function M(S, A) {
    A.readingMore || (A.readingMore = !0, process.nextTick(W, S, A));
  }
  function W(S, A) {
    for (; !A.reading && !A.ended && (A.length < A.highWaterMark || A.flowing && A.length === 0); ) {
      var $ = A.length;
      if (a("maybeReadMore read 0"), S.read(0), $ === A.length)
        break;
    }
    A.readingMore = !1;
  }
  m.prototype._read = function(S) {
    p(this, new b("_read()"));
  }, m.prototype.pipe = function(S, A) {
    var $ = this, H = this._readableState;
    switch (H.pipesCount) {
      case 0:
        H.pipes = S;
        break;
      case 1:
        H.pipes = [H.pipes, S];
        break;
      default:
        H.pipes.push(S);
        break;
    }
    H.pipesCount += 1, a("pipe count=%d opts=%j", H.pipesCount, A);
    var J = (!A || A.end !== !1) && S !== process.stdout && S !== process.stderr, K = J ? ne : he;
    H.endEmitted ? process.nextTick(K) : $.once("end", K), S.on("unpipe", Q);
    function Q(le, ge) {
      a("onunpipe"), le === $ && ge && ge.hasUnpiped === !1 && (ge.hasUnpiped = !0, qe());
    }
    function ne() {
      a("onend"), S.end();
    }
    var De = V($);
    S.on("drain", De);
    var _e = !1;
    function qe() {
      a("cleanup"), S.removeListener("close", de), S.removeListener("finish", be), S.removeListener("drain", De), S.removeListener("error", Oe), S.removeListener("unpipe", Q), $.removeListener("end", ne), $.removeListener("end", he), $.removeListener("data", Pe), _e = !0, H.awaitDrain && (!S._writableState || S._writableState.needDrain) && De();
    }
    $.on("data", Pe);
    function Pe(le) {
      a("ondata");
      var ge = S.write(le);
      a("dest.write", ge), ge === !1 && ((H.pipesCount === 1 && H.pipes === S || H.pipesCount > 1 && z(H.pipes, S) !== -1) && !_e && (a("false write response, pause", H.awaitDrain), H.awaitDrain++), $.pause());
    }
    function Oe(le) {
      a("onerror", le), he(), S.removeListener("error", Oe), s(S, "error") === 0 && p(S, le);
    }
    R(S, "error", Oe);
    function de() {
      S.removeListener("finish", be), he();
    }
    S.once("close", de);
    function be() {
      a("onfinish"), S.removeListener("close", de), he();
    }
    S.once("finish", be);
    function he() {
      a("unpipe"), $.unpipe(S);
    }
    return S.emit("pipe", $), H.flowing || (a("pipe resume"), $.resume()), S;
  };
  function V(S) {
    return function() {
      var $ = S._readableState;
      a("pipeOnDrain", $.awaitDrain), $.awaitDrain && $.awaitDrain--, $.awaitDrain === 0 && s(S, "data") && ($.flowing = !0, I(S));
    };
  }
  m.prototype.unpipe = function(S) {
    var A = this._readableState, $ = {
      hasUnpiped: !1
    };
    if (A.pipesCount === 0) return this;
    if (A.pipesCount === 1)
      return S && S !== A.pipes ? this : (S || (S = A.pipes), A.pipes = null, A.pipesCount = 0, A.flowing = !1, S && S.emit("unpipe", this, $), this);
    if (!S) {
      var H = A.pipes, J = A.pipesCount;
      A.pipes = null, A.pipesCount = 0, A.flowing = !1;
      for (var K = 0; K < J; K++) H[K].emit("unpipe", this, {
        hasUnpiped: !1
      });
      return this;
    }
    var Q = z(A.pipes, S);
    return Q === -1 ? this : (A.pipes.splice(Q, 1), A.pipesCount -= 1, A.pipesCount === 1 && (A.pipes = A.pipes[0]), S.emit("unpipe", this, $), this);
  }, m.prototype.on = function(S, A) {
    var $ = c.prototype.on.call(this, S, A), H = this._readableState;
    return S === "data" ? (H.readableListening = this.listenerCount("readable") > 0, H.flowing !== !1 && this.resume()) : S === "readable" && !H.endEmitted && !H.readableListening && (H.readableListening = H.needReadable = !0, H.flowing = !1, H.emittedReadable = !1, a("on readable", H.length, H.reading), H.length ? q(this) : H.reading || process.nextTick(G, this)), $;
  }, m.prototype.addListener = m.prototype.on, m.prototype.removeListener = function(S, A) {
    var $ = c.prototype.removeListener.call(this, S, A);
    return S === "readable" && process.nextTick(N, this), $;
  }, m.prototype.removeAllListeners = function(S) {
    var A = c.prototype.removeAllListeners.apply(this, arguments);
    return (S === "readable" || S === void 0) && process.nextTick(N, this), A;
  };
  function N(S) {
    var A = S._readableState;
    A.readableListening = S.listenerCount("readable") > 0, A.resumeScheduled && !A.paused ? A.flowing = !0 : S.listenerCount("data") > 0 && S.resume();
  }
  function G(S) {
    a("readable nexttick read 0"), S.read(0);
  }
  m.prototype.resume = function() {
    var S = this._readableState;
    return S.flowing || (a("resume"), S.flowing = !S.readableListening, X(this, S)), S.paused = !1, this;
  };
  function X(S, A) {
    A.resumeScheduled || (A.resumeScheduled = !0, process.nextTick(Z, S, A));
  }
  function Z(S, A) {
    a("resume", A.reading), A.reading || S.read(0), A.resumeScheduled = !1, S.emit("resume"), I(S), A.flowing && !A.reading && S.read(0);
  }
  m.prototype.pause = function() {
    return a("call pause flowing=%j", this._readableState.flowing), this._readableState.flowing !== !1 && (a("pause"), this._readableState.flowing = !1, this.emit("pause")), this._readableState.paused = !0, this;
  };
  function I(S) {
    var A = S._readableState;
    for (a("flow", A.flowing); A.flowing && S.read() !== null; ) ;
  }
  m.prototype.wrap = function(S) {
    var A = this, $ = this._readableState, H = !1;
    S.on("end", function() {
      if (a("wrapped end"), $.decoder && !$.ended) {
        var Q = $.decoder.end();
        Q && Q.length && A.push(Q);
      }
      A.push(null);
    }), S.on("data", function(Q) {
      if (a("wrapped data"), $.decoder && (Q = $.decoder.write(Q)), !($.objectMode && Q == null) && !(!$.objectMode && (!Q || !Q.length))) {
        var ne = A.push(Q);
        ne || (H = !0, S.pause());
      }
    });
    for (var J in S)
      this[J] === void 0 && typeof S[J] == "function" && (this[J] = /* @__PURE__ */ function(ne) {
        return function() {
          return S[ne].apply(S, arguments);
        };
      }(J));
    for (var K = 0; K < g.length; K++)
      S.on(g[K], this.emit.bind(this, g[K]));
    return this._read = function(Q) {
      a("wrapped _read", Q), H && (H = !1, S.resume());
    }, this;
  }, typeof Symbol == "function" && (m.prototype[Symbol.asyncIterator] = function() {
    return w === void 0 && (w = Mo()), w(this);
  }), Object.defineProperty(m.prototype, "readableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState.highWaterMark;
    }
  }), Object.defineProperty(m.prototype, "readableBuffer", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState && this._readableState.buffer;
    }
  }), Object.defineProperty(m.prototype, "readableFlowing", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState.flowing;
    },
    set: function(A) {
      this._readableState && (this._readableState.flowing = A);
    }
  }), m._fromList = L, Object.defineProperty(m.prototype, "readableLength", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState.length;
    }
  });
  function L(S, A) {
    if (A.length === 0) return null;
    var $;
    return A.objectMode ? $ = A.buffer.shift() : !S || S >= A.length ? (A.decoder ? $ = A.buffer.join("") : A.buffer.length === 1 ? $ = A.buffer.first() : $ = A.buffer.concat(A.length), A.buffer.clear()) : $ = A.buffer.consume(S, A.decoder), $;
  }
  function j(S) {
    var A = S._readableState;
    a("endReadable", A.endEmitted), A.endEmitted || (A.ended = !0, process.nextTick(Y, A, S));
  }
  function Y(S, A) {
    if (a("endReadableNT", S.endEmitted, S.length), !S.endEmitted && S.length === 0 && (S.endEmitted = !0, A.readable = !1, A.emit("end"), S.autoDestroy)) {
      var $ = A._writableState;
      (!$ || $.autoDestroy && $.finished) && A.destroy();
    }
  }
  typeof Symbol == "function" && (m.from = function(S, A) {
    return h === void 0 && (h = jo()), h(m, S, A);
  });
  function z(S, A) {
    for (var $ = 0, H = S.length; $ < H; $++)
      if (S[$] === A) return $;
    return -1;
  }
  return Ir;
}
var Lr, ei;
function uo() {
  if (ei) return Lr;
  ei = 1, Lr = o;
  var t = ve().codes, s = t.ERR_METHOD_NOT_IMPLEMENTED, c = t.ERR_MULTIPLE_CALLBACK, v = t.ERR_TRANSFORM_ALREADY_TRANSFORMING, d = t.ERR_TRANSFORM_WITH_LENGTH_0, i = Ce();
  Fe()(o, i);
  function r(n, D) {
    var l = this._transformState;
    l.transforming = !1;
    var E = l.writecb;
    if (E === null)
      return this.emit("error", new c());
    l.writechunk = null, l.writecb = null, D != null && this.push(D), E(n);
    var y = this._readableState;
    y.reading = !1, (y.needReadable || y.length < y.highWaterMark) && this._read(y.highWaterMark);
  }
  function o(n) {
    if (!(this instanceof o)) return new o(n);
    i.call(this, n), this._transformState = {
      afterTransform: r.bind(this),
      needTransform: !1,
      transforming: !1,
      writecb: null,
      writechunk: null,
      writeencoding: null
    }, this._readableState.needReadable = !0, this._readableState.sync = !1, n && (typeof n.transform == "function" && (this._transform = n.transform), typeof n.flush == "function" && (this._flush = n.flush)), this.on("prefinish", a);
  }
  function a() {
    var n = this;
    typeof this._flush == "function" && !this._readableState.destroyed ? this._flush(function(D, l) {
      f(n, D, l);
    }) : f(this, null, null);
  }
  o.prototype.push = function(n, D) {
    return this._transformState.needTransform = !1, i.prototype.push.call(this, n, D);
  }, o.prototype._transform = function(n, D, l) {
    l(new s("_transform()"));
  }, o.prototype._write = function(n, D, l) {
    var E = this._transformState;
    if (E.writecb = l, E.writechunk = n, E.writeencoding = D, !E.transforming) {
      var y = this._readableState;
      (E.needTransform || y.needReadable || y.length < y.highWaterMark) && this._read(y.highWaterMark);
    }
  }, o.prototype._read = function(n) {
    var D = this._transformState;
    D.writechunk !== null && !D.transforming ? (D.transforming = !0, this._transform(D.writechunk, D.writeencoding, D.afterTransform)) : D.needTransform = !0;
  }, o.prototype._destroy = function(n, D) {
    i.prototype._destroy.call(this, n, function(l) {
      D(l);
    });
  };
  function f(n, D, l) {
    if (D) return n.emit("error", D);
    if (l != null && n.push(l), n._writableState.length) throw new d();
    if (n._transformState.transforming) throw new v();
    return n.push(null);
  }
  return Lr;
}
var Nr, ri;
function Uo() {
  if (ri) return Nr;
  ri = 1, Nr = s;
  var t = uo();
  Fe()(s, t);
  function s(c) {
    if (!(this instanceof s)) return new s(c);
    t.call(this, c);
  }
  return s.prototype._transform = function(c, v, d) {
    d(null, c);
  }, Nr;
}
var Br, ti;
function Wo() {
  if (ti) return Br;
  ti = 1;
  var t;
  function s(l) {
    var E = !1;
    return function() {
      E || (E = !0, l.apply(void 0, arguments));
    };
  }
  var c = ve().codes, v = c.ERR_MISSING_ARGS, d = c.ERR_STREAM_DESTROYED;
  function i(l) {
    if (l) throw l;
  }
  function r(l) {
    return l.setHeader && typeof l.abort == "function";
  }
  function o(l, E, y, u) {
    u = s(u);
    var b = !1;
    l.on("close", function() {
      b = !0;
    }), t === void 0 && (t = _n()), t(l, {
      readable: E,
      writable: y
    }, function(_) {
      if (_) return u(_);
      b = !0, u();
    });
    var e = !1;
    return function(_) {
      if (!b && !e) {
        if (e = !0, r(l)) return l.abort();
        if (typeof l.destroy == "function") return l.destroy();
        u(_ || new d("pipe"));
      }
    };
  }
  function a(l) {
    l();
  }
  function f(l, E) {
    return l.pipe(E);
  }
  function n(l) {
    return !l.length || typeof l[l.length - 1] != "function" ? i : l.pop();
  }
  function D() {
    for (var l = arguments.length, E = new Array(l), y = 0; y < l; y++)
      E[y] = arguments[y];
    var u = n(E);
    if (Array.isArray(E[0]) && (E = E[0]), E.length < 2)
      throw new v("streams");
    var b, e = E.map(function(_, w) {
      var h = w < E.length - 1, p = w > 0;
      return o(_, h, p, function(g) {
        b || (b = g), g && e.forEach(a), !h && (e.forEach(a), u(b));
      });
    });
    return E.reduce(f);
  }
  return Br = D, Br;
}
var ni;
function Go() {
  return ni || (ni = 1, function(t, s) {
    var c = vn;
    process.env.READABLE_STREAM === "disable" && c ? (t.exports = c.Readable, Object.assign(t.exports, c), t.exports.Stream = c) : (s = t.exports = oo(), s.Stream = c || s, s.Readable = s, s.Writable = ao(), s.Duplex = Ce(), s.Transform = uo(), s.PassThrough = Uo(), s.finished = _n(), s.pipeline = Wo());
  }(Ue, Ue.exports)), Ue.exports;
}
var kr, ii;
function Ho() {
  if (ii) return kr;
  ii = 1, kr = t;
  function t(s, c) {
    if (!(this instanceof t)) return new t(s, c);
    this.proto = s, this.target = c, this.methods = [], this.getters = [], this.setters = [], this.fluents = [];
  }
  return t.prototype.method = function(s) {
    var c = this.proto, v = this.target;
    return this.methods.push(s), c[s] = function() {
      return this[v][s].apply(this[v], arguments);
    }, this;
  }, t.prototype.access = function(s) {
    return this.getter(s).setter(s);
  }, t.prototype.getter = function(s) {
    var c = this.proto, v = this.target;
    return this.getters.push(s), c.__defineGetter__(s, function() {
      return this[v][s];
    }), this;
  }, t.prototype.setter = function(s) {
    var c = this.proto, v = this.target;
    return this.setters.push(s), c.__defineSetter__(s, function(d) {
      return this[v][s] = d;
    }), this;
  }, t.prototype.fluent = function(s) {
    var c = this.proto, v = this.target;
    return this.fluents.push(s), c[s] = function(d) {
      return typeof d < "u" ? (this[v][s] = d, this) : this[v][s];
    }, this;
  }, kr;
}
var ai;
function so() {
  if (ai) return gr.exports;
  ai = 1;
  var t = ae, s = Go(), c = Ho(), v = Dn(), d = gr.exports = function(r, o, a) {
    s.Transform.call(this, a), this.tracker = new v(r, o), this.name = r, this.id = this.tracker.id, this.tracker.on("change", i(this));
  };
  t.inherits(d, s.Transform);
  function i(r) {
    return function(o, a, f) {
      r.emit("change", o, a, r);
    };
  }
  return d.prototype._transform = function(r, o, a) {
    this.tracker.completeWork(r.length ? r.length : 1), this.push(r), a();
  }, d.prototype._flush = function(r) {
    this.tracker.finish(), r();
  }, c(d.prototype, "tracker").method("completed").method("addWork").method("finish"), gr.exports;
}
var oi;
function Vo() {
  if (oi) return Dr.exports;
  oi = 1;
  var t = ae, s = ro(), c = Dn(), v = so(), d = Dr.exports = function(o) {
    s.call(this, o), this.parentGroup = null, this.trackers = [], this.completion = {}, this.weight = {}, this.totalWeight = 0, this.finished = !1, this.bubbleChange = i(this);
  };
  t.inherits(d, s);
  function i(o) {
    return function(a, f, n) {
      o.completion[n.id] = f, !o.finished && o.emit("change", a || o.name, o.completed(), o);
    };
  }
  d.prototype.nameInTree = function() {
    for (var o = [], a = this; a; )
      o.unshift(a.name), a = a.parentGroup;
    return o.join("/");
  }, d.prototype.addUnit = function(o, a) {
    if (o.addUnit) {
      for (var f = this; f; ) {
        if (o === f)
          throw new Error(
            "Attempted to add tracker group " + o.name + " to tree that already includes it " + this.nameInTree(this)
          );
        f = f.parentGroup;
      }
      o.parentGroup = this;
    }
    return this.weight[o.id] = a || 1, this.totalWeight += this.weight[o.id], this.trackers.push(o), this.completion[o.id] = o.completed(), o.on("change", this.bubbleChange), this.finished || this.emit("change", o.name, this.completion[o.id], o), o;
  }, d.prototype.completed = function() {
    if (this.trackers.length === 0)
      return 0;
    for (var o = 1 / this.totalWeight, a = 0, f = 0; f < this.trackers.length; f++) {
      var n = this.trackers[f].id;
      a += o * this.weight[n] * this.completion[n];
    }
    return a;
  }, d.prototype.newGroup = function(o, a) {
    return this.addUnit(new d(o), a);
  }, d.prototype.newItem = function(o, a, f) {
    return this.addUnit(new c(o, a), f);
  }, d.prototype.newStream = function(o, a, f) {
    return this.addUnit(new v(o, a), f);
  }, d.prototype.finish = function() {
    this.finished = !0, this.trackers.length || this.addUnit(new c(), 1, !0);
    for (var o = 0; o < this.trackers.length; o++) {
      var a = this.trackers[o];
      a.finish(), a.removeListener("change", this.bubbleChange);
    }
    this.emit("change", this.name, 1, this);
  };
  var r = "                                  ";
  return d.prototype.debug = function(o) {
    o = o || 0;
    var a = o ? r.substr(0, o) : "", f = a + (this.name || "top") + ": " + this.completed() + `
`;
    return this.trackers.forEach(function(n) {
      n instanceof d ? f += n.debug(o + 1) : f += a + " " + n.name + ": " + n.completed() + `
`;
    }), f;
  }, Dr.exports;
}
var ui;
function Yo() {
  return ui || (ui = 1, Te.TrackerGroup = Vo(), Te.Tracker = Dn(), Te.TrackerStream = so()), Te;
}
var qr = { exports: {} }, ee = {}, si;
function bn() {
  if (si) return ee;
  si = 1;
  var t = "\x1B[";
  ee.up = function(d) {
    return t + (d || "") + "A";
  }, ee.down = function(d) {
    return t + (d || "") + "B";
  }, ee.forward = function(d) {
    return t + (d || "") + "C";
  }, ee.back = function(d) {
    return t + (d || "") + "D";
  }, ee.nextLine = function(d) {
    return t + (d || "") + "E";
  }, ee.previousLine = function(d) {
    return t + (d || "") + "F";
  }, ee.horizontalAbsolute = function(d) {
    if (d == null) throw new Error("horizontalAboslute requires a column to position to");
    return t + d + "G";
  }, ee.eraseData = function() {
    return t + "J";
  }, ee.eraseLine = function() {
    return t + "K";
  }, ee.goto = function(v, d) {
    return t + d + ";" + v + "H";
  }, ee.gotoSOL = function() {
    return "\r";
  }, ee.beep = function() {
    return "\x07";
  }, ee.hideCursor = function() {
    return t + "?25l";
  }, ee.showCursor = function() {
    return t + "?25h";
  };
  var s = {
    reset: 0,
    // styles
    bold: 1,
    italic: 3,
    underline: 4,
    inverse: 7,
    // resets
    stopBold: 22,
    stopItalic: 23,
    stopUnderline: 24,
    stopInverse: 27,
    // colors
    white: 37,
    black: 30,
    blue: 34,
    cyan: 36,
    green: 32,
    magenta: 35,
    red: 31,
    yellow: 33,
    bgWhite: 47,
    bgBlack: 40,
    bgBlue: 44,
    bgCyan: 46,
    bgGreen: 42,
    bgMagenta: 45,
    bgRed: 41,
    bgYellow: 43,
    grey: 90,
    brightBlack: 90,
    brightRed: 91,
    brightGreen: 92,
    brightYellow: 93,
    brightBlue: 94,
    brightMagenta: 95,
    brightCyan: 96,
    brightWhite: 97,
    bgGrey: 100,
    bgBrightBlack: 100,
    bgBrightRed: 101,
    bgBrightGreen: 102,
    bgBrightYellow: 103,
    bgBrightBlue: 104,
    bgBrightMagenta: 105,
    bgBrightCyan: 106,
    bgBrightWhite: 107
  };
  ee.color = function(d) {
    return (arguments.length !== 1 || !Array.isArray(d)) && (d = Array.prototype.slice.call(arguments)), t + d.map(c).join(";") + "m";
  };
  function c(v) {
    if (s[v] != null) return s[v];
    throw new Error("Unknown color or style name: " + v);
  }
  return ee;
}
var Pr = { exports: {} }, xe = {}, Ve = { exports: {} }, $r, li;
function Xo() {
  return li || (li = 1, $r = ({ onlyFirst: t = !1 } = {}) => {
    const s = [
      "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
      "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
    ].join("|");
    return new RegExp(s, t ? void 0 : "g");
  }), $r;
}
var Mr, fi;
function lo() {
  if (fi) return Mr;
  fi = 1;
  const t = Xo();
  return Mr = (s) => typeof s == "string" ? s.replace(t(), "") : s, Mr;
}
var Ye = { exports: {} }, ci;
function zo() {
  if (ci) return Ye.exports;
  ci = 1;
  const t = (s) => Number.isNaN(s) ? !1 : s >= 4352 && (s <= 4447 || // Hangul Jamo
  s === 9001 || // LEFT-POINTING ANGLE BRACKET
  s === 9002 || // RIGHT-POINTING ANGLE BRACKET
  // CJK Radicals Supplement .. Enclosed CJK Letters and Months
  11904 <= s && s <= 12871 && s !== 12351 || // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
  12880 <= s && s <= 19903 || // CJK Unified Ideographs .. Yi Radicals
  19968 <= s && s <= 42182 || // Hangul Jamo Extended-A
  43360 <= s && s <= 43388 || // Hangul Syllables
  44032 <= s && s <= 55203 || // CJK Compatibility Ideographs
  63744 <= s && s <= 64255 || // Vertical Forms
  65040 <= s && s <= 65049 || // CJK Compatibility Forms .. Small Form Variants
  65072 <= s && s <= 65131 || // Halfwidth and Fullwidth Forms
  65281 <= s && s <= 65376 || 65504 <= s && s <= 65510 || // Kana Supplement
  110592 <= s && s <= 110593 || // Enclosed Ideographic Supplement
  127488 <= s && s <= 127569 || // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
  131072 <= s && s <= 262141);
  return Ye.exports = t, Ye.exports.default = t, Ye.exports;
}
var jr, hi;
function Ko() {
  return hi || (hi = 1, jr = function() {
    return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
  }), jr;
}
var di;
function ar() {
  if (di) return Ve.exports;
  di = 1;
  const t = lo(), s = zo(), c = Ko(), v = (d) => {
    if (typeof d != "string" || d.length === 0 || (d = t(d), d.length === 0))
      return 0;
    d = d.replace(c(), "  ");
    let i = 0;
    for (let r = 0; r < d.length; r++) {
      const o = d.codePointAt(r);
      o <= 31 || o >= 127 && o <= 159 || o >= 768 && o <= 879 || (o > 65535 && r++, i += s(o) ? 2 : 1);
    }
    return i;
  };
  return Ve.exports = v, Ve.exports.default = v, Ve.exports;
}
var pi;
function Zo() {
  if (pi) return xe;
  pi = 1;
  var t = ar();
  xe.center = d, xe.left = c, xe.right = v;
  function s(i) {
    var r = "", o = " ", a = i;
    do
      a % 2 && (r += o), a = Math.floor(a / 2), o += o;
    while (a);
    return r;
  }
  function c(i, r) {
    var o = i.trimRight();
    if (o.length === 0 && i.length >= r) return i;
    var a = "", f = t(o);
    return f < r && (a = s(r - f)), o + a;
  }
  function v(i, r) {
    var o = i.trimLeft();
    if (o.length === 0 && i.length >= r) return i;
    var a = "", f = t(o);
    return f < r && (a = s(r - f)), a + o;
  }
  function d(i, r) {
    var o = i.trim();
    if (o.length === 0 && i.length >= r) return i;
    var a = "", f = "", n = t(o);
    if (n < r) {
      var D = parseInt((r - n) / 2, 10);
      a = s(D), f = s(r - (n + D));
    }
    return a + o + f;
  }
  return xe;
}
var Ur, vi;
function gn() {
  if (vi) return Ur;
  vi = 1, Ur = v;
  function t(D) {
    return D != null && typeof D == "object" && D.hasOwnProperty("callee");
  }
  const s = {
    "*": { label: "any", check: () => !0 },
    A: { label: "array", check: (D) => Array.isArray(D) || t(D) },
    S: { label: "string", check: (D) => typeof D == "string" },
    N: { label: "number", check: (D) => typeof D == "number" },
    F: { label: "function", check: (D) => typeof D == "function" },
    O: { label: "object", check: (D) => typeof D == "object" && D != null && !s.A.check(D) && !s.E.check(D) },
    B: { label: "boolean", check: (D) => typeof D == "boolean" },
    E: { label: "error", check: (D) => D instanceof Error },
    Z: { label: "null", check: (D) => D == null }
  };
  function c(D, l) {
    const E = l[D.length] = l[D.length] || [];
    E.indexOf(D) === -1 && E.push(D);
  }
  function v(D, l) {
    if (arguments.length !== 2) throw a(["SA"], arguments.length);
    if (!D) throw d(0);
    if (!l) throw d(1);
    if (!s.S.check(D)) throw r(0, ["string"], D);
    if (!s.A.check(l)) throw r(1, ["array"], l);
    const E = D.split("|"), y = {};
    E.forEach((b) => {
      for (let e = 0; e < b.length; ++e) {
        const _ = b[e];
        if (!s[_]) throw i(e, _);
      }
      if (/E.*E/.test(b)) throw f(b);
      c(b, y), /E/.test(b) && (c(b.replace(/E.*$/, "E"), y), c(b.replace(/E/, "Z"), y), b.length === 1 && c("", y));
    });
    let u = y[l.length];
    if (!u)
      throw a(Object.keys(y), l.length);
    for (let b = 0; b < l.length; ++b) {
      let e = u.filter((_) => {
        const w = _[b], h = s[w].check;
        return h(l[b]);
      });
      if (!e.length) {
        const _ = u.map((w) => s[w[b]].label).filter((w) => w != null);
        throw r(b, _, l[b]);
      }
      u = e;
    }
  }
  function d(D) {
    return n("EMISSINGARG", "Missing required argument #" + (D + 1));
  }
  function i(D, l) {
    return n("EUNKNOWNTYPE", "Unknown type " + l + " in argument #" + (D + 1));
  }
  function r(D, l, E) {
    let y;
    return Object.keys(s).forEach((u) => {
      s[u].check(E) && (y = s[u].label);
    }), n("EINVALIDTYPE", "Argument #" + (D + 1) + ": Expected " + o(l) + " but got " + y);
  }
  function o(D) {
    return D.join(", ").replace(/, ([^,]+)$/, " or $1");
  }
  function a(D, l) {
    const E = o(D), y = D.every((u) => u.length === 1) ? "argument" : "arguments";
    return n("EWRONGARGCOUNT", "Expected " + E + " " + y + " but got " + l);
  }
  function f(D) {
    return n(
      "ETOOMANYERRORTYPES",
      'Only one error type per argument signature is allowed, more than one found in "' + D + '"'
    );
  }
  function n(D, l) {
    const E = new TypeError(l);
    return E.code = D, Error.captureStackTrace && Error.captureStackTrace(E, v), E;
  }
  return Ur;
}
var Wr, Di;
function fo() {
  if (Di) return Wr;
  Di = 1;
  var t = ar(), s = lo();
  Wr = c;
  function c(v, d) {
    if (t(v) === 0) return v;
    if (d <= 0) return "";
    if (t(v) <= d) return v;
    for (var i = s(v), r = v.length + i.length, o = v.slice(0, d + r); t(o) > d; )
      o = o.slice(0, -1);
    return o;
  }
  return Wr;
}
var Ie = {}, _i;
function Qo() {
  if (_i) return Ie;
  _i = 1;
  var t = ae, s = Ie.User = function c(v) {
    var d = new Error(v);
    return Error.captureStackTrace(d, c), d.code = "EGAUGE", d;
  };
  return Ie.MissingTemplateValue = function c(v, d) {
    var i = new s(t.format('Missing template value "%s"', v.type));
    return Error.captureStackTrace(i, c), i.template = v, i.values = d, i;
  }, Ie.Internal = function c(v) {
    var d = new Error(v);
    return Error.captureStackTrace(d, c), d.code = "EGAUGEINTERNAL", d;
  }, Ie;
}
var Gr, bi;
function Jo() {
  if (bi) return Gr;
  bi = 1;
  var t = ar();
  Gr = v;
  function s(d) {
    return typeof d != "string" ? !1 : d.slice(-1) === "%";
  }
  function c(d) {
    return Number(d.slice(0, -1)) / 100;
  }
  function v(d, i) {
    if (this.overallOutputLength = i, this.finished = !1, this.type = null, this.value = null, this.length = null, this.maxLength = null, this.minLength = null, this.kerning = null, this.align = "left", this.padLeft = 0, this.padRight = 0, this.index = null, this.first = null, this.last = null, typeof d == "string")
      this.value = d;
    else
      for (var r in d) this[r] = d[r];
    return s(this.length) && (this.length = Math.round(this.overallOutputLength * c(this.length))), s(this.minLength) && (this.minLength = Math.round(this.overallOutputLength * c(this.minLength))), s(this.maxLength) && (this.maxLength = Math.round(this.overallOutputLength * c(this.maxLength))), this;
  }
  return v.prototype = {}, v.prototype.getBaseLength = function() {
    var d = this.length;
    return d == null && typeof this.value == "string" && this.maxLength == null && this.minLength == null && (d = t(this.value)), d;
  }, v.prototype.getLength = function() {
    var d = this.getBaseLength();
    return d == null ? null : d + this.padLeft + this.padRight;
  }, v.prototype.getMaxLength = function() {
    return this.maxLength == null ? null : this.maxLength + this.padLeft + this.padRight;
  }, v.prototype.getMinLength = function() {
    return this.minLength == null ? null : this.minLength + this.padLeft + this.padRight;
  }, Gr;
}
var gi;
function co() {
  if (gi) return Pr.exports;
  gi = 1;
  var t = Zo(), s = gn(), c = fo(), v = Qo(), d = Jo();
  function i(y) {
    return function(u) {
      return E(u, y);
    };
  }
  var r = Pr.exports = function(y, u, b) {
    var e = D(y, u, b), _ = e.map(i(b)).join("");
    return t.left(c(_, y), y);
  };
  function o(y) {
    var u = y.type[0].toUpperCase() + y.type.slice(1);
    return "pre" + u;
  }
  function a(y) {
    var u = y.type[0].toUpperCase() + y.type.slice(1);
    return "post" + u;
  }
  function f(y, u) {
    if (y.type)
      return u[o(y)] || u[a(y)];
  }
  function n(y, u) {
    var b = Object.assign({}, y), e = Object.create(u), _ = [], w = o(b), h = a(b);
    return e[w] && (_.push({ value: e[w] }), e[w] = null), b.minLength = null, b.length = null, b.maxLength = null, _.push(b), e[b.type] = e[b.type], e[h] && (_.push({ value: e[h] }), e[h] = null), function(p, g, R) {
      return r(R, _, e);
    };
  }
  function D(y, u, b) {
    function e(F, O, T) {
      var x = new d(F, y), B = x.type;
      if (x.value == null)
        if (B in b)
          x.value = b[B];
        else {
          if (x.default == null)
            throw new v.MissingTemplateValue(x, b);
          x.value = x.default;
        }
      return x.value == null || x.value === "" ? null : (x.index = O, x.first = O === 0, x.last = O === T.length - 1, f(x, b) && (x.value = n(x, b)), x);
    }
    var _ = u.map(e).filter(function(F) {
      return F != null;
    }), w = y, h = _.length;
    function p(F) {
      F > w && (F = w), w -= F;
    }
    function g(F, O) {
      if (F.finished) throw new v.Internal("Tried to finish template item that was already finished");
      if (O === 1 / 0) throw new v.Internal("Length of template item cannot be infinity");
      if (O != null && (F.length = O), F.minLength = null, F.maxLength = null, --h, F.finished = !0, F.length == null && (F.length = F.getBaseLength()), F.length == null) throw new v.Internal("Finished template items must have a length");
      p(F.getLength());
    }
    _.forEach(function(F) {
      if (F.kerning) {
        var O = F.first ? 0 : _[F.index - 1].padRight;
        !F.first && O < F.kerning && (F.padLeft = F.kerning - O), F.last || (F.padRight = F.kerning);
      }
    }), _.forEach(function(F) {
      F.getBaseLength() != null && g(F);
    });
    var R = 0, C, m;
    do
      C = !1, m = Math.round(w / h), _.forEach(function(F) {
        F.finished || F.maxLength && F.getMaxLength() < m && (g(F, F.maxLength), C = !0);
      });
    while (C && R++ < _.length);
    if (C) throw new v.Internal("Resize loop iterated too many times while determining maxLength");
    R = 0;
    do
      C = !1, m = Math.round(w / h), _.forEach(function(F) {
        F.finished || F.minLength && F.getMinLength() >= m && (g(F, F.minLength), C = !0);
      });
    while (C && R++ < _.length);
    if (C) throw new v.Internal("Resize loop iterated too many times while determining minLength");
    return m = Math.round(w / h), _.forEach(function(F) {
      F.finished || g(F, m);
    }), _;
  }
  function l(y, u, b) {
    return s("OON", arguments), y.type ? y.value(u, u[y.type + "Theme"] || {}, b) : y.value(u, {}, b);
  }
  function E(y, u) {
    var b = y.getBaseLength(), e = typeof y.value == "function" ? l(y, u, b) : y.value;
    if (e == null || e === "") return "";
    var _ = t[y.align] || t.left, w = y.padLeft ? t.left("", y.padLeft) : "", h = y.padRight ? t.right("", y.padRight) : "", p = c(String(e), b), g = _(p, b);
    return w + g + h;
  }
  return Pr.exports;
}
var mi;
function eu() {
  if (mi) return qr.exports;
  mi = 1;
  var t = bn(), s = co(), c = gn(), v = qr.exports = function(d, i, r) {
    r || (r = 80), c("OAN", [d, i, r]), this.showing = !1, this.theme = d, this.width = r, this.template = i;
  };
  return v.prototype = {}, v.prototype.setTheme = function(d) {
    c("O", [d]), this.theme = d;
  }, v.prototype.setTemplate = function(d) {
    c("A", [d]), this.template = d;
  }, v.prototype.setWidth = function(d) {
    c("N", [d]), this.width = d;
  }, v.prototype.hide = function() {
    return t.gotoSOL() + t.eraseLine();
  }, v.prototype.hideCursor = t.hideCursor, v.prototype.showCursor = t.showCursor, v.prototype.show = function(d) {
    var i = Object.create(this.theme);
    for (var r in d)
      i[r] = d[r];
    return s(this.width, this.template, i).trim() + t.color("reset") + t.eraseLine() + t.gotoSOL();
  }, qr.exports;
}
var Hr = { exports: {} }, Ei;
function ru() {
  if (Ei) return Hr.exports;
  Ei = 1;
  var t = pn;
  return Hr.exports = function() {
    if (t.type() == "Windows_NT")
      return !1;
    var s = /UTF-?8$/i, c = process.env.LC_ALL || process.env.LC_CTYPE || process.env.LANG;
    return s.test(c);
  }, Hr.exports;
}
var Vr, yi;
function tu() {
  if (yi) return Vr;
  yi = 1, Vr = d({ alwaysReturn: !0 }, d);
  function t(i, r) {
    return i.level = 0, i.hasBasic = !1, i.has256 = !1, i.has16m = !1, r.alwaysReturn ? i : !1;
  }
  function s(i) {
    return i.hasBasic = !0, i.has256 = !1, i.has16m = !1, i.level = 1, i;
  }
  function c(i) {
    return i.hasBasic = !0, i.has256 = !0, i.has16m = !1, i.level = 2, i;
  }
  function v(i) {
    return i.hasBasic = !0, i.has256 = !0, i.has16m = !0, i.level = 3, i;
  }
  function d(i, r) {
    if (i = i || {}, r = r || {}, typeof i.level == "number")
      switch (i.level) {
        case 0:
          return t(r, i);
        case 1:
          return s(r);
        case 2:
          return c(r);
        case 3:
          return v(r);
      }
    if (r.level = 0, r.hasBasic = !1, r.has256 = !1, r.has16m = !1, typeof process > "u" || !process || !process.stdout || !process.env || !process.platform)
      return t(r, i);
    var o = i.env || process.env, a = i.stream || process.stdout, f = i.term || o.TERM || "", n = i.platform || process.platform;
    if (!i.ignoreTTY && !a.isTTY || !i.ignoreDumb && f === "dumb" && !o.COLORTERM)
      return t(r, i);
    if (n === "win32")
      return s(r);
    if (o.TMUX)
      return c(r);
    if (!i.ignoreCI && (o.CI || o.TEAMCITY_VERSION))
      return o.TRAVIS ? c(r) : t(r, i);
    switch (o.TERM_PROGRAM) {
      case "iTerm.app":
        var D = o.TERM_PROGRAM_VERSION || "0.";
        return /^[0-2]\./.test(D) ? c(r) : v(r);
      case "HyperTerm":
      case "Hyper":
        return v(r);
      case "MacTerm":
        return v(r);
      case "Apple_Terminal":
        return c(r);
    }
    return /^xterm-256/.test(f) ? c(r) : /^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(f) || o.COLORTERM ? s(r) : t(r, i);
  }
  return Vr;
}
var Yr, wi;
function nu() {
  if (wi) return Yr;
  wi = 1;
  var t = tu();
  return Yr = t().hasBasic, Yr;
}
var pe = { exports: {} }, Xr = { exports: {} }, Ri;
function iu() {
  return Ri || (Ri = 1, function(t) {
    t.exports = [
      "SIGABRT",
      "SIGALRM",
      "SIGHUP",
      "SIGINT",
      "SIGTERM"
    ], process.platform !== "win32" && t.exports.push(
      "SIGVTALRM",
      "SIGXCPU",
      "SIGXFSZ",
      "SIGUSR2",
      "SIGTRAP",
      "SIGSYS",
      "SIGQUIT",
      "SIGIOT"
      // should detect profiler and enable/disable accordingly.
      // see #21
      // 'SIGPROF'
    ), process.platform === "linux" && t.exports.push(
      "SIGIO",
      "SIGPOLL",
      "SIGPWR",
      "SIGSTKFLT",
      "SIGUNUSED"
    );
  }(Xr)), Xr.exports;
}
var Ci;
function au() {
  if (Ci) return pe.exports;
  Ci = 1;
  var t = oe.process;
  const s = function(b) {
    return b && typeof b == "object" && typeof b.removeListener == "function" && typeof b.emit == "function" && typeof b.reallyExit == "function" && typeof b.listeners == "function" && typeof b.kill == "function" && typeof b.pid == "number" && typeof b.on == "function";
  };
  if (!s(t))
    pe.exports = function() {
      return function() {
      };
    };
  else {
    var c = tr, v = iu(), d = /^win/i.test(t.platform), i = Se;
    typeof i != "function" && (i = i.EventEmitter);
    var r;
    t.__signal_exit_emitter__ ? r = t.__signal_exit_emitter__ : (r = t.__signal_exit_emitter__ = new i(), r.count = 0, r.emitted = {}), r.infinite || (r.setMaxListeners(1 / 0), r.infinite = !0), pe.exports = function(b, e) {
      if (!s(oe.process))
        return function() {
        };
      c.equal(typeof b, "function", "a callback must be provided for exit handler"), n === !1 && D();
      var _ = "exit";
      e && e.alwaysLast && (_ = "afterexit");
      var w = function() {
        r.removeListener(_, b), r.listeners("exit").length === 0 && r.listeners("afterexit").length === 0 && o();
      };
      return r.on(_, b), w;
    };
    var o = function() {
      !n || !s(oe.process) || (n = !1, v.forEach(function(e) {
        try {
          t.removeListener(e, f[e]);
        } catch {
        }
      }), t.emit = y, t.reallyExit = l, r.count -= 1);
    };
    pe.exports.unload = o;
    var a = function(e, _, w) {
      r.emitted[e] || (r.emitted[e] = !0, r.emit(e, _, w));
    }, f = {};
    v.forEach(function(b) {
      f[b] = function() {
        if (s(oe.process)) {
          var _ = t.listeners(b);
          _.length === r.count && (o(), a("exit", null, b), a("afterexit", null, b), d && b === "SIGHUP" && (b = "SIGINT"), t.kill(t.pid, b));
        }
      };
    }), pe.exports.signals = function() {
      return v;
    };
    var n = !1, D = function() {
      n || !s(oe.process) || (n = !0, r.count += 1, v = v.filter(function(e) {
        try {
          return t.on(e, f[e]), !0;
        } catch {
          return !1;
        }
      }), t.emit = u, t.reallyExit = E);
    };
    pe.exports.load = D;
    var l = t.reallyExit, E = function(e) {
      s(oe.process) && (t.exitCode = e || /* istanbul ignore next */
      0, a("exit", t.exitCode, null), a("afterexit", t.exitCode, null), l.call(t, t.exitCode));
    }, y = t.emit, u = function(e, _) {
      if (e === "exit" && s(oe.process)) {
        _ !== void 0 && (t.exitCode = _);
        var w = y.apply(this, arguments);
        return a("exit", t.exitCode, null), a("afterexit", t.exitCode, null), w;
      } else
        return y.apply(this, arguments);
    };
  }
  return pe.exports;
}
var zr = { exports: {} };
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
var Kr, Si;
function ou() {
  if (Si) return Kr;
  Si = 1;
  var t = Object.getOwnPropertySymbols, s = Object.prototype.hasOwnProperty, c = Object.prototype.propertyIsEnumerable;
  function v(i) {
    if (i == null)
      throw new TypeError("Object.assign cannot be called with null or undefined");
    return Object(i);
  }
  function d() {
    try {
      if (!Object.assign)
        return !1;
      var i = new String("abc");
      if (i[5] = "de", Object.getOwnPropertyNames(i)[0] === "5")
        return !1;
      for (var r = {}, o = 0; o < 10; o++)
        r["_" + String.fromCharCode(o)] = o;
      var a = Object.getOwnPropertyNames(r).map(function(n) {
        return r[n];
      });
      if (a.join("") !== "0123456789")
        return !1;
      var f = {};
      return "abcdefghijklmnopqrst".split("").forEach(function(n) {
        f[n] = n;
      }), Object.keys(Object.assign({}, f)).join("") === "abcdefghijklmnopqrst";
    } catch {
      return !1;
    }
  }
  return Kr = d() ? Object.assign : function(i, r) {
    for (var o, a = v(i), f, n = 1; n < arguments.length; n++) {
      o = Object(arguments[n]);
      for (var D in o)
        s.call(o, D) && (a[D] = o[D]);
      if (t) {
        f = t(o);
        for (var l = 0; l < f.length; l++)
          c.call(o, f[l]) && (a[f[l]] = o[f[l]]);
      }
    }
    return a;
  }, Kr;
}
var Zr, Fi;
function uu() {
  return Fi || (Fi = 1, Zr = function(s, c) {
    return s[c % s.length];
  }), Zr;
}
var Qr, Ai;
function su() {
  if (Ai) return Qr;
  Ai = 1;
  var t = gn(), s = co(), c = fo(), v = ar();
  Qr = function(i, r, o) {
    if (t("ONN", [i, r, o]), o < 0 && (o = 0), o > 1 && (o = 1), r <= 0) return "";
    var a = Math.round(r * o), f = r - a, n = [
      { type: "complete", value: d(i.complete, a), length: a },
      { type: "remaining", value: d(i.remaining, f), length: f }
    ];
    return s(r, n, i);
  };
  function d(i, r) {
    var o = "", a = r;
    do
      a % 2 && (o += i), a = Math.floor(a / 2), i += i;
    while (a && v(o) < r);
    return c(o, r);
  }
  return Qr;
}
var Jr, Oi;
function lu() {
  if (Oi) return Jr;
  Oi = 1;
  var t = uu(), s = su();
  return Jr = {
    activityIndicator: function(c, v, d) {
      if (c.spun != null)
        return t(v, c.spun);
    },
    progressbar: function(c, v, d) {
      if (c.completed != null)
        return s(v, d, c.completed);
    }
  }, Jr;
}
var et, Ti;
function fu() {
  if (Ti) return et;
  Ti = 1;
  var t = ou();
  et = function() {
    return s.newThemeSet();
  };
  var s = {};
  return s.baseTheme = lu(), s.newTheme = function(c, v) {
    return v || (v = c, c = this.baseTheme), t({}, c, v);
  }, s.getThemeNames = function() {
    return Object.keys(this.themes);
  }, s.addTheme = function(c, v, d) {
    this.themes[c] = this.newTheme(v, d);
  }, s.addToAllThemes = function(c) {
    var v = this.themes;
    Object.keys(v).forEach(function(d) {
      t(v[d], c);
    }), t(this.baseTheme, c);
  }, s.getTheme = function(c) {
    if (!this.themes[c]) throw this.newMissingThemeError(c);
    return this.themes[c];
  }, s.setDefault = function(c, v) {
    v == null && (v = c, c = {});
    var d = c.platform == null ? "fallback" : c.platform, i = !!c.hasUnicode, r = !!c.hasColor;
    this.defaults[d] || (this.defaults[d] = { true: {}, false: {} }), this.defaults[d][i][r] = v;
  }, s.getDefault = function(c) {
    c || (c = {});
    var v = c.platform || process.platform, d = this.defaults[v] || this.defaults.fallback, i = !!c.hasUnicode, r = !!c.hasColor;
    if (!d) throw this.newMissingDefaultThemeError(v, i, r);
    if (!d[i][r]) {
      if (i && r && d[!i][r])
        i = !1;
      else if (i && r && d[i][!r])
        r = !1;
      else if (i && r && d[!i][!r])
        i = !1, r = !1;
      else if (i && !r && d[!i][r])
        i = !1;
      else if (!i && r && d[i][!r])
        r = !1;
      else if (d === this.defaults.fallback)
        throw this.newMissingDefaultThemeError(v, i, r);
    }
    return d[i][r] ? this.getTheme(d[i][r]) : this.getDefault(t({}, c, { platform: "fallback" }));
  }, s.newMissingThemeError = function c(v) {
    var d = new Error('Could not find a gauge theme named "' + v + '"');
    return Error.captureStackTrace.call(d, c), d.theme = v, d.code = "EMISSINGTHEME", d;
  }, s.newMissingDefaultThemeError = function c(v, d, i) {
    var r = new Error(
      `Could not find a gauge theme for your platform/unicode/color use combo:
    platform = ` + v + `
    hasUnicode = ` + d + `
    hasColor = ` + i
    );
    return Error.captureStackTrace.call(r, c), r.platform = v, r.hasUnicode = d, r.hasColor = i, r.code = "EMISSINGTHEME", r;
  }, s.newThemeSet = function() {
    var c = function(v) {
      return c.getDefault(v);
    };
    return t(c, s, {
      themes: t({}, this.themes),
      baseTheme: t({}, this.baseTheme),
      defaults: JSON.parse(JSON.stringify(this.defaults || {}))
    });
  }, et;
}
var xi;
function cu() {
  if (xi) return zr.exports;
  xi = 1;
  var t = bn().color, s = fu(), c = zr.exports = new s();
  return c.addTheme("ASCII", {
    preProgressbar: "[",
    postProgressbar: "]",
    progressbarTheme: {
      complete: "#",
      remaining: "."
    },
    activityIndicatorTheme: "-\\|/",
    preSubsection: ">"
  }), c.addTheme("colorASCII", c.getTheme("ASCII"), {
    progressbarTheme: {
      preComplete: t("bgBrightWhite", "brightWhite"),
      complete: "#",
      postComplete: t("reset"),
      preRemaining: t("bgBrightBlack", "brightBlack"),
      remaining: ".",
      postRemaining: t("reset")
    }
  }), c.addTheme("brailleSpinner", {
    preProgressbar: "⸨",
    postProgressbar: "⸩",
    progressbarTheme: {
      complete: "#",
      remaining: "⠂"
    },
    activityIndicatorTheme: "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏",
    preSubsection: ">"
  }), c.addTheme("colorBrailleSpinner", c.getTheme("brailleSpinner"), {
    progressbarTheme: {
      preComplete: t("bgBrightWhite", "brightWhite"),
      complete: "#",
      postComplete: t("reset"),
      preRemaining: t("bgBrightBlack", "brightBlack"),
      remaining: "⠂",
      postRemaining: t("reset")
    }
  }), c.setDefault({}, "ASCII"), c.setDefault({ hasColor: !0 }, "colorASCII"), c.setDefault({ platform: "darwin", hasUnicode: !0 }, "brailleSpinner"), c.setDefault({ platform: "darwin", hasUnicode: !0, hasColor: !0 }, "colorBrailleSpinner"), c.setDefault({ platform: "linux", hasUnicode: !0 }, "brailleSpinner"), c.setDefault({ platform: "linux", hasUnicode: !0, hasColor: !0 }, "colorBrailleSpinner"), zr.exports;
}
var rt, Ii;
function hu() {
  return Ii || (Ii = 1, rt = setInterval), rt;
}
var tt, Li;
function ho() {
  return Li || (Li = 1, tt = process), tt;
}
var Xe = { exports: {} }, Ni;
function du() {
  if (Ni) return Xe.exports;
  Ni = 1;
  var t = ho();
  try {
    Xe.exports = setImmediate;
  } catch {
    Xe.exports = t.nextTick;
  }
  return Xe.exports;
}
var nt, Bi;
function pu() {
  if (Bi) return nt;
  Bi = 1;
  var t = eu(), s = ru(), c = nu(), v = au(), d = cu(), i = hu(), r = ho(), o = du();
  nt = f;
  function a(n, D) {
    return function() {
      return D.call(n);
    };
  }
  function f(n, D) {
    var l, E;
    n && n.write ? (E = n, l = D || {}) : D && D.write ? (E = D, l = n || {}) : (E = r.stderr, l = n || D || {}), this._status = {
      spun: 0,
      section: "",
      subsection: ""
    }, this._paused = !1, this._disabled = !0, this._showing = !1, this._onScreen = !1, this._needsRedraw = !1, this._hideCursor = l.hideCursor == null ? !0 : l.hideCursor, this._fixedFramerate = l.fixedFramerate == null ? !/^v0\.8\./.test(r.version) : l.fixedFramerate, this._lastUpdateAt = null, this._updateInterval = l.updateInterval == null ? 50 : l.updateInterval, this._themes = l.themes || d, this._theme = l.theme;
    var y = this._computeTheme(l.theme), u = l.template || [
      { type: "progressbar", length: 20 },
      { type: "activityIndicator", kerning: 1, length: 1 },
      { type: "section", kerning: 1, default: "" },
      { type: "subsection", kerning: 1, default: "" }
    ];
    this.setWriteTo(E, l.tty);
    var b = l.Plumbing || t;
    this._gauge = new b(y, u, this.getWidth()), this._$$doRedraw = a(this, this._doRedraw), this._$$handleSizeChange = a(this, this._handleSizeChange), this._cleanupOnExit = l.cleanupOnExit == null || l.cleanupOnExit, this._removeOnExit = null, l.enabled || l.enabled == null && this._tty && this._tty.isTTY ? this.enable() : this.disable();
  }
  return f.prototype = {}, f.prototype.isEnabled = function() {
    return !this._disabled;
  }, f.prototype.setTemplate = function(n) {
    this._gauge.setTemplate(n), this._showing && this._requestRedraw();
  }, f.prototype._computeTheme = function(n) {
    if (n || (n = {}), typeof n == "string")
      n = this._themes.getTheme(n);
    else if (n && (Object.keys(n).length === 0 || n.hasUnicode != null || n.hasColor != null)) {
      var D = n.hasUnicode == null ? s() : n.hasUnicode, l = n.hasColor == null ? c : n.hasColor;
      n = this._themes.getDefault({ hasUnicode: D, hasColor: l, platform: n.platform });
    }
    return n;
  }, f.prototype.setThemeset = function(n) {
    this._themes = n, this.setTheme(this._theme);
  }, f.prototype.setTheme = function(n) {
    this._gauge.setTheme(this._computeTheme(n)), this._showing && this._requestRedraw(), this._theme = n;
  }, f.prototype._requestRedraw = function() {
    this._needsRedraw = !0, this._fixedFramerate || this._doRedraw();
  }, f.prototype.getWidth = function() {
    return (this._tty && this._tty.columns || 80) - 1;
  }, f.prototype.setWriteTo = function(n, D) {
    var l = !this._disabled;
    l && this.disable(), this._writeTo = n, this._tty = D || n === r.stderr && r.stdout.isTTY && r.stdout || n.isTTY && n || this._tty, this._gauge && this._gauge.setWidth(this.getWidth()), l && this.enable();
  }, f.prototype.enable = function() {
    this._disabled && (this._disabled = !1, this._tty && this._enableEvents(), this._showing && this.show());
  }, f.prototype.disable = function() {
    this._disabled || (this._showing && (this._lastUpdateAt = null, this._showing = !1, this._doRedraw(), this._showing = !0), this._disabled = !0, this._tty && this._disableEvents());
  }, f.prototype._enableEvents = function() {
    this._cleanupOnExit && (this._removeOnExit = v(a(this, this.disable))), this._tty.on("resize", this._$$handleSizeChange), this._fixedFramerate && (this.redrawTracker = i(this._$$doRedraw, this._updateInterval), this.redrawTracker.unref && this.redrawTracker.unref());
  }, f.prototype._disableEvents = function() {
    this._tty.removeListener("resize", this._$$handleSizeChange), this._fixedFramerate && clearInterval(this.redrawTracker), this._removeOnExit && this._removeOnExit();
  }, f.prototype.hide = function(n) {
    if (this._disabled || !this._showing) return n && r.nextTick(n);
    this._showing = !1, this._doRedraw(), n && o(n);
  }, f.prototype.show = function(n, D) {
    if (this._showing = !0, typeof n == "string")
      this._status.section = n;
    else if (typeof n == "object")
      for (var l = Object.keys(n), E = 0; E < l.length; ++E) {
        var y = l[E];
        this._status[y] = n[y];
      }
    D != null && (this._status.completed = D), !this._disabled && this._requestRedraw();
  }, f.prototype.pulse = function(n) {
    this._status.subsection = n || "", this._status.spun++, !this._disabled && this._showing && this._requestRedraw();
  }, f.prototype._handleSizeChange = function() {
    this._gauge.setWidth(this._tty.columns - 1), this._requestRedraw();
  }, f.prototype._doRedraw = function() {
    if (!(this._disabled || this._paused)) {
      if (!this._fixedFramerate) {
        var n = Date.now();
        if (this._lastUpdateAt && n - this._lastUpdateAt < this._updateInterval) return;
        this._lastUpdateAt = n;
      }
      if (!this._showing && this._onScreen) {
        this._onScreen = !1;
        var D = this._gauge.hide();
        return this._hideCursor && (D += this._gauge.showCursor()), this._writeTo.write(D);
      }
      !this._showing && !this._onScreen || (this._showing && !this._onScreen && (this._onScreen = !0, this._needsRedraw = !0, this._hideCursor && this._writeTo.write(this._gauge.hideCursor())), this._needsRedraw && (this._writeTo.write(this._gauge.show(this._status)) || (this._paused = !0, this._writeTo.on("drain", a(this, function() {
        this._paused = !1, this._doRedraw();
      })))));
    }
  }, nt;
}
var it, ki;
function vu() {
  return ki || (ki = 1, it = function(t) {
    [process.stdout, process.stderr].forEach(function(s) {
      s._handle && s.isTTY && typeof s._handle.setBlocking == "function" && s._handle.setBlocking(t);
    });
  }), it;
}
var qi;
function po() {
  return qi || (qi = 1, function(t, s) {
    var c = Yo(), v = pu(), d = Se.EventEmitter, i = t.exports = new d(), r = ae, o = vu(), a = bn();
    o(!0);
    var f = process.stderr;
    Object.defineProperty(i, "stream", {
      set: function(u) {
        f = u, this.gauge && this.gauge.setWriteTo(f, f);
      },
      get: function() {
        return f;
      }
    });
    var n;
    i.useColor = function() {
      return n ?? f.isTTY;
    }, i.enableColor = function() {
      n = !0, this.gauge.setTheme({ hasColor: n, hasUnicode: D });
    }, i.disableColor = function() {
      n = !1, this.gauge.setTheme({ hasColor: n, hasUnicode: D });
    }, i.level = "info", i.gauge = new v(f, {
      enabled: !1,
      // no progress bars unless asked
      theme: { hasColor: i.useColor() },
      template: [
        { type: "progressbar", length: 20 },
        { type: "activityIndicator", kerning: 1, length: 1 },
        { type: "section", default: "" },
        ":",
        { type: "logline", kerning: 1, default: "" }
      ]
    }), i.tracker = new c.TrackerGroup(), i.progressEnabled = i.gauge.isEnabled();
    var D;
    i.enableUnicode = function() {
      D = !0, this.gauge.setTheme({ hasColor: this.useColor(), hasUnicode: D });
    }, i.disableUnicode = function() {
      D = !1, this.gauge.setTheme({ hasColor: this.useColor(), hasUnicode: D });
    }, i.setGaugeThemeset = function(u) {
      this.gauge.setThemeset(u);
    }, i.setGaugeTemplate = function(u) {
      this.gauge.setTemplate(u);
    }, i.enableProgress = function() {
      this.progressEnabled || (this.progressEnabled = !0, this.tracker.on("change", this.showProgress), !this._paused && this.gauge.enable());
    }, i.disableProgress = function() {
      this.progressEnabled && (this.progressEnabled = !1, this.tracker.removeListener("change", this.showProgress), this.gauge.disable());
    };
    var l = ["newGroup", "newItem", "newStream"], E = function(u) {
      return Object.keys(i).forEach(function(b) {
        if (b[0] !== "_" && !l.filter(function(_) {
          return _ === b;
        }).length && !u[b] && typeof i[b] == "function") {
          var e = i[b];
          u[b] = function() {
            return e.apply(i, arguments);
          };
        }
      }), u instanceof c.TrackerGroup && l.forEach(function(b) {
        var e = u[b];
        u[b] = function() {
          return E(e.apply(u, arguments));
        };
      }), u;
    };
    l.forEach(function(u) {
      i[u] = function() {
        return E(this.tracker[u].apply(this.tracker, arguments));
      };
    }), i.clearProgress = function(u) {
      if (!this.progressEnabled)
        return u && process.nextTick(u);
      this.gauge.hide(u);
    }, i.showProgress = (function(u, b) {
      if (this.progressEnabled) {
        var e = {};
        u && (e.section = u);
        var _ = i.record[i.record.length - 1];
        if (_) {
          e.subsection = _.prefix;
          var w = i.disp[_.level] || _.level, h = this._format(w, i.style[_.level]);
          _.prefix && (h += " " + this._format(_.prefix, this.prefixStyle)), h += " " + _.message.split(/\r?\n/)[0], e.logline = h;
        }
        e.completed = b || this.tracker.completed(), this.gauge.show(e);
      }
    }).bind(i), i.pause = function() {
      this._paused = !0, this.progressEnabled && this.gauge.disable();
    }, i.resume = function() {
      if (this._paused) {
        this._paused = !1;
        var u = this._buffer;
        this._buffer = [], u.forEach(function(b) {
          this.emitLog(b);
        }, this), this.progressEnabled && this.gauge.enable();
      }
    }, i._buffer = [];
    var y = 0;
    i.record = [], i.maxRecordSize = 1e4, i.log = (function(u, b, e) {
      var _ = this.levels[u];
      if (_ === void 0)
        return this.emit("error", new Error(r.format(
          "Undefined log level: %j",
          u
        )));
      for (var w = new Array(arguments.length - 2), h = null, p = 2; p < arguments.length; p++) {
        var g = w[p - 2] = arguments[p];
        typeof g == "object" && g instanceof Error && g.stack && Object.defineProperty(g, "stack", {
          value: h = g.stack + "",
          enumerable: !0,
          writable: !0
        });
      }
      h && w.unshift(h + `
`), e = r.format.apply(r, w);
      var R = {
        id: y++,
        level: u,
        prefix: String(b || ""),
        message: e,
        messageRaw: w
      };
      this.emit("log", R), this.emit("log." + u, R), R.prefix && this.emit(R.prefix, R), this.record.push(R);
      var C = this.maxRecordSize, m = this.record.length - C;
      if (m > C / 10) {
        var F = Math.floor(C * 0.9);
        this.record = this.record.slice(-1 * F);
      }
      this.emitLog(R);
    }).bind(i), i.emitLog = function(u) {
      if (this._paused) {
        this._buffer.push(u);
        return;
      }
      this.progressEnabled && this.gauge.pulse(u.prefix);
      var b = this.levels[u.level];
      if (b !== void 0 && !(b < this.levels[this.level]) && !(b > 0 && !isFinite(b))) {
        var e = i.disp[u.level] != null ? i.disp[u.level] : u.level;
        this.clearProgress(), u.message.split(/\r?\n/).forEach(function(_) {
          this.heading && (this.write(this.heading, this.headingStyle), this.write(" ")), this.write(e, i.style[u.level]);
          var w = u.prefix || "";
          w && this.write(" "), this.write(w, this.prefixStyle), this.write(" " + _ + `
`);
        }, this), this.showProgress();
      }
    }, i._format = function(u, b) {
      if (f) {
        var e = "";
        if (this.useColor()) {
          b = b || {};
          var _ = [];
          b.fg && _.push(b.fg), b.bg && _.push("bg" + b.bg[0].toUpperCase() + b.bg.slice(1)), b.bold && _.push("bold"), b.underline && _.push("underline"), b.inverse && _.push("inverse"), _.length && (e += a.color(_)), b.beep && (e += a.beep());
        }
        return e += u, this.useColor() && (e += a.color("reset")), e;
      }
    }, i.write = function(u, b) {
      f && f.write(this._format(u, b));
    }, i.addLevel = function(u, b, e, _) {
      _ == null && (_ = u), this.levels[u] = b, this.style[u] = e, this[u] || (this[u] = (function() {
        var w = new Array(arguments.length + 1);
        w[0] = u;
        for (var h = 0; h < arguments.length; h++)
          w[h + 1] = arguments[h];
        return this.log.apply(this, w);
      }).bind(this)), this.disp[u] = _;
    }, i.prefixStyle = { fg: "magenta" }, i.headingStyle = { fg: "white", bg: "black" }, i.style = {}, i.levels = {}, i.disp = {}, i.addLevel("silly", -1 / 0, { inverse: !0 }, "sill"), i.addLevel("verbose", 1e3, { fg: "blue", bg: "black" }, "verb"), i.addLevel("info", 2e3, { fg: "green" }), i.addLevel("timing", 2500, { fg: "green", bg: "black" }), i.addLevel("http", 3e3, { fg: "green", bg: "black" }), i.addLevel("notice", 3500, { fg: "blue", bg: "black" }), i.addLevel("warn", 4e3, { fg: "black", bg: "yellow" }, "WARN"), i.addLevel("error", 5e3, { fg: "red", bg: "black" }, "ERR!"), i.addLevel("silent", 1 / 0), i.on("error", function() {
    });
  }(vr)), vr.exports;
}
var Ne = { exports: {} }, ze = {}, Pi;
function Du() {
  if (Pi) return ze;
  Pi = 1;
  var t = te, s = process.platform === "win32", c = ie, v = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);
  function d() {
    var a;
    if (v) {
      var f = new Error();
      a = n;
    } else
      a = D;
    return a;
    function n(l) {
      l && (f.message = l.message, l = f, D(l));
    }
    function D(l) {
      if (l) {
        if (process.throwDeprecation)
          throw l;
        if (!process.noDeprecation) {
          var E = "fs: missing callback " + (l.stack || l.message);
          process.traceDeprecation ? console.trace(E) : console.error(E);
        }
      }
    }
  }
  function i(a) {
    return typeof a == "function" ? a : d();
  }
  if (t.normalize, s)
    var r = /(.*?)(?:[\/\\]+|$)/g;
  else
    var r = /(.*?)(?:[\/]+|$)/g;
  if (s)
    var o = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
  else
    var o = /^[\/]*/;
  return ze.realpathSync = function(f, n) {
    if (f = t.resolve(f), n && Object.prototype.hasOwnProperty.call(n, f))
      return n[f];
    var D = f, l = {}, E = {}, y, u, b, e;
    _();
    function _() {
      var C = o.exec(f);
      y = C[0].length, u = C[0], b = C[0], e = "", s && !E[b] && (c.lstatSync(b), E[b] = !0);
    }
    for (; y < f.length; ) {
      r.lastIndex = y;
      var w = r.exec(f);
      if (e = u, u += w[0], b = e + w[1], y = r.lastIndex, !(E[b] || n && n[b] === b)) {
        var h;
        if (n && Object.prototype.hasOwnProperty.call(n, b))
          h = n[b];
        else {
          var p = c.lstatSync(b);
          if (!p.isSymbolicLink()) {
            E[b] = !0, n && (n[b] = b);
            continue;
          }
          var g = null;
          if (!s) {
            var R = p.dev.toString(32) + ":" + p.ino.toString(32);
            l.hasOwnProperty(R) && (g = l[R]);
          }
          g === null && (c.statSync(b), g = c.readlinkSync(b)), h = t.resolve(e, g), n && (n[b] = h), s || (l[R] = g);
        }
        f = t.resolve(h, f.slice(y)), _();
      }
    }
    return n && (n[D] = f), f;
  }, ze.realpath = function(f, n, D) {
    if (typeof D != "function" && (D = i(n), n = null), f = t.resolve(f), n && Object.prototype.hasOwnProperty.call(n, f))
      return process.nextTick(D.bind(null, null, n[f]));
    var l = f, E = {}, y = {}, u, b, e, _;
    w();
    function w() {
      var C = o.exec(f);
      u = C[0].length, b = C[0], e = C[0], _ = "", s && !y[e] ? c.lstat(e, function(m) {
        if (m) return D(m);
        y[e] = !0, h();
      }) : process.nextTick(h);
    }
    function h() {
      if (u >= f.length)
        return n && (n[l] = f), D(null, f);
      r.lastIndex = u;
      var C = r.exec(f);
      return _ = b, b += C[0], e = _ + C[1], u = r.lastIndex, y[e] || n && n[e] === e ? process.nextTick(h) : n && Object.prototype.hasOwnProperty.call(n, e) ? R(n[e]) : c.lstat(e, p);
    }
    function p(C, m) {
      if (C) return D(C);
      if (!m.isSymbolicLink())
        return y[e] = !0, n && (n[e] = e), process.nextTick(h);
      if (!s) {
        var F = m.dev.toString(32) + ":" + m.ino.toString(32);
        if (E.hasOwnProperty(F))
          return g(null, E[F], e);
      }
      c.stat(e, function(O) {
        if (O) return D(O);
        c.readlink(e, function(T, x) {
          s || (E[F] = x), g(T, x);
        });
      });
    }
    function g(C, m, F) {
      if (C) return D(C);
      var O = t.resolve(_, m);
      n && (n[F] = O), R(O);
    }
    function R(C) {
      f = t.resolve(C, f.slice(u)), w();
    }
  }, ze;
}
var at, $i;
function vo() {
  if ($i) return at;
  $i = 1, at = o, o.realpath = o, o.sync = a, o.realpathSync = a, o.monkeypatch = f, o.unmonkeypatch = n;
  var t = ie, s = t.realpath, c = t.realpathSync, v = process.version, d = /^v[0-5]\./.test(v), i = Du();
  function r(D) {
    return D && D.syscall === "realpath" && (D.code === "ELOOP" || D.code === "ENOMEM" || D.code === "ENAMETOOLONG");
  }
  function o(D, l, E) {
    if (d)
      return s(D, l, E);
    typeof l == "function" && (E = l, l = null), s(D, l, function(y, u) {
      r(y) ? i.realpath(D, l, E) : E(y, u);
    });
  }
  function a(D, l) {
    if (d)
      return c(D, l);
    try {
      return c(D, l);
    } catch (E) {
      if (r(E))
        return i.realpathSync(D, l);
      throw E;
    }
  }
  function f() {
    t.realpath = o, t.realpathSync = a;
  }
  function n() {
    t.realpath = s, t.realpathSync = c;
  }
  return at;
}
var ot, Mi;
function _u() {
  if (Mi) return ot;
  Mi = 1, ot = function(s, c) {
    for (var v = [], d = 0; d < s.length; d++) {
      var i = c(s[d], d);
      t(i) ? v.push.apply(v, i) : v.push(i);
    }
    return v;
  };
  var t = Array.isArray || function(s) {
    return Object.prototype.toString.call(s) === "[object Array]";
  };
  return ot;
}
var ut, ji;
function bu() {
  if (ji) return ut;
  ji = 1, ut = t;
  function t(v, d, i) {
    v instanceof RegExp && (v = s(v, i)), d instanceof RegExp && (d = s(d, i));
    var r = c(v, d, i);
    return r && {
      start: r[0],
      end: r[1],
      pre: i.slice(0, r[0]),
      body: i.slice(r[0] + v.length, r[1]),
      post: i.slice(r[1] + d.length)
    };
  }
  function s(v, d) {
    var i = d.match(v);
    return i ? i[0] : null;
  }
  t.range = c;
  function c(v, d, i) {
    var r, o, a, f, n, D = i.indexOf(v), l = i.indexOf(d, D + 1), E = D;
    if (D >= 0 && l > 0) {
      if (v === d)
        return [D, l];
      for (r = [], a = i.length; E >= 0 && !n; )
        E == D ? (r.push(E), D = i.indexOf(v, E + 1)) : r.length == 1 ? n = [r.pop(), l] : (o = r.pop(), o < a && (a = o, f = l), l = i.indexOf(d, E + 1)), E = D < l && D >= 0 ? D : l;
      r.length && (n = [a, f]);
    }
    return n;
  }
  return ut;
}
var st, Ui;
function gu() {
  if (Ui) return st;
  Ui = 1;
  var t = _u(), s = bu();
  st = D;
  var c = "\0SLASH" + Math.random() + "\0", v = "\0OPEN" + Math.random() + "\0", d = "\0CLOSE" + Math.random() + "\0", i = "\0COMMA" + Math.random() + "\0", r = "\0PERIOD" + Math.random() + "\0";
  function o(e) {
    return parseInt(e, 10) == e ? parseInt(e, 10) : e.charCodeAt(0);
  }
  function a(e) {
    return e.split("\\\\").join(c).split("\\{").join(v).split("\\}").join(d).split("\\,").join(i).split("\\.").join(r);
  }
  function f(e) {
    return e.split(c).join("\\").split(v).join("{").split(d).join("}").split(i).join(",").split(r).join(".");
  }
  function n(e) {
    if (!e)
      return [""];
    var _ = [], w = s("{", "}", e);
    if (!w)
      return e.split(",");
    var h = w.pre, p = w.body, g = w.post, R = h.split(",");
    R[R.length - 1] += "{" + p + "}";
    var C = n(g);
    return g.length && (R[R.length - 1] += C.shift(), R.push.apply(R, C)), _.push.apply(_, R), _;
  }
  function D(e) {
    return e ? (e.substr(0, 2) === "{}" && (e = "\\{\\}" + e.substr(2)), b(a(e), !0).map(f)) : [];
  }
  function l(e) {
    return "{" + e + "}";
  }
  function E(e) {
    return /^-?0\d/.test(e);
  }
  function y(e, _) {
    return e <= _;
  }
  function u(e, _) {
    return e >= _;
  }
  function b(e, _) {
    var w = [], h = s("{", "}", e);
    if (!h || /\$$/.test(h.pre)) return [e];
    var p = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(h.body), g = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(h.body), R = p || g, C = h.body.indexOf(",") >= 0;
    if (!R && !C)
      return h.post.match(/,(?!,).*\}/) ? (e = h.pre + "{" + h.body + d + h.post, b(e)) : [e];
    var m;
    if (R)
      m = h.body.split(/\.\./);
    else if (m = n(h.body), m.length === 1 && (m = b(m[0], !1).map(l), m.length === 1)) {
      var O = h.post.length ? b(h.post, !1) : [""];
      return O.map(function(j) {
        return h.pre + m[0] + j;
      });
    }
    var F = h.pre, O = h.post.length ? b(h.post, !1) : [""], T;
    if (R) {
      var x = o(m[0]), B = o(m[1]), k = Math.max(m[0].length, m[1].length), U = m.length == 3 ? Math.abs(o(m[2])) : 1, q = y, P = B < x;
      P && (U *= -1, q = u);
      var M = m.some(E);
      T = [];
      for (var W = x; q(W, B); W += U) {
        var V;
        if (g)
          V = String.fromCharCode(W), V === "\\" && (V = "");
        else if (V = String(W), M) {
          var N = k - V.length;
          if (N > 0) {
            var G = new Array(N + 1).join("0");
            W < 0 ? V = "-" + G + V.slice(1) : V = G + V;
          }
        }
        T.push(V);
      }
    } else
      T = t(m, function(L) {
        return b(L, !1);
      });
    for (var X = 0; X < T.length; X++)
      for (var Z = 0; Z < O.length; Z++) {
        var I = F + T[X] + O[Z];
        (!_ || R || I) && w.push(I);
      }
    return w;
  }
  return st;
}
var lt, Wi;
function mn() {
  if (Wi) return lt;
  Wi = 1, lt = E, E.Minimatch = y;
  var t = function() {
    try {
      return require("path");
    } catch {
    }
  }() || {
    sep: "/"
  };
  E.sep = t.sep;
  var s = E.GLOBSTAR = y.GLOBSTAR = {}, c = gu(), v = {
    "!": { open: "(?:(?!(?:", close: "))[^/]*?)" },
    "?": { open: "(?:", close: ")?" },
    "+": { open: "(?:", close: ")+" },
    "*": { open: "(?:", close: ")*" },
    "@": { open: "(?:", close: ")" }
  }, d = "[^/]", i = d + "*?", r = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?", o = "(?:(?!(?:\\/|^)\\.).)*?", a = f("().*{}+?[]^$\\!");
  function f(m) {
    return m.split("").reduce(function(F, O) {
      return F[O] = !0, F;
    }, {});
  }
  var n = /\/+/;
  E.filter = D;
  function D(m, F) {
    return F = F || {}, function(O, T, x) {
      return E(O, m, F);
    };
  }
  function l(m, F) {
    F = F || {};
    var O = {};
    return Object.keys(m).forEach(function(T) {
      O[T] = m[T];
    }), Object.keys(F).forEach(function(T) {
      O[T] = F[T];
    }), O;
  }
  E.defaults = function(m) {
    if (!m || typeof m != "object" || !Object.keys(m).length)
      return E;
    var F = E, O = function(x, B, k) {
      return F(x, B, l(m, k));
    };
    return O.Minimatch = function(x, B) {
      return new F.Minimatch(x, l(m, B));
    }, O.Minimatch.defaults = function(x) {
      return F.defaults(l(m, x)).Minimatch;
    }, O.filter = function(x, B) {
      return F.filter(x, l(m, B));
    }, O.defaults = function(x) {
      return F.defaults(l(m, x));
    }, O.makeRe = function(x, B) {
      return F.makeRe(x, l(m, B));
    }, O.braceExpand = function(x, B) {
      return F.braceExpand(x, l(m, B));
    }, O.match = function(T, x, B) {
      return F.match(T, x, l(m, B));
    }, O;
  }, y.defaults = function(m) {
    return E.defaults(m).Minimatch;
  };
  function E(m, F, O) {
    return w(F), O || (O = {}), !O.nocomment && F.charAt(0) === "#" ? !1 : new y(F, O).match(m);
  }
  function y(m, F) {
    if (!(this instanceof y))
      return new y(m, F);
    w(m), F || (F = {}), m = m.trim(), !F.allowWindowsEscape && t.sep !== "/" && (m = m.split(t.sep).join("/")), this.options = F, this.set = [], this.pattern = m, this.regexp = null, this.negate = !1, this.comment = !1, this.empty = !1, this.partial = !!F.partial, this.make();
  }
  y.prototype.debug = function() {
  }, y.prototype.make = u;
  function u() {
    var m = this.pattern, F = this.options;
    if (!F.nocomment && m.charAt(0) === "#") {
      this.comment = !0;
      return;
    }
    if (!m) {
      this.empty = !0;
      return;
    }
    this.parseNegate();
    var O = this.globSet = this.braceExpand();
    F.debug && (this.debug = function() {
      console.error.apply(console, arguments);
    }), this.debug(this.pattern, O), O = this.globParts = O.map(function(T) {
      return T.split(n);
    }), this.debug(this.pattern, O), O = O.map(function(T, x, B) {
      return T.map(this.parse, this);
    }, this), this.debug(this.pattern, O), O = O.filter(function(T) {
      return T.indexOf(!1) === -1;
    }), this.debug(this.pattern, O), this.set = O;
  }
  y.prototype.parseNegate = b;
  function b() {
    var m = this.pattern, F = !1, O = this.options, T = 0;
    if (!O.nonegate) {
      for (var x = 0, B = m.length; x < B && m.charAt(x) === "!"; x++)
        F = !F, T++;
      T && (this.pattern = m.substr(T)), this.negate = F;
    }
  }
  E.braceExpand = function(m, F) {
    return e(m, F);
  }, y.prototype.braceExpand = e;
  function e(m, F) {
    return F || (this instanceof y ? F = this.options : F = {}), m = typeof m > "u" ? this.pattern : m, w(m), F.nobrace || !/\{(?:(?!\{).)*\}/.test(m) ? [m] : c(m);
  }
  var _ = 1024 * 64, w = function(m) {
    if (typeof m != "string")
      throw new TypeError("invalid pattern");
    if (m.length > _)
      throw new TypeError("pattern is too long");
  };
  y.prototype.parse = p;
  var h = {};
  function p(m, F) {
    w(m);
    var O = this.options;
    if (m === "**")
      if (O.noglobstar)
        m = "*";
      else
        return s;
    if (m === "") return "";
    var T = "", x = !!O.nocase, B = !1, k = [], U = [], q, P = !1, M = -1, W = -1, V = m.charAt(0) === "." ? "" : O.dot ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)", N = this;
    function G() {
      if (q) {
        switch (q) {
          case "*":
            T += i, x = !0;
            break;
          case "?":
            T += d, x = !0;
            break;
          default:
            T += "\\" + q;
            break;
        }
        N.debug("clearStateChar %j %j", q, T), q = !1;
      }
    }
    for (var X = 0, Z = m.length, I; X < Z && (I = m.charAt(X)); X++) {
      if (this.debug("%s	%s %s %j", m, X, T, I), B && a[I]) {
        T += "\\" + I, B = !1;
        continue;
      }
      switch (I) {
        case "/":
          return !1;
        case "\\":
          G(), B = !0;
          continue;
        case "?":
        case "*":
        case "+":
        case "@":
        case "!":
          if (this.debug("%s	%s %s %j <-- stateChar", m, X, T, I), P) {
            this.debug("  in class"), I === "!" && X === W + 1 && (I = "^"), T += I;
            continue;
          }
          N.debug("call clearStateChar %j", q), G(), q = I, O.noext && G();
          continue;
        case "(":
          if (P) {
            T += "(";
            continue;
          }
          if (!q) {
            T += "\\(";
            continue;
          }
          k.push({
            type: q,
            start: X - 1,
            reStart: T.length,
            open: v[q].open,
            close: v[q].close
          }), T += q === "!" ? "(?:(?!(?:" : "(?:", this.debug("plType %j %j", q, T), q = !1;
          continue;
        case ")":
          if (P || !k.length) {
            T += "\\)";
            continue;
          }
          G(), x = !0;
          var L = k.pop();
          T += L.close, L.type === "!" && U.push(L), L.reEnd = T.length;
          continue;
        case "|":
          if (P || !k.length || B) {
            T += "\\|", B = !1;
            continue;
          }
          G(), T += "|";
          continue;
        case "[":
          if (G(), P) {
            T += "\\" + I;
            continue;
          }
          P = !0, W = X, M = T.length, T += I;
          continue;
        case "]":
          if (X === W + 1 || !P) {
            T += "\\" + I, B = !1;
            continue;
          }
          var j = m.substring(W + 1, X);
          try {
            RegExp("[" + j + "]");
          } catch {
            var Y = this.parse(j, h);
            T = T.substr(0, M) + "\\[" + Y[0] + "\\]", x = x || Y[1], P = !1;
            continue;
          }
          x = !0, P = !1, T += I;
          continue;
        default:
          G(), B ? B = !1 : a[I] && !(I === "^" && P) && (T += "\\"), T += I;
      }
    }
    for (P && (j = m.substr(W + 1), Y = this.parse(j, h), T = T.substr(0, M) + "\\[" + Y[0], x = x || Y[1]), L = k.pop(); L; L = k.pop()) {
      var z = T.slice(L.reStart + L.open.length);
      this.debug("setting tail", T, L), z = z.replace(/((?:\\{2}){0,64})(\\?)\|/g, function(be, he, le) {
        return le || (le = "\\"), he + he + le + "|";
      }), this.debug(`tail=%j
   %s`, z, z, L, T);
      var S = L.type === "*" ? i : L.type === "?" ? d : "\\" + L.type;
      x = !0, T = T.slice(0, L.reStart) + S + "\\(" + z;
    }
    G(), B && (T += "\\\\");
    var A = !1;
    switch (T.charAt(0)) {
      case "[":
      case ".":
      case "(":
        A = !0;
    }
    for (var $ = U.length - 1; $ > -1; $--) {
      var H = U[$], J = T.slice(0, H.reStart), K = T.slice(H.reStart, H.reEnd - 8), Q = T.slice(H.reEnd - 8, H.reEnd), ne = T.slice(H.reEnd);
      Q += ne;
      var De = J.split("(").length - 1, _e = ne;
      for (X = 0; X < De; X++)
        _e = _e.replace(/\)[+*?]?/, "");
      ne = _e;
      var qe = "";
      ne === "" && F !== h && (qe = "$");
      var Pe = J + K + ne + qe + Q;
      T = Pe;
    }
    if (T !== "" && x && (T = "(?=.)" + T), A && (T = V + T), F === h)
      return [T, x];
    if (!x)
      return R(m);
    var Oe = O.nocase ? "i" : "";
    try {
      var de = new RegExp("^" + T + "$", Oe);
    } catch {
      return new RegExp("$.");
    }
    return de._glob = m, de._src = T, de;
  }
  E.makeRe = function(m, F) {
    return new y(m, F || {}).makeRe();
  }, y.prototype.makeRe = g;
  function g() {
    if (this.regexp || this.regexp === !1) return this.regexp;
    var m = this.set;
    if (!m.length)
      return this.regexp = !1, this.regexp;
    var F = this.options, O = F.noglobstar ? i : F.dot ? r : o, T = F.nocase ? "i" : "", x = m.map(function(B) {
      return B.map(function(k) {
        return k === s ? O : typeof k == "string" ? C(k) : k._src;
      }).join("\\/");
    }).join("|");
    x = "^(?:" + x + ")$", this.negate && (x = "^(?!" + x + ").*$");
    try {
      this.regexp = new RegExp(x, T);
    } catch {
      this.regexp = !1;
    }
    return this.regexp;
  }
  E.match = function(m, F, O) {
    O = O || {};
    var T = new y(F, O);
    return m = m.filter(function(x) {
      return T.match(x);
    }), T.options.nonull && !m.length && m.push(F), m;
  }, y.prototype.match = function(F, O) {
    if (typeof O > "u" && (O = this.partial), this.debug("match", F, this.pattern), this.comment) return !1;
    if (this.empty) return F === "";
    if (F === "/" && O) return !0;
    var T = this.options;
    t.sep !== "/" && (F = F.split(t.sep).join("/")), F = F.split(n), this.debug(this.pattern, "split", F);
    var x = this.set;
    this.debug(this.pattern, "set", x);
    var B, k;
    for (k = F.length - 1; k >= 0 && (B = F[k], !B); k--)
      ;
    for (k = 0; k < x.length; k++) {
      var U = x[k], q = F;
      T.matchBase && U.length === 1 && (q = [B]);
      var P = this.matchOne(q, U, O);
      if (P)
        return T.flipNegate ? !0 : !this.negate;
    }
    return T.flipNegate ? !1 : this.negate;
  }, y.prototype.matchOne = function(m, F, O) {
    var T = this.options;
    this.debug(
      "matchOne",
      { this: this, file: m, pattern: F }
    ), this.debug("matchOne", m.length, F.length);
    for (var x = 0, B = 0, k = m.length, U = F.length; x < k && B < U; x++, B++) {
      this.debug("matchOne loop");
      var q = F[B], P = m[x];
      if (this.debug(F, q, P), q === !1) return !1;
      if (q === s) {
        this.debug("GLOBSTAR", [F, q, P]);
        var M = x, W = B + 1;
        if (W === U) {
          for (this.debug("** at the end"); x < k; x++)
            if (m[x] === "." || m[x] === ".." || !T.dot && m[x].charAt(0) === ".") return !1;
          return !0;
        }
        for (; M < k; ) {
          var V = m[M];
          if (this.debug(`
globstar while`, m, M, F, W, V), this.matchOne(m.slice(M), F.slice(W), O))
            return this.debug("globstar found match!", M, k, V), !0;
          if (V === "." || V === ".." || !T.dot && V.charAt(0) === ".") {
            this.debug("dot detected!", m, M, F, W);
            break;
          }
          this.debug("globstar swallow a segment, and continue"), M++;
        }
        return !!(O && (this.debug(`
>>> no match, partial?`, m, M, F, W), M === k));
      }
      var N;
      if (typeof q == "string" ? (N = P === q, this.debug("string match", q, P, N)) : (N = P.match(q), this.debug("pattern match", q, P, N)), !N) return !1;
    }
    if (x === k && B === U)
      return !0;
    if (x === k)
      return O;
    if (B === U)
      return x === k - 1 && m[x] === "";
    throw new Error("wtf?");
  };
  function R(m) {
    return m.replace(/\\(.)/g, "$1");
  }
  function C(m) {
    return m.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
  return lt;
}
var Le = { exports: {} }, Gi;
function En() {
  if (Gi) return Le.exports;
  Gi = 1;
  function t(c) {
    return c.charAt(0) === "/";
  }
  function s(c) {
    var v = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/, d = v.exec(c), i = d[1] || "", r = !!(i && i.charAt(1) !== ":");
    return !!(d[2] || r);
  }
  return Le.exports = process.platform === "win32" ? s : t, Le.exports.posix = t, Le.exports.win32 = s, Le.exports;
}
var ce = {}, Hi;
function Do() {
  if (Hi) return ce;
  Hi = 1, ce.setopts = f, ce.ownProp = t, ce.makeAbs = l, ce.finish = n, ce.mark = D, ce.isIgnored = E, ce.childrenIgnored = y;
  function t(u, b) {
    return Object.prototype.hasOwnProperty.call(u, b);
  }
  var s = ie, c = te, v = mn(), d = En(), i = v.Minimatch;
  function r(u, b) {
    return u.localeCompare(b, "en");
  }
  function o(u, b) {
    u.ignore = b.ignore || [], Array.isArray(u.ignore) || (u.ignore = [u.ignore]), u.ignore.length && (u.ignore = u.ignore.map(a));
  }
  function a(u) {
    var b = null;
    if (u.slice(-3) === "/**") {
      var e = u.replace(/(\/\*\*)+$/, "");
      b = new i(e, { dot: !0 });
    }
    return {
      matcher: new i(u, { dot: !0 }),
      gmatcher: b
    };
  }
  function f(u, b, e) {
    if (e || (e = {}), e.matchBase && b.indexOf("/") === -1) {
      if (e.noglobstar)
        throw new Error("base matching requires globstar");
      b = "**/" + b;
    }
    u.silent = !!e.silent, u.pattern = b, u.strict = e.strict !== !1, u.realpath = !!e.realpath, u.realpathCache = e.realpathCache || /* @__PURE__ */ Object.create(null), u.follow = !!e.follow, u.dot = !!e.dot, u.mark = !!e.mark, u.nodir = !!e.nodir, u.nodir && (u.mark = !0), u.sync = !!e.sync, u.nounique = !!e.nounique, u.nonull = !!e.nonull, u.nosort = !!e.nosort, u.nocase = !!e.nocase, u.stat = !!e.stat, u.noprocess = !!e.noprocess, u.absolute = !!e.absolute, u.fs = e.fs || s, u.maxLength = e.maxLength || 1 / 0, u.cache = e.cache || /* @__PURE__ */ Object.create(null), u.statCache = e.statCache || /* @__PURE__ */ Object.create(null), u.symlinks = e.symlinks || /* @__PURE__ */ Object.create(null), o(u, e), u.changedCwd = !1;
    var _ = process.cwd();
    t(e, "cwd") ? (u.cwd = c.resolve(e.cwd), u.changedCwd = u.cwd !== _) : u.cwd = _, u.root = e.root || c.resolve(u.cwd, "/"), u.root = c.resolve(u.root), process.platform === "win32" && (u.root = u.root.replace(/\\/g, "/")), u.cwdAbs = d(u.cwd) ? u.cwd : l(u, u.cwd), process.platform === "win32" && (u.cwdAbs = u.cwdAbs.replace(/\\/g, "/")), u.nomount = !!e.nomount, e.nonegate = !0, e.nocomment = !0, e.allowWindowsEscape = !1, u.minimatch = new i(b, e), u.options = u.minimatch.options;
  }
  function n(u) {
    for (var b = u.nounique, e = b ? [] : /* @__PURE__ */ Object.create(null), _ = 0, w = u.matches.length; _ < w; _++) {
      var h = u.matches[_];
      if (!h || Object.keys(h).length === 0) {
        if (u.nonull) {
          var p = u.minimatch.globSet[_];
          b ? e.push(p) : e[p] = !0;
        }
      } else {
        var g = Object.keys(h);
        b ? e.push.apply(e, g) : g.forEach(function(R) {
          e[R] = !0;
        });
      }
    }
    if (b || (e = Object.keys(e)), u.nosort || (e = e.sort(r)), u.mark) {
      for (var _ = 0; _ < e.length; _++)
        e[_] = u._mark(e[_]);
      u.nodir && (e = e.filter(function(R) {
        var C = !/\/$/.test(R), m = u.cache[R] || u.cache[l(u, R)];
        return C && m && (C = m !== "DIR" && !Array.isArray(m)), C;
      }));
    }
    u.ignore.length && (e = e.filter(function(R) {
      return !E(u, R);
    })), u.found = e;
  }
  function D(u, b) {
    var e = l(u, b), _ = u.cache[e], w = b;
    if (_) {
      var h = _ === "DIR" || Array.isArray(_), p = b.slice(-1) === "/";
      if (h && !p ? w += "/" : !h && p && (w = w.slice(0, -1)), w !== b) {
        var g = l(u, w);
        u.statCache[g] = u.statCache[e], u.cache[g] = u.cache[e];
      }
    }
    return w;
  }
  function l(u, b) {
    var e = b;
    return b.charAt(0) === "/" ? e = c.join(u.root, b) : d(b) || b === "" ? e = b : u.changedCwd ? e = c.resolve(u.cwd, b) : e = c.resolve(b), process.platform === "win32" && (e = e.replace(/\\/g, "/")), e;
  }
  function E(u, b) {
    return u.ignore.length ? u.ignore.some(function(e) {
      return e.matcher.match(b) || !!(e.gmatcher && e.gmatcher.match(b));
    }) : !1;
  }
  function y(u, b) {
    return u.ignore.length ? u.ignore.some(function(e) {
      return !!(e.gmatcher && e.gmatcher.match(b));
    }) : !1;
  }
  return ce;
}
var ft, Vi;
function mu() {
  if (Vi) return ft;
  Vi = 1, ft = n, n.GlobSync = D;
  var t = vo(), s = mn();
  s.Minimatch, go().Glob;
  var c = te, v = tr, d = En(), i = Do(), r = i.setopts, o = i.ownProp, a = i.childrenIgnored, f = i.isIgnored;
  function n(l, E) {
    if (typeof E == "function" || arguments.length === 3)
      throw new TypeError(`callback provided to sync glob
See: https://github.com/isaacs/node-glob/issues/167`);
    return new D(l, E).found;
  }
  function D(l, E) {
    if (!l)
      throw new Error("must provide pattern");
    if (typeof E == "function" || arguments.length === 3)
      throw new TypeError(`callback provided to sync glob
See: https://github.com/isaacs/node-glob/issues/167`);
    if (!(this instanceof D))
      return new D(l, E);
    if (r(this, l, E), this.noprocess)
      return this;
    var y = this.minimatch.set.length;
    this.matches = new Array(y);
    for (var u = 0; u < y; u++)
      this._process(this.minimatch.set[u], u, !1);
    this._finish();
  }
  return D.prototype._finish = function() {
    if (v.ok(this instanceof D), this.realpath) {
      var l = this;
      this.matches.forEach(function(E, y) {
        var u = l.matches[y] = /* @__PURE__ */ Object.create(null);
        for (var b in E)
          try {
            b = l._makeAbs(b);
            var e = t.realpathSync(b, l.realpathCache);
            u[e] = !0;
          } catch (_) {
            if (_.syscall === "stat")
              u[l._makeAbs(b)] = !0;
            else
              throw _;
          }
      });
    }
    i.finish(this);
  }, D.prototype._process = function(l, E, y) {
    v.ok(this instanceof D);
    for (var u = 0; typeof l[u] == "string"; )
      u++;
    var b;
    switch (u) {
      case l.length:
        this._processSimple(l.join("/"), E);
        return;
      case 0:
        b = null;
        break;
      default:
        b = l.slice(0, u).join("/");
        break;
    }
    var e = l.slice(u), _;
    b === null ? _ = "." : ((d(b) || d(l.map(function(p) {
      return typeof p == "string" ? p : "[*]";
    }).join("/"))) && (!b || !d(b)) && (b = "/" + b), _ = b);
    var w = this._makeAbs(_);
    if (!a(this, _)) {
      var h = e[0] === s.GLOBSTAR;
      h ? this._processGlobStar(b, _, w, e, E, y) : this._processReaddir(b, _, w, e, E, y);
    }
  }, D.prototype._processReaddir = function(l, E, y, u, b, e) {
    var _ = this._readdir(y, e);
    if (_) {
      for (var w = u[0], h = !!this.minimatch.negate, p = w._glob, g = this.dot || p.charAt(0) === ".", R = [], C = 0; C < _.length; C++) {
        var m = _[C];
        if (m.charAt(0) !== "." || g) {
          var F;
          h && !l ? F = !m.match(w) : F = m.match(w), F && R.push(m);
        }
      }
      var O = R.length;
      if (O !== 0) {
        if (u.length === 1 && !this.mark && !this.stat) {
          this.matches[b] || (this.matches[b] = /* @__PURE__ */ Object.create(null));
          for (var C = 0; C < O; C++) {
            var m = R[C];
            l && (l.slice(-1) !== "/" ? m = l + "/" + m : m = l + m), m.charAt(0) === "/" && !this.nomount && (m = c.join(this.root, m)), this._emitMatch(b, m);
          }
          return;
        }
        u.shift();
        for (var C = 0; C < O; C++) {
          var m = R[C], T;
          l ? T = [l, m] : T = [m], this._process(T.concat(u), b, e);
        }
      }
    }
  }, D.prototype._emitMatch = function(l, E) {
    if (!f(this, E)) {
      var y = this._makeAbs(E);
      if (this.mark && (E = this._mark(E)), this.absolute && (E = y), !this.matches[l][E]) {
        if (this.nodir) {
          var u = this.cache[y];
          if (u === "DIR" || Array.isArray(u))
            return;
        }
        this.matches[l][E] = !0, this.stat && this._stat(E);
      }
    }
  }, D.prototype._readdirInGlobStar = function(l) {
    if (this.follow)
      return this._readdir(l, !1);
    var E, y;
    try {
      y = this.fs.lstatSync(l);
    } catch (b) {
      if (b.code === "ENOENT")
        return null;
    }
    var u = y && y.isSymbolicLink();
    return this.symlinks[l] = u, !u && y && !y.isDirectory() ? this.cache[l] = "FILE" : E = this._readdir(l, !1), E;
  }, D.prototype._readdir = function(l, E) {
    if (E && !o(this.symlinks, l))
      return this._readdirInGlobStar(l);
    if (o(this.cache, l)) {
      var y = this.cache[l];
      if (!y || y === "FILE")
        return null;
      if (Array.isArray(y))
        return y;
    }
    try {
      return this._readdirEntries(l, this.fs.readdirSync(l));
    } catch (u) {
      return this._readdirError(l, u), null;
    }
  }, D.prototype._readdirEntries = function(l, E) {
    if (!this.mark && !this.stat)
      for (var y = 0; y < E.length; y++) {
        var u = E[y];
        l === "/" ? u = l + u : u = l + "/" + u, this.cache[u] = !0;
      }
    return this.cache[l] = E, E;
  }, D.prototype._readdirError = function(l, E) {
    switch (E.code) {
      case "ENOTSUP":
      case "ENOTDIR":
        var y = this._makeAbs(l);
        if (this.cache[y] = "FILE", y === this.cwdAbs) {
          var u = new Error(E.code + " invalid cwd " + this.cwd);
          throw u.path = this.cwd, u.code = E.code, u;
        }
        break;
      case "ENOENT":
      case "ELOOP":
      case "ENAMETOOLONG":
      case "UNKNOWN":
        this.cache[this._makeAbs(l)] = !1;
        break;
      default:
        if (this.cache[this._makeAbs(l)] = !1, this.strict)
          throw E;
        this.silent || console.error("glob error", E);
        break;
    }
  }, D.prototype._processGlobStar = function(l, E, y, u, b, e) {
    var _ = this._readdir(y, e);
    if (_) {
      var w = u.slice(1), h = l ? [l] : [], p = h.concat(w);
      this._process(p, b, !1);
      var g = _.length, R = this.symlinks[y];
      if (!(R && e))
        for (var C = 0; C < g; C++) {
          var m = _[C];
          if (!(m.charAt(0) === "." && !this.dot)) {
            var F = h.concat(_[C], w);
            this._process(F, b, !0);
            var O = h.concat(_[C], u);
            this._process(O, b, !0);
          }
        }
    }
  }, D.prototype._processSimple = function(l, E) {
    var y = this._stat(l);
    if (this.matches[E] || (this.matches[E] = /* @__PURE__ */ Object.create(null)), !!y) {
      if (l && d(l) && !this.nomount) {
        var u = /[\/\\]$/.test(l);
        l.charAt(0) === "/" ? l = c.join(this.root, l) : (l = c.resolve(this.root, l), u && (l += "/"));
      }
      process.platform === "win32" && (l = l.replace(/\\/g, "/")), this._emitMatch(E, l);
    }
  }, D.prototype._stat = function(l) {
    var E = this._makeAbs(l), y = l.slice(-1) === "/";
    if (l.length > this.maxLength)
      return !1;
    if (!this.stat && o(this.cache, E)) {
      var e = this.cache[E];
      if (Array.isArray(e) && (e = "DIR"), !y || e === "DIR")
        return e;
      if (y && e === "FILE")
        return !1;
    }
    var u = this.statCache[E];
    if (!u) {
      var b;
      try {
        b = this.fs.lstatSync(E);
      } catch (_) {
        if (_ && (_.code === "ENOENT" || _.code === "ENOTDIR"))
          return this.statCache[E] = !1, !1;
      }
      if (b && b.isSymbolicLink())
        try {
          u = this.fs.statSync(E);
        } catch {
          u = b;
        }
      else
        u = b;
    }
    this.statCache[E] = u;
    var e = !0;
    return u && (e = u.isDirectory() ? "DIR" : "FILE"), this.cache[E] = this.cache[E] || e, y && e === "FILE" ? !1 : e;
  }, D.prototype._mark = function(l) {
    return i.mark(this, l);
  }, D.prototype._makeAbs = function(l) {
    return i.makeAbs(this, l);
  }, ft;
}
var ct, Yi;
function _o() {
  if (Yi) return ct;
  Yi = 1, ct = t;
  function t(s, c) {
    if (s && c) return t(s)(c);
    if (typeof s != "function")
      throw new TypeError("need wrapper function");
    return Object.keys(s).forEach(function(d) {
      v[d] = s[d];
    }), v;
    function v() {
      for (var d = new Array(arguments.length), i = 0; i < d.length; i++)
        d[i] = arguments[i];
      var r = s.apply(this, d), o = d[d.length - 1];
      return typeof r == "function" && r !== o && Object.keys(o).forEach(function(a) {
        r[a] = o[a];
      }), r;
    }
  }
  return ct;
}
var Ke = { exports: {} }, Xi;
function bo() {
  if (Xi) return Ke.exports;
  Xi = 1;
  var t = _o();
  Ke.exports = t(s), Ke.exports.strict = t(c), s.proto = s(function() {
    Object.defineProperty(Function.prototype, "once", {
      value: function() {
        return s(this);
      },
      configurable: !0
    }), Object.defineProperty(Function.prototype, "onceStrict", {
      value: function() {
        return c(this);
      },
      configurable: !0
    });
  });
  function s(v) {
    var d = function() {
      return d.called ? d.value : (d.called = !0, d.value = v.apply(this, arguments));
    };
    return d.called = !1, d;
  }
  function c(v) {
    var d = function() {
      if (d.called)
        throw new Error(d.onceError);
      return d.called = !0, d.value = v.apply(this, arguments);
    }, i = v.name || "Function wrapped with `once`";
    return d.onceError = i + " shouldn't be called more than once", d.called = !1, d;
  }
  return Ke.exports;
}
var ht, zi;
function Eu() {
  if (zi) return ht;
  zi = 1;
  var t = _o(), s = /* @__PURE__ */ Object.create(null), c = bo();
  ht = t(v);
  function v(r, o) {
    return s[r] ? (s[r].push(o), null) : (s[r] = [o], d(r));
  }
  function d(r) {
    return c(function o() {
      var a = s[r], f = a.length, n = i(arguments);
      try {
        for (var D = 0; D < f; D++)
          a[D].apply(null, n);
      } finally {
        a.length > f ? (a.splice(0, f), process.nextTick(function() {
          o.apply(null, n);
        })) : delete s[r];
      }
    });
  }
  function i(r) {
    for (var o = r.length, a = [], f = 0; f < o; f++) a[f] = r[f];
    return a;
  }
  return ht;
}
var dt, Ki;
function go() {
  if (Ki) return dt;
  Ki = 1, dt = u;
  var t = vo(), s = mn();
  s.Minimatch;
  var c = Fe(), v = Se.EventEmitter, d = te, i = tr, r = En(), o = mu(), a = Do(), f = a.setopts, n = a.ownProp, D = Eu(), l = a.childrenIgnored, E = a.isIgnored, y = bo();
  function u(h, p, g) {
    if (typeof p == "function" && (g = p, p = {}), p || (p = {}), p.sync) {
      if (g)
        throw new TypeError("callback provided to sync glob");
      return o(h, p);
    }
    return new _(h, p, g);
  }
  u.sync = o;
  var b = u.GlobSync = o.GlobSync;
  u.glob = u;
  function e(h, p) {
    if (p === null || typeof p != "object")
      return h;
    for (var g = Object.keys(p), R = g.length; R--; )
      h[g[R]] = p[g[R]];
    return h;
  }
  u.hasMagic = function(h, p) {
    var g = e({}, p);
    g.noprocess = !0;
    var R = new _(h, g), C = R.minimatch.set;
    if (!h)
      return !1;
    if (C.length > 1)
      return !0;
    for (var m = 0; m < C[0].length; m++)
      if (typeof C[0][m] != "string")
        return !0;
    return !1;
  }, u.Glob = _, c(_, v);
  function _(h, p, g) {
    if (typeof p == "function" && (g = p, p = null), p && p.sync) {
      if (g)
        throw new TypeError("callback provided to sync glob");
      return new b(h, p);
    }
    if (!(this instanceof _))
      return new _(h, p, g);
    f(this, h, p), this._didRealPath = !1;
    var R = this.minimatch.set.length;
    this.matches = new Array(R), typeof g == "function" && (g = y(g), this.on("error", g), this.on("end", function(T) {
      g(null, T);
    }));
    var C = this;
    if (this._processing = 0, this._emitQueue = [], this._processQueue = [], this.paused = !1, this.noprocess)
      return this;
    if (R === 0)
      return O();
    for (var m = !0, F = 0; F < R; F++)
      this._process(this.minimatch.set[F], F, !1, O);
    m = !1;
    function O() {
      --C._processing, C._processing <= 0 && (m ? process.nextTick(function() {
        C._finish();
      }) : C._finish());
    }
  }
  _.prototype._finish = function() {
    if (i(this instanceof _), !this.aborted) {
      if (this.realpath && !this._didRealpath)
        return this._realpath();
      a.finish(this), this.emit("end", this.found);
    }
  }, _.prototype._realpath = function() {
    if (this._didRealpath)
      return;
    this._didRealpath = !0;
    var h = this.matches.length;
    if (h === 0)
      return this._finish();
    for (var p = this, g = 0; g < this.matches.length; g++)
      this._realpathSet(g, R);
    function R() {
      --h === 0 && p._finish();
    }
  }, _.prototype._realpathSet = function(h, p) {
    var g = this.matches[h];
    if (!g)
      return p();
    var R = Object.keys(g), C = this, m = R.length;
    if (m === 0)
      return p();
    var F = this.matches[h] = /* @__PURE__ */ Object.create(null);
    R.forEach(function(O, T) {
      O = C._makeAbs(O), t.realpath(O, C.realpathCache, function(x, B) {
        x ? x.syscall === "stat" ? F[O] = !0 : C.emit("error", x) : F[B] = !0, --m === 0 && (C.matches[h] = F, p());
      });
    });
  }, _.prototype._mark = function(h) {
    return a.mark(this, h);
  }, _.prototype._makeAbs = function(h) {
    return a.makeAbs(this, h);
  }, _.prototype.abort = function() {
    this.aborted = !0, this.emit("abort");
  }, _.prototype.pause = function() {
    this.paused || (this.paused = !0, this.emit("pause"));
  }, _.prototype.resume = function() {
    if (this.paused) {
      if (this.emit("resume"), this.paused = !1, this._emitQueue.length) {
        var h = this._emitQueue.slice(0);
        this._emitQueue.length = 0;
        for (var p = 0; p < h.length; p++) {
          var g = h[p];
          this._emitMatch(g[0], g[1]);
        }
      }
      if (this._processQueue.length) {
        var R = this._processQueue.slice(0);
        this._processQueue.length = 0;
        for (var p = 0; p < R.length; p++) {
          var C = R[p];
          this._processing--, this._process(C[0], C[1], C[2], C[3]);
        }
      }
    }
  }, _.prototype._process = function(h, p, g, R) {
    if (i(this instanceof _), i(typeof R == "function"), !this.aborted) {
      if (this._processing++, this.paused) {
        this._processQueue.push([h, p, g, R]);
        return;
      }
      for (var C = 0; typeof h[C] == "string"; )
        C++;
      var m;
      switch (C) {
        case h.length:
          this._processSimple(h.join("/"), p, R);
          return;
        case 0:
          m = null;
          break;
        default:
          m = h.slice(0, C).join("/");
          break;
      }
      var F = h.slice(C), O;
      m === null ? O = "." : ((r(m) || r(h.map(function(B) {
        return typeof B == "string" ? B : "[*]";
      }).join("/"))) && (!m || !r(m)) && (m = "/" + m), O = m);
      var T = this._makeAbs(O);
      if (l(this, O))
        return R();
      var x = F[0] === s.GLOBSTAR;
      x ? this._processGlobStar(m, O, T, F, p, g, R) : this._processReaddir(m, O, T, F, p, g, R);
    }
  }, _.prototype._processReaddir = function(h, p, g, R, C, m, F) {
    var O = this;
    this._readdir(g, m, function(T, x) {
      return O._processReaddir2(h, p, g, R, C, m, x, F);
    });
  }, _.prototype._processReaddir2 = function(h, p, g, R, C, m, F, O) {
    if (!F)
      return O();
    for (var T = R[0], x = !!this.minimatch.negate, B = T._glob, k = this.dot || B.charAt(0) === ".", U = [], q = 0; q < F.length; q++) {
      var P = F[q];
      if (P.charAt(0) !== "." || k) {
        var M;
        x && !h ? M = !P.match(T) : M = P.match(T), M && U.push(P);
      }
    }
    var W = U.length;
    if (W === 0)
      return O();
    if (R.length === 1 && !this.mark && !this.stat) {
      this.matches[C] || (this.matches[C] = /* @__PURE__ */ Object.create(null));
      for (var q = 0; q < W; q++) {
        var P = U[q];
        h && (h !== "/" ? P = h + "/" + P : P = h + P), P.charAt(0) === "/" && !this.nomount && (P = d.join(this.root, P)), this._emitMatch(C, P);
      }
      return O();
    }
    R.shift();
    for (var q = 0; q < W; q++) {
      var P = U[q];
      h && (h !== "/" ? P = h + "/" + P : P = h + P), this._process([P].concat(R), C, m, O);
    }
    O();
  }, _.prototype._emitMatch = function(h, p) {
    if (!this.aborted && !E(this, p)) {
      if (this.paused) {
        this._emitQueue.push([h, p]);
        return;
      }
      var g = r(p) ? p : this._makeAbs(p);
      if (this.mark && (p = this._mark(p)), this.absolute && (p = g), !this.matches[h][p]) {
        if (this.nodir) {
          var R = this.cache[g];
          if (R === "DIR" || Array.isArray(R))
            return;
        }
        this.matches[h][p] = !0;
        var C = this.statCache[g];
        C && this.emit("stat", p, C), this.emit("match", p);
      }
    }
  }, _.prototype._readdirInGlobStar = function(h, p) {
    if (this.aborted)
      return;
    if (this.follow)
      return this._readdir(h, !1, p);
    var g = "lstat\0" + h, R = this, C = D(g, m);
    C && R.fs.lstat(h, C);
    function m(F, O) {
      if (F && F.code === "ENOENT")
        return p();
      var T = O && O.isSymbolicLink();
      R.symlinks[h] = T, !T && O && !O.isDirectory() ? (R.cache[h] = "FILE", p()) : R._readdir(h, !1, p);
    }
  }, _.prototype._readdir = function(h, p, g) {
    if (!this.aborted && (g = D("readdir\0" + h + "\0" + p, g), !!g)) {
      if (p && !n(this.symlinks, h))
        return this._readdirInGlobStar(h, g);
      if (n(this.cache, h)) {
        var R = this.cache[h];
        if (!R || R === "FILE")
          return g();
        if (Array.isArray(R))
          return g(null, R);
      }
      var C = this;
      C.fs.readdir(h, w(this, h, g));
    }
  };
  function w(h, p, g) {
    return function(R, C) {
      R ? h._readdirError(p, R, g) : h._readdirEntries(p, C, g);
    };
  }
  return _.prototype._readdirEntries = function(h, p, g) {
    if (!this.aborted) {
      if (!this.mark && !this.stat)
        for (var R = 0; R < p.length; R++) {
          var C = p[R];
          h === "/" ? C = h + C : C = h + "/" + C, this.cache[C] = !0;
        }
      return this.cache[h] = p, g(null, p);
    }
  }, _.prototype._readdirError = function(h, p, g) {
    if (!this.aborted) {
      switch (p.code) {
        case "ENOTSUP":
        case "ENOTDIR":
          var R = this._makeAbs(h);
          if (this.cache[R] = "FILE", R === this.cwdAbs) {
            var C = new Error(p.code + " invalid cwd " + this.cwd);
            C.path = this.cwd, C.code = p.code, this.emit("error", C), this.abort();
          }
          break;
        case "ENOENT":
        case "ELOOP":
        case "ENAMETOOLONG":
        case "UNKNOWN":
          this.cache[this._makeAbs(h)] = !1;
          break;
        default:
          this.cache[this._makeAbs(h)] = !1, this.strict && (this.emit("error", p), this.abort()), this.silent || console.error("glob error", p);
          break;
      }
      return g();
    }
  }, _.prototype._processGlobStar = function(h, p, g, R, C, m, F) {
    var O = this;
    this._readdir(g, m, function(T, x) {
      O._processGlobStar2(h, p, g, R, C, m, x, F);
    });
  }, _.prototype._processGlobStar2 = function(h, p, g, R, C, m, F, O) {
    if (!F)
      return O();
    var T = R.slice(1), x = h ? [h] : [], B = x.concat(T);
    this._process(B, C, !1, O);
    var k = this.symlinks[g], U = F.length;
    if (k && m)
      return O();
    for (var q = 0; q < U; q++) {
      var P = F[q];
      if (!(P.charAt(0) === "." && !this.dot)) {
        var M = x.concat(F[q], T);
        this._process(M, C, !0, O);
        var W = x.concat(F[q], R);
        this._process(W, C, !0, O);
      }
    }
    O();
  }, _.prototype._processSimple = function(h, p, g) {
    var R = this;
    this._stat(h, function(C, m) {
      R._processSimple2(h, p, C, m, g);
    });
  }, _.prototype._processSimple2 = function(h, p, g, R, C) {
    if (this.matches[p] || (this.matches[p] = /* @__PURE__ */ Object.create(null)), !R)
      return C();
    if (h && r(h) && !this.nomount) {
      var m = /[\/\\]$/.test(h);
      h.charAt(0) === "/" ? h = d.join(this.root, h) : (h = d.resolve(this.root, h), m && (h += "/"));
    }
    process.platform === "win32" && (h = h.replace(/\\/g, "/")), this._emitMatch(p, h), C();
  }, _.prototype._stat = function(h, p) {
    var g = this._makeAbs(h), R = h.slice(-1) === "/";
    if (h.length > this.maxLength)
      return p();
    if (!this.stat && n(this.cache, g)) {
      var C = this.cache[g];
      if (Array.isArray(C) && (C = "DIR"), !R || C === "DIR")
        return p(null, C);
      if (R && C === "FILE")
        return p();
    }
    var m = this.statCache[g];
    if (m !== void 0) {
      if (m === !1)
        return p(null, m);
      var F = m.isDirectory() ? "DIR" : "FILE";
      return R && F === "FILE" ? p() : p(null, F, m);
    }
    var O = this, T = D("stat\0" + g, x);
    T && O.fs.lstat(g, T);
    function x(B, k) {
      if (k && k.isSymbolicLink())
        return O.fs.stat(g, function(U, q) {
          U ? O._stat2(h, g, null, k, p) : O._stat2(h, g, U, q, p);
        });
      O._stat2(h, g, B, k, p);
    }
  }, _.prototype._stat2 = function(h, p, g, R, C) {
    if (g && (g.code === "ENOENT" || g.code === "ENOTDIR"))
      return this.statCache[p] = !1, C();
    var m = h.slice(-1) === "/";
    if (this.statCache[p] = R, p.slice(-1) === "/" && R && !R.isDirectory())
      return C(null, !1, R);
    var F = !0;
    return R && (F = R.isDirectory() ? "DIR" : "FILE"), this.cache[p] = this.cache[p] || F, m && F === "FILE" ? C() : C(null, F, R);
  }, dt;
}
var pt, Zi;
function Qi() {
  if (Zi) return pt;
  Zi = 1;
  const t = tr, s = te, c = ie;
  let v;
  try {
    v = go();
  } catch {
  }
  const d = {
    nosort: !0,
    silent: !0
  };
  let i = 0;
  const r = process.platform === "win32", o = (e) => {
    if ([
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ].forEach((w) => {
      e[w] = e[w] || c[w], w = w + "Sync", e[w] = e[w] || c[w];
    }), e.maxBusyTries = e.maxBusyTries || 3, e.emfileWait = e.emfileWait || 1e3, e.glob === !1 && (e.disableGlob = !0), e.disableGlob !== !0 && v === void 0)
      throw Error("glob dependency not found, set `options.disableGlob = true` if intentional");
    e.disableGlob = e.disableGlob || !1, e.glob = e.glob || d;
  }, a = (e, _, w) => {
    typeof _ == "function" && (w = _, _ = {}), t(e, "rimraf: missing path"), t.equal(typeof e, "string", "rimraf: path should be a string"), t.equal(typeof w, "function", "rimraf: callback function required"), t(_, "rimraf: invalid options argument provided"), t.equal(typeof _, "object", "rimraf: options should be object"), o(_);
    let h = 0, p = null, g = 0;
    const R = (m) => {
      p = p || m, --g === 0 && w(p);
    }, C = (m, F) => {
      if (m)
        return w(m);
      if (g = F.length, g === 0)
        return w();
      F.forEach((O) => {
        const T = (x) => {
          if (x) {
            if ((x.code === "EBUSY" || x.code === "ENOTEMPTY" || x.code === "EPERM") && h < _.maxBusyTries)
              return h++, setTimeout(() => f(O, _, T), h * 100);
            if (x.code === "EMFILE" && i < _.emfileWait)
              return setTimeout(() => f(O, _, T), i++);
            x.code === "ENOENT" && (x = null);
          }
          i = 0, R(x);
        };
        f(O, _, T);
      });
    };
    if (_.disableGlob || !v.hasMagic(e))
      return C(null, [e]);
    _.lstat(e, (m, F) => {
      if (!m)
        return C(null, [e]);
      v(e, _.glob, C);
    });
  }, f = (e, _, w) => {
    t(e), t(_), t(typeof w == "function"), _.lstat(e, (h, p) => {
      if (h && h.code === "ENOENT")
        return w(null);
      if (h && h.code === "EPERM" && r && n(e, _, h, w), p && p.isDirectory())
        return l(e, _, h, w);
      _.unlink(e, (g) => {
        if (g) {
          if (g.code === "ENOENT")
            return w(null);
          if (g.code === "EPERM")
            return r ? n(e, _, g, w) : l(e, _, g, w);
          if (g.code === "EISDIR")
            return l(e, _, g, w);
        }
        return w(g);
      });
    });
  }, n = (e, _, w, h) => {
    t(e), t(_), t(typeof h == "function"), _.chmod(e, 438, (p) => {
      p ? h(p.code === "ENOENT" ? null : w) : _.stat(e, (g, R) => {
        g ? h(g.code === "ENOENT" ? null : w) : R.isDirectory() ? l(e, _, w, h) : _.unlink(e, h);
      });
    });
  }, D = (e, _, w) => {
    t(e), t(_);
    try {
      _.chmodSync(e, 438);
    } catch (p) {
      if (p.code === "ENOENT")
        return;
      throw w;
    }
    let h;
    try {
      h = _.statSync(e);
    } catch (p) {
      if (p.code === "ENOENT")
        return;
      throw w;
    }
    h.isDirectory() ? u(e, _, w) : _.unlinkSync(e);
  }, l = (e, _, w, h) => {
    t(e), t(_), t(typeof h == "function"), _.rmdir(e, (p) => {
      p && (p.code === "ENOTEMPTY" || p.code === "EEXIST" || p.code === "EPERM") ? E(e, _, h) : p && p.code === "ENOTDIR" ? h(w) : h(p);
    });
  }, E = (e, _, w) => {
    t(e), t(_), t(typeof w == "function"), _.readdir(e, (h, p) => {
      if (h)
        return w(h);
      let g = p.length;
      if (g === 0)
        return _.rmdir(e, w);
      let R;
      p.forEach((C) => {
        a(s.join(e, C), _, (m) => {
          if (!R) {
            if (m)
              return w(R = m);
            --g === 0 && _.rmdir(e, w);
          }
        });
      });
    });
  }, y = (e, _) => {
    _ = _ || {}, o(_), t(e, "rimraf: missing path"), t.equal(typeof e, "string", "rimraf: path should be a string"), t(_, "rimraf: missing options"), t.equal(typeof _, "object", "rimraf: options should be object");
    let w;
    if (_.disableGlob || !v.hasMagic(e))
      w = [e];
    else
      try {
        _.lstatSync(e), w = [e];
      } catch {
        w = v.sync(e, _.glob);
      }
    if (w.length)
      for (let h = 0; h < w.length; h++) {
        const p = w[h];
        let g;
        try {
          g = _.lstatSync(p);
        } catch (R) {
          if (R.code === "ENOENT")
            return;
          R.code === "EPERM" && r && D(p, _, R);
        }
        try {
          g && g.isDirectory() ? u(p, _, null) : _.unlinkSync(p);
        } catch (R) {
          if (R.code === "ENOENT")
            return;
          if (R.code === "EPERM")
            return r ? D(p, _, R) : u(p, _, R);
          if (R.code !== "EISDIR")
            throw R;
          u(p, _, R);
        }
      }
  }, u = (e, _, w) => {
    t(e), t(_);
    try {
      _.rmdirSync(e);
    } catch (h) {
      if (h.code === "ENOENT")
        return;
      if (h.code === "ENOTDIR")
        throw w;
      (h.code === "ENOTEMPTY" || h.code === "EEXIST" || h.code === "EPERM") && b(e, _);
    }
  }, b = (e, _) => {
    t(e), t(_), _.readdirSync(e).forEach((p) => y(s.join(e, p), _));
    const w = r ? 100 : 1;
    let h = 0;
    do {
      let p = !0;
      try {
        const g = _.rmdirSync(e, _);
        return p = !1, g;
      } finally {
        if (++h < w && p)
          continue;
      }
    } while (!0);
  };
  return pt = a, a.sync = y, pt;
}
Ne.exports;
var Ji;
function yn() {
  return Ji || (Ji = 1, function(t, s) {
    const c = ie;
    t.exports = s;
    const v = process.version.substr(1).replace(/-.*$/, "").split(".").map((o) => +o), d = [
      "build",
      "clean",
      "configure",
      "package",
      "publish",
      "reveal",
      "testbinary",
      "testpackage",
      "unpublish"
    ], i = "napi_build_version=";
    t.exports.get_napi_version = function() {
      let o = process.versions.napi;
      return o || (v[0] === 9 && v[1] >= 3 ? o = 2 : v[0] === 8 && (o = 1)), o;
    }, t.exports.get_napi_version_as_string = function(o) {
      const a = t.exports.get_napi_version(o);
      return a ? "" + a : "";
    }, t.exports.validate_package_json = function(o, a) {
      const f = o.binary, n = r(f.module_path), D = r(f.remote_path), l = r(f.package_name), E = t.exports.get_napi_build_versions(o, a, !0), y = t.exports.get_napi_build_versions_raw(o);
      if (E && E.forEach((u) => {
        if (!(parseInt(u, 10) === u && u > 0))
          throw new Error("All values specified in napi_versions must be positive integers.");
      }), E && (!n || !D && !l))
        throw new Error("When napi_versions is specified; module_path and either remote_path or package_name must contain the substitution string '{napi_build_version}`.");
      if ((n || D || l) && !y)
        throw new Error("When the substitution string '{napi_build_version}` is specified in module_path, remote_path, or package_name; napi_versions must also be specified.");
      if (E && !t.exports.get_best_napi_build_version(o, a) && t.exports.build_napi_only(o))
        throw new Error(
          "The Node-API version of this Node instance is " + t.exports.get_napi_version(a ? a.target : void 0) + ". This module supports Node-API version(s) " + t.exports.get_napi_build_versions_raw(o) + ". This Node instance cannot run this module."
        );
      if (y && !E && t.exports.build_napi_only(o))
        throw new Error(
          "The Node-API version of this Node instance is " + t.exports.get_napi_version(a ? a.target : void 0) + ". This module supports Node-API version(s) " + t.exports.get_napi_build_versions_raw(o) + ". This Node instance cannot run this module."
        );
    };
    function r(o) {
      return o && (o.indexOf("{napi_build_version}") !== -1 || o.indexOf("{node_napi_label}") !== -1);
    }
    t.exports.expand_commands = function(o, a, f) {
      const n = [], D = t.exports.get_napi_build_versions(o, a);
      return f.forEach((l) => {
        if (D && l.name === "install") {
          const E = t.exports.get_best_napi_build_version(o, a), y = E ? [i + E] : [];
          n.push({ name: l.name, args: y });
        } else D && d.indexOf(l.name) !== -1 ? D.forEach((E) => {
          const y = l.args.slice();
          y.push(i + E), n.push({ name: l.name, args: y });
        }) : n.push(l);
      }), n;
    }, t.exports.get_napi_build_versions = function(o, a, f) {
      const n = po();
      let D = [];
      const l = t.exports.get_napi_version(a ? a.target : void 0);
      if (o.binary && o.binary.napi_versions && o.binary.napi_versions.forEach((E) => {
        const y = D.indexOf(E) !== -1;
        !y && l && E <= l ? D.push(E) : f && !y && l && n.info("This Node instance does not support builds for Node-API version", E);
      }), a && a["build-latest-napi-version-only"]) {
        let E = 0;
        D.forEach((y) => {
          y > E && (E = y);
        }), D = E ? [E] : [];
      }
      return D.length ? D : void 0;
    }, t.exports.get_napi_build_versions_raw = function(o) {
      const a = [];
      return o.binary && o.binary.napi_versions && o.binary.napi_versions.forEach((f) => {
        a.indexOf(f) === -1 && a.push(f);
      }), a.length ? a : void 0;
    }, t.exports.get_command_arg = function(o) {
      return i + o;
    }, t.exports.get_napi_build_version_from_command_args = function(o) {
      for (let a = 0; a < o.length; a++) {
        const f = o[a];
        if (f.indexOf(i) === 0)
          return parseInt(f.substr(i.length), 10);
      }
    }, t.exports.swap_build_dir_out = function(o) {
      o && (Qi().sync(t.exports.get_build_dir(o)), c.renameSync("build", t.exports.get_build_dir(o)));
    }, t.exports.swap_build_dir_in = function(o) {
      o && (Qi().sync("build"), c.renameSync(t.exports.get_build_dir(o), "build"));
    }, t.exports.get_build_dir = function(o) {
      return "build-tmp-napi-v" + o;
    }, t.exports.get_best_napi_build_version = function(o, a) {
      let f = 0;
      const n = t.exports.get_napi_build_versions(o, a);
      if (n) {
        const D = t.exports.get_napi_version(a ? a.target : void 0);
        n.forEach((l) => {
          l > f && l <= D && (f = l);
        });
      }
      return f === 0 ? void 0 : f;
    }, t.exports.build_napi_only = function(o) {
      return o.binary && o.binary.package_name && o.binary.package_name.indexOf("{node_napi_label}") === -1;
    };
  }(Ne, Ne.exports)), Ne.exports;
}
var Ze = { exports: {} }, Qe = { exports: {} }, Je = { exports: {} }, vt, ea;
function or() {
  if (ea) return vt;
  ea = 1;
  const t = "2.0.0", s = 256, c = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, v = 16, d = s - 6;
  return vt = {
    MAX_LENGTH: s,
    MAX_SAFE_COMPONENT_LENGTH: v,
    MAX_SAFE_BUILD_LENGTH: d,
    MAX_SAFE_INTEGER: c,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: t,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, vt;
}
var Dt, ra;
function ur() {
  return ra || (ra = 1, Dt = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...s) => console.error("SEMVER", ...s) : () => {
  }), Dt;
}
var ta;
function ke() {
  return ta || (ta = 1, function(t, s) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: c,
      MAX_SAFE_BUILD_LENGTH: v,
      MAX_LENGTH: d
    } = or(), i = ur();
    s = t.exports = {};
    const r = s.re = [], o = s.safeRe = [], a = s.src = [], f = s.safeSrc = [], n = s.t = {};
    let D = 0;
    const l = "[a-zA-Z0-9-]", E = [
      ["\\s", 1],
      ["\\d", d],
      [l, v]
    ], y = (b) => {
      for (const [e, _] of E)
        b = b.split(`${e}*`).join(`${e}{0,${_}}`).split(`${e}+`).join(`${e}{1,${_}}`);
      return b;
    }, u = (b, e, _) => {
      const w = y(e), h = D++;
      i(b, h, e), n[b] = h, a[h] = e, f[h] = w, r[h] = new RegExp(e, _ ? "g" : void 0), o[h] = new RegExp(w, _ ? "g" : void 0);
    };
    u("NUMERICIDENTIFIER", "0|[1-9]\\d*"), u("NUMERICIDENTIFIERLOOSE", "\\d+"), u("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${l}*`), u("MAINVERSION", `(${a[n.NUMERICIDENTIFIER]})\\.(${a[n.NUMERICIDENTIFIER]})\\.(${a[n.NUMERICIDENTIFIER]})`), u("MAINVERSIONLOOSE", `(${a[n.NUMERICIDENTIFIERLOOSE]})\\.(${a[n.NUMERICIDENTIFIERLOOSE]})\\.(${a[n.NUMERICIDENTIFIERLOOSE]})`), u("PRERELEASEIDENTIFIER", `(?:${a[n.NONNUMERICIDENTIFIER]}|${a[n.NUMERICIDENTIFIER]})`), u("PRERELEASEIDENTIFIERLOOSE", `(?:${a[n.NONNUMERICIDENTIFIER]}|${a[n.NUMERICIDENTIFIERLOOSE]})`), u("PRERELEASE", `(?:-(${a[n.PRERELEASEIDENTIFIER]}(?:\\.${a[n.PRERELEASEIDENTIFIER]})*))`), u("PRERELEASELOOSE", `(?:-?(${a[n.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${a[n.PRERELEASEIDENTIFIERLOOSE]})*))`), u("BUILDIDENTIFIER", `${l}+`), u("BUILD", `(?:\\+(${a[n.BUILDIDENTIFIER]}(?:\\.${a[n.BUILDIDENTIFIER]})*))`), u("FULLPLAIN", `v?${a[n.MAINVERSION]}${a[n.PRERELEASE]}?${a[n.BUILD]}?`), u("FULL", `^${a[n.FULLPLAIN]}$`), u("LOOSEPLAIN", `[v=\\s]*${a[n.MAINVERSIONLOOSE]}${a[n.PRERELEASELOOSE]}?${a[n.BUILD]}?`), u("LOOSE", `^${a[n.LOOSEPLAIN]}$`), u("GTLT", "((?:<|>)?=?)"), u("XRANGEIDENTIFIERLOOSE", `${a[n.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), u("XRANGEIDENTIFIER", `${a[n.NUMERICIDENTIFIER]}|x|X|\\*`), u("XRANGEPLAIN", `[v=\\s]*(${a[n.XRANGEIDENTIFIER]})(?:\\.(${a[n.XRANGEIDENTIFIER]})(?:\\.(${a[n.XRANGEIDENTIFIER]})(?:${a[n.PRERELEASE]})?${a[n.BUILD]}?)?)?`), u("XRANGEPLAINLOOSE", `[v=\\s]*(${a[n.XRANGEIDENTIFIERLOOSE]})(?:\\.(${a[n.XRANGEIDENTIFIERLOOSE]})(?:\\.(${a[n.XRANGEIDENTIFIERLOOSE]})(?:${a[n.PRERELEASELOOSE]})?${a[n.BUILD]}?)?)?`), u("XRANGE", `^${a[n.GTLT]}\\s*${a[n.XRANGEPLAIN]}$`), u("XRANGELOOSE", `^${a[n.GTLT]}\\s*${a[n.XRANGEPLAINLOOSE]}$`), u("COERCEPLAIN", `(^|[^\\d])(\\d{1,${c}})(?:\\.(\\d{1,${c}}))?(?:\\.(\\d{1,${c}}))?`), u("COERCE", `${a[n.COERCEPLAIN]}(?:$|[^\\d])`), u("COERCEFULL", a[n.COERCEPLAIN] + `(?:${a[n.PRERELEASE]})?(?:${a[n.BUILD]})?(?:$|[^\\d])`), u("COERCERTL", a[n.COERCE], !0), u("COERCERTLFULL", a[n.COERCEFULL], !0), u("LONETILDE", "(?:~>?)"), u("TILDETRIM", `(\\s*)${a[n.LONETILDE]}\\s+`, !0), s.tildeTrimReplace = "$1~", u("TILDE", `^${a[n.LONETILDE]}${a[n.XRANGEPLAIN]}$`), u("TILDELOOSE", `^${a[n.LONETILDE]}${a[n.XRANGEPLAINLOOSE]}$`), u("LONECARET", "(?:\\^)"), u("CARETTRIM", `(\\s*)${a[n.LONECARET]}\\s+`, !0), s.caretTrimReplace = "$1^", u("CARET", `^${a[n.LONECARET]}${a[n.XRANGEPLAIN]}$`), u("CARETLOOSE", `^${a[n.LONECARET]}${a[n.XRANGEPLAINLOOSE]}$`), u("COMPARATORLOOSE", `^${a[n.GTLT]}\\s*(${a[n.LOOSEPLAIN]})$|^$`), u("COMPARATOR", `^${a[n.GTLT]}\\s*(${a[n.FULLPLAIN]})$|^$`), u("COMPARATORTRIM", `(\\s*)${a[n.GTLT]}\\s*(${a[n.LOOSEPLAIN]}|${a[n.XRANGEPLAIN]})`, !0), s.comparatorTrimReplace = "$1$2$3", u("HYPHENRANGE", `^\\s*(${a[n.XRANGEPLAIN]})\\s+-\\s+(${a[n.XRANGEPLAIN]})\\s*$`), u("HYPHENRANGELOOSE", `^\\s*(${a[n.XRANGEPLAINLOOSE]})\\s+-\\s+(${a[n.XRANGEPLAINLOOSE]})\\s*$`), u("STAR", "(<|>)?=?\\s*\\*"), u("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), u("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }(Je, Je.exports)), Je.exports;
}
var _t, na;
function wn() {
  if (na) return _t;
  na = 1;
  const t = Object.freeze({ loose: !0 }), s = Object.freeze({});
  return _t = (v) => v ? typeof v != "object" ? t : v : s, _t;
}
var bt, ia;
function mo() {
  if (ia) return bt;
  ia = 1;
  const t = /^[0-9]+$/, s = (v, d) => {
    if (typeof v == "number" && typeof d == "number")
      return v === d ? 0 : v < d ? -1 : 1;
    const i = t.test(v), r = t.test(d);
    return i && r && (v = +v, d = +d), v === d ? 0 : i && !r ? -1 : r && !i ? 1 : v < d ? -1 : 1;
  };
  return bt = {
    compareIdentifiers: s,
    rcompareIdentifiers: (v, d) => s(d, v)
  }, bt;
}
var gt, aa;
function re() {
  if (aa) return gt;
  aa = 1;
  const t = ur(), { MAX_LENGTH: s, MAX_SAFE_INTEGER: c } = or(), { safeRe: v, t: d } = ke(), i = wn(), { compareIdentifiers: r } = mo();
  class o {
    constructor(f, n) {
      if (n = i(n), f instanceof o) {
        if (f.loose === !!n.loose && f.includePrerelease === !!n.includePrerelease)
          return f;
        f = f.version;
      } else if (typeof f != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof f}".`);
      if (f.length > s)
        throw new TypeError(
          `version is longer than ${s} characters`
        );
      t("SemVer", f, n), this.options = n, this.loose = !!n.loose, this.includePrerelease = !!n.includePrerelease;
      const D = f.trim().match(n.loose ? v[d.LOOSE] : v[d.FULL]);
      if (!D)
        throw new TypeError(`Invalid Version: ${f}`);
      if (this.raw = f, this.major = +D[1], this.minor = +D[2], this.patch = +D[3], this.major > c || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > c || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > c || this.patch < 0)
        throw new TypeError("Invalid patch version");
      D[4] ? this.prerelease = D[4].split(".").map((l) => {
        if (/^[0-9]+$/.test(l)) {
          const E = +l;
          if (E >= 0 && E < c)
            return E;
        }
        return l;
      }) : this.prerelease = [], this.build = D[5] ? D[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(f) {
      if (t("SemVer.compare", this.version, this.options, f), !(f instanceof o)) {
        if (typeof f == "string" && f === this.version)
          return 0;
        f = new o(f, this.options);
      }
      return f.version === this.version ? 0 : this.compareMain(f) || this.comparePre(f);
    }
    compareMain(f) {
      return f instanceof o || (f = new o(f, this.options)), this.major < f.major ? -1 : this.major > f.major ? 1 : this.minor < f.minor ? -1 : this.minor > f.minor ? 1 : this.patch < f.patch ? -1 : this.patch > f.patch ? 1 : 0;
    }
    comparePre(f) {
      if (f instanceof o || (f = new o(f, this.options)), this.prerelease.length && !f.prerelease.length)
        return -1;
      if (!this.prerelease.length && f.prerelease.length)
        return 1;
      if (!this.prerelease.length && !f.prerelease.length)
        return 0;
      let n = 0;
      do {
        const D = this.prerelease[n], l = f.prerelease[n];
        if (t("prerelease compare", n, D, l), D === void 0 && l === void 0)
          return 0;
        if (l === void 0)
          return 1;
        if (D === void 0)
          return -1;
        if (D === l)
          continue;
        return r(D, l);
      } while (++n);
    }
    compareBuild(f) {
      f instanceof o || (f = new o(f, this.options));
      let n = 0;
      do {
        const D = this.build[n], l = f.build[n];
        if (t("build compare", n, D, l), D === void 0 && l === void 0)
          return 0;
        if (l === void 0)
          return 1;
        if (D === void 0)
          return -1;
        if (D === l)
          continue;
        return r(D, l);
      } while (++n);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(f, n, D) {
      if (f.startsWith("pre")) {
        if (!n && D === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (n) {
          const l = `-${n}`.match(this.options.loose ? v[d.PRERELEASELOOSE] : v[d.PRERELEASE]);
          if (!l || l[1] !== n)
            throw new Error(`invalid identifier: ${n}`);
        }
      }
      switch (f) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", n, D);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", n, D);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", n, D), this.inc("pre", n, D);
          break;
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", n, D), this.inc("pre", n, D);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        case "pre": {
          const l = Number(D) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [l];
          else {
            let E = this.prerelease.length;
            for (; --E >= 0; )
              typeof this.prerelease[E] == "number" && (this.prerelease[E]++, E = -2);
            if (E === -1) {
              if (n === this.prerelease.join(".") && D === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(l);
            }
          }
          if (n) {
            let E = [n, l];
            D === !1 && (E = [n]), r(this.prerelease[0], n) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = E) : this.prerelease = E;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${f}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return gt = o, gt;
}
var mt, oa;
function Ae() {
  if (oa) return mt;
  oa = 1;
  const t = re();
  return mt = (c, v, d = !1) => {
    if (c instanceof t)
      return c;
    try {
      return new t(c, v);
    } catch (i) {
      if (!d)
        return null;
      throw i;
    }
  }, mt;
}
var Et, ua;
function yu() {
  if (ua) return Et;
  ua = 1;
  const t = Ae();
  return Et = (c, v) => {
    const d = t(c, v);
    return d ? d.version : null;
  }, Et;
}
var yt, sa;
function wu() {
  if (sa) return yt;
  sa = 1;
  const t = Ae();
  return yt = (c, v) => {
    const d = t(c.trim().replace(/^[=v]+/, ""), v);
    return d ? d.version : null;
  }, yt;
}
var wt, la;
function Ru() {
  if (la) return wt;
  la = 1;
  const t = re();
  return wt = (c, v, d, i, r) => {
    typeof d == "string" && (r = i, i = d, d = void 0);
    try {
      return new t(
        c instanceof t ? c.version : c,
        d
      ).inc(v, i, r).version;
    } catch {
      return null;
    }
  }, wt;
}
var Rt, fa;
function Cu() {
  if (fa) return Rt;
  fa = 1;
  const t = Ae();
  return Rt = (c, v) => {
    const d = t(c, null, !0), i = t(v, null, !0), r = d.compare(i);
    if (r === 0)
      return null;
    const o = r > 0, a = o ? d : i, f = o ? i : d, n = !!a.prerelease.length;
    if (!!f.prerelease.length && !n) {
      if (!f.patch && !f.minor)
        return "major";
      if (f.compareMain(a) === 0)
        return f.minor && !f.patch ? "minor" : "patch";
    }
    const l = n ? "pre" : "";
    return d.major !== i.major ? l + "major" : d.minor !== i.minor ? l + "minor" : d.patch !== i.patch ? l + "patch" : "prerelease";
  }, Rt;
}
var Ct, ca;
function Su() {
  if (ca) return Ct;
  ca = 1;
  const t = re();
  return Ct = (c, v) => new t(c, v).major, Ct;
}
var St, ha;
function Fu() {
  if (ha) return St;
  ha = 1;
  const t = re();
  return St = (c, v) => new t(c, v).minor, St;
}
var Ft, da;
function Au() {
  if (da) return Ft;
  da = 1;
  const t = re();
  return Ft = (c, v) => new t(c, v).patch, Ft;
}
var At, pa;
function Ou() {
  if (pa) return At;
  pa = 1;
  const t = Ae();
  return At = (c, v) => {
    const d = t(c, v);
    return d && d.prerelease.length ? d.prerelease : null;
  }, At;
}
var Ot, va;
function ue() {
  if (va) return Ot;
  va = 1;
  const t = re();
  return Ot = (c, v, d) => new t(c, d).compare(new t(v, d)), Ot;
}
var Tt, Da;
function Tu() {
  if (Da) return Tt;
  Da = 1;
  const t = ue();
  return Tt = (c, v, d) => t(v, c, d), Tt;
}
var xt, _a;
function xu() {
  if (_a) return xt;
  _a = 1;
  const t = ue();
  return xt = (c, v) => t(c, v, !0), xt;
}
var It, ba;
function Rn() {
  if (ba) return It;
  ba = 1;
  const t = re();
  return It = (c, v, d) => {
    const i = new t(c, d), r = new t(v, d);
    return i.compare(r) || i.compareBuild(r);
  }, It;
}
var Lt, ga;
function Iu() {
  if (ga) return Lt;
  ga = 1;
  const t = Rn();
  return Lt = (c, v) => c.sort((d, i) => t(d, i, v)), Lt;
}
var Nt, ma;
function Lu() {
  if (ma) return Nt;
  ma = 1;
  const t = Rn();
  return Nt = (c, v) => c.sort((d, i) => t(i, d, v)), Nt;
}
var Bt, Ea;
function sr() {
  if (Ea) return Bt;
  Ea = 1;
  const t = ue();
  return Bt = (c, v, d) => t(c, v, d) > 0, Bt;
}
var kt, ya;
function Cn() {
  if (ya) return kt;
  ya = 1;
  const t = ue();
  return kt = (c, v, d) => t(c, v, d) < 0, kt;
}
var qt, wa;
function Eo() {
  if (wa) return qt;
  wa = 1;
  const t = ue();
  return qt = (c, v, d) => t(c, v, d) === 0, qt;
}
var Pt, Ra;
function yo() {
  if (Ra) return Pt;
  Ra = 1;
  const t = ue();
  return Pt = (c, v, d) => t(c, v, d) !== 0, Pt;
}
var $t, Ca;
function Sn() {
  if (Ca) return $t;
  Ca = 1;
  const t = ue();
  return $t = (c, v, d) => t(c, v, d) >= 0, $t;
}
var Mt, Sa;
function Fn() {
  if (Sa) return Mt;
  Sa = 1;
  const t = ue();
  return Mt = (c, v, d) => t(c, v, d) <= 0, Mt;
}
var jt, Fa;
function wo() {
  if (Fa) return jt;
  Fa = 1;
  const t = Eo(), s = yo(), c = sr(), v = Sn(), d = Cn(), i = Fn();
  return jt = (o, a, f, n) => {
    switch (a) {
      case "===":
        return typeof o == "object" && (o = o.version), typeof f == "object" && (f = f.version), o === f;
      case "!==":
        return typeof o == "object" && (o = o.version), typeof f == "object" && (f = f.version), o !== f;
      case "":
      case "=":
      case "==":
        return t(o, f, n);
      case "!=":
        return s(o, f, n);
      case ">":
        return c(o, f, n);
      case ">=":
        return v(o, f, n);
      case "<":
        return d(o, f, n);
      case "<=":
        return i(o, f, n);
      default:
        throw new TypeError(`Invalid operator: ${a}`);
    }
  }, jt;
}
var Ut, Aa;
function Nu() {
  if (Aa) return Ut;
  Aa = 1;
  const t = re(), s = Ae(), { safeRe: c, t: v } = ke();
  return Ut = (i, r) => {
    if (i instanceof t)
      return i;
    if (typeof i == "number" && (i = String(i)), typeof i != "string")
      return null;
    r = r || {};
    let o = null;
    if (!r.rtl)
      o = i.match(r.includePrerelease ? c[v.COERCEFULL] : c[v.COERCE]);
    else {
      const E = r.includePrerelease ? c[v.COERCERTLFULL] : c[v.COERCERTL];
      let y;
      for (; (y = E.exec(i)) && (!o || o.index + o[0].length !== i.length); )
        (!o || y.index + y[0].length !== o.index + o[0].length) && (o = y), E.lastIndex = y.index + y[1].length + y[2].length;
      E.lastIndex = -1;
    }
    if (o === null)
      return null;
    const a = o[2], f = o[3] || "0", n = o[4] || "0", D = r.includePrerelease && o[5] ? `-${o[5]}` : "", l = r.includePrerelease && o[6] ? `+${o[6]}` : "";
    return s(`${a}.${f}.${n}${D}${l}`, r);
  }, Ut;
}
var Wt, Oa;
function Bu() {
  if (Oa) return Wt;
  Oa = 1;
  class t {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(c) {
      const v = this.map.get(c);
      if (v !== void 0)
        return this.map.delete(c), this.map.set(c, v), v;
    }
    delete(c) {
      return this.map.delete(c);
    }
    set(c, v) {
      if (!this.delete(c) && v !== void 0) {
        if (this.map.size >= this.max) {
          const i = this.map.keys().next().value;
          this.delete(i);
        }
        this.map.set(c, v);
      }
      return this;
    }
  }
  return Wt = t, Wt;
}
var Gt, Ta;
function se() {
  if (Ta) return Gt;
  Ta = 1;
  const t = /\s+/g;
  class s {
    constructor(k, U) {
      if (U = d(U), k instanceof s)
        return k.loose === !!U.loose && k.includePrerelease === !!U.includePrerelease ? k : new s(k.raw, U);
      if (k instanceof i)
        return this.raw = k.value, this.set = [[k]], this.formatted = void 0, this;
      if (this.options = U, this.loose = !!U.loose, this.includePrerelease = !!U.includePrerelease, this.raw = k.trim().replace(t, " "), this.set = this.raw.split("||").map((q) => this.parseRange(q.trim())).filter((q) => q.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const q = this.set[0];
        if (this.set = this.set.filter((P) => !u(P[0])), this.set.length === 0)
          this.set = [q];
        else if (this.set.length > 1) {
          for (const P of this.set)
            if (P.length === 1 && b(P[0])) {
              this.set = [P];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let k = 0; k < this.set.length; k++) {
          k > 0 && (this.formatted += "||");
          const U = this.set[k];
          for (let q = 0; q < U.length; q++)
            q > 0 && (this.formatted += " "), this.formatted += U[q].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(k) {
      const q = ((this.options.includePrerelease && E) | (this.options.loose && y)) + ":" + k, P = v.get(q);
      if (P)
        return P;
      const M = this.options.loose, W = M ? a[f.HYPHENRANGELOOSE] : a[f.HYPHENRANGE];
      k = k.replace(W, T(this.options.includePrerelease)), r("hyphen replace", k), k = k.replace(a[f.COMPARATORTRIM], n), r("comparator trim", k), k = k.replace(a[f.TILDETRIM], D), r("tilde trim", k), k = k.replace(a[f.CARETTRIM], l), r("caret trim", k);
      let V = k.split(" ").map((Z) => _(Z, this.options)).join(" ").split(/\s+/).map((Z) => O(Z, this.options));
      M && (V = V.filter((Z) => (r("loose invalid filter", Z, this.options), !!Z.match(a[f.COMPARATORLOOSE])))), r("range list", V);
      const N = /* @__PURE__ */ new Map(), G = V.map((Z) => new i(Z, this.options));
      for (const Z of G) {
        if (u(Z))
          return [Z];
        N.set(Z.value, Z);
      }
      N.size > 1 && N.has("") && N.delete("");
      const X = [...N.values()];
      return v.set(q, X), X;
    }
    intersects(k, U) {
      if (!(k instanceof s))
        throw new TypeError("a Range is required");
      return this.set.some((q) => e(q, U) && k.set.some((P) => e(P, U) && q.every((M) => P.every((W) => M.intersects(W, U)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(k) {
      if (!k)
        return !1;
      if (typeof k == "string")
        try {
          k = new o(k, this.options);
        } catch {
          return !1;
        }
      for (let U = 0; U < this.set.length; U++)
        if (x(this.set[U], k, this.options))
          return !0;
      return !1;
    }
  }
  Gt = s;
  const c = Bu(), v = new c(), d = wn(), i = lr(), r = ur(), o = re(), {
    safeRe: a,
    t: f,
    comparatorTrimReplace: n,
    tildeTrimReplace: D,
    caretTrimReplace: l
  } = ke(), { FLAG_INCLUDE_PRERELEASE: E, FLAG_LOOSE: y } = or(), u = (B) => B.value === "<0.0.0-0", b = (B) => B.value === "", e = (B, k) => {
    let U = !0;
    const q = B.slice();
    let P = q.pop();
    for (; U && q.length; )
      U = q.every((M) => P.intersects(M, k)), P = q.pop();
    return U;
  }, _ = (B, k) => (B = B.replace(a[f.BUILD], ""), r("comp", B, k), B = g(B, k), r("caret", B), B = h(B, k), r("tildes", B), B = C(B, k), r("xrange", B), B = F(B, k), r("stars", B), B), w = (B) => !B || B.toLowerCase() === "x" || B === "*", h = (B, k) => B.trim().split(/\s+/).map((U) => p(U, k)).join(" "), p = (B, k) => {
    const U = k.loose ? a[f.TILDELOOSE] : a[f.TILDE];
    return B.replace(U, (q, P, M, W, V) => {
      r("tilde", B, q, P, M, W, V);
      let N;
      return w(P) ? N = "" : w(M) ? N = `>=${P}.0.0 <${+P + 1}.0.0-0` : w(W) ? N = `>=${P}.${M}.0 <${P}.${+M + 1}.0-0` : V ? (r("replaceTilde pr", V), N = `>=${P}.${M}.${W}-${V} <${P}.${+M + 1}.0-0`) : N = `>=${P}.${M}.${W} <${P}.${+M + 1}.0-0`, r("tilde return", N), N;
    });
  }, g = (B, k) => B.trim().split(/\s+/).map((U) => R(U, k)).join(" "), R = (B, k) => {
    r("caret", B, k);
    const U = k.loose ? a[f.CARETLOOSE] : a[f.CARET], q = k.includePrerelease ? "-0" : "";
    return B.replace(U, (P, M, W, V, N) => {
      r("caret", B, P, M, W, V, N);
      let G;
      return w(M) ? G = "" : w(W) ? G = `>=${M}.0.0${q} <${+M + 1}.0.0-0` : w(V) ? M === "0" ? G = `>=${M}.${W}.0${q} <${M}.${+W + 1}.0-0` : G = `>=${M}.${W}.0${q} <${+M + 1}.0.0-0` : N ? (r("replaceCaret pr", N), M === "0" ? W === "0" ? G = `>=${M}.${W}.${V}-${N} <${M}.${W}.${+V + 1}-0` : G = `>=${M}.${W}.${V}-${N} <${M}.${+W + 1}.0-0` : G = `>=${M}.${W}.${V}-${N} <${+M + 1}.0.0-0`) : (r("no pr"), M === "0" ? W === "0" ? G = `>=${M}.${W}.${V}${q} <${M}.${W}.${+V + 1}-0` : G = `>=${M}.${W}.${V}${q} <${M}.${+W + 1}.0-0` : G = `>=${M}.${W}.${V} <${+M + 1}.0.0-0`), r("caret return", G), G;
    });
  }, C = (B, k) => (r("replaceXRanges", B, k), B.split(/\s+/).map((U) => m(U, k)).join(" ")), m = (B, k) => {
    B = B.trim();
    const U = k.loose ? a[f.XRANGELOOSE] : a[f.XRANGE];
    return B.replace(U, (q, P, M, W, V, N) => {
      r("xRange", B, q, P, M, W, V, N);
      const G = w(M), X = G || w(W), Z = X || w(V), I = Z;
      return P === "=" && I && (P = ""), N = k.includePrerelease ? "-0" : "", G ? P === ">" || P === "<" ? q = "<0.0.0-0" : q = "*" : P && I ? (X && (W = 0), V = 0, P === ">" ? (P = ">=", X ? (M = +M + 1, W = 0, V = 0) : (W = +W + 1, V = 0)) : P === "<=" && (P = "<", X ? M = +M + 1 : W = +W + 1), P === "<" && (N = "-0"), q = `${P + M}.${W}.${V}${N}`) : X ? q = `>=${M}.0.0${N} <${+M + 1}.0.0-0` : Z && (q = `>=${M}.${W}.0${N} <${M}.${+W + 1}.0-0`), r("xRange return", q), q;
    });
  }, F = (B, k) => (r("replaceStars", B, k), B.trim().replace(a[f.STAR], "")), O = (B, k) => (r("replaceGTE0", B, k), B.trim().replace(a[k.includePrerelease ? f.GTE0PRE : f.GTE0], "")), T = (B) => (k, U, q, P, M, W, V, N, G, X, Z, I) => (w(q) ? U = "" : w(P) ? U = `>=${q}.0.0${B ? "-0" : ""}` : w(M) ? U = `>=${q}.${P}.0${B ? "-0" : ""}` : W ? U = `>=${U}` : U = `>=${U}${B ? "-0" : ""}`, w(G) ? N = "" : w(X) ? N = `<${+G + 1}.0.0-0` : w(Z) ? N = `<${G}.${+X + 1}.0-0` : I ? N = `<=${G}.${X}.${Z}-${I}` : B ? N = `<${G}.${X}.${+Z + 1}-0` : N = `<=${N}`, `${U} ${N}`.trim()), x = (B, k, U) => {
    for (let q = 0; q < B.length; q++)
      if (!B[q].test(k))
        return !1;
    if (k.prerelease.length && !U.includePrerelease) {
      for (let q = 0; q < B.length; q++)
        if (r(B[q].semver), B[q].semver !== i.ANY && B[q].semver.prerelease.length > 0) {
          const P = B[q].semver;
          if (P.major === k.major && P.minor === k.minor && P.patch === k.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Gt;
}
var Ht, xa;
function lr() {
  if (xa) return Ht;
  xa = 1;
  const t = Symbol("SemVer ANY");
  class s {
    static get ANY() {
      return t;
    }
    constructor(n, D) {
      if (D = c(D), n instanceof s) {
        if (n.loose === !!D.loose)
          return n;
        n = n.value;
      }
      n = n.trim().split(/\s+/).join(" "), r("comparator", n, D), this.options = D, this.loose = !!D.loose, this.parse(n), this.semver === t ? this.value = "" : this.value = this.operator + this.semver.version, r("comp", this);
    }
    parse(n) {
      const D = this.options.loose ? v[d.COMPARATORLOOSE] : v[d.COMPARATOR], l = n.match(D);
      if (!l)
        throw new TypeError(`Invalid comparator: ${n}`);
      this.operator = l[1] !== void 0 ? l[1] : "", this.operator === "=" && (this.operator = ""), l[2] ? this.semver = new o(l[2], this.options.loose) : this.semver = t;
    }
    toString() {
      return this.value;
    }
    test(n) {
      if (r("Comparator.test", n, this.options.loose), this.semver === t || n === t)
        return !0;
      if (typeof n == "string")
        try {
          n = new o(n, this.options);
        } catch {
          return !1;
        }
      return i(n, this.operator, this.semver, this.options);
    }
    intersects(n, D) {
      if (!(n instanceof s))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new a(n.value, D).test(this.value) : n.operator === "" ? n.value === "" ? !0 : new a(this.value, D).test(n.semver) : (D = c(D), D.includePrerelease && (this.value === "<0.0.0-0" || n.value === "<0.0.0-0") || !D.includePrerelease && (this.value.startsWith("<0.0.0") || n.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && n.operator.startsWith(">") || this.operator.startsWith("<") && n.operator.startsWith("<") || this.semver.version === n.semver.version && this.operator.includes("=") && n.operator.includes("=") || i(this.semver, "<", n.semver, D) && this.operator.startsWith(">") && n.operator.startsWith("<") || i(this.semver, ">", n.semver, D) && this.operator.startsWith("<") && n.operator.startsWith(">")));
    }
  }
  Ht = s;
  const c = wn(), { safeRe: v, t: d } = ke(), i = wo(), r = ur(), o = re(), a = se();
  return Ht;
}
var Vt, Ia;
function fr() {
  if (Ia) return Vt;
  Ia = 1;
  const t = se();
  return Vt = (c, v, d) => {
    try {
      v = new t(v, d);
    } catch {
      return !1;
    }
    return v.test(c);
  }, Vt;
}
var Yt, La;
function ku() {
  if (La) return Yt;
  La = 1;
  const t = se();
  return Yt = (c, v) => new t(c, v).set.map((d) => d.map((i) => i.value).join(" ").trim().split(" ")), Yt;
}
var Xt, Na;
function qu() {
  if (Na) return Xt;
  Na = 1;
  const t = re(), s = se();
  return Xt = (v, d, i) => {
    let r = null, o = null, a = null;
    try {
      a = new s(d, i);
    } catch {
      return null;
    }
    return v.forEach((f) => {
      a.test(f) && (!r || o.compare(f) === -1) && (r = f, o = new t(r, i));
    }), r;
  }, Xt;
}
var zt, Ba;
function Pu() {
  if (Ba) return zt;
  Ba = 1;
  const t = re(), s = se();
  return zt = (v, d, i) => {
    let r = null, o = null, a = null;
    try {
      a = new s(d, i);
    } catch {
      return null;
    }
    return v.forEach((f) => {
      a.test(f) && (!r || o.compare(f) === 1) && (r = f, o = new t(r, i));
    }), r;
  }, zt;
}
var Kt, ka;
function $u() {
  if (ka) return Kt;
  ka = 1;
  const t = re(), s = se(), c = sr();
  return Kt = (d, i) => {
    d = new s(d, i);
    let r = new t("0.0.0");
    if (d.test(r) || (r = new t("0.0.0-0"), d.test(r)))
      return r;
    r = null;
    for (let o = 0; o < d.set.length; ++o) {
      const a = d.set[o];
      let f = null;
      a.forEach((n) => {
        const D = new t(n.semver.version);
        switch (n.operator) {
          case ">":
            D.prerelease.length === 0 ? D.patch++ : D.prerelease.push(0), D.raw = D.format();
          case "":
          case ">=":
            (!f || c(D, f)) && (f = D);
            break;
          case "<":
          case "<=":
            break;
          default:
            throw new Error(`Unexpected operation: ${n.operator}`);
        }
      }), f && (!r || c(r, f)) && (r = f);
    }
    return r && d.test(r) ? r : null;
  }, Kt;
}
var Zt, qa;
function Mu() {
  if (qa) return Zt;
  qa = 1;
  const t = se();
  return Zt = (c, v) => {
    try {
      return new t(c, v).range || "*";
    } catch {
      return null;
    }
  }, Zt;
}
var Qt, Pa;
function An() {
  if (Pa) return Qt;
  Pa = 1;
  const t = re(), s = lr(), { ANY: c } = s, v = se(), d = fr(), i = sr(), r = Cn(), o = Fn(), a = Sn();
  return Qt = (n, D, l, E) => {
    n = new t(n, E), D = new v(D, E);
    let y, u, b, e, _;
    switch (l) {
      case ">":
        y = i, u = o, b = r, e = ">", _ = ">=";
        break;
      case "<":
        y = r, u = a, b = i, e = "<", _ = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (d(n, D, E))
      return !1;
    for (let w = 0; w < D.set.length; ++w) {
      const h = D.set[w];
      let p = null, g = null;
      if (h.forEach((R) => {
        R.semver === c && (R = new s(">=0.0.0")), p = p || R, g = g || R, y(R.semver, p.semver, E) ? p = R : b(R.semver, g.semver, E) && (g = R);
      }), p.operator === e || p.operator === _ || (!g.operator || g.operator === e) && u(n, g.semver))
        return !1;
      if (g.operator === _ && b(n, g.semver))
        return !1;
    }
    return !0;
  }, Qt;
}
var Jt, $a;
function ju() {
  if ($a) return Jt;
  $a = 1;
  const t = An();
  return Jt = (c, v, d) => t(c, v, ">", d), Jt;
}
var en, Ma;
function Uu() {
  if (Ma) return en;
  Ma = 1;
  const t = An();
  return en = (c, v, d) => t(c, v, "<", d), en;
}
var rn, ja;
function Wu() {
  if (ja) return rn;
  ja = 1;
  const t = se();
  return rn = (c, v, d) => (c = new t(c, d), v = new t(v, d), c.intersects(v, d)), rn;
}
var tn, Ua;
function Gu() {
  if (Ua) return tn;
  Ua = 1;
  const t = fr(), s = ue();
  return tn = (c, v, d) => {
    const i = [];
    let r = null, o = null;
    const a = c.sort((l, E) => s(l, E, d));
    for (const l of a)
      t(l, v, d) ? (o = l, r || (r = l)) : (o && i.push([r, o]), o = null, r = null);
    r && i.push([r, null]);
    const f = [];
    for (const [l, E] of i)
      l === E ? f.push(l) : !E && l === a[0] ? f.push("*") : E ? l === a[0] ? f.push(`<=${E}`) : f.push(`${l} - ${E}`) : f.push(`>=${l}`);
    const n = f.join(" || "), D = typeof v.raw == "string" ? v.raw : String(v);
    return n.length < D.length ? n : v;
  }, tn;
}
var nn, Wa;
function Hu() {
  if (Wa) return nn;
  Wa = 1;
  const t = se(), s = lr(), { ANY: c } = s, v = fr(), d = ue(), i = (D, l, E = {}) => {
    if (D === l)
      return !0;
    D = new t(D, E), l = new t(l, E);
    let y = !1;
    e: for (const u of D.set) {
      for (const b of l.set) {
        const e = a(u, b, E);
        if (y = y || e !== null, e)
          continue e;
      }
      if (y)
        return !1;
    }
    return !0;
  }, r = [new s(">=0.0.0-0")], o = [new s(">=0.0.0")], a = (D, l, E) => {
    if (D === l)
      return !0;
    if (D.length === 1 && D[0].semver === c) {
      if (l.length === 1 && l[0].semver === c)
        return !0;
      E.includePrerelease ? D = r : D = o;
    }
    if (l.length === 1 && l[0].semver === c) {
      if (E.includePrerelease)
        return !0;
      l = o;
    }
    const y = /* @__PURE__ */ new Set();
    let u, b;
    for (const C of D)
      C.operator === ">" || C.operator === ">=" ? u = f(u, C, E) : C.operator === "<" || C.operator === "<=" ? b = n(b, C, E) : y.add(C.semver);
    if (y.size > 1)
      return null;
    let e;
    if (u && b) {
      if (e = d(u.semver, b.semver, E), e > 0)
        return null;
      if (e === 0 && (u.operator !== ">=" || b.operator !== "<="))
        return null;
    }
    for (const C of y) {
      if (u && !v(C, String(u), E) || b && !v(C, String(b), E))
        return null;
      for (const m of l)
        if (!v(C, String(m), E))
          return !1;
      return !0;
    }
    let _, w, h, p, g = b && !E.includePrerelease && b.semver.prerelease.length ? b.semver : !1, R = u && !E.includePrerelease && u.semver.prerelease.length ? u.semver : !1;
    g && g.prerelease.length === 1 && b.operator === "<" && g.prerelease[0] === 0 && (g = !1);
    for (const C of l) {
      if (p = p || C.operator === ">" || C.operator === ">=", h = h || C.operator === "<" || C.operator === "<=", u) {
        if (R && C.semver.prerelease && C.semver.prerelease.length && C.semver.major === R.major && C.semver.minor === R.minor && C.semver.patch === R.patch && (R = !1), C.operator === ">" || C.operator === ">=") {
          if (_ = f(u, C, E), _ === C && _ !== u)
            return !1;
        } else if (u.operator === ">=" && !v(u.semver, String(C), E))
          return !1;
      }
      if (b) {
        if (g && C.semver.prerelease && C.semver.prerelease.length && C.semver.major === g.major && C.semver.minor === g.minor && C.semver.patch === g.patch && (g = !1), C.operator === "<" || C.operator === "<=") {
          if (w = n(b, C, E), w === C && w !== b)
            return !1;
        } else if (b.operator === "<=" && !v(b.semver, String(C), E))
          return !1;
      }
      if (!C.operator && (b || u) && e !== 0)
        return !1;
    }
    return !(u && h && !b && e !== 0 || b && p && !u && e !== 0 || R || g);
  }, f = (D, l, E) => {
    if (!D)
      return l;
    const y = d(D.semver, l.semver, E);
    return y > 0 ? D : y < 0 || l.operator === ">" && D.operator === ">=" ? l : D;
  }, n = (D, l, E) => {
    if (!D)
      return l;
    const y = d(D.semver, l.semver, E);
    return y < 0 ? D : y > 0 || l.operator === "<" && D.operator === "<=" ? l : D;
  };
  return nn = i, nn;
}
var an, Ga;
function Vu() {
  if (Ga) return an;
  Ga = 1;
  const t = ke(), s = or(), c = re(), v = mo(), d = Ae(), i = yu(), r = wu(), o = Ru(), a = Cu(), f = Su(), n = Fu(), D = Au(), l = Ou(), E = ue(), y = Tu(), u = xu(), b = Rn(), e = Iu(), _ = Lu(), w = sr(), h = Cn(), p = Eo(), g = yo(), R = Sn(), C = Fn(), m = wo(), F = Nu(), O = lr(), T = se(), x = fr(), B = ku(), k = qu(), U = Pu(), q = $u(), P = Mu(), M = An(), W = ju(), V = Uu(), N = Wu(), G = Gu(), X = Hu();
  return an = {
    parse: d,
    valid: i,
    clean: r,
    inc: o,
    diff: a,
    major: f,
    minor: n,
    patch: D,
    prerelease: l,
    compare: E,
    rcompare: y,
    compareLoose: u,
    compareBuild: b,
    sort: e,
    rsort: _,
    gt: w,
    lt: h,
    eq: p,
    neq: g,
    gte: R,
    lte: C,
    cmp: m,
    coerce: F,
    Comparator: O,
    Range: T,
    satisfies: x,
    toComparators: B,
    maxSatisfying: k,
    minSatisfying: U,
    minVersion: q,
    validRange: P,
    outside: M,
    gtr: W,
    ltr: V,
    intersects: N,
    simplifyRange: G,
    subset: X,
    SemVer: c,
    re: t.re,
    src: t.src,
    tokens: t.t,
    SEMVER_SPEC_VERSION: s.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: s.RELEASE_TYPES,
    compareIdentifiers: v.compareIdentifiers,
    rcompareIdentifiers: v.rcompareIdentifiers
  }, an;
}
var on, Ha;
function Yu() {
  if (Ha) return on;
  Ha = 1;
  const t = () => process.platform === "linux";
  let s = null;
  return on = { isLinux: t, getReport: () => {
    if (!s)
      if (t() && process.report) {
        const v = process.report.excludeNetwork;
        process.report.excludeNetwork = !0, s = process.report.getReport(), process.report.excludeNetwork = v;
      } else
        s = {};
    return s;
  } }, on;
}
var un, Va;
function Xu() {
  if (Va) return un;
  Va = 1;
  const t = ie, s = "/usr/bin/ldd", c = "/proc/self/exe", v = 2048;
  return un = {
    LDD_PATH: s,
    SELF_PATH: c,
    readFileSync: (r) => {
      const o = t.openSync(r, "r"), a = Buffer.alloc(v), f = t.readSync(o, a, 0, v, 0);
      return t.close(o, () => {
      }), a.subarray(0, f);
    },
    readFile: (r) => new Promise((o, a) => {
      t.open(r, "r", (f, n) => {
        if (f)
          a(f);
        else {
          const D = Buffer.alloc(v);
          t.read(n, D, 0, v, 0, (l, E) => {
            o(D.subarray(0, E)), t.close(n, () => {
            });
          });
        }
      });
    })
  }, un;
}
var sn, Ya;
function zu() {
  return Ya || (Ya = 1, sn = {
    interpreterPath: (s) => {
      if (s.length < 64 || s.readUInt32BE(0) !== 2135247942 || s.readUInt8(4) !== 2 || s.readUInt8(5) !== 1)
        return null;
      const c = s.readUInt32LE(32), v = s.readUInt16LE(54), d = s.readUInt16LE(56);
      for (let i = 0; i < d; i++) {
        const r = c + i * v;
        if (s.readUInt32LE(r) === 3) {
          const a = s.readUInt32LE(r + 8), f = s.readUInt32LE(r + 32);
          return s.subarray(a, a + f).toString().replace(/\0.*$/g, "");
        }
      }
      return null;
    }
  }), sn;
}
var ln, Xa;
function Ku() {
  if (Xa) return ln;
  Xa = 1;
  const t = hn, { isLinux: s, getReport: c } = Yu(), { LDD_PATH: v, SELF_PATH: d, readFile: i, readFileSync: r } = Xu(), { interpreterPath: o } = zu();
  let a, f, n;
  const D = "getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true";
  let l = "";
  const E = () => l || new Promise((N) => {
    t.exec(D, (G, X) => {
      l = G ? " " : X, N(l);
    });
  }), y = () => {
    if (!l)
      try {
        l = t.execSync(D, { encoding: "utf8" });
      } catch {
        l = " ";
      }
    return l;
  }, u = "glibc", b = /LIBC[a-z0-9 \-).]*?(\d+\.\d+)/i, e = "musl", _ = (N) => N.includes("libc.musl-") || N.includes("ld-musl-"), w = () => {
    const N = c();
    return N.header && N.header.glibcVersionRuntime ? u : Array.isArray(N.sharedObjects) && N.sharedObjects.some(_) ? e : null;
  }, h = (N) => {
    const [G, X] = N.split(/[\r\n]+/);
    return G && G.includes(u) ? u : X && X.includes(e) ? e : null;
  }, p = (N) => {
    if (N) {
      if (N.includes("/ld-musl-"))
        return e;
      if (N.includes("/ld-linux-"))
        return u;
    }
    return null;
  }, g = (N) => (N = N.toString(), N.includes("musl") ? e : N.includes("GNU C Library") ? u : null), R = async () => {
    if (f !== void 0)
      return f;
    f = null;
    try {
      const N = await i(v);
      f = g(N);
    } catch {
    }
    return f;
  }, C = () => {
    if (f !== void 0)
      return f;
    f = null;
    try {
      const N = r(v);
      f = g(N);
    } catch {
    }
    return f;
  }, m = async () => {
    if (a !== void 0)
      return a;
    a = null;
    try {
      const N = await i(d), G = o(N);
      a = p(G);
    } catch {
    }
    return a;
  }, F = () => {
    if (a !== void 0)
      return a;
    a = null;
    try {
      const N = r(d), G = o(N);
      a = p(G);
    } catch {
    }
    return a;
  }, O = async () => {
    let N = null;
    if (s() && (N = await m(), !N && (N = await R(), N || (N = w()), !N))) {
      const G = await E();
      N = h(G);
    }
    return N;
  }, T = () => {
    let N = null;
    if (s() && (N = F(), !N && (N = C(), N || (N = w()), !N))) {
      const G = y();
      N = h(G);
    }
    return N;
  }, x = async () => s() && await O() !== u, B = () => s() && T() !== u, k = async () => {
    if (n !== void 0)
      return n;
    n = null;
    try {
      const G = (await i(v)).match(b);
      G && (n = G[1]);
    } catch {
    }
    return n;
  }, U = () => {
    if (n !== void 0)
      return n;
    n = null;
    try {
      const G = r(v).match(b);
      G && (n = G[1]);
    } catch {
    }
    return n;
  }, q = () => {
    const N = c();
    return N.header && N.header.glibcVersionRuntime ? N.header.glibcVersionRuntime : null;
  }, P = (N) => N.trim().split(/\s+/)[1], M = (N) => {
    const [G, X, Z] = N.split(/[\r\n]+/);
    return G && G.includes(u) ? P(G) : X && Z && X.includes(e) ? P(Z) : null;
  };
  return ln = {
    GLIBC: u,
    MUSL: e,
    family: O,
    familySync: T,
    isNonGlibcLinux: x,
    isNonGlibcLinuxSync: B,
    version: async () => {
      let N = null;
      if (s() && (N = await k(), N || (N = q()), !N)) {
        const G = await E();
        N = M(G);
      }
      return N;
    },
    versionSync: () => {
      let N = null;
      if (s() && (N = U(), N || (N = q()), !N)) {
        const G = y();
        N = M(G);
      }
      return N;
    }
  }, ln;
}
const Zu = {
  "0.1.14": {
    node_abi: null,
    v8: "1.3"
  },
  "0.1.15": {
    node_abi: null,
    v8: "1.3"
  },
  "0.1.16": {
    node_abi: null,
    v8: "1.3"
  },
  "0.1.17": {
    node_abi: null,
    v8: "1.3"
  },
  "0.1.18": {
    node_abi: null,
    v8: "1.3"
  },
  "0.1.19": {
    node_abi: null,
    v8: "2.0"
  },
  "0.1.20": {
    node_abi: null,
    v8: "2.0"
  },
  "0.1.21": {
    node_abi: null,
    v8: "2.0"
  },
  "0.1.22": {
    node_abi: null,
    v8: "2.0"
  },
  "0.1.23": {
    node_abi: null,
    v8: "2.0"
  },
  "0.1.24": {
    node_abi: null,
    v8: "2.0"
  },
  "0.1.25": {
    node_abi: null,
    v8: "2.0"
  },
  "0.1.26": {
    node_abi: null,
    v8: "2.0"
  },
  "0.1.27": {
    node_abi: null,
    v8: "2.1"
  },
  "0.1.28": {
    node_abi: null,
    v8: "2.1"
  },
  "0.1.29": {
    node_abi: null,
    v8: "2.1"
  },
  "0.1.30": {
    node_abi: null,
    v8: "2.1"
  },
  "0.1.31": {
    node_abi: null,
    v8: "2.1"
  },
  "0.1.32": {
    node_abi: null,
    v8: "2.1"
  },
  "0.1.33": {
    node_abi: null,
    v8: "2.1"
  },
  "0.1.90": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.91": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.92": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.93": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.94": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.95": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.96": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.97": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.98": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.99": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.100": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.101": {
    node_abi: null,
    v8: "2.3"
  },
  "0.1.102": {
    node_abi: null,
    v8: "2.3"
  },
  "0.1.103": {
    node_abi: null,
    v8: "2.3"
  },
  "0.1.104": {
    node_abi: null,
    v8: "2.3"
  },
  "0.2.0": {
    node_abi: 1,
    v8: "2.3"
  },
  "0.2.1": {
    node_abi: 1,
    v8: "2.3"
  },
  "0.2.2": {
    node_abi: 1,
    v8: "2.3"
  },
  "0.2.3": {
    node_abi: 1,
    v8: "2.3"
  },
  "0.2.4": {
    node_abi: 1,
    v8: "2.3"
  },
  "0.2.5": {
    node_abi: 1,
    v8: "2.3"
  },
  "0.2.6": {
    node_abi: 1,
    v8: "2.3"
  },
  "0.3.0": {
    node_abi: 1,
    v8: "2.5"
  },
  "0.3.1": {
    node_abi: 1,
    v8: "2.5"
  },
  "0.3.2": {
    node_abi: 1,
    v8: "3.0"
  },
  "0.3.3": {
    node_abi: 1,
    v8: "3.0"
  },
  "0.3.4": {
    node_abi: 1,
    v8: "3.0"
  },
  "0.3.5": {
    node_abi: 1,
    v8: "3.0"
  },
  "0.3.6": {
    node_abi: 1,
    v8: "3.0"
  },
  "0.3.7": {
    node_abi: 1,
    v8: "3.0"
  },
  "0.3.8": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.0": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.1": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.2": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.3": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.4": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.5": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.6": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.7": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.8": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.9": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.10": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.11": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.12": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.5.0": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.5.1": {
    node_abi: 1,
    v8: "3.4"
  },
  "0.5.2": {
    node_abi: 1,
    v8: "3.4"
  },
  "0.5.3": {
    node_abi: 1,
    v8: "3.4"
  },
  "0.5.4": {
    node_abi: 1,
    v8: "3.5"
  },
  "0.5.5": {
    node_abi: 1,
    v8: "3.5"
  },
  "0.5.6": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.5.7": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.5.8": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.5.9": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.5.10": {
    node_abi: 1,
    v8: "3.7"
  },
  "0.6.0": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.1": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.2": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.3": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.4": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.5": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.6": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.7": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.8": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.9": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.10": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.11": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.12": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.13": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.14": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.15": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.16": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.17": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.18": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.19": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.20": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.21": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.7.0": {
    node_abi: 1,
    v8: "3.8"
  },
  "0.7.1": {
    node_abi: 1,
    v8: "3.8"
  },
  "0.7.2": {
    node_abi: 1,
    v8: "3.8"
  },
  "0.7.3": {
    node_abi: 1,
    v8: "3.9"
  },
  "0.7.4": {
    node_abi: 1,
    v8: "3.9"
  },
  "0.7.5": {
    node_abi: 1,
    v8: "3.9"
  },
  "0.7.6": {
    node_abi: 1,
    v8: "3.9"
  },
  "0.7.7": {
    node_abi: 1,
    v8: "3.9"
  },
  "0.7.8": {
    node_abi: 1,
    v8: "3.9"
  },
  "0.7.9": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.7.10": {
    node_abi: 1,
    v8: "3.9"
  },
  "0.7.11": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.7.12": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.0": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.1": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.2": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.3": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.4": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.5": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.6": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.7": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.8": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.9": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.10": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.11": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.12": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.13": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.14": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.15": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.16": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.17": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.18": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.19": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.20": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.21": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.22": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.23": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.24": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.25": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.26": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.27": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.28": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.9.0": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.9.1": {
    node_abi: 10,
    v8: "3.11"
  },
  "0.9.2": {
    node_abi: 10,
    v8: "3.11"
  },
  "0.9.3": {
    node_abi: 10,
    v8: "3.13"
  },
  "0.9.4": {
    node_abi: 10,
    v8: "3.13"
  },
  "0.9.5": {
    node_abi: 10,
    v8: "3.13"
  },
  "0.9.6": {
    node_abi: 10,
    v8: "3.15"
  },
  "0.9.7": {
    node_abi: 10,
    v8: "3.15"
  },
  "0.9.8": {
    node_abi: 10,
    v8: "3.15"
  },
  "0.9.9": {
    node_abi: 11,
    v8: "3.15"
  },
  "0.9.10": {
    node_abi: 11,
    v8: "3.15"
  },
  "0.9.11": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.9.12": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.0": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.1": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.2": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.3": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.4": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.5": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.6": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.7": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.8": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.9": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.10": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.11": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.12": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.13": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.14": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.15": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.16": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.17": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.18": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.19": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.20": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.21": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.22": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.23": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.24": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.25": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.26": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.27": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.28": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.29": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.30": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.31": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.32": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.33": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.34": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.35": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.36": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.37": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.38": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.39": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.40": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.41": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.42": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.43": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.44": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.45": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.46": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.47": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.48": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.11.0": {
    node_abi: 12,
    v8: "3.17"
  },
  "0.11.1": {
    node_abi: 12,
    v8: "3.18"
  },
  "0.11.2": {
    node_abi: 12,
    v8: "3.19"
  },
  "0.11.3": {
    node_abi: 12,
    v8: "3.19"
  },
  "0.11.4": {
    node_abi: 12,
    v8: "3.20"
  },
  "0.11.5": {
    node_abi: 12,
    v8: "3.20"
  },
  "0.11.6": {
    node_abi: 12,
    v8: "3.20"
  },
  "0.11.7": {
    node_abi: 12,
    v8: "3.20"
  },
  "0.11.8": {
    node_abi: 13,
    v8: "3.21"
  },
  "0.11.9": {
    node_abi: 13,
    v8: "3.22"
  },
  "0.11.10": {
    node_abi: 13,
    v8: "3.22"
  },
  "0.11.11": {
    node_abi: 14,
    v8: "3.22"
  },
  "0.11.12": {
    node_abi: 14,
    v8: "3.22"
  },
  "0.11.13": {
    node_abi: 14,
    v8: "3.25"
  },
  "0.11.14": {
    node_abi: 14,
    v8: "3.26"
  },
  "0.11.15": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.11.16": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.0": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.1": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.2": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.3": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.4": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.5": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.6": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.7": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.8": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.9": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.10": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.11": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.12": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.13": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.14": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.15": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.16": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.17": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.18": {
    node_abi: 14,
    v8: "3.28"
  },
  "1.0.0": {
    node_abi: 42,
    v8: "3.31"
  },
  "1.0.1": {
    node_abi: 42,
    v8: "3.31"
  },
  "1.0.2": {
    node_abi: 42,
    v8: "3.31"
  },
  "1.0.3": {
    node_abi: 42,
    v8: "4.1"
  },
  "1.0.4": {
    node_abi: 42,
    v8: "4.1"
  },
  "1.1.0": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.2.0": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.3.0": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.4.1": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.4.2": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.4.3": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.5.0": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.5.1": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.6.0": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.6.1": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.6.2": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.6.3": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.6.4": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.7.1": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.8.1": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.8.2": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.8.3": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.8.4": {
    node_abi: 43,
    v8: "4.1"
  },
  "2.0.0": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.0.1": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.0.2": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.1.0": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.2.0": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.2.1": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.3.0": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.3.1": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.3.2": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.3.3": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.3.4": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.4.0": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.5.0": {
    node_abi: 44,
    v8: "4.2"
  },
  "3.0.0": {
    node_abi: 45,
    v8: "4.4"
  },
  "3.1.0": {
    node_abi: 45,
    v8: "4.4"
  },
  "3.2.0": {
    node_abi: 45,
    v8: "4.4"
  },
  "3.3.0": {
    node_abi: 45,
    v8: "4.4"
  },
  "3.3.1": {
    node_abi: 45,
    v8: "4.4"
  },
  "4.0.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.1.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.1.1": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.1.2": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.2.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.2.1": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.2.2": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.2.3": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.2.4": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.2.5": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.2.6": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.3.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.3.1": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.3.2": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.4.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.4.1": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.4.2": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.4.3": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.4.4": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.4.5": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.4.6": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.4.7": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.5.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.6.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.6.1": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.6.2": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.7.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.7.1": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.7.2": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.7.3": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.8.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.8.1": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.8.2": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.8.3": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.8.4": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.8.5": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.8.6": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.8.7": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.9.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.9.1": {
    node_abi: 46,
    v8: "4.5"
  },
  "5.0.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.1.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.1.1": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.2.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.3.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.4.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.4.1": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.5.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.6.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.7.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.7.1": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.8.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.9.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.9.1": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.10.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.10.1": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.11.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.11.1": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.12.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "6.0.0": {
    node_abi: 48,
    v8: "5.0"
  },
  "6.1.0": {
    node_abi: 48,
    v8: "5.0"
  },
  "6.2.0": {
    node_abi: 48,
    v8: "5.0"
  },
  "6.2.1": {
    node_abi: 48,
    v8: "5.0"
  },
  "6.2.2": {
    node_abi: 48,
    v8: "5.0"
  },
  "6.3.0": {
    node_abi: 48,
    v8: "5.0"
  },
  "6.3.1": {
    node_abi: 48,
    v8: "5.0"
  },
  "6.4.0": {
    node_abi: 48,
    v8: "5.0"
  },
  "6.5.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.6.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.7.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.8.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.8.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.9.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.9.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.9.2": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.9.3": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.9.4": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.9.5": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.10.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.10.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.10.2": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.10.3": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.11.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.11.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.11.2": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.11.3": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.11.4": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.11.5": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.12.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.12.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.12.2": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.12.3": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.13.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.13.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.14.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.14.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.14.2": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.14.3": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.14.4": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.15.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.15.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.16.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.17.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.17.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "7.0.0": {
    node_abi: 51,
    v8: "5.4"
  },
  "7.1.0": {
    node_abi: 51,
    v8: "5.4"
  },
  "7.2.0": {
    node_abi: 51,
    v8: "5.4"
  },
  "7.2.1": {
    node_abi: 51,
    v8: "5.4"
  },
  "7.3.0": {
    node_abi: 51,
    v8: "5.4"
  },
  "7.4.0": {
    node_abi: 51,
    v8: "5.4"
  },
  "7.5.0": {
    node_abi: 51,
    v8: "5.4"
  },
  "7.6.0": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.7.0": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.7.1": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.7.2": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.7.3": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.7.4": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.8.0": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.9.0": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.10.0": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.10.1": {
    node_abi: 51,
    v8: "5.5"
  },
  "8.0.0": {
    node_abi: 57,
    v8: "5.8"
  },
  "8.1.0": {
    node_abi: 57,
    v8: "5.8"
  },
  "8.1.1": {
    node_abi: 57,
    v8: "5.8"
  },
  "8.1.2": {
    node_abi: 57,
    v8: "5.8"
  },
  "8.1.3": {
    node_abi: 57,
    v8: "5.8"
  },
  "8.1.4": {
    node_abi: 57,
    v8: "5.8"
  },
  "8.2.0": {
    node_abi: 57,
    v8: "5.8"
  },
  "8.2.1": {
    node_abi: 57,
    v8: "5.8"
  },
  "8.3.0": {
    node_abi: 57,
    v8: "6.0"
  },
  "8.4.0": {
    node_abi: 57,
    v8: "6.0"
  },
  "8.5.0": {
    node_abi: 57,
    v8: "6.0"
  },
  "8.6.0": {
    node_abi: 57,
    v8: "6.0"
  },
  "8.7.0": {
    node_abi: 57,
    v8: "6.1"
  },
  "8.8.0": {
    node_abi: 57,
    v8: "6.1"
  },
  "8.8.1": {
    node_abi: 57,
    v8: "6.1"
  },
  "8.9.0": {
    node_abi: 57,
    v8: "6.1"
  },
  "8.9.1": {
    node_abi: 57,
    v8: "6.1"
  },
  "8.9.2": {
    node_abi: 57,
    v8: "6.1"
  },
  "8.9.3": {
    node_abi: 57,
    v8: "6.1"
  },
  "8.9.4": {
    node_abi: 57,
    v8: "6.1"
  },
  "8.10.0": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.11.0": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.11.1": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.11.2": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.11.3": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.11.4": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.12.0": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.13.0": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.14.0": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.14.1": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.15.0": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.15.1": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.16.0": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.16.1": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.16.2": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.17.0": {
    node_abi: 57,
    v8: "6.2"
  },
  "9.0.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.1.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.2.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.2.1": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.3.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.4.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.5.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.6.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.6.1": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.7.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.7.1": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.8.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.9.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.10.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.10.1": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.11.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.11.1": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.11.2": {
    node_abi: 59,
    v8: "6.2"
  },
  "10.0.0": {
    node_abi: 64,
    v8: "6.6"
  },
  "10.1.0": {
    node_abi: 64,
    v8: "6.6"
  },
  "10.2.0": {
    node_abi: 64,
    v8: "6.6"
  },
  "10.2.1": {
    node_abi: 64,
    v8: "6.6"
  },
  "10.3.0": {
    node_abi: 64,
    v8: "6.6"
  },
  "10.4.0": {
    node_abi: 64,
    v8: "6.7"
  },
  "10.4.1": {
    node_abi: 64,
    v8: "6.7"
  },
  "10.5.0": {
    node_abi: 64,
    v8: "6.7"
  },
  "10.6.0": {
    node_abi: 64,
    v8: "6.7"
  },
  "10.7.0": {
    node_abi: 64,
    v8: "6.7"
  },
  "10.8.0": {
    node_abi: 64,
    v8: "6.7"
  },
  "10.9.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.10.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.11.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.12.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.13.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.14.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.14.1": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.14.2": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.15.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.15.1": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.15.2": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.15.3": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.16.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.16.1": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.16.2": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.16.3": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.17.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.18.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.18.1": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.19.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.20.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.20.1": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.21.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.22.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.22.1": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.23.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.23.1": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.23.2": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.23.3": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.24.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.24.1": {
    node_abi: 64,
    v8: "6.8"
  },
  "11.0.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.1.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.2.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.3.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.4.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.5.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.6.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.7.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.8.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.9.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.10.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.10.1": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.11.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.12.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.13.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.14.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.15.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "12.0.0": {
    node_abi: 72,
    v8: "7.4"
  },
  "12.1.0": {
    node_abi: 72,
    v8: "7.4"
  },
  "12.2.0": {
    node_abi: 72,
    v8: "7.4"
  },
  "12.3.0": {
    node_abi: 72,
    v8: "7.4"
  },
  "12.3.1": {
    node_abi: 72,
    v8: "7.4"
  },
  "12.4.0": {
    node_abi: 72,
    v8: "7.4"
  },
  "12.5.0": {
    node_abi: 72,
    v8: "7.5"
  },
  "12.6.0": {
    node_abi: 72,
    v8: "7.5"
  },
  "12.7.0": {
    node_abi: 72,
    v8: "7.5"
  },
  "12.8.0": {
    node_abi: 72,
    v8: "7.5"
  },
  "12.8.1": {
    node_abi: 72,
    v8: "7.5"
  },
  "12.9.0": {
    node_abi: 72,
    v8: "7.6"
  },
  "12.9.1": {
    node_abi: 72,
    v8: "7.6"
  },
  "12.10.0": {
    node_abi: 72,
    v8: "7.6"
  },
  "12.11.0": {
    node_abi: 72,
    v8: "7.7"
  },
  "12.11.1": {
    node_abi: 72,
    v8: "7.7"
  },
  "12.12.0": {
    node_abi: 72,
    v8: "7.7"
  },
  "12.13.0": {
    node_abi: 72,
    v8: "7.7"
  },
  "12.13.1": {
    node_abi: 72,
    v8: "7.7"
  },
  "12.14.0": {
    node_abi: 72,
    v8: "7.7"
  },
  "12.14.1": {
    node_abi: 72,
    v8: "7.7"
  },
  "12.15.0": {
    node_abi: 72,
    v8: "7.7"
  },
  "12.16.0": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.16.1": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.16.2": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.16.3": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.17.0": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.18.0": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.18.1": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.18.2": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.18.3": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.18.4": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.19.0": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.19.1": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.20.0": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.20.1": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.20.2": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.21.0": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.22.0": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.22.1": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.22.2": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.22.3": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.22.4": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.22.5": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.22.6": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.22.7": {
    node_abi: 72,
    v8: "7.8"
  },
  "13.0.0": {
    node_abi: 79,
    v8: "7.8"
  },
  "13.0.1": {
    node_abi: 79,
    v8: "7.8"
  },
  "13.1.0": {
    node_abi: 79,
    v8: "7.8"
  },
  "13.2.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.3.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.4.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.5.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.6.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.7.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.8.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.9.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.10.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.10.1": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.11.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.12.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.13.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.14.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "14.0.0": {
    node_abi: 83,
    v8: "8.1"
  },
  "14.1.0": {
    node_abi: 83,
    v8: "8.1"
  },
  "14.2.0": {
    node_abi: 83,
    v8: "8.1"
  },
  "14.3.0": {
    node_abi: 83,
    v8: "8.1"
  },
  "14.4.0": {
    node_abi: 83,
    v8: "8.1"
  },
  "14.5.0": {
    node_abi: 83,
    v8: "8.3"
  },
  "14.6.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.7.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.8.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.9.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.10.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.10.1": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.11.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.12.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.13.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.13.1": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.14.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.15.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.15.1": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.15.2": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.15.3": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.15.4": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.15.5": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.16.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.16.1": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.17.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.17.1": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.17.2": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.17.3": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.17.4": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.17.5": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.17.6": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.18.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.18.1": {
    node_abi: 83,
    v8: "8.4"
  },
  "15.0.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.0.1": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.1.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.2.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.2.1": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.3.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.4.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.5.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.5.1": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.6.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.7.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.8.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.9.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.10.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.11.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.12.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.13.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.14.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "16.0.0": {
    node_abi: 93,
    v8: "9.0"
  },
  "16.1.0": {
    node_abi: 93,
    v8: "9.0"
  },
  "16.2.0": {
    node_abi: 93,
    v8: "9.0"
  },
  "16.3.0": {
    node_abi: 93,
    v8: "9.0"
  },
  "16.4.0": {
    node_abi: 93,
    v8: "9.1"
  },
  "16.4.1": {
    node_abi: 93,
    v8: "9.1"
  },
  "16.4.2": {
    node_abi: 93,
    v8: "9.1"
  },
  "16.5.0": {
    node_abi: 93,
    v8: "9.1"
  },
  "16.6.0": {
    node_abi: 93,
    v8: "9.2"
  },
  "16.6.1": {
    node_abi: 93,
    v8: "9.2"
  },
  "16.6.2": {
    node_abi: 93,
    v8: "9.2"
  },
  "16.7.0": {
    node_abi: 93,
    v8: "9.2"
  },
  "16.8.0": {
    node_abi: 93,
    v8: "9.2"
  },
  "16.9.0": {
    node_abi: 93,
    v8: "9.3"
  },
  "16.9.1": {
    node_abi: 93,
    v8: "9.3"
  },
  "16.10.0": {
    node_abi: 93,
    v8: "9.3"
  },
  "16.11.0": {
    node_abi: 93,
    v8: "9.4"
  },
  "16.11.1": {
    node_abi: 93,
    v8: "9.4"
  },
  "16.12.0": {
    node_abi: 93,
    v8: "9.4"
  },
  "16.13.0": {
    node_abi: 93,
    v8: "9.4"
  },
  "17.0.0": {
    node_abi: 102,
    v8: "9.5"
  },
  "17.0.1": {
    node_abi: 102,
    v8: "9.5"
  },
  "17.1.0": {
    node_abi: 102,
    v8: "9.5"
  }
};
var za;
function Qu() {
  return za || (za = 1, function(t, s) {
    t.exports = s;
    const c = te, v = Vu(), d = dn, i = Ku(), r = yn();
    let o;
    process.env.NODE_PRE_GYP_ABI_CROSSWALK ? o = er(process.env.NODE_PRE_GYP_ABI_CROSSWALK) : o = Zu;
    const a = {};
    Object.keys(o).forEach((p) => {
      const g = p.split(".")[0];
      a[g] || (a[g] = p);
    });
    function f(p, g) {
      if (!p)
        throw new Error("get_electron_abi requires valid runtime arg");
      if (typeof g > "u")
        throw new Error("Empty target version is not supported if electron is the target.");
      const R = v.parse(g);
      return p + "-v" + R.major + "." + R.minor;
    }
    t.exports.get_electron_abi = f;
    function n(p, g) {
      if (!p)
        throw new Error("get_node_webkit_abi requires valid runtime arg");
      if (typeof g > "u")
        throw new Error("Empty target version is not supported if node-webkit is the target.");
      return p + "-v" + g;
    }
    t.exports.get_node_webkit_abi = n;
    function D(p, g) {
      if (!p)
        throw new Error("get_node_abi requires valid runtime arg");
      if (!g)
        throw new Error("get_node_abi requires valid process.versions object");
      const R = v.parse(g.node);
      return R.major === 0 && R.minor % 2 ? p + "-v" + g.node : g.modules ? p + "-v" + +g.modules : "v8-" + g.v8.split(".").slice(0, 2).join(".");
    }
    t.exports.get_node_abi = D;
    function l(p, g) {
      if (!p)
        throw new Error("get_runtime_abi requires valid runtime arg");
      if (p === "node-webkit")
        return n(p, g || process.versions["node-webkit"]);
      if (p === "electron")
        return f(p, g || process.versions.electron);
      if (p !== "node")
        throw new Error("Unknown Runtime: '" + p + "'");
      if (g) {
        let R;
        if (o[g])
          R = o[g];
        else {
          const m = g.split(".").map((x) => +x);
          if (m.length !== 3)
            throw new Error("Unknown target version: " + g);
          const F = m[0];
          let O = m[1], T = m[2];
          if (F === 1)
            for (; ; ) {
              O > 0 && --O, T > 0 && --T;
              const x = "" + F + "." + O + "." + T;
              if (o[x]) {
                R = o[x], console.log("Warning: node-pre-gyp could not find exact match for " + g), console.log("Warning: but node-pre-gyp successfully choose " + x + " as ABI compatible target");
                break;
              }
              if (O === 0 && T === 0)
                break;
            }
          else if (F >= 2)
            a[F] && (R = o[a[F]], console.log("Warning: node-pre-gyp could not find exact match for " + g), console.log("Warning: but node-pre-gyp successfully choose " + a[F] + " as ABI compatible target"));
          else if (F === 0 && m[1] % 2 === 0)
            for (; --T > 0; ) {
              const x = "" + F + "." + O + "." + T;
              if (o[x]) {
                R = o[x], console.log("Warning: node-pre-gyp could not find exact match for " + g), console.log("Warning: but node-pre-gyp successfully choose " + x + " as ABI compatible target");
                break;
              }
            }
        }
        if (!R)
          throw new Error("Unsupported target version: " + g);
        const C = {
          node: g,
          v8: R.v8 + ".0",
          // abi_crosswalk uses 1 for node versions lacking process.versions.modules
          // process.versions.modules added in >= v0.10.4 and v0.11.7
          modules: R.node_abi > 1 ? R.node_abi : void 0
        };
        return D(p, C);
      } else
        return D(p, process.versions);
    }
    t.exports.get_runtime_abi = l;
    const E = [
      "module_name",
      "module_path",
      "host"
    ];
    function y(p, g) {
      const R = p.name + ` package.json is not node-pre-gyp ready:
`, C = [];
      p.main || C.push("main"), p.version || C.push("version"), p.name || C.push("name"), p.binary || C.push("binary");
      const m = p.binary;
      if (m && E.forEach((F) => {
        (!m[F] || typeof m[F] != "string") && C.push("binary." + F);
      }), C.length >= 1)
        throw new Error(R + `package.json must declare these properties: 
` + C.join(`
`));
      if (m) {
        const F = d.parse(m.host).protocol;
        if (F === "http:")
          throw new Error("'host' protocol (" + F + ") is invalid - only 'https:' is accepted");
      }
      r.validate_package_json(p, g);
    }
    t.exports.validate_config = y;
    function u(p, g) {
      return Object.keys(g).forEach((R) => {
        const C = "{" + R + "}";
        for (; p.indexOf(C) > -1; )
          p = p.replace(C, g[R]);
      }), p;
    }
    function b(p) {
      return p.slice(-1) !== "/" ? p + "/" : p;
    }
    function e(p) {
      return p.replace(/\/\//g, "/");
    }
    function _(p) {
      let g = "node";
      return p["node-webkit"] ? g = "node-webkit" : p.electron && (g = "electron"), g;
    }
    t.exports.get_process_runtime = _;
    const w = "{module_name}-v{version}-{node_abi}-{platform}-{arch}.tar.gz", h = "";
    t.exports.evaluate = function(p, g, R) {
      g = g || {}, y(p, g);
      const C = p.version, m = v.parse(C), F = g.runtime || _(process.versions), O = {
        name: p.name,
        configuration: g.debug ? "Debug" : "Release",
        debug: g.debug,
        module_name: p.binary.module_name,
        version: m.version,
        prerelease: m.prerelease.length ? m.prerelease.join(".") : "",
        build: m.build.length ? m.build.join(".") : "",
        major: m.major,
        minor: m.minor,
        patch: m.patch,
        runtime: F,
        node_abi: l(F, g.target),
        node_abi_napi: r.get_napi_version(g.target) ? "napi" : l(F, g.target),
        napi_version: r.get_napi_version(g.target),
        // non-zero numeric, undefined if unsupported
        napi_build_version: R || "",
        node_napi_label: R ? "napi-v" + R : l(F, g.target),
        target: g.target || "",
        platform: g.target_platform || process.platform,
        target_platform: g.target_platform || process.platform,
        arch: g.target_arch || process.arch,
        target_arch: g.target_arch || process.arch,
        libc: g.target_libc || i.familySync() || "unknown",
        module_main: p.main,
        toolset: g.toolset || "",
        // address https://github.com/mapbox/node-pre-gyp/issues/119
        bucket: p.binary.bucket,
        region: p.binary.region,
        s3ForcePathStyle: p.binary.s3ForcePathStyle || !1
      }, T = O.module_name.replace("-", "_"), x = process.env["npm_config_" + T + "_binary_host_mirror"] || p.binary.host;
      O.host = b(u(x, O)), O.module_path = u(p.binary.module_path, O), g.module_root ? O.module_path = c.join(g.module_root, O.module_path) : O.module_path = c.resolve(O.module_path), O.module = c.join(O.module_path, O.module_name + ".node"), O.remote_path = p.binary.remote_path ? e(b(u(p.binary.remote_path, O))) : h;
      const B = p.binary.package_name ? p.binary.package_name : w;
      return O.package_name = u(B, O), O.staged_tarball = c.join("build/stage", O.remote_path, O.package_name), O.hosted_path = d.resolve(O.host, O.remote_path), O.hosted_tarball = d.resolve(O.hosted_path, O.package_name), O;
    };
  }(Qe, Qe.exports)), Qe.exports;
}
var Ka;
function Ju() {
  return Ka || (Ka = 1, function(t, s) {
    const c = Ro(), v = Qu(), d = yn(), i = ie.existsSync || te.existsSync, r = te;
    t.exports = s, s.usage = "Finds the require path for the node-pre-gyp installed module", s.validate = function(o, a) {
      v.validate_config(o, a);
    }, s.find = function(o, a) {
      if (!i(o))
        throw new Error(o + "does not exist");
      const f = new c.Run({ package_json_path: o, argv: process.argv });
      f.setBinaryHostProperty();
      const n = f.package_json;
      v.validate_config(n, a);
      let D;
      return d.get_napi_build_versions(n, a) && (D = d.get_best_napi_build_version(n, a)), a = a || {}, a.module_root || (a.module_root = r.dirname(o)), v.evaluate(n, a, D).module;
    };
  }(Ze, Ze.exports)), Ze.exports;
}
const es = "@mapbox/node-pre-gyp", rs = "Node.js native addon binary install tool", ts = "1.0.11", ns = [
  "native",
  "addon",
  "module",
  "c",
  "c++",
  "bindings",
  "binary"
], is = "BSD-3-Clause", as = "Dane Springmeyer <dane@mapbox.com>", os = {
  type: "git",
  url: "git://github.com/mapbox/node-pre-gyp.git"
}, us = "./bin/node-pre-gyp", ss = "./lib/node-pre-gyp.js", ls = {
  "detect-libc": "^2.0.0",
  "https-proxy-agent": "^5.0.0",
  "make-dir": "^3.1.0",
  "node-fetch": "^2.6.7",
  nopt: "^5.0.0",
  npmlog: "^5.0.1",
  rimraf: "^3.0.2",
  semver: "^7.3.5",
  tar: "^6.1.11"
}, fs = {
  "@mapbox/cloudfriend": "^5.1.0",
  "@mapbox/eslint-config-mapbox": "^3.0.0",
  "aws-sdk": "^2.1087.0",
  codecov: "^3.8.3",
  eslint: "^7.32.0",
  "eslint-plugin-node": "^11.1.0",
  "mock-aws-s3": "^4.0.2",
  nock: "^12.0.3",
  "node-addon-api": "^4.3.0",
  nyc: "^15.1.0",
  tape: "^5.5.2",
  "tar-fs": "^2.1.1"
}, cs = {
  all: !0,
  "skip-full": !1,
  exclude: [
    "test/**"
  ]
}, hs = {
  coverage: "nyc --all --include index.js --include lib/ npm test",
  "upload-coverage": "nyc report --reporter json && codecov --clear --flags=unit --file=./coverage/coverage-final.json",
  lint: "eslint bin/node-pre-gyp lib/*js lib/util/*js test/*js scripts/*js",
  fix: "npm run lint -- --fix",
  "update-crosswalk": "node scripts/abi_crosswalk.js",
  test: "tape test/*test.js"
}, ds = {
  name: es,
  description: rs,
  version: ts,
  keywords: ns,
  license: is,
  author: as,
  repository: os,
  bin: us,
  main: ss,
  dependencies: ls,
  devDependencies: fs,
  nyc: cs,
  scripts: hs
};
var Za;
function Ro() {
  return Za || (Za = 1, function(t, s) {
    t.exports = s, s.mockS3Http = Lo().get_mockS3Http(), s.mockS3Http("on");
    const c = s.mockS3Http("get"), v = ie, d = te, i = Bo(), r = po();
    r.disableProgress();
    const o = yn(), a = Se.EventEmitter, f = ae.inherits, n = [
      "clean",
      "install",
      "reinstall",
      "build",
      "rebuild",
      "package",
      "testpackage",
      "publish",
      "unpublish",
      "info",
      "testbinary",
      "reveal",
      "configure"
    ], D = {};
    r.heading = "node-pre-gyp", c && r.warn(`mocking s3 to ${process.env.node_pre_gyp_mock_s3}`), Object.defineProperty(s, "find", {
      get: function() {
        return Ju().find;
      },
      enumerable: !0
    });
    function l({ package_json_path: y = "./package.json", argv: u }) {
      this.package_json_path = y, this.commands = {};
      const b = this;
      n.forEach((e) => {
        b.commands[e] = function(_, w) {
          return r.verbose("command", e, _), er("./" + e)(b, _, w);
        };
      }), this.parseArgv(u), this.binaryHostSet = !1;
    }
    f(l, a), s.Run = l;
    const E = l.prototype;
    E.package = ds, E.configDefs = {
      help: Boolean,
      // everywhere
      arch: String,
      // 'configure'
      debug: Boolean,
      // 'build'
      directory: String,
      // bin
      proxy: String,
      // 'install'
      loglevel: String
      // everywhere
    }, E.shorthands = {
      release: "--no-debug",
      C: "--directory",
      debug: "--debug",
      j: "--jobs",
      silent: "--loglevel=silent",
      silly: "--loglevel=silly",
      verbose: "--loglevel=verbose"
    }, E.aliases = D, E.parseArgv = function(u) {
      this.opts = i(this.configDefs, this.shorthands, u), this.argv = this.opts.argv.remain.slice();
      const b = this.todo = [];
      u = this.argv.map((w) => (w in this.aliases && (w = this.aliases[w]), w)), u.slice().forEach((w) => {
        if (w in this.commands) {
          const h = u.splice(0, u.indexOf(w));
          u.shift(), b.length > 0 && (b[b.length - 1].args = h), b.push({ name: w, args: [] });
        }
      }), b.length > 0 && (b[b.length - 1].args = u.splice(0));
      let e = this.package_json_path;
      this.opts.directory && (e = d.join(this.opts.directory, e)), this.package_json = JSON.parse(v.readFileSync(e)), this.todo = o.expand_commands(this.package_json, this.opts, b);
      const _ = "npm_config_";
      Object.keys(process.env).forEach((w) => {
        if (w.indexOf(_) !== 0) return;
        const h = process.env[w];
        w === _ + "loglevel" ? r.level = h : (w = w.substring(_.length), w === "argv" ? this.opts.argv && this.opts.argv.remain && this.opts.argv.remain.length || (this.opts[w] = h) : this.opts[w] = h);
      }), this.opts.loglevel && (r.level = this.opts.loglevel), r.resume();
    }, E.setBinaryHostProperty = function(y) {
      if (this.binaryHostSet)
        return this.package_json.binary.host;
      const u = this.package_json;
      if (!u || !u.binary || u.binary.host || !u.binary.staging_host || !u.binary.production_host)
        return "";
      let b = "production_host";
      (y === "publish" || y === "unpublish") && (b = "staging_host");
      const e = process.env.node_pre_gyp_s3_host;
      if (e === "staging" || e === "production")
        b = `${e}_host`;
      else if (this.opts.s3_host === "staging" || this.opts.s3_host === "production")
        b = `${this.opts.s3_host}_host`;
      else if (this.opts.s3_host || e)
        throw new Error(`invalid s3_host ${this.opts.s3_host || e}`);
      return u.binary.host = u.binary[b], this.binaryHostSet = !0, u.binary.host;
    }, E.usage = function() {
      return [
        "",
        "  Usage: node-pre-gyp <command> [options]",
        "",
        "  where <command> is one of:",
        n.map((b) => "    - " + b + " - " + er("./" + b).usage).join(`
`),
        "",
        "node-pre-gyp@" + this.version + "  " + d.resolve(__dirname, ".."),
        "node@" + process.versions.node
      ].join(`
`);
    }, Object.defineProperty(E, "version", {
      get: function() {
        return this.package.version;
      },
      enumerable: !0
    });
  }($e, $e.exports)), $e.exports;
}
var fn, Qa;
function ps() {
  if (Qa) return fn;
  Qa = 1;
  const t = Ro(), s = te, c = ie, v = t.find(s.resolve(s.join(__dirname, "../package.json")));
  return fn = c.existsSync(v) ? er(v) : {
    getActiveWindow: () => {
    },
    getOpenWindows: () => {
    }
  }, fn;
}
var Ja;
function cr() {
  if (Ja) return ye.exports;
  Ja = 1;
  const t = ps();
  return ye.exports = async () => t.getActiveWindow(), ye.exports.getOpenWindows = async () => t.getOpenWindows(), ye.exports.sync = t.getActiveWindow, ye.exports.getOpenWindowsSync = t.getOpenWindows, ye.exports;
}
Be.exports = (t) => process.platform === "darwin" ? nr()(t) : process.platform === "linux" ? ir()(t) : process.platform === "win32" ? cr()(t) : Promise.reject(new Error("macOS, Linux, and Windows only"));
Be.exports.sync = (t) => {
  if (process.platform === "darwin")
    return nr().sync(t);
  if (process.platform === "linux")
    return ir().sync(t);
  if (process.platform === "win32")
    return cr().sync(t);
  throw new Error("macOS, Linux, and Windows only");
};
Be.exports.getOpenWindows = (t) => process.platform === "darwin" ? nr().getOpenWindows(t) : process.platform === "linux" ? ir().getOpenWindows(t) : process.platform === "win32" ? cr().getOpenWindows(t) : Promise.reject(new Error("macOS, Linux, and Windows only"));
Be.exports.getOpenWindowsSync = (t) => {
  if (process.platform === "darwin")
    return nr().getOpenWindowsSync(t);
  if (process.platform === "linux")
    return ir().getOpenWindowsSync(t);
  if (process.platform === "win32")
    return cr().getOpenWindowsSync(t);
  throw new Error("macOS, Linux, and Windows only");
};
var vs = Be.exports;
const Ds = /* @__PURE__ */ Oo(vs);
function _s() {
  return Fo.getSystemIdleTime();
}
async function Co() {
  try {
    const t = await Ds();
    return t ? {
      title: t.title,
      app: t.owner.name,
      url: t.url || void 0
    } : null;
  } catch (t) {
    return console.error("Failed to get active window:", t), null;
  }
}
async function bs(t = 60) {
  const s = _s(), c = await Co();
  return {
    isSystemIdle: s >= t,
    systemIdleTime: s,
    activeWindowTitle: (c == null ? void 0 : c.title) || "Unknown",
    activeWindowApp: (c == null ? void 0 : c.app) || "Unknown",
    activeWindowUrl: (c == null ? void 0 : c.url) || null,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}
const On = we.dirname(Ao(import.meta.url));
process.env.DIST = we.join(On, "../dist");
process.env.VITE_PUBLIC = Re.isPackaged ? process.env.DIST : we.join(On, "../public");
let fe;
const cn = process.env.VITE_DEV_SERVER_URL;
function So() {
  fe = new eo({
    width: 1200,
    height: 800,
    icon: we.join(process.env.VITE_PUBLIC, "vite.svg"),
    webPreferences: {
      preload: we.join(On, "preload.js"),
      contextIsolation: !0,
      nodeIntegration: !1,
      sandbox: !1
      // Try disabling sandbox
    }
  }), cn ? (console.log("Load URL:", cn), fe.loadURL(cn)) : (console.log("VITE_DEV_SERVER_URL is missing."), Re.isPackaged ? (console.log("App is packaged. Loading file."), fe.loadFile(we.join(process.env.DIST, "index.html"))) : (console.log("App is not packaged. Trying localhost:5173"), fe.loadURL("http://localhost:5173"))), fe.webContents.openDevTools({ mode: "right" }), fe.webContents.on("before-input-event", (t, s) => {
    s.control && s.shift && s.key.toLowerCase() === "i" && (fe == null || fe.webContents.toggleDevTools(), t.preventDefault());
  });
}
Re.on("window-all-closed", () => {
  process.platform !== "darwin" && (Re.quit(), fe = null);
});
Re.on("activate", () => {
  eo.getAllWindows().length === 0 && So();
});
Re.whenReady().then(() => {
  So(), hr.handle("get-active-window", async () => {
    try {
      return await Co();
    } catch (t) {
      return console.error("Failed to get active window:", t), null;
    }
  }), hr.handle("get-tracking-data", async () => {
    try {
      return await bs();
    } catch (t) {
      return console.error("Failed to get tracking data:", t), null;
    }
  }), hr.on("renderer-log", (t, s) => {
    console.log("RENDERER:", s);
  });
});
