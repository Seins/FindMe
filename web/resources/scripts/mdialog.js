_trim = function(a) {
    return a.replace(/(^\s+|\s+$)/g, "")
}
_removeClass = function(d, c) {
    if (typeof d === "string") {
        try {
            d = _q(d)
        } catch(a) {
            console.log(a);
            return
        }
    }
    var b = new RegExp("(^|\\s)+(" + c + ")(\\s|$)+", "g");
    try {
        d.className = d.className.replace(b, "$1$3")
    } catch(a) {}
    b = null
}
_addClass = function(c, b) {
    if (typeof c === "string") {
        try {
            c = _q(c)
        } catch(a) {
            console.log(a);
            return
        }
    }
    _removeClass(c, b);
    c.className = _trim(c.className + " " + b)
}
_forEach = function(a, c) {
    if (typeof a === "string") {
        try {
            a = _qAll(a)
        } catch(b) {
            console.log(b);
            return
        }
    }
    Array.prototype.forEach.call(a, c)
}
_q = function(c, b) {
    if (b && typeof b === "string") {
        try {
            b = _q(b)
        } catch(a) {
            console.log(a);
            return
        }
    }
    return (b || document).querySelector(c)
}
_qAll = function(c, b) {
    if (b && typeof b === "string") {
        try {
            b = _q(b)
        } catch(a) {
            console.log(a);
            return
        }
    }
    return (b || document).querySelectorAll(c)
}
MData = (function() {
    function b(f) {
        var e = new RegExp("\\-([a-z])", "g");
        if (!e.test(f)) {
            return f
        }
        return f.toLowerCase().replace(e, RegExp.$1.toUpperCase())
    }
    function d(e) {
        return e.replace(/([A-Z])/g, "-$1").toLowerCase()
    }
    function c(g, f, e) {
        g.setAttribute("data-" + d(f), e)
    }
    function a(g, f) {
        var e = g.getAttribute("data-" + d(f));
        return e || undefined
    }
    return function(h, f, e) {
        if (arguments.length > 2) {
            try {
                h.dataset[b(f)] = e
            } catch(g) {
                c(h, f, e)
            }
        } else {
            try {
                return h.dataset[b(f)]
            } catch(g) {
                return a(h, f)
            }
        }
    }
} ())
MDialog = (function() {
    var e = "javascript:void(0)";
    var c = function(m) {
        return (typeof m == "undefined")
    };
    var g = function() {
        var o = '<div class="mModal"><a href="' + e + '"></a></div>';
        _q("body").insertAdjacentHTML("beforeEnd", o);
        o = null;
        var n = _q(".mModal:last-of-type");
        if (_qAll(".mModal").length > 1) {
            n.style.opacity = 0.01
        }
        _q("a", n).style.height = window.innerHeight + "px";
        n.style.zIndex = window._dlgBaseDepth++;
        return n
    };
    var h = function() {
        if (c(window._dlgBaseDepth)) {
            window._dlgBaseDepth = 900
        }
    };
    var k = function(m) {
        if (c(m)) {
            m = true
        }
        _q("body").style.overflow = m ? "hidden": "visible"
    };
    var i = function(O, F, I, v, K, G, z, w, L, y, P, o) {
        if (c(F)) {
            F = null
        }
        if (c(I)) {
            I = null
        }
        if (c(K)) {
            K = null
        }
        if (c(G)) {
            G = null
        }
        if (c(z)) {
            z = null
        }
        if (c(w)) {
            w = null
        }
        if (c(L)) {
            L = null
        }
        if (c(y)) {
            y = null
        }
        if (c(P)) {
            P = true
        }
        if (c(o)) {
            o = true
        }
        h();
        var D = window.innerWidth,
        M = window.innerHeight,
        x = null,
        E = null;
        if (o) {
            E = g()
        }
        x = '<div class="mDialog"><figure></figure><h1></h1><h2></h2><h3></h3><footer>	<a class="two"></a>	<a class="two"></a>	<a class="one"></a></footer><a class="x">X</a></div>';
        _q("body").insertAdjacentHTML("beforeEnd", x);
        x = null;
        var J = _q("div.mDialog:last-of-type", _q("body")),
        B = _q("figure", J),
        r = _q("footer a.one", J),
        q = _q("footer a.two:nth-of-type(1)", J),
        p = _q("footer a.two:nth-of-type(2)", J),
        H = _q("a.x", J),
        A = 0,
        N = [],
        u = function(Q, m, t) {
            Q.addEventListener(m, t);
            N.push({
                o: Q,
                e: m,
                f: t
            })
        },
        n = function(m, t) {
            var Q = _q(m, J);
            if (t != null) {
                Q.innerHTML = t
            } else {
                Q.parentNode.removeChild(Q)
            }
            return Q
        },
        C = function(t) {
            while (N.length) {
                var m = N.shift();
                m.o.removeEventListener(m.e, m.f)
            }
            J.parentNode.removeChild(J);
            window._dlgBaseDepth--;
            if (E == null) {
                return
            }
            E.parentNode.removeChild(E);
            window._dlgBaseDepth--;
            k(false)
        };
        var s = n("h1", O);
        if (s.clientHeight > 51) {
            s.style.textAlign = "left"
        }
        n("h2", F);
        n("h3", I);
        if (y == null) {
            J.removeChild(B)
        } else {
            _addClass(B, y)
        }
        B = null;
        if (z == null) {
            q.parentNode.removeChild(q);
            p.parentNode.removeChild(p);
            q = null;
            p = null;
            r.innerHTML = v;
            r.href = e;
            if (G != null) {
                _addClass(r, G)
            }
            if (K != null) {
                u(r, "click", K)
            }
            u(r, "click", C)
        } else {
            r.parentNode.removeChild(r);
            r = null;
            q.innerHTML = v;
            q.href = e;
            if (G != null) {
                _addClass(q, G)
            }
            if (K != null) {
                u(q, "click", K)
            }
            u(q, "click", C);
            p.innerHTML = z;
            p.href = e;
            if (L != null) {
                _addClass(p, L)
            }
            if (w != null) {
                u(p, "click", w)
            }
            u(p, "click", C)
        }
        if (P) {
            H.href = e;
            u(H, "click", C)
        } else {
            H.parentNode.removeChild(H);
            H = null
        }
        if (E != null) {
            u(E, "click", C)
        }
        J.style.zIndex = window._dlgBaseDepth++;
        J.style.left = 0.5 * (D - J.clientWidth) + "px";
        A = parseInt(0.45 * (M - J.clientHeight));
        J.style.top = A + "px";
        MData(J, "ffixTop", A);
        if (o) {
            k()
        }
        return J
    };
    var j = function(s, q, t, r, p, u, n, m, o) {
        return i(s, q, t, r, p, u, null, null, null, n, m, o)
    };
    var f = function(v, o, q) {
        if (c(o)) {
            o = null
        }
        if (c(q)) {
            q = 3000
        }
        var r = '<div class="mNotice">	<span></span></div>';
        _q("body").insertAdjacentHTML("beforeEnd", r);
        h();
        var n = _q("div.mNotice:last-of-type", _q("body")),
        m = _q("span", n),
        s = window.innerWidth,
        p = window.innerHeight,
        u = 0;
        m.innerHTML = v;
        if (o != null) {
            _addClass(m, o)
        }
        n.style.zIndex = window._dlgBaseDepth++;
        n.style.left = 0.5 * (s - n.clientWidth) + "px";
        u = parseInt(0.45 * (p - n.clientHeight));
        n.style.top = u + "px";
        MData(n, "ffixTop", u);
        _setTimeout(function() {
            n.parentNode.removeChild(n);
            window._dlgBaseDepth--
        },
        q);
        return n
    };
    var b = function(u, D, H, n) {
        if (c(D)) {
            D = 295
        }
        if (c(H)) {
            H = true
        }
        if (c(n)) {
            n = true
        }
        h();
        var y = window.innerWidth,
        E = window.innerHeight,
        s = null,
        A = null;
        if (n) {
            A = g()
        }
        s = '<div class="mImgPopup"><figure></figure><a class="x">X</a></div>';
        _q("body").insertAdjacentHTML("beforeEnd", s);
        var z = _q("div.mImgPopup:last-of-type", _q("body")),
        w = _q("figure", z),
        B = _q("span", z),
        C = _q("a.x", z),
        y = window.innerWidth,
        E = window.innerHeight,
        v = 0,
        F = [],
        r = function(t, m, p) {
            t.addEventListener(m, p);
            F.push({
                o: t,
                e: m,
                f: p
            })
        },
        x = function(p) {
            while (F.length) {
                var m = F.shift();
                m.o.removeEventListener(m.e, m.f)
            }
            z.parentNode.removeChild(z);
            window._dlgBaseDepth--;
            if (A == null) {
                return
            }
            A.parentNode.removeChild(A);
            window._dlgBaseDepth--;
            k(false)
        },
        o = function(J) {
            var p = J.currentTarget,
            m = p.width,
            t = p.height,
            I = 1;
            w.appendChild(p);
            if (m > D) {
                I = m / D
            }
            w.style.height = z.style.height = p.style.height = parseInt(t / I) + "px";
            w.style.width = z.style.width = p.style.width = parseInt(m / I) + "px";
            q()
        },
        q = function() {
            z.style.zIndex = window._dlgBaseDepth++;
            z.style.left = 0.5 * (y - z.clientWidth) + "px";
            v = 0.5 * (E - z.clientHeight);
            z.style.top = v + "px";
            MData(z, "ffixTop", v);
            if (n) {
                k()
            }
        };
        q();
        if (H) {
            C.href = e;
            r(C, "click", x)
        } else {
            C.parentNode.removeChild(C);
            C = null
        }
        if (A != null) {
            r(A, "click", x)
        }
        var G = new Image;
        r(G, "load", o);
        G.src = u;
        return z
    };
    var l = function(r, t) {
        if (_q("#mLoading")) {
            return
        }
        if (c(r)) {
            r = ""
        }
        if (c(t)) {
            t = false
        }
        h();
        var q = window.innerWidth,
        s = window.innerHeight,
        p = null,
        n = null;
        if (t) {
            n = g();
            n.id = "mLoadingModal"
        }
        p = '<div id="mLoading"><div class="lbk"></div><div class="lcont">' + r + "</div></div>";
        _q("body").insertAdjacentHTML("beforeEnd", p);
        var o = _q("#mLoading");
        o.style.top = (_q("body").scrollTop + 0.5 * (s - o.clientHeight)) + "px";
        o.style.left = 0.5 * (q - o.clientWidth) + "px";
        return o
    };
    var d = function(u, n, r) {
        if (c(u)) {
            u = null
        }
        if (c(n)) {
            n = true
        }
        if (c(r)) {
            r = true
        }
        h();
        var y = window.innerWidth,
        q = window.innerHeight,
        x = null,
        o = null;
        if (r) {
            o = g()
        }
        x = '<div class="mDialog freeSet">' + u + '<a class="x">X</a></div>';
        _q("body").insertAdjacentHTML("beforeEnd", x);
        x = null;
        var w = _q("div.mDialog:last-of-type", _q("body")),
        v = _q("a.x", w),
        A = 0,
        s = [],
        p = function(B, m, t) {
            B.addEventListener(m, t);
            s.push({
                o: B,
                e: m,
                f: t
            })
        },
        z = function(t) {
            while (s.length) {
                var m = s.shift();
                m.o.removeEventListener(m.e, m.f)
            }
            w.parentNode.removeChild(w);
            window._dlgBaseDepth--;
            if (o == null) {
                return
            }
            o.parentNode.removeChild(o);
            window._dlgBaseDepth--;
            k(false)
        };
        if (n) {
            v.href = e;
            p(v, "click", z)
        } else {
            v.parentNode.removeChild(v);
            v = null
        }
        if (o != null) {
            p(o, "click", z)
        }
        w.style.zIndex = window._dlgBaseDepth++;
        w.style.left = 0.5 * (y - w.clientWidth) + "px";
        A = parseInt(0.45 * (q - w.clientHeight));
        w.style.top = A + "px";
        MData(w, "ffixTop", A);
        if (r) {
            k()
        }
        return w
    };
    var a = {
        ICON_TYPE_SUCC: "succ",
        ICON_TYPE_WARN: "warn",
        ICON_TYPE_FAIL: "fail",
        BUTTON_STYLE_ON: "on",
        BUTTON_STYLE_OFF: "off",
        confirm: i,
        alert: j,
        notice: f,
        popupImage: b,
        showLoading: l,
        popupCustom: d
    };
    return a
} ())
MLoading = {
    show: MDialog.showLoading,
    hide: function() {
        var b = _q("#mLoading");
        if (b) {
            b.parentNode.removeChild(b)
        }
        var a = _q("#mLoadingModal");
        if (a) {
            a.parentNode.removeChild(a)
        }
    }
}