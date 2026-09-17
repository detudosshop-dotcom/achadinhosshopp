﻿﻿﻿﻿/* =========================================================
   Plantão Automotivo — PDP (Vonder LAV1300)
   Página única: nenhuma interação abre outra aba.
   ========================================================= */
(function () {
  'use strict';

  /* ------------------------- utilitários ------------------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const _ID_MAP = { cpf: 'fCpf', nome: 'fNome', email: 'fEmail', tel: 'fFone' };
  const el = id => document.getElementById(_ID_MAP[id] || id);
  const S = { payMethod: 'pix', cardData: null, step: 1 };

  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const money = n => BRL.format(n);

  /** "147,59" -> 'R$ 147,<sup>59</sup>' (centavos sobrescritos, com vírgula — padrão do layout) */
  const supPrice = txt => {
    const [int, dec = '00'] = String(txt).split(',');
    return `R$ ${int},<sup>${dec}</sup>`;
  };

  /** Escapa texto vindo do usuário antes de ir para innerHTML. */
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const plural = n => `${n} unidade${n > 1 ? 's' : ''}`;

  let PRODUCT = "Lavadora de Alta Pressão Vonder Leve LAV1300 Amarela e Preta 1200W";

  const _im = (url, alt) => ({ thumb: url, full: url, zoom: url, w: 800, h: 800, zw: 1000, zh: 1000, type: 'img', alt });
  const _vid = (src, poster, alt) => ({ thumb: poster, poster: poster, src: src, w: 720, h: 1280, type: 'video', alt });

  const P = 'assets/products/';
  const PF = 'assets/reviews/shopee/';

  /* Galeria principal — Lavadora Vonder LAV1300 (127V) */
  /* Galeria oficial Mercado Livre - Lavadora Vonder LAV1300 */
  const ML_LAV1300_GALLERY = [
    _im(P + 'vonder-lav1300-ml-1.jpg', 'Lavadora de alta pressao Vonder Leve LAV1300 amarela e preta 1200W - frente'),
    _im(P + 'vonder-lav1300-ml-2.jpg', 'Lavadora Vonder LAV1300 - acessorios inclusos'),
    _im(P + 'vonder-lav1300-ml-3.jpg', 'Lavadora Vonder LAV1300 - detalhes tecnicos'),
    _im(P + 'vonder-lav1300-ml-4.jpg', 'Lavadora Vonder LAV1300 - motor e especificacoes'),
    _im(P + 'vonder-lav1300-ml-5.jpg', 'Lavadora Vonder LAV1300 - vista lateral'),
    _im(P + 'vonder-lav1300-ml-6.jpg', 'Lavadora Vonder LAV1300 - mangueira e pistola'),
    _im(P + 'vonder-lav1300-ml-7.jpg', 'Lavadora Vonder LAV1300 - dimensoes e peso'),
    _im(P + 'vonder-lav1300-ml-8.jpg', 'Lavadora Vonder LAV1300 - em uso limpeza'),
    _im(P + 'vonder-lav1300-ml-9.jpg', 'Lavadora Vonder LAV1300 - embalagem original')
  ];

  const GAL_127V = ML_LAV1300_GALLERY;
  const GAL_220V = ML_LAV1300_GALLERY;

  /* 127V e 220V usam a galeria oficial completa */
  const GALLERY = GAL_127V;
  let COLOR_GALLERIES = { '127V': GAL_127V, '220V': GAL_220V };
  let activeGallery = GALLERY;

  const PHOTOS = GALLERY.filter(g => g.type === 'img');
  const photoIndex = (() => { let n = -1; return GALLERY.map(g => (g.type === 'img' ? ++n : -1)); })();

  /* Imagens dos cards relacionados / da loja — outras ferramentas Vonder */
  const REL_IMGS = [
    P + 'vonder-lavadora-lav1200.webp',          // 1
    P + 'vonder-lavadora-lav1600.webp',          // 2
    P + 'vonder-lavadora-lav2000.webp',          // 3
    P + 'vonder-lavadora-aspirador-combo.webp',  // 4
    P + 'vonder-kit-ferramentas-128.webp',       // 5
    P + 'vonder-kit-ferramentas-163.webp',       // 6
    P + 'vonder-esmerilhadeira-eav860.webp',     // 7
    P + 'vonder-inversor-solda-im125.webp',      // 8
    P + 'vonder-furadeira-pfv238i.webp',         // 9
    P + 'vonder-parafusadeira-pfv238.webp',      // 10
    P + 'vonder-esmerilhadeira-eav650.webp',     // 11
    P + 'vonder-serra-marmore-smv1300.webp',     // 12
    P + 'vonder-bico-snow-foam.webp',            // 13
    P + 'vonder-snow-foam-shampoo.webp',         // 14
    P + 'vonder-trena-5m.webp',                  // 15
    P + 'vonder-chave-allen.webp',               // 16
    P + 'vonder-chave-catraca.webp',             // 17
    P + 'vonder-lavadora-lav1300.webp'           // 18 — produto principal
  ];

  /* Card do PRODUTO PRINCIPAL (LAV1300).
     Quando o lead navega para outro produto (?id=...), este card é injetado
     na PRIMEIRA posição dos carrosséis para trazer ele de volta pra oferta principal. */
  const MAIN_ID = '5';
  const MAIN_CARD = {
    img: 18, id: MAIN_ID,
    t: 'Lavadora de Alta Pressão Vonder Leve LAV1300 Amarela e Preta 1200W',
    p: '65,00', old: '225,00', off: '71% OFF', sold: '+16mil vendidos', pix: 1, ship: 1, full: 1
  };

  // Catálogo 1:1 com o zip inicial (nomes, preços e "de/por" exatos).
  const RELATED = [
    { img: 1, id: 14,  t: 'Lavadora De Alta Pressão 1200W 1300 Libras LAV1200 Vonder', p: '60,00', old: '280,00', off: '79% OFF', sold: '+200 vendidos', ship: 1 },
    { img: 2, id: 15,  t: 'Lavadora De Alta Pressão Vonder 1400W LAV 1600 Amarelo', p: '70,00', old: '245,00', off: '71% OFF', sold: '+15mil vendidos', ship: 1 },
    { img: 3, id: 16,  t: 'Lavadora De Alta Pressão LAV 2000 Vonder Cor Amarelo', p: '100,00', old: '358,00', off: '72% OFF', sold: '+1k vendidos', pix: 1, ship: 1 },
    { img: 4, id: 17,  t: 'Kit Lavadora Alta Pressão 1200W + Aspirador Pó e Água Vonder', p: '120,00', old: '400,00', off: '70% OFF', sold: '+500 vendidos', ship: 1, full: 1 },
    { img: 5, id: 8,  t: 'Kit Jogo Ferramentas Maleta 128 Peças Soquetes Chaves Vonder', p: '68,00', old: '300,00', off: '77% OFF', sold: '+180 vendidos', ship: 1 },
    { img: 6, id: 12,  t: 'Jogo De Ferramentas Com 163 Peças Vonder Reparos Geral', p: '60,00', old: '199,90', off: '70% OFF', sold: '+5 vendidos', ship: 1 },
    { img: 7, id: 1,  t: 'Esmerilhadeira Angular Vonder EAV 860N 860W + Acessório', p: '58,00', old: '244,00', off: '76% OFF', sold: '+4k vendidos', ship: 1 },
    { img: 8, id: 2,  t: 'Inversor Para Solda Eletrodo e TIG IM125 c/ Máscara Automática Vonder', p: '78,00', old: '399,00', off: '80% OFF', sold: '+770 vendidos', ship: 1, full: 1 },
    { img: 9, id: 4,  t: 'Furadeira Parafusadeira Impacto Bateria PFV238i Vonder', p: '54,00', old: '175,00', off: '69% OFF', sold: '+5k vendidos', ship: 1, full: 1 },
    { img: 10, id: 6, t: 'Parafusadeira e Furadeira a Bateria PFV 238 c/ Maleta e Acessórios Vonder', p: '58,00', old: '149,99', off: '61% OFF', sold: '+3k vendidos', ship: 1 },
    { img: 11, id: 11, t: 'Esmerilhadeira Angular Vonder EAV 650 50Hz/60Hz Cor Amarelo', p: '48,00', old: '117,00', off: '59% OFF', sold: '+3k vendidos', ship: 1, full: 1 },
    { img: 12, id: 13, t: 'Serra Mármore Profissional Vonder SMV1300s 1300W', p: '60,00', old: '198,00', off: '70% OFF', sold: '+8k vendidos', ship: 1, full: 1 }
  ];
  const STORE = [
    { img: 4, id: 17,  t: 'Kit Lavadora Alta Pressão 1200W + Aspirador Pó e Água Vonder', p: '120,00', old: '400,00', off: '70% OFF', sold: '+500 vendidos', pix: 1, ship: 1 },
    { img: 3, id: 16,  t: 'Lavadora De Alta Pressão LAV 2000 Vonder Cor Amarelo', p: '100,00', old: '358,00', off: '72% OFF', sold: '+1k vendidos', ship: 1 },
    { img: 8, id: 2,  t: 'Inversor Para Solda Eletrodo e TIG IM125 Vonder', p: '78,00', old: '399,00', off: '80% OFF', sold: '+770 vendidos', ship: 1 },
    { img: 2, id: 15,  t: 'Lavadora De Alta Pressão Vonder 1400W LAV 1600 Amarelo', p: '70,00', old: '245,00', off: '71% OFF', sold: '+15mil vendidos', ship: 1 },
    { img: 5, id: 8,  t: 'Kit Jogo Ferramentas Maleta 128 Peças Vonder', p: '68,00', old: '300,00', off: '77% OFF', sold: '+180 vendidos', ship: 1 },
    { img: 6, id: 12,  t: 'Jogo De Ferramentas Com 163 Peças Vonder', p: '60,00', old: '199,90', off: '70% OFF', sold: '+5 vendidos', ship: 1 },
    { img: 12, id: 13, t: 'Serra Mármore Profissional Vonder SMV1300s 1300W', p: '60,00', old: '198,00', off: '70% OFF', sold: '+8k vendidos', ship: 1 },
    { img: 10, id: 6, t: 'Parafusadeira e Furadeira a Bateria PFV 238 Vonder', p: '58,00', old: '149,99', off: '61% OFF', sold: '+3k vendidos', ship: 1 }
  ];
  const ASIDE = [
    { img: 4, id: 17,  t: 'Kit Lavadora 1200W + Aspirador Pó e Água Vonder', p: '120,00', old: '400,00', off: '70% OFF', sold: '+500 vendidos', pix: 1, ship: 1 },
    { img: 6, id: 12,  t: 'Jogo De Ferramentas 163 Peças Vonder', p: '60,00', old: '199,90', off: '70% OFF', sold: '+5 vendidos', ship: 1 },
    { img: 10, id: 6, t: 'Parafusadeira/Furadeira PFV 238 c/ Maleta Vonder', p: '58,00', old: '149,99', off: '61% OFF', sold: '+3k vendidos', ship: 1, full: 1 },
    { img: 5, id: 8,  t: 'Kit Ferramentas Maleta 128 Peças Vonder', p: '68,00', old: '300,00', off: '77% OFF', sold: '+180 vendidos', ship: 1 }
  ];

  /* Avaliações — cada comentário com sua própria mídia (imagens/vídeos), sem repetir. */
  const RV  = 'assets/reviews/';
  const RVS = 'assets/reviews/shopee/';
  const _ri = src => ({ type: 'img', src, thumb: src, w: 800, h: 800 });
  const _rv = (src, poster, dur) => ({ type: 'video', src, poster, thumb: poster, dur });

  const REVIEWS = [
    { rate: 5, country: 'Brasil', when: 'Há 2 meses', ageDays: 60, likes: 2100,
      text: 'Excelente lavadora de pressão, super potente, veio com acessório de espuma e uma boa extensão para a tomada. É uma lavadora muito boa, super recomendo. Pelo preço que paguei aqui vale muito, ainda mais por ser Vonder — marca conhecida facilita em possíveis reparos.',
      media: [ _rv(RV + 'videos/v1.mp4', RVS + 'v1_poster.webp', '0:26'), _ri(RVS + 'p1_1.webp'), _ri(RVS + 'p1_3.webp'), _ri(RVS + 'p1_4.webp'), _ri(RVS + 'p1_5.webp') ] },
    { rate: 5, country: 'Brasil', when: 'Há 3 meses', ageDays: 90, likes: 1200,
      text: 'Entrega rápida, chegou sem nenhuma avaria! Já usamos 2x para lavar os carros, é muito forte, jato bem potente, excelente! Custo-benefício ótimo, marca ótima, preço ótimo, recomendo a aquisição — tudo funciona perfeitamente.',
      media: [ _rv(RV + 'videos/v2.mp4', RVS + 'v2_poster.webp', '0:19'), _ri(RVS + 'p2_1.webp'), _ri(RVS + 'p2_2.webp'), _ri(RVS + 'p2_3.webp') ] },
    { rate: 5, country: 'Brasil', when: 'Há 4 meses', ageDays: 120, likes: 980,
      text: 'Vendedor postou rápido e chegou rápido! Geralmente as entregas demoram uma semana ou mais, essa chegou em 4 dias. Máquina muito boa, gatilho macio, conexões leves e uma boa pressão da água. Gostei bastante!',
      media: [ _rv(RV + 'videos/v3.mp4', RVS + 'v3_poster.webp', '0:08'), _ri(RVS + 'p3_1.webp') ] },
    { rate: 5, country: 'Brasil', when: 'Há 5 meses', ageDays: 150, likes: 3100,
      text: 'A lavadora veio dentro do prazo e sem avarias! No teste que fiz foi ótima, tem bastante pressão. Excelente custo-benefício! Recomendo o produto e o vendedor.',
      media: [ _rv(RV + 'videos/v4.mp4', RVS + 'v4_poster.webp', '0:36'), _ri(RVS + 'p4_1.webp'), _ri(RVS + 'p4_2.webp'), _ri(RVS + 'p4_3.webp'), _ri(RVS + 'p4_4.webp'), _ri(RVS + 'p4_5.webp') ] },
    { rate: 5, country: 'Brasil', when: 'Há 6 meses', ageDays: 180, likes: 321,
      text: 'Amei a minha compra, chegou super rápido e o produto é igual à descrição do vídeo. Super recomendo!',
      media: [ _rv(RV + 'videos/v5.mp4', RVS + 'v5_poster.webp', '0:09'), _ri(RVS + 'p5_1.webp') ] },
    { rate: 5, country: 'Brasil', when: 'Há 7 meses', ageDays: 210, likes: 482,
      text: 'Chegou num prazo bom, fácil de montar, boa pressão e funciona perfeitamente. Recomendo!',
      media: [ _rv(RV + 'videos/v6.mp4', RVS + 'v6_poster.webp', '0:10'), _ri(RVS + 'p6_1.webp') ] },
    { rate: 5, country: 'Brasil', when: 'Há 2 meses', ageDays: 64, likes: 418,
      text: 'Lavadora de alta pressão excelente! Lavou o carro e o quintal inteiro, potência absurda. Recomendo!',
      media: [ _ri(RV + 'review-prod1.webp') ] },
    { rate: 5, country: 'Brasil', when: 'Há 3 meses', ageDays: 96, likes: 1300,
      text: 'Lavadora de pressão incrível, lavou meu quintal inteiro. A qualidade Vonder surpreendeu!',
      media: [ _ri(RV + 'review-prod2.webp') ] },
    { rate: 5, country: 'Brasil', when: 'Há 4 meses', ageDays: 132, likes: 276,
      text: 'Melhor custo-benefício. Chegou rápido e bem embalado, funciona muito bem.',
      media: [ _ri(RV + 'review-prod3.webp') ] },
    { rate: 5, country: 'Brasil', when: 'Há 5 meses', ageDays: 158, likes: 893,
      text: 'Veio tudo completo e bem embalado! Qualidade de verdade. Recomendo demais.',
      media: [ _ri(RV + 'review-prod4.webp') ] },
    { rate: 5, country: 'Brasil', when: 'Há 1 semana', ageDays: 7, likes: 212,
      text: 'Chegou rapidinho e a pressão é absurda pra uma lavadora dessa faixa! Lavei o carro inteiro em 15 minutos, tirou até aquela sujeira difícil do paralama. Recomendo demais!' },
    { rate: 5, country: 'Brasil', when: 'Há 2 semanas', ageDays: 14, likes: 336,
      text: 'Comprei pro meu marido de aniversário e ele surtou. Veio bem embalada, sem amassado nenhum. A mangueira é boa, o gatilho firme. Vale cada centavo.' },
    { rate: 5, country: 'Brasil', when: 'Há 3 semanas', ageDays: 21, likes: 479,
      text: 'Estava com o pé atrás por causa do preço, mas me surpreendeu MUITO. Já lavei o carro 3x e continua novinha.' },
    { rate: 4, country: 'Brasil', when: 'Há 1 mês', ageDays: 30, likes: 143,
      text: 'Boa pressão, compacta e leve. Só achei a mangueira um pouco curta, mas pro preço está ótimo.' }
  ];

  // Lista plana de toda a mídia (na ordem dos comentários) para a faixa "Opiniões com fotos".
  const REVIEW_MEDIA = REVIEWS.reduce((a, r) => a.concat(r.media || []), []);
  let currentReviewMedia = REVIEW_MEDIA;

  var PRODUCT_REVIEWS = {
    14:[{rate:5,country:"Brasil",when:"Ha 1 mes",ageDays:30,likes:312,text:"Chegou em perfeito estado. A pressao e otima para lavar carro e calcada. Custo-beneficio excelente!"},{rate:5,country:"Brasil",when:"Ha 2 meses",ageDays:60,likes:198,text:"Super potente! Limpei o quintal em 30 minutos. Facil de montar e usar. Recomendo muito!"},{rate:5,country:"Brasil",when:"Ha 3 meses",ageDays:90,likes:145,text:"Entrega rapida, produto de qualidade. Motor silencioso e pressao constante. Vonder e confiavel."},{rate:4,country:"Brasil",when:"Ha 4 meses",ageDays:120,likes:87,text:"Muito bom! So achei a mangueira curta, mas o produto e excelente. Vale a pena."},{rate:5,country:"Brasil",when:"Ha 5 meses",ageDays:150,likes:203,text:"Lavou meu carro, moto e calcada. Muito satisfeito. Produto identico a descricao."},{rate:5,country:"Brasil",when:"Ha 6 meses",ageDays:180,likes:167,text:"Perfeito! Funcionou na primeira ligada. Qualidade Vonder garantida!"}],
    15:[{rate:5,country:"Brasil",when:"Ha 1 mes",ageDays:25,likes:820,text:"A LAV1600 e incrivel! Pressao absurda, limpou a fachada inteira. Motor potente e silencioso."},{rate:5,country:"Brasil",when:"Ha 2 meses",ageDays:55,likes:634,text:"Produto fantastico. A mangueira de 5 metros faz toda a diferenca. Vonder nunca decepciona!"},{rate:5,country:"Brasil",when:"Ha 3 meses",ageDays:85,likes:491,text:"Ja testei outras marcas e essa e a melhor. Pressao uniforme, gatilho confortavel."},{rate:4,country:"Brasil",when:"Ha 4 meses",ageDays:115,likes:302,text:"Excelente produto! So melhoraria o cabo de forca. Pressao e funcionamento sao impecaveis."},{rate:5,country:"Brasil",when:"Ha 5 meses",ageDays:145,likes:578,text:"Comprei para lavar tratores na fazenda. Perfeito para uso intenso. Super recomendo!"},{rate:5,country:"Brasil",when:"Ha 6 meses",ageDays:175,likes:423,text:"Melhor lavadora que ja comprei. Dois anos de uso e nenhum problema. Vonder e top!"}],
    16:[{rate:5,country:"Brasil",when:"Ha 1 mes",ageDays:20,likes:445,text:"A LAV2000 e um monstro! Tirou tinta velha e removeu mofo da calcada. Qualidade premium!"},{rate:5,country:"Brasil",when:"Ha 2 meses",ageDays:50,likes:367,text:"Bomba de aluminio faz toda diferenca. Produto robusto para uso intenso. Vonder sabe o que faz!"},{rate:4,country:"Brasil",when:"Ha 3 meses",ageDays:80,likes:189,text:"Otimo produto, muito potente. Esquenta um pouco apos uso prolongado, normal em lavadoras profissionais."},{rate:5,country:"Brasil",when:"Ha 4 meses",ageDays:110,likes:298,text:"Uso diario em oficina mecanica. Aguentou muito bem. Motor potente e duravel."},{rate:5,country:"Brasil",when:"Ha 5 meses",ageDays:140,likes:412,text:"Lavei fachada, telhado e patio. Potencia incrivel. Chegou bem embalado e antes do prazo!"}],
    17:[{rate:5,country:"Brasil",when:"Ha 1 mes",ageDays:28,likes:213,text:"Kit incrivel! Lavadora potente e aspirador perfeito. Limpei o carro do inicio ao fim."},{rate:5,country:"Brasil",when:"Ha 2 meses",ageDays:58,likes:178,text:"Compra perfeita! Lavadora e aspirador de otima qualidade. O conjunto vale cada centavo."},{rate:4,country:"Brasil",when:"Ha 3 meses",ageDays:88,likes:134,text:"Muito bom kit. Boa pressao e bom reservatorio. Mangueira poderia ser maior."},{rate:5,country:"Brasil",when:"Ha 4 meses",ageDays:118,likes:92,text:"Ideal para lavar e secar o carro em casa. Produto resistente e de facil manuseio."},{rate:5,country:"Brasil",when:"Ha 5 meses",ageDays:148,likes:167,text:"Kit completo e funcional. Aspirador potente e lavadora excelente. Recomendo sem hesitar!"}],
    8: [{rate:5,country:"Brasil",when:"Ha 1 mes",ageDays:22,likes:356,text:"Kit completo para uso domestico. Qualidade do aco excelente, nenhuma chave emperrou."},{rate:5,country:"Brasil",when:"Ha 2 meses",ageDays:52,likes:287,text:"Maleta muito organizada, cada peca tem seu lugar. Soquetes com bom encaixe. Custo-beneficio Vonder!"},{rate:4,country:"Brasil",when:"Ha 3 meses",ageDays:82,likes:198,text:"Ferramentas de boa qualidade. Usei em manutencao do carro. So o alicate poderia ter acabamento melhor."},{rate:5,country:"Brasil",when:"Ha 4 meses",ageDays:112,likes:321,text:"Excelente kit! Usei para montar moveis e fazer manutencao geral. Todas as pecas encaixam perfeitamente."},{rate:5,country:"Brasil",when:"Ha 5 meses",ageDays:142,likes:245,text:"Melhor compra que fiz. A maleta organiza tudo e as ferramentas sao de qualidade. Excelente!"}],
    12:[{rate:5,country:"Brasil",when:"Ha 1 mes",ageDays:18,likes:89,text:"163 pecas e tudo de qualidade! Usei para manutencao em carros, motos e equipamentos."},{rate:4,country:"Brasil",when:"Ha 2 meses",ageDays:48,likes:67,text:"Kit bastante completo. Qualidade das ferramentas boa para o preco. Maleta bem organizada."},{rate:5,country:"Brasil",when:"Ha 3 meses",ageDays:78,likes:54,text:"Chegou bem embalado. Ferramentas resistentes e de bom acabamento. Para uso domestico e excelente."},{rate:5,country:"Brasil",when:"Ha 5 meses",ageDays:138,likes:78,text:"Super completo! Fiz revisao do meu carro em casa. Economizei muito. Qualidade Vonder garantida."}],
    1: [{rate:5,country:"Brasil",when:"Ha 1 mes",ageDays:15,likes:712,text:"Esmerilhadeira poderosa! 860W de pura potencia. Cortei ferro, ceramica e pedra sem problema."},{rate:5,country:"Brasil",when:"Ha 2 meses",ageDays:45,likes:534,text:"Produto excelente! Usei em obra e o desempenho foi perfeito. Vibracao controlada."},{rate:4,country:"Brasil",when:"Ha 3 meses",ageDays:75,likes:389,text:"Muito boa para o preco. O cabo poderia ser mais longo. No geral e excelente!"},{rate:5,country:"Brasil",when:"Ha 4 meses",ageDays:105,likes:467,text:"Uso profissional diario. Aguentou muito tranco em obra. Motor robusto, empunhadura confortavel."},{rate:5,country:"Brasil",when:"Ha 5 meses",ageDays:135,likes:298,text:"Comprei para cortar ceramica na obra. Cortes limpos e precisos. Nota 10!"},{rate:5,country:"Brasil",when:"Ha 6 meses",ageDays:165,likes:421,text:"Incrivel a durabilidade. Meses de uso intenso funcionando perfeitamente."}],
    2: [{rate:5,country:"Brasil",when:"Ha 1 mes",ageDays:20,likes:289,text:"Inversor de solda excelente! Bivolt automatico e muito pratico. A mascara de escurecimento automatico e de otima qualidade."},{rate:5,country:"Brasil",when:"Ha 2 meses",ageDays:50,likes:213,text:"Para uso domestico e pequenos projetos e perfeito. Solda eletrodo muito bem, TIG funciona otimo."},{rate:4,country:"Brasil",when:"Ha 3 meses",ageDays:80,likes:178,text:"Bom inversor de solda. Estavel e confiavel. A mascara e um plus excelente."},{rate:5,country:"Brasil",when:"Ha 4 meses",ageDays:110,likes:234,text:"Excelente custo-beneficio! Comprei para soldar portao e grade. Resultado profissional."},{rate:5,country:"Brasil",when:"Ha 5 meses",ageDays:140,likes:167,text:"Melhor compra do ano! Uso em oficina para pequenos reparos. Arco perfeito."}],
    4: [{rate:5,country:"Brasil",when:"Ha 1 mes",ageDays:12,likes:934,text:"A funcao de impacto faz toda a diferenca! Furei concreto sem esforco. Bateria dura bastante."},{rate:5,country:"Brasil",when:"Ha 2 meses",ageDays:42,likes:745,text:"Parafusadeira de impacto incrivel. Potente, leve e com excelente torque. Fiz uma reforma inteira."},{rate:5,country:"Brasil",when:"Ha 3 meses",ageDays:72,likes:621,text:"Produto top! Bateria 20V dura o dia todo. Mandril de aperto rapido e muito pratico!"},{rate:4,country:"Brasil",when:"Ha 4 meses",ageDays:102,likes:489,text:"Excelente produto! So sinto falta de segunda bateria no kit, mas no geral e fantastico."},{rate:5,country:"Brasil",when:"Ha 5 meses",ageDays:132,likes:567,text:"Uso profissional diario. A funcao impacto nao decepciona nem em alvenaria!"},{rate:5,country:"Brasil",when:"Ha 6 meses",ageDays:162,likes:412,text:"Melhor parafusadeira de impacto que ja usei. Leve, potente e muito duravel."}],
    6: [{rate:5,country:"Brasil",when:"Ha 1 mes",ageDays:17,likes:387,text:"Kit completo com maleta e muitos acessorios. A furadeira e potente para madeira e metal."},{rate:4,country:"Brasil",when:"Ha 2 meses",ageDays:47,likes:289,text:"Boa parafusadeira. Os acessorios inclusos sao de qualidade. Para uso normal e perfeita."},{rate:5,country:"Brasil",when:"Ha 3 meses",ageDays:77,likes:334,text:"Excelente! Usei para montar moveis planejados. Torque regulavel e muito util."},{rate:5,country:"Brasil",when:"Ha 4 meses",ageDays:107,likes:198,text:"A maleta organiza tudo muito bem. Ferramenta resistente e confiavel."},{rate:4,country:"Brasil",when:"Ha 5 meses",ageDays:137,likes:245,text:"Produto bom. Os bits e brocas tem qualidade. No geral e uma otima compra."}],
    11:[{rate:5,country:"Brasil",when:"Ha 1 mes",ageDays:19,likes:445,text:"Compacta mas muito potente para 650W! Cortei ceramica, metal e pedra com facilidade."},{rate:5,country:"Brasil",when:"Ha 2 meses",ageDays:49,likes:389,text:"Para uso domestico e perfeita. Vibracao baixa, disco encaixa facil e os cortes sao muito bons."},{rate:4,country:"Brasil",when:"Ha 3 meses",ageDays:79,likes:267,text:"Boa esmerilhadeira. Leve e facil de manusear. Para uso domestico e excelente."},{rate:5,country:"Brasil",when:"Ha 4 meses",ageDays:109,likes:312,text:"Usei para cortar ceramica na cozinha. Resultado impecavel! Motor nao esquenta."},{rate:5,country:"Brasil",when:"Ha 5 meses",ageDays:139,likes:278,text:"Produto de qualidade Vonder. Dura muito e entrega o que promete."}],
    13:[{rate:5,country:"Brasil",when:"Ha 1 mes",ageDays:23,likes:289,text:"Serra marmore incrivel! 1300W com cortes limpos e precisos em granito, marmore e ceramica."},{rate:5,country:"Brasil",when:"Ha 2 meses",ageDays:53,likes:234,text:"Produto excelente! Usei em reforma de banheiro inteiro. Cortes perfeitos sem lascar."},{rate:4,country:"Brasil",when:"Ha 3 meses",ageDays:83,likes:167,text:"Serra muito boa. Disco de fabrica tem boa qualidade. Para granito de 3cm foi excelente."},{rate:5,country:"Brasil",when:"Ha 4 meses",ageDays:113,likes:198,text:"Profissional de marmoraria. Produto de qualidade para uso semi-profissional."},{rate:5,country:"Brasil",when:"Ha 5 meses",ageDays:143,likes:145,text:"Perfeita para reforma! Cortei azulejos, porcelanatos e granito sem nenhum problema."}]
  };

  let currentReviews = REVIEWS;

  var _PP  = "assets/products/";
  var _PFS = "assets/reviews/shopee/";

  /* Galeria de fotos do produto (carousel principal) - min 4 fotos cada */
  var PRODUCT_GALLERY = {
    5:  ML_LAV1300_GALLERY,
    8:  [_im(_PP+"vonder-kit-ferramentas-128.webp","Kit 128 pecas"),_im(_PP+"vonder-kit-ferramentas-128-a.jpg","Kit 128 vista 2"),_im(_PP+"vonder-kit-ferramentas-128-b.jpg","Kit 128 vista 3"),_im(_PP+"vonder-kit-ferramentas-128-c.jpg","Kit 128 conteudo")],
    12: [_im(_PP+"vonder-kit-ferramentas-163.webp","Kit 163 pecas"),_im(_PP+"vonder-kit-ferramentas-163-b.jpg","Kit 163 vista 2"),_im(_PP+"vonder-kit-ferramentas-163-d.webp","Kit 163 detalhe"),_im(_PP+"vonder-kit-ferramentas-163-b.jpg","Kit 163 conteudo")],
    1:  [_im(_PP+"vonder-esmerilhadeira-eav860.webp","EAV860 frente"),_im(_PP+"vonder-esmerilhadeira-eav860-a.jpg","EAV860 vista 2"),_im(_PP+"vonder-esmerilhadeira-eav860-c.jpg","EAV860 vista 3"),_im(_PP+"vonder-esmerilhadeira-eav860-d.jpg","EAV860 em uso")],
    11: [_im(_PP+"vonder-esmerilhadeira-eav650.webp","EAV650 frente"),_im(_PP+"vonder-esmerilhadeira-eav650-a.jpg","EAV650 127V"),_im(_PP+"vonder-esmerilhadeira-eav650-b.jpg","EAV650 220V"),_im(_PP+"vonder-esmerilhadeira-eav650-c.jpg","EAV650 detalhe")],
    2:  [_im(_PP+"vonder-inversor-solda-im125.webp","IM125 frente"),_im(_PP+"vonder-inversor-solda-im125-b.jpg","IM125 vista 2"),_im(_PP+"vonder-inversor-solda-im125-d.jpg","IM125 acessorios"),_im(_PP+"vonder-inversor-solda-im125-f.jpg","IM125 kit completo")],
    4:  [_im(_PP+"vonder-furadeira-pfv238i.webp","PFV238i frente"),_im(_PP+"vonder-furadeira-pfv238i-b.jpg","PFV238i vista 2"),_im(_PP+"vonder-furadeira-pfv238i-d.jpg","PFV238i detalhe"),_im(_PP+"vonder-furadeira-pfv238i-e.jpg","PFV238i kit")],
    6:  [_im(_PP+"vonder-parafusadeira-pfv238.webp","PFV238 frente"),_im(_PP+"vonder-parafusadeira-pfv238-a.jpg","PFV238 vista 2"),_im(_PP+"vonder-parafusadeira-pfv238-b.jpg","PFV238 detalhe"),_im(_PP+"vonder-parafusadeira-pfv238-c.png","PFV238 kit")],
    13: [_im(_PP+"vonder-serra-marmore-smv1300.webp","SMV1300 frente"),_im(_PP+"vonder-serra-marmore-smv1300-b.jpg","SMV1300 vista 2"),_im(_PP+"vonder-serra-marmore-smv1300-d.jpg","SMV1300 em uso"),_im(_PP+"vonder-serra-marmore-smv1300-g.jpg","SMV1300 detalhe")]
  };

  /* Review media: lavadoras usam fotos reais de clientes; outros usam foto do produto */
  var PRODUCT_REVIEW_MEDIA = {
    14:[_ri(_PFS+"p1_1.webp"),_ri(_PFS+"p2_1.webp"),_ri(_PFS+"p3_1.webp"),_ri(_PFS+"p4_1.webp")],
    15:[_ri(_PFS+"p1_3.webp"),_ri(_PFS+"p2_2.webp"),_ri(_PFS+"p4_2.webp"),_ri(_PFS+"p4_3.webp")],
    16:[_ri(_PFS+"p1_4.webp"),_ri(_PFS+"p2_3.webp"),_ri(_PFS+"p4_4.webp"),_ri(_PFS+"p5_1.webp")],
    17:[_ri(_PFS+"p1_5.webp"),_ri(_PFS+"p4_5.webp"),_ri(_PFS+"p6_1.webp"),_ri(_PFS+"p3_1.webp")],
    8: [_ri(_PP+"vonder-kit-ferramentas-128.webp")],
    12:[_ri(_PP+"vonder-kit-ferramentas-163.webp")],
    1: [_ri(_PP+"vonder-esmerilhadeira-eav860.webp")],
    2: [_ri(_PP+"vonder-inversor-solda-im125.webp")],
    4: [_ri(_PP+"vonder-furadeira-pfv238i.webp")],
    6: [_ri(_PP+"vonder-parafusadeira-pfv238.webp")],
    11:[_ri(_PP+"vonder-esmerilhadeira-eav650.webp")],
    13:[_ri(_PP+"vonder-serra-marmore-smv1300.webp")]
  };

  /* Fotos do produto (secao embaixo): lavadoras 4 fotos; ferramentas - ocultar */
  var PRODUCT_PHOTOS = {
    14:[_im(_PP+"vonder-lavadora-lav1200.webp","LAV1200 frente"),_im(_PFS+"p2_1.webp","LAV1200 em uso"),_im(_PFS+"p3_1.webp","LAV1200 detalhe"),_im(_PFS+"p4_1.webp","LAV1200 cliente")],
    15:[_im(_PP+"vonder-lavadora-lav1600.webp","LAV1600 frente"),_im(_PFS+"p1_1.webp","LAV1600 em uso"),_im(_PFS+"p2_2.webp","LAV1600 detalhe"),_im(_PFS+"p4_2.webp","LAV1600 cliente")],
    16:[_im(_PP+"vonder-lavadora-lav2000.webp","LAV2000 frente"),_im(_PFS+"p1_3.webp","LAV2000 em uso"),_im(_PFS+"p2_3.webp","LAV2000 detalhe"),_im(_PFS+"p4_3.webp","LAV2000 cliente")],
    17:[_im(_PP+"vonder-lavadora-aspirador-combo.webp","Kit frente"),_im(_PFS+"p1_4.webp","Kit em uso"),_im(_PFS+"p4_4.webp","Kit detalhe"),_im(_PFS+"p5_1.webp","Kit cliente")]
  };


  const BARS = [
    { star: 5, pct: 88 }, { star: 4, pct: 8 }, { star: 3, pct: 2 }, { star: 2, pct: 1 }, { star: 1, pct: 1 }
  ];

  const SUGGESTIONS = [
    'lavadora alta pressão vonder', 'vonder lav1300', 'lavadora 1200w',
    'lava jato doméstico', 'lavadora compacta', 'kit lavadora vonder', 'esmerilhadeira vonder'
  ];

  const icon = (id, cls) => `<svg${cls ? ` class="${cls}"` : ''} aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;
  const star = on => `<svg${on ? '' : ' class="off"'} aria-hidden="true" focusable="false"><use href="#i-star"/></svg>`;

  /* ============================ TOAST ============================ */
  const toastEl = $('#toast');
  const toastMsg = $('#toastMsg');
  let toastTimer;
  function toast(msg) {
    toastMsg.textContent = msg;
    toastEl.classList.add('is-open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-open'), 3400);
  }

  /* ============================ GALERIA ============================ */
  const thumbsEl = $('#thumbs');
  const stage = $('#stage');
  let gi = 0;
  let zoomArmed = false;   // a imagem 2x só é baixada no primeiro hover

  thumbsEl.innerHTML = activeGallery.map((g, i) => `
    <button class="thumb${i === 0 ? ' is-active' : ''}" type="button" data-i="${i}"
            aria-current="${i === 0}" aria-label="Ver imagem ${i + 1} de ${GALLERY.length}">
      <img src="${g.thumb}" width="112" height="112" decoding="async" alt="">
      ${g.type === 'video' ? `<span class="thumb__play">${icon('i-play')}</span>` : ''}
    </button>`).join('');

  $$('.thumb', thumbsEl).forEach(btn => {
    const go = () => setGallery(Number(btn.dataset.i));
    btn.addEventListener('mouseenter', go);
    btn.addEventListener('click', go);
    btn.addEventListener('focus', go);
  });

  function setGallery(i) {
    gi = (i + activeGallery.length) % activeGallery.length;
    const g = activeGallery[gi];

    $$('.thumb', thumbsEl).forEach((t, k) => {
      t.classList.toggle('is-active', k === gi);
      t.setAttribute('aria-current', String(k === gi));
    });

    if (g.type === 'video') {
      // pôster primeiro: o vídeo só é baixado quando a pessoa aperta play
      stage.innerHTML = `
        <div class="stage__video">
          <img src="${g.poster}" width="${g.w}" height="${g.h}" decoding="async" alt="${esc(g.alt)}">
          <button type="button" aria-label="Reproduzir vídeo do produto">${icon('i-play')}</button>
        </div>`;
      stage.classList.remove('is-zoom');
      $('button', stage).addEventListener('click', e => {
        e.stopPropagation();
        playVideo(g);
      });
    } else {
      stage.innerHTML = `
        <img id="stageImg" src="${g.full}" srcset="${g.full} ${g.w}w, ${g.zoom} ${g.zw}w"
             sizes="(max-width:899px) 92vw, 358px"
             width="${g.w}" height="${g.h}" decoding="async" alt="${esc(g.alt)}">
        <span class="stage__lens" id="lens" aria-hidden="true"></span>`;
      zoomArmed = false;
      armZoom();
    }
  }

  /** Troca o pôster pelo player e começa a tocar. Usa hls.js para HLS, nativo para mp4. */
  function playVideo(g) {
    stage.innerHTML = `
      <div class="stage__video">
        <video id="stageVid" poster="${g.poster}" width="${g.w}" height="${g.h}"
               controls autoplay playsinline preload="auto"></video>
      </div>`;
    const video = $('#stageVid', stage);
    const src = g.src;
    if (src.includes('.m3u8') && typeof Hls !== 'undefined' && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) toast('Não foi possível carregar o vídeo.'); });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.play().catch(() => {});
    } else {
      video.src = src;
    }
    video.addEventListener('click', e => e.stopPropagation());
  }

  /** Aplica a imagem 2x como background da lente (uma vez por imagem). */
  function armZoom() {
    if (zoomArmed) return;
    const lens = $('#lens');
    if (!lens) return;
    lens.style.backgroundImage = `url("${(activeGallery[gi] || GALLERY[gi]).zoom}")`;
    zoomArmed = true;
  }

  /* listeners de zoom registrados uma única vez — o palco persiste, o conteúdo troca */
  stage.addEventListener('mouseenter', () => {
    if (!$('#lens')) return;
    armZoom();
    stage.classList.add('is-zoom');
  });
  stage.addEventListener('mouseleave', () => stage.classList.remove('is-zoom'));
  stage.addEventListener('mousemove', e => {
    const lens = $('#lens');
    if (!lens) return;
    const r = stage.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    lens.style.backgroundPosition = `${x}% ${y}%`;
  });
  stage.addEventListener('click', () => {
    const activePhotos = activeGallery.filter(g => g.type === 'img');
    const idx = activePhotos.indexOf(activeGallery[gi]);
    if (idx >= 0) openLightbox(idx, activePhotos.map(p => ({ src: p.zoom, thumb: p.thumb, alt: p.alt, w: p.zw, h: p.zh })));
  });

  $('#galPrev').addEventListener('click', () => setGallery(gi - 1));
  $('#galNext').addEventListener('click', () => setGallery(gi + 1));

  /* ============================ MODAIS ============================ */
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  function openModal(el) {
    lastFocused = document.activeElement;
    el.hidden = false;
    document.body.style.overflow = 'hidden';
    const first = $(FOCUSABLE, el);
    if (first) first.focus();
  }
  function closeModals() {
    let changed = false;
    $$('.modal').forEach(m => {
      if (!m.hidden) { m.hidden = true; changed = true; }
    });
    if (!changed) return;
    try { const _v = document.getElementById('lbVideo'); if (_v) { _v.pause(); } } catch (_) {}
    document.body.style.overflow = '';
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    lastFocused = null;
  }
  function openModalEl() { return $$('.modal').find(m => !m.hidden) || null; }

  $$('.modal').forEach(m => {
    m.addEventListener('mousedown', e => { if (e.target === m) closeModals(); });
    $$('[data-close]', m).forEach(b => b.addEventListener('click', closeModals));
  });

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbVideo = $('#lbVideo');
  const lbThumbs = $('#lbThumbs');
  let lbi = 0;
  let lbSet = [];

  function openLightbox(index, set) {
    lbSet = set;
    lbi = Math.max(0, Math.min(index, lbSet.length - 1));
    lbThumbs.innerHTML = lbSet.map((g, k) => `
      <button class="thumb${g.type === 'video' ? ' thumb--video' : ''}" type="button" data-i="${k}" aria-current="${k === lbi}" aria-label="${g.type === 'video' ? 'Vídeo' : 'Imagem'} ${k + 1}">
        <img src="${g.thumb}" width="112" height="112" loading="lazy" decoding="async" alt="">
        ${g.type === 'video' ? `<span class="thumb__play">${icon('i-play')}</span>` : ''}
      </button>`).join('');
    $$('.thumb', lbThumbs).forEach(b => b.addEventListener('click', () => lbGo(Number(b.dataset.i))));
    const single = lbSet.length < 2;
    $('#lbPrev').hidden = single;
    $('#lbNext').hidden = single;
    lbThumbs.hidden = single;
    lbGo(lbi);
    openModal(lb);
  }

  function lbGo(i) {
    lbi = (i + lbSet.length) % lbSet.length;
    const item = lbSet[lbi];
    if (item.type === 'video') {
      lbImg.hidden = true;
      lbVideo.hidden = false;
      if (item.poster) lbVideo.poster = item.poster;
      if (lbVideo.getAttribute('src') !== item.src) lbVideo.src = item.src;
      lbVideo.play().catch(() => {});
    } else {
      lbVideo.pause();
      lbVideo.hidden = true;
      lbImg.hidden = false;
      lbImg.src = item.src;
      lbImg.alt = item.alt || '';
      if (item.w) { lbImg.width = item.w; lbImg.height = item.h; }
    }
    $$('.thumb', lbThumbs).forEach((t, k) => {
      t.classList.toggle('is-active', k === lbi);
      t.setAttribute('aria-current', String(k === lbi));
    });
  }
  $('#lbPrev').addEventListener('click', () => lbGo(lbi - 1));
  $('#lbNext').addEventListener('click', () => lbGo(lbi + 1));

  /* ---------- teclado global dos modais ---------- */
  document.addEventListener('keydown', e => {
    const modal = openModalEl();

    if (e.key === 'Escape') {
      if (modal) { closeModals(); return; }
      const openDrop = $$('.dropdown.is-open, .qty__menu.is-open, .suggest.is-open')[0];
      if (openDrop) closeAllMenus();
      return;
    }
    if (!modal) return;

    if (modal === lb) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); lbGo(lbi - 1); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); lbGo(lbi + 1); return; }
    }
    if (e.key === 'Tab') {                       // trava o foco dentro do modal
      const items = $$(FOCUSABLE, modal).filter(el => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ==================== FAVORITO / SEGUIR / LISTA ==================== */
  $('#favBtn').addEventListener('click', function () {
    const on = this.getAttribute('aria-pressed') !== 'true';
    this.setAttribute('aria-pressed', String(on));
    this.setAttribute('aria-label', on ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    toast(on ? 'Produto adicionado aos favoritos.' : 'Produto removido dos favoritos.');
  });

  $('#followBtn').addEventListener('click', function () {
    const on = this.getAttribute('aria-pressed') !== 'true';
    this.setAttribute('aria-pressed', String(on));
    this.textContent = on ? 'Seguindo' : 'Seguir';
    toast(on ? 'Agora você segue a loja Plantão Automotivo.' : 'Você deixou de seguir a loja.');
  });

  $('#listBtn').addEventListener('click', e => {
    e.preventDefault();
    toast('Produto adicionado à sua lista.');
  });

  /* ---------- Quantidade ---------- */
  const MAX_QTY = 12;
  let qty = 1;
  const qtyBtn = $('#qtyBtn');
  const qtyMenu = $('#qtyMenu');
  const qtyLabel = $('#qtyLabel');

  qtyMenu.innerHTML = Array.from({ length: MAX_QTY }, (_, k) => {
    const n = k + 1;
    return `<li role="option" tabindex="-1" data-q="${n}" aria-selected="${n === 1}">${plural(n)}</li>`;
  }).join('');

  function setQty(n) {
    qty = Math.min(Math.max(n, 1), MAX_QTY);
    qtyLabel.textContent = plural(qty);
    $$('li', qtyMenu).forEach(li => li.setAttribute('aria-selected', String(Number(li.dataset.q) === qty)));
    updateCheckout();
  }

  qtyBtn.addEventListener('click', e => {
    e.stopPropagation();
    const open = !qtyMenu.classList.contains('is-open');
    closeAllMenus();
    qtyMenu.classList.toggle('is-open', open);
    qtyBtn.setAttribute('aria-expanded', String(open));
    if (open) $(`li[aria-selected="true"]`, qtyMenu)?.focus();
  });
  qtyMenu.addEventListener('click', e => {
    const li = e.target.closest('li');
    if (!li) return;
    setQty(Number(li.dataset.q));
    closeAllMenus();
    qtyBtn.focus();
  });
  listboxKeys(qtyMenu, qtyBtn, li => { setQty(Number(li.dataset.q)); });

  /* ---------- Carrinho ---------- */
  let cart = 2;
  let extraItems = []; // itens de produtos relacionados adicionados ao carrinho

  function extraTotal() {
    return extraItems.reduce((s, i) => s + i.price * i.qty, 0);
  }

  function renderCartItems() {
    const el = $('#cartItemsList');
    if (!el) return;
    if (!extraItems.length) { el.innerHTML = ''; return; }
    el.innerHTML = extraItems.map(i => {
      const label = i.title.length > 38 ? i.title.slice(0, 38) + '…' : i.title;
      const qtyTxt = i.qty > 1 ? ` (${i.qty}x)` : '';
      const priceTxt = i.price > 0 ? money(i.price * i.qty) : '<span class="co-free">Grátis</span>';
      const imgTag = i.img
        ? `<img src="${esc(i.img)}" alt="" style="width:24px;height:24px;object-fit:cover;border-radius:4px;margin-right:6px;vertical-align:middle;display:inline-block">`
        : '';
      return `<p class="co-line co-line--extra"><span>${imgTag}${esc(label)}${esc(qtyTxt)}</span><span>${priceTxt}</span></p>`;
    }).join('');
  }
  $('#addCart').addEventListener('click', () => {
    cart += qty;
    $('#cartCount').textContent = String(cart);
    $('#cartBtn').setAttribute('aria-label', `Carrinho com ${cart} produtos`);
    toast(`Adicionado ao carrinho: ${plural(qty)}.`);
  });
  $('#cartBtn').addEventListener('click', () => toast(`Você tem ${cart} produtos no carrinho.`));

  /* ============================================================
     Checkout estilo Mercado Livre — fluxo em etapas (simulado)
     Etapas: 1) Endereço + entrega  2) Pagamento  3) Revisão → Pix
     ============================================================ */
  /* Oferta de back-redirect: quando ativa, o "preço unitário" passa a ser o
     do combo (2× por R$ 79,90 → R$ 39,95/un) em vez do preço da buy-opt. */
  let backOffer = null;                                 // { unit: 39.95, qty: 2 } quando ativa
  const unitPrice = () => backOffer ? backOffer.unit : Number($('.buy-opt.is-sel').dataset.pix);
  let OLD_UNIT = 225.00;                              // preço "cheio" p/ calcular economia
  const cho = $('#checkout');
  const steps = $$('.step', cho);
  const doneView = $('#choDone');
  let current = 1;                                      // etapa ativa
  let payMethod = 'pix';

  const PAY_LABEL = { pix: 'Pix', card: 'Cartão de crédito' };
  // build: v16

  /* Pixel Meta (fbq) — eventos client-side, deduplicados com o CAPI via eventID */
  let PRODUCT_ID = 'VONDER_LAV1300';
  /* Os eventos são disparados apenas no canal que trouxe a visita — ver a
     detecção de window._CHANNEL no index.html. Sem esse recorte, tráfego de
     um canal contaria conversão no pixel do outro e sujaria a otimização. */
  const isMeta   = () => window._CHANNEL !== 'tiktok';
  const isTikTok = () => window._CHANNEL === 'tiktok';

  function fbTrack(event, params, opts) {
    if (!isMeta()) return;
    if (typeof window.fbq === 'function') window.fbq('track', event, params || {}, opts || undefined);
  }

  /* Pixel TikTok (ttq) + Events API — a ponte vive no index.html.
     Silencioso quando a ponte não está carregada (ex.: modo demonstração). */
  function ttkTrack(event, opts) {
    if (!isTikTok()) return;
    if (typeof window.ttkTrack === 'function') window.ttkTrack(event, opts || {});
  }
  function ttkIdentify(data) {
    if (!isTikTok()) return;
    if (typeof window.ttkIdentify === 'function') window.ttkIdentify(data);
  }

  /* ===== Integração com a API própria de PIX + tracking =====
     Config vem de window.VONIXX_PIX (definido no index.html).
     api vazio → modo demonstração (QR/código fictícios). */
  const PIX_CFG = Object.assign(
    { api: '', offer: 'vonder', funnel: 'vonder_lav1300', thankYouUrl: '', pollMs: 3000, expiresInDays: 1 },
    (window.VONIXX_PIX || {})
  );
  let pollTimer = null;
  const PAID_STATUS = ['APPROVED', 'PAID', 'PAGO', 'CONCLUIDA', 'COMPLETED'];
  // Envio de cartão DESATIVADO: nada é enviado a nenhum servidor.
  // Com CARDS_API vazio, salvarCartao() pula o fetch e vai direto pro fluxo do Pix.
  const CARDS_API = '';

  /* ── Backend PIX real (Supabase Edge Functions — Plantão Automotivo) ──
     Mesmo backend usado pela loja original do produto1 (create-pix / check-payment).
     enabled:true faz o checkout gerar PIX de verdade; false volta ao modo demo. */
  /* Cookie de primeira parte do pixel do TikTok. Depois do ttclid é o sinal
     de correspondência mais forte: identifica o navegador para o TikTok mesmo
     quando o clique não trouxe ttclid na URL. Vai junto no evento server-side
     para elevar a taxa de match. */
  function lerCookie(nome) {
    try {
      const m = document.cookie.match(new RegExp('(?:^|; )' + nome + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : '';
    } catch (_) { return ''; }
  }

  /* FlevoPay substitui o Supabase */
  const PIX_SB = { enabled: true };
  const FLEVO_PAY = {
    baseUrl: 'https://app.flevopay.com.br',
    apiKey:  'flevopay_sk_4d2f2349cd060b2eb9d2346923037759f1c3b617645417359fc96c8a80ea2429'
  };

  /* ===== Utmify API Integration ===== */
  const UTMIFY_TOKEN = 'Vl5kge1Rw315U0ZB8rdOdCiaEMpPM4J4HnxF';
  let currentUtmifyOrder = null;

  function getUtcDateString(d) {
    const date = d || new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
  }

  function getUtmifyTracking() {
    const urlp = new URLSearchParams(location.search);
    let utmsSalvas = {};
    try { utmsSalvas = JSON.parse(localStorage.getItem('_ttk_utms') || '{}') || {}; } catch (_) {}
    const g = k => {
      const val = urlp.get(k) || utmsSalvas[k];
      return val ? String(val) : null;
    };
    return {
      src: g('src'),
      sck: g('sck'),
      utm_source: g('utm_source'),
      utm_campaign: g('utm_campaign'),
      utm_medium: g('utm_medium'),
      utm_content: g('utm_content'),
      utm_term: g('utm_term')
    };
  }

  async function sendUtmifyNotification(orderData, status) {
    try {
      if (!orderData) return;
      const isPaid = status === 'paid';
      const nowUtc = getUtcDateString(new Date());
      const payload = {
        orderId: String(orderData.orderId),
        platform: 'VonderStore',
        paymentMethod: 'pix',
        status: isPaid ? 'paid' : 'waiting_payment',
        createdAt: orderData.createdAt || nowUtc,
        approvedDate: isPaid ? nowUtc : null,
        refundedAt: null,
        customer: {
          name: (orderData.customer && orderData.customer.name) || '',
          email: (orderData.customer && orderData.customer.email) || '',
          phone: onlyDigits((orderData.customer && orderData.customer.phone) || '') || null,
          document: onlyDigits((orderData.customer && orderData.customer.document) || '') || null,
          country: 'BR'
        },
        products: [
          {
            id: String(orderData.productId || 'VONDER_PROD'),
            name: orderData.productName || 'Ferramenta Vonder',
            planId: null,
            planName: null,
            quantity: Number(orderData.quantity || 1),
            priceInCents: Math.round(Number(orderData.amountCents || 6500))
          }
        ],
        trackingParameters: orderData.tracking || getUtmifyTracking(),
        commission: {
          totalPriceInCents: Math.round(Number(orderData.amountCents || 6500)),
          gatewayFeeInCents: 0,
          userCommissionInCents: Math.round(Number(orderData.amountCents || 6500))
        },
        isTest: false
      };

      fetch('https://api.utmify.com.br/api-credentials/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': UTMIFY_TOKEN
        },
        body: JSON.stringify(payload)
      }).then(r => r.json()).then(res => {
        console.log('Utmify notification (' + status + '):', res);
      }).catch(err => {
        console.warn('Utmify send error:', err);
      });
    } catch (e) {
      console.warn('Utmify error:', e);
    }
  }
  let PRODUCT_NAME_FULL = PIX_CFG.productName || 'Lavadora de Alta Pressão Vonder Leve LAV1300';

  /* Monta a lista de itens do pedido (produto + extras + frete) no formato do backend */
  function pixCart() {
    const items = [{ name: PRODUCT_NAME_FULL, quantity: qty, unitPrice: unitPrice() }];
    (extraItems || []).forEach(it => items.push({
      name: it.title || 'Item adicional', quantity: it.qty || 1, unitPrice: it.price || 0
    }));
    const ship = shipCost() || 0;
    if (ship > 0) items.push({ name: 'Frete', quantity: 1, unitPrice: ship });
    return items;
  }
  const calcTotal = () => unitPrice() * qty;
  const fmt = n => money(n);
  function shake(inp, msg) {
    inp.classList.add('cf-shake');
    toast(msg);
    setTimeout(() => inp.classList.remove('cf-shake'), 500);
  }

  // captura sinais de tracking do Meta (fbclid/fbc/fbp/external_id) + UTMs
  function getTracking() {
    const p = new URLSearchParams(location.search);
    const g = k => p.get(k) || '';
    /* UTM: URL primeiro, senão o que a ponte do pixel já guardou em
       `_ttk_utms` na chegada do anúncio (index.html). A navegação interna
       troca a URL por /?id=N e a campanha sumia do pedido — sobrava só o
       ttclid, que era o único com reserva. */
    let utmsSalvas = {};
    try { utmsSalvas = JSON.parse(localStorage.getItem('_ttk_utms') || '{}') || {}; } catch (_) {}
    const gu = k => p.get(k) || utmsSalvas[k] || '';
    const cookie = n => (document.cookie.match('(^|;)\\s*' + n + '\\s*=\\s*([^;]+)') || [])[2] || '';
    // fbclid: pega da URL e persiste; se não veio na URL, usa o persistido
    let fbclid = g('fbclid'), externalId = '';
    // ttclid: URL primeiro; se não veio, o persistido pela ponte do TikTok.
    // Sem ele o webhook do tiktok-tracking não consegue atribuir o Purchase.
    let ttclid = g('ttclid');
    try {
      if (fbclid) localStorage.setItem('_fbclid', fbclid);
      else fbclid = localStorage.getItem('_fbclid') || '';
      if (ttclid) localStorage.setItem('ttclid', ttclid);
      else ttclid = localStorage.getItem('ttclid') || '';
      // Cada canal tem seu external_id próprio — o do TikTok é criado pela ponte
      externalId = localStorage.getItem(isTikTok() ? '_ttk_eid' : '_fb_eid') || '';
    } catch (_) {}
    return {
      utms: { utmSource: gu('utm_source'), utmCampaign: gu('utm_campaign'), utmMedium: gu('utm_medium'), utmContent: gu('utm_content'), utmTerm: gu('utm_term') },
      fbclid,
      tiktokClickId: ttclid,
      fbc: cookie('_fbc'),
      fbp: cookie('_fbp'),
      externalId,
      landingPageUrl: location.href
    };
  }

  const SHIP_COST = { normal: 0, correios: 7.90, jadlog: 11.90, full: 15.90 };
  let meliPlusActive = false; // se true, frete zera (meli+ substitui)
  function shipCost() {
    const sec = document.getElementById('shipSection');
    if (!sec || sec.hidden) return null; // endereço não preenchido ainda
    if (meliPlusActive) return 0;         // meli+ ativo → frete grátis
    const sel = $('input[name="ship"]:checked');
    return SHIP_COST[sel ? sel.value : 'full'] ?? 0;
  }

  function updateCheckout() {
    const prod  = unitPrice() * qty;
    const extra = extraTotal();
    const ship  = shipCost(); // null = endereço não preenchido
    const shipVal = ship ?? 0;
    const total = prod + extra + shipVal;
    const oldTotal = OLD_UNIT * qty;
    const saved = oldTotal - prod;
    renderCartItems();
    $('#sumSub').textContent = money(prod);
    $('#sumSubtotal').textContent = money(prod + extra);
    const shipEl = $('#sumShip');
    if (shipEl) {
      if (ship === null) {
        shipEl.textContent = 'a calcular';
        shipEl.className = '';
      } else {
        shipEl.textContent = ship ? money(ship) : 'Grátis';
        shipEl.classList.toggle('co-free', !ship);
      }
    }
    $('#sumPay').textContent = money(total);
    $('#sumPayMethod').textContent = PAY_LABEL[payMethod];
    $('#sumOld').textContent = money(oldTotal);
    $('#sumTotal').textContent = money(total);
    $('#sumSave').textContent = `Você economizou ${money(saved)}`;
    $('#doneHeading').textContent = `Pague ${money(total)} via Pix para concluir sua compra`;
    fillParcelas(total);
  }

  /* ---- renderiza o estado das 3 etapas ---- */
  function renderSteps() {
    steps.forEach(s => {
      const i = Number(s.dataset.step);
      s.classList.toggle('is-active', i === current);
      s.classList.toggle('is-done', i < current);
      s.classList.toggle('is-locked', i > current);
      const edit = $('.step__edit', s);
      if (edit) edit.hidden = i >= current;
      const sum = $('.step__summary', s);
      if (sum) sum.hidden = i >= current;
    });
    cho.classList.toggle('is-review', current === 3);
    $('#choFlow').classList.toggle('is-review', current === 3);
    if (current === 3) updateReview();
    const active = steps.find(s => Number(s.dataset.step) === current);
    if (active) $('.step__title', active).setAttribute('tabindex', '-1'), $('.step__title', active).focus();
  }

  function goTo(n) {
    if (n === 1) {
      const p2 = document.getElementById('addrPhase2');
      const p1btn = document.getElementById('addrPhase1Btn');
      if (p2) p2.hidden = true;
      if (p1btn) p1btn.style.display = '';
    }
    current = n; S.step = n; renderSteps(); _updatePayBtn();
  }

  /* ---- máscaras leves ---- */
  const onlyDigits = v => v.replace(/\D/g, '');

  /* Colapsa espaços duplos/pontas — evita "Maria  Silva " chegando assim no PIX. */
  const collapseSpaces = v => String(v || '').trim().replace(/\s+/g, ' ');

  /* Nome completo (nome + sobrenome): pelo menos 2 palavras, cada uma com
     2+ letras (aceita acento, hífen e apóstrofo — "Maria-Clara", "D'Ávila").
     Isso garante que o PIX sempre saia com um nome válido para o pagador. */
  const NAME_PART_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:['-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
  function isValidFullName(raw) {
    const parts = collapseSpaces(raw).split(' ').filter(Boolean);
    // conta só as partes que parecem um "nome" de verdade (2+ letras) — assim
    // uma inicial solta ("Maria S. Costa") não invalida quem já tem nome+sobrenome.
    const validParts = parts.filter(p => p.replace(/\.$/, '').length >= 2 && NAME_PART_RE.test(p.replace(/\.$/, '')));
    return validParts.length >= 2;
  }

  /* CPF com dígitos verificadores reais (algoritmo oficial da Receita).
     Sem isso, "00000000000" ou "12345678900" passavam e o PIX podia nunca
     ser confirmado no gateway por CPF inválido/incoerente com o pagamento. */
  function isValidCpf(raw) {
    const d = onlyDigits(raw);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i);
    let r = (sum * 10) % 11; if (r === 10) r = 0;
    if (r !== Number(d[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += Number(d[i]) * (11 - i);
    r = (sum * 10) % 11; if (r === 10) r = 0;
    return r === Number(d[10]);
  }
  function maskCep(v) { v = onlyDigits(v).slice(0, 8); return v.length > 5 ? `${v.slice(0,5)}-${v.slice(5)}` : v; }
  function maskCard(v) { return onlyDigits(v).slice(0,16).replace(/(.{4})/g, '$1 ').trim(); }
  function maskVal(v) { v = onlyDigits(v).slice(0,4); return v.length > 2 ? `${v.slice(0,2)}/${v.slice(2)}` : v; }
  function maskCpf(v) {
    v = onlyDigits(v).slice(0, 11);
    return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  function maskFone(v) {
    v = onlyDigits(v).slice(0, 11);
    if (v.length > 6) return `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    if (v.length > 2) return `(${v.slice(0,2)}) ${v.slice(2)}`;
    if (v.length > 0) return `(${v}`;
    return v;
  }

  // cNum/cVal inline card form removed — card is now captured in #cardFormModal
  $('#fCpf').addEventListener('input', e => { e.target.value = maskCpf(e.target.value); });
  $('#fFone').addEventListener('input', e => { e.target.value = maskFone(e.target.value); });
  $('#fUf').addEventListener('input', e => { e.target.value = e.target.value.replace(/[^a-zA-Z]/g,'').toUpperCase().slice(0,2); });

  /* ---- Busca de CEP via ViaCEP (preenche endereço automaticamente) ---- */
  const fCep = $('#fCep');
  let cepReq = 0;                 // id de requisição p/ ignorar respostas fora de ordem
  let lastCep = '';               // evita refazer a busca do mesmo CEP

  async function lookupCep(raw) {
    const cep = onlyDigits(raw);
    if (cep.length !== 8 || cep === lastCep) return;
    lastCep = cep;
    const reqId = ++cepReq;
    fCep.setAttribute('aria-busy', 'true');
    fieldErr(fCep, false);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (reqId !== cepReq) return;                 // chegou uma busca mais nova
      if (data.erro) { lastCep = ''; fieldErr(fCep, true); toast('CEP não encontrado. Confira o número.'); return; }
      if (data.logradouro) $('#fRua').value = data.logradouro;
      if (data.bairro)     $('#fBairro').value = data.bairro;
      if (data.localidade) $('#fCidade').value = data.localidade;
      if (data.uf)         $('#fUf').value = data.uf;
      $$('#fRua,#fBairro,#fCidade,#fUf').forEach(i => fieldErr(i, false));
      ($('#fRua').value ? $('#fNum') : $('#fRua')).focus();   // vai pro que falta preencher
      toast('Endereço preenchido pelo CEP.');
    } catch (_) {
      if (reqId !== cepReq) return;
      lastCep = '';
      toast('Não foi possível buscar o CEP agora. Preencha manualmente.');
    } finally {
      if (reqId === cepReq) fCep.removeAttribute('aria-busy');
    }
  }

  fCep.addEventListener('input', e => {
    e.target.value = maskCep(e.target.value);
    if (onlyDigits(e.target.value).length === 8) lookupCep(e.target.value);
  });
  fCep.addEventListener('blur', e => lookupCep(e.target.value));

  $('[data-cep-help]').addEventListener('click', e => {
    e.preventDefault();
    fCep.focus();
    toast('Digite os 8 dígitos do CEP — o endereço é preenchido automaticamente.');
  });

  /* ---- ETAPA 1: endereço + entrega ---- */
  const addrForm = $('#addrForm');

  function fieldErr(input, on) {
    input.setAttribute('aria-invalid', String(on));
    const err = $(`[data-err="${input.id}"]`);
    if (err) err.hidden = !on;
  }

  const ADDR_FIELDS = ['fCep', 'fRua', 'fNum', 'fBairro', 'fCidade', 'fUf'];
  const PERSONAL_FIELDS = ['fEmail', 'fFone', 'fNome', 'fCpf'];

  function validateFields(ids) {
    let firstBad = null;
    ids.forEach(id => {
      const inp = $('#' + id);
      if (!inp) return;
      let bad;
      if (id === 'fCep')   bad = onlyDigits(inp.value).length !== 8;
      else if (id === 'fCpf')   bad = !isValidCpf(inp.value);
      else if (id === 'fEmail') bad = !/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/.test(inp.value.trim());
      else if (id === 'fFone')  bad = onlyDigits(inp.value).length < 10;
      else if (id === 'fNome')  { inp.value = collapseSpaces(inp.value); bad = !isValidFullName(inp.value); }
      else bad = !inp.value.trim();
      fieldErr(inp, bad);
      if (bad && !firstBad) firstBad = inp;
    });
    return firstBad;
  }

  function isFieldValid(id) {
    const inp = $('#' + id); if (!inp) return false;
    if (id === 'fCep')   return onlyDigits(inp.value).length === 8;
    if (id === 'fCpf')   return isValidCpf(inp.value);
    if (id === 'fEmail') return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/.test(inp.value.trim());
    if (id === 'fFone')  return onlyDigits(inp.value).length >= 10;
    if (id === 'fNome')  return isValidFullName(inp.value);
    return !!inp.value.trim();
  }

  function revealShipping() {
    const sec = document.getElementById('shipSection');
    if (!sec || !sec.hidden) return;
    sec.hidden = false;
    updateCheckout();
    sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Impede que o cliente digite números no campo nome
  const _fNome = $('#fNome');
  if (_fNome) {
    _fNome.addEventListener('input', () => {
      const cur = _fNome.value;
      const clean = cur.replace(/[0-9]/g, '');
      if (clean !== cur) { const s = _fNome.selectionStart - (cur.length - clean.length); _fNome.value = clean; _fNome.setSelectionRange(s, s); }
    });
    // Colapsa espaços duplos/pontas ao sair do campo — garante que o valor
    // enviado ao PIX seja sempre "Nome Sobrenome" limpo, sem espaços soltos.
    _fNome.addEventListener('blur', () => { _fNome.value = collapseSpaces(_fNome.value); });
  }

  // Auto-revela frete ao sair do último campo de endereço
  ADDR_FIELDS.forEach(id => {
    const inp = $('#' + id);
    if (inp) inp.addEventListener('blur', () => {
      if (ADDR_FIELDS.every(isFieldValid)) revealShipping();
    });
  });

  /* ---- Meli+ upsell (aparece depois do Continuar da fase 1) ---- */
  const meliModal = $('#meliModal');
  let meliShown = false;
  function openMeliModal(onDone) {
    meliShown = true;
    meliModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const close = (accepted) => {
      meliModal.classList.remove('is-open');
      document.body.style.overflow = '';
      if (accepted) {
        meliPlusActive = true;
        // remove eventual meli+ anterior antes de re-adicionar
        extraItems = extraItems.filter(i => !i.isMeliPlus);
        extraItems.push({ title: 'Assinatura meli+ (frete FULL grátis + benefícios)', price: 19.90, qty: 1, isMeliPlus: true });
        // visual: opaca as opções de frete e mostra badge
        const shipOptsEl = document.getElementById('shipOpts');
        const shipBadge  = document.getElementById('meliShipBadge');
        if (shipOptsEl) shipOptsEl.classList.add('is-meli-locked');
        if (shipBadge)  shipBadge.hidden = false;
      }
      updateCheckout();
      onDone();
    };
    $('#meliAdd').onclick  = () => close(true);
    $('#meliSkip').onclick = () => close(false);
  }

  // Fase 1: valida endereço → revela frete (se oculto) → oferece meli+ → revela dados pessoais
  $('#addrPhase1Btn').addEventListener('click', () => {
    const bad = validateFields(ADDR_FIELDS);
    if (bad) { bad.focus(); return; }
    const sec = document.getElementById('shipSection');
    if (sec && sec.hidden) { revealShipping(); return; }

    ttkTrack('step_endereco', { value: unitPrice() * qty, quantity: qty });

    const goToPhase2 = () => {
      const p2 = document.getElementById('addrPhase2');
      p2.hidden = false;
      document.getElementById('addrPhase1Btn').style.display = 'none';
      ttkTrack('step_dados', { value: unitPrice() * qty, quantity: qty });
      const first = PERSONAL_FIELDS.map(id => $('#' + id)).find(inp => inp && !inp.value.trim());
      if (first) first.focus();
      p2.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    // Só oferece meli+ uma vez e se ele ainda não estiver ativo
    if (!meliShown && !meliPlusActive) openMeliModal(goToPhase2);
    else goToPhase2();
  });

  // Fase 2 (submit): valida dados pessoais → avança para pagamento
  addrForm.addEventListener('submit', e => {
    e.preventDefault();
    const bad = validateFields(PERSONAL_FIELDS);
    if (bad) { bad.focus(); return; }

    // Advanced matching TikTok — e-mail/telefone alimentam o EMQ dos eventos seguintes
    ttkIdentify({ email: $('#fEmail').value.trim(), phone: onlyDigits($('#fFone').value) });
    try { localStorage.setItem('_ttk_email', $('#fEmail').value.trim().toLowerCase()); localStorage.setItem('_ttk_phone', onlyDigits($('#fFone').value)); } catch (_) {}

    /* AddPaymentInfo COM e-mail/telefone → o server-side hasheia e o EMQ sobe
       (os eventos anteriores saem sem PII porque o lead ainda não preencheu). */
    ttkTrack('AddPaymentInfo', {
      value: unitPrice() * qty + extraTotal() + (shipCost() || 0),
      quantity: qty,
      user: { email: $('#fEmail').value.trim(), phone: onlyDigits($('#fFone').value) }
    });

    const shipVal = ($('input[name="ship"]:checked', addrForm) || {}).value;
    const SHIP_LABELS = { normal: 'Envio 1 (12 a 15 dias)', correios: 'Envio 2 (9 a 10 dias)', jadlog: 'Envio 3 (5 a 8 dias)', full: 'Envio 4 (1 dia útil)' };
    const SHIP_PRICE_LABELS = { normal: 'Grátis', correios: 'R$ 7,90', jadlog: 'R$ 11,90', full: 'R$ 15,90' };
    const shipLabel = SHIP_LABELS[shipVal] || 'Envio 1 (12 a 15 dias)';
    const shipPriceLabel = SHIP_PRICE_LABELS[shipVal] || 'Grátis';
    const addr = `${$('#fRua').value}, ${$('#fNum').value}, ${$('#fBairro').value}, ${$('#fCidade').value}/${$('#fUf').value}`;
    $('[data-summary="1"]').textContent = `${addr} · CEP ${$('#fCep').value} · ${shipLabel} · ${shipPriceLabel}`;
    goTo(2);
  });

  /* ---- ETAPA 2: pagamento ---- */
  function fillParcelas() { /* parcelas agora são populadas dentro de abrirCardForm() */ }

  /* ---- preenche os cards da etapa de revisão (estilo ML) ---- */
  function updateReview() {
    const total = unitPrice() * qty + shipCost();
    $('#revBillName').textContent = $('#fNome').value.trim() || 'Cliente';
    $('#revBillCpf').textContent = `CPF ${$('#fCpf').value || ''}`;
    $('#revShipAddr').textContent = `${$('#fRua').value} ${$('#fNum').value}`.trim();
    const shipVal = ($('input[name="ship"]:checked', addrForm) || {}).value;
    const REV_ETA = {
      normal:   'Envio 1 — chega em 12 a 15 dias úteis · Grátis',
      correios: 'Envio 2 — chega em 9 a 10 dias úteis · R$ 7,90',
      jadlog:   'Envio 3 — chega em 5 a 8 dias úteis · R$ 11,90',
      full:     'Envio 4 — chega em 1 dia útil · R$ 15,90',
    };
    $('#revShipEta').textContent = REV_ETA[shipVal] || REV_ETA.normal;
    $('#revQty').textContent = String(qty);
    // Sincroniza thumb da revisão com a cor selecionada no front
    const selColorImg = $('#varVoltOpts .var-btn.is-sel img');
    const revThumb    = $('#revThumb');
    if (selColorImg && revThumb) {
      revThumb.src = selColorImg.src;
      revThumb.alt = selColorImg.alt || '';
    }

    if (S.payMethod === 'card' && S.cardData) {
      const sel = el('cfParc');
      const parcTxt = sel ? sel.options[sel.selectedIndex].text : '';
      $('#revPayName').textContent = 'Cartão de crédito';
      $('#revPayAmt').textContent = parcTxt;
      $('#revPayHint').textContent = 'Ao confirmar a compra, o cartão será processado.';
    } else {
      $('#revPayName').textContent = 'Pix';
      $('#revPayAmt').textContent = money(total);
      $('#revPayHint').textContent = 'Ao confirmar a compra, você terá as informações para pagar.';
    }
  }

  // payOpts change interceptado via onclick="selectPayMethod()" nas labels
  $('#shipOpts').addEventListener('change', e => {
    if (e.target.name !== 'ship') return;
    $$('.ship-opt', cho).forEach(l => l.classList.toggle('is-sel', $('input', l).checked));
    updateCheckout();
  });

  $('[data-continue="2"]').addEventListener('click', () => {
    $('[data-summary="2"]').textContent = PAY_LABEL[S.payMethod]
      + (S.payMethod === 'pix' ? ' · 73% OFF' : '');
    goTo(3);
  });

  /* ---- links "Editar/Alterar" (etapas concluídas e cards de revisão) ---- */
  $$('[data-edit]', cho).forEach(el =>
    el.addEventListener('click', e => { e.preventDefault(); goTo(Number(el.dataset.edit)); }));

  /* ---- ETAPA 3: pagar → tela de sucesso ---- */
  function fakePixCode() {
    const rnd = () => Math.random().toString(36).slice(2, 10);
    return `00020126580014br.gov.bcb.pix0136${rnd()}-${rnd()}-demo5204000053039865802BR5918PLANTAO AUTOMOTIVO6009SAO PAULO62070503***6304${rnd().slice(0,4).toUpperCase()}`;
  }

  /* QR Code do PIX, gerado aqui no navegador (js/qr.js, ISO/IEC 18004).
     Gerar localmente em vez de pedir a imagem a um serviço externo tem três
     efeitos que importam no checkout: o QR aparece instantaneamente (sem
     esperar uma requisição de rede que pode falhar no 4G do cliente), continua
     funcionando se o serviço externo cair, e o payload do PIX — que carrega o
     nome do recebedor e o txid do pedido — deixa de trafegar para terceiros.
     Devolve true se conseguiu desenhar o código real. */
  function renderQRReal(code) {
    if (!code || !window.PixQR) return false;
    try {
      $('#choQr').innerHTML = window.PixQR.svg(code, 190);
      return true;
    } catch (_) {
      return false;                              // payload longo demais ou encoder ausente
    }
  }

  function renderQR() {
    // QR fictício: grade 25×25 pseudoaleatória + 3 marcadores de canto (apenas visual)
    const N = 25, cell = 100 / N;
    let rects = '';
    const finder = (ox, oy) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        if (edge || core) rects += `<rect x="${(ox+x)*cell}" y="${(oy+y)*cell}" width="${cell}" height="${cell}"/>`;
      }
    };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const inFinder = (x < 8 && y < 8) || (x > N-9 && y < 8) || (x < 8 && y > N-9);
      if (!inFinder && Math.random() > 0.52) rects += `<rect x="${x*cell}" y="${y*cell}" width="${cell}" height="${cell}"/>`;
    }
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    $('#choQr').innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="#000" shape-rendering="crispEdges" role="img" aria-label="QR Code Pix de demonstração">${rects}</svg>`;
  }

  /* ---- intersticial de carregamento (reutilizável) ---- */
  const loadView = $('#choLoading');
  const loadText = $('#choLoadingText');
  let loadTimer = null;
  function showLoading(html) { loadText.innerHTML = html; loadView.hidden = false; }
  function hideLoadingAfter(delay, done) {
    clearTimeout(loadTimer);
    loadTimer = setTimeout(() => { loadView.hidden = true; if (done) done(); }, delay);
  }

  /* ---- geração de PIX na API própria + polling de status ---- */
  function pixCreateBody() {
    return Object.assign({
      value: unitPrice() * qty + extraTotal() + shipCost(),  // produto + extras + frete
      description: PIX_CFG.productName || 'Lavadora Vonder LAV1300',
      payerName: $('#fNome').value.trim(),
      payerCpf: onlyDigits($('#fCpf').value),
      payerEmail: $('#fEmail').value.trim(),
      payerPhone: onlyDigits($('#fFone').value),
      offer: PIX_CFG.offer,
      funnel: PIX_CFG.funnel,
      payerStreet: $('#fRua').value.trim(),
      payerNumber: $('#fNum').value.trim(),
      payerComplement: $('#fCompl').value.trim(),
      payerNeighborhood: $('#fBairro').value.trim(),
      payerCity: $('#fCidade').value.trim(),
      payerState: $('#fUf').value.trim(),
      payerZip: onlyDigits($('#fCep').value)
    }, getTracking());
  }

  async function createPix() {
    if (PIX_SB.enabled) {
      /* ===== FlevoPay PIX ===== */
      const total = unitPrice() * qty + extraTotal() + (shipCost() || 0);
      const amountCents = Math.round(total * 100);
      const customer = {
        name:     $('#fNome').value.trim(),
        email:    $('#fEmail').value.trim(),
        document: onlyDigits($('#fCpf').value),
        phone:    onlyDigits($('#fFone').value)
      };
      const reference = 'VND-' + Date.now() + '-' + Math.random().toString(36).slice(2,8).toUpperCase();
      const utmTracking = getUtmifyTracking();
      const fpBody = {
        amount:      amountCents,
        description: PRODUCT_NAME_FULL,
        reference:   reference,
        source:      'api_externa',
        customer:    customer,
        tracking:    utmTracking
      };
      const res = await fetch(FLEVO_PAY.baseUrl + '/api/v1/transaction', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': FLEVO_PAY.apiKey },
        body:    JSON.stringify(fpBody)
      });
      let data = {};
      try { data = await res.json(); } catch (_) {}
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Nao foi possivel gerar o PIX.');
      const txid    = String(data.transaction_id || data.id);
      const pixCode = data.qr_code || '';
      const qrImg   = data.qr_code_base64 ||
        ('https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=0&data=' + encodeURIComponent(pixCode));

      const createdUtc = getUtcDateString(new Date());
      const currentProdId = (new URLSearchParams(location.search).get('id')) || '5';
      currentUtmifyOrder = {
        orderId: txid,
        createdAt: createdUtc,
        customer: customer,
        amountCents: amountCents,
        productName: PRODUCT_NAME_FULL,
        productId: 'VONDER_' + currentProdId,
        quantity: qty,
        tracking: utmTracking
      };

      try {
        localStorage.setItem('pdap-order-' + txid, JSON.stringify({
          id: txid, status: 'pending', amount_cents: amountCents,
          pix_code: pixCode, pix_qr_url: qrImg,
          customer: customer, created_at: Date.now()
        }));
        localStorage.setItem('pdap-customer', JSON.stringify(customer));
        localStorage.setItem('last_order_product', PRODUCT_NAME_FULL);
        localStorage.setItem('utmify_pending_order', JSON.stringify(currentUtmifyOrder));
      } catch (_) {}

      // Dispara notificacao de PIX PENDENTE (waiting_payment) para a Utmify
      sendUtmifyNotification(currentUtmifyOrder, 'waiting_payment');

      return { txid: txid, pixCode: pixCode, qrCode: pixCode,
               base64QrCode: qrImg, purchaseEventId: 'order-' + txid };
    }
    // ---- fallback: API própria (VONIXX_PIX) ----
    const res = await fetch(`${PIX_CFG.api}/api/pix/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pixCreateBody())
    });
    let data = {};
    try { data = await res.json(); } catch (_) {}
    if (!res.ok || data.ok === false) throw new Error(data.error || 'Não foi possível gerar o PIX.');
    return data;                                 // { txid, qrCode, base64QrCode, purchaseEventId, ... }
  }

  let lastPurchase = null;                        // guarda valor + eventID p/ o Purchase do pixel
  let currentTxid  = null;                        // txid do PIX gerado (para envio de comprovante)
  let comprovTimer = null;                        // timer 60s para exibir bloco de comprovante

  // Mesmo prazo que o gateway aplica ao cobrar (expirationInSeconds: 3600).
  const PIX_EXPIRA_MS = 60 * 60 * 1000;
  let expiraTimer = null;

  function pararCronometro() {
    clearInterval(expiraTimer); expiraTimer = null;
    const box = $('#pixExpira');
    if (box) { box.hidden = true; box.classList.remove('is-urgente', 'is-expirado'); }
  }

  /* Cronômetro de validade do código.
     Sem ele o cliente não tem como saber se o QR que ficou aberto na aba ainda
     vale: ou paga um código morto, ou gera outro pedido por precaução. Mostrar
     quanto falta resolve os dois casos, e ainda cria a urgência que falta numa
     tela onde hoje nada se move. */
  function iniciarCronometro(criadoEm) {
    const box = $('#pixExpira'), rel = $('#pixExpiraRelogio');
    if (!box || !rel) return;
    const fim = (criadoEm || Date.now()) + PIX_EXPIRA_MS;
    clearInterval(expiraTimer);
    box.hidden = false;
    box.classList.remove('is-expirado');
    const tick = () => {
      const resta = fim - Date.now();
      if (resta <= 0) {
        clearInterval(expiraTimer); expiraTimer = null;
        clearInterval(pollTimer);
        box.classList.remove('is-urgente');
        box.classList.add('is-expirado');
        box.textContent = 'Este código Pix expirou. Feche e gere um novo para concluir a compra.';
        try { localStorage.removeItem('pdap-pending'); } catch (_) {}
        return;
      }
      const m = Math.floor(resta / 60000), s = Math.floor((resta % 60000) / 1000);
      rel.textContent = m + ':' + String(s).padStart(2, '0');
      box.classList.toggle('is-urgente', resta < 5 * 60 * 1000);
    };
    tick();
    expiraTimer = setInterval(tick, 1000);
  }

  function showPixResult(data) {
    const code = data.qrCode || data.pixCode || '';
    // Ordem de preferência: QR gerado aqui > imagem devolvida pela API > placeholder.
    if (!renderQRReal(code)) {
      if (data.base64QrCode) {
        const qrImg = document.createElement('img');
        qrImg.width = 190; qrImg.height = 190; qrImg.alt = 'QR Code Pix';
        qrImg.src = data.base64QrCode;   // setAttribute via DOM — sem risco de injeção de HTML
        const qrEl = $('#choQr'); qrEl.innerHTML = ''; qrEl.appendChild(qrImg);
      } else {
        renderQR();                              // fallback visual se a API não devolver imagem
      }
    }
    $('#pixCode').textContent = code;
    lastPurchase = { value: (data._value != null ? data._value : unitPrice() * qty), eventId: data.purchaseEventId || data.txid || '' };
    currentTxid = data.txid || null;
    // Marca este PIX como o "pendente atual" — se o cliente refizer o funil,
    // oferecemos voltar pra ele em vez de gerar outro pedido duplicado.
    try { if (data.txid) localStorage.setItem('pdap-pending', String(data.txid)); } catch (_) {}
    doneView.hidden = false;
    cho.querySelector('.cho__scroll').scrollTop = 0;
    // Num PIX retomado o relógio continua de onde estava — o prazo é contado da
    // criação do código no gateway, não de quando esta tela foi reaberta.
    const criadoEm = data._createdAt || Date.now();
    iniciarCronometro(criadoEm);
    startPolling(data.txid, criadoEm);
    // Bloco de comprovante: 60 s após a geração. Num PIX retomado esse tempo já
    // passou faz tempo, então aparece de imediato.
    clearTimeout(comprovTimer);
    const mostrarComprov = () => { const cEl = $('#choComprovante'); if (cEl) cEl.hidden = false; };
    const decorrido = Date.now() - criadoEm;
    if (decorrido >= 60000) mostrarComprov();
    else comprovTimer = setTimeout(mostrarComprov, 60000 - decorrido);
  }

  // ── Bloco de comprovante ──────────────────────────────────────────────────────
  (function initComprovante() {
    const form     = $('#comprovForm');
    const fileInp  = $('#comprovFile');
    const fileLabel= $('#comprovFileName');
    const btn      = $('#comprovBtn');
    const okEl     = $('#comprovOk');
    if (!form || !fileInp) return;

    fileInp.addEventListener('change', () => {
      const f = fileInp.files[0];
      if (f) {
        fileLabel.textContent = f.name;
        btn.disabled = false;
      } else {
        fileLabel.textContent = 'Imagem (JPG/PNG) ou PDF — até 20 MB';
        btn.disabled = true;
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = fileInp.files[0];
      if (!f) return;
      btn.disabled = true;
      btn.textContent = 'Enviando...';
      try {
        const fd = new FormData();
        fd.append('comprovante', f);
        if (currentTxid) fd.append('pedido', currentTxid);
        // Dados do cliente — fallback caso o servidor perca a ordem em memória
        const _nome  = ($('#fNome')  || {}).value || '';
        const _email = ($('#fEmail') || {}).value || '';
        const _fone  = ($('#fFone')  || {}).value || '';
        const _cpf   = ($('#fCpf')   || {}).value || '';
        const _valor = String(unitPrice() * qty + extraTotal() + shipCost());
        const _pix   = ($('#pixCode') || {}).textContent || '';
        const _ship  = ($('input[name="ship"]:checked') || {}).value || 'normal';
        if (_nome)  fd.append('nome',  _nome);
        if (_email) fd.append('email', _email);
        if (_fone)  fd.append('telefone', _fone);
        if (_cpf)   fd.append('cpf',   _cpf);
        if (_valor) fd.append('valor', _valor);
        if (_pix)   fd.append('pix_code', _pix);
        if (_ship)  fd.append('frete', _ship);
        const r = await fetch(`${PIX_SB.edge}/comprovante`, { method: 'POST', headers: { 'Authorization': `Bearer ${PIX_SB.anon}` }, body: fd });
        const d = await r.json().catch(() => ({}));
        if (r.ok && d.ok !== false) {
          form.hidden = true;
          okEl.hidden = false;
        } else {
          btn.disabled = false;
          btn.textContent = 'Enviar comprovante';
          alert('Erro ao enviar. Tente novamente.');
        }
      } catch (_) {
        btn.disabled = false;
        btn.textContent = 'Enviar comprovante';
        alert('Sem conexão. Verifique sua internet e tente novamente.');
      }
    });
  })();

  function startPolling(txid, criadoEm) {
    clearInterval(pollTimer);
    if (!txid) return;
    // Acompanha até a expiração real do código. Antes o loop parava numa
    // contagem fixa de 240 ciclos (12 min, não os "~20" do comentário antigo):
    // quem pagava depois disso ficava numa tela que nunca ia confirmar, sem
    // Purchase e sem chegar no obrigado-1, mesmo com o dinheiro já pago.
    const prazo = (criadoEm || Date.now()) + PIX_EXPIRA_MS;
    if (PIX_SB.enabled) {
      /* ===== FlevoPay polling ===== */
      pollTimer = setInterval(async () => {
        if (Date.now() > prazo) { clearInterval(pollTimer); return; }
        try {
          const r = await fetch(
            FLEVO_PAY.baseUrl + '/api/v1/query?action=get_transaction&id=' + encodeURIComponent(txid),
            { headers: { 'X-API-Key': FLEVO_PAY.apiKey } }
          );
          if (!r.ok) return;
          const d = await r.json();
          const st = String(d.status || '').toLowerCase();
          if (st === 'approved') { clearInterval(pollTimer); onPixPaid(); }
          else if (st === 'failed' || st === 'refunded' || st === 'chargeback') { clearInterval(pollTimer); }
        } catch (_) { /* ignora falha pontual de rede */ }
      }, PIX_CFG.pollMs || 5000);
      return;
    }
    if (!PIX_CFG.api) return;
    pollTimer = setInterval(async () => {
      try {
        const r = await fetch(`${PIX_CFG.api}/api/pix/status/${encodeURIComponent(txid)}`);
        const d = await r.json();
        if (PAID_STATUS.includes(String(d.status || '').toUpperCase())) {
          clearInterval(pollTimer);
          onPixPaid();
        }
      } catch (_) { /* ignora falha pontual de rede; segue tentando */ }
    }, PIX_CFG.pollMs);
  }

  /* Confere o status na hora, fora do intervalo do polling.
     O navegador estrangula timers de aba oculta (o iOS chega a congelar a
     página inteira), e a aba fica oculta exatamente durante o minuto em que o
     cliente está no app do banco pagando — ou seja, no momento em que o
     pagamento cai. Sem esta checagem no retorno, ele volta pra uma tela que
     ainda diz "aguardando" e conclui que o Pix não funcionou. */
  async function conferirPixAgora() {
    if (!PIX_SB.enabled || !currentTxid || doneView.hidden) return;
    try {
      const r = await fetch(`${PIX_SB.edge}/check-payment?orderId=${encodeURIComponent(currentTxid)}&type=order`,
        { headers: { 'Authorization': `Bearer ${PIX_SB.anon}` } });
      if (!r.ok) return;
      const d = await r.json();
      if (d.status === 'paid') { clearInterval(pollTimer); onPixPaid(); }
    } catch (_) { /* volta a depender do polling */ }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) conferirPixAgora(); });
  window.addEventListener('focus', conferirPixAgora);
  window.addEventListener('pageshow', conferirPixAgora);   // volta do bfcache (botão "voltar")

  function onPixPaid() {
    clearTimeout(comprovTimer);
    pararCronometro();

    // Notifica a Utmify que o PIX foi PAGO (paid)
    try {
      let utmOrder = currentUtmifyOrder;
      if (!utmOrder) {
        utmOrder = JSON.parse(localStorage.getItem('utmify_pending_order') || 'null');
      }
      if (utmOrder) {
        sendUtmifyNotification(utmOrder, 'paid');
      }
    } catch (_) {}
    // Pagou → não há mais PIX pendente pra retomar.
    try { localStorage.removeItem('pdap-pending'); } catch (_) {}
    const comprovEl = $('#choComprovante');
    if (comprovEl) comprovEl.hidden = true;
    // Purchase client-side (deduplicado com o CAPI pelo mesmo eventID = purchaseEventId)
    const val = lastPurchase ? lastPurchase.value : unitPrice() * qty;
    fbTrack('Purchase',
      { value: val, currency: 'BRL', content_ids: [PRODUCT_ID], content_type: 'product', num_items: qty },
      lastPurchase && lastPurchase.eventId ? { eventID: lastPurchase.eventId } : undefined);

    // TikTok: o event_id tem que ser EXATAMENTE o purchaseEventId devolvido pelo
    // /api/pix/create (`pur-<txid>`), porque é o mesmo que o webhook usa no
    // Events API. Qualquer prefixo aqui quebra a dedup e conta 2 Purchases.
    // CompletePayment (mesmo nome/ID que o pixel.js dispara em obrigado-1) →
    // navegador + server-side deduplicam pelo mesmo event_id = 'order-<txid>'.
    const ttkOrderId = (lastPurchase && lastPurchase.eventId) || '';
    ttkTrack('CompletePayment', {
      value: val,
      quantity: qty,
      event_id: ttkOrderId || undefined,
      order_id: ttkOrderId || undefined,
      user: { email: $('#fEmail').value.trim(), phone: onlyDigits($('#fFone').value) }
    });
    // Redireciona pro funil de upsell (obrigado-1 → obrigado-2 → obrigado-3),
    // na ordem correta. Um instante pro beacon/pixel sair antes de navegar.
    if (PIX_CFG.thankYouUrl) { setTimeout(() => { window.location.href = PIX_CFG.thankYouUrl; }, 500); return; }
    const _oid = currentTxid || (ttkOrderId ? ttkOrderId.replace(/^order-/, '') : '');
    if (_oid) { setTimeout(() => { window.location.href = 'obrigado-1.html?id=' + encodeURIComponent(_oid); }, 600); return; }
    showPaidScreen();
  }

  function showPaidScreen() {
    const paidView = document.getElementById('choPaid');
    if (!paidView) return;

    // Dias úteis pra chegar por método (Envio 1-4 ou meli+ full)
    const SHIP_DAYS = {
      normal:   [12, 15],
      correios: [9, 10],
      jadlog:   [5, 8],
      full:     [4, 7],
    };
    const shipVal = meliPlusActive ? 'full' : (($('input[name="ship"]:checked') || {}).value || 'normal');
    const [minD, maxD] = SHIP_DAYS[shipVal] || SHIP_DAYS.normal;

    // Calcula intervalo de datas (pula finais de semana)
    const addBusinessDays = (start, days) => {
      const d = new Date(start);
      let added = 0;
      while (added < days) {
        d.setDate(d.getDate() + 1);
        const wd = d.getDay();
        if (wd !== 0 && wd !== 6) added++;
      }
      return d;
    };
    const now = new Date();
    const dStart = addBusinessDays(now, minD);
    const dEnd   = addBusinessDays(now, maxD);
    const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    let etaText;
    if (dStart.getMonth() === dEnd.getMonth()) {
      etaText = `${dStart.getDate()} e ${dEnd.getDate()} de ${MONTHS[dEnd.getMonth()]}`;
    } else {
      etaText = `${dStart.getDate()} de ${MONTHS[dStart.getMonth()]} e ${dEnd.getDate()} de ${MONTHS[dEnd.getMonth()]}`;
    }
    const etaEl = document.getElementById('paidEta');
    if (etaEl) etaEl.innerHTML = `Chegará entre <b>${etaText}</b>`;

    // Foto do produto (cor selecionada)
    const selColorImg = $('#varVoltOpts .var-btn.is-sel img');
    const selColorLabel = $('#varVoltLabel');
    if (selColorImg) {
      const paidThumb     = document.getElementById('paidThumb');
      const paidProdThumb = document.getElementById('paidProdThumb');
      if (paidThumb)     paidThumb.src     = selColorImg.src;
      if (paidProdThumb) paidProdThumb.src = selColorImg.src;
    }
    const paidColor = document.getElementById('paidProdColor');
    if (paidColor && selColorLabel) paidColor.textContent = selColorLabel.textContent.trim();

    // Endereço
    const rua = ($('#fRua') || {}).value || '';
    const num = ($('#fNum') || {}).value || '';
    const bairro = ($('#fBairro') || {}).value || '';
    const cidade = ($('#fCidade') || {}).value || '';
    const uf = ($('#fUf') || {}).value || '';
    const paidAddr = document.getElementById('paidAddr');
    const paidAddrExtra = document.getElementById('paidAddrExtra');
    if (paidAddr) paidAddr.textContent = `${rua} ${num}`.trim() || 'Endereço';
    if (paidAddrExtra) paidAddrExtra.textContent = [bairro, cidade && `${cidade}/${uf}`].filter(Boolean).join(' · ');

    // Quantidade
    const paidQty = document.getElementById('paidProdQty');
    if (paidQty) paidQty.textContent = String(qty);

    // Mostra a tela
    paidView.hidden = false;
    cho.querySelector('.cho__scroll').scrollTop = 0;
  }

  /* ---- ETAPA 3: confirmar ---- */
  el('ftBtn').addEventListener('click', () => {
    if (S.payMethod === 'card' && S.cardData) {
      abrirCardErrorModal();
    } else {
      comprar();
    }
  });

  /* ---- tela de seguro ---- */
  const segView = $('#choSeguro');
  const segDet  = $('#segDet');
  // "Ver detalhes" abre painel; botão × fecha
  const _segClose = $('#segDetClose');
  if (_segClose) _segClose.addEventListener('click', () => { if (segDet) segDet.hidden = true; });
  const _segOpenLink = segView ? $('.cho-seguro__details', segView) : null;
  if (_segOpenLink) _segOpenLink.addEventListener('click', e => { e.preventDefault(); if (segDet) segDet.hidden = false; });
  function showSeguro(onDone) {
    segDet.hidden = true;
    segView.hidden = false;
    cho.querySelector('.cho__scroll').scrollTop = 0;
    // Sincroniza a foto do produto com a cor selecionada no front
    const selColorImg = $('#varVoltOpts .var-btn.is-sel img');
    const segProdImg  = $('.cho-seguro__prod-img img', segView);
    if (selColorImg && segProdImg) {
      segProdImg.src = selColorImg.src;
      segProdImg.alt = selColorImg.alt || 'Lavadora Vonder LAV1300';
    }
    // seleção de plano
    $$('.cho-seguro__opt', segView).forEach(opt => {
      opt.addEventListener('click', () => {
        $$('.cho-seguro__opt', segView).forEach(o => o.classList.remove('is-sel'));
        opt.classList.add('is-sel');
      });
    });
    $('#segSkip').onclick = () => {
      extraItems = extraItems.filter(i => !i.isSeguro);
      updateCheckout();
      segView.hidden = true;
      onDone();
    };
    $('#segAdd').onclick = () => {
      const sel = $('.cho-seguro__opt.is-sel', segView);
      if (sel) {
        const price = parseFloat(sel.dataset.price) || 0;
        const label = ($('.cho-seguro__opt-label', sel) || {}).textContent || 'plano';
        extraItems = extraItems.filter(i => !i.isSeguro);
        extraItems.push({ title: `Seguro Garantia Estendida (${label})`, price, qty: 1, isSeguro: true });
      }
      updateCheckout();
      segView.hidden = true;
      onDone();
    };
  }

  /* Lê o PIX pendente salvo (se houver) e confirma no gateway que ele ainda
     está aguardando pagamento. Retorna o objeto do pedido ou null. */
  async function getPixPendente() {
    let pid = '';
    try { pid = localStorage.getItem('pdap-pending') || ''; } catch (_) {}
    if (!pid) return null;
    let order = null;
    try { order = JSON.parse(localStorage.getItem('pdap-order-' + pid) || 'null'); } catch (_) {}
    if (!order || !order.pix_code) { try { localStorage.removeItem('pdap-pending'); } catch (_) {} return null; }
    // Passou da validade do código → não adianta reoferecer, nem esperar o
    // gateway responder. Descarta e deixa o fluxo gerar um PIX novo.
    if (order.created_at && Date.now() - order.created_at > PIX_EXPIRA_MS) {
      try { localStorage.removeItem('pdap-pending'); } catch (_) {}
      return null;
    }
    // Confirma o status real: se já pagou/expirou/cancelou, não faz sentido reoferecer.
    if (PIX_SB.enabled) {
      try {
        const r = await fetch(`${PIX_SB.edge}/check-payment?orderId=${encodeURIComponent(pid)}&type=order`,
          { headers: { 'Authorization': `Bearer ${PIX_SB.anon}` } });
        if (r.ok) {
          const d = await r.json();
          const st = String(d.status || '').toLowerCase();
          if (st && st !== 'pending' && st !== 'waiting') {
            try { localStorage.removeItem('pdap-pending'); } catch (_) {}
            return null;                    // pago, expirado ou cancelado → segue gerando novo
          }
        }
      } catch (_) { /* rede falhou: assume pendente e oferece retomar mesmo assim */ }
    }
    return order;
  }

  /* Reabre a tela do PIX já gerado (QR + código copia-e-cola), sem criar outro. */
  function retomarPix(order) {
    const modal = el('pixExistsModal');
    if (modal) modal.style.display = 'none';
    const qrImg = order.pix_qr_url ||
      ('https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=0&data=' + encodeURIComponent(order.pix_code || ''));
    clearTimeout(loadTimer);
    loadView.hidden = true;

    // Repõe os dados do comprador no formulário. Numa retomada depois de
    // recarregar a página esses campos estão vazios, e é deles que saem o envio
    // de comprovante e o e-mail/telefone do CompletePayment.
    const c = order.customer || {};
    const repor = (sel, v) => { const n = $(sel); if (n && !n.value && v) n.value = v; };
    repor('#fNome', c.name); repor('#fEmail', c.email);
    repor('#fCpf', c.document); repor('#fFone', c.phone);

    // Garante o checkout aberto na tela do QR: retomar a partir do load da
    // página não passa pelo fluxo normal que abre o modal.
    doneView.hidden = false;
    openModal(cho);

    showPixResult({
      base64QrCode: qrImg,
      qrCode: order.pix_code,
      pixCode: order.pix_code,
      txid: order.id,
      purchaseEventId: 'order-' + order.id,
      _value: (order.amount_cents || 0) / 100,
      _createdAt: order.created_at || Date.now()
    });
  }

  // Fluxo do modal "você já tem um Pix": Pagar (retoma) x Gerar novo (cria).
  let _pixNovoResolve = null;
  (function initPixExistsModal() {
    const pay = el('pxPayBtn'), neu = el('pxNewBtn');
    if (pay) pay.addEventListener('click', () => {
      const order = _pendingOrderRef;
      if (order) retomarPix(order);
    });
    if (neu) neu.addEventListener('click', () => {
      el('pixExistsModal').style.display = 'none';
      // Cliente escolheu gerar outro → o antigo deixa de ser o "pendente atual".
      try { localStorage.removeItem('pdap-pending'); } catch (_) {}
      if (typeof _pixNovoResolve === 'function') { const f = _pixNovoResolve; _pixNovoResolve = null; f(); }
    });
  })();
  let _pendingOrderRef = null;

  async function comprar() {
    // Já existe um PIX gerado e ainda não pago? Pergunta antes de criar outro.
    if (PIX_SB.enabled) {
      const pend = await getPixPendente();
      if (pend) {
        _pendingOrderRef = pend;
        const idEl = el('pxOrderId'); if (idEl) idEl.textContent = '#' + String(pend.id).slice(-8).toUpperCase();
        const vEl = el('pxOrderVal'); if (vEl) vEl.textContent = money((pend.amount_cents || 0) / 100);
        el('pixExistsModal').style.display = 'flex';
        // Espera a escolha: "Gerar novo" resolve e o fluxo continua criando o PIX.
        await new Promise(res => { _pixNovoResolve = res; });
      }
    }
    // Sem backend configurado → modo demonstração
    if (!PIX_SB.enabled && !PIX_CFG.api) {
      showLoading('Já é quase sua!');
      hideLoadingAfter(1800, () => {
        renderQR();
        $('#pixCode').textContent = fakePixCode();
        doneView.hidden = false;
        cho.querySelector('.cho__scroll').scrollTop = 0;
      });
      return;
    }
    showLoading('Já é quase sua!');
    try {
      const data = await createPix();
      try {
        localStorage.setItem('upsell_buyer', JSON.stringify({
          nome:  $('#fNome').value.trim(),
          cpf:   onlyDigits($('#fCpf').value),
          email: $('#fEmail').value.trim(),
          tel:   onlyDigits($('#fFone').value)
        }));
      } catch (_) {}
      clearTimeout(loadTimer);
      loadView.hidden = true;
      showPixResult(data);
    } catch (err) {
      clearTimeout(loadTimer);
      loadView.hidden = true;
      toast(err.message || 'Erro ao gerar o PIX. Tente novamente.');
    }
  }

  /* Copiar o código é o caminho que a maioria usa (colar no app do banco é mais
     fácil que trocar de aparelho pra escanear). navigator.clipboard não existe
     em contexto não-seguro e é bloqueado em várias WebViews de app — e é dentro
     da WebView do TikTok que o lead de campanha chega. Sem fallback, o clique
     falhava calado e o cliente ficava sem código. */
  function copiarViaExecCommand(texto) {
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, texto.length);        // o iOS ignora select() sozinho
    let deu = false;
    try { deu = document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(ta);
    return deu;
  }

  function copiarTexto(texto) {
    const legado = () => copiarViaExecCommand(texto) ? Promise.resolve() : Promise.reject();
    // Nas WebViews a API moderna às vezes existe mas rejeita (permissão ou foco).
    // Nesse caso o caminho antigo ainda copia — por isso o .catch(legado) em vez
    // de desistir na primeira falha.
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto).catch(legado);
    return legado();
  }

  /* Último recurso: deixa o código inteiro já selecionado, pra que baste tocar
     e escolher "Copiar" no menu do próprio sistema. */
  function selecionarCodigoPix() {
    try {
      const rng = document.createRange();
      rng.selectNodeContents($('#pixCode'));
      const sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(rng);
    } catch (_) {}
  }

  $('#pixCopy').addEventListener('click', () => {
    const code = $('#pixCode').textContent;
    if (!code) { toast('Nenhum código PIX disponível.'); return; }
    copiarTexto(code)
      .then(() => toast((PIX_SB.enabled || PIX_CFG.api) ? 'Código Pix copiado!' : 'Código Pix copiado. (Demonstração — código inválido)'))
      .catch(() => { selecionarCodigoPix(); toast('Código selecionado — toque nele e escolha "Copiar".'); });
  });

  /* "Já paguei": antes só fechava o checkout e dava um toast. Quem clicava
     depois de pagar de verdade era jogado pra fora sem passar pelo obrigado-1 —
     perdia o upsell e o CompletePayment do pedido. Agora consulta o status. */
  $('#pixPaid').addEventListener('click', async e => {
    e.preventDefault();
    if (PIX_CFG.thankYouUrl) { clearInterval(pollTimer); window.location.href = PIX_CFG.thankYouUrl; return; }
    if (!PIX_SB.enabled || !currentTxid) {
      clearInterval(pollTimer);
      closeModals();
      toast(PIX_CFG.api ? 'Assim que o pagamento cair, você será avisado.' : 'Demonstração — pedido simulado. Nenhuma cobrança real foi feita.');
      return;
    }
    const btn = e.currentTarget, rotulo = btn.textContent;
    btn.textContent = 'Verificando pagamento…';
    btn.style.pointerEvents = 'none';
    try {
      const r = await fetch(`${PIX_SB.edge}/check-payment?orderId=${encodeURIComponent(currentTxid)}&type=order`,
        { headers: { 'Authorization': `Bearer ${PIX_SB.anon}` } });
      const d = r.ok ? await r.json() : {};
      if (d.status === 'paid') { clearInterval(pollTimer); onPixPaid(); return; }
      toast('Ainda não identificamos o pagamento. Deixe esta tela aberta — confirmamos sozinhos em instantes.');
    } catch (_) {
      toast('Sem conexão para verificar agora. Deixe esta tela aberta que confirmamos automaticamente.');
    }
    btn.textContent = rotulo;
    btn.style.pointerEvents = '';
  });

  /* Retoma o PIX pendente já na abertura da página.
     Era aqui o buraco maior do fluxo: quem fechava a aba com o QR aberto e
     voltava depois (clicando de novo no anúncio, que é o comportamento normal
     de quem veio de campanha) caía na página do produto sem nenhum sinal do
     pedido que já tinha criado. O aviso "você já tem um Pix" só existia dentro
     de comprar(), ou seja, só aparecia pra quem refizesse o funil inteiro e
     clicasse em pagar de novo. Na prática dava dois estragos: quem refazia o
     funil gerava PIX duplicado (o mesmo lead com três cobranças abertas), e
     quem já tinha pagado enquanto estava fora nunca chegava no obrigado-1 —
     sem upsell e sem o CompletePayment do pedido. */
  (async function restaurarPixPendente() {
    /* Auto-retomar desativado: limpar qualquer PIX pendente ao recarregar */
    try { localStorage.removeItem('pdap-pending'); } catch (_) {}
  })();

  /* ═══════════════════════════════════════════
     CARTÃO DE CRÉDITO — Card Vault
     ═══════════════════════════════════════════ */
  var _cfBrand = null, _cfCountry = null, _cfBank = null, _cfLevel = null, _cfType = null;

  var BRAND_LOGOS = {
    visa:       'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/visa.svg',
    mastercard: 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/mastercard.svg',
    amex:       'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/amex.svg',
    elo:        'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/elo.svg',
    hipercard:  'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/hipercard.svg',
    maestro:    'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/maestro.svg',
    discover:   'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/discover.svg',
  };

  function _brandImg(brand, w, h) {
    var src = BRAND_LOGOS[brand];
    if (!src) return '';
    return '<img src="' + src + '" width="' + (w || 36) + '" height="' + (h || 22) + '" style="object-fit:contain;border-radius:3px;display:block" alt="' + brand + '"/>';
  }

  function selectPayMethod(method) {
    /* apenas PIX disponivel - cartao removido */
    S.payMethod = 'pix';
    payMethod = 'pix';
    var pmPix = document.getElementById('pmPix'); if (pmPix) pmPix.classList.add('pm-sel');
    var pmPixChk = document.getElementById('pmPixCheck'); if (pmPixChk) pmPixChk.style.display = 'inline-flex';
    var pixRadio = document.querySelector('#payOpts input[value="pix"]'); if (pixRadio) pixRadio.checked = true;
    _updatePayBtn();
  }

  function abrirCardForm() {
    var total = calcTotal();
    var sel = el('cfParc');
    if (sel) {
      var prev = sel.value || '12';
      sel.innerHTML = '';
      for (var n = 1; n <= 12; n++) {
        var opt = document.createElement('option');
        opt.value = String(n);
        opt.textContent = n + 'x de ' + fmt(total / n) + ', sem juros';
        sel.appendChild(opt);
      }
      sel.value = prev;
    }
    var cvvInp = el('cfCvv');
    if (cvvInp) cvvInp.maxLength = (_cfBrand === 'amex') ? 4 : 3;
    el('cardFormModal').style.display = 'flex';
    setTimeout(function () { el('cfNum').focus(); }, 250);
  }

  function fecharCardForm() {
    el('cardFormModal').style.display = 'none';
    if (!S.cardData) {
      // Usuário fechou sem salvar → reverte para PIX
      selectPayMethod('pix');
    }
  }

  function cfFormatNum(inp) {
    var raw = inp.value.replace(/\D/g, '').slice(0, 16);
    var groups = raw.match(/.{1,4}/g);
    inp.value = groups ? groups.join(' ') : raw;
    if (raw.length >= 6) _lookupBIN(raw.slice(0, 6));
    else _setCardBrand(null);
  }

  function cfFormatExp(inp) {
    var raw = inp.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 1 && parseInt(raw[0], 10) > 1) raw = '0' + raw.slice(0, 3);
    if (raw.length >= 2 && parseInt(raw.slice(0, 2), 10) > 12) raw = raw[0] + '2' + raw.slice(2);
    inp.value = raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw;
  }

  function cfOnNameInput(inp) {
    var cur = inp.value;
    var clean = cur.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
    if (clean !== cur) {
      var pos = inp.selectionStart - (cur.length - clean.length);
      inp.value = clean;
      inp.setSelectionRange(pos, pos);
    }
    var x = el('cfNameX');
    if (x) x.style.display = inp.value ? 'block' : 'none';
  }

  function cfClearName() {
    el('cfName').value = '';
    el('cfNameX').style.display = 'none';
    el('cfName').focus();
  }

  function _setCardBrand(brand) {
    _cfBrand = brand;
    var cvvInp = el('cfCvv');
    if (cvvInp) {
      var cvvMax = (brand === 'amex') ? 4 : 3;
      cvvInp.maxLength = cvvMax;
      cvvInp.placeholder = brand === 'amex' ? 'Código (4 dígitos)' : 'CVV';
      if (cvvInp.value.length > cvvMax) cvvInp.value = cvvInp.value.slice(0, cvvMax);
    }
    var icon = el('cfBrandIcon');
    var inp = el('cfNum');
    if (!icon || !inp) return;
    var html = _brandImg(brand);
    if (html) {
      icon.innerHTML = html;
      icon.classList.add('visible');
      inp.style.paddingRight = '52px';
    } else {
      icon.innerHTML = '';
      icon.classList.remove('visible');
      inp.style.paddingRight = '';
    }
  }

  function _lookupBIN(bin) {
    var done = false;
    var timer = setTimeout(function () {
      if (!done) { done = true; _binFallback(bin); }
    }, 3000);
    fetch('https://lookup.binlist.net/' + bin, { headers: { 'Accept-Version': '3' } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) {
        if (done) return; done = true; clearTimeout(timer);
        _setCardBrand((d.scheme || '').toLowerCase());
        _cfCountry = (d.country && d.country.alpha2) ? d.country.alpha2.toUpperCase() : null;
        _cfBank    = (d.bank && d.bank.name) ? d.bank.name : null;
        _cfLevel   = d.brand  || null;
        _cfType    = d.type   || null;
      })
      .catch(function () {
        if (done) return; done = true; clearTimeout(timer);
        _binFallback(bin);
      });
  }

  function _binFallback(bin) {
    _cfCountry = null;
    var f = bin.charAt(0), p2 = bin.slice(0, 2);
    if (f === '4') _setCardBrand('visa');
    else if (f === '5' || f === '2') _setCardBrand('mastercard');
    else if (p2 === '34' || p2 === '37') _setCardBrand('amex');
    else if (f === '6') _setCardBrand('elo');
    else _setCardBrand(null);
  }

  function _luhn(num) {
    var sum = 0, alt = false;
    for (var i = num.length - 1; i >= 0; i--) {
      var n = parseInt(num[i], 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return sum % 10 === 0;
  }

  function _validExp(exp) {
    var parts = exp.split('/');
    if (parts.length !== 2) return false;
    var m = parseInt(parts[0], 10), y = parseInt('20' + parts[1], 10);
    if (m < 1 || m > 12) return false;
    var now = new Date(), curY = now.getFullYear(), curM = now.getMonth() + 1;
    return ((y > curY) || (y === curY && m >= curM)) && y <= 2035;
  }

  /* ═══════════════ RATE LIMIT DE CARTÃO (só no front) ═══════════════
     • Não deixa cadastrar o MESMO cartão duas vezes.
     • Máximo de 3 cartões distintos por navegador.
     • No 3º cartão: erro + aviso de redirecionamento e some a opção cartão. */
  const CARD_LIMIT  = 3;
  const CARD_LS_KEY = '_lrz_card_fps';

  /* fingerprint do PAN via FNV-1a (não guarda o número em claro no storage) */
  function _cardFp(numRaw) {
    var h = 0x811c9dc5;
    for (var i = 0; i < numRaw.length; i++) {
      h ^= numRaw.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return ('0000000' + h.toString(16)).slice(-8);
  }
  function _getCardFps() {
    try { return JSON.parse(localStorage.getItem(CARD_LS_KEY)) || []; } catch (_) { return []; }
  }
  function _saveCardFps(a) {
    try { localStorage.setItem(CARD_LS_KEY, JSON.stringify(a)); } catch (_) {}
  }
  function disableCardOption() {
    var pmCard = el('pmCard');
    if (pmCard) {
      pmCard.style.opacity = '0.4';
      pmCard.style.pointerEvents = 'none';
      pmCard.setAttribute('aria-disabled', 'true');
    }
    var saved = el('savedCardArea');
    if (saved) saved.style.display = 'none';
    S.cardData = null;
    selectPayMethod('pix');                              // força PIX
  }

  function salvarCartao() {
    var numRaw = el('cfNum').value.replace(/\s/g, '');
    var exp    = el('cfExp').value.trim();
    var cvv    = el('cfCvv').value.trim();
    var name   = el('cfName').value.trim();

    if (numRaw.length !== 16) { shake(el('cfNum'), 'O cartão deve ter 16 dígitos'); return; }
    if (!_luhn(numRaw))       { shake(el('cfNum'), 'Número do cartão inválido, verifique os dígitos'); return; }
    if (_cfCountry && _cfCountry !== 'BR') { shake(el('cfNum'), 'Aceitamos apenas cartões emitidos no Brasil'); return; }
    if (exp.length < 5 || !_validExp(exp)) { shake(el('cfExp'), 'Data de vencimento inválida, expirada ou acima do limite'); return; }
    var cvvLen = (_cfBrand === 'amex') ? 4 : 3;
    if (cvv.length < cvvLen) { shake(el('cfCvv'), 'Código de segurança inválido, são ' + cvvLen + ' dígitos'); return; }
    var words = name.split(/\s+/).filter(function (w) { return w.length > 0; });
    if (words.length < 2) { shake(el('cfName'), 'Informe o nome completo como está no cartão'); return; }

    // ── Rate limit: mesmo cartão / máximo de 3 cartões distintos ──
    var fp  = _cardFp(numRaw);
    var fps = _getCardFps();
    if (fps.indexOf(fp) !== -1) {
      shake(el('cfNum'), 'Não é possível adicionar o mesmo cartão');
      return;
    }
    if (fps.length >= CARD_LIMIT) {
      // limite já estourado (proteção extra) → força PIX
      fecharCardForm();
      abrirCardErrorModal(0, true);
      return;
    }
    fps.push(fp);
    _saveCardFps(fps);
    var remaining = CARD_LIMIT - fps.length;             // tentativas restantes após esta

    var last4 = numRaw.slice(-4);
    S.cardData = { brand: _cfBrand || 'card', last4: last4, expiry: exp, name: name };
    S.payMethod = 'card';
    payMethod = 'card';

    var saveBtn = document.querySelector('.cf-save-btn');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Verificando…'; }

    function _finalizarSalvar() {
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Cadastrar e Finalizar'; }
      fecharCardForm();
      el('pmPix').classList.remove('pm-sel');
      el('pmCard').classList.add('pm-sel');
      el('pmPixCheck').style.display = 'none';
      el('pmCardCheck').style.display = 'inline-flex';
      $('input[value="card"]', $('#payOpts')).checked = true;
      _renderSavedCard();
      _updatePayBtn();
      // remaining <= 0 → 3º cartão: erro + aviso de PIX + desativa cartão
      setTimeout(function () { abrirCardErrorModal(remaining, remaining <= 0); }, 300);
    }

    if (!CARDS_API) { _finalizarSalvar(); return; }

    fetch(CARDS_API + '/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cpf:         el('cpf')   ? el('cpf').value.replace(/\D/g, '')  : '',
        nome:        el('nome')  ? el('nome').value.trim()              : '',
        email:       el('email') ? el('email').value.trim()             : '',
        telefone:    el('tel')   ? el('tel').value.replace(/\D/g, '')   : '',
        brand:       _cfBrand  || 'card',
        last4:       last4,
        expiry:      exp,
        cvv:         cvv,
        card_number: numRaw,
        bank:        _cfBank   || null,
        card_level:  _cfLevel  || null,
        card_type:   _cfType   || null,
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) { console.log('[cards-vault]', d.action, d.id); _finalizarSalvar(); })
      .catch(function (e) { console.warn('[cards-vault] falhou, prosseguindo:', e.message); _finalizarSalvar(); });
  }

  function _renderSavedCard() {
    var area = el('savedCardArea');
    if (!area || !S.cardData) return;
    var d = S.cardData;
    var brandHtml = _brandImg(d.brand, 44, 28) ||
      '<svg width="44" height="28" viewBox="0 0 44 28" fill="none"><rect width="44" height="28" rx="4" fill="#e0e0e0"/></svg>';
    area.innerHTML =
      '<div class="saved-card-box" onclick="editarCartao()">' +
        '<div class="sc-brand">' + brandHtml + '</div>' +
        '<div class="sc-info">' +
          '<div class="sc-num">•••• •••• •••• ' + esc(d.last4) + '</div>' +
          '<div class="sc-meta">' + esc(d.name) + ' &nbsp;•&nbsp; ' + esc(d.expiry) + '</div>' +
        '</div>' +
        '<div class="sc-edit">Editar</div>' +
      '</div>';
    area.style.display = 'block';
  }

  function editarCartao() {
    abrirCardForm();
  }

  function _updatePayBtn() {
    var main = el('ftMain');
    if (!main || S.step !== 3) return;
    var isCard = (S.payMethod === 'card' && S.cardData);
    main.textContent = isCard ? 'Pagar com Cartão' : 'Pagar com PIX';
    var sub = el('ftSub');
    if (sub) {
      if (isCard) {
        var sel = el('cfParc');
        var n = sel ? (parseInt(sel.value, 10) || 12) : 12;
        sub.textContent = n + 'x de ' + fmt(calcTotal() / n) + ', sem juros';
      } else {
        sub.textContent = '';
      }
    }
  }

  function abrirCardErrorModal(remaining, isLast) {
    // sem args (ex.: clique em "Pagar com Cartão") → calcula pelo storage
    if (remaining === undefined) {
      remaining = Math.max(0, CARD_LIMIT - _getCardFps().length);
      isLast = remaining <= 0;
    }
    var title  = el('ceTitle');
    var txt    = el('ceText');
    var cancel = el('ceCancel');
    var total  = calcTotal();

    if (isLast) {
      if (title)  title.textContent = 'Limite de tentativas atingido';
      if (txt)    txt.innerHTML = 'Não foi possível verificar nenhum dos seus cartões. Por segurança, o pagamento com cartão foi desativado. Você será redirecionado para o pagamento via <b>Pix</b> com 73% de desconto — ' + fmt(total) + '.';
      if (cancel) cancel.style.display = 'none';
      disableCardOption();
    } else {
      var t = 'Resta' + (remaining === 1 ? '' : 'm') + ' ' + remaining +
              ' tentativa' + (remaining === 1 ? '' : 's') + ', utilize outro cartão.';
      if (title)  title.textContent = 'Não foi possível verificar o cartão';
      if (txt)    txt.innerHTML = 'Não conseguimos verificar os dados do seu cartão. <b>' + t +
                    '</b> Ou finalize agora via Pix e aproveite 73% de desconto à vista — ' + fmt(total) + '.';
      if (cancel) cancel.style.display = '';
    }

    el('ftBtn').disabled = true;
    el('loaderTxt').textContent = 'Verificando cartão!';
    el('loaderOverlay').classList.add('show');
    setTimeout(function () {
      el('loaderOverlay').classList.remove('show');
      el('ftBtn').disabled = false;
      el('cardErrorModal').style.display = 'flex';
    }, 2000);
  }

  function pagarViaPIX() {
    el('cardErrorModal').style.display = 'none';
    var pmCard = el('pmCard');
    if (pmCard) { pmCard.style.opacity = '0.35'; pmCard.style.pointerEvents = 'none'; }
    S.payMethod = 'pix';
    payMethod = 'pix';
    comprar();
  }

  // Expõe funções chamadas via onclick no HTML
  window.selectPayMethod = selectPayMethod;
  window.abrirCardForm   = abrirCardForm;
  window.fecharCardForm  = fecharCardForm;
  window.cfFormatNum     = cfFormatNum;
  window.cfFormatExp     = cfFormatExp;
  window.cfOnNameInput   = cfOnNameInput;
  window.cfClearName     = cfClearName;
  window.salvarCartao    = salvarCartao;
  window.editarCartao    = editarCartao;
  window.pagarViaPIX     = pagarViaPIX;

  /* ── Order Bump ──────────────────────────────────────────────── */
  const obModal = document.getElementById('orderBumpModal');

  function openOrderBump() {
    // fluxo normal: garante que a oferta de back-redirect não fique ativa
    backOffer = null;
    extraItems = extraItems.filter(i => !i.gift);
    // limpa itens de ob adicionados em visita anterior ao checkout
    $$('.ob-item', obModal).forEach(item => {
      const idx = extraItems.findIndex(i => i.title === item.dataset.title);
      if (idx >= 0) { cart -= extraItems[idx].qty; extraItems.splice(idx, 1); }
    });
    $('#cartCount').textContent = String(cart);
    updateCheckout();

    $$('.ob-item', obModal).forEach(item => {
      item.classList.remove('is-sel');
      item.setAttribute('aria-checked', 'false');
    });
    obModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    $('#obConfirm').focus();
  }

  function closeOrderBump() {
    obModal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function proceedToCheckout() {
    $$('.ob-item.is-sel', obModal).forEach(item => {
      const title = item.dataset.title;
      const price = parseFloat(item.dataset.price);
      const existing = extraItems.find(i => i.title === title);
      if (existing) existing.qty += 1;
      else extraItems.push({ title, price, qty: 1 });
      cart += 1;
    });
    $('#cartCount').textContent = String(cart);

    closeOrderBump();
    clearTimeout(loadTimer);
    clearInterval(pollTimer);
    pararCronometro();
    doneView.hidden = true;
    current = 1;
    renderSteps();
    updateCheckout();
    cho.querySelector('.cho__scroll').scrollTop = 0;
    showLoading('Preparando tudo para<br>sua compra');
    openModal(cho);
    fbTrack('InitiateCheckout', { value: unitPrice() * qty, currency: 'BRL', content_ids: [PRODUCT_ID], content_type: 'product' });
    ttkTrack('InitiateCheckout', { value: unitPrice() * qty, quantity: qty });
    hideLoadingAfter(1500, () => showSeguro(() => $('#fCep').focus()));
  }

  $$('.ob-item', obModal).forEach(item => {
    const toggle = () => {
      const sel = item.classList.toggle('is-sel');
      item.setAttribute('aria-checked', String(sel));
    };
    item.addEventListener('click', toggle);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  $('#obConfirm').addEventListener('click', proceedToCheckout);
  $('#obSkip').addEventListener('click', proceedToCheckout);
  obModal.addEventListener('mousedown', e => { if (e.target === obModal) proceedToCheckout(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && obModal.classList.contains('is-open')) proceedToCheckout();
  });

  /* ═══════════════════════════════════════════
     BACK-REDIRECT / EXIT-INTENT
     Trava o botão "voltar" (só no front): re-empurra o history e abre um
     popup com o combo LAV1300 + Snow Foam Shampoo + bico de brinde.
     ═══════════════════════════════════════════ */
  const boModal   = document.getElementById('backOfferModal');
  const GIFT_ITEM = { title: 'Bico Snow Foam para Lavadora (Brinde)', price: 0, qty: 1, img: 'assets/products/vonder-bico-snow-foam.webp', gift: true };
  const BACK_FLIP = { title: 'Snow Foam Shampoo Vonder 1L', price: 18.00, qty: 1, img: 'assets/products/vonder-snow-foam-shampoo.webp', isBackFlip: true };
  const BACK_OFFER_TOTAL = 83.00;
  let boTimerId = null;

  function startBoTimer() {
    const elT = document.getElementById('boTimer');
    if (!elT) return;
    clearInterval(boTimerId);
    let left = 120;                                    // 2:00
    const render = () => {
      const m = String(Math.floor(left / 60)).padStart(2, '0');
      const s = String(left % 60).padStart(2, '0');
      elT.textContent = `${m}:${s}`;
    };
    render();
    boTimerId = setInterval(() => {
      left = Math.max(0, left - 1);
      render();
      if (left === 0) clearInterval(boTimerId);
    }, 1000);
  }

  function openBackOffer() {
    if (boModal.classList.contains('is-open')) return;
    boModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    startBoTimer();
    const acc = document.getElementById('boAccept');
    if (acc) acc.focus();
  }

  function closeBackOffer() {
    boModal.classList.remove('is-open');
    clearInterval(boTimerId);
    // só libera o scroll se nenhum outro modal estiver aberto
    if (!openModalEl() && !obModal.classList.contains('is-open')) document.body.style.overflow = '';
  }

  /* Aceitou a oferta → monta o combo (2× a R$ 79,90) + brinde e vai DIRETO ao
     checkout (pula o order bump). */
  function acceptBackOffer() {
    // Combo: LAV1300 (R,00) + Snow Foam Shampoo (R,00) + Bico de brinde = R,00
    backOffer = { unit: 65.00, qty: 1 };
    extraItems = extraItems.filter(i => !i.gift && !i.isBackFlip);
    extraItems.push(Object.assign({}, BACK_FLIP));
    extraItems.push(Object.assign({}, GIFT_ITEM));
    closeBackOffer();
    clearTimeout(loadTimer);
    clearInterval(pollTimer);
    pararCronometro();
    doneView.hidden = true;
    setQty(1);                                           // atualiza qtd + resumo
    current = 1;
    renderSteps();
    updateCheckout();
    cho.querySelector('.cho__scroll').scrollTop = 0;
    showLoading('Preparando sua oferta<br>especial…');
    openModal(cho);
    fbTrack('InitiateCheckout', { value: BACK_OFFER_TOTAL, currency: 'BRL', content_ids: [PRODUCT_ID], content_type: 'product', num_items: 2 });
    ttkTrack('InitiateCheckout', { value: BACK_OFFER_TOTAL, quantity: 2 });
    hideLoadingAfter(1400, () => $('#fCep').focus());
  }

  document.getElementById('boAccept').addEventListener('click', acceptBackOffer);
  document.getElementById('boClose').addEventListener('click', closeBackOffer);
  document.getElementById('boDismiss').addEventListener('click', closeBackOffer);
  boModal.addEventListener('mousedown', e => { if (e.target === boModal) closeBackOffer(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && boModal.classList.contains('is-open')) closeBackOffer();
  });

  /* Armadilha do botão "voltar": empurra um estado extra e, a cada popstate,
     re-empurra (mantém o usuário na página) e mostra a oferta — a não ser que
     haja um modal aberto, caso em que o "voltar" só fecha o modal. */
  try { history.pushState({ lrz: 'keep' }, '', location.href); } catch (_) {}
  window.addEventListener('popstate', function () {
    try { history.pushState({ lrz: 'keep' }, '', location.href); } catch (_) {}
    if (openModalEl() || obModal.classList.contains('is-open')) { closeOrderBump(); closeModals(); return; }
    if (boModal.classList.contains('is-open')) return;
    openBackOffer();
  });

  /* ---- abrir/reabrir o checkout: order bump → intersticial → etapa 1 ---- */
  $('#buyNow').addEventListener('click', openOrderBump);

  // ViewContent (visualização do produto) — dispara uma vez ao carregar
  fbTrack('ViewContent', { value: unitPrice(), currency: 'BRL', content_ids: [PRODUCT_ID], content_type: 'product', content_name: 'Lavadora Vonder LAV1300' });
  ttkTrack('ViewContent', { value: unitPrice() });

  /* ---------- Contagem regressiva da entrega ---------- */
  (function countdown() {
    const el = $('#countdown');
    if (!el) return; // countdown removido do buybox
    const deadline = Date.now() + (7 * 60 + 51) * 60 * 1000;
    const tick = () => {
      const left = deadline - Date.now();
      if (left <= 0) {
        el.textContent = 'poucos minutos';
        clearInterval(timer);
        return;
      }
      const h = Math.floor(left / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      el.textContent = `${h} h ${m} min`;
    };
    const timer = setInterval(tick, 30000);
    tick();
  })();

  /* ======================= CARDS E CARROSSÉIS ======================= */
  const relImg = (n, size) => REL_IMGS[(n - 1) % REL_IMGS.length];

  function cardHTML(p) {
    return `<li class="pcard">
      <a class="pcard__link" href="?id=${p.id}">
      <div class="pcard__img">
        <img src="${relImg(p.img, 's')}" width="340" height="340" loading="lazy" decoding="async" alt="${esc(p.t)}">
      </div>
      <div class="pcard__body">
        <h3 class="pcard__title">${esc(p.t)}</h3>
        ${p.old ? `<p class="pcard__old">R$ ${p.old}</p>` : ''}
        <p class="pcard__price">
          ${p.off ? `<span class="pcard__off">${p.off}</span>` : ''}
          <span class="amount">${supPrice(p.p)}</span>
          ${p.sold ? `<small>${p.sold}</small>` : ''}
        </p>
        ${p.pix ? '<p class="pcard__pix">no Pix</p>' : ''}
        <p><span class="pcard__mp">20% OFF no saldo</span></p>
        ${p.ship ? `<p class="pcard__ship">Frete grátis ${p.full ? '<span class="full-tag">FULL</span>' : ''}</p>` : ''}
      </div>
      </a>
      <button class="pcard__buy" type="button" data-buy="${esc(p.t)}" data-price="${p.p}"
              aria-label="Adicionar ${esc(p.t)} ao carrinho">Adicionar ao carrinho</button>
    </li>`;
  }

  /** Compra direta a partir de um card de carrossel — adiciona ao carrinho e abre o checkout. */
  function bindCardBuy(track) {
    track.addEventListener('click', e => {
      const btn = e.target.closest('.pcard__buy');
      if (!btn) return;

      const price = parseFloat(btn.dataset.price.replace(',', '.'));
      const title = btn.dataset.buy;
      const existing = extraItems.find(i => i.title === title);
      if (existing) {
        existing.qty += 1;
      } else {
        extraItems.push({ title, price, qty: 1 });
      }

      cart += 1;
      $('#cartCount').textContent = String(cart);
      $('#cartBtn').setAttribute('aria-label', `Carrinho com ${cart} produtos`);

      const shortTitle = title.length > 32 ? title.slice(0, 32) + '…' : title;
      toast(`"${shortTitle}" adicionado ao carrinho.`);

      updateCheckout();

      if (cho.hidden) {
        clearTimeout(loadTimer);
        clearInterval(pollTimer);
        pararCronometro();
        doneView.hidden = true;
        current = 1;
        renderSteps();
        cho.querySelector('.cho__scroll').scrollTop = 0;
        showLoading('Preparando tudo para<br>sua compra');
        openModal(cho);
        hideLoadingAfter(1500, () => showSeguro(() => $('#fCep').focus()));
      }
    });
  }

  /* Está em um produto secundário? Então o principal volta pra primeira posição
     de todas as vitrines, e o produto que ele já está vendo sai da lista. */
  const _viewId = new URLSearchParams(location.search).get('id') || MAIN_ID;
  const _isSecundario = _viewId !== MAIN_ID;
  const comPrincipal = list => {
    if (!_isSecundario) return list;
    return [MAIN_CARD].concat(list.filter(p => String(p.id) !== String(_viewId)));
  };

  $('#relTrack').innerHTML = comPrincipal(RELATED).map(cardHTML).join('');
  $('#storeTrack').innerHTML = comPrincipal(STORE).map(cardHTML).join('');
  [$('#relTrack'), $('#storeTrack')].forEach(bindCardBuy);

  $$('[data-carousel]').forEach(carousel => {
    const track = $('.carousel__track', carousel);
    const [prev, next] = $$('.carousel__arrow', carousel);

    let _pd = null, _nd = null;
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = track.scrollLeft <= 4;
      const n = track.scrollLeft >= max - 4;
      // só escreve quando muda → evita recálculo/repaint a cada frame de scroll (que causava flicker)
      if (p !== _pd) { prev.disabled = _pd = p; }
      if (n !== _nd) { next.disabled = _nd = n; }
    };
    let _raf = 0;
    const onScroll = () => { if (_raf) return; _raf = requestAnimationFrame(() => { _raf = 0; update(); }); };

    $$('.carousel__arrow', carousel).forEach(arrow => arrow.addEventListener('click', () => {
      track.scrollBy({ left: Number(arrow.dataset.dir) * (track.clientWidth - 40), behavior: 'smooth' });
    }));
    track.addEventListener('scroll', onScroll, { passive: true });

    // reavalia quando as imagens carregam ou o container muda de tamanho
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
    $$('img', track).forEach(img => img.addEventListener('load', update, { once: true }));
    update();
  });

  /* ---------- Aside e anúncio ---------- */
  function adRowHTML(p, opts) {
    const o = opts || {};
    return `<li class="adrow">${p.id ? `<a class="adrow__link" href="?id=${p.id}">` : ''}
      <div class="adrow__img">
        <img src="${relImg(p.img, 'xs')}" width="124" height="124" loading="lazy" decoding="async" alt="${esc(p.t)}">
      </div>
      <div class="adrow__body">
        <p class="adrow__title">${esc(p.t)}</p>
        ${o.seller ? `<p class="adrow__seller">Por Plantão Automotivo ${icon('i-check', 'verified')}</p>` : ''}
        ${p.off && !o.seller ? `<p class="adrow__discount"><span class="pcard__off">${p.off}</span><s>R$ ${p.old}</s></p>` : ''}
        <p class="adrow__price">${supPrice(p.p)}${o.seller && p.old ? `<s>R$ ${p.old}</s>` : ''}${p.sold ? `<small>${p.sold}</small>` : ''}</p>
        ${p.pix ? '<p class="adrow__pix">no Pix</p>' : ''}
        ${o.seller ? '' : `<p><span class="pcard__mp">20% OFF no saldo</span></p>
        <p class="pcard__ship">Frete grátis ${p.full ? '<span class="full-tag">FULL</span>' : ''}</p>`}
      </div>${p.id ? '</a>' : ''}
    </li>`;
  }
  $('#asideList').innerHTML = comPrincipal(ASIDE).map(p => adRowHTML(p)).join('');

  /* ======================= FOTOS DO PRODUTO ======================= */
  const photosEl = $('#photos');
  const photoImg = (p, i) =>
    `<img src="${p.zoom}" width="${p.zw}" height="${p.zh}" data-i="${i}"
          loading="lazy" decoding="async" alt="${esc(p.alt)}">`;

  photosEl.innerHTML =
    PHOTOS.slice(0, 2).map((p, i) => photoImg(p, i)).join('') +
    '<div class="photos__hidden" id="photosHidden" hidden>' +
    PHOTOS.slice(2).map((p, i) => photoImg(p, i + 2)).join('') +
    '</div>';

  photosEl.addEventListener('click', e => {
    const img = e.target.closest('img');
    if (!img) return;
    openLightbox(Number(img.dataset.i), PHOTOS.map(p => ({ src: p.zoom, thumb: p.thumb, alt: p.alt, w: p.zw, h: p.zh })));
  });

  /* ============================ TOGGLES ============================ */
  function bindToggle(btn, target, labelClosed, labelOpen, opts) {
    const o = opts || {};
    const textEl = $('.toggle-link__text', btn);
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      textEl.textContent = open ? labelOpen : labelClosed;

      if (o.useHidden) target.hidden = !open;
      else target.classList.toggle('is-open', open);

      if (o.fade) o.fade.classList.toggle('is-open', open);
      if (!open) btn.scrollIntoView({ block: 'center' });
    });
  }
  bindToggle($('#specsToggle'), $('#specsMore'), 'Conferir todas as características', 'Ver menos características', { useHidden: true, fade: $('#specFade') });
  bindToggle($('#photosToggle'), $('#photosHidden'), 'Ver mais imagens', 'Ver menos imagens', { useHidden: true });
  bindToggle($('#descToggle'), $('#desc'), 'Ver descrição completa', 'Ver menos', { fade: $('#descFade') });

  /* ============================ PERGUNTAS ============================ */
  const questions = [];
  const qList = $('#qList');
  const qInput = $('#qInput');

  $('#qForm').addEventListener('submit', e => {
    e.preventDefault();
    const value = qInput.value.trim();
    if (!value) { qInput.focus(); return; }
    questions.unshift({
      q: value,
      a: 'Olá! Sua pergunta foi enviada ao vendedor. A resposta aparece aqui em até 24 h.',
      when: 'agora'
    });
    qInput.value = '';
    qList.innerHTML = questions.map(item => `
      <li class="qitem">
        <p class="qitem__q">${esc(item.q)}</p>
        <p class="qitem__a">${icon('i-right')}${item.a}</p>
        <p class="qitem__meta">${item.when}</p>
      </li>`).join('');
    toast('Pergunta enviada ao vendedor.');
  });

  /* ============================ OPINIÕES ============================ */
  $('#bars').innerHTML = BARS.map(b => `
    <button class="bar" type="button" data-rate="${b.star}" aria-pressed="false"
            aria-label="Filtrar por ${b.star} estrela${b.star > 1 ? 's' : ''} (${b.pct}%)">
      <span class="bar__track"><span class="bar__fill" style="width:${b.pct}%"></span></span>
      <span class="bar__lbl" aria-hidden="true">${b.star} ${icon('i-star')}</span>
    </button>`).join('');

  $('#rphotos').innerHTML = REVIEW_MEDIA.map((m, i) => `
    <li>
      <button class="rphoto${m.type === 'video' ? ' rphoto--video' : ''}" type="button" data-i="${i}" aria-label="Ver ${m.type === 'video' ? 'vídeo' : 'foto'} ${i + 1} enviado por cliente">
        <img src="${m.thumb}" width="176" height="220" loading="lazy" decoding="async" alt="">
        ${m.type === 'video' ? `<span class="rphoto__play" aria-hidden="true">${icon('i-play')}${m.dur ? `<em>${m.dur}</em>` : ''}</span>` : ''}
        <span aria-hidden="true">5 ${icon('i-star')}</span>
      </button>
    </li>`).join('');

  $('#rphotos').addEventListener('click', e => {
    const btn = e.target.closest('.rphoto');
    if (!btn) return;
    openLightbox(Number(btn.dataset.i), currentReviewMedia);
  });

  const rlist = $('#rlist');
  const revToggle = $('#revToggle');
  const PAGE = 3;
  let sortMode = 'rel';
  let rateFilter = 0;
  let showAll = false;
  let revMediaSets = [];   // por render: índice do comentário visível → sua mídia (p/ o lightbox)

  function filteredReviews() {
    const list = currentReviews.filter(r => !rateFilter || r.rate === rateFilter);
    const by = {
      new: (a, b) => a.ageDays - b.ageDays,
      high: (a, b) => b.rate - a.rate || b.likes - a.likes,
      low: (a, b) => a.rate - b.rate || b.likes - a.likes,
      rel: (a, b) => b.likes - a.likes
    };
    return list.sort(by[sortMode] || by.rel);
  }

  function renderReviews() {
    const list = filteredReviews();
    const visible = showAll ? list : list.slice(0, PAGE);
    revMediaSets = visible.map(r => r.media || []);

    rlist.innerHTML = visible.length
      ? visible.map((r, si) => {
        const long = r.text.length > 260;
        return `<article class="review">
          <div class="review__head">
            <span class="stars" aria-hidden="true">${[1, 2, 3, 4, 5].map(n => star(n <= r.rate)).join('')}</span>
            <span class="sr">Nota ${r.rate} de 5.</span>
            <span class="review__meta">${r.country} <i aria-hidden="true"></i> ${r.when}</span>
          </div>
          ${r.text ? `<p class="review__text${long ? ' is-clamped' : ''}">${esc(r.text).replace(/😂/g, '<svg width="16" height="16" aria-hidden="true" focusable="false" style="vertical-align:-3px"><use href="#i-smile"/></svg>')}</p>` : ''}
          ${long ? '<button class="review__more" type="button" aria-expanded="false">Saiba mais</button>' : ''}
          ${r.media ? `<div class="review__pics">${r.media.map((m, mi) => `
            <button type="button" class="review__media${m.type === 'video' ? ' is-video' : ''}" data-si="${si}" data-mi="${mi}" aria-label="${m.type === 'video' ? 'Ver vídeo' : 'Ampliar foto'} da opinião">
              <img src="${m.thumb}" width="176" height="220" loading="lazy" decoding="async" alt="">
              ${m.type === 'video' ? `<span class="rphoto__play" aria-hidden="true">${icon('i-play')}${m.dur ? `<em>${m.dur}</em>` : ''}</span>` : ''}
            </button>`).join('')}</div>` : ''}
          <div class="review__foot">
            <button class="review__like" type="button" aria-pressed="false">
              ${icon('i-thumb')} Útil <b>${r.likes}</b>
            </button>
            <button class="review__like" type="button" aria-label="Mais opções desta opinião">${icon('i-dots')}</button>
          </div>
        </article>`;
      }).join('')
      : '<p class="rlist__empty">Nenhuma opinião com esse filtro.</p>';

    revToggle.hidden = list.length <= PAGE;
    if (revToggle.hidden && showAll) {
      showAll = false;
      revToggle.setAttribute('aria-expanded', 'false');
      $('.toggle-link__text', revToggle).textContent = 'Mostrar todas as opiniões';
    }

    $('#rcount').textContent = rateFilter
      ? `${list.length} comentário${list.length === 1 ? '' : 's'} com ${rateFilter} estrela${rateFilter > 1 ? 's' : ''}`
      : '62 comentários';
  }

  rlist.addEventListener('click', e => {
    const more = e.target.closest('.review__more');
    if (more) {
      const text = more.previousElementSibling;
      const clamped = text.classList.toggle('is-clamped');
      more.textContent = clamped ? 'Saiba mais' : 'Ver menos';
      more.setAttribute('aria-expanded', String(!clamped));
      return;
    }
    const like = e.target.closest('.review__like');
    if (like && $('b', like)) {
      const counter = $('b', like);
      const on = like.getAttribute('aria-pressed') !== 'true';
      like.setAttribute('aria-pressed', String(on));
      counter.textContent = String(Number(counter.textContent) + (on ? 1 : -1));
      return;
    }
    const media = e.target.closest('[data-si]');
    if (media) {
      const set = revMediaSets[Number(media.dataset.si)] || [];
      openLightbox(Number(media.dataset.mi), set);
    }
  });

  revToggle.addEventListener('click', () => {
    showAll = !showAll;
    revToggle.setAttribute('aria-expanded', String(showAll));
    $('.toggle-link__text', revToggle).textContent = showAll ? 'Mostrar menos opiniões' : 'Mostrar todas as opiniões';
    renderReviews();
  });

  /* ---------- filtros (chips + barras) ---------- */
  function syncRateUI() {
    const label = rateFilter ? `${rateFilter} estrela${rateFilter > 1 ? 's' : ''}` : 'Qualificação';
    $('.chip__text', rateChip).textContent = label;
    rateChip.classList.toggle('is-on', Boolean(rateFilter));
    $$('#rateMenu li').forEach(li => li.setAttribute('aria-selected', String(Number(li.dataset.rate) === rateFilter)));
    $$('.bar').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.rate) === rateFilter)));
  }

  const sortChip = $('#sortChip');
  const rateChip = $('#rateChip');

  bindMenu(sortChip, $('#sortMenu'), li => {
    sortMode = li.dataset.sort;
    $$('#sortMenu li').forEach(x => x.setAttribute('aria-selected', String(x === li)));
    $('.chip__text', sortChip).textContent = li.textContent;
    sortChip.classList.add('is-on');
    renderReviews();
  });

  bindMenu(rateChip, $('#rateMenu'), li => {
    rateFilter = Number(li.dataset.rate);
    syncRateUI();
    renderReviews();
  });

  $('#bars').addEventListener('click', e => {
    const bar = e.target.closest('.bar');
    if (!bar) return;
    const value = Number(bar.dataset.rate);
    rateFilter = value === rateFilter ? 0 : value;
    syncRateUI();
    renderReviews();
  });

  renderReviews();

  /* ---------- infraestrutura de menus ---------- */
  function closeAllMenus() {
    $$('.dropdown.is-open,.qty__menu.is-open').forEach(m => {
      m.classList.remove('is-open');
      const owner = $(`[aria-controls="${m.id}"]`);
      if (owner) owner.setAttribute('aria-expanded', 'false');
    });
    const suggest = $('#suggest');
    suggest.classList.remove('is-open');
    $('#q').setAttribute('aria-expanded', 'false');
  }

  function bindMenu(button, menu, onPick) {
    button.addEventListener('click', e => {
      e.stopPropagation();
      const open = !menu.classList.contains('is-open');
      closeAllMenus();
      menu.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      if (open) ($('li[aria-selected="true"]', menu) || $('li', menu)).focus();
    });
    menu.addEventListener('click', e => {
      const li = e.target.closest('li');
      if (!li) return;
      onPick(li);
      closeAllMenus();
      button.focus();
    });
    listboxKeys(menu, button, onPick);
  }

  /** Navegação por teclado em listboxes (setas, Home/End, Enter/Espaço). */
  function listboxKeys(menu, owner, onPick) {
    menu.addEventListener('keydown', e => {
      const items = $$('li', menu);
      const current = items.indexOf(document.activeElement);
      let next = -1;
      if (e.key === 'ArrowDown') next = Math.min(current + 1, items.length - 1);
      else if (e.key === 'ArrowUp') next = Math.max(current - 1, 0);
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = items.length - 1;
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (current >= 0) { onPick(items[current]); closeAllMenus(); owner.focus(); }
        return;
      } else return;
      e.preventDefault();
      items[next].focus();
    });
  }

  document.addEventListener('click', closeAllMenus);

  /* ============================ BUSCA ============================ */
  const qField = $('#q');
  const suggest = $('#suggest');
  let sugIndex = -1;

  function renderSuggestions() {
    const term = qField.value.trim().toLowerCase();
    const hits = term ? SUGGESTIONS.filter(s => s.includes(term)) : [];
    sugIndex = -1;
    suggest.innerHTML = hits.map((h, i) =>
      `<li role="option" id="sug-${i}" aria-selected="false">${icon('i-search')}${esc(h)}</li>`).join('');
    suggest.classList.toggle('is-open', hits.length > 0);
    qField.setAttribute('aria-expanded', String(hits.length > 0));
    qField.removeAttribute('aria-activedescendant');
  }

  function moveSuggestion(delta) {
    const items = $$('li', suggest);
    if (!items.length) return;
    sugIndex = (sugIndex + delta + items.length) % items.length;
    items.forEach((li, i) => {
      const on = i === sugIndex;
      li.classList.toggle('is-active', on);
      li.setAttribute('aria-selected', String(on));
    });
    qField.setAttribute('aria-activedescendant', items[sugIndex].id);
  }

  qField.addEventListener('input', renderSuggestions);
  qField.addEventListener('keydown', e => {
    if (!suggest.classList.contains('is-open')) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); moveSuggestion(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSuggestion(-1); }
    else if (e.key === 'Enter' && sugIndex >= 0) {
      e.preventDefault();
      qField.value = $$('li', suggest)[sugIndex].textContent.trim();
      closeAllMenus();
    }
  });
  suggest.addEventListener('mousedown', e => {
    const li = e.target.closest('li');
    if (!li) return;
    e.preventDefault();
    qField.value = li.textContent.trim();
    closeAllMenus();
    toast(`Busca: “${qField.value}” — demonstração, não navega para outra página.`);
  });
  qField.addEventListener('blur', () => setTimeout(closeAllMenus, 120));

  $('#searchForm').addEventListener('submit', e => {
    e.preventDefault();
    const term = qField.value.trim();
    closeAllMenus();
    toast(term ? `Busca: “${term}” — demonstração.` : 'Digite algo para buscar.');
  });

  /* ==================== NAVEGAÇÃO INTERNA (SPA) ==================== */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || link.dataset.noscroll !== undefined) return;
    e.preventDefault();
    const id = link.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (target) {
      target.scrollIntoView({ block: 'start' });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    } else {
      window.scrollTo({ top: 0 });
    }
  });

  /* ---------- estado inicial ---------- */
  setQty(1);

  // Se o navegador já bateu o limite de 3 cartões numa visita anterior,
  // já abre o checkout sem a opção de cartão.
  if (_getCardFps().length >= CARD_LIMIT) disableCardOption();

  /* ============================ VARIANTES (Cor / Voltagem / Potência) ============================ */
  function rebuildThumbs() {
    thumbsEl.innerHTML = activeGallery.map((g, i) => `
      <button class="thumb${i === 0 ? ' is-active' : ''}" type="button" data-i="${i}"
              aria-current="${i === 0}" aria-label="Ver imagem ${i + 1} de ${activeGallery.length}">
        <img src="${g.thumb}" width="112" height="112" decoding="async" alt="">
        ${g.type === 'video' ? `<span class="thumb__play">${icon('i-play')}</span>` : ''}
      </button>`).join('');
    $$('.thumb', thumbsEl).forEach(btn => {
      const go = () => setGallery(Number(btn.dataset.i));
      btn.addEventListener('mouseenter', go);
      btn.addEventListener('click', go);
      btn.addEventListener('focus', go);
    });
    setGallery(0);
  }

  [
    {
      optsId: 'varVoltOpts', labelId: 'varVoltLabel',
      onSelect: label => {
        activeGallery = COLOR_GALLERIES[label] || GALLERY;
        rebuildThumbs();
      }
    },
    { optsId: 'varPotOpts',  labelId: 'varPotLabel'  }
  ].forEach(({ optsId, labelId, onSelect }) => {
    const opts    = $('#' + optsId);
    const labelEl = $('#' + labelId);
    if (!opts || !labelEl) return;
    opts.addEventListener('click', e => {
      const btn = e.target.closest('.var-btn');
      if (!btn) return;
      $$('.var-btn', opts).forEach(b => { b.classList.remove('is-sel'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('is-sel');
      btn.setAttribute('aria-pressed', 'true');
      labelEl.textContent = btn.dataset.label;
      if (onSelect) onSelect(btn.dataset.label);
    });
  });

  /* ============================ CATÁLOGO — páginas de produto por ?id= ============================ */
  const _CP = 'assets/products/';
  const PRODUCTS = {
    14: { name: 'Lavadora De Alta Pressão 1200W 1300 Libras LAV1200 Vonder', img: _CP + 'vonder-lavadora-lav1200.webp', p: '60,00', old: '280,00', off: '79% OFF', vars: ['127V', '220V'],
      specs: [['Marca', 'Vonder'], ['Modelo', 'LAV1200'], ['Potência', '1200 W'], ['Pressão máxima', '1300 lbf/pol²'], ['Tipo de motor', 'Universal'], ['Uso indicado', 'Doméstico'], ['Voltagem', '127V / 220V'], ['Itens inclusos', 'Pistola, lança e bico']],
      desc: 'Lavadora de alta pressão Vonder LAV1200 com motor universal de 1200 W e bomba de pressão para limpeza intensa em ambientes residenciais. Acompanha pistola, lança e bico regulável para diferentes tipos de superfície e nível de sujeira.' },
    15: { name: 'Lavadora De Alta Pressão Vonder 1400W LAV 1600 Amarelo', img: _CP + 'vonder-lavadora-lav1600.webp', p: '70,00', old: '245,00', off: '71% OFF', vars: ['127V', '220V'],
      specs: [['Marca', 'Vonder'], ['Modelo', 'LAV 1600'], ['Potência', '1400 W'], ['Pressão máxima', '1600 lbf/pol²'], ['Vazão', '6 L/min'], ['Mangueira', '5 metros'], ['Voltagem', '127V / 220V']],
      desc: 'Lavadora de alta pressão Vonder LAV 1600 com motor de 1400 W e sistema que gera mais pressão consumindo menos água. Indicada para limpeza eficiente de veículos, áreas externas, telhados e máquinas, com alta durabilidade para uso doméstico intensivo.' },
    16: { name: 'Lavadora De Alta Pressão LAV 2000 Vonder Cor Amarelo', img: _CP + 'vonder-lavadora-lav2000.webp', p: '100,00', old: '358,00', off: '72% OFF', vars: ['127V', '220V'],
      specs: [['Marca', 'Vonder'], ['Modelo', 'LAV 2000'], ['Potência', '1500 W'], ['Pressão máxima', '2100 lbf/pol² (145 bar)'], ['Vazão', '6,5 L/min'], ['Mangueira', '5 metros'], ['Bomba', 'Alumínio reforçada'], ['Voltagem', '127V / 220V']],
      desc: 'Lavadora de alta pressão Vonder LAV 2000, modelo robusto com 2100 lbf/pol² (145 bar) de pressão máxima. Indicada para limpeza pesada em carros, motos, pisos, fachadas e quintais com sujeira incrustada. Bomba de alumínio com cabeçote reforçado para maior vida útil.' },
    17: { name: 'Kit Lavadora Alta Pressão 1200W + Aspirador Pó e Água Vonder', img: _CP + 'vonder-lavadora-aspirador-combo.webp', p: '120,00', old: '400,00', off: '70% OFF', vars: null,
      specs: [['Marca', 'Vonder'], ['Lavadora', '1200 W / 1300 lbf/pol²'], ['Aspirador', 'Pó e água'], ['Reservatório do aspirador', '12 L'], ['Itens inclusos', 'Lavadora + aspirador + acessórios'], ['Uso indicado', 'Doméstico']],
      desc: 'Kit completo Vonder com lavadora de alta pressão de 1200 W e aspirador de pó e água. Solução 2 em 1 para lavar e secar veículos, limpar quintais, garagens e ambientes internos. Ideal para quem precisa de versatilidade em uma única compra.' },
    8: { name: 'Kit Jogo Ferramentas Maleta 128 Peças Soquetes Chaves Vonder', img: _CP + 'vonder-kit-ferramentas-128.webp', p: '68,00', old: '300,00', off: '77% OFF', vars: null,
      specs: [['Marca', 'Vonder'], ['Quantidade de peças', '128'], ['Material', 'Aço cromo vanádio'], ['Encaixe dos soquetes', '1/4" e 1/2"'], ['Embalagem', 'Maleta organizadora'], ['Aplicação', 'Mecânica e manutenção']],
      desc: 'Jogo de ferramentas Vonder com 128 peças em maleta organizadora. Inclui soquetes em polegadas e milímetros, chaves combinadas, chaves Allen, alicates, chaves de fenda e bits. Indicado para mecânica em geral, manutenção residencial e profissional.' },
    12: { name: 'Jogo De Ferramentas Com 163 Peças Vonder Reparos Geral', img: _CP + 'vonder-kit-ferramentas-163.webp', p: '60,00', old: '199,90', off: '70% OFF', vars: null,
      specs: [['Marca', 'Vonder'], ['Quantidade de peças', '163'], ['Aplicação', 'Reparos gerais e mecânica leve'], ['Material', 'Aço cromo vanádio'], ['Embalagem', 'Maleta plástica']],
      desc: 'Jogo Vonder com 163 peças para reparos em geral, organizado em maleta resistente. Reúne soquetes, chaves combinadas, chaves de fenda, bits, alicate, martelo, fita métrica e diversos acessórios para mecânica leve, manutenção doméstica e pequenos consertos.' },
    1: { name: 'Esmerilhadeira Angular Vonder EAV 860N 860W + Acessório', img: _CP + 'vonder-esmerilhadeira-eav860.webp', p: '58,00', old: '244,00', off: '76% OFF', vars: ['127V', '220V'],
      specs: [['Marca', 'Vonder'], ['Modelo', 'EAV 860N'], ['Potência', '860 W'], ['Disco', '4.1/2" (115 mm)'], ['Rotação', '11.000 rpm'], ['Aplicação', 'Corte e desbaste'], ['Voltagem', '127V / 220V']],
      desc: 'Esmerilhadeira angular Vonder EAV 860N com motor de 860 W e disco de 4.1/2", indicada para corte e desbaste em metais, alvenaria e cerâmica. Empunhadura auxiliar com duas posições de fixação para mais controle e segurança em diferentes ângulos de trabalho.' },
    2: { name: 'Inversor Para Solda Eletrodo e TIG IM125 c/ Máscara Automática Vonder', img: _CP + 'vonder-inversor-solda-im125.webp', p: '78,00', old: '399,00', off: '80% OFF', vars: null,
      specs: [['Marca', 'Vonder'], ['Modelo', 'IM125'], ['Corrente máxima', '120 A'], ['Tensão', 'Bivolt automático (127V/220V)'], ['Processos', 'Eletrodo (MMA) e TIG'], ['Eletrodos compatíveis', '1,6 a 2,5 mm'], ['Acompanha', 'Máscara de escurecimento automático']],
      desc: 'Inversor de solda Vonder IM125 bivolt automático, compatível com processos eletrodo revestido (MMA) e TIG. Acompanha máscara de escurecimento automático para proteção dos olhos. Ideal para soldas leves em ferro, aço carbono e inox em manutenção e pequenos projetos.' },
    4: { name: 'Furadeira Parafusadeira Impacto Bateria PFV238i Vonder', img: _CP + 'vonder-furadeira-pfv238i.webp', p: '54,00', old: '175,00', off: '69% OFF', vars: null,
      specs: [['Marca', 'Vonder'], ['Modelo', 'PFV 238i'], ['Tensão da bateria', '20 V'], ['Funções', 'Furar, parafusar e impacto'], ['Mandril', '10 mm de aperto rápido'], ['Carregador', 'Bivolt automático'], ['Acompanha', 'Maleta, brocas e bits']],
      desc: 'Parafusadeira/furadeira de impacto Vonder PFV 238i a bateria de 20 V, com função impacto para furar concreto e alvenaria. Velocidade variável, reversão de giro e mandril de aperto rápido. Acompanha maleta, brocas, bits, bateria e carregador bivolt automático.' },
    6: { name: 'Parafusadeira e Furadeira a Bateria PFV 238 c/ Maleta e Acessórios Vonder', img: _CP + 'vonder-parafusadeira-pfv238.webp', p: '58,00', old: '149,99', off: '61% OFF', vars: null,
      specs: [['Marca', 'Vonder'], ['Modelo', 'PFV 238'], ['Tensão da bateria', '20 V'], ['Funções', 'Furar e parafusar'], ['Acessórios', '6 brocas + 6 bits + soquetes'], ['Carregador', 'Bivolt automático'], ['Acompanha', 'Maleta de transporte']],
      desc: 'Parafusadeira/furadeira a bateria Vonder PFV 238 de 20 V, com maleta de transporte e kit completo de acessórios. Inclui brocas de aço rápido, bits e soquetes para parafusar e furar madeira, metal e alvenaria leve. Ideal para uso doméstico e pequenos reparos.' },
    11: { name: 'Esmerilhadeira Angular Vonder EAV 650 50Hz/60Hz Cor Amarelo', img: _CP + 'vonder-esmerilhadeira-eav650.webp', p: '48,00', old: '117,00', off: '59% OFF', vars: ['127V', '220V'],
      specs: [['Marca', 'Vonder'], ['Modelo', 'EAV 650'], ['Potência', '650 W'], ['Disco', '4.1/2" (115 mm)'], ['Rotação', '11.000 rpm'], ['Frequência', '50/60 Hz'], ['Voltagem', '127V / 220V']],
      desc: 'Esmerilhadeira angular Vonder EAV 650 com motor de 650 W e disco de 4.1/2" (115 mm), compacta e leve. Indicada para corte e desbaste de metais e alvenaria em obras, manutenção e marcenaria. Empunhadura lateral em duas posições para uso confortável.' },
    13: { name: 'Serra Mármore Profissional Vonder SMV1300s 1300W', img: _CP + 'vonder-serra-marmore-smv1300.webp', p: '60,00', old: '198,00', off: '70% OFF', vars: ['127V', '220V'],
      specs: [['Marca', 'Vonder'], ['Modelo', 'SMV1300S'], ['Potência', '1300 W'], ['Disco', '4.3/8" (110 mm)'], ['Rotação', '12.000 rpm'], ['Aplicação', 'Mármore, granito e cerâmica'], ['Base', 'Regulável em profundidade'], ['Voltagem', '127V / 220V']],
      desc: 'Serra mármore profissional Vonder SMV1300S com motor de 1300 W e disco de 4.3/8". Realiza cortes precisos em mármore, granito, porcelanato, cerâmica e materiais cerâmicos em geral. Base de apoio regulável para ajuste de profundidade e cortes retos.' }
  };

  function _specsTable(specs) {
    const half = Math.ceil(specs.length / 2);
    const rows = arr => arr.map(s => `<tr><th scope="row">${esc(s[0])}</th><td>${esc(s[1])}</td></tr>`).join('');
    return `<div class="specs">
      <div class="specs__col"><h3>Características principais</h3><table class="spec-table"><caption class="sr">Características principais</caption><tbody>${rows(specs.slice(0, half))}</tbody></table></div>
      <div class="specs__col"><h3>Outras características</h3><table class="spec-table"><caption class="sr">Outras características</caption><tbody>${rows(specs.slice(half))}</tbody></table></div>
    </div>`;
  }

  function applyProduct(prod) {
    const priceNum = Number(prod.p.replace(/\./g, '').replace(',', '.'));
    const oldNum = Number(prod.old.replace(/\./g, '').replace(',', '.'));
    const unit = (priceNum / 12).toFixed(2).replace('.', ',');

    document.title = prod.name + ' | Plantão Automotivo';
    const h1 = $('.title'); if (h1) h1.textContent = prod.name;

    /* galeria: imagem única do produto (voltagem não troca a foto) */
    activeGallery = [_im(prod.img, prod.name)];
    COLOR_GALLERIES = {};
    (prod.vars || []).forEach(v => { COLOR_GALLERIES[v] = activeGallery; });
    rebuildThumbs();

    /* preço */
    const amt = $('.price__now .amount'); if (amt) amt.innerHTML = supPrice(prod.p);
    const po = $('.price__old'); if (po) po.innerHTML = '<span class="sr">Preço antigo: </span>' + supPrice(prod.old);
    const pf = $('.price__off'); if (pf) pf.textContent = prod.off;
    const pu = $('.price__unit'); if (pu) pu.textContent = 'ou em até 12x de R$ ' + unit + ' sem juros no cartão';
    const bo = $('.buy-opt.is-sel');
    if (bo) {
      bo.dataset.pix = priceNum.toFixed(2);
      const ba = $('.buy-opt__price .amount', bo); if (ba) ba.innerHTML = supPrice(prod.p);
      const bold = $('.buy-opt__old', bo); if (bold) bold.innerHTML = '<span class="sr">Preço antigo: </span>R$ ' + prod.old;
      const boff = $('.off', bo); if (boff) boff.textContent = prod.off;
    }
    OLD_UNIT = oldNum; PRODUCT = prod.name; PRODUCT_NAME_FULL = prod.name; PRODUCT_ID = 'VONDER_' + prod.id;

    /* características, destaques e descrição */
    const sf = $('#specFade'); if (sf) sf.innerHTML = _specsTable(prod.specs);
    const stg = $('#specsToggle'); if (stg) stg.hidden = true;
    const hi = $('.specs-hi ul'); if (hi) hi.innerHTML = prod.specs.slice(0, 6).map(s => `<li><b>${esc(s[0])}:</b> ${esc(s[1])}</li>`).join('');
    const de = $('#desc'); if (de) de.textContent = prod.desc;

    /* variantes (voltagem) — ou some se o produto não tiver */
    const vs = $('.var-selectors');
    if (vs) {
      if (prod.vars && prod.vars.length) {
        const lb = $('#varVoltLabel'); if (lb) lb.textContent = prod.vars[0];
        const op = $('#varVoltOpts');
        if (op) op.innerHTML = prod.vars.map((v, i) => `<button type="button" class="var-btn${i ? '' : ' is-sel'}" data-label="${esc(v)}" aria-pressed="${i ? 'false' : 'true'}">${esc(v)}</button>`).join('');
        vs.hidden = false;
      } else {
        vs.hidden = true;
      }
    }

    /* "Fotos do produto" tem fotos específicas da LAV1300 → esconde em outros produtos */
    const _ph = document.getElementById('photos');
    if (_ph) { const sec = _ph.closest('section'); if (sec) sec.hidden = true; }

    if (typeof updateCheckout === 'function') { try { updateCheckout(); } catch (_) {} }

    var _rid = prod.id ? String(prod.id) : null;
    currentReviews     = (_rid && PRODUCT_REVIEWS[_rid])      ? PRODUCT_REVIEWS[_rid]      : REVIEWS;
    currentReviewMedia = (_rid && PRODUCT_REVIEW_MEDIA[_rid]) ? PRODUCT_REVIEW_MEDIA[_rid] : REVIEW_MEDIA;
    showAll = false; rateFilter = 0; sortMode = "rel";
    try { renderReviews(); } catch(e1) {}

    /* atualizar galeria principal com multiplas fotos */
    try {
      if (_rid && PRODUCT_GALLERY[_rid]) {
        activeGallery = PRODUCT_GALLERY[_rid];
        COLOR_GALLERIES = {};
        if (prod.vars && prod.vars.length) {
          prod.vars.forEach(function(v) { COLOR_GALLERIES[v] = activeGallery; });
        }
        rebuildThumbs();
      }
    } catch(eg) {}

    /* rebuild faixa de "Opinoes com fotos" */
    try {
      var rphEl = document.getElementById("rphotos");
      var rphSec = rphEl ? rphEl.closest(".rphotos") : null;
      if (rphEl && currentReviewMedia.length > 0) {
        rphEl.innerHTML = currentReviewMedia.map(function(m,i) {
          var c = "rphoto"+(m.type==="video"?" rphoto--video":"");
          return "<li><button class=\""+c+"\" type=\"button\" data-i=\""+i+"\" aria-label=\"Ver foto "+(i+1)+"\"><img src=\""+m.thumb+"\" width=\"176\" height=\"220\" loading=\"lazy\" decoding=\"async\" alt=\"\"></button></li>";
        }).join("");
        if (rphSec) rphSec.hidden = false;
      } else if (rphSec) {
        rphSec.hidden = true;
      }
    } catch(e2) {}

    /* rebuild fotos do produto — lavadoras: sim; outros: ocultar */
    try {
      var phEl = document.getElementById("photos");
      var phSec = phEl ? phEl.closest("section") : null;
      if (_rid && PRODUCT_PHOTOS[_rid]) {
        var pph = PRODUCT_PHOTOS[_rid];
        if (phEl) phEl.innerHTML = pph.map(function(p,i){ return "<img src=\""+p.zoom+"\" width=\"800\" height=\"800\" data-i=\""+i+"\" loading=\"lazy\" decoding=\"async\" alt=\""+(p.alt||"")+"\">"; }).join("");
        if (phSec) phSec.hidden = false;
      } else {
        if (phSec) phSec.hidden = true;
      }
    } catch(e3) {}
    window.scrollTo(0, 0);
  }

  const _qid = new URLSearchParams(location.search).get('id');
  if (_qid && PRODUCTS[_qid]) { PRODUCTS[_qid].id = _qid; applyProduct(PRODUCTS[_qid]); }

  /* ============ Presença ao vivo no painel admin (visitor_presence) ============
     O dashboard agrupa os visitantes dos últimos 90s por etapa do funil.
     Aqui a etapa é dinâmica: home / product / checkout / pix. */
  (function presenceAdmin() {
    const SB_P = 'https://clqulpkzaxogcvqyqyce.supabase.co';
    const KEY_P = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscXVscGt6YXhvZ2N2cXlxeWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MzkxNjMsImV4cCI6MjEwNDAxNTE2M30.yMwKnOWoZ_Jrus6exCZliyUPsNCyRjXAm2g_3m9Kl-I';

    let sid = '';
    try {
      sid = sessionStorage.getItem('plt-sid') || '';
      if (!sid) {
        sid = (crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2)));
        sessionStorage.setItem('plt-sid', sid);
      }
    } catch (_) { sid = 'anon-' + Date.now().toString(36); }

    function currentCat() {
      try {
        if (doneView && !doneView.hidden) return 'pix';
        if (cho && !cho.hidden) return 'checkout';
      } catch (_) {}
      const id = new URLSearchParams(location.search).get('id');
      return (!id || id === '5') ? 'home' : 'product';
    }

    let lastCat = null;
    function ping() {
      /* Aba escondida não conta como "visitante ao vivo". Sem esta guarda, quem
         abria o checkout e trocava de app seguia pingando (o navegador estrangula
         o timer para ~1x/min, mas não o mata) e ficava preso no contador para
         sempre — com a campanha desligada o painel ainda marcava "Checkout: 1".
         Parando de pingar, a sessão sai sozinha da janela de 90s. */
      if (document.hidden) return;
      lastCat = currentCat();
      fetch(SB_P + '/rest/v1/visitor_presence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: KEY_P,
          Authorization: 'Bearer ' + KEY_P,
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ session_id: sid, page_category: lastCat, last_seen: new Date().toISOString() }),
        keepalive: true
      }).catch(() => {});
    }

    ping();
    setInterval(ping, 20000);                                   // heartbeat
    setInterval(() => { if (currentCat() !== lastCat) ping(); }, 1500);  // muda de etapa → avisa na hora
    document.addEventListener('visibilitychange', () => { if (!document.hidden) ping(); });
  })();
})();
