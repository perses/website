import Box from '@mui/material/Box';
import { useColorScheme } from '@mui/material/styles';
import { useEffect, useId, useState } from 'react';

/**
 * Mermaid renders a mermaid diagram in the browser. The library is loaded only on the pages having a diagram.
 * Until it is rendered (or without JavaScript), the source of the diagram is displayed.
 */
export function Mermaid({ chart }: { chart: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { mode, systemMode } = useColorScheme();
  const dark = (mode === 'system' ? systemMode : mode) === 'dark';
  const [svg, setSvg] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    void import('mermaid').then(async ({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: dark ? 'dark' : 'default',
        securityLevel: 'strict',
        htmlLabels: false,
        flowchart: { htmlLabels: false },
      });
      try {
        const result = await mermaid.render(`mermaid-${id}`, chart);
        if (!cancelled) {
          setSvg(result.svg);
        }
      } catch (error) {
        console.error('unable to render the mermaid diagram', error);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [chart, dark, id]);

  if (svg === undefined) {
    return (
      <Box component="pre" sx={{ my: 2, p: 2, overflowX: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
        {chart}
      </Box>
    );
  }
  return (
    <Box
      component="img"
      alt="Diagram"
      src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
      sx={{ display: 'block', maxWidth: '100%', mx: 'auto', my: 2 }}
    />
  );
}
