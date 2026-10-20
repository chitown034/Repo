# Inline styles + scripts into one artifact-ready page (no doctype/html/head/body wrappers).
import re,pathlib
root=pathlib.Path(__file__).resolve().parent.parent
css=(root/'styles.css').read_text()
css+="""
/* artifact contract: safe-area gutters + sticky header inset */
main{padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
aside{padding-left:max(10px,env(safe-area-inset-left,0px))}
header.top{top:env(safe-area-inset-top,0px)}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--bg)}
body{min-height:100%}
"""
js=''.join('<script>\n'+(root/f).read_text().replace('</script','<\\/script')+'\n</script>\n' for f in ['data.js','products2.js','engine.js','prompts.js','strategies.js','strategies2.js','credit.js','va.js','vaqa.js','loanqa.js','assist.js','dpr.js','defense.js','dscr.js','vacourse.js','countytax.js','arive.js','offers.js','qc.js','mvlc.js','exam.js','viz.js','bah.js','ops.js','agents2.js','letters.js','guidelines.js','sequences.js','guidelines2.js','guidelines3.js','process.js','process2.js','scenarios.js','scripts.js','docproc.js','isa.js','delegation.js','marketing2.js','vanessa_photo.js','vanessa.js','vanessa_voice.js','steve_photo.js','steve_voice.js','steve.js','pdf.js','wealth.js','scale.js','bizdev.js'])
app=((root/'app.js').read_text()+'\n'+(root/'app2.js').read_text()+'\n'+(root/'app3.js').read_text()+'\n'+(root/'app4.js').read_text()+'\n'+(root/'app5.js').read_text()+'\n'+(root/'app6.js').read_text()+'\n'+(root/'app7.js').read_text()+'\n'+(root/'app8.js').read_text()+'\n'+(root/'app9.js').read_text()+'\n'+(root/'app10.js').read_text()+'\n'+(root/'app11.js').read_text()+'\n'+(root/'app12.js').read_text()+'\n'+(root/'app13.js').read_text()+'\n'+(root/'app14.js').read_text()+'\n'+(root/'app15.js').read_text()+'\n'+(root/'app16.js').read_text()+'\n'+(root/'app17.js').read_text()+'\n'+(root/'app18.js').read_text()+'\n'+(root/'app19.js').read_text()+'\n'+(root/'app20.js').read_text()).replace('</script','<\\/script')
body=re.search(r'<body>(.*?)<script src',(root/'index.html').read_text(),re.S).group(1)
out=f'''<title>VANESSA Command Dashboard</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
{css}
</style>
{body}
{js}<script>
{app}
</script>
'''
(root/'dist'/'vanessa-dashboard.html').write_text(out)
print(len(out),'bytes')
