"""Write the full-lockup vector reconstruction from the traced colour plates."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
T = json.load(open(os.path.join(HERE, 'build/trace_layers.json')))
L = T['layers']
COL = {'white': '#FFFFFF', 'turq': '#6ED0E0', 'yellow': '#FCE162', 'orange': '#F17B2A',
       'black_symbol': '#050506', 'black_wordmark': '#050506', 'gray_tagline': '#6B6B6C'}

def group(name, layer_names, extra=''):
    g = [f'<g id="{name}" {extra}>']
    for ln in layer_names:
        g.append(f'  <path id="{name}-{ln}" fill="{COL[ln]}" fill-rule="evenodd" d="{" ".join(L[ln])}"/>')
    g.append('</g>')
    return '\n'.join(g)

def svg(body, vb='0 0 2000 667', title='GoFloaters logo — vector reconstruction'):
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{vb.split()[2]}" height="{vb.split()[3]}">
<title>{title}</title>
<desc>VECTOR RECONSTRUCTION traced from the supplied 2000x667 raster logo (colour-separated potrace). Not original source artwork.</desc>
{body}
</svg>
'''

if __name__ == '__main__':
    body = group('symbol', ['white', 'turq', 'yellow', 'orange', 'black_symbol']) + '\n' + \
           group('wordmark', ['black_wordmark']) + '\n' + group('tagline', ['gray_tagline'])
    open(os.path.join(ROOT, 'tools/build/lockup_traced.svg'), 'w').write(svg(body))
    print('ok')
