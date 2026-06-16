let _expanded = false;
const _subs: Array<() => void> = [];

export function isNavExpanded(): boolean { return _expanded; }

export function setNavExpanded(v: boolean) {
  _expanded = v;
  _subs.forEach(fn => fn());
}

export function toggleNav() { setNavExpanded(!_expanded); }

export function subscribeNav(fn: () => void): () => void {
  _subs.push(fn);
  return () => { const i = _subs.indexOf(fn); if (i >= 0) _subs.splice(i, 1); };
}
