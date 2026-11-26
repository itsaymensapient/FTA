from pathlib import Path
p = Path('stand-design/src/screens.tsx')
t = p.read_text(encoding='utf-8')
if 'ReactElement' not in t:
    t = t.replace(
        "import { useNav, type ScreenId } from '@/nav'",
        "import type { ReactElement } from 'react'\nimport { useNav, type ScreenId } from '@/nav'",
    )
    t = t.replace('Record<ScreenId, () => JSX.Element>', 'Record<ScreenId, () => ReactElement>')
    p.write_text(t, encoding='utf-8')
    print('fixed')
else:
    print('ok')
