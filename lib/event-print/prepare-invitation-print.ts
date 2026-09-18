/** Wait for actual images, CSS backgrounds and fonts before opening the dialog. */
export async function prepareInvitationPrint(root: HTMLElement) {
  await document.fonts.ready;
  const urls = new Set<string>();
  const nodes = [root, ...root.querySelectorAll<HTMLElement>('*')];
  for (const node of nodes) {
    for (const pseudo of [null, '::before', '::after']) {
      const background = getComputedStyle(node, pseudo).backgroundImage;
      for (const match of background.matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(match[1]);
    }
  }
  await Promise.all([
    ...[...root.querySelectorAll('img')].map(async image => { await image.decode(); if (!image.naturalWidth) throw new Error('Image unavailable'); }),
    ...[...urls].map(url => new Promise<void>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(); img.onerror = () => reject(new Error('Background unavailable')); img.src = url; })),
  ]);
  // Load the exact faces used in the proof, including their glyph subsets.
  const fonts = new Map<string, string>();
  for (const node of nodes) {
    if (!node.textContent?.trim() || node.children.length) continue;
    const style = getComputedStyle(node);
    fonts.set(`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, node.textContent);
  }
  await Promise.all([...fonts].map(([font, text]) => document.fonts.load(font, text)));
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}
