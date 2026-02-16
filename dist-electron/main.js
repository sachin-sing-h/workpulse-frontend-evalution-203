import { powerMonitor as Co, app as Le, BrowserWindow as Qa, ipcMain as Sn } from "electron";
import Ie from "node:path";
import te from "path";
import ae from "util";
import ln from "child_process";
import ie from "fs";
import fn from "url";
import So from "mock-aws-s3";
import cn from "os";
import Fo from "aws-sdk";
import Ao from "nock";
import hn from "stream";
import we from "events";
import rr from "buffer";
import tr from "assert";
var oe = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Oo(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var Ne = { exports: {} }, ge = { exports: {} }, Fn;
function nr() {
  if (Fn) return ge.exports;
  Fn = 1;
  const t = te, { promisify: s } = ae, h = ln, v = s(h.execFile), p = t.join(__dirname, "../main"), i = (o) => {
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
  return ge.exports = async (o) => {
    const { stdout: a } = await v(p, r(o));
    return i(a);
  }, ge.exports.sync = (o) => {
    const a = h.execFileSync(p, r(o), { encoding: "utf8" });
    return i(a);
  }, ge.exports.getOpenWindows = async (o) => {
    const { stdout: a } = await v(p, [...r(o), "--open-windows-list"]);
    return i(a);
  }, ge.exports.getOpenWindowsSync = (o) => {
    const a = h.execFileSync(p, [...r(o), "--open-windows-list"], { encoding: "utf8" });
    return i(a);
  }, ge.exports;
}
var me = { exports: {} }, An;
function ir() {
  if (An) return me.exports;
  An = 1;
  const { promisify: t } = ae, s = ie, h = ln, v = t(h.execFile), p = t(s.readFile), i = t(s.readlink), r = "xprop", o = "xwininfo", a = ["-root", "	$0", "_NET_ACTIVE_WINDOW"], f = ["-root", "_NET_CLIENT_LIST_STACKING"], n = ["-id"], D = (c) => {
    const d = {};
    for (const g of c.trim().split(`
`))
      if (g.includes("=")) {
        const [R, C] = g.split("=");
        d[R.trim()] = C.trim();
      } else if (g.includes(":")) {
        const [R, C] = g.split(":");
        d[R.trim()] = C.trim();
      }
    return d;
  }, l = ({ stdout: c, boundsStdout: d, activeWindowId: g }) => {
    const R = D(c), C = D(d), m = "WM_CLIENT_LEADER(WINDOW)", O = Object.keys(R).indexOf(m) > 0 && Number.parseInt(R[m].split("#").pop(), 16) || g, T = Number.parseInt(R["_NET_WM_PID(CARDINAL)"], 10);
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
  }, E = (c) => Number.parseInt(c.split("	")[1], 16), y = async (c) => {
    const d = await p(`/proc/${c}/statm`, "utf8");
    return Number.parseInt(d.split(" ")[1], 10) * 4096;
  }, u = (c) => {
    const d = ie.readFileSync(`/proc/${c}/statm`, "utf8");
    return Number.parseInt(d.split(" ")[1], 10) * 4096;
  }, b = (c) => i(`/proc/${c}/exe`), e = (c) => {
    try {
      return s.readlinkSync(`/proc/${c}/exe`);
    } catch {
    }
  };
  async function _(c) {
    const [{ stdout: d }, { stdout: g }] = await Promise.all([
      v(r, [...n, c], { env: { ...process.env, LC_ALL: "C.utf8" } }),
      v(o, [...n, c])
    ]), R = l({
      activeWindowId: c,
      boundsStdout: g,
      stdout: d
    }), [C, m] = await Promise.all([
      y(R.owner.processId),
      b(R.owner.processId).catch(() => {
      })
    ]);
    return R.memoryUsage = C, R.owner.path = m, R;
  }
  function w(c) {
    const d = h.execFileSync(r, [...n, c], { encoding: "utf8", env: { ...process.env, LC_ALL: "C.utf8" } }), g = h.execFileSync(o, [...n, c], { encoding: "utf8" }), R = l({
      activeWindowId: c,
      boundsStdout: g,
      stdout: d
    });
    return R.memoryUsage = u(R.owner.processId), R.owner.path = e(R.owner.processId), R;
  }
  return me.exports = async () => {
    try {
      const { stdout: c } = await v(r, a), d = E(c);
      return d ? _(d) : void 0;
    } catch {
      return;
    }
  }, me.exports.sync = () => {
    try {
      const c = h.execFileSync(r, a, { encoding: "utf8" }), d = E(c);
      return d ? w(d) : void 0;
    } catch {
      return;
    }
  }, me.exports.getOpenWindows = async () => {
    try {
      const { stdout: c } = await v(r, f), d = c.split("#")[1].trim().replace(`
`, "").split(",");
      if (!d || d.length === 0)
        return;
      const g = [];
      for await (const R of d)
        g.push(await _(Number.parseInt(R, 16)));
      return g;
    } catch {
      return;
    }
  }, me.exports.getOpenWindowsSync = () => {
    try {
      const d = h.execFileSync(r, f, { encoding: "utf8" }).split("#")[1].trim().replace(`
`, "").split(",");
      if (!d || d.length === 0)
        return;
      const g = [];
      for (const R of d) {
        const C = w(Number.parseInt(R, 16));
        g.push(C);
      }
      return g;
    } catch (c) {
      console.log(c);
      return;
    }
  }, me.exports;
}
var Ee = { exports: {} };
function er(t) {
  throw new Error('Could not dynamically require "' + t + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var Pe = { exports: {} }, $e = { exports: {} }, On;
function To() {
  return On || (On = 1, function(t, s) {
    t.exports = s;
    const h = fn, v = ie, p = te;
    t.exports.detect = function(i, r) {
      const o = i.hosted_path, a = h.parse(o);
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
        const a = So, f = cn;
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
      const r = Fo;
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
      const r = Ao, o = "https://mapbox-node-pre-gyp-public-testing-bucket.s3.us-east-1.amazonaws.com", a = process.env.node_pre_gyp_mock_s3 + "/mapbox-node-pre-gyp-public-testing-bucket";
      return (() => {
        function D(l, E) {
          const y = p.join(a, l.replace("%2B", "+"));
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
  }($e, $e.exports)), $e.exports;
}
var Me = { exports: {} }, hr = { exports: {} }, Tn;
function xo() {
  return Tn || (Tn = 1, function(t, s) {
    t.exports = v.abbrev = v, v.monkeyPatch = h;
    function h() {
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
      a = a.sort(p);
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
    function p(i, r) {
      return i === r ? 0 : i > r ? 1 : -1;
    }
  }(hr)), hr.exports;
}
var xn;
function Io() {
  return xn || (xn = 1, function(t, s) {
    var h = process.env.DEBUG_NOPT || process.env.NOPT_DEBUG ? function() {
      console.error.apply(console, arguments);
    } : function() {
    }, v = fn, p = te, i = hn.Stream, r = xo(), o = cn;
    t.exports = s = a, s.clean = f, s.typeDefs = {
      String: { type: String, validate: n },
      Boolean: { type: Boolean, validate: y },
      url: { type: v, validate: u },
      Number: { type: Number, validate: l },
      path: { type: p, validate: D },
      Stream: { type: i, validate: b },
      Date: { type: Date, validate: E }
    };
    function a(c, d, g, R) {
      g = g || process.argv, c = c || {}, d = d || {}, typeof R != "number" && (R = 2), h(c, d, g, R), g = g.slice(R);
      var C = {}, m = {
        remain: [],
        cooked: g,
        original: g.slice(0)
      };
      return _(g, C, m.remain, c, d), f(C, c, s.typeDefs), C.argv = m, Object.defineProperty(C.argv, "toString", { value: function() {
        return this.original.map(JSON.stringify).join(" ");
      }, enumerable: !1 }), C;
    }
    function f(c, d, g) {
      g = g || s.typeDefs;
      var R = {}, C = [!1, !0, null, String, Array];
      Object.keys(c).forEach(function(m) {
        if (m !== "argv") {
          var F = c[m], O = Array.isArray(F), T = d[m];
          O || (F = [F]), T || (T = C), T === Array && (T = C.concat(Array)), Array.isArray(T) || (T = [T]), h("val=%j", F), h("types=", T), F = F.map(function(x) {
            if (typeof x == "string" && (h("string %j", x), x = x.trim(), x === "null" && ~T.indexOf(null) || x === "true" && (~T.indexOf(!0) || ~T.indexOf(Boolean)) || x === "false" && (~T.indexOf(!1) || ~T.indexOf(Boolean)) ? (x = JSON.parse(x), h("jsonable %j", x)) : ~T.indexOf(Number) && !isNaN(x) ? (h("convert to number", x), x = +x) : ~T.indexOf(Date) && !isNaN(Date.parse(x)) && (h("convert to date", x), x = new Date(x))), !d.hasOwnProperty(m))
              return x;
            x === !1 && ~T.indexOf(null) && !(~T.indexOf(!1) || ~T.indexOf(Boolean)) && (x = null);
            var B = {};
            return B[m] = x, h("prevalidated val", B, x, d[m]), e(B, m, x, d[m], g) ? (h("validated val", B, x, d[m]), B[m]) : (s.invalidHandler ? s.invalidHandler(m, x, d[m], c) : s.invalidHandler !== !1 && h("invalid: " + m + "=" + x, d[m]), R);
          }).filter(function(x) {
            return x !== R;
          }), !F.length && T.indexOf(Array) === -1 ? (h("VAL HAS NO LENGTH, DELETE IT", F, m, T.indexOf(Array)), delete c[m]) : O ? (h(O, c[m], F), c[m] = F) : c[m] = F[0], h("k=%s val=%j", m, F, c[m]);
        }
      });
    }
    function n(c, d, g) {
      c[d] = String(g);
    }
    function D(c, d, g) {
      if (g === !0) return !1;
      if (g === null) return !0;
      g = String(g);
      var R = process.platform === "win32", C = R ? /^~(\/|\\)/ : /^~\//, m = o.homedir();
      return m && g.match(C) ? c[d] = p.resolve(m, g.substr(2)) : c[d] = p.resolve(g), !0;
    }
    function l(c, d, g) {
      if (h("validate Number %j %j %j", d, g, isNaN(g)), isNaN(g)) return !1;
      c[d] = +g;
    }
    function E(c, d, g) {
      var R = Date.parse(g);
      if (h("validate Date %j %j %j", d, g, R), isNaN(R)) return !1;
      c[d] = new Date(g);
    }
    function y(c, d, g) {
      g instanceof Boolean ? g = g.valueOf() : typeof g == "string" ? isNaN(g) ? g === "null" || g === "false" ? g = !1 : g = !0 : g = !!+g : g = !!g, c[d] = g;
    }
    function u(c, d, g) {
      if (g = v.parse(String(g)), !g.host) return !1;
      c[d] = g.href;
    }
    function b(c, d, g) {
      if (!(g instanceof i)) return !1;
      c[d] = g;
    }
    function e(c, d, g, R, C) {
      if (Array.isArray(R)) {
        for (var m = 0, F = R.length; m < F; m++)
          if (R[m] !== Array && e(c, d, g, R[m], C))
            return !0;
        return delete c[d], !1;
      }
      if (R === Array) return !0;
      if (R !== R)
        return h("Poison NaN", d, g, R), delete c[d], !1;
      if (g === R)
        return h("Explicitly allowed %j", g), c[d] = g, !0;
      for (var O = !1, T = Object.keys(C), m = 0, F = T.length; m < F; m++) {
        h("test type %j %j %j", d, g, T[m]);
        var x = C[T[m]];
        if (x && (R && R.name && x.type && x.type.name ? R.name === x.type.name : R === x.type)) {
          var B = {};
          if (O = x.validate(B, d, g) !== !1, g = B[d], O) {
            c[d] = g;
            break;
          }
        }
      }
      return h("OK? %j (%j %j %j)", O, d, g, T[m]), O || delete c[d], O;
    }
    function _(c, d, g, R, C) {
      h("parse", c, d, g);
      for (var m = r(Object.keys(R)), F = r(Object.keys(C)), O = 0; O < c.length; O++) {
        var T = c[O];
        if (h("arg", T), T.match(/^-{2,}$/)) {
          g.push.apply(g, c.slice(O + 1)), c[O] = "--";
          break;
        }
        var x = !1;
        if (T.charAt(0) === "-" && T.length > 1) {
          var B = T.indexOf("=");
          if (B > -1) {
            x = !0;
            var k = T.substr(B + 1);
            T = T.substr(0, B), c.splice(O, 1, T, k);
          }
          var W = w(T, C, F, m);
          if (h("arg=%j shRes=%j", T, W), W && (h(T, W), c.splice.apply(c, [O, 1].concat(W)), T !== W[0])) {
            O--;
            continue;
          }
          T = T.replace(/^-+/, "");
          for (var q = null; T.toLowerCase().indexOf("no-") === 0; )
            q = !q, T = T.substr(3);
          m[T] && (T = m[T]);
          var P = R[T], M = Array.isArray(P);
          M && P.length === 1 && (M = !1, P = P[0]);
          var G = P === Array || M && P.indexOf(Array) !== -1;
          !R.hasOwnProperty(T) && d.hasOwnProperty(T) && (Array.isArray(d[T]) || (d[T] = [d[T]]), G = !0);
          var V, N = c[O + 1], U = typeof q == "boolean" || P === Boolean || M && P.indexOf(Boolean) !== -1 || typeof P > "u" && !x || N === "false" && (P === null || M && ~P.indexOf(null));
          if (U) {
            V = !q, (N === "true" || N === "false") && (V = JSON.parse(N), N = null, q && (V = !V), O++), M && N && (~P.indexOf(N) ? (V = N, O++) : N === "null" && ~P.indexOf(null) ? (V = null, O++) : !N.match(/^-{2,}[^-]/) && !isNaN(N) && ~P.indexOf(Number) ? (V = +N, O++) : !N.match(/^-[^-]/) && ~P.indexOf(String) && (V = N, O++)), G ? (d[T] = d[T] || []).push(V) : d[T] = V;
            continue;
          }
          P === String && (N === void 0 ? N = "" : N.match(/^-{1,2}[^-]+/) && (N = "", O--)), N && N.match(/^-{2,}$/) && (N = void 0, O--), V = N === void 0 ? !0 : N, G ? (d[T] = d[T] || []).push(V) : d[T] = V, O++;
          continue;
        }
        g.push(T);
      }
    }
    function w(c, d, g, R) {
      if (c = c.replace(/^-+/, ""), R[c] === c)
        return null;
      if (d[c])
        return d[c] && !Array.isArray(d[c]) && (d[c] = d[c].split(/\s+/)), d[c];
      var C = d.___singles;
      C || (C = Object.keys(d).filter(function(F) {
        return F.length === 1;
      }).reduce(function(F, O) {
        return F[O] = !0, F;
      }, {}), d.___singles = C, h("shorthand singles", C));
      var m = c.split("").filter(function(F) {
        return C[F];
      });
      return m.join("") === c ? m.map(function(F) {
        return d[F];
      }).reduce(function(F, O) {
        return F.concat(O);
      }, []) : R[c] && !d[c] ? null : (g[c] && (c = g[c]), d[c] && !Array.isArray(d[c]) && (d[c] = d[c].split(/\s+/)), d[c]);
    }
  }(Me, Me.exports)), Me.exports;
}
var dr = { exports: {} }, Fe = {}, pr = { exports: {} }, vr = { exports: {} }, In;
function Ja() {
  if (In) return vr.exports;
  In = 1;
  var t = we.EventEmitter, s = ae, h = 0, v = vr.exports = function(p) {
    t.call(this), this.id = ++h, this.name = p;
  };
  return s.inherits(v, t), vr.exports;
}
var Dr = { exports: {} }, Ln;
function dn() {
  if (Ln) return Dr.exports;
  Ln = 1;
  var t = ae, s = Ja(), h = Dr.exports = function(v, p) {
    s.call(this, v), this.workDone = 0, this.workTodo = p || 0;
  };
  return t.inherits(h, s), h.prototype.completed = function() {
    return this.workTodo === 0 ? 0 : this.workDone / this.workTodo;
  }, h.prototype.addWork = function(v) {
    this.workTodo += v, this.emit("change", this.name, this.completed(), this);
  }, h.prototype.completeWork = function(v) {
    this.workDone += v, this.workDone > this.workTodo && (this.workDone = this.workTodo), this.emit("change", this.name, this.completed(), this);
  }, h.prototype.finish = function() {
    this.workTodo = this.workDone = 1, this.emit("change", this.name, 1, this);
  }, Dr.exports;
}
var _r = { exports: {} }, je = { exports: {} }, br, Nn;
function eo() {
  return Nn || (Nn = 1, br = hn), br;
}
var gr, Bn;
function Lo() {
  if (Bn) return gr;
  Bn = 1;
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
        h(y, e, b[e]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(y, Object.getOwnPropertyDescriptors(b)) : t(Object(b)).forEach(function(e) {
        Object.defineProperty(y, e, Object.getOwnPropertyDescriptor(b, e));
      });
    }
    return y;
  }
  function h(y, u, b) {
    return u = r(u), u in y ? Object.defineProperty(y, u, { value: b, enumerable: !0, configurable: !0, writable: !0 }) : y[u] = b, y;
  }
  function v(y, u) {
    if (!(y instanceof u))
      throw new TypeError("Cannot call a class as a function");
  }
  function p(y, u) {
    for (var b = 0; b < u.length; b++) {
      var e = u[b];
      e.enumerable = e.enumerable || !1, e.configurable = !0, "value" in e && (e.writable = !0), Object.defineProperty(y, r(e.key), e);
    }
  }
  function i(y, u, b) {
    return u && p(y.prototype, u), Object.defineProperty(y, "prototype", { writable: !1 }), y;
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
  return gr = /* @__PURE__ */ function() {
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
          var c = e.data, d = b > c.length ? c.length : b;
          if (d === c.length ? w += c : w += c.slice(0, b), b -= d, b === 0) {
            d === c.length ? (++_, e.next ? this.head = e.next : this.head = this.tail = null) : (this.head = e, e.data = c.slice(d));
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
          var c = _.data, d = b > c.length ? c.length : b;
          if (c.copy(e, e.length - b, 0, d), b -= d, b === 0) {
            d === c.length ? (++w, _.next ? this.head = _.next : this.head = this.tail = null) : (this.head = _, _.data = c.slice(d));
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
  }(), gr;
}
var mr, kn;
function ro() {
  if (kn) return mr;
  kn = 1;
  function t(r, o) {
    var a = this, f = this._readableState && this._readableState.destroyed, n = this._writableState && this._writableState.destroyed;
    return f || n ? (o ? o(r) : r && (this._writableState ? this._writableState.errorEmitted || (this._writableState.errorEmitted = !0, process.nextTick(p, this, r)) : process.nextTick(p, this, r)), this) : (this._readableState && (this._readableState.destroyed = !0), this._writableState && (this._writableState.destroyed = !0), this._destroy(r || null, function(D) {
      !o && D ? a._writableState ? a._writableState.errorEmitted ? process.nextTick(h, a) : (a._writableState.errorEmitted = !0, process.nextTick(s, a, D)) : process.nextTick(s, a, D) : o ? (process.nextTick(h, a), o(D)) : process.nextTick(h, a);
    }), this);
  }
  function s(r, o) {
    p(r, o), h(r);
  }
  function h(r) {
    r._writableState && !r._writableState.emitClose || r._readableState && !r._readableState.emitClose || r.emit("close");
  }
  function v() {
    this._readableState && (this._readableState.destroyed = !1, this._readableState.reading = !1, this._readableState.ended = !1, this._readableState.endEmitted = !1), this._writableState && (this._writableState.destroyed = !1, this._writableState.ended = !1, this._writableState.ending = !1, this._writableState.finalCalled = !1, this._writableState.prefinished = !1, this._writableState.finished = !1, this._writableState.errorEmitted = !1);
  }
  function p(r, o) {
    r.emit("error", o);
  }
  function i(r, o) {
    var a = r._readableState, f = r._writableState;
    a && a.autoDestroy || f && f.autoDestroy ? r.destroy(o) : r.emit("error", o);
  }
  return mr = {
    destroy: t,
    undestroy: v,
    errorOrDestroy: i
  }, mr;
}
var Er = {}, qn;
function pe() {
  if (qn) return Er;
  qn = 1;
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
  function h(r, o) {
    if (Array.isArray(r)) {
      const a = r.length;
      return r = r.map((f) => String(f)), a > 2 ? `one of ${o} ${r.slice(0, a - 1).join(", ")}, or ` + r[a - 1] : a === 2 ? `one of ${o} ${r[0]} or ${r[1]}` : `of ${o} ${r[0]}`;
    } else
      return `of ${o} ${String(r)}`;
  }
  function v(r, o, a) {
    return r.substr(0, o.length) === o;
  }
  function p(r, o, a) {
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
    if (p(r, " argument"))
      n = `The ${r} ${f} ${h(o, "type")}`;
    else {
      const D = i(r, ".") ? "property" : "argument";
      n = `The "${r}" ${D} ${f} ${h(o, "type")}`;
    }
    return n += `. Received type ${typeof a}`, n;
  }, TypeError), s("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF"), s("ERR_METHOD_NOT_IMPLEMENTED", function(r) {
    return "The " + r + " method is not implemented";
  }), s("ERR_STREAM_PREMATURE_CLOSE", "Premature close"), s("ERR_STREAM_DESTROYED", function(r) {
    return "Cannot call " + r + " after a stream was destroyed";
  }), s("ERR_MULTIPLE_CALLBACK", "Callback called multiple times"), s("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable"), s("ERR_STREAM_WRITE_AFTER_END", "write after end"), s("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError), s("ERR_UNKNOWN_ENCODING", function(r) {
    return "Unknown encoding: " + r;
  }, TypeError), s("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event"), Er.codes = t, Er;
}
var yr, Pn;
function to() {
  if (Pn) return yr;
  Pn = 1;
  var t = pe().codes.ERR_INVALID_OPT_VALUE;
  function s(v, p, i) {
    return v.highWaterMark != null ? v.highWaterMark : p ? v[i] : null;
  }
  function h(v, p, i, r) {
    var o = s(p, r, i);
    if (o != null) {
      if (!(isFinite(o) && Math.floor(o) === o) || o < 0) {
        var a = r ? i : "highWaterMark";
        throw new t(a, o);
      }
      return Math.floor(o);
    }
    return v.objectMode ? 16 : 16 * 1024;
  }
  return yr = {
    getHighWaterMark: h
  }, yr;
}
var We = { exports: {} }, Ge = { exports: {} }, $n;
function No() {
  return $n || ($n = 1, typeof Object.create == "function" ? Ge.exports = function(s, h) {
    h && (s.super_ = h, s.prototype = Object.create(h.prototype, {
      constructor: {
        value: s,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }));
  } : Ge.exports = function(s, h) {
    if (h) {
      s.super_ = h;
      var v = function() {
      };
      v.prototype = h.prototype, s.prototype = new v(), s.prototype.constructor = s;
    }
  }), Ge.exports;
}
var Mn;
function Re() {
  if (Mn) return We.exports;
  Mn = 1;
  try {
    var t = require("util");
    if (typeof t.inherits != "function") throw "";
    We.exports = t.inherits;
  } catch {
    We.exports = No();
  }
  return We.exports;
}
var wr, jn;
function Bo() {
  return jn || (jn = 1, wr = ae.deprecate), wr;
}
var Rr, Wn;
function no() {
  if (Wn) return Rr;
  Wn = 1, Rr = C;
  function t(I) {
    var L = this;
    this.next = null, this.entry = null, this.finish = function() {
      Z(L, I);
    };
  }
  var s;
  C.WritableState = g;
  var h = {
    deprecate: Bo()
  }, v = eo(), p = rr.Buffer, i = (typeof oe < "u" ? oe : typeof window < "u" ? window : typeof self < "u" ? self : {}).Uint8Array || function() {
  };
  function r(I) {
    return p.from(I);
  }
  function o(I) {
    return p.isBuffer(I) || I instanceof i;
  }
  var a = ro(), f = to(), n = f.getHighWaterMark, D = pe().codes, l = D.ERR_INVALID_ARG_TYPE, E = D.ERR_METHOD_NOT_IMPLEMENTED, y = D.ERR_MULTIPLE_CALLBACK, u = D.ERR_STREAM_CANNOT_PIPE, b = D.ERR_STREAM_DESTROYED, e = D.ERR_STREAM_NULL_VALUES, _ = D.ERR_STREAM_WRITE_AFTER_END, w = D.ERR_UNKNOWN_ENCODING, c = a.errorOrDestroy;
  Re()(C, v);
  function d() {
  }
  function g(I, L, j) {
    s = s || ye(), I = I || {}, typeof j != "boolean" && (j = L instanceof s), this.objectMode = !!I.objectMode, j && (this.objectMode = this.objectMode || !!I.writableObjectMode), this.highWaterMark = n(this, I, "writableHighWaterMark", j), this.finalCalled = !1, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1, this.destroyed = !1;
    var Y = I.decodeStrings === !1;
    this.decodeStrings = !Y, this.defaultEncoding = I.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function(z) {
      W(L, z);
    }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.emitClose = I.emitClose !== !1, this.autoDestroy = !!I.autoDestroy, this.bufferedRequestCount = 0, this.corkedRequestsFree = new t(this);
  }
  g.prototype.getBuffer = function() {
    for (var L = this.bufferedRequest, j = []; L; )
      j.push(L), L = L.next;
    return j;
  }, function() {
    try {
      Object.defineProperty(g.prototype, "buffer", {
        get: h.deprecate(function() {
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
    s = s || ye();
    var L = this instanceof s;
    if (!L && !R.call(C, this)) return new C(I);
    this._writableState = new g(I, this, L), this.writable = !0, I && (typeof I.write == "function" && (this._write = I.write), typeof I.writev == "function" && (this._writev = I.writev), typeof I.destroy == "function" && (this._destroy = I.destroy), typeof I.final == "function" && (this._final = I.final)), v.call(this);
  }
  C.prototype.pipe = function() {
    c(this, new u());
  };
  function m(I, L) {
    var j = new _();
    c(I, j), process.nextTick(L, j);
  }
  function F(I, L, j, Y) {
    var z;
    return j === null ? z = new e() : typeof j != "string" && !L.objectMode && (z = new l("chunk", ["string", "Buffer"], j)), z ? (c(I, z), process.nextTick(Y, z), !1) : !0;
  }
  C.prototype.write = function(I, L, j) {
    var Y = this._writableState, z = !1, S = !Y.objectMode && o(I);
    return S && !p.isBuffer(I) && (I = r(I)), typeof L == "function" && (j = L, L = null), S ? L = "buffer" : L || (L = Y.defaultEncoding), typeof j != "function" && (j = d), Y.ending ? m(this, j) : (S || F(this, Y, I, j)) && (Y.pendingcb++, z = T(this, Y, S, I, L, j)), z;
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
    return !I.objectMode && I.decodeStrings !== !1 && typeof L == "string" && (L = p.from(L, j)), L;
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
    --L.pendingcb, j ? (process.nextTick(z, Y), process.nextTick(U, I, L), I._writableState.errorEmitted = !0, c(I, Y)) : (z(Y), I._writableState.errorEmitted = !0, c(I, Y), U(I, L));
  }
  function k(I) {
    I.writing = !1, I.writecb = null, I.length -= I.writelen, I.writelen = 0;
  }
  function W(I, L) {
    var j = I._writableState, Y = j.sync, z = j.writecb;
    if (typeof z != "function") throw new y();
    if (k(j), L) B(I, j, Y, L, z);
    else {
      var S = G(j) || I.destroyed;
      !S && !j.corked && !j.bufferProcessing && j.bufferedRequest && M(I, j), Y ? process.nextTick(q, I, j, S, z) : q(I, j, S, z);
    }
  }
  function q(I, L, j, Y) {
    j || P(I, L), L.pendingcb--, Y(), U(I, L);
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
  function G(I) {
    return I.ending && I.length === 0 && I.bufferedRequest === null && !I.finished && !I.writing;
  }
  function V(I, L) {
    I._final(function(j) {
      L.pendingcb--, j && c(I, j), L.prefinished = !0, I.emit("prefinish"), U(I, L);
    });
  }
  function N(I, L) {
    !L.prefinished && !L.finalCalled && (typeof I._final == "function" && !L.destroyed ? (L.pendingcb++, L.finalCalled = !0, process.nextTick(V, I, L)) : (L.prefinished = !0, I.emit("prefinish")));
  }
  function U(I, L) {
    var j = G(L);
    if (j && (N(I, L), L.pendingcb === 0 && (L.finished = !0, I.emit("finish"), L.autoDestroy))) {
      var Y = I._readableState;
      (!Y || Y.autoDestroy && Y.endEmitted) && I.destroy();
    }
    return j;
  }
  function X(I, L, j) {
    L.ending = !0, U(I, L), j && (L.finished ? process.nextTick(j) : I.once("finish", j)), L.ended = !0, I.writable = !1;
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
  }, Rr;
}
var Cr, Gn;
function ye() {
  if (Gn) return Cr;
  Gn = 1;
  var t = Object.keys || function(f) {
    var n = [];
    for (var D in f) n.push(D);
    return n;
  };
  Cr = r;
  var s = io(), h = no();
  Re()(r, s);
  for (var v = t(h.prototype), p = 0; p < v.length; p++) {
    var i = v[p];
    r.prototype[i] || (r.prototype[i] = h.prototype[i]);
  }
  function r(f) {
    if (!(this instanceof r)) return new r(f);
    s.call(this, f), h.call(this, f), this.allowHalfOpen = !0, f && (f.readable === !1 && (this.readable = !1), f.writable === !1 && (this.writable = !1), f.allowHalfOpen === !1 && (this.allowHalfOpen = !1, this.once("end", o)));
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
  }), Cr;
}
var Sr = {}, Ue = { exports: {} };
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
var Un;
function ko() {
  return Un || (Un = 1, function(t, s) {
    var h = rr, v = h.Buffer;
    function p(r, o) {
      for (var a in r)
        o[a] = r[a];
    }
    v.from && v.alloc && v.allocUnsafe && v.allocUnsafeSlow ? t.exports = h : (p(h, s), s.Buffer = i);
    function i(r, o, a) {
      return v(r, o, a);
    }
    i.prototype = Object.create(v.prototype), p(v, i), i.from = function(r, o, a) {
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
      return h.SlowBuffer(r);
    };
  }(Ue, Ue.exports)), Ue.exports;
}
var Hn;
function Vn() {
  if (Hn) return Sr;
  Hn = 1;
  var t = ko().Buffer, s = t.isEncoding || function(e) {
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
  function h(e) {
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
    var _ = h(e);
    if (typeof _ != "string" && (t.isEncoding === s || !s(e))) throw new Error("Unknown encoding: " + e);
    return _ || e;
  }
  Sr.StringDecoder = p;
  function p(e) {
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
  p.prototype.write = function(e) {
    if (e.length === 0) return "";
    var _, w;
    if (this.lastNeed) {
      if (_ = this.fillLast(e), _ === void 0) return "";
      w = this.lastNeed, this.lastNeed = 0;
    } else
      w = 0;
    return w < e.length ? _ ? _ + this.text(e, w) : this.text(e, w) : _ || "";
  }, p.prototype.end = n, p.prototype.text = f, p.prototype.fillLast = function(e) {
    if (this.lastNeed <= e.length)
      return e.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
    e.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, e.length), this.lastNeed -= e.length;
  };
  function i(e) {
    return e <= 127 ? 0 : e >> 5 === 6 ? 2 : e >> 4 === 14 ? 3 : e >> 3 === 30 ? 4 : e >> 6 === 2 ? -1 : -2;
  }
  function r(e, _, w) {
    var c = _.length - 1;
    if (c < w) return 0;
    var d = i(_[c]);
    return d >= 0 ? (d > 0 && (e.lastNeed = d - 1), d) : --c < w || d === -2 ? 0 : (d = i(_[c]), d >= 0 ? (d > 0 && (e.lastNeed = d - 2), d) : --c < w || d === -2 ? 0 : (d = i(_[c]), d >= 0 ? (d > 0 && (d === 2 ? d = 0 : e.lastNeed = d - 3), d) : 0));
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
    var c = e.length - (w - this.lastNeed);
    return e.copy(this.lastChar, 0, c), e.toString("utf8", _, c);
  }
  function n(e) {
    var _ = e && e.length ? this.write(e) : "";
    return this.lastNeed ? _ + "�" : _;
  }
  function D(e, _) {
    if ((e.length - _) % 2 === 0) {
      var w = e.toString("utf16le", _);
      if (w) {
        var c = w.charCodeAt(w.length - 1);
        if (c >= 55296 && c <= 56319)
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
  return Sr;
}
var Fr, Yn;
function pn() {
  if (Yn) return Fr;
  Yn = 1;
  var t = pe().codes.ERR_STREAM_PREMATURE_CLOSE;
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
  function h() {
  }
  function v(i) {
    return i.setHeader && typeof i.abort == "function";
  }
  function p(i, r, o) {
    if (typeof r == "function") return p(i, null, r);
    r || (r = {}), o = s(o || h);
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
  return Fr = p, Fr;
}
var Ar, Xn;
function qo() {
  if (Xn) return Ar;
  Xn = 1;
  var t;
  function s(w, c, d) {
    return c = h(c), c in w ? Object.defineProperty(w, c, { value: d, enumerable: !0, configurable: !0, writable: !0 }) : w[c] = d, w;
  }
  function h(w) {
    var c = v(w, "string");
    return typeof c == "symbol" ? c : String(c);
  }
  function v(w, c) {
    if (typeof w != "object" || w === null) return w;
    var d = w[Symbol.toPrimitive];
    if (d !== void 0) {
      var g = d.call(w, c);
      if (typeof g != "object") return g;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (c === "string" ? String : Number)(w);
  }
  var p = pn(), i = Symbol("lastResolve"), r = Symbol("lastReject"), o = Symbol("error"), a = Symbol("ended"), f = Symbol("lastPromise"), n = Symbol("handlePromise"), D = Symbol("stream");
  function l(w, c) {
    return {
      value: w,
      done: c
    };
  }
  function E(w) {
    var c = w[i];
    if (c !== null) {
      var d = w[D].read();
      d !== null && (w[f] = null, w[i] = null, w[r] = null, c(l(d, !1)));
    }
  }
  function y(w) {
    process.nextTick(E, w);
  }
  function u(w, c) {
    return function(d, g) {
      w.then(function() {
        if (c[a]) {
          d(l(void 0, !0));
          return;
        }
        c[n](d, g);
      }, g);
    };
  }
  var b = Object.getPrototypeOf(function() {
  }), e = Object.setPrototypeOf((t = {
    get stream() {
      return this[D];
    },
    next: function() {
      var c = this, d = this[o];
      if (d !== null)
        return Promise.reject(d);
      if (this[a])
        return Promise.resolve(l(void 0, !0));
      if (this[D].destroyed)
        return new Promise(function(m, F) {
          process.nextTick(function() {
            c[o] ? F(c[o]) : m(l(void 0, !0));
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
    var c = this;
    return new Promise(function(d, g) {
      c[D].destroy(null, function(R) {
        if (R) {
          g(R);
          return;
        }
        d(l(void 0, !0));
      });
    });
  }), t), b), _ = function(c) {
    var d, g = Object.create(e, (d = {}, s(d, D, {
      value: c,
      writable: !0
    }), s(d, i, {
      value: null,
      writable: !0
    }), s(d, r, {
      value: null,
      writable: !0
    }), s(d, o, {
      value: null,
      writable: !0
    }), s(d, a, {
      value: c._readableState.endEmitted,
      writable: !0
    }), s(d, n, {
      value: function(C, m) {
        var F = g[D].read();
        F ? (g[f] = null, g[i] = null, g[r] = null, C(l(F, !1))) : (g[i] = C, g[r] = m);
      },
      writable: !0
    }), d));
    return g[f] = null, p(c, function(R) {
      if (R && R.code !== "ERR_STREAM_PREMATURE_CLOSE") {
        var C = g[r];
        C !== null && (g[f] = null, g[i] = null, g[r] = null, C(R)), g[o] = R;
        return;
      }
      var m = g[i];
      m !== null && (g[f] = null, g[i] = null, g[r] = null, m(l(void 0, !0))), g[a] = !0;
    }), c.on("readable", y.bind(null, g)), g;
  };
  return Ar = _, Ar;
}
var Or, zn;
function Po() {
  if (zn) return Or;
  zn = 1;
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
  function h(f, n) {
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
      n % 2 ? h(Object(D), !0).forEach(function(l) {
        p(f, l, D[l]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(f, Object.getOwnPropertyDescriptors(D)) : h(Object(D)).forEach(function(l) {
        Object.defineProperty(f, l, Object.getOwnPropertyDescriptor(D, l));
      });
    }
    return f;
  }
  function p(f, n, D) {
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
  var o = pe().codes.ERR_INVALID_ARG_TYPE;
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
        } catch (c) {
          E.destroy(c);
        }
      }), b.apply(this, arguments);
    }
    return E;
  }
  return Or = a, Or;
}
var Tr, Kn;
function io() {
  if (Kn) return Tr;
  Kn = 1, Tr = m;
  var t;
  m.ReadableState = C, we.EventEmitter;
  var s = function(A, $) {
    return A.listeners($).length;
  }, h = eo(), v = rr.Buffer, p = (typeof oe < "u" ? oe : typeof window < "u" ? window : typeof self < "u" ? self : {}).Uint8Array || function() {
  };
  function i(S) {
    return v.from(S);
  }
  function r(S) {
    return v.isBuffer(S) || S instanceof p;
  }
  var o = ae, a;
  o && o.debuglog ? a = o.debuglog("stream") : a = function() {
  };
  var f = Lo(), n = ro(), D = to(), l = D.getHighWaterMark, E = pe().codes, y = E.ERR_INVALID_ARG_TYPE, u = E.ERR_STREAM_PUSH_AFTER_EOF, b = E.ERR_METHOD_NOT_IMPLEMENTED, e = E.ERR_STREAM_UNSHIFT_AFTER_END_EVENT, _, w, c;
  Re()(m, h);
  var d = n.errorOrDestroy, g = ["error", "close", "destroy", "pause", "resume"];
  function R(S, A, $) {
    if (typeof S.prependListener == "function") return S.prependListener(A, $);
    !S._events || !S._events[A] ? S.on(A, $) : Array.isArray(S._events[A]) ? S._events[A].unshift($) : S._events[A] = [$, S._events[A]];
  }
  function C(S, A, $) {
    t = t || ye(), S = S || {}, typeof $ != "boolean" && ($ = A instanceof t), this.objectMode = !!S.objectMode, $ && (this.objectMode = this.objectMode || !!S.readableObjectMode), this.highWaterMark = l(this, S, "readableHighWaterMark", $), this.buffer = new f(), this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.paused = !0, this.emitClose = S.emitClose !== !1, this.autoDestroy = !!S.autoDestroy, this.destroyed = !1, this.defaultEncoding = S.defaultEncoding || "utf8", this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, S.encoding && (_ || (_ = Vn().StringDecoder), this.decoder = new _(S.encoding), this.encoding = S.encoding);
  }
  function m(S) {
    if (t = t || ye(), !(this instanceof m)) return new m(S);
    var A = this instanceof t;
    this._readableState = new C(S, this, A), this.readable = !0, S && (typeof S.read == "function" && (this._read = S.read), typeof S.destroy == "function" && (this._destroy = S.destroy)), h.call(this);
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
      K.reading = !1, W(S, K);
    else {
      var Q;
      if (J || (Q = T(K, A)), Q)
        d(S, Q);
      else if (K.objectMode || A && A.length > 0)
        if (typeof A != "string" && !K.objectMode && Object.getPrototypeOf(A) !== v.prototype && (A = i(A)), H)
          K.endEmitted ? d(S, new e()) : O(S, K, A, !0);
        else if (K.ended)
          d(S, new u());
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
    _ || (_ = Vn().StringDecoder);
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
  function W(S, A) {
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
    A.readingMore || (A.readingMore = !0, process.nextTick(G, S, A));
  }
  function G(S, A) {
    for (; !A.reading && !A.ended && (A.length < A.highWaterMark || A.flowing && A.length === 0); ) {
      var $ = A.length;
      if (a("maybeReadMore read 0"), S.read(0), $ === A.length)
        break;
    }
    A.readingMore = !1;
  }
  m.prototype._read = function(S) {
    d(this, new b("_read()"));
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
    var J = (!A || A.end !== !1) && S !== process.stdout && S !== process.stderr, K = J ? ne : ce;
    H.endEmitted ? process.nextTick(K) : $.once("end", K), S.on("unpipe", Q);
    function Q(le, be) {
      a("onunpipe"), le === $ && be && be.hasUnpiped === !1 && (be.hasUnpiped = !0, ke());
    }
    function ne() {
      a("onend"), S.end();
    }
    var ve = V($);
    S.on("drain", ve);
    var De = !1;
    function ke() {
      a("cleanup"), S.removeListener("close", he), S.removeListener("finish", _e), S.removeListener("drain", ve), S.removeListener("error", Se), S.removeListener("unpipe", Q), $.removeListener("end", ne), $.removeListener("end", ce), $.removeListener("data", qe), De = !0, H.awaitDrain && (!S._writableState || S._writableState.needDrain) && ve();
    }
    $.on("data", qe);
    function qe(le) {
      a("ondata");
      var be = S.write(le);
      a("dest.write", be), be === !1 && ((H.pipesCount === 1 && H.pipes === S || H.pipesCount > 1 && z(H.pipes, S) !== -1) && !De && (a("false write response, pause", H.awaitDrain), H.awaitDrain++), $.pause());
    }
    function Se(le) {
      a("onerror", le), ce(), S.removeListener("error", Se), s(S, "error") === 0 && d(S, le);
    }
    R(S, "error", Se);
    function he() {
      S.removeListener("finish", _e), ce();
    }
    S.once("close", he);
    function _e() {
      a("onfinish"), S.removeListener("close", he), ce();
    }
    S.once("finish", _e);
    function ce() {
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
    var $ = h.prototype.on.call(this, S, A), H = this._readableState;
    return S === "data" ? (H.readableListening = this.listenerCount("readable") > 0, H.flowing !== !1 && this.resume()) : S === "readable" && !H.endEmitted && !H.readableListening && (H.readableListening = H.needReadable = !0, H.flowing = !1, H.emittedReadable = !1, a("on readable", H.length, H.reading), H.length ? q(this) : H.reading || process.nextTick(U, this)), $;
  }, m.prototype.addListener = m.prototype.on, m.prototype.removeListener = function(S, A) {
    var $ = h.prototype.removeListener.call(this, S, A);
    return S === "readable" && process.nextTick(N, this), $;
  }, m.prototype.removeAllListeners = function(S) {
    var A = h.prototype.removeAllListeners.apply(this, arguments);
    return (S === "readable" || S === void 0) && process.nextTick(N, this), A;
  };
  function N(S) {
    var A = S._readableState;
    A.readableListening = S.listenerCount("readable") > 0, A.resumeScheduled && !A.paused ? A.flowing = !0 : S.listenerCount("data") > 0 && S.resume();
  }
  function U(S) {
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
    return w === void 0 && (w = qo()), w(this);
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
    return c === void 0 && (c = Po()), c(m, S, A);
  });
  function z(S, A) {
    for (var $ = 0, H = S.length; $ < H; $++)
      if (S[$] === A) return $;
    return -1;
  }
  return Tr;
}
var xr, Zn;
function ao() {
  if (Zn) return xr;
  Zn = 1, xr = o;
  var t = pe().codes, s = t.ERR_METHOD_NOT_IMPLEMENTED, h = t.ERR_MULTIPLE_CALLBACK, v = t.ERR_TRANSFORM_ALREADY_TRANSFORMING, p = t.ERR_TRANSFORM_WITH_LENGTH_0, i = ye();
  Re()(o, i);
  function r(n, D) {
    var l = this._transformState;
    l.transforming = !1;
    var E = l.writecb;
    if (E === null)
      return this.emit("error", new h());
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
    if (l != null && n.push(l), n._writableState.length) throw new p();
    if (n._transformState.transforming) throw new v();
    return n.push(null);
  }
  return xr;
}
var Ir, Qn;
function $o() {
  if (Qn) return Ir;
  Qn = 1, Ir = s;
  var t = ao();
  Re()(s, t);
  function s(h) {
    if (!(this instanceof s)) return new s(h);
    t.call(this, h);
  }
  return s.prototype._transform = function(h, v, p) {
    p(null, h);
  }, Ir;
}
var Lr, Jn;
function Mo() {
  if (Jn) return Lr;
  Jn = 1;
  var t;
  function s(l) {
    var E = !1;
    return function() {
      E || (E = !0, l.apply(void 0, arguments));
    };
  }
  var h = pe().codes, v = h.ERR_MISSING_ARGS, p = h.ERR_STREAM_DESTROYED;
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
    }), t === void 0 && (t = pn()), t(l, {
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
        u(_ || new p("pipe"));
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
      var c = w < E.length - 1, d = w > 0;
      return o(_, c, d, function(g) {
        b || (b = g), g && e.forEach(a), !c && (e.forEach(a), u(b));
      });
    });
    return E.reduce(f);
  }
  return Lr = D, Lr;
}
var ei;
function jo() {
  return ei || (ei = 1, function(t, s) {
    var h = hn;
    process.env.READABLE_STREAM === "disable" && h ? (t.exports = h.Readable, Object.assign(t.exports, h), t.exports.Stream = h) : (s = t.exports = io(), s.Stream = h || s, s.Readable = s, s.Writable = no(), s.Duplex = ye(), s.Transform = ao(), s.PassThrough = $o(), s.finished = pn(), s.pipeline = Mo());
  }(je, je.exports)), je.exports;
}
var Nr, ri;
function Wo() {
  if (ri) return Nr;
  ri = 1, Nr = t;
  function t(s, h) {
    if (!(this instanceof t)) return new t(s, h);
    this.proto = s, this.target = h, this.methods = [], this.getters = [], this.setters = [], this.fluents = [];
  }
  return t.prototype.method = function(s) {
    var h = this.proto, v = this.target;
    return this.methods.push(s), h[s] = function() {
      return this[v][s].apply(this[v], arguments);
    }, this;
  }, t.prototype.access = function(s) {
    return this.getter(s).setter(s);
  }, t.prototype.getter = function(s) {
    var h = this.proto, v = this.target;
    return this.getters.push(s), h.__defineGetter__(s, function() {
      return this[v][s];
    }), this;
  }, t.prototype.setter = function(s) {
    var h = this.proto, v = this.target;
    return this.setters.push(s), h.__defineSetter__(s, function(p) {
      return this[v][s] = p;
    }), this;
  }, t.prototype.fluent = function(s) {
    var h = this.proto, v = this.target;
    return this.fluents.push(s), h[s] = function(p) {
      return typeof p < "u" ? (this[v][s] = p, this) : this[v][s];
    }, this;
  }, Nr;
}
var ti;
function oo() {
  if (ti) return _r.exports;
  ti = 1;
  var t = ae, s = jo(), h = Wo(), v = dn(), p = _r.exports = function(r, o, a) {
    s.Transform.call(this, a), this.tracker = new v(r, o), this.name = r, this.id = this.tracker.id, this.tracker.on("change", i(this));
  };
  t.inherits(p, s.Transform);
  function i(r) {
    return function(o, a, f) {
      r.emit("change", o, a, r);
    };
  }
  return p.prototype._transform = function(r, o, a) {
    this.tracker.completeWork(r.length ? r.length : 1), this.push(r), a();
  }, p.prototype._flush = function(r) {
    this.tracker.finish(), r();
  }, h(p.prototype, "tracker").method("completed").method("addWork").method("finish"), _r.exports;
}
var ni;
function Go() {
  if (ni) return pr.exports;
  ni = 1;
  var t = ae, s = Ja(), h = dn(), v = oo(), p = pr.exports = function(o) {
    s.call(this, o), this.parentGroup = null, this.trackers = [], this.completion = {}, this.weight = {}, this.totalWeight = 0, this.finished = !1, this.bubbleChange = i(this);
  };
  t.inherits(p, s);
  function i(o) {
    return function(a, f, n) {
      o.completion[n.id] = f, !o.finished && o.emit("change", a || o.name, o.completed(), o);
    };
  }
  p.prototype.nameInTree = function() {
    for (var o = [], a = this; a; )
      o.unshift(a.name), a = a.parentGroup;
    return o.join("/");
  }, p.prototype.addUnit = function(o, a) {
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
  }, p.prototype.completed = function() {
    if (this.trackers.length === 0)
      return 0;
    for (var o = 1 / this.totalWeight, a = 0, f = 0; f < this.trackers.length; f++) {
      var n = this.trackers[f].id;
      a += o * this.weight[n] * this.completion[n];
    }
    return a;
  }, p.prototype.newGroup = function(o, a) {
    return this.addUnit(new p(o), a);
  }, p.prototype.newItem = function(o, a, f) {
    return this.addUnit(new h(o, a), f);
  }, p.prototype.newStream = function(o, a, f) {
    return this.addUnit(new v(o, a), f);
  }, p.prototype.finish = function() {
    this.finished = !0, this.trackers.length || this.addUnit(new h(), 1, !0);
    for (var o = 0; o < this.trackers.length; o++) {
      var a = this.trackers[o];
      a.finish(), a.removeListener("change", this.bubbleChange);
    }
    this.emit("change", this.name, 1, this);
  };
  var r = "                                  ";
  return p.prototype.debug = function(o) {
    o = o || 0;
    var a = o ? r.substr(0, o) : "", f = a + (this.name || "top") + ": " + this.completed() + `
`;
    return this.trackers.forEach(function(n) {
      n instanceof p ? f += n.debug(o + 1) : f += a + " " + n.name + ": " + n.completed() + `
`;
    }), f;
  }, pr.exports;
}
var ii;
function Uo() {
  return ii || (ii = 1, Fe.TrackerGroup = Go(), Fe.Tracker = dn(), Fe.TrackerStream = oo()), Fe;
}
var Br = { exports: {} }, ee = {}, ai;
function vn() {
  if (ai) return ee;
  ai = 1;
  var t = "\x1B[";
  ee.up = function(p) {
    return t + (p || "") + "A";
  }, ee.down = function(p) {
    return t + (p || "") + "B";
  }, ee.forward = function(p) {
    return t + (p || "") + "C";
  }, ee.back = function(p) {
    return t + (p || "") + "D";
  }, ee.nextLine = function(p) {
    return t + (p || "") + "E";
  }, ee.previousLine = function(p) {
    return t + (p || "") + "F";
  }, ee.horizontalAbsolute = function(p) {
    if (p == null) throw new Error("horizontalAboslute requires a column to position to");
    return t + p + "G";
  }, ee.eraseData = function() {
    return t + "J";
  }, ee.eraseLine = function() {
    return t + "K";
  }, ee.goto = function(v, p) {
    return t + p + ";" + v + "H";
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
  ee.color = function(p) {
    return (arguments.length !== 1 || !Array.isArray(p)) && (p = Array.prototype.slice.call(arguments)), t + p.map(h).join(";") + "m";
  };
  function h(v) {
    if (s[v] != null) return s[v];
    throw new Error("Unknown color or style name: " + v);
  }
  return ee;
}
var kr = { exports: {} }, Ae = {}, He = { exports: {} }, qr, oi;
function Ho() {
  return oi || (oi = 1, qr = ({ onlyFirst: t = !1 } = {}) => {
    const s = [
      "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
      "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
    ].join("|");
    return new RegExp(s, t ? void 0 : "g");
  }), qr;
}
var Pr, ui;
function uo() {
  if (ui) return Pr;
  ui = 1;
  const t = Ho();
  return Pr = (s) => typeof s == "string" ? s.replace(t(), "") : s, Pr;
}
var Ve = { exports: {} }, si;
function Vo() {
  if (si) return Ve.exports;
  si = 1;
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
  return Ve.exports = t, Ve.exports.default = t, Ve.exports;
}
var $r, li;
function Yo() {
  return li || (li = 1, $r = function() {
    return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
  }), $r;
}
var fi;
function ar() {
  if (fi) return He.exports;
  fi = 1;
  const t = uo(), s = Vo(), h = Yo(), v = (p) => {
    if (typeof p != "string" || p.length === 0 || (p = t(p), p.length === 0))
      return 0;
    p = p.replace(h(), "  ");
    let i = 0;
    for (let r = 0; r < p.length; r++) {
      const o = p.codePointAt(r);
      o <= 31 || o >= 127 && o <= 159 || o >= 768 && o <= 879 || (o > 65535 && r++, i += s(o) ? 2 : 1);
    }
    return i;
  };
  return He.exports = v, He.exports.default = v, He.exports;
}
var ci;
function Xo() {
  if (ci) return Ae;
  ci = 1;
  var t = ar();
  Ae.center = p, Ae.left = h, Ae.right = v;
  function s(i) {
    var r = "", o = " ", a = i;
    do
      a % 2 && (r += o), a = Math.floor(a / 2), o += o;
    while (a);
    return r;
  }
  function h(i, r) {
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
  function p(i, r) {
    var o = i.trim();
    if (o.length === 0 && i.length >= r) return i;
    var a = "", f = "", n = t(o);
    if (n < r) {
      var D = parseInt((r - n) / 2, 10);
      a = s(D), f = s(r - (n + D));
    }
    return a + o + f;
  }
  return Ae;
}
var Mr, hi;
function Dn() {
  if (hi) return Mr;
  hi = 1, Mr = v;
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
  function h(D, l) {
    const E = l[D.length] = l[D.length] || [];
    E.indexOf(D) === -1 && E.push(D);
  }
  function v(D, l) {
    if (arguments.length !== 2) throw a(["SA"], arguments.length);
    if (!D) throw p(0);
    if (!l) throw p(1);
    if (!s.S.check(D)) throw r(0, ["string"], D);
    if (!s.A.check(l)) throw r(1, ["array"], l);
    const E = D.split("|"), y = {};
    E.forEach((b) => {
      for (let e = 0; e < b.length; ++e) {
        const _ = b[e];
        if (!s[_]) throw i(e, _);
      }
      if (/E.*E/.test(b)) throw f(b);
      h(b, y), /E/.test(b) && (h(b.replace(/E.*$/, "E"), y), h(b.replace(/E/, "Z"), y), b.length === 1 && h("", y));
    });
    let u = y[l.length];
    if (!u)
      throw a(Object.keys(y), l.length);
    for (let b = 0; b < l.length; ++b) {
      let e = u.filter((_) => {
        const w = _[b], c = s[w].check;
        return c(l[b]);
      });
      if (!e.length) {
        const _ = u.map((w) => s[w[b]].label).filter((w) => w != null);
        throw r(b, _, l[b]);
      }
      u = e;
    }
  }
  function p(D) {
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
  return Mr;
}
var jr, di;
function so() {
  if (di) return jr;
  di = 1;
  var t = ar(), s = uo();
  jr = h;
  function h(v, p) {
    if (t(v) === 0) return v;
    if (p <= 0) return "";
    if (t(v) <= p) return v;
    for (var i = s(v), r = v.length + i.length, o = v.slice(0, p + r); t(o) > p; )
      o = o.slice(0, -1);
    return o;
  }
  return jr;
}
var Oe = {}, pi;
function zo() {
  if (pi) return Oe;
  pi = 1;
  var t = ae, s = Oe.User = function h(v) {
    var p = new Error(v);
    return Error.captureStackTrace(p, h), p.code = "EGAUGE", p;
  };
  return Oe.MissingTemplateValue = function h(v, p) {
    var i = new s(t.format('Missing template value "%s"', v.type));
    return Error.captureStackTrace(i, h), i.template = v, i.values = p, i;
  }, Oe.Internal = function h(v) {
    var p = new Error(v);
    return Error.captureStackTrace(p, h), p.code = "EGAUGEINTERNAL", p;
  }, Oe;
}
var Wr, vi;
function Ko() {
  if (vi) return Wr;
  vi = 1;
  var t = ar();
  Wr = v;
  function s(p) {
    return typeof p != "string" ? !1 : p.slice(-1) === "%";
  }
  function h(p) {
    return Number(p.slice(0, -1)) / 100;
  }
  function v(p, i) {
    if (this.overallOutputLength = i, this.finished = !1, this.type = null, this.value = null, this.length = null, this.maxLength = null, this.minLength = null, this.kerning = null, this.align = "left", this.padLeft = 0, this.padRight = 0, this.index = null, this.first = null, this.last = null, typeof p == "string")
      this.value = p;
    else
      for (var r in p) this[r] = p[r];
    return s(this.length) && (this.length = Math.round(this.overallOutputLength * h(this.length))), s(this.minLength) && (this.minLength = Math.round(this.overallOutputLength * h(this.minLength))), s(this.maxLength) && (this.maxLength = Math.round(this.overallOutputLength * h(this.maxLength))), this;
  }
  return v.prototype = {}, v.prototype.getBaseLength = function() {
    var p = this.length;
    return p == null && typeof this.value == "string" && this.maxLength == null && this.minLength == null && (p = t(this.value)), p;
  }, v.prototype.getLength = function() {
    var p = this.getBaseLength();
    return p == null ? null : p + this.padLeft + this.padRight;
  }, v.prototype.getMaxLength = function() {
    return this.maxLength == null ? null : this.maxLength + this.padLeft + this.padRight;
  }, v.prototype.getMinLength = function() {
    return this.minLength == null ? null : this.minLength + this.padLeft + this.padRight;
  }, Wr;
}
var Di;
function lo() {
  if (Di) return kr.exports;
  Di = 1;
  var t = Xo(), s = Dn(), h = so(), v = zo(), p = Ko();
  function i(y) {
    return function(u) {
      return E(u, y);
    };
  }
  var r = kr.exports = function(y, u, b) {
    var e = D(y, u, b), _ = e.map(i(b)).join("");
    return t.left(h(_, y), y);
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
    var b = Object.assign({}, y), e = Object.create(u), _ = [], w = o(b), c = a(b);
    return e[w] && (_.push({ value: e[w] }), e[w] = null), b.minLength = null, b.length = null, b.maxLength = null, _.push(b), e[b.type] = e[b.type], e[c] && (_.push({ value: e[c] }), e[c] = null), function(d, g, R) {
      return r(R, _, e);
    };
  }
  function D(y, u, b) {
    function e(F, O, T) {
      var x = new p(F, y), B = x.type;
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
    }), w = y, c = _.length;
    function d(F) {
      F > w && (F = w), w -= F;
    }
    function g(F, O) {
      if (F.finished) throw new v.Internal("Tried to finish template item that was already finished");
      if (O === 1 / 0) throw new v.Internal("Length of template item cannot be infinity");
      if (O != null && (F.length = O), F.minLength = null, F.maxLength = null, --c, F.finished = !0, F.length == null && (F.length = F.getBaseLength()), F.length == null) throw new v.Internal("Finished template items must have a length");
      d(F.getLength());
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
      C = !1, m = Math.round(w / c), _.forEach(function(F) {
        F.finished || F.maxLength && F.getMaxLength() < m && (g(F, F.maxLength), C = !0);
      });
    while (C && R++ < _.length);
    if (C) throw new v.Internal("Resize loop iterated too many times while determining maxLength");
    R = 0;
    do
      C = !1, m = Math.round(w / c), _.forEach(function(F) {
        F.finished || F.minLength && F.getMinLength() >= m && (g(F, F.minLength), C = !0);
      });
    while (C && R++ < _.length);
    if (C) throw new v.Internal("Resize loop iterated too many times while determining minLength");
    return m = Math.round(w / c), _.forEach(function(F) {
      F.finished || g(F, m);
    }), _;
  }
  function l(y, u, b) {
    return s("OON", arguments), y.type ? y.value(u, u[y.type + "Theme"] || {}, b) : y.value(u, {}, b);
  }
  function E(y, u) {
    var b = y.getBaseLength(), e = typeof y.value == "function" ? l(y, u, b) : y.value;
    if (e == null || e === "") return "";
    var _ = t[y.align] || t.left, w = y.padLeft ? t.left("", y.padLeft) : "", c = y.padRight ? t.right("", y.padRight) : "", d = h(String(e), b), g = _(d, b);
    return w + g + c;
  }
  return kr.exports;
}
var _i;
function Zo() {
  if (_i) return Br.exports;
  _i = 1;
  var t = vn(), s = lo(), h = Dn(), v = Br.exports = function(p, i, r) {
    r || (r = 80), h("OAN", [p, i, r]), this.showing = !1, this.theme = p, this.width = r, this.template = i;
  };
  return v.prototype = {}, v.prototype.setTheme = function(p) {
    h("O", [p]), this.theme = p;
  }, v.prototype.setTemplate = function(p) {
    h("A", [p]), this.template = p;
  }, v.prototype.setWidth = function(p) {
    h("N", [p]), this.width = p;
  }, v.prototype.hide = function() {
    return t.gotoSOL() + t.eraseLine();
  }, v.prototype.hideCursor = t.hideCursor, v.prototype.showCursor = t.showCursor, v.prototype.show = function(p) {
    var i = Object.create(this.theme);
    for (var r in p)
      i[r] = p[r];
    return s(this.width, this.template, i).trim() + t.color("reset") + t.eraseLine() + t.gotoSOL();
  }, Br.exports;
}
var Gr = { exports: {} }, bi;
function Qo() {
  if (bi) return Gr.exports;
  bi = 1;
  var t = cn;
  return Gr.exports = function() {
    if (t.type() == "Windows_NT")
      return !1;
    var s = /UTF-?8$/i, h = process.env.LC_ALL || process.env.LC_CTYPE || process.env.LANG;
    return s.test(h);
  }, Gr.exports;
}
var Ur, gi;
function Jo() {
  if (gi) return Ur;
  gi = 1, Ur = p({ alwaysReturn: !0 }, p);
  function t(i, r) {
    return i.level = 0, i.hasBasic = !1, i.has256 = !1, i.has16m = !1, r.alwaysReturn ? i : !1;
  }
  function s(i) {
    return i.hasBasic = !0, i.has256 = !1, i.has16m = !1, i.level = 1, i;
  }
  function h(i) {
    return i.hasBasic = !0, i.has256 = !0, i.has16m = !1, i.level = 2, i;
  }
  function v(i) {
    return i.hasBasic = !0, i.has256 = !0, i.has16m = !0, i.level = 3, i;
  }
  function p(i, r) {
    if (i = i || {}, r = r || {}, typeof i.level == "number")
      switch (i.level) {
        case 0:
          return t(r, i);
        case 1:
          return s(r);
        case 2:
          return h(r);
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
      return h(r);
    if (!i.ignoreCI && (o.CI || o.TEAMCITY_VERSION))
      return o.TRAVIS ? h(r) : t(r, i);
    switch (o.TERM_PROGRAM) {
      case "iTerm.app":
        var D = o.TERM_PROGRAM_VERSION || "0.";
        return /^[0-2]\./.test(D) ? h(r) : v(r);
      case "HyperTerm":
      case "Hyper":
        return v(r);
      case "MacTerm":
        return v(r);
      case "Apple_Terminal":
        return h(r);
    }
    return /^xterm-256/.test(f) ? h(r) : /^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(f) || o.COLORTERM ? s(r) : t(r, i);
  }
  return Ur;
}
var Hr, mi;
function eu() {
  if (mi) return Hr;
  mi = 1;
  var t = Jo();
  return Hr = t().hasBasic, Hr;
}
var de = { exports: {} }, Vr = { exports: {} }, Ei;
function ru() {
  return Ei || (Ei = 1, function(t) {
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
  }(Vr)), Vr.exports;
}
var yi;
function tu() {
  if (yi) return de.exports;
  yi = 1;
  var t = oe.process;
  const s = function(b) {
    return b && typeof b == "object" && typeof b.removeListener == "function" && typeof b.emit == "function" && typeof b.reallyExit == "function" && typeof b.listeners == "function" && typeof b.kill == "function" && typeof b.pid == "number" && typeof b.on == "function";
  };
  if (!s(t))
    de.exports = function() {
      return function() {
      };
    };
  else {
    var h = tr, v = ru(), p = /^win/i.test(t.platform), i = we;
    typeof i != "function" && (i = i.EventEmitter);
    var r;
    t.__signal_exit_emitter__ ? r = t.__signal_exit_emitter__ : (r = t.__signal_exit_emitter__ = new i(), r.count = 0, r.emitted = {}), r.infinite || (r.setMaxListeners(1 / 0), r.infinite = !0), de.exports = function(b, e) {
      if (!s(oe.process))
        return function() {
        };
      h.equal(typeof b, "function", "a callback must be provided for exit handler"), n === !1 && D();
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
    de.exports.unload = o;
    var a = function(e, _, w) {
      r.emitted[e] || (r.emitted[e] = !0, r.emit(e, _, w));
    }, f = {};
    v.forEach(function(b) {
      f[b] = function() {
        if (s(oe.process)) {
          var _ = t.listeners(b);
          _.length === r.count && (o(), a("exit", null, b), a("afterexit", null, b), p && b === "SIGHUP" && (b = "SIGINT"), t.kill(t.pid, b));
        }
      };
    }), de.exports.signals = function() {
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
    de.exports.load = D;
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
  return de.exports;
}
var Yr = { exports: {} };
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
var Xr, wi;
function nu() {
  if (wi) return Xr;
  wi = 1;
  var t = Object.getOwnPropertySymbols, s = Object.prototype.hasOwnProperty, h = Object.prototype.propertyIsEnumerable;
  function v(i) {
    if (i == null)
      throw new TypeError("Object.assign cannot be called with null or undefined");
    return Object(i);
  }
  function p() {
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
  return Xr = p() ? Object.assign : function(i, r) {
    for (var o, a = v(i), f, n = 1; n < arguments.length; n++) {
      o = Object(arguments[n]);
      for (var D in o)
        s.call(o, D) && (a[D] = o[D]);
      if (t) {
        f = t(o);
        for (var l = 0; l < f.length; l++)
          h.call(o, f[l]) && (a[f[l]] = o[f[l]]);
      }
    }
    return a;
  }, Xr;
}
var zr, Ri;
function iu() {
  return Ri || (Ri = 1, zr = function(s, h) {
    return s[h % s.length];
  }), zr;
}
var Kr, Ci;
function au() {
  if (Ci) return Kr;
  Ci = 1;
  var t = Dn(), s = lo(), h = so(), v = ar();
  Kr = function(i, r, o) {
    if (t("ONN", [i, r, o]), o < 0 && (o = 0), o > 1 && (o = 1), r <= 0) return "";
    var a = Math.round(r * o), f = r - a, n = [
      { type: "complete", value: p(i.complete, a), length: a },
      { type: "remaining", value: p(i.remaining, f), length: f }
    ];
    return s(r, n, i);
  };
  function p(i, r) {
    var o = "", a = r;
    do
      a % 2 && (o += i), a = Math.floor(a / 2), i += i;
    while (a && v(o) < r);
    return h(o, r);
  }
  return Kr;
}
var Zr, Si;
function ou() {
  if (Si) return Zr;
  Si = 1;
  var t = iu(), s = au();
  return Zr = {
    activityIndicator: function(h, v, p) {
      if (h.spun != null)
        return t(v, h.spun);
    },
    progressbar: function(h, v, p) {
      if (h.completed != null)
        return s(v, p, h.completed);
    }
  }, Zr;
}
var Qr, Fi;
function uu() {
  if (Fi) return Qr;
  Fi = 1;
  var t = nu();
  Qr = function() {
    return s.newThemeSet();
  };
  var s = {};
  return s.baseTheme = ou(), s.newTheme = function(h, v) {
    return v || (v = h, h = this.baseTheme), t({}, h, v);
  }, s.getThemeNames = function() {
    return Object.keys(this.themes);
  }, s.addTheme = function(h, v, p) {
    this.themes[h] = this.newTheme(v, p);
  }, s.addToAllThemes = function(h) {
    var v = this.themes;
    Object.keys(v).forEach(function(p) {
      t(v[p], h);
    }), t(this.baseTheme, h);
  }, s.getTheme = function(h) {
    if (!this.themes[h]) throw this.newMissingThemeError(h);
    return this.themes[h];
  }, s.setDefault = function(h, v) {
    v == null && (v = h, h = {});
    var p = h.platform == null ? "fallback" : h.platform, i = !!h.hasUnicode, r = !!h.hasColor;
    this.defaults[p] || (this.defaults[p] = { true: {}, false: {} }), this.defaults[p][i][r] = v;
  }, s.getDefault = function(h) {
    h || (h = {});
    var v = h.platform || process.platform, p = this.defaults[v] || this.defaults.fallback, i = !!h.hasUnicode, r = !!h.hasColor;
    if (!p) throw this.newMissingDefaultThemeError(v, i, r);
    if (!p[i][r]) {
      if (i && r && p[!i][r])
        i = !1;
      else if (i && r && p[i][!r])
        r = !1;
      else if (i && r && p[!i][!r])
        i = !1, r = !1;
      else if (i && !r && p[!i][r])
        i = !1;
      else if (!i && r && p[i][!r])
        r = !1;
      else if (p === this.defaults.fallback)
        throw this.newMissingDefaultThemeError(v, i, r);
    }
    return p[i][r] ? this.getTheme(p[i][r]) : this.getDefault(t({}, h, { platform: "fallback" }));
  }, s.newMissingThemeError = function h(v) {
    var p = new Error('Could not find a gauge theme named "' + v + '"');
    return Error.captureStackTrace.call(p, h), p.theme = v, p.code = "EMISSINGTHEME", p;
  }, s.newMissingDefaultThemeError = function h(v, p, i) {
    var r = new Error(
      `Could not find a gauge theme for your platform/unicode/color use combo:
    platform = ` + v + `
    hasUnicode = ` + p + `
    hasColor = ` + i
    );
    return Error.captureStackTrace.call(r, h), r.platform = v, r.hasUnicode = p, r.hasColor = i, r.code = "EMISSINGTHEME", r;
  }, s.newThemeSet = function() {
    var h = function(v) {
      return h.getDefault(v);
    };
    return t(h, s, {
      themes: t({}, this.themes),
      baseTheme: t({}, this.baseTheme),
      defaults: JSON.parse(JSON.stringify(this.defaults || {}))
    });
  }, Qr;
}
var Ai;
function su() {
  if (Ai) return Yr.exports;
  Ai = 1;
  var t = vn().color, s = uu(), h = Yr.exports = new s();
  return h.addTheme("ASCII", {
    preProgressbar: "[",
    postProgressbar: "]",
    progressbarTheme: {
      complete: "#",
      remaining: "."
    },
    activityIndicatorTheme: "-\\|/",
    preSubsection: ">"
  }), h.addTheme("colorASCII", h.getTheme("ASCII"), {
    progressbarTheme: {
      preComplete: t("bgBrightWhite", "brightWhite"),
      complete: "#",
      postComplete: t("reset"),
      preRemaining: t("bgBrightBlack", "brightBlack"),
      remaining: ".",
      postRemaining: t("reset")
    }
  }), h.addTheme("brailleSpinner", {
    preProgressbar: "⸨",
    postProgressbar: "⸩",
    progressbarTheme: {
      complete: "#",
      remaining: "⠂"
    },
    activityIndicatorTheme: "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏",
    preSubsection: ">"
  }), h.addTheme("colorBrailleSpinner", h.getTheme("brailleSpinner"), {
    progressbarTheme: {
      preComplete: t("bgBrightWhite", "brightWhite"),
      complete: "#",
      postComplete: t("reset"),
      preRemaining: t("bgBrightBlack", "brightBlack"),
      remaining: "⠂",
      postRemaining: t("reset")
    }
  }), h.setDefault({}, "ASCII"), h.setDefault({ hasColor: !0 }, "colorASCII"), h.setDefault({ platform: "darwin", hasUnicode: !0 }, "brailleSpinner"), h.setDefault({ platform: "darwin", hasUnicode: !0, hasColor: !0 }, "colorBrailleSpinner"), h.setDefault({ platform: "linux", hasUnicode: !0 }, "brailleSpinner"), h.setDefault({ platform: "linux", hasUnicode: !0, hasColor: !0 }, "colorBrailleSpinner"), Yr.exports;
}
var Jr, Oi;
function lu() {
  return Oi || (Oi = 1, Jr = setInterval), Jr;
}
var et, Ti;
function fo() {
  return Ti || (Ti = 1, et = process), et;
}
var Ye = { exports: {} }, xi;
function fu() {
  if (xi) return Ye.exports;
  xi = 1;
  var t = fo();
  try {
    Ye.exports = setImmediate;
  } catch {
    Ye.exports = t.nextTick;
  }
  return Ye.exports;
}
var rt, Ii;
function cu() {
  if (Ii) return rt;
  Ii = 1;
  var t = Zo(), s = Qo(), h = eu(), v = tu(), p = su(), i = lu(), r = fo(), o = fu();
  rt = f;
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
    }, this._paused = !1, this._disabled = !0, this._showing = !1, this._onScreen = !1, this._needsRedraw = !1, this._hideCursor = l.hideCursor == null ? !0 : l.hideCursor, this._fixedFramerate = l.fixedFramerate == null ? !/^v0\.8\./.test(r.version) : l.fixedFramerate, this._lastUpdateAt = null, this._updateInterval = l.updateInterval == null ? 50 : l.updateInterval, this._themes = l.themes || p, this._theme = l.theme;
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
      var D = n.hasUnicode == null ? s() : n.hasUnicode, l = n.hasColor == null ? h : n.hasColor;
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
  }, rt;
}
var tt, Li;
function hu() {
  return Li || (Li = 1, tt = function(t) {
    [process.stdout, process.stderr].forEach(function(s) {
      s._handle && s.isTTY && typeof s._handle.setBlocking == "function" && s._handle.setBlocking(t);
    });
  }), tt;
}
var Ni;
function co() {
  return Ni || (Ni = 1, function(t, s) {
    var h = Uo(), v = cu(), p = we.EventEmitter, i = t.exports = new p(), r = ae, o = hu(), a = vn();
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
    }), i.tracker = new h.TrackerGroup(), i.progressEnabled = i.gauge.isEnabled();
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
      }), u instanceof h.TrackerGroup && l.forEach(function(b) {
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
          var w = i.disp[_.level] || _.level, c = this._format(w, i.style[_.level]);
          _.prefix && (c += " " + this._format(_.prefix, this.prefixStyle)), c += " " + _.message.split(/\r?\n/)[0], e.logline = c;
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
      for (var w = new Array(arguments.length - 2), c = null, d = 2; d < arguments.length; d++) {
        var g = w[d - 2] = arguments[d];
        typeof g == "object" && g instanceof Error && g.stack && Object.defineProperty(g, "stack", {
          value: c = g.stack + "",
          enumerable: !0,
          writable: !0
        });
      }
      c && w.unshift(c + `
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
        for (var c = 0; c < arguments.length; c++)
          w[c + 1] = arguments[c];
        return this.log.apply(this, w);
      }).bind(this)), this.disp[u] = _;
    }, i.prefixStyle = { fg: "magenta" }, i.headingStyle = { fg: "white", bg: "black" }, i.style = {}, i.levels = {}, i.disp = {}, i.addLevel("silly", -1 / 0, { inverse: !0 }, "sill"), i.addLevel("verbose", 1e3, { fg: "blue", bg: "black" }, "verb"), i.addLevel("info", 2e3, { fg: "green" }), i.addLevel("timing", 2500, { fg: "green", bg: "black" }), i.addLevel("http", 3e3, { fg: "green", bg: "black" }), i.addLevel("notice", 3500, { fg: "blue", bg: "black" }), i.addLevel("warn", 4e3, { fg: "black", bg: "yellow" }, "WARN"), i.addLevel("error", 5e3, { fg: "red", bg: "black" }, "ERR!"), i.addLevel("silent", 1 / 0), i.on("error", function() {
    });
  }(dr)), dr.exports;
}
var xe = { exports: {} }, Xe = {}, Bi;
function du() {
  if (Bi) return Xe;
  Bi = 1;
  var t = te, s = process.platform === "win32", h = ie, v = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);
  function p() {
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
    return typeof a == "function" ? a : p();
  }
  if (t.normalize, s)
    var r = /(.*?)(?:[\/\\]+|$)/g;
  else
    var r = /(.*?)(?:[\/]+|$)/g;
  if (s)
    var o = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
  else
    var o = /^[\/]*/;
  return Xe.realpathSync = function(f, n) {
    if (f = t.resolve(f), n && Object.prototype.hasOwnProperty.call(n, f))
      return n[f];
    var D = f, l = {}, E = {}, y, u, b, e;
    _();
    function _() {
      var C = o.exec(f);
      y = C[0].length, u = C[0], b = C[0], e = "", s && !E[b] && (h.lstatSync(b), E[b] = !0);
    }
    for (; y < f.length; ) {
      r.lastIndex = y;
      var w = r.exec(f);
      if (e = u, u += w[0], b = e + w[1], y = r.lastIndex, !(E[b] || n && n[b] === b)) {
        var c;
        if (n && Object.prototype.hasOwnProperty.call(n, b))
          c = n[b];
        else {
          var d = h.lstatSync(b);
          if (!d.isSymbolicLink()) {
            E[b] = !0, n && (n[b] = b);
            continue;
          }
          var g = null;
          if (!s) {
            var R = d.dev.toString(32) + ":" + d.ino.toString(32);
            l.hasOwnProperty(R) && (g = l[R]);
          }
          g === null && (h.statSync(b), g = h.readlinkSync(b)), c = t.resolve(e, g), n && (n[b] = c), s || (l[R] = g);
        }
        f = t.resolve(c, f.slice(y)), _();
      }
    }
    return n && (n[D] = f), f;
  }, Xe.realpath = function(f, n, D) {
    if (typeof D != "function" && (D = i(n), n = null), f = t.resolve(f), n && Object.prototype.hasOwnProperty.call(n, f))
      return process.nextTick(D.bind(null, null, n[f]));
    var l = f, E = {}, y = {}, u, b, e, _;
    w();
    function w() {
      var C = o.exec(f);
      u = C[0].length, b = C[0], e = C[0], _ = "", s && !y[e] ? h.lstat(e, function(m) {
        if (m) return D(m);
        y[e] = !0, c();
      }) : process.nextTick(c);
    }
    function c() {
      if (u >= f.length)
        return n && (n[l] = f), D(null, f);
      r.lastIndex = u;
      var C = r.exec(f);
      return _ = b, b += C[0], e = _ + C[1], u = r.lastIndex, y[e] || n && n[e] === e ? process.nextTick(c) : n && Object.prototype.hasOwnProperty.call(n, e) ? R(n[e]) : h.lstat(e, d);
    }
    function d(C, m) {
      if (C) return D(C);
      if (!m.isSymbolicLink())
        return y[e] = !0, n && (n[e] = e), process.nextTick(c);
      if (!s) {
        var F = m.dev.toString(32) + ":" + m.ino.toString(32);
        if (E.hasOwnProperty(F))
          return g(null, E[F], e);
      }
      h.stat(e, function(O) {
        if (O) return D(O);
        h.readlink(e, function(T, x) {
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
  }, Xe;
}
var nt, ki;
function ho() {
  if (ki) return nt;
  ki = 1, nt = o, o.realpath = o, o.sync = a, o.realpathSync = a, o.monkeypatch = f, o.unmonkeypatch = n;
  var t = ie, s = t.realpath, h = t.realpathSync, v = process.version, p = /^v[0-5]\./.test(v), i = du();
  function r(D) {
    return D && D.syscall === "realpath" && (D.code === "ELOOP" || D.code === "ENOMEM" || D.code === "ENAMETOOLONG");
  }
  function o(D, l, E) {
    if (p)
      return s(D, l, E);
    typeof l == "function" && (E = l, l = null), s(D, l, function(y, u) {
      r(y) ? i.realpath(D, l, E) : E(y, u);
    });
  }
  function a(D, l) {
    if (p)
      return h(D, l);
    try {
      return h(D, l);
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
    t.realpath = s, t.realpathSync = h;
  }
  return nt;
}
var it, qi;
function pu() {
  if (qi) return it;
  qi = 1, it = function(s, h) {
    for (var v = [], p = 0; p < s.length; p++) {
      var i = h(s[p], p);
      t(i) ? v.push.apply(v, i) : v.push(i);
    }
    return v;
  };
  var t = Array.isArray || function(s) {
    return Object.prototype.toString.call(s) === "[object Array]";
  };
  return it;
}
var at, Pi;
function vu() {
  if (Pi) return at;
  Pi = 1, at = t;
  function t(v, p, i) {
    v instanceof RegExp && (v = s(v, i)), p instanceof RegExp && (p = s(p, i));
    var r = h(v, p, i);
    return r && {
      start: r[0],
      end: r[1],
      pre: i.slice(0, r[0]),
      body: i.slice(r[0] + v.length, r[1]),
      post: i.slice(r[1] + p.length)
    };
  }
  function s(v, p) {
    var i = p.match(v);
    return i ? i[0] : null;
  }
  t.range = h;
  function h(v, p, i) {
    var r, o, a, f, n, D = i.indexOf(v), l = i.indexOf(p, D + 1), E = D;
    if (D >= 0 && l > 0) {
      if (v === p)
        return [D, l];
      for (r = [], a = i.length; E >= 0 && !n; )
        E == D ? (r.push(E), D = i.indexOf(v, E + 1)) : r.length == 1 ? n = [r.pop(), l] : (o = r.pop(), o < a && (a = o, f = l), l = i.indexOf(p, E + 1)), E = D < l && D >= 0 ? D : l;
      r.length && (n = [a, f]);
    }
    return n;
  }
  return at;
}
var ot, $i;
function Du() {
  if ($i) return ot;
  $i = 1;
  var t = pu(), s = vu();
  ot = D;
  var h = "\0SLASH" + Math.random() + "\0", v = "\0OPEN" + Math.random() + "\0", p = "\0CLOSE" + Math.random() + "\0", i = "\0COMMA" + Math.random() + "\0", r = "\0PERIOD" + Math.random() + "\0";
  function o(e) {
    return parseInt(e, 10) == e ? parseInt(e, 10) : e.charCodeAt(0);
  }
  function a(e) {
    return e.split("\\\\").join(h).split("\\{").join(v).split("\\}").join(p).split("\\,").join(i).split("\\.").join(r);
  }
  function f(e) {
    return e.split(h).join("\\").split(v).join("{").split(p).join("}").split(i).join(",").split(r).join(".");
  }
  function n(e) {
    if (!e)
      return [""];
    var _ = [], w = s("{", "}", e);
    if (!w)
      return e.split(",");
    var c = w.pre, d = w.body, g = w.post, R = c.split(",");
    R[R.length - 1] += "{" + d + "}";
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
    var w = [], c = s("{", "}", e);
    if (!c || /\$$/.test(c.pre)) return [e];
    var d = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(c.body), g = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(c.body), R = d || g, C = c.body.indexOf(",") >= 0;
    if (!R && !C)
      return c.post.match(/,(?!,).*\}/) ? (e = c.pre + "{" + c.body + p + c.post, b(e)) : [e];
    var m;
    if (R)
      m = c.body.split(/\.\./);
    else if (m = n(c.body), m.length === 1 && (m = b(m[0], !1).map(l), m.length === 1)) {
      var O = c.post.length ? b(c.post, !1) : [""];
      return O.map(function(j) {
        return c.pre + m[0] + j;
      });
    }
    var F = c.pre, O = c.post.length ? b(c.post, !1) : [""], T;
    if (R) {
      var x = o(m[0]), B = o(m[1]), k = Math.max(m[0].length, m[1].length), W = m.length == 3 ? Math.abs(o(m[2])) : 1, q = y, P = B < x;
      P && (W *= -1, q = u);
      var M = m.some(E);
      T = [];
      for (var G = x; q(G, B); G += W) {
        var V;
        if (g)
          V = String.fromCharCode(G), V === "\\" && (V = "");
        else if (V = String(G), M) {
          var N = k - V.length;
          if (N > 0) {
            var U = new Array(N + 1).join("0");
            G < 0 ? V = "-" + U + V.slice(1) : V = U + V;
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
  return ot;
}
var ut, Mi;
function _n() {
  if (Mi) return ut;
  Mi = 1, ut = E, E.Minimatch = y;
  var t = function() {
    try {
      return require("path");
    } catch {
    }
  }() || {
    sep: "/"
  };
  E.sep = t.sep;
  var s = E.GLOBSTAR = y.GLOBSTAR = {}, h = Du(), v = {
    "!": { open: "(?:(?!(?:", close: "))[^/]*?)" },
    "?": { open: "(?:", close: ")?" },
    "+": { open: "(?:", close: ")+" },
    "*": { open: "(?:", close: ")*" },
    "@": { open: "(?:", close: ")" }
  }, p = "[^/]", i = p + "*?", r = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?", o = "(?:(?!(?:\\/|^)\\.).)*?", a = f("().*{}+?[]^$\\!");
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
    return F || (this instanceof y ? F = this.options : F = {}), m = typeof m > "u" ? this.pattern : m, w(m), F.nobrace || !/\{(?:(?!\{).)*\}/.test(m) ? [m] : h(m);
  }
  var _ = 1024 * 64, w = function(m) {
    if (typeof m != "string")
      throw new TypeError("invalid pattern");
    if (m.length > _)
      throw new TypeError("pattern is too long");
  };
  y.prototype.parse = d;
  var c = {};
  function d(m, F) {
    w(m);
    var O = this.options;
    if (m === "**")
      if (O.noglobstar)
        m = "*";
      else
        return s;
    if (m === "") return "";
    var T = "", x = !!O.nocase, B = !1, k = [], W = [], q, P = !1, M = -1, G = -1, V = m.charAt(0) === "." ? "" : O.dot ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)", N = this;
    function U() {
      if (q) {
        switch (q) {
          case "*":
            T += i, x = !0;
            break;
          case "?":
            T += p, x = !0;
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
          U(), B = !0;
          continue;
        case "?":
        case "*":
        case "+":
        case "@":
        case "!":
          if (this.debug("%s	%s %s %j <-- stateChar", m, X, T, I), P) {
            this.debug("  in class"), I === "!" && X === G + 1 && (I = "^"), T += I;
            continue;
          }
          N.debug("call clearStateChar %j", q), U(), q = I, O.noext && U();
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
          U(), x = !0;
          var L = k.pop();
          T += L.close, L.type === "!" && W.push(L), L.reEnd = T.length;
          continue;
        case "|":
          if (P || !k.length || B) {
            T += "\\|", B = !1;
            continue;
          }
          U(), T += "|";
          continue;
        case "[":
          if (U(), P) {
            T += "\\" + I;
            continue;
          }
          P = !0, G = X, M = T.length, T += I;
          continue;
        case "]":
          if (X === G + 1 || !P) {
            T += "\\" + I, B = !1;
            continue;
          }
          var j = m.substring(G + 1, X);
          try {
            RegExp("[" + j + "]");
          } catch {
            var Y = this.parse(j, c);
            T = T.substr(0, M) + "\\[" + Y[0] + "\\]", x = x || Y[1], P = !1;
            continue;
          }
          x = !0, P = !1, T += I;
          continue;
        default:
          U(), B ? B = !1 : a[I] && !(I === "^" && P) && (T += "\\"), T += I;
      }
    }
    for (P && (j = m.substr(G + 1), Y = this.parse(j, c), T = T.substr(0, M) + "\\[" + Y[0], x = x || Y[1]), L = k.pop(); L; L = k.pop()) {
      var z = T.slice(L.reStart + L.open.length);
      this.debug("setting tail", T, L), z = z.replace(/((?:\\{2}){0,64})(\\?)\|/g, function(_e, ce, le) {
        return le || (le = "\\"), ce + ce + le + "|";
      }), this.debug(`tail=%j
   %s`, z, z, L, T);
      var S = L.type === "*" ? i : L.type === "?" ? p : "\\" + L.type;
      x = !0, T = T.slice(0, L.reStart) + S + "\\(" + z;
    }
    U(), B && (T += "\\\\");
    var A = !1;
    switch (T.charAt(0)) {
      case "[":
      case ".":
      case "(":
        A = !0;
    }
    for (var $ = W.length - 1; $ > -1; $--) {
      var H = W[$], J = T.slice(0, H.reStart), K = T.slice(H.reStart, H.reEnd - 8), Q = T.slice(H.reEnd - 8, H.reEnd), ne = T.slice(H.reEnd);
      Q += ne;
      var ve = J.split("(").length - 1, De = ne;
      for (X = 0; X < ve; X++)
        De = De.replace(/\)[+*?]?/, "");
      ne = De;
      var ke = "";
      ne === "" && F !== c && (ke = "$");
      var qe = J + K + ne + ke + Q;
      T = qe;
    }
    if (T !== "" && x && (T = "(?=.)" + T), A && (T = V + T), F === c)
      return [T, x];
    if (!x)
      return R(m);
    var Se = O.nocase ? "i" : "";
    try {
      var he = new RegExp("^" + T + "$", Se);
    } catch {
      return new RegExp("$.");
    }
    return he._glob = m, he._src = T, he;
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
      var W = x[k], q = F;
      T.matchBase && W.length === 1 && (q = [B]);
      var P = this.matchOne(q, W, O);
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
    for (var x = 0, B = 0, k = m.length, W = F.length; x < k && B < W; x++, B++) {
      this.debug("matchOne loop");
      var q = F[B], P = m[x];
      if (this.debug(F, q, P), q === !1) return !1;
      if (q === s) {
        this.debug("GLOBSTAR", [F, q, P]);
        var M = x, G = B + 1;
        if (G === W) {
          for (this.debug("** at the end"); x < k; x++)
            if (m[x] === "." || m[x] === ".." || !T.dot && m[x].charAt(0) === ".") return !1;
          return !0;
        }
        for (; M < k; ) {
          var V = m[M];
          if (this.debug(`
globstar while`, m, M, F, G, V), this.matchOne(m.slice(M), F.slice(G), O))
            return this.debug("globstar found match!", M, k, V), !0;
          if (V === "." || V === ".." || !T.dot && V.charAt(0) === ".") {
            this.debug("dot detected!", m, M, F, G);
            break;
          }
          this.debug("globstar swallow a segment, and continue"), M++;
        }
        return !!(O && (this.debug(`
>>> no match, partial?`, m, M, F, G), M === k));
      }
      var N;
      if (typeof q == "string" ? (N = P === q, this.debug("string match", q, P, N)) : (N = P.match(q), this.debug("pattern match", q, P, N)), !N) return !1;
    }
    if (x === k && B === W)
      return !0;
    if (x === k)
      return O;
    if (B === W)
      return x === k - 1 && m[x] === "";
    throw new Error("wtf?");
  };
  function R(m) {
    return m.replace(/\\(.)/g, "$1");
  }
  function C(m) {
    return m.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
  return ut;
}
var Te = { exports: {} }, ji;
function bn() {
  if (ji) return Te.exports;
  ji = 1;
  function t(h) {
    return h.charAt(0) === "/";
  }
  function s(h) {
    var v = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/, p = v.exec(h), i = p[1] || "", r = !!(i && i.charAt(1) !== ":");
    return !!(p[2] || r);
  }
  return Te.exports = process.platform === "win32" ? s : t, Te.exports.posix = t, Te.exports.win32 = s, Te.exports;
}
var fe = {}, Wi;
function po() {
  if (Wi) return fe;
  Wi = 1, fe.setopts = f, fe.ownProp = t, fe.makeAbs = l, fe.finish = n, fe.mark = D, fe.isIgnored = E, fe.childrenIgnored = y;
  function t(u, b) {
    return Object.prototype.hasOwnProperty.call(u, b);
  }
  var s = ie, h = te, v = _n(), p = bn(), i = v.Minimatch;
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
    t(e, "cwd") ? (u.cwd = h.resolve(e.cwd), u.changedCwd = u.cwd !== _) : u.cwd = _, u.root = e.root || h.resolve(u.cwd, "/"), u.root = h.resolve(u.root), process.platform === "win32" && (u.root = u.root.replace(/\\/g, "/")), u.cwdAbs = p(u.cwd) ? u.cwd : l(u, u.cwd), process.platform === "win32" && (u.cwdAbs = u.cwdAbs.replace(/\\/g, "/")), u.nomount = !!e.nomount, e.nonegate = !0, e.nocomment = !0, e.allowWindowsEscape = !1, u.minimatch = new i(b, e), u.options = u.minimatch.options;
  }
  function n(u) {
    for (var b = u.nounique, e = b ? [] : /* @__PURE__ */ Object.create(null), _ = 0, w = u.matches.length; _ < w; _++) {
      var c = u.matches[_];
      if (!c || Object.keys(c).length === 0) {
        if (u.nonull) {
          var d = u.minimatch.globSet[_];
          b ? e.push(d) : e[d] = !0;
        }
      } else {
        var g = Object.keys(c);
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
      var c = _ === "DIR" || Array.isArray(_), d = b.slice(-1) === "/";
      if (c && !d ? w += "/" : !c && d && (w = w.slice(0, -1)), w !== b) {
        var g = l(u, w);
        u.statCache[g] = u.statCache[e], u.cache[g] = u.cache[e];
      }
    }
    return w;
  }
  function l(u, b) {
    var e = b;
    return b.charAt(0) === "/" ? e = h.join(u.root, b) : p(b) || b === "" ? e = b : u.changedCwd ? e = h.resolve(u.cwd, b) : e = h.resolve(b), process.platform === "win32" && (e = e.replace(/\\/g, "/")), e;
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
  return fe;
}
var st, Gi;
function _u() {
  if (Gi) return st;
  Gi = 1, st = n, n.GlobSync = D;
  var t = ho(), s = _n();
  s.Minimatch, _o().Glob;
  var h = te, v = tr, p = bn(), i = po(), r = i.setopts, o = i.ownProp, a = i.childrenIgnored, f = i.isIgnored;
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
    b === null ? _ = "." : ((p(b) || p(l.map(function(d) {
      return typeof d == "string" ? d : "[*]";
    }).join("/"))) && (!b || !p(b)) && (b = "/" + b), _ = b);
    var w = this._makeAbs(_);
    if (!a(this, _)) {
      var c = e[0] === s.GLOBSTAR;
      c ? this._processGlobStar(b, _, w, e, E, y) : this._processReaddir(b, _, w, e, E, y);
    }
  }, D.prototype._processReaddir = function(l, E, y, u, b, e) {
    var _ = this._readdir(y, e);
    if (_) {
      for (var w = u[0], c = !!this.minimatch.negate, d = w._glob, g = this.dot || d.charAt(0) === ".", R = [], C = 0; C < _.length; C++) {
        var m = _[C];
        if (m.charAt(0) !== "." || g) {
          var F;
          c && !l ? F = !m.match(w) : F = m.match(w), F && R.push(m);
        }
      }
      var O = R.length;
      if (O !== 0) {
        if (u.length === 1 && !this.mark && !this.stat) {
          this.matches[b] || (this.matches[b] = /* @__PURE__ */ Object.create(null));
          for (var C = 0; C < O; C++) {
            var m = R[C];
            l && (l.slice(-1) !== "/" ? m = l + "/" + m : m = l + m), m.charAt(0) === "/" && !this.nomount && (m = h.join(this.root, m)), this._emitMatch(b, m);
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
      var w = u.slice(1), c = l ? [l] : [], d = c.concat(w);
      this._process(d, b, !1);
      var g = _.length, R = this.symlinks[y];
      if (!(R && e))
        for (var C = 0; C < g; C++) {
          var m = _[C];
          if (!(m.charAt(0) === "." && !this.dot)) {
            var F = c.concat(_[C], w);
            this._process(F, b, !0);
            var O = c.concat(_[C], u);
            this._process(O, b, !0);
          }
        }
    }
  }, D.prototype._processSimple = function(l, E) {
    var y = this._stat(l);
    if (this.matches[E] || (this.matches[E] = /* @__PURE__ */ Object.create(null)), !!y) {
      if (l && p(l) && !this.nomount) {
        var u = /[\/\\]$/.test(l);
        l.charAt(0) === "/" ? l = h.join(this.root, l) : (l = h.resolve(this.root, l), u && (l += "/"));
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
  }, st;
}
var lt, Ui;
function vo() {
  if (Ui) return lt;
  Ui = 1, lt = t;
  function t(s, h) {
    if (s && h) return t(s)(h);
    if (typeof s != "function")
      throw new TypeError("need wrapper function");
    return Object.keys(s).forEach(function(p) {
      v[p] = s[p];
    }), v;
    function v() {
      for (var p = new Array(arguments.length), i = 0; i < p.length; i++)
        p[i] = arguments[i];
      var r = s.apply(this, p), o = p[p.length - 1];
      return typeof r == "function" && r !== o && Object.keys(o).forEach(function(a) {
        r[a] = o[a];
      }), r;
    }
  }
  return lt;
}
var ze = { exports: {} }, Hi;
function Do() {
  if (Hi) return ze.exports;
  Hi = 1;
  var t = vo();
  ze.exports = t(s), ze.exports.strict = t(h), s.proto = s(function() {
    Object.defineProperty(Function.prototype, "once", {
      value: function() {
        return s(this);
      },
      configurable: !0
    }), Object.defineProperty(Function.prototype, "onceStrict", {
      value: function() {
        return h(this);
      },
      configurable: !0
    });
  });
  function s(v) {
    var p = function() {
      return p.called ? p.value : (p.called = !0, p.value = v.apply(this, arguments));
    };
    return p.called = !1, p;
  }
  function h(v) {
    var p = function() {
      if (p.called)
        throw new Error(p.onceError);
      return p.called = !0, p.value = v.apply(this, arguments);
    }, i = v.name || "Function wrapped with `once`";
    return p.onceError = i + " shouldn't be called more than once", p.called = !1, p;
  }
  return ze.exports;
}
var ft, Vi;
function bu() {
  if (Vi) return ft;
  Vi = 1;
  var t = vo(), s = /* @__PURE__ */ Object.create(null), h = Do();
  ft = t(v);
  function v(r, o) {
    return s[r] ? (s[r].push(o), null) : (s[r] = [o], p(r));
  }
  function p(r) {
    return h(function o() {
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
  return ft;
}
var ct, Yi;
function _o() {
  if (Yi) return ct;
  Yi = 1, ct = u;
  var t = ho(), s = _n();
  s.Minimatch;
  var h = Re(), v = we.EventEmitter, p = te, i = tr, r = bn(), o = _u(), a = po(), f = a.setopts, n = a.ownProp, D = bu(), l = a.childrenIgnored, E = a.isIgnored, y = Do();
  function u(c, d, g) {
    if (typeof d == "function" && (g = d, d = {}), d || (d = {}), d.sync) {
      if (g)
        throw new TypeError("callback provided to sync glob");
      return o(c, d);
    }
    return new _(c, d, g);
  }
  u.sync = o;
  var b = u.GlobSync = o.GlobSync;
  u.glob = u;
  function e(c, d) {
    if (d === null || typeof d != "object")
      return c;
    for (var g = Object.keys(d), R = g.length; R--; )
      c[g[R]] = d[g[R]];
    return c;
  }
  u.hasMagic = function(c, d) {
    var g = e({}, d);
    g.noprocess = !0;
    var R = new _(c, g), C = R.minimatch.set;
    if (!c)
      return !1;
    if (C.length > 1)
      return !0;
    for (var m = 0; m < C[0].length; m++)
      if (typeof C[0][m] != "string")
        return !0;
    return !1;
  }, u.Glob = _, h(_, v);
  function _(c, d, g) {
    if (typeof d == "function" && (g = d, d = null), d && d.sync) {
      if (g)
        throw new TypeError("callback provided to sync glob");
      return new b(c, d);
    }
    if (!(this instanceof _))
      return new _(c, d, g);
    f(this, c, d), this._didRealPath = !1;
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
    var c = this.matches.length;
    if (c === 0)
      return this._finish();
    for (var d = this, g = 0; g < this.matches.length; g++)
      this._realpathSet(g, R);
    function R() {
      --c === 0 && d._finish();
    }
  }, _.prototype._realpathSet = function(c, d) {
    var g = this.matches[c];
    if (!g)
      return d();
    var R = Object.keys(g), C = this, m = R.length;
    if (m === 0)
      return d();
    var F = this.matches[c] = /* @__PURE__ */ Object.create(null);
    R.forEach(function(O, T) {
      O = C._makeAbs(O), t.realpath(O, C.realpathCache, function(x, B) {
        x ? x.syscall === "stat" ? F[O] = !0 : C.emit("error", x) : F[B] = !0, --m === 0 && (C.matches[c] = F, d());
      });
    });
  }, _.prototype._mark = function(c) {
    return a.mark(this, c);
  }, _.prototype._makeAbs = function(c) {
    return a.makeAbs(this, c);
  }, _.prototype.abort = function() {
    this.aborted = !0, this.emit("abort");
  }, _.prototype.pause = function() {
    this.paused || (this.paused = !0, this.emit("pause"));
  }, _.prototype.resume = function() {
    if (this.paused) {
      if (this.emit("resume"), this.paused = !1, this._emitQueue.length) {
        var c = this._emitQueue.slice(0);
        this._emitQueue.length = 0;
        for (var d = 0; d < c.length; d++) {
          var g = c[d];
          this._emitMatch(g[0], g[1]);
        }
      }
      if (this._processQueue.length) {
        var R = this._processQueue.slice(0);
        this._processQueue.length = 0;
        for (var d = 0; d < R.length; d++) {
          var C = R[d];
          this._processing--, this._process(C[0], C[1], C[2], C[3]);
        }
      }
    }
  }, _.prototype._process = function(c, d, g, R) {
    if (i(this instanceof _), i(typeof R == "function"), !this.aborted) {
      if (this._processing++, this.paused) {
        this._processQueue.push([c, d, g, R]);
        return;
      }
      for (var C = 0; typeof c[C] == "string"; )
        C++;
      var m;
      switch (C) {
        case c.length:
          this._processSimple(c.join("/"), d, R);
          return;
        case 0:
          m = null;
          break;
        default:
          m = c.slice(0, C).join("/");
          break;
      }
      var F = c.slice(C), O;
      m === null ? O = "." : ((r(m) || r(c.map(function(B) {
        return typeof B == "string" ? B : "[*]";
      }).join("/"))) && (!m || !r(m)) && (m = "/" + m), O = m);
      var T = this._makeAbs(O);
      if (l(this, O))
        return R();
      var x = F[0] === s.GLOBSTAR;
      x ? this._processGlobStar(m, O, T, F, d, g, R) : this._processReaddir(m, O, T, F, d, g, R);
    }
  }, _.prototype._processReaddir = function(c, d, g, R, C, m, F) {
    var O = this;
    this._readdir(g, m, function(T, x) {
      return O._processReaddir2(c, d, g, R, C, m, x, F);
    });
  }, _.prototype._processReaddir2 = function(c, d, g, R, C, m, F, O) {
    if (!F)
      return O();
    for (var T = R[0], x = !!this.minimatch.negate, B = T._glob, k = this.dot || B.charAt(0) === ".", W = [], q = 0; q < F.length; q++) {
      var P = F[q];
      if (P.charAt(0) !== "." || k) {
        var M;
        x && !c ? M = !P.match(T) : M = P.match(T), M && W.push(P);
      }
    }
    var G = W.length;
    if (G === 0)
      return O();
    if (R.length === 1 && !this.mark && !this.stat) {
      this.matches[C] || (this.matches[C] = /* @__PURE__ */ Object.create(null));
      for (var q = 0; q < G; q++) {
        var P = W[q];
        c && (c !== "/" ? P = c + "/" + P : P = c + P), P.charAt(0) === "/" && !this.nomount && (P = p.join(this.root, P)), this._emitMatch(C, P);
      }
      return O();
    }
    R.shift();
    for (var q = 0; q < G; q++) {
      var P = W[q];
      c && (c !== "/" ? P = c + "/" + P : P = c + P), this._process([P].concat(R), C, m, O);
    }
    O();
  }, _.prototype._emitMatch = function(c, d) {
    if (!this.aborted && !E(this, d)) {
      if (this.paused) {
        this._emitQueue.push([c, d]);
        return;
      }
      var g = r(d) ? d : this._makeAbs(d);
      if (this.mark && (d = this._mark(d)), this.absolute && (d = g), !this.matches[c][d]) {
        if (this.nodir) {
          var R = this.cache[g];
          if (R === "DIR" || Array.isArray(R))
            return;
        }
        this.matches[c][d] = !0;
        var C = this.statCache[g];
        C && this.emit("stat", d, C), this.emit("match", d);
      }
    }
  }, _.prototype._readdirInGlobStar = function(c, d) {
    if (this.aborted)
      return;
    if (this.follow)
      return this._readdir(c, !1, d);
    var g = "lstat\0" + c, R = this, C = D(g, m);
    C && R.fs.lstat(c, C);
    function m(F, O) {
      if (F && F.code === "ENOENT")
        return d();
      var T = O && O.isSymbolicLink();
      R.symlinks[c] = T, !T && O && !O.isDirectory() ? (R.cache[c] = "FILE", d()) : R._readdir(c, !1, d);
    }
  }, _.prototype._readdir = function(c, d, g) {
    if (!this.aborted && (g = D("readdir\0" + c + "\0" + d, g), !!g)) {
      if (d && !n(this.symlinks, c))
        return this._readdirInGlobStar(c, g);
      if (n(this.cache, c)) {
        var R = this.cache[c];
        if (!R || R === "FILE")
          return g();
        if (Array.isArray(R))
          return g(null, R);
      }
      var C = this;
      C.fs.readdir(c, w(this, c, g));
    }
  };
  function w(c, d, g) {
    return function(R, C) {
      R ? c._readdirError(d, R, g) : c._readdirEntries(d, C, g);
    };
  }
  return _.prototype._readdirEntries = function(c, d, g) {
    if (!this.aborted) {
      if (!this.mark && !this.stat)
        for (var R = 0; R < d.length; R++) {
          var C = d[R];
          c === "/" ? C = c + C : C = c + "/" + C, this.cache[C] = !0;
        }
      return this.cache[c] = d, g(null, d);
    }
  }, _.prototype._readdirError = function(c, d, g) {
    if (!this.aborted) {
      switch (d.code) {
        case "ENOTSUP":
        case "ENOTDIR":
          var R = this._makeAbs(c);
          if (this.cache[R] = "FILE", R === this.cwdAbs) {
            var C = new Error(d.code + " invalid cwd " + this.cwd);
            C.path = this.cwd, C.code = d.code, this.emit("error", C), this.abort();
          }
          break;
        case "ENOENT":
        case "ELOOP":
        case "ENAMETOOLONG":
        case "UNKNOWN":
          this.cache[this._makeAbs(c)] = !1;
          break;
        default:
          this.cache[this._makeAbs(c)] = !1, this.strict && (this.emit("error", d), this.abort()), this.silent || console.error("glob error", d);
          break;
      }
      return g();
    }
  }, _.prototype._processGlobStar = function(c, d, g, R, C, m, F) {
    var O = this;
    this._readdir(g, m, function(T, x) {
      O._processGlobStar2(c, d, g, R, C, m, x, F);
    });
  }, _.prototype._processGlobStar2 = function(c, d, g, R, C, m, F, O) {
    if (!F)
      return O();
    var T = R.slice(1), x = c ? [c] : [], B = x.concat(T);
    this._process(B, C, !1, O);
    var k = this.symlinks[g], W = F.length;
    if (k && m)
      return O();
    for (var q = 0; q < W; q++) {
      var P = F[q];
      if (!(P.charAt(0) === "." && !this.dot)) {
        var M = x.concat(F[q], T);
        this._process(M, C, !0, O);
        var G = x.concat(F[q], R);
        this._process(G, C, !0, O);
      }
    }
    O();
  }, _.prototype._processSimple = function(c, d, g) {
    var R = this;
    this._stat(c, function(C, m) {
      R._processSimple2(c, d, C, m, g);
    });
  }, _.prototype._processSimple2 = function(c, d, g, R, C) {
    if (this.matches[d] || (this.matches[d] = /* @__PURE__ */ Object.create(null)), !R)
      return C();
    if (c && r(c) && !this.nomount) {
      var m = /[\/\\]$/.test(c);
      c.charAt(0) === "/" ? c = p.join(this.root, c) : (c = p.resolve(this.root, c), m && (c += "/"));
    }
    process.platform === "win32" && (c = c.replace(/\\/g, "/")), this._emitMatch(d, c), C();
  }, _.prototype._stat = function(c, d) {
    var g = this._makeAbs(c), R = c.slice(-1) === "/";
    if (c.length > this.maxLength)
      return d();
    if (!this.stat && n(this.cache, g)) {
      var C = this.cache[g];
      if (Array.isArray(C) && (C = "DIR"), !R || C === "DIR")
        return d(null, C);
      if (R && C === "FILE")
        return d();
    }
    var m = this.statCache[g];
    if (m !== void 0) {
      if (m === !1)
        return d(null, m);
      var F = m.isDirectory() ? "DIR" : "FILE";
      return R && F === "FILE" ? d() : d(null, F, m);
    }
    var O = this, T = D("stat\0" + g, x);
    T && O.fs.lstat(g, T);
    function x(B, k) {
      if (k && k.isSymbolicLink())
        return O.fs.stat(g, function(W, q) {
          W ? O._stat2(c, g, null, k, d) : O._stat2(c, g, W, q, d);
        });
      O._stat2(c, g, B, k, d);
    }
  }, _.prototype._stat2 = function(c, d, g, R, C) {
    if (g && (g.code === "ENOENT" || g.code === "ENOTDIR"))
      return this.statCache[d] = !1, C();
    var m = c.slice(-1) === "/";
    if (this.statCache[d] = R, d.slice(-1) === "/" && R && !R.isDirectory())
      return C(null, !1, R);
    var F = !0;
    return R && (F = R.isDirectory() ? "DIR" : "FILE"), this.cache[d] = this.cache[d] || F, m && F === "FILE" ? C() : C(null, F, R);
  }, ct;
}
var ht, Xi;
function zi() {
  if (Xi) return ht;
  Xi = 1;
  const t = tr, s = te, h = ie;
  let v;
  try {
    v = _o();
  } catch {
  }
  const p = {
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
      e[w] = e[w] || h[w], w = w + "Sync", e[w] = e[w] || h[w];
    }), e.maxBusyTries = e.maxBusyTries || 3, e.emfileWait = e.emfileWait || 1e3, e.glob === !1 && (e.disableGlob = !0), e.disableGlob !== !0 && v === void 0)
      throw Error("glob dependency not found, set `options.disableGlob = true` if intentional");
    e.disableGlob = e.disableGlob || !1, e.glob = e.glob || p;
  }, a = (e, _, w) => {
    typeof _ == "function" && (w = _, _ = {}), t(e, "rimraf: missing path"), t.equal(typeof e, "string", "rimraf: path should be a string"), t.equal(typeof w, "function", "rimraf: callback function required"), t(_, "rimraf: invalid options argument provided"), t.equal(typeof _, "object", "rimraf: options should be object"), o(_);
    let c = 0, d = null, g = 0;
    const R = (m) => {
      d = d || m, --g === 0 && w(d);
    }, C = (m, F) => {
      if (m)
        return w(m);
      if (g = F.length, g === 0)
        return w();
      F.forEach((O) => {
        const T = (x) => {
          if (x) {
            if ((x.code === "EBUSY" || x.code === "ENOTEMPTY" || x.code === "EPERM") && c < _.maxBusyTries)
              return c++, setTimeout(() => f(O, _, T), c * 100);
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
    t(e), t(_), t(typeof w == "function"), _.lstat(e, (c, d) => {
      if (c && c.code === "ENOENT")
        return w(null);
      if (c && c.code === "EPERM" && r && n(e, _, c, w), d && d.isDirectory())
        return l(e, _, c, w);
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
  }, n = (e, _, w, c) => {
    t(e), t(_), t(typeof c == "function"), _.chmod(e, 438, (d) => {
      d ? c(d.code === "ENOENT" ? null : w) : _.stat(e, (g, R) => {
        g ? c(g.code === "ENOENT" ? null : w) : R.isDirectory() ? l(e, _, w, c) : _.unlink(e, c);
      });
    });
  }, D = (e, _, w) => {
    t(e), t(_);
    try {
      _.chmodSync(e, 438);
    } catch (d) {
      if (d.code === "ENOENT")
        return;
      throw w;
    }
    let c;
    try {
      c = _.statSync(e);
    } catch (d) {
      if (d.code === "ENOENT")
        return;
      throw w;
    }
    c.isDirectory() ? u(e, _, w) : _.unlinkSync(e);
  }, l = (e, _, w, c) => {
    t(e), t(_), t(typeof c == "function"), _.rmdir(e, (d) => {
      d && (d.code === "ENOTEMPTY" || d.code === "EEXIST" || d.code === "EPERM") ? E(e, _, c) : d && d.code === "ENOTDIR" ? c(w) : c(d);
    });
  }, E = (e, _, w) => {
    t(e), t(_), t(typeof w == "function"), _.readdir(e, (c, d) => {
      if (c)
        return w(c);
      let g = d.length;
      if (g === 0)
        return _.rmdir(e, w);
      let R;
      d.forEach((C) => {
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
      for (let c = 0; c < w.length; c++) {
        const d = w[c];
        let g;
        try {
          g = _.lstatSync(d);
        } catch (R) {
          if (R.code === "ENOENT")
            return;
          R.code === "EPERM" && r && D(d, _, R);
        }
        try {
          g && g.isDirectory() ? u(d, _, null) : _.unlinkSync(d);
        } catch (R) {
          if (R.code === "ENOENT")
            return;
          if (R.code === "EPERM")
            return r ? D(d, _, R) : u(d, _, R);
          if (R.code !== "EISDIR")
            throw R;
          u(d, _, R);
        }
      }
  }, u = (e, _, w) => {
    t(e), t(_);
    try {
      _.rmdirSync(e);
    } catch (c) {
      if (c.code === "ENOENT")
        return;
      if (c.code === "ENOTDIR")
        throw w;
      (c.code === "ENOTEMPTY" || c.code === "EEXIST" || c.code === "EPERM") && b(e, _);
    }
  }, b = (e, _) => {
    t(e), t(_), _.readdirSync(e).forEach((d) => y(s.join(e, d), _));
    const w = r ? 100 : 1;
    let c = 0;
    do {
      let d = !0;
      try {
        const g = _.rmdirSync(e, _);
        return d = !1, g;
      } finally {
        if (++c < w && d)
          continue;
      }
    } while (!0);
  };
  return ht = a, a.sync = y, ht;
}
xe.exports;
var Ki;
function gn() {
  return Ki || (Ki = 1, function(t, s) {
    const h = ie;
    t.exports = s;
    const v = process.version.substr(1).replace(/-.*$/, "").split(".").map((o) => +o), p = [
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
        } else D && p.indexOf(l.name) !== -1 ? D.forEach((E) => {
          const y = l.args.slice();
          y.push(i + E), n.push({ name: l.name, args: y });
        }) : n.push(l);
      }), n;
    }, t.exports.get_napi_build_versions = function(o, a, f) {
      const n = co();
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
      o && (zi().sync(t.exports.get_build_dir(o)), h.renameSync("build", t.exports.get_build_dir(o)));
    }, t.exports.swap_build_dir_in = function(o) {
      o && (zi().sync("build"), h.renameSync(t.exports.get_build_dir(o), "build"));
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
  }(xe, xe.exports)), xe.exports;
}
var Ke = { exports: {} }, Ze = { exports: {} }, Qe = { exports: {} }, dt, Zi;
function or() {
  if (Zi) return dt;
  Zi = 1;
  const t = "2.0.0", s = 256, h = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, v = 16, p = s - 6;
  return dt = {
    MAX_LENGTH: s,
    MAX_SAFE_COMPONENT_LENGTH: v,
    MAX_SAFE_BUILD_LENGTH: p,
    MAX_SAFE_INTEGER: h,
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
  }, dt;
}
var pt, Qi;
function ur() {
  return Qi || (Qi = 1, pt = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...s) => console.error("SEMVER", ...s) : () => {
  }), pt;
}
var Ji;
function Be() {
  return Ji || (Ji = 1, function(t, s) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: h,
      MAX_SAFE_BUILD_LENGTH: v,
      MAX_LENGTH: p
    } = or(), i = ur();
    s = t.exports = {};
    const r = s.re = [], o = s.safeRe = [], a = s.src = [], f = s.safeSrc = [], n = s.t = {};
    let D = 0;
    const l = "[a-zA-Z0-9-]", E = [
      ["\\s", 1],
      ["\\d", p],
      [l, v]
    ], y = (b) => {
      for (const [e, _] of E)
        b = b.split(`${e}*`).join(`${e}{0,${_}}`).split(`${e}+`).join(`${e}{1,${_}}`);
      return b;
    }, u = (b, e, _) => {
      const w = y(e), c = D++;
      i(b, c, e), n[b] = c, a[c] = e, f[c] = w, r[c] = new RegExp(e, _ ? "g" : void 0), o[c] = new RegExp(w, _ ? "g" : void 0);
    };
    u("NUMERICIDENTIFIER", "0|[1-9]\\d*"), u("NUMERICIDENTIFIERLOOSE", "\\d+"), u("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${l}*`), u("MAINVERSION", `(${a[n.NUMERICIDENTIFIER]})\\.(${a[n.NUMERICIDENTIFIER]})\\.(${a[n.NUMERICIDENTIFIER]})`), u("MAINVERSIONLOOSE", `(${a[n.NUMERICIDENTIFIERLOOSE]})\\.(${a[n.NUMERICIDENTIFIERLOOSE]})\\.(${a[n.NUMERICIDENTIFIERLOOSE]})`), u("PRERELEASEIDENTIFIER", `(?:${a[n.NONNUMERICIDENTIFIER]}|${a[n.NUMERICIDENTIFIER]})`), u("PRERELEASEIDENTIFIERLOOSE", `(?:${a[n.NONNUMERICIDENTIFIER]}|${a[n.NUMERICIDENTIFIERLOOSE]})`), u("PRERELEASE", `(?:-(${a[n.PRERELEASEIDENTIFIER]}(?:\\.${a[n.PRERELEASEIDENTIFIER]})*))`), u("PRERELEASELOOSE", `(?:-?(${a[n.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${a[n.PRERELEASEIDENTIFIERLOOSE]})*))`), u("BUILDIDENTIFIER", `${l}+`), u("BUILD", `(?:\\+(${a[n.BUILDIDENTIFIER]}(?:\\.${a[n.BUILDIDENTIFIER]})*))`), u("FULLPLAIN", `v?${a[n.MAINVERSION]}${a[n.PRERELEASE]}?${a[n.BUILD]}?`), u("FULL", `^${a[n.FULLPLAIN]}$`), u("LOOSEPLAIN", `[v=\\s]*${a[n.MAINVERSIONLOOSE]}${a[n.PRERELEASELOOSE]}?${a[n.BUILD]}?`), u("LOOSE", `^${a[n.LOOSEPLAIN]}$`), u("GTLT", "((?:<|>)?=?)"), u("XRANGEIDENTIFIERLOOSE", `${a[n.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), u("XRANGEIDENTIFIER", `${a[n.NUMERICIDENTIFIER]}|x|X|\\*`), u("XRANGEPLAIN", `[v=\\s]*(${a[n.XRANGEIDENTIFIER]})(?:\\.(${a[n.XRANGEIDENTIFIER]})(?:\\.(${a[n.XRANGEIDENTIFIER]})(?:${a[n.PRERELEASE]})?${a[n.BUILD]}?)?)?`), u("XRANGEPLAINLOOSE", `[v=\\s]*(${a[n.XRANGEIDENTIFIERLOOSE]})(?:\\.(${a[n.XRANGEIDENTIFIERLOOSE]})(?:\\.(${a[n.XRANGEIDENTIFIERLOOSE]})(?:${a[n.PRERELEASELOOSE]})?${a[n.BUILD]}?)?)?`), u("XRANGE", `^${a[n.GTLT]}\\s*${a[n.XRANGEPLAIN]}$`), u("XRANGELOOSE", `^${a[n.GTLT]}\\s*${a[n.XRANGEPLAINLOOSE]}$`), u("COERCEPLAIN", `(^|[^\\d])(\\d{1,${h}})(?:\\.(\\d{1,${h}}))?(?:\\.(\\d{1,${h}}))?`), u("COERCE", `${a[n.COERCEPLAIN]}(?:$|[^\\d])`), u("COERCEFULL", a[n.COERCEPLAIN] + `(?:${a[n.PRERELEASE]})?(?:${a[n.BUILD]})?(?:$|[^\\d])`), u("COERCERTL", a[n.COERCE], !0), u("COERCERTLFULL", a[n.COERCEFULL], !0), u("LONETILDE", "(?:~>?)"), u("TILDETRIM", `(\\s*)${a[n.LONETILDE]}\\s+`, !0), s.tildeTrimReplace = "$1~", u("TILDE", `^${a[n.LONETILDE]}${a[n.XRANGEPLAIN]}$`), u("TILDELOOSE", `^${a[n.LONETILDE]}${a[n.XRANGEPLAINLOOSE]}$`), u("LONECARET", "(?:\\^)"), u("CARETTRIM", `(\\s*)${a[n.LONECARET]}\\s+`, !0), s.caretTrimReplace = "$1^", u("CARET", `^${a[n.LONECARET]}${a[n.XRANGEPLAIN]}$`), u("CARETLOOSE", `^${a[n.LONECARET]}${a[n.XRANGEPLAINLOOSE]}$`), u("COMPARATORLOOSE", `^${a[n.GTLT]}\\s*(${a[n.LOOSEPLAIN]})$|^$`), u("COMPARATOR", `^${a[n.GTLT]}\\s*(${a[n.FULLPLAIN]})$|^$`), u("COMPARATORTRIM", `(\\s*)${a[n.GTLT]}\\s*(${a[n.LOOSEPLAIN]}|${a[n.XRANGEPLAIN]})`, !0), s.comparatorTrimReplace = "$1$2$3", u("HYPHENRANGE", `^\\s*(${a[n.XRANGEPLAIN]})\\s+-\\s+(${a[n.XRANGEPLAIN]})\\s*$`), u("HYPHENRANGELOOSE", `^\\s*(${a[n.XRANGEPLAINLOOSE]})\\s+-\\s+(${a[n.XRANGEPLAINLOOSE]})\\s*$`), u("STAR", "(<|>)?=?\\s*\\*"), u("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), u("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }(Qe, Qe.exports)), Qe.exports;
}
var vt, ea;
function mn() {
  if (ea) return vt;
  ea = 1;
  const t = Object.freeze({ loose: !0 }), s = Object.freeze({});
  return vt = (v) => v ? typeof v != "object" ? t : v : s, vt;
}
var Dt, ra;
function bo() {
  if (ra) return Dt;
  ra = 1;
  const t = /^[0-9]+$/, s = (v, p) => {
    if (typeof v == "number" && typeof p == "number")
      return v === p ? 0 : v < p ? -1 : 1;
    const i = t.test(v), r = t.test(p);
    return i && r && (v = +v, p = +p), v === p ? 0 : i && !r ? -1 : r && !i ? 1 : v < p ? -1 : 1;
  };
  return Dt = {
    compareIdentifiers: s,
    rcompareIdentifiers: (v, p) => s(p, v)
  }, Dt;
}
var _t, ta;
function re() {
  if (ta) return _t;
  ta = 1;
  const t = ur(), { MAX_LENGTH: s, MAX_SAFE_INTEGER: h } = or(), { safeRe: v, t: p } = Be(), i = mn(), { compareIdentifiers: r } = bo();
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
      const D = f.trim().match(n.loose ? v[p.LOOSE] : v[p.FULL]);
      if (!D)
        throw new TypeError(`Invalid Version: ${f}`);
      if (this.raw = f, this.major = +D[1], this.minor = +D[2], this.patch = +D[3], this.major > h || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > h || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > h || this.patch < 0)
        throw new TypeError("Invalid patch version");
      D[4] ? this.prerelease = D[4].split(".").map((l) => {
        if (/^[0-9]+$/.test(l)) {
          const E = +l;
          if (E >= 0 && E < h)
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
          const l = `-${n}`.match(this.options.loose ? v[p.PRERELEASELOOSE] : v[p.PRERELEASE]);
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
  return _t = o, _t;
}
var bt, na;
function Ce() {
  if (na) return bt;
  na = 1;
  const t = re();
  return bt = (h, v, p = !1) => {
    if (h instanceof t)
      return h;
    try {
      return new t(h, v);
    } catch (i) {
      if (!p)
        return null;
      throw i;
    }
  }, bt;
}
var gt, ia;
function gu() {
  if (ia) return gt;
  ia = 1;
  const t = Ce();
  return gt = (h, v) => {
    const p = t(h, v);
    return p ? p.version : null;
  }, gt;
}
var mt, aa;
function mu() {
  if (aa) return mt;
  aa = 1;
  const t = Ce();
  return mt = (h, v) => {
    const p = t(h.trim().replace(/^[=v]+/, ""), v);
    return p ? p.version : null;
  }, mt;
}
var Et, oa;
function Eu() {
  if (oa) return Et;
  oa = 1;
  const t = re();
  return Et = (h, v, p, i, r) => {
    typeof p == "string" && (r = i, i = p, p = void 0);
    try {
      return new t(
        h instanceof t ? h.version : h,
        p
      ).inc(v, i, r).version;
    } catch {
      return null;
    }
  }, Et;
}
var yt, ua;
function yu() {
  if (ua) return yt;
  ua = 1;
  const t = Ce();
  return yt = (h, v) => {
    const p = t(h, null, !0), i = t(v, null, !0), r = p.compare(i);
    if (r === 0)
      return null;
    const o = r > 0, a = o ? p : i, f = o ? i : p, n = !!a.prerelease.length;
    if (!!f.prerelease.length && !n) {
      if (!f.patch && !f.minor)
        return "major";
      if (f.compareMain(a) === 0)
        return f.minor && !f.patch ? "minor" : "patch";
    }
    const l = n ? "pre" : "";
    return p.major !== i.major ? l + "major" : p.minor !== i.minor ? l + "minor" : p.patch !== i.patch ? l + "patch" : "prerelease";
  }, yt;
}
var wt, sa;
function wu() {
  if (sa) return wt;
  sa = 1;
  const t = re();
  return wt = (h, v) => new t(h, v).major, wt;
}
var Rt, la;
function Ru() {
  if (la) return Rt;
  la = 1;
  const t = re();
  return Rt = (h, v) => new t(h, v).minor, Rt;
}
var Ct, fa;
function Cu() {
  if (fa) return Ct;
  fa = 1;
  const t = re();
  return Ct = (h, v) => new t(h, v).patch, Ct;
}
var St, ca;
function Su() {
  if (ca) return St;
  ca = 1;
  const t = Ce();
  return St = (h, v) => {
    const p = t(h, v);
    return p && p.prerelease.length ? p.prerelease : null;
  }, St;
}
var Ft, ha;
function ue() {
  if (ha) return Ft;
  ha = 1;
  const t = re();
  return Ft = (h, v, p) => new t(h, p).compare(new t(v, p)), Ft;
}
var At, da;
function Fu() {
  if (da) return At;
  da = 1;
  const t = ue();
  return At = (h, v, p) => t(v, h, p), At;
}
var Ot, pa;
function Au() {
  if (pa) return Ot;
  pa = 1;
  const t = ue();
  return Ot = (h, v) => t(h, v, !0), Ot;
}
var Tt, va;
function En() {
  if (va) return Tt;
  va = 1;
  const t = re();
  return Tt = (h, v, p) => {
    const i = new t(h, p), r = new t(v, p);
    return i.compare(r) || i.compareBuild(r);
  }, Tt;
}
var xt, Da;
function Ou() {
  if (Da) return xt;
  Da = 1;
  const t = En();
  return xt = (h, v) => h.sort((p, i) => t(p, i, v)), xt;
}
var It, _a;
function Tu() {
  if (_a) return It;
  _a = 1;
  const t = En();
  return It = (h, v) => h.sort((p, i) => t(i, p, v)), It;
}
var Lt, ba;
function sr() {
  if (ba) return Lt;
  ba = 1;
  const t = ue();
  return Lt = (h, v, p) => t(h, v, p) > 0, Lt;
}
var Nt, ga;
function yn() {
  if (ga) return Nt;
  ga = 1;
  const t = ue();
  return Nt = (h, v, p) => t(h, v, p) < 0, Nt;
}
var Bt, ma;
function go() {
  if (ma) return Bt;
  ma = 1;
  const t = ue();
  return Bt = (h, v, p) => t(h, v, p) === 0, Bt;
}
var kt, Ea;
function mo() {
  if (Ea) return kt;
  Ea = 1;
  const t = ue();
  return kt = (h, v, p) => t(h, v, p) !== 0, kt;
}
var qt, ya;
function wn() {
  if (ya) return qt;
  ya = 1;
  const t = ue();
  return qt = (h, v, p) => t(h, v, p) >= 0, qt;
}
var Pt, wa;
function Rn() {
  if (wa) return Pt;
  wa = 1;
  const t = ue();
  return Pt = (h, v, p) => t(h, v, p) <= 0, Pt;
}
var $t, Ra;
function Eo() {
  if (Ra) return $t;
  Ra = 1;
  const t = go(), s = mo(), h = sr(), v = wn(), p = yn(), i = Rn();
  return $t = (o, a, f, n) => {
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
        return h(o, f, n);
      case ">=":
        return v(o, f, n);
      case "<":
        return p(o, f, n);
      case "<=":
        return i(o, f, n);
      default:
        throw new TypeError(`Invalid operator: ${a}`);
    }
  }, $t;
}
var Mt, Ca;
function xu() {
  if (Ca) return Mt;
  Ca = 1;
  const t = re(), s = Ce(), { safeRe: h, t: v } = Be();
  return Mt = (i, r) => {
    if (i instanceof t)
      return i;
    if (typeof i == "number" && (i = String(i)), typeof i != "string")
      return null;
    r = r || {};
    let o = null;
    if (!r.rtl)
      o = i.match(r.includePrerelease ? h[v.COERCEFULL] : h[v.COERCE]);
    else {
      const E = r.includePrerelease ? h[v.COERCERTLFULL] : h[v.COERCERTL];
      let y;
      for (; (y = E.exec(i)) && (!o || o.index + o[0].length !== i.length); )
        (!o || y.index + y[0].length !== o.index + o[0].length) && (o = y), E.lastIndex = y.index + y[1].length + y[2].length;
      E.lastIndex = -1;
    }
    if (o === null)
      return null;
    const a = o[2], f = o[3] || "0", n = o[4] || "0", D = r.includePrerelease && o[5] ? `-${o[5]}` : "", l = r.includePrerelease && o[6] ? `+${o[6]}` : "";
    return s(`${a}.${f}.${n}${D}${l}`, r);
  }, Mt;
}
var jt, Sa;
function Iu() {
  if (Sa) return jt;
  Sa = 1;
  class t {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(h) {
      const v = this.map.get(h);
      if (v !== void 0)
        return this.map.delete(h), this.map.set(h, v), v;
    }
    delete(h) {
      return this.map.delete(h);
    }
    set(h, v) {
      if (!this.delete(h) && v !== void 0) {
        if (this.map.size >= this.max) {
          const i = this.map.keys().next().value;
          this.delete(i);
        }
        this.map.set(h, v);
      }
      return this;
    }
  }
  return jt = t, jt;
}
var Wt, Fa;
function se() {
  if (Fa) return Wt;
  Fa = 1;
  const t = /\s+/g;
  class s {
    constructor(k, W) {
      if (W = p(W), k instanceof s)
        return k.loose === !!W.loose && k.includePrerelease === !!W.includePrerelease ? k : new s(k.raw, W);
      if (k instanceof i)
        return this.raw = k.value, this.set = [[k]], this.formatted = void 0, this;
      if (this.options = W, this.loose = !!W.loose, this.includePrerelease = !!W.includePrerelease, this.raw = k.trim().replace(t, " "), this.set = this.raw.split("||").map((q) => this.parseRange(q.trim())).filter((q) => q.length), !this.set.length)
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
          const W = this.set[k];
          for (let q = 0; q < W.length; q++)
            q > 0 && (this.formatted += " "), this.formatted += W[q].toString().trim();
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
      const M = this.options.loose, G = M ? a[f.HYPHENRANGELOOSE] : a[f.HYPHENRANGE];
      k = k.replace(G, T(this.options.includePrerelease)), r("hyphen replace", k), k = k.replace(a[f.COMPARATORTRIM], n), r("comparator trim", k), k = k.replace(a[f.TILDETRIM], D), r("tilde trim", k), k = k.replace(a[f.CARETTRIM], l), r("caret trim", k);
      let V = k.split(" ").map((Z) => _(Z, this.options)).join(" ").split(/\s+/).map((Z) => O(Z, this.options));
      M && (V = V.filter((Z) => (r("loose invalid filter", Z, this.options), !!Z.match(a[f.COMPARATORLOOSE])))), r("range list", V);
      const N = /* @__PURE__ */ new Map(), U = V.map((Z) => new i(Z, this.options));
      for (const Z of U) {
        if (u(Z))
          return [Z];
        N.set(Z.value, Z);
      }
      N.size > 1 && N.has("") && N.delete("");
      const X = [...N.values()];
      return v.set(q, X), X;
    }
    intersects(k, W) {
      if (!(k instanceof s))
        throw new TypeError("a Range is required");
      return this.set.some((q) => e(q, W) && k.set.some((P) => e(P, W) && q.every((M) => P.every((G) => M.intersects(G, W)))));
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
      for (let W = 0; W < this.set.length; W++)
        if (x(this.set[W], k, this.options))
          return !0;
      return !1;
    }
  }
  Wt = s;
  const h = Iu(), v = new h(), p = mn(), i = lr(), r = ur(), o = re(), {
    safeRe: a,
    t: f,
    comparatorTrimReplace: n,
    tildeTrimReplace: D,
    caretTrimReplace: l
  } = Be(), { FLAG_INCLUDE_PRERELEASE: E, FLAG_LOOSE: y } = or(), u = (B) => B.value === "<0.0.0-0", b = (B) => B.value === "", e = (B, k) => {
    let W = !0;
    const q = B.slice();
    let P = q.pop();
    for (; W && q.length; )
      W = q.every((M) => P.intersects(M, k)), P = q.pop();
    return W;
  }, _ = (B, k) => (B = B.replace(a[f.BUILD], ""), r("comp", B, k), B = g(B, k), r("caret", B), B = c(B, k), r("tildes", B), B = C(B, k), r("xrange", B), B = F(B, k), r("stars", B), B), w = (B) => !B || B.toLowerCase() === "x" || B === "*", c = (B, k) => B.trim().split(/\s+/).map((W) => d(W, k)).join(" "), d = (B, k) => {
    const W = k.loose ? a[f.TILDELOOSE] : a[f.TILDE];
    return B.replace(W, (q, P, M, G, V) => {
      r("tilde", B, q, P, M, G, V);
      let N;
      return w(P) ? N = "" : w(M) ? N = `>=${P}.0.0 <${+P + 1}.0.0-0` : w(G) ? N = `>=${P}.${M}.0 <${P}.${+M + 1}.0-0` : V ? (r("replaceTilde pr", V), N = `>=${P}.${M}.${G}-${V} <${P}.${+M + 1}.0-0`) : N = `>=${P}.${M}.${G} <${P}.${+M + 1}.0-0`, r("tilde return", N), N;
    });
  }, g = (B, k) => B.trim().split(/\s+/).map((W) => R(W, k)).join(" "), R = (B, k) => {
    r("caret", B, k);
    const W = k.loose ? a[f.CARETLOOSE] : a[f.CARET], q = k.includePrerelease ? "-0" : "";
    return B.replace(W, (P, M, G, V, N) => {
      r("caret", B, P, M, G, V, N);
      let U;
      return w(M) ? U = "" : w(G) ? U = `>=${M}.0.0${q} <${+M + 1}.0.0-0` : w(V) ? M === "0" ? U = `>=${M}.${G}.0${q} <${M}.${+G + 1}.0-0` : U = `>=${M}.${G}.0${q} <${+M + 1}.0.0-0` : N ? (r("replaceCaret pr", N), M === "0" ? G === "0" ? U = `>=${M}.${G}.${V}-${N} <${M}.${G}.${+V + 1}-0` : U = `>=${M}.${G}.${V}-${N} <${M}.${+G + 1}.0-0` : U = `>=${M}.${G}.${V}-${N} <${+M + 1}.0.0-0`) : (r("no pr"), M === "0" ? G === "0" ? U = `>=${M}.${G}.${V}${q} <${M}.${G}.${+V + 1}-0` : U = `>=${M}.${G}.${V}${q} <${M}.${+G + 1}.0-0` : U = `>=${M}.${G}.${V} <${+M + 1}.0.0-0`), r("caret return", U), U;
    });
  }, C = (B, k) => (r("replaceXRanges", B, k), B.split(/\s+/).map((W) => m(W, k)).join(" ")), m = (B, k) => {
    B = B.trim();
    const W = k.loose ? a[f.XRANGELOOSE] : a[f.XRANGE];
    return B.replace(W, (q, P, M, G, V, N) => {
      r("xRange", B, q, P, M, G, V, N);
      const U = w(M), X = U || w(G), Z = X || w(V), I = Z;
      return P === "=" && I && (P = ""), N = k.includePrerelease ? "-0" : "", U ? P === ">" || P === "<" ? q = "<0.0.0-0" : q = "*" : P && I ? (X && (G = 0), V = 0, P === ">" ? (P = ">=", X ? (M = +M + 1, G = 0, V = 0) : (G = +G + 1, V = 0)) : P === "<=" && (P = "<", X ? M = +M + 1 : G = +G + 1), P === "<" && (N = "-0"), q = `${P + M}.${G}.${V}${N}`) : X ? q = `>=${M}.0.0${N} <${+M + 1}.0.0-0` : Z && (q = `>=${M}.${G}.0${N} <${M}.${+G + 1}.0-0`), r("xRange return", q), q;
    });
  }, F = (B, k) => (r("replaceStars", B, k), B.trim().replace(a[f.STAR], "")), O = (B, k) => (r("replaceGTE0", B, k), B.trim().replace(a[k.includePrerelease ? f.GTE0PRE : f.GTE0], "")), T = (B) => (k, W, q, P, M, G, V, N, U, X, Z, I) => (w(q) ? W = "" : w(P) ? W = `>=${q}.0.0${B ? "-0" : ""}` : w(M) ? W = `>=${q}.${P}.0${B ? "-0" : ""}` : G ? W = `>=${W}` : W = `>=${W}${B ? "-0" : ""}`, w(U) ? N = "" : w(X) ? N = `<${+U + 1}.0.0-0` : w(Z) ? N = `<${U}.${+X + 1}.0-0` : I ? N = `<=${U}.${X}.${Z}-${I}` : B ? N = `<${U}.${X}.${+Z + 1}-0` : N = `<=${N}`, `${W} ${N}`.trim()), x = (B, k, W) => {
    for (let q = 0; q < B.length; q++)
      if (!B[q].test(k))
        return !1;
    if (k.prerelease.length && !W.includePrerelease) {
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
  return Wt;
}
var Gt, Aa;
function lr() {
  if (Aa) return Gt;
  Aa = 1;
  const t = Symbol("SemVer ANY");
  class s {
    static get ANY() {
      return t;
    }
    constructor(n, D) {
      if (D = h(D), n instanceof s) {
        if (n.loose === !!D.loose)
          return n;
        n = n.value;
      }
      n = n.trim().split(/\s+/).join(" "), r("comparator", n, D), this.options = D, this.loose = !!D.loose, this.parse(n), this.semver === t ? this.value = "" : this.value = this.operator + this.semver.version, r("comp", this);
    }
    parse(n) {
      const D = this.options.loose ? v[p.COMPARATORLOOSE] : v[p.COMPARATOR], l = n.match(D);
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
      return this.operator === "" ? this.value === "" ? !0 : new a(n.value, D).test(this.value) : n.operator === "" ? n.value === "" ? !0 : new a(this.value, D).test(n.semver) : (D = h(D), D.includePrerelease && (this.value === "<0.0.0-0" || n.value === "<0.0.0-0") || !D.includePrerelease && (this.value.startsWith("<0.0.0") || n.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && n.operator.startsWith(">") || this.operator.startsWith("<") && n.operator.startsWith("<") || this.semver.version === n.semver.version && this.operator.includes("=") && n.operator.includes("=") || i(this.semver, "<", n.semver, D) && this.operator.startsWith(">") && n.operator.startsWith("<") || i(this.semver, ">", n.semver, D) && this.operator.startsWith("<") && n.operator.startsWith(">")));
    }
  }
  Gt = s;
  const h = mn(), { safeRe: v, t: p } = Be(), i = Eo(), r = ur(), o = re(), a = se();
  return Gt;
}
var Ut, Oa;
function fr() {
  if (Oa) return Ut;
  Oa = 1;
  const t = se();
  return Ut = (h, v, p) => {
    try {
      v = new t(v, p);
    } catch {
      return !1;
    }
    return v.test(h);
  }, Ut;
}
var Ht, Ta;
function Lu() {
  if (Ta) return Ht;
  Ta = 1;
  const t = se();
  return Ht = (h, v) => new t(h, v).set.map((p) => p.map((i) => i.value).join(" ").trim().split(" ")), Ht;
}
var Vt, xa;
function Nu() {
  if (xa) return Vt;
  xa = 1;
  const t = re(), s = se();
  return Vt = (v, p, i) => {
    let r = null, o = null, a = null;
    try {
      a = new s(p, i);
    } catch {
      return null;
    }
    return v.forEach((f) => {
      a.test(f) && (!r || o.compare(f) === -1) && (r = f, o = new t(r, i));
    }), r;
  }, Vt;
}
var Yt, Ia;
function Bu() {
  if (Ia) return Yt;
  Ia = 1;
  const t = re(), s = se();
  return Yt = (v, p, i) => {
    let r = null, o = null, a = null;
    try {
      a = new s(p, i);
    } catch {
      return null;
    }
    return v.forEach((f) => {
      a.test(f) && (!r || o.compare(f) === 1) && (r = f, o = new t(r, i));
    }), r;
  }, Yt;
}
var Xt, La;
function ku() {
  if (La) return Xt;
  La = 1;
  const t = re(), s = se(), h = sr();
  return Xt = (p, i) => {
    p = new s(p, i);
    let r = new t("0.0.0");
    if (p.test(r) || (r = new t("0.0.0-0"), p.test(r)))
      return r;
    r = null;
    for (let o = 0; o < p.set.length; ++o) {
      const a = p.set[o];
      let f = null;
      a.forEach((n) => {
        const D = new t(n.semver.version);
        switch (n.operator) {
          case ">":
            D.prerelease.length === 0 ? D.patch++ : D.prerelease.push(0), D.raw = D.format();
          case "":
          case ">=":
            (!f || h(D, f)) && (f = D);
            break;
          case "<":
          case "<=":
            break;
          default:
            throw new Error(`Unexpected operation: ${n.operator}`);
        }
      }), f && (!r || h(r, f)) && (r = f);
    }
    return r && p.test(r) ? r : null;
  }, Xt;
}
var zt, Na;
function qu() {
  if (Na) return zt;
  Na = 1;
  const t = se();
  return zt = (h, v) => {
    try {
      return new t(h, v).range || "*";
    } catch {
      return null;
    }
  }, zt;
}
var Kt, Ba;
function Cn() {
  if (Ba) return Kt;
  Ba = 1;
  const t = re(), s = lr(), { ANY: h } = s, v = se(), p = fr(), i = sr(), r = yn(), o = Rn(), a = wn();
  return Kt = (n, D, l, E) => {
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
    if (p(n, D, E))
      return !1;
    for (let w = 0; w < D.set.length; ++w) {
      const c = D.set[w];
      let d = null, g = null;
      if (c.forEach((R) => {
        R.semver === h && (R = new s(">=0.0.0")), d = d || R, g = g || R, y(R.semver, d.semver, E) ? d = R : b(R.semver, g.semver, E) && (g = R);
      }), d.operator === e || d.operator === _ || (!g.operator || g.operator === e) && u(n, g.semver))
        return !1;
      if (g.operator === _ && b(n, g.semver))
        return !1;
    }
    return !0;
  }, Kt;
}
var Zt, ka;
function Pu() {
  if (ka) return Zt;
  ka = 1;
  const t = Cn();
  return Zt = (h, v, p) => t(h, v, ">", p), Zt;
}
var Qt, qa;
function $u() {
  if (qa) return Qt;
  qa = 1;
  const t = Cn();
  return Qt = (h, v, p) => t(h, v, "<", p), Qt;
}
var Jt, Pa;
function Mu() {
  if (Pa) return Jt;
  Pa = 1;
  const t = se();
  return Jt = (h, v, p) => (h = new t(h, p), v = new t(v, p), h.intersects(v, p)), Jt;
}
var en, $a;
function ju() {
  if ($a) return en;
  $a = 1;
  const t = fr(), s = ue();
  return en = (h, v, p) => {
    const i = [];
    let r = null, o = null;
    const a = h.sort((l, E) => s(l, E, p));
    for (const l of a)
      t(l, v, p) ? (o = l, r || (r = l)) : (o && i.push([r, o]), o = null, r = null);
    r && i.push([r, null]);
    const f = [];
    for (const [l, E] of i)
      l === E ? f.push(l) : !E && l === a[0] ? f.push("*") : E ? l === a[0] ? f.push(`<=${E}`) : f.push(`${l} - ${E}`) : f.push(`>=${l}`);
    const n = f.join(" || "), D = typeof v.raw == "string" ? v.raw : String(v);
    return n.length < D.length ? n : v;
  }, en;
}
var rn, Ma;
function Wu() {
  if (Ma) return rn;
  Ma = 1;
  const t = se(), s = lr(), { ANY: h } = s, v = fr(), p = ue(), i = (D, l, E = {}) => {
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
    if (D.length === 1 && D[0].semver === h) {
      if (l.length === 1 && l[0].semver === h)
        return !0;
      E.includePrerelease ? D = r : D = o;
    }
    if (l.length === 1 && l[0].semver === h) {
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
      if (e = p(u.semver, b.semver, E), e > 0)
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
    let _, w, c, d, g = b && !E.includePrerelease && b.semver.prerelease.length ? b.semver : !1, R = u && !E.includePrerelease && u.semver.prerelease.length ? u.semver : !1;
    g && g.prerelease.length === 1 && b.operator === "<" && g.prerelease[0] === 0 && (g = !1);
    for (const C of l) {
      if (d = d || C.operator === ">" || C.operator === ">=", c = c || C.operator === "<" || C.operator === "<=", u) {
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
    return !(u && c && !b && e !== 0 || b && d && !u && e !== 0 || R || g);
  }, f = (D, l, E) => {
    if (!D)
      return l;
    const y = p(D.semver, l.semver, E);
    return y > 0 ? D : y < 0 || l.operator === ">" && D.operator === ">=" ? l : D;
  }, n = (D, l, E) => {
    if (!D)
      return l;
    const y = p(D.semver, l.semver, E);
    return y < 0 ? D : y > 0 || l.operator === "<" && D.operator === "<=" ? l : D;
  };
  return rn = i, rn;
}
var tn, ja;
function Gu() {
  if (ja) return tn;
  ja = 1;
  const t = Be(), s = or(), h = re(), v = bo(), p = Ce(), i = gu(), r = mu(), o = Eu(), a = yu(), f = wu(), n = Ru(), D = Cu(), l = Su(), E = ue(), y = Fu(), u = Au(), b = En(), e = Ou(), _ = Tu(), w = sr(), c = yn(), d = go(), g = mo(), R = wn(), C = Rn(), m = Eo(), F = xu(), O = lr(), T = se(), x = fr(), B = Lu(), k = Nu(), W = Bu(), q = ku(), P = qu(), M = Cn(), G = Pu(), V = $u(), N = Mu(), U = ju(), X = Wu();
  return tn = {
    parse: p,
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
    lt: c,
    eq: d,
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
    minSatisfying: W,
    minVersion: q,
    validRange: P,
    outside: M,
    gtr: G,
    ltr: V,
    intersects: N,
    simplifyRange: U,
    subset: X,
    SemVer: h,
    re: t.re,
    src: t.src,
    tokens: t.t,
    SEMVER_SPEC_VERSION: s.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: s.RELEASE_TYPES,
    compareIdentifiers: v.compareIdentifiers,
    rcompareIdentifiers: v.rcompareIdentifiers
  }, tn;
}
var nn, Wa;
function Uu() {
  if (Wa) return nn;
  Wa = 1;
  const t = () => process.platform === "linux";
  let s = null;
  return nn = { isLinux: t, getReport: () => {
    if (!s)
      if (t() && process.report) {
        const v = process.report.excludeNetwork;
        process.report.excludeNetwork = !0, s = process.report.getReport(), process.report.excludeNetwork = v;
      } else
        s = {};
    return s;
  } }, nn;
}
var an, Ga;
function Hu() {
  if (Ga) return an;
  Ga = 1;
  const t = ie, s = "/usr/bin/ldd", h = "/proc/self/exe", v = 2048;
  return an = {
    LDD_PATH: s,
    SELF_PATH: h,
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
  }, an;
}
var on, Ua;
function Vu() {
  return Ua || (Ua = 1, on = {
    interpreterPath: (s) => {
      if (s.length < 64 || s.readUInt32BE(0) !== 2135247942 || s.readUInt8(4) !== 2 || s.readUInt8(5) !== 1)
        return null;
      const h = s.readUInt32LE(32), v = s.readUInt16LE(54), p = s.readUInt16LE(56);
      for (let i = 0; i < p; i++) {
        const r = h + i * v;
        if (s.readUInt32LE(r) === 3) {
          const a = s.readUInt32LE(r + 8), f = s.readUInt32LE(r + 32);
          return s.subarray(a, a + f).toString().replace(/\0.*$/g, "");
        }
      }
      return null;
    }
  }), on;
}
var un, Ha;
function Yu() {
  if (Ha) return un;
  Ha = 1;
  const t = ln, { isLinux: s, getReport: h } = Uu(), { LDD_PATH: v, SELF_PATH: p, readFile: i, readFileSync: r } = Hu(), { interpreterPath: o } = Vu();
  let a, f, n;
  const D = "getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true";
  let l = "";
  const E = () => l || new Promise((N) => {
    t.exec(D, (U, X) => {
      l = U ? " " : X, N(l);
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
    const N = h();
    return N.header && N.header.glibcVersionRuntime ? u : Array.isArray(N.sharedObjects) && N.sharedObjects.some(_) ? e : null;
  }, c = (N) => {
    const [U, X] = N.split(/[\r\n]+/);
    return U && U.includes(u) ? u : X && X.includes(e) ? e : null;
  }, d = (N) => {
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
      const N = await i(p), U = o(N);
      a = d(U);
    } catch {
    }
    return a;
  }, F = () => {
    if (a !== void 0)
      return a;
    a = null;
    try {
      const N = r(p), U = o(N);
      a = d(U);
    } catch {
    }
    return a;
  }, O = async () => {
    let N = null;
    if (s() && (N = await m(), !N && (N = await R(), N || (N = w()), !N))) {
      const U = await E();
      N = c(U);
    }
    return N;
  }, T = () => {
    let N = null;
    if (s() && (N = F(), !N && (N = C(), N || (N = w()), !N))) {
      const U = y();
      N = c(U);
    }
    return N;
  }, x = async () => s() && await O() !== u, B = () => s() && T() !== u, k = async () => {
    if (n !== void 0)
      return n;
    n = null;
    try {
      const U = (await i(v)).match(b);
      U && (n = U[1]);
    } catch {
    }
    return n;
  }, W = () => {
    if (n !== void 0)
      return n;
    n = null;
    try {
      const U = r(v).match(b);
      U && (n = U[1]);
    } catch {
    }
    return n;
  }, q = () => {
    const N = h();
    return N.header && N.header.glibcVersionRuntime ? N.header.glibcVersionRuntime : null;
  }, P = (N) => N.trim().split(/\s+/)[1], M = (N) => {
    const [U, X, Z] = N.split(/[\r\n]+/);
    return U && U.includes(u) ? P(U) : X && Z && X.includes(e) ? P(Z) : null;
  };
  return un = {
    GLIBC: u,
    MUSL: e,
    family: O,
    familySync: T,
    isNonGlibcLinux: x,
    isNonGlibcLinuxSync: B,
    version: async () => {
      let N = null;
      if (s() && (N = await k(), N || (N = q()), !N)) {
        const U = await E();
        N = M(U);
      }
      return N;
    },
    versionSync: () => {
      let N = null;
      if (s() && (N = W(), N || (N = q()), !N)) {
        const U = y();
        N = M(U);
      }
      return N;
    }
  }, un;
}
const Xu = {
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
var Va;
function zu() {
  return Va || (Va = 1, function(t, s) {
    t.exports = s;
    const h = te, v = Gu(), p = fn, i = Yu(), r = gn();
    let o;
    process.env.NODE_PRE_GYP_ABI_CROSSWALK ? o = er(process.env.NODE_PRE_GYP_ABI_CROSSWALK) : o = Xu;
    const a = {};
    Object.keys(o).forEach((d) => {
      const g = d.split(".")[0];
      a[g] || (a[g] = d);
    });
    function f(d, g) {
      if (!d)
        throw new Error("get_electron_abi requires valid runtime arg");
      if (typeof g > "u")
        throw new Error("Empty target version is not supported if electron is the target.");
      const R = v.parse(g);
      return d + "-v" + R.major + "." + R.minor;
    }
    t.exports.get_electron_abi = f;
    function n(d, g) {
      if (!d)
        throw new Error("get_node_webkit_abi requires valid runtime arg");
      if (typeof g > "u")
        throw new Error("Empty target version is not supported if node-webkit is the target.");
      return d + "-v" + g;
    }
    t.exports.get_node_webkit_abi = n;
    function D(d, g) {
      if (!d)
        throw new Error("get_node_abi requires valid runtime arg");
      if (!g)
        throw new Error("get_node_abi requires valid process.versions object");
      const R = v.parse(g.node);
      return R.major === 0 && R.minor % 2 ? d + "-v" + g.node : g.modules ? d + "-v" + +g.modules : "v8-" + g.v8.split(".").slice(0, 2).join(".");
    }
    t.exports.get_node_abi = D;
    function l(d, g) {
      if (!d)
        throw new Error("get_runtime_abi requires valid runtime arg");
      if (d === "node-webkit")
        return n(d, g || process.versions["node-webkit"]);
      if (d === "electron")
        return f(d, g || process.versions.electron);
      if (d !== "node")
        throw new Error("Unknown Runtime: '" + d + "'");
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
        return D(d, C);
      } else
        return D(d, process.versions);
    }
    t.exports.get_runtime_abi = l;
    const E = [
      "module_name",
      "module_path",
      "host"
    ];
    function y(d, g) {
      const R = d.name + ` package.json is not node-pre-gyp ready:
`, C = [];
      d.main || C.push("main"), d.version || C.push("version"), d.name || C.push("name"), d.binary || C.push("binary");
      const m = d.binary;
      if (m && E.forEach((F) => {
        (!m[F] || typeof m[F] != "string") && C.push("binary." + F);
      }), C.length >= 1)
        throw new Error(R + `package.json must declare these properties: 
` + C.join(`
`));
      if (m) {
        const F = p.parse(m.host).protocol;
        if (F === "http:")
          throw new Error("'host' protocol (" + F + ") is invalid - only 'https:' is accepted");
      }
      r.validate_package_json(d, g);
    }
    t.exports.validate_config = y;
    function u(d, g) {
      return Object.keys(g).forEach((R) => {
        const C = "{" + R + "}";
        for (; d.indexOf(C) > -1; )
          d = d.replace(C, g[R]);
      }), d;
    }
    function b(d) {
      return d.slice(-1) !== "/" ? d + "/" : d;
    }
    function e(d) {
      return d.replace(/\/\//g, "/");
    }
    function _(d) {
      let g = "node";
      return d["node-webkit"] ? g = "node-webkit" : d.electron && (g = "electron"), g;
    }
    t.exports.get_process_runtime = _;
    const w = "{module_name}-v{version}-{node_abi}-{platform}-{arch}.tar.gz", c = "";
    t.exports.evaluate = function(d, g, R) {
      g = g || {}, y(d, g);
      const C = d.version, m = v.parse(C), F = g.runtime || _(process.versions), O = {
        name: d.name,
        configuration: g.debug ? "Debug" : "Release",
        debug: g.debug,
        module_name: d.binary.module_name,
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
        module_main: d.main,
        toolset: g.toolset || "",
        // address https://github.com/mapbox/node-pre-gyp/issues/119
        bucket: d.binary.bucket,
        region: d.binary.region,
        s3ForcePathStyle: d.binary.s3ForcePathStyle || !1
      }, T = O.module_name.replace("-", "_"), x = process.env["npm_config_" + T + "_binary_host_mirror"] || d.binary.host;
      O.host = b(u(x, O)), O.module_path = u(d.binary.module_path, O), g.module_root ? O.module_path = h.join(g.module_root, O.module_path) : O.module_path = h.resolve(O.module_path), O.module = h.join(O.module_path, O.module_name + ".node"), O.remote_path = d.binary.remote_path ? e(b(u(d.binary.remote_path, O))) : c;
      const B = d.binary.package_name ? d.binary.package_name : w;
      return O.package_name = u(B, O), O.staged_tarball = h.join("build/stage", O.remote_path, O.package_name), O.hosted_path = p.resolve(O.host, O.remote_path), O.hosted_tarball = p.resolve(O.hosted_path, O.package_name), O;
    };
  }(Ze, Ze.exports)), Ze.exports;
}
var Ya;
function Ku() {
  return Ya || (Ya = 1, function(t, s) {
    const h = yo(), v = zu(), p = gn(), i = ie.existsSync || te.existsSync, r = te;
    t.exports = s, s.usage = "Finds the require path for the node-pre-gyp installed module", s.validate = function(o, a) {
      v.validate_config(o, a);
    }, s.find = function(o, a) {
      if (!i(o))
        throw new Error(o + "does not exist");
      const f = new h.Run({ package_json_path: o, argv: process.argv });
      f.setBinaryHostProperty();
      const n = f.package_json;
      v.validate_config(n, a);
      let D;
      return p.get_napi_build_versions(n, a) && (D = p.get_best_napi_build_version(n, a)), a = a || {}, a.module_root || (a.module_root = r.dirname(o)), v.evaluate(n, a, D).module;
    };
  }(Ke, Ke.exports)), Ke.exports;
}
const Zu = "@mapbox/node-pre-gyp", Qu = "Node.js native addon binary install tool", Ju = "1.0.11", es = [
  "native",
  "addon",
  "module",
  "c",
  "c++",
  "bindings",
  "binary"
], rs = "BSD-3-Clause", ts = "Dane Springmeyer <dane@mapbox.com>", ns = {
  type: "git",
  url: "git://github.com/mapbox/node-pre-gyp.git"
}, is = "./bin/node-pre-gyp", as = "./lib/node-pre-gyp.js", os = {
  "detect-libc": "^2.0.0",
  "https-proxy-agent": "^5.0.0",
  "make-dir": "^3.1.0",
  "node-fetch": "^2.6.7",
  nopt: "^5.0.0",
  npmlog: "^5.0.1",
  rimraf: "^3.0.2",
  semver: "^7.3.5",
  tar: "^6.1.11"
}, us = {
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
}, ss = {
  all: !0,
  "skip-full": !1,
  exclude: [
    "test/**"
  ]
}, ls = {
  coverage: "nyc --all --include index.js --include lib/ npm test",
  "upload-coverage": "nyc report --reporter json && codecov --clear --flags=unit --file=./coverage/coverage-final.json",
  lint: "eslint bin/node-pre-gyp lib/*js lib/util/*js test/*js scripts/*js",
  fix: "npm run lint -- --fix",
  "update-crosswalk": "node scripts/abi_crosswalk.js",
  test: "tape test/*test.js"
}, fs = {
  name: Zu,
  description: Qu,
  version: Ju,
  keywords: es,
  license: rs,
  author: ts,
  repository: ns,
  bin: is,
  main: as,
  dependencies: os,
  devDependencies: us,
  nyc: ss,
  scripts: ls
};
var Xa;
function yo() {
  return Xa || (Xa = 1, function(t, s) {
    t.exports = s, s.mockS3Http = To().get_mockS3Http(), s.mockS3Http("on");
    const h = s.mockS3Http("get"), v = ie, p = te, i = Io(), r = co();
    r.disableProgress();
    const o = gn(), a = we.EventEmitter, f = ae.inherits, n = [
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
    r.heading = "node-pre-gyp", h && r.warn(`mocking s3 to ${process.env.node_pre_gyp_mock_s3}`), Object.defineProperty(s, "find", {
      get: function() {
        return Ku().find;
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
    E.package = fs, E.configDefs = {
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
          const c = u.splice(0, u.indexOf(w));
          u.shift(), b.length > 0 && (b[b.length - 1].args = c), b.push({ name: w, args: [] });
        }
      }), b.length > 0 && (b[b.length - 1].args = u.splice(0));
      let e = this.package_json_path;
      this.opts.directory && (e = p.join(this.opts.directory, e)), this.package_json = JSON.parse(v.readFileSync(e)), this.todo = o.expand_commands(this.package_json, this.opts, b);
      const _ = "npm_config_";
      Object.keys(process.env).forEach((w) => {
        if (w.indexOf(_) !== 0) return;
        const c = process.env[w];
        w === _ + "loglevel" ? r.level = c : (w = w.substring(_.length), w === "argv" ? this.opts.argv && this.opts.argv.remain && this.opts.argv.remain.length || (this.opts[w] = c) : this.opts[w] = c);
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
        "node-pre-gyp@" + this.version + "  " + p.resolve(__dirname, ".."),
        "node@" + process.versions.node
      ].join(`
`);
    }, Object.defineProperty(E, "version", {
      get: function() {
        return this.package.version;
      },
      enumerable: !0
    });
  }(Pe, Pe.exports)), Pe.exports;
}
var sn, za;
function cs() {
  if (za) return sn;
  za = 1;
  const t = yo(), s = te, h = ie, v = t.find(s.resolve(s.join(__dirname, "../package.json")));
  return sn = h.existsSync(v) ? er(v) : {
    getActiveWindow: () => {
    },
    getOpenWindows: () => {
    }
  }, sn;
}
var Ka;
function cr() {
  if (Ka) return Ee.exports;
  Ka = 1;
  const t = cs();
  return Ee.exports = async () => t.getActiveWindow(), Ee.exports.getOpenWindows = async () => t.getOpenWindows(), Ee.exports.sync = t.getActiveWindow, Ee.exports.getOpenWindowsSync = t.getOpenWindows, Ee.exports;
}
Ne.exports = (t) => process.platform === "darwin" ? nr()(t) : process.platform === "linux" ? ir()(t) : process.platform === "win32" ? cr()(t) : Promise.reject(new Error("macOS, Linux, and Windows only"));
Ne.exports.sync = (t) => {
  if (process.platform === "darwin")
    return nr().sync(t);
  if (process.platform === "linux")
    return ir().sync(t);
  if (process.platform === "win32")
    return cr().sync(t);
  throw new Error("macOS, Linux, and Windows only");
};
Ne.exports.getOpenWindows = (t) => process.platform === "darwin" ? nr().getOpenWindows(t) : process.platform === "linux" ? ir().getOpenWindows(t) : process.platform === "win32" ? cr().getOpenWindows(t) : Promise.reject(new Error("macOS, Linux, and Windows only"));
Ne.exports.getOpenWindowsSync = (t) => {
  if (process.platform === "darwin")
    return nr().getOpenWindowsSync(t);
  if (process.platform === "linux")
    return ir().getOpenWindowsSync(t);
  if (process.platform === "win32")
    return cr().getOpenWindowsSync(t);
  throw new Error("macOS, Linux, and Windows only");
};
var hs = Ne.exports;
const ds = /* @__PURE__ */ Oo(hs);
function ps() {
  return Co.getSystemIdleTime();
}
async function wo() {
  try {
    const t = await ds();
    return t ? {
      title: t.title,
      app: t.owner.name,
      url: t.url || void 0
    } : null;
  } catch (t) {
    return console.error("Failed to get active window:", t), null;
  }
}
async function vs(t = 60) {
  const s = ps(), h = await wo();
  return {
    isSystemIdle: s >= t,
    systemIdleTime: s,
    activeWindowTitle: (h == null ? void 0 : h.title) || "Unknown",
    activeWindowApp: (h == null ? void 0 : h.app) || "Unknown",
    activeWindowUrl: h == null ? void 0 : h.url,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}
process.env.DIST = Ie.join(__dirname, "../dist");
process.env.VITE_PUBLIC = Le.isPackaged ? process.env.DIST : Ie.join(__dirname, "../public");
let Je;
const Za = process.env.VITE_DEV_SERVER_URL;
function Ro() {
  Je = new Qa({
    width: 1200,
    height: 800,
    icon: Ie.join(process.env.VITE_PUBLIC, "vite.svg"),
    webPreferences: {
      preload: Ie.join(__dirname, "preload.js"),
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), Za ? Je.loadURL(Za) : Je.loadFile(Ie.join(process.env.DIST, "index.html"));
}
Le.on("window-all-closed", () => {
  process.platform !== "darwin" && (Le.quit(), Je = null);
});
Le.on("activate", () => {
  Qa.getAllWindows().length === 0 && Ro();
});
Le.whenReady().then(() => {
  Ro(), Sn.handle("get-active-window", async () => {
    try {
      return await wo();
    } catch (t) {
      return console.error("Failed to get active window:", t), null;
    }
  }), Sn.handle("get-tracking-data", async () => {
    try {
      return await vs();
    } catch (t) {
      return console.error("Failed to get tracking data:", t), null;
    }
  });
});
