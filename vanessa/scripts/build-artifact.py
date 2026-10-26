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
js=''.join('<script>\n'+(root/f).read_text().replace('</script','<\\/script')+'\n</script>\n' for f in ['data.js','products2.js','engine.js','prompts.js','strategies.js','strategies2.js','credit.js','va.js','vaqa.js','loanqa.js','assist.js','dpr.js','defense.js','dscr.js','classes.js','bases.js','isapb.js','ratedesk.js','calc2.js','omdata1.js','omdata2.js','omdata3.js','hub.js','conn.js','equity.js','refp.js','niches.js','live.js','library.js','aiteam.js','nichelib1.js','nichelib2.js','nichelib3.js','lenderinfo1.js','lenderinfo2.js','lenderinfo3.js','lenderinfo4.js','lenderinfo5.js','lenderinfo6.js','lenderinfo7.js','lenderinfo8.js','lptinfo.js','fiassoc.js','correspfi.js','vamaster1.js','vamaster2.js','vamaster3.js','dvtax1.js','dvtax2.js','ppfclic.js','mlolic1.js','mlolic2.js','lendrules.js','countylimits.js','lenderpromo1.js','lenderpromo2.js','lenderuw1.js','lenderuw2.js','loantypes1.js','loantypes2.js','lenderedge1.js','lenderedge2.js','lenderedge3.js','vacourse.js','countytax.js','arive.js','offers.js','qc.js','mvlc.js','exam.js','viz.js','bah.js','ops.js','agents2.js','letters.js','guidelines.js','sequences.js','guidelines2.js','guidelines3.js','process.js','process2.js','scenarios.js','scenarios2.js','scenarios3.js','scenarios4.js','scenarios5.js','scenarios6.js','scenarios7.js','scenarios8.js','scripts.js','talk2.js','docproc.js','isa.js','delegation.js','marketing2.js','vanessa_photo.js','vanessa.js','vanessa_voice.js','steve_photo.js','steve_voice.js','steve.js','pdf.js','wealth.js','scale.js','bizdev.js'])
APPS=['app.js']+[f'app{i}.js' for i in range(2,200) if (root/f'app{i}.js').exists()]+['boot.js']
app='\n'.join((root/f).read_text() for f in APPS).replace('</script','<\\/script')
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
