// Inline data + app into one self-contained HTML page: node build.js [--sample]
const fs=require("fs"), path=require("path");
const root=__dirname, sample=process.argv.includes("--sample");
const tpl=fs.readFileSync(path.join(root,"src/app.html"),"utf8");
const app=fs.readFileSync(path.join(root,"src/app.js"),"utf8");
const files = sample ? ["sample/sample.js"] :
  fs.readdirSync(path.join(root,"data")).filter(f=>f.endsWith(".js")).sort().map(f=>"data/"+f);
files.push("src/almanac.js");
const safe=s=>s.replace(/<\/(script)/gi,"<\\/$1");
const data=files.map(f=>`<script>/* ${f} */\n${safe(fs.readFileSync(path.join(root,f),"utf8"))}\n</script>`).join("\n");
const out=tpl.replace("<!--DATA-->",()=>data).replace("<!--APP-->",()=>safe(app));
fs.mkdirSync(path.join(root,"dist"),{recursive:true});
const dest=path.join(root,"dist",sample?"sample.html":"lexicon-2027.html");
fs.writeFileSync(dest,out);
console.log("wrote",dest,(out.length/1024).toFixed(0)+" KB from",files.length,"data files");
