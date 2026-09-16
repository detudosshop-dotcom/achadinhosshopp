/* QR Code — gerador local (modo byte, nível L, versões 1–20).
   Existe para remover a dependência de api.qrserver.com na tela do Pix:
   se o gateway não devolver a imagem do QR, geramos aqui mesmo, sem rede.
   Um bloqueador de anúncio ou uma rede ruim não podem derrubar o QR
   justamente no momento em que o cliente vai pagar.

   API:  window.PixQR.svg(texto, tamanhoPx)  → string SVG
   Implementa ISO/IEC 18004 (Reed-Solomon + máscara + BCH). */
;(function (w) {
  'use strict'

  /* ── Campo de Galois GF(256), polinômio 0x11d ───────────────────────── */
  var EXP = new Array(512), LOG = new Array(256)
  ;(function () {
    var x = 1
    for (var i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d }
    for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255]
  })()
  function gmul(a, b) { return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]] }

  /* Polinômio gerador de grau `deg` = produto de (x + a^i) */
  function rsGenPoly(deg) {
    var poly = [1]
    for (var i = 0; i < deg; i++) {
      var next = []
      for (var k = 0; k <= poly.length; k++) next[k] = 0
      for (var j = 0; j < poly.length; j++) {
        next[j] ^= poly[j]                       // poly * x
        next[j + 1] ^= gmul(poly[j], EXP[i])     // poly * a^i
      }
      poly = next
    }
    return poly
  }

  /* Divisão polinomial → devolve só os códigos de correção */
  function rsEC(data, ecLen) {
    var gen = rsGenPoly(ecLen), res = [], i, j
    for (i = 0; i < data.length; i++) res[i] = data[i]
    for (i = 0; i < ecLen; i++) res[data.length + i] = 0
    for (i = 0; i < data.length; i++) {
      var f = res[i]
      if (f !== 0) for (j = 0; j < gen.length; j++) res[i + j] ^= gmul(gen[j], f)
    }
    return res.slice(data.length)
  }

  /* Blocos RS do nível L: [ecPorBloco, nBlocos1, dadosPorBloco1, nBlocos2, dadosPorBloco2] */
  var RSL = {
    1:  [7,  1, 19, 0, 0],   2:  [10, 1, 34, 0, 0],   3:  [15, 1, 55, 0, 0],
    4:  [20, 1, 80, 0, 0],   5:  [26, 1, 108, 0, 0],  6:  [18, 2, 68, 0, 0],
    7:  [20, 2, 78, 0, 0],   8:  [24, 2, 97, 0, 0],   9:  [30, 2, 116, 0, 0],
    10: [18, 2, 68, 2, 69],  11: [20, 4, 81, 0, 0],   12: [24, 2, 92, 2, 93],
    13: [26, 4, 107, 0, 0],  14: [30, 3, 115, 1, 116],15: [22, 5, 87, 1, 88],
    16: [24, 5, 98, 1, 99],  17: [28, 1, 107, 5, 108],18: [30, 5, 120, 1, 121],
    19: [28, 3, 113, 4, 114],20: [28, 3, 107, 5, 108]
  }

  /* Centros dos padrões de alinhamento por versão */
  var ALIGN = [
    [], [], [6,18], [6,22], [6,26], [6,30], [6,34],
    [6,22,38], [6,24,42], [6,26,46], [6,28,50], [6,30,54], [6,32,58], [6,34,62],
    [6,26,46,66], [6,26,48,70], [6,26,50,74], [6,30,54,78], [6,30,56,82],
    [6,30,58,86], [6,34,62,90]
  ]

  function utf8(str) {
    var out = [], i, c
    for (i = 0; i < str.length; i++) {
      c = str.charCodeAt(i)
      if (c < 0x80) out.push(c)
      else if (c < 0x800) { out.push(0xc0 | (c >> 6), 0x80 | (c & 63)) }
      else if (c < 0xd800 || c >= 0xe000) { out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)) }
      else { // par substituto
        i++
        c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff))
        out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63))
      }
    }
    return out
  }

  function totalData(v) { var r = RSL[v]; return r[1] * r[2] + r[3] * r[4] }

  function pickVersion(len) {
    for (var v = 1; v <= 20; v++) {
      var overhead = 4 + (v < 10 ? 8 : 16)
      if (totalData(v) * 8 >= overhead + len * 8) return v
    }
    return 0
  }

  /* Monta os códigos finais já intercalados (dados + correção) */
  function createData(version, bytes) {
    var rs = RSL[version], ecLen = rs[0], n1 = rs[1], d1 = rs[2], n2 = rs[3], d2 = rs[4]
    var td = totalData(version), buf = [], i, j, k

    function put(v, len) { for (var b = 0; b < len; b++) buf.push((v >>> (len - 1 - b)) & 1) }
    put(4, 4)                                        // modo byte
    put(bytes.length, version < 10 ? 8 : 16)         // contador
    for (i = 0; i < bytes.length; i++) put(bytes[i], 8)

    var cap = td * 8
    for (i = 0; i < 4 && buf.length < cap; i++) buf.push(0)   // terminador
    while (buf.length % 8 !== 0) buf.push(0)

    var cw = []
    for (i = 0; i < buf.length; i += 8) {
      var b = 0
      for (j = 0; j < 8; j++) b = (b << 1) | buf[i + j]
      cw.push(b)
    }
    var pad = [0xEC, 0x11], p = 0
    while (cw.length < td) cw.push(pad[p++ & 1])

    var blocks = [], off = 0
    for (k = 0; k < n1; k++) { blocks.push(cw.slice(off, off + d1)); off += d1 }
    for (k = 0; k < n2; k++) { blocks.push(cw.slice(off, off + d2)); off += d2 }
    var ecs = blocks.map(function (b) { return rsEC(b, ecLen) })

    var maxD = Math.max(d1, n2 ? d2 : 0), out = []
    for (i = 0; i < maxD; i++) for (k = 0; k < blocks.length; k++) if (i < blocks[k].length) out.push(blocks[k][i])
    for (i = 0; i < ecLen; i++) for (k = 0; k < ecs.length; k++) out.push(ecs[k][i])
    return out
  }

  function maskFn(m, i, j) {
    switch (m) {
      case 0: return (i + j) % 2 === 0
      case 1: return i % 2 === 0
      case 2: return j % 3 === 0
      case 3: return (i + j) % 3 === 0
      case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0
      case 5: return ((i * j) % 2) + ((i * j) % 3) === 0
      case 6: return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0
      default: return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0
    }
  }

  function bitLen(n) { var c = 0; while (n !== 0) { c++; n >>>= 1 } return c }
  var G15 = 0x537, G18 = 0x1f25
  function bchFormat(d) {
    var x = d << 10
    while (bitLen(x) - bitLen(G15) >= 0) x ^= G15 << (bitLen(x) - bitLen(G15))
    return ((d << 10) | x) ^ 0x5412
  }
  function bchVersion(v) {
    var x = v << 12
    while (bitLen(x) - bitLen(G18) >= 0) x ^= G18 << (bitLen(x) - bitLen(G18))
    return (v << 12) | x
  }

  function build(version, data, mask) {
    var size = version * 4 + 17, i, j, r, c
    var m = [], fn = []
    for (i = 0; i < size; i++) { m[i] = []; fn[i] = [] ; for (j = 0; j < size; j++) { m[i][j] = null; fn[i][j] = false } }

    function setF(r2, c2, v) { m[r2][c2] = v; fn[r2][c2] = true }

    // Localizadores + separadores
    function finder(r0, c0) {
      for (r = -1; r <= 7; r++) for (c = -1; c <= 7; c++) {
        var rr = r0 + r, cc = c0 + c
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue
        var on = (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                 (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
                 (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        setF(rr, cc, on)
      }
    }
    finder(0, 0); finder(0, size - 7); finder(size - 7, 0)

    // Alinhamento — precisa vir ANTES da temporização. Os centros que caem
    // sobre as linhas de temporização (ex.: (6,22) na v7) são legítimos e têm
    // de ser desenhados; só os que colidem com um localizador é que são
    // omitidos. Testar contra a temporização já desenhada apagaria dois
    // padrões por símbolo e nenhum leitor decodificaria da v7 pra cima.
    var pos = ALIGN[version]
    for (i = 0; i < pos.length; i++) for (j = 0; j < pos.length; j++) {
      var pr = pos[i], pc = pos[j]
      if (fn[pr][pc]) continue                       // já ocupado por um localizador
      for (r = -2; r <= 2; r++) for (c = -2; c <= 2; c++) {
        setF(pr + r, pc + c, Math.max(Math.abs(r), Math.abs(c)) !== 1)
      }
    }

    // Temporização — preenche só o que o alinhamento não ocupou
    for (i = 8; i < size - 8; i++) {
      if (!fn[6][i]) setF(6, i, i % 2 === 0)
      if (!fn[i][6]) setF(i, 6, i % 2 === 0)
    }

    // Reserva das áreas de formato e o módulo escuro
    for (i = 0; i < 9; i++) { if (!fn[8][i]) setF(8, i, false); if (!fn[i][8]) setF(i, 8, false) }
    for (i = 0; i < 8; i++) { if (!fn[8][size - 1 - i]) setF(8, size - 1 - i, false); if (!fn[size - 1 - i][8]) setF(size - 1 - i, 8, false) }
    setF(size - 8, 8, true)                          // módulo escuro

    // Informação de versão (v >= 7)
    if (version >= 7) {
      var vb = bchVersion(version)
      for (i = 0; i < 18; i++) {
        var bit = ((vb >> i) & 1) === 1
        setF(Math.floor(i / 3), size - 11 + (i % 3), bit)
        setF(size - 11 + (i % 3), Math.floor(i / 3), bit)
      }
    }

    // Dados em ziguezague, já aplicando a máscara
    var inc = -1, row = size - 1, bitIdx = 0, byteIdx = 0
    for (var col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--
      for (;;) {
        for (var k = 0; k < 2; k++) {
          var cc2 = col - k
          if (m[row][cc2] === null) {
            var dark = false
            if (byteIdx < data.length) dark = ((data[byteIdx] >>> (7 - bitIdx)) & 1) === 1
            if (maskFn(mask, row, cc2)) dark = !dark
            m[row][cc2] = dark
            bitIdx++
            if (bitIdx === 8) { bitIdx = 0; byteIdx++ }
          }
        }
        row += inc
        if (row < 0 || row >= size) { row -= inc; inc = -inc; break }
      }
    }

    // Informação de formato (nível L = 01)
    var fb = bchFormat((1 << 3) | mask)
    for (i = 0; i < 15; i++) {
      var b = ((fb >> i) & 1) === 1
      if (i < 6) m[i][8] = b
      else if (i < 8) m[i + 1][8] = b
      else m[size - 15 + i][8] = b

      if (i < 8) m[8][size - 1 - i] = b
      else if (i < 9) m[8][15 - i - 1 + 1] = b
      else m[8][15 - i - 1] = b
    }
    m[size - 8][8] = true

    return m
  }

  /* Penalidades ISO — escolhe a máscara que gera o código mais legível */
  function penalty(m) {
    var size = m.length, s = 0, i, j, k, run, dark = 0

    for (i = 0; i < size; i++) {                       // N1: sequências
      run = 1
      for (j = 1; j < size; j++) {
        if (m[i][j] === m[i][j - 1]) run++
        else { if (run >= 5) s += 3 + (run - 5); run = 1 }
      }
      if (run >= 5) s += 3 + (run - 5)
    }
    for (j = 0; j < size; j++) {
      run = 1
      for (i = 1; i < size; i++) {
        if (m[i][j] === m[i - 1][j]) run++
        else { if (run >= 5) s += 3 + (run - 5); run = 1 }
      }
      if (run >= 5) s += 3 + (run - 5)
    }
    for (i = 0; i < size - 1; i++) for (j = 0; j < size - 1; j++) {  // N2: blocos 2×2
      var v = m[i][j]
      if (v === m[i][j + 1] && v === m[i + 1][j] && v === m[i + 1][j + 1]) s += 3
    }
    var pat = [true, false, true, true, true, false, true]            // N3: 1:1:3:1:1
    function hasPat(get) {
      for (var p = 0; p < 7; p++) if (get(p) !== pat[p]) return false
      return true
    }
    for (i = 0; i < size; i++) for (j = 0; j <= size - 7; j++) {
      if (hasPat(function (k2) { return m[i][j + k2] })) {
        var beforeOK = true, afterOK = true
        for (k = 1; k <= 4; k++) { if (j - k >= 0 && m[i][j - k]) { beforeOK = false; break } }
        for (k = 1; k <= 4; k++) { if (j + 6 + k < size && m[i][j + 6 + k]) { afterOK = false; break } }
        if (beforeOK || afterOK) s += 40
      }
    }
    for (j = 0; j < size; j++) for (i = 0; i <= size - 7; i++) {
      if (hasPat(function (k2) { return m[i + k2][j] })) {
        var bOK = true, aOK = true
        for (k = 1; k <= 4; k++) { if (i - k >= 0 && m[i - k][j]) { bOK = false; break } }
        for (k = 1; k <= 4; k++) { if (i + 6 + k < size && m[i + 6 + k][j]) { aOK = false; break } }
        if (bOK || aOK) s += 40
      }
    }
    for (i = 0; i < size; i++) for (j = 0; j < size; j++) if (m[i][j]) dark++   // N4: proporção
    var pct = Math.abs((dark * 100) / (size * size) - 50)
    s += Math.floor(pct / 5) * 10
    return s
  }

  function make(text) {
    var bytes = utf8(String(text))
    var version = pickVersion(bytes.length)
    if (!version) throw new Error('Texto longo demais para o QR')
    var data = createData(version, bytes)
    var best = null, bestScore = Infinity
    for (var mk = 0; mk < 8; mk++) {
      var m = build(version, data, mk)
      var sc = penalty(m)
      if (sc < bestScore) { bestScore = sc; best = m }
    }
    return best
  }

  /* SVG com 4 módulos de "zona quieta" — exigida pela norma pra leitura */
  function svg(text, px) {
    var m = make(text), n = m.length, q = 4, total = n + q * 2
    var d = ''
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
      if (m[i][j]) d += 'M' + (j + q) + ' ' + (i + q) + 'h1v1h-1z'
    }
    var size = px || 190
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size +
      '" viewBox="0 0 ' + total + ' ' + total + '" shape-rendering="crispEdges" role="img" aria-label="QR Code Pix">' +
      '<rect width="' + total + '" height="' + total + '" fill="#fff"/>' +
      '<path fill="#000" d="' + d + '"/></svg>'
  }

  w.PixQR = { make: make, svg: svg }
})(window)
