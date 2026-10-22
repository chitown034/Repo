"""Stopwords for keyword extraction.

Two groups: ordinary English function words, and question filler that says
nothing about *where* an answer lives ("what", "tell me", "currently").
"steven" is filler too: the whole brain is about him, so the word carries no
routing signal and would only inflate keyword coverage on refusal questions.
"""

ENGLISH = """
a about above after again against all also am an and any are aren't as at be because been before
being below between both but by can cannot could couldn't did didn't do does doesn't doing don't
down during each few for from further had hadn't has hasn't have haven't having he he'd he'll he's
her here here's hers herself him himself his how how's i i'd i'll i'm i've if in into is isn't it
it's its itself let's me more most mustn't my myself no nor not of off on once only or other ought
our ours ourselves out over own same shan't she she'd she'll she's should shouldn't so some such
than that that's the their theirs them themselves then there there's these they they'd they'll
they're they've this those through to too under until up very was wasn't we we'd we'll we're we've
were weren't what what's when when's where where's which while who who's whom why why's with won't
would wouldn't you you'd you'll you're you've your yours yourself yourselves
""".split()

FILLER = """
tell know please show give find look lookup say says said explain describe mean means meant
currently current actually really exactly basically just still ever even yet already
thing things stuff kind sort way ways lot lots bit
many much often long does did do done get gets got make makes made use used using
must shall will may might can could would should
need needs want wants go goes going come comes
one ones something anything everything someone anyone
steven steven's shearrill
md http https www com
""".split()

STOPWORDS = frozenset(w.strip().lower() for w in ENGLISH + FILLER)
