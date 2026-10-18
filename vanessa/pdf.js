/* Minimal dependency-free PDF writer: US Letter, Times-Roman / Times-Bold (standard 14 fonts, WinAnsi), word-wrap, multi-page. */
const PDF_W={" ":250,"!":333,'"':408,"#":500,"$":500,"%":833,"&":778,"'":333,"(":333,")":333,"*":500,"+":564,",":250,"-":333,".":250,"/":278,"0":500,"1":500,"2":500,"3":500,"4":500,"5":500,"6":500,"7":500,"8":500,"9":500,":":278,";":278,"<":564,"=":564,">":564,"?":444,"@":921,"A":722,"B":667,"C":667,"D":722,"E":611,"F":556,"G":722,"H":722,"I":333,"J":389,"K":722,"L":611,"M":889,"N":722,"O":722,"P":556,"Q":722,"R":667,"S":556,"T":611,"U":722,"V":722,"W":944,"X":722,"Y":722,"Z":611,"[":333,"\\":278,"]":333,"^":469,"_":500,"`":333,"a":444,"b":500,"c":444,"d":500,"e":444,"f":333,"g":500,"h":500,"i":278,"j":278,"k":500,"l":278,"m":778,"n":500,"o":500,"p":500,"q":500,"r":333,"s":389,"t":278,"u":500,"v":500,"w":722,"x":500,"y":500,"z":444,"{":480,"|":200,"}":480,"~":541,"—":1000,"–":500,"•":350,"§":500,"“":444,"”":444,"‘":333,"’":333,"…":1000,"é":444,"ñ":500};
const PDF_WIN={"—":0x97,"–":0x96,"•":0x95,"§":0xA7,"“":0x93,"”":0x94,"‘":0x91,"’":0x92,"…":0x85,"é":0xE9,"ñ":0xF1,"°":0xB0};
const pdfClean=s=>String(s).replace(/≥/g,">=").replace(/≤/g,"<=").replace(/×/g,"x").replace(/[✔✓]/g,"[x]").replace(/[✘✗]/g,"[ ]").replace(/[→]/g,"->").replace(/[☐]/g,"[ ]").replace(/[→]/g,"->");
const pdfWidth=(s,size,bold)=>{let w=0;for(const ch of s)w+=(PDF_W[ch]??500);return w/1000*size*(bold?1.04:1)};
function pdfEncode(s){let out="";for(const ch of s){const c=ch.charCodeAt(0);let b=c<128?c:(PDF_WIN[ch]??63);if(b===40||b===41||b===92)out+="\\"+String.fromCharCode(b);else if(b<32)out+=" ";else out+=String.fromCharCode(b);}return out;}
function pdfBytes(paragraphs,{size=12,lead=15,margin=72}={}){
  const W=612,H=792,maxW=W-margin*2; const pages=[]; let lines=[];
  const push=(txt,bold,align,gapAfter)=>{ // wrap
    const words=pdfClean(txt).split(/\s+/).filter(Boolean); if(!words.length){lines.push({t:"",bold,gap:gapAfter});return}
    let cur="";for(const w of words){const t=cur?cur+" "+w:w;if(pdfWidth(t,size,bold)>maxW&&cur){lines.push({t:cur,bold,align});cur=w}else cur=t}
    if(cur)lines.push({t:cur,bold,align,gap:gapAfter}); };
  paragraphs.forEach(p=>push(p.t,!!(p.b||p.h),p.align,p.h?6:0));
  const perPage=Math.floor((H-margin*2)/lead); for(let i=0;i<lines.length;i+=perPage)pages.push(lines.slice(i,i+perPage));
  if(!pages.length)pages.push([]);
  const objs=[]; const add=s=>{objs.push(s);return objs.length};
  const fontR=add("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>");
  const fontB=add("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>");
  const pageIds=[]; const pagesId=objs.length+pages.length*2+1;
  pages.forEach(pl=>{let y=H-margin, s="BT\n";
    pl.forEach(l=>{ if(l.t){const f=l.bold?"/F2":"/F1";let x=margin;if(l.align==="right")x=W-margin-pdfWidth(l.t,size,l.bold);if(l.align==="center")x=(W-pdfWidth(l.t,size,l.bold))/2;s+=`${f} ${size} Tf 1 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)} Tm (${pdfEncode(l.t)}) Tj\n`;} y-=lead+(l.gap||0); });
    s+="ET"; const cid=add(`<< /Length ${s.length} >>\nstream\n${s}\nendstream`);
    pageIds.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${fontR} 0 R /F2 ${fontB} 0 R >> >> /Contents ${cid} 0 R >>`)); });
  const pid=add(`<< /Type /Pages /Kids [${pageIds.map(i=>i+" 0 R").join(" ")}] /Count ${pageIds.length} >>`);
  const cat=add(`<< /Type /Catalog /Pages ${pid} 0 R >>`);
  let out="%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"; const offs=[];
  objs.forEach((o,i)=>{offs.push(out.length);out+=`${i+1} 0 obj\n${o}\nendobj\n`});
  const xref=out.length; out+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+offs.map(o=>String(o).padStart(10,"0")+" 00000 n \n").join("")+`trailer\n<< /Size ${objs.length+1} /Root ${cat} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const bytes=new Uint8Array(out.length); for(let i=0;i<out.length;i++)bytes[i]=out.charCodeAt(i)&255; return bytes;
}
