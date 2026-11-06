/* Copia di JS_TesseraPdf.html: la crea app/esporta.js e la controlla test/t_app_vera.js. Non modificarla qui. */

/* =====================================================================
   IL DISEGNO DELLA TESSERA — JS_TesseraPdf.html (v4.5)
   Lo usano il gestionale (JS_Tessere) e il portale: «La mia tessera»,
   se il PDF non c'è ancora, lo disegna il telefono del socio con la
   stessa grafica e lo manda al server, che lo salva e lo invia alla
   sua email. Libreria pdfmake (in Index), QR caricato quando serve.
   ===================================================================== */
var _TES_C_={bx:'#8E2E35',bx2:'#5E1A20',mo:'#6E2027',cr:'#F6F0E6',cr2:'#EDE3D3',gr:'#2E2B2A',gr2:'#6B6560',li:'#D9CFC0',ro:'#E9B9BC'};
var _TES_MM_=2.8346;
function _tesMm_(v){ return v*_TES_MM_; }
function _tesEur_(v){ return '€ '+(Math.round((+v||0)*100)/100).toFixed(2).replace('.',','); }
/* «Coro "La Cordata" APS» → «La Cordata» (per il fronte della tessera) */
function _tesNomeBreve_(n){ return String(n||'La Cordata').replace(/^\s*coro\s+/i,'').replace(/\s+a\.?p\.?s\.?\s*$/i,'').replace(/["“”«»]/g,'').trim()||'La Cordata'; }

/* le due facce della tessera, disegnate in posizione fissa sulla pagina 1 */
function _tesCarte_(D,x0,y0){
  var C=_TES_C_, m=_tesMm_, W=m(85.6), H=m(54), R=m(3.2), GAP=m(10), x1=x0+W+GAP, out=[], s=D.socio, co=D.coro;
  var t=function(txt,x,y,st){ var o={text:txt,absolutePosition:{x:x,y:y}}; return Object.assign(o,st||{}); };
  var cv=function(list){ out.push({canvas:list,absolutePosition:{x:0,y:0}}); };
  /* guida di taglio */
  cv([{type:'rect',x:x0-m(1.6),y:y0-m(1.6),w:W+m(3.2),h:H+m(3.2),r:R+m(1.4),lineColor:'#B9B0A4',lineWidth:0.4,dash:{length:2,space:2}},
      {type:'rect',x:x1-m(1.6),y:y0-m(1.6),w:W+m(3.2),h:H+m(3.2),r:R+m(1.4),lineColor:'#B9B0A4',lineWidth:0.4,dash:{length:2,space:2}}]);
  /* ── FRONTE ── */
  var HB=m(15), HM=m(13), yb=y0+H-HB;
  var P=function(pts){ return pts.map(function(p){ return {x:x0+p[0]/856*W,y:yb-HM+p[1]/200*HM}; }); };
  cv([{type:'rect',x:x0,y:y0,w:W,h:H,r:R,color:C.bx},
      {type:'rect',x:x0,y:y0,w:W,h:H-HB+R,r:R,color:C.bx2},{type:'rect',x:x0,y:yb-R,w:W,h:R,color:C.bx2},
      {type:'polyline',closePath:true,color:C.mo,lineColor:C.mo,lineWidth:0.1,points:P([[0,200],[120,92],[205,150],[330,40],[430,128],[520,70],[640,160],[735,88],[856,170],[856,200]])},
      {type:'polyline',closePath:true,color:C.bx,lineColor:C.bx,lineWidth:0.1,points:P([[0,200],[90,150],[210,178],[330,118],[455,180],[600,132],[720,182],[856,150],[856,200]])},
      {type:'rect',x:x0,y:yb-0.5,w:W,h:HB-R+0.5,color:C.bx},
      {type:'polyline',lineColor:C.cr,lineWidth:0.7,dash:{length:2.2,space:2},points:P([[330,40],[430,128],[520,70],[640,160],[735,88]])},
      {type:'ellipse',x:x0+330/856*W,y:yb-HM+40/200*HM,r1:1.3,r2:1.3,color:C.cr},{type:'ellipse',x:x0+520/856*W,y:yb-HM+70/200*HM,r1:1.3,r2:1.3,color:C.cr},{type:'ellipse',x:x0+735/856*W,y:yb-HM+88/200*HM,r1:1.3,r2:1.3,color:C.cr},
      /* marchio: cerchio con le montagne (o il logo, se c'è) */
      {type:'ellipse',x:x0+m(9),y:y0+m(8.6),r1:m(4),r2:m(4),lineColor:C.cr,lineWidth:0.5,color:co.logo?C.cr:C.bx2},
      /* riquadro della foto */
      {type:'rect',x:x0+W-m(22),y:y0+m(15),w:m(17),h:m(21.5),r:m(1.2),color:C.cr2,lineColor:C.cr,lineWidth:0.6}]);
  if(co.logo)out.push({image:co.logo,fit:[m(6),m(6)],absolutePosition:{x:x0+m(6),y:y0+m(5.6)}});
  else cv([{type:'polyline',lineColor:C.cr,lineWidth:0.8,points:[{x:x0+m(6.6),y:y0+m(10.4)},{x:x0+m(8.1),y:y0+m(7.6)},{x:x0+m(9.1),y:y0+m(9)},{x:x0+m(10.1),y:y0+m(6.8)},{x:x0+m(11.4),y:y0+m(10.4)}]}]);
  out.push(t(_tesNomeBreve_(co.nome),x0+m(15),y0+m(5.6),{fontSize:9.5,bold:true,color:C.cr}));
  out.push(t('CORO · APS',x0+m(15),y0+m(9.6),{fontSize:5,color:C.ro,characterSpacing:1}));
  out.push(t('ANNO SOCIALE',x0+W-m(30),y0+m(4.6),{fontSize:5,color:C.ro,characterSpacing:0.8,width:m(25),alignment:'right'}));
  out.push(t(String(D.anno),x0+W-m(30),y0+m(7.2),{fontSize:13,bold:true,color:C.cr,width:m(25),alignment:'right'}));
  if(s.foto)out.push({image:s.foto,cover:{width:m(16),height:m(20.5),valign:'center',align:'center'},absolutePosition:{x:x0+W-m(21.5),y:y0+m(15.5)}});
  else out.push(t('foto\ndel socio',x0+W-m(22),y0+m(23.5),{fontSize:5.5,color:C.gr2,width:m(17),alignment:'center'}));
  out.push(t(String(s.qualifica||'Socio ordinario').toUpperCase(),x0+m(5),y0+m(16.5),{fontSize:5.4,color:C.ro,characterSpacing:1,width:m(55)}));
  out.push(t((s.nome||'')+'\n'+(s.cognome||''),x0+m(5),y0+m(19.4),{fontSize:12,bold:true,color:C.cr,lineHeight:1.05,width:m(55)}));
  out.push(t('TESSERA CORO',x0+m(5),y0+H-m(10.6),{fontSize:5,color:C.ro,characterSpacing:0.8}));
  out.push(t(s.nCoro||'—',x0+m(5),y0+H-m(7.6),{fontSize:8.6,bold:true,color:C.cr,characterSpacing:0.6}));
  /* v4.5.2: tessera ARCOM = affiliazione del coro (sta sul retro): qui la scadenza */
  out.push(t('VALIDA FINO AL',x0+m(27),y0+H-m(10.6),{fontSize:5,color:C.ro,characterSpacing:0.8}));
  out.push(t(D.scadenza||('31/12/'+D.anno),x0+m(27),y0+H-m(7.6),{fontSize:8.6,bold:true,color:C.cr,characterSpacing:0.6}));
  /* ── RETRO ── */
  cv([{type:'rect',x:x1,y:y0,w:W,h:H,r:R,color:C.cr},{type:'rect',x:x1,y:y0,w:W,h:R*2,r:R,color:C.bx},{type:'rect',x:x1,y:y0+m(3.2),w:W,h:R*2,color:C.cr},
      {type:'rect',x:x1+W-m(24),y:y0+m(7),w:m(19),h:m(19),color:'#FFFFFF',lineColor:C.li,lineWidth:0.4},
      {type:'line',x1:x1+m(5),y1:y0+H-m(11),x2:x1+W-m(5),y2:y0+H-m(11),lineColor:C.li,lineWidth:0.4}]);
  out.push(t(String(co.nome||'').toUpperCase(),x1+m(5),y0+m(7),{fontSize:5,bold:true,color:C.bx,characterSpacing:0.8,width:W-m(32)}));
  var riga=function(lab,val){ return val?[{text:lab+' ',color:C.gr},{text:val+'\n',bold:true,color:C.bx2}]:[]; };
  out.push({text:[].concat(riga('Iscritto al RUNTS n.',co.runts),riga('Affiliato ARCOM n.',co.arcom),riga('C.F./P.IVA',co.cf),co.email?[{text:co.email,color:C.gr}]:[]),
    fontSize:6,lineHeight:1.25,absolutePosition:{x:x1+m(5),y:y0+m(10.2)},width:W-m(32)});
  /* il QR è un'immagine già pronta (_tesQrPng_): quello di pdfmake a 17 mm sparisce con i link lunghi */
  if(D.qrImg)out.push({image:D.qrImg,width:m(17.6),height:m(17.6),absolutePosition:{x:x1+W-m(23.3),y:y0+m(7.7)}});
  else out.push(t('codice QR\nnon disponibile',x1+W-m(24),y0+m(14),{fontSize:5,color:C.gr2,width:m(19),alignment:'center'}));
  out.push(t('inquadra per verificare',x1+W-m(25),y0+m(26.6),{fontSize:4.6,color:C.gr2,width:m(21),alignment:'center'}));
  out.push(t(D.testi.validita||'',x1+m(5),y0+H-m(9.6),{fontSize:5.2,color:C.gr2,lineHeight:1.2,width:W-m(10)}));
  return out;
}

/** Il documento pdfmake completo (2 pagine A4). */
function _tesDoc_(D){
  var C=_TES_C_, m=_tesMm_, s=D.socio, co=D.coro, q=D.quota, T=D.testi, PW=595.28, L=m(15), LW=PW-2*L;
  var eti=function(x,st){ return Object.assign({text:String(x).toUpperCase(),fontSize:6.4,bold:true,color:C.bx,characterSpacing:1.1},st||{}); };
  var testa=function(etichetta,titolo,dx){ return [{columns:[{stack:[eti(etichetta),{text:titolo,fontSize:19,bold:true,color:C.bx2,margin:[0,3,0,0]}]},
      {text:dx,fontSize:8.5,color:C.gr2,alignment:'right',width:'auto',margin:[0,12,0,0]}]},
    {canvas:[{type:'line',x1:0,y1:0,x2:LW,y2:0,lineWidth:1.2,lineColor:C.bx}],margin:[0,7,0,0]}]; };
  var scatola=function(stack,fill,bordo){ return {table:{widths:['*'],body:[[{stack:stack,fillColor:fill}]]},layout:{hLineWidth:function(i){ return bordo&&i===0?4:0; },vLineWidth:function(){ return 0; },hLineColor:function(){ return bordo||C.bx; },
      paddingLeft:function(){ return 14; },paddingRight:function(){ return 14; },paddingTop:function(){ return 12; },paddingBottom:function(){ return 10; }}}; };
  var nome=((s.nome||'')+' '+(s.cognome||'')).trim();
  var c=[];
  /* ── pagina 1 ── */
  c=c.concat(testa((co.nome||'')+' · anno sociale '+D.anno,'Tessera del socio',nome+' · tessera n. '+(s.nCoro||'—')+'\nemessa il '+(D.emessa||'')));
  var yCarte=m(14)+70;
  c=c.concat(_tesCarte_(D,(PW-(m(85.6)*2+m(10)))/2,yCarte));
  c.push({text:'Ritaglia lungo il tratteggio · formato carta di credito 85,6 × 54 mm',fontSize:6.5,color:C.gr2,alignment:'center',margin:[0,m(54)+m(8)+18,0,14]});
  var vant=(T.vantaggi||[]).map(function(v){ return {text:v,fontSize:8.6,margin:[0,1.5,0,0]}; });
  var teatri=(T.teatri||[]).map(function(x){ return {stack:[{text:x.t,fontSize:8.2,bold:true,color:C.gr},{text:x.d,fontSize:6.8,color:C.gr2}],margin:[0,0,0,3]}; });
  var met=Math.ceil(teatri.length/2);
  c.push({table:{widths:['*'],body:[[{fillColor:C.cr,columns:[
      {width:'52%',stack:[eti('Carta del corista ARCOM'),{text:'I vantaggi della tua tessera',fontSize:12.5,bold:true,color:C.bx2,margin:[0,3,0,4]},{ul:vant,markerColor:C.bx},
        T.notaCarta?{text:T.notaCarta,fontSize:7,color:C.gr2,margin:[0,6,0,0]}:{text:''}]},
      {width:'*',stack:[eti('Teatri convenzionati'),{columns:[{stack:teatri.slice(0,met)},{stack:teatri.slice(met)}],columnGap:10,margin:[0,6,0,0]}]}],columnGap:18}]]},
    layout:{hLineWidth:function(){ return 0; },vLineWidth:function(i){ return i===0?4:0; },vLineColor:function(){ return C.bx; },paddingLeft:function(){ return 15; },paddingRight:function(){ return 14; },paddingTop:function(){ return 12; },paddingBottom:function(){ return 11; }}});
  var cella=function(l,v){ return {stack:[eti(l,{fontSize:5.8}),{text:v||'—',fontSize:9.5,bold:true,color:C.gr,margin:[0,2,0,0]}]}; };
  c.push({table:{widths:['*','*','*','*'],body:[[cella('Socio dal',s.dal),cella('Voce',s.voce),cella('Qualifica',s.qualifica),cella('Quota '+D.anno,q?'Pagata il '+q.data:'Da versare')]]},
    layout:{hLineWidth:function(){ return 0.4; },vLineWidth:function(i){ return i>0&&i<4?0.4:0; },hLineColor:function(){ return C.li; },vLineColor:function(){ return C.li; },paddingLeft:function(i){ return i?8:0; },paddingTop:function(){ return 7; },paddingBottom:function(){ return 7; }},margin:[0,16,0,0]});
  /* ricevuta staccabile, sempre in fondo alla pagina 1 */
  if(q){
    var yR=841.89-m(12)-178;
    c.push({canvas:[{type:'line',x1:L,y1:yR,x2:PW-L,y2:yR,lineWidth:0.8,lineColor:'#8C857C',dash:{length:3,space:2.5}},{type:'rect',x:L,y:yR-6,w:86,h:12,color:'#FFFFFF'}],absolutePosition:{x:0,y:0}});
    c.push({text:'ricevuta da staccare',fontSize:7.5,color:C.gr2,absolutePosition:{x:L,y:yR-4.5}});
    var rr=function(a,b){ return [{text:a,fontSize:8.6,color:C.gr2},{text:b||'—',fontSize:8.6,color:C.gr}]; };
    c.push({absolutePosition:{x:L,y:yR+16},columns:[
      {width:'*',stack:[eti('Ricevuta n. '+(q.ricevuta||'')),{text:'Ricevuta della quota associativa',fontSize:12.5,bold:true,color:C.bx2,margin:[0,3,0,6]},
        {table:{widths:[84,'*'],body:[rr('Ricevuto da',nome+' (socio '+s.id+')'),rr('Causale','Quota associativa anno sociale '+D.anno),rr('Data',q.data),rr('Pagato con',q.modalita)]},
          layout:{hLineWidth:function(i){ return i?0.4:0; },vLineWidth:function(){ return 0; },hLineColor:function(){ return C.li; },paddingLeft:function(){ return 0; },paddingTop:function(){ return 3.5; },paddingBottom:function(){ return 3.5; }}},
        {canvas:[{type:'line',x1:0,y1:0,x2:150,y2:0,lineWidth:0.4,lineColor:C.gr2}],margin:[0,18,0,2]},{text:'Il tesoriere',fontSize:7.5,color:C.gr2}]},
      {width:m(62),stack:[scatola([eti('Importo'),{text:_tesEur_(q.importo),fontSize:20,bold:true,color:C.bx2,margin:[0,4,0,4]},
        {text:'Quota associativa: non soggetta a IVA (art. 4 DPR 633/72). '+(co.nome||'')+(co.cf?' · C.F. '+co.cf:'')+(co.runts?' · RUNTS n. '+co.runts:''),fontSize:7,color:C.gr2,lineHeight:1.2}],C.cr)]}],columnGap:22,width:LW});
  }
  /* ── pagina 2 ── */
  c.push({text:'',pageBreak:'after'});
  c=c.concat(testa('Allegato alla tessera · anno sociale '+D.anno,'Assicurazione e servizi',(co.nome||'')+'\naffiliato ARCOM'));
  c.push({text:[{text:'Con l\'iscrizione al coro e l\'affiliazione ARCOM hai alcune coperture e servizi. Qui sono divisi in due: quelli che valgono '},{text:'per te',bold:true},{text:' e quelli che valgono '},{text:'per il coro',bold:true},{text:'. I testi completi delle polizze sono nei documenti Feniarco e ARCOM.'}],
    fontSize:9.5,color:C.gr,lineHeight:1.3,margin:[0,14,60,14]});
  var voci=function(L2){ return (L2||[]).map(function(x){ return {stack:[{canvas:[{type:'line',x1:0,y1:0,x2:200,y2:0,lineWidth:0.4,lineColor:C.li}],margin:[0,0,0,6]},{text:x.t,fontSize:9.5,bold:true,color:C.gr},{text:x.d,fontSize:8.3,color:'#4A4541',lineHeight:1.25,margin:[0,2,0,8]}]}; }); };
  var col=function(e,tit,sotto,L2,fill,bordo,extra){ return scatola([eti(e),{text:tit,fontSize:13.5,bold:true,color:C.bx2,margin:[0,3,0,2]},{text:sotto,fontSize:8,color:C.gr2,margin:[0,0,0,8]}].concat(voci(L2)).concat(extra||[]),fill,bordo); };
  var sin=T.sinistro?[{table:{widths:['*'],body:[[{text:T.sinistro,fontSize:7.8,color:C.bx2,fillColor:'#FFFFFF'}]]},layout:{hLineWidth:function(){ return 0; },vLineWidth:function(i){ return i===0?2.5:0; },vLineColor:function(){ return C.bx; },paddingLeft:function(){ return 7; },paddingTop:function(){ return 5; },paddingBottom:function(){ return 5; }}}]:[];
  c.push({columns:[col('Per te','Il singolo corista','Valgono per ogni socio con la quota dell\'anno pagata.',T.corista,C.cr,C.bx,sin),
                   col('Per il coro','La struttura coro','Le usa l\'associazione: tu non devi fare niente.',T.coro,'#F2F0ED',C.gr)],columnGap:m(7)});
  return {pageSize:'A4',pageMargins:[L,m(14),L,m(16)],content:c,defaultStyle:{fontSize:9,color:C.gr},
    info:{title:'Tessera '+D.anno+' — '+nome,author:co.nome||''},
    footer:function(p){ return p===2?{columns:[{text:[co.nome,co.runts?'RUNTS n. '+co.runts:'',co.email].filter(Boolean).join(' · '),fontSize:7.2,color:C.gr2},{text:'Documento di iscrizione · tessera n. '+(s.nCoro||'—')+' · '+D.anno,fontSize:7.2,color:C.gr2,alignment:'right'}],margin:[L,8,L,0]}:null; }};
}

/* la libreria dei PDF legge solo PNG e JPEG: foto e logo in altri formati (webp, svg…) si convertono qui */
function _tesImgPng_(src){ return new Promise(function(ok){ if(!src||/^data:image\/(png|jpe?g);/i.test(src))return ok(src||'');
  var im=new Image(); im.onload=function(){ try{ var cv=document.createElement('canvas'), k=Math.min(1,600/Math.max(im.naturalWidth||1,im.naturalHeight||1)); cv.width=Math.max(1,Math.round((im.naturalWidth||300)*k)); cv.height=Math.max(1,Math.round((im.naturalHeight||300)*k));
    cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height); ok(cv.toDataURL('image/png')); }catch(e){ ok(''); } }; im.onerror=function(){ ok(''); }; im.src=src; }); }
/* codice QR come immagine PNG (libreria qrcode-generator, caricata la prima volta che serve) */
async function _tesQrPng_(testo){
  if(!testo)return '';
  try{ if(!window.qrcode)await (window._rptLib_||_tesLib_)('https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js','qrcode');
    var q=qrcode(0,'M'); q.addData(testo); q.make(); var n=q.getModuleCount(), k=8, cv=document.createElement('canvas'), g=cv.getContext('2d');
    cv.width=cv.height=n*k; g.fillStyle='#FFFFFF'; g.fillRect(0,0,n*k,n*k); g.fillStyle=_TES_C_.gr;
    for(var r=0;r<n;r++)for(var c=0;c<n;c++)if(q.isDark(r,c))g.fillRect(c*k,r*k,k,k);
    return cv.toDataURL('image/png'); }catch(e){ return ''; }
}
async function _tesPdfB64_(D){
  if(!window.pdfMake)throw new Error('La libreria dei PDF non è ancora pronta: riprova tra un attimo.');
  D.socio.foto=await _tesImgPng_(D.socio.foto); D.coro.logo=await _tesImgPng_(D.coro.logo); D.qrImg=await _tesQrPng_(D.qr);
  return await new Promise(function(ok,ko){
    var t=setTimeout(function(){ ko(new Error('Il PDF non si è creato: riprova, e se succede ancora avvisa chi segue il gestionale.')); },30000);
    try{ pdfMake.createPdf(_tesDoc_(D)).getBase64(function(b){ clearTimeout(t); ok(b); }); }catch(e){ clearTimeout(t); ko(e); } });
}
function _tesScarica_(b64,nome){ var by=atob(b64), u=new Uint8Array(by.length); for(var i=0;i<by.length;i++)u[i]=by.charCodeAt(i);
  var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([u],{type:'application/pdf'})); a.download=nome; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1500); }
/* carica una libreria (nel portale non c'è _rptLib_ dei report) */
function _tesLib_(url,glob){ return new Promise(function(ok,ko){ if(window[glob])return ok(); var s=document.createElement('script'); s.src=url; s.onload=function(){ ok(); }; s.onerror=function(){ ko(new Error('Non riesco a caricare la libreria: controlla la connessione.')); }; document.head.appendChild(s); }); }

window._tesPdfB64_=_tesPdfB64_;window._tesLib_=_tesLib_;
