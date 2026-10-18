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
js=''.join('<script>\n'+(root/f).read_text().replace('</script','<\\/script')+'\n</script>\n' for f in ['data.js','engine.js','prompts.js'])
app=(root/'app.js').read_text().replace('</script','<\\/script')
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
