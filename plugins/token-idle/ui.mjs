const STYLE_ID = 'token-idle-style';
const RAIL_WIDTH = 44;
const PANEL_WIDTH = 340;
const MENUBAR_FALLBACK = 46;
const CHEER_MS = 1800;
const SLEEP_AFTER_MS = 60_000;

const CSS = `
.mn-token-idle-rail {
  position: fixed;
  z-index: 100009;
  top: ${MENUBAR_FALLBACK}px;
  right: 0;
  bottom: 0;
  width: ${RAIL_WIDTH}px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 12px 0 10px;
  border: 0;
  border-left: 1px solid var(--mn-border);
  background: var(--mn-surface-1, var(--mn-bg));
  color: var(--mn-fg);
  font: 600 12px/1.1 var(--mn-font, system-ui, sans-serif);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background-color .16s ease, border-color .16s ease;
}
.mn-token-idle-rail:hover { background: var(--mn-surface-2, var(--mn-bg-hover)); }
.mn-token-idle-rail[aria-pressed="true"] {
  background: var(--mn-surface-2, var(--mn-bg-hover));
  border-left-color: var(--mn-accent-border, var(--mn-accent));
}
.mn-token-idle-rail:focus-visible { outline: 2px solid var(--mn-accent); outline-offset: -3px; }
.mn-token-idle-walker {
  position: fixed;
  z-index: 100009;
  width: 32px;
  height: 40px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: grab;
  touch-action: none;
}
.mn-token-idle-walker.is-held { cursor: grabbing; }
.mn-token-idle-walker .mn-token-idle-dude { transform-origin: 50% 92%; }
.mn-token-idle-walker .mn-token-idle-dude > svg { transform-origin: 16px 36px; }
.mn-token-idle-walker:focus-visible { outline: 2px solid var(--mn-accent); outline-offset: 3px; border-radius: 8px; }
.mn-token-idle-crowd {
  position: fixed;
  z-index: 100007;
  pointer-events: none;
  contain: strict;
}
.mn-token-idle-crowd[hidden] { display: none; }
.mn-token-idle-coin {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: var(--mn-accent-soft);
  color: var(--mn-accent);
}
.mn-token-idle-coin svg { display: block; }
.mn-token-idle-balance {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  letter-spacing: .02em;
  color: var(--mn-fg);
  font-size: 13px;
  max-height: 42%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mn-token-idle-spacer { flex: 1 1 auto; min-height: 8px; }
.mn-token-idle-rate {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  color: var(--mn-fg-subtle, var(--mn-fg-muted));
  font-weight: 500;
  font-size: 11px;
}
.mn-token-idle-dude { position: relative; width: 32px; height: 40px; }
.mn-token-idle-dude svg { display: block; overflow: visible; }
.mn-token-idle-dude .body { fill: var(--mn-accent); }
.mn-token-idle-dude .shine { fill: var(--mn-fg-on-accent, #fff); opacity: .35; }
.mn-token-idle-dude .eye { fill: var(--mn-fg-on-accent, #fff); }
.mn-token-idle-dude .lid { fill: var(--mn-accent); transform-box: fill-box; transform-origin: center top; transform: scaleY(0); }
.mn-token-idle-dude .tool { stroke: var(--mn-fg-muted); stroke-width: 2; stroke-linecap: round; fill: none; }
.mn-token-idle-dude .tool-head { fill: var(--mn-fg-muted); }
.mn-token-idle-dude .arm { transform-box: view-box; transform-origin: 22px 22px; }
.mn-token-idle-dude .shadow { fill: var(--mn-fg); opacity: .12; }
.mn-token-idle-dude .zz { fill: var(--mn-fg-subtle, var(--mn-fg-muted)); font: 700 8px var(--mn-font, sans-serif); opacity: 0; }
.mn-token-idle-dude .sprite { transform-box: view-box; transform-origin: 16px 36px; }
.mn-token-idle-dude[data-mood="idle"] .sprite { animation: mn-ti-bob 2.6s ease-in-out infinite; }
.mn-token-idle-dude[data-mood="idle"] .lid { animation: mn-ti-blink 4.2s infinite; }
.mn-token-idle-dude[data-mood="work"] .sprite { animation: mn-ti-bob 1.1s ease-in-out infinite; }
.mn-token-idle-dude[data-mood="work"] .arm { animation: mn-ti-hammer .55s ease-in-out infinite; }
.mn-token-idle-dude[data-mood="sleep"] .lid { transform: scaleY(1); }
.mn-token-idle-dude[data-mood="sleep"] .sprite { animation: mn-ti-breathe 3.4s ease-in-out infinite; }
.mn-token-idle-walker.is-asleep .mn-token-idle-dude .sprite { animation: mn-ti-bury .55s ease-out forwards; }
.mn-token-idle-dude[data-mood="sleep"] .zz { animation: mn-ti-zz 2.8s ease-in-out infinite; }
.mn-token-idle-dude[data-mood="sleep"] .zz.two { animation-delay: 1.4s; }
.mn-token-idle-dude[data-mood="cheer"] .sprite { animation: mn-ti-jump .6s cubic-bezier(.3,.7,.3,1) 3; }
.mn-token-idle-dude[data-mood="cheer"] .arm { transform: rotate(-70deg); }
.mn-token-idle-dude .face { transform-box: view-box; transform-origin: 16px 28px; }
.mn-token-idle-dude .mouth { fill: none; stroke: var(--mn-fg-on-accent, #fff); stroke-width: 1.4; stroke-linecap: round; opacity: 0; }
.mn-token-idle-dude .mouth.wow { fill: var(--mn-fg-on-accent, #fff); stroke: none; }
.mn-token-idle-dude .brow { fill: none; stroke: var(--mn-fg-on-accent, #fff); stroke-width: 1.3; stroke-linecap: round; opacity: 0; }
.mn-token-idle-dude[data-emote="grin"] .mouth.grin { opacity: 1; }
.mn-token-idle-dude[data-emote="grin"] .face { animation: mn-ti-sway 1.6s ease-in-out infinite; }
.mn-token-idle-dude[data-emote="wow"] .mouth.wow { opacity: 1; }
.mn-token-idle-dude[data-emote="wow"] .eye { transform: scale(1.4); transform-box: fill-box; transform-origin: center; }
.mn-token-idle-dude[data-emote="wow"] .face { animation: mn-ti-wow .55s ease-in-out infinite; }
.mn-token-idle-dude[data-emote="focus"] .brow { opacity: 1; }
.mn-token-idle-dude[data-emote="focus"] .face { animation: mn-ti-focus .48s ease-in-out infinite; }
.mn-token-idle-dude[data-mood="sleep"] .face { animation: none; }
.mn-token-idle-walker.is-raving .mn-token-idle-dude .sprite { animation: mn-ti-rave .22s linear infinite; }
.mn-token-idle-pop {
  position: absolute;
  left: 50%;
  top: -4px;
  transform: translateX(-50%);
  padding: 1px 5px;
  border-radius: 999px;
  background: var(--mn-success-soft, var(--mn-accent-soft));
  color: var(--mn-success, var(--mn-accent));
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
  pointer-events: none;
  animation: mn-ti-pop 1.6s ease-out forwards;
}
@keyframes mn-ti-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
@keyframes mn-ti-breathe { 0%,100% { transform: scale(1, 1); } 50% { transform: scale(1.04, .96); } }
@keyframes mn-ti-blink { 0%,92%,100% { transform: scaleY(0); } 95% { transform: scaleY(1); } }
@keyframes mn-ti-hammer { 0%,100% { transform: rotate(-40deg); } 55% { transform: rotate(25deg); } }
@keyframes mn-ti-jump { 0%,100% { transform: translateY(0) scale(1); } 15% { transform: translateY(0) scale(1.1, .88); } 50% { transform: translateY(-7px) scale(.95, 1.06); } }
@keyframes mn-ti-zz { 0% { opacity: 0; transform: translate(0, 0); } 30% { opacity: 1; } 100% { opacity: 0; transform: translate(4px, -10px); } }
@keyframes mn-ti-pop { 0% { opacity: 0; transform: translate(-50%, 6px); } 15% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -22px); } }
@keyframes mn-ti-bury { from { transform: translateY(0) scale(1, 1); } to { transform: translateY(8px) scale(1.16, 0.7); } }
@keyframes mn-ti-rave { 0%,100% { transform: rotate(-16deg) translateY(0); } 50% { transform: rotate(16deg) translateY(-3px); } }
@keyframes mn-ti-sway { 0%,100% { transform: rotate(-7deg); } 50% { transform: rotate(7deg); } }
@keyframes mn-ti-wow { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-2px) scale(1.08); } }
@keyframes mn-ti-focus { 0%,100% { transform: translateX(0); } 50% { transform: translateX(1.6px) rotate(5deg); } }

.mn-token-idle-panel, .mn-token-idle-rail, .mn-token-idle-walker { user-select: none; -webkit-user-select: none; }
.mn-token-idle-panel {
  position: fixed;
  z-index: 100008;
  top: ${MENUBAR_FALLBACK}px;
  right: ${RAIL_WIDTH}px;
  bottom: 0;
  width: min(${PANEL_WIDTH}px, calc(100vw - ${RAIL_WIDTH}px));
  box-sizing: border-box;
  display: none;
  flex-direction: column;
  border-left: 1px solid var(--mn-border);
  background: var(--mn-bg);
  color: var(--mn-fg);
  font: 13px/1.45 var(--mn-font, system-ui, sans-serif);
}
.mn-token-idle-panel.is-open { display: flex; }
.mn-token-idle-panel * { box-sizing: border-box; }
.mn-token-idle-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 12px 10px 16px;
  border-bottom: 1px solid var(--mn-border-subtle, var(--mn-border));
}
.mn-token-idle-head h2 { margin: 0; font-size: 13px; font-weight: 650; letter-spacing: .01em; }
.mn-token-idle-close {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--mn-radius-sm, 6px);
  background: transparent;
  color: var(--mn-fg-muted);
  cursor: pointer;
}
.mn-token-idle-close:hover { background: var(--mn-surface-2, var(--mn-bg-hover)); color: var(--mn-fg); }
.mn-token-idle-close i { display: flex; font-size: 14px; }
.mn-token-idle-settings { margin: 8px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
.mn-token-idle-setting {
  display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px;
  margin: 0; padding: 12px; border: 1px solid var(--mn-border-subtle, var(--mn-border));
  border-radius: var(--mn-radius-md, 8px); background: var(--mn-surface-1, var(--mn-bg-subtle));
  color: var(--mn-fg); cursor: pointer;
}
.mn-token-idle-setting:hover { background: var(--mn-surface-2, var(--mn-bg-hover)); }
.mn-token-idle-setting.is-on { border-color: var(--mn-accent-border, var(--mn-accent)); }
.mn-token-idle-setting strong { display: block; font-size: 14px; font-weight: 650; }
.mn-token-idle-setting small { display: block; margin-top: 2px; color: var(--mn-fg-muted); font-size: 12px; font-weight: 500; line-height: 1.35; }
.mn-token-idle-setting input {
  appearance: none; width: 36px; height: 20px; margin: 0; border-radius: 999px;
  border: 1px solid var(--mn-border); background: var(--mn-surface-2, var(--mn-bg-muted));
  position: relative; cursor: pointer; flex: none;
}
.mn-token-idle-setting input::after {
  content: ""; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%;
  background: var(--mn-fg-muted); transition: transform .16s ease, background-color .16s ease;
}
.mn-token-idle-setting input:checked { background: var(--mn-accent); border-color: var(--mn-accent); }
.mn-token-idle-setting input:checked::after { transform: translateX(16px); background: var(--mn-fg-on-accent, #fff); }
.mn-token-idle-setting input:focus-visible { outline: 2px solid var(--mn-accent); outline-offset: 2px; }
.mn-token-idle-scroll { flex: 1 1 auto; overflow: auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
.mn-token-idle-hero {
  position: relative; overflow: visible;
  padding: 22px 16px 22px 20px;
  min-height: 210px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 96px;
  align-content: center;
  column-gap: 8px;
  row-gap: 4px;
  background-image: radial-gradient(circle at 100% 0%, var(--mn-accent-soft), transparent 60%);
  border: 1px solid var(--mn-border-subtle, var(--mn-border));
  border-radius: var(--mn-radius-lg, 12px);
  background: var(--mn-surface-1, var(--mn-bg-subtle));
}
.mn-token-idle-hero-pal {
  position: relative; width: 96px; height: 110px; cursor: pointer;
  grid-column: 2; grid-row: 1 / span 6; align-self: center; justify-self: end;
}
.mn-token-idle-hero > :not(.mn-token-idle-hero-pal) { grid-column: 1; min-width: 0; }
.mn-token-idle-hero-pal .mn-token-idle-dude {
  position: absolute; right: 0; top: 50%; z-index: 1;
  transform: translateY(-50%);
  transition: transform .45s ease;
}
.mn-token-idle-hero-pal.is-aside .mn-token-idle-dude { transform: translate(-78px, -50%); }
.mn-token-idle-hero-pal .mn-token-idle-dude, .mn-token-idle-hero-pal .mn-token-idle-dude svg { width: 84px; height: 105px; }
.mn-token-idle-rave {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  border: 1px solid var(--mn-accent-border, var(--mn-border));
  background: var(--mn-accent); color: var(--mn-fg-on-accent, #fff);
  border-radius: 999px; padding: 6px 10px; cursor: pointer;
  font: 700 11px/1 var(--mn-font, system-ui, sans-serif);
}
.mn-token-idle-rave[hidden] { display: none; }
.mn-token-idle-details { border: 1px solid var(--mn-border-subtle, var(--mn-border)); border-radius: 10px; padding: 8px 10px; background: var(--mn-surface-1, transparent); }
.mn-token-idle-details summary { cursor: pointer; font-weight: 650; font-size: 12px; }
.mn-token-idle-details dl { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; margin: 10px 0 0; }
.mn-token-idle-details dt { color: var(--mn-fg-muted); font-size: 11px; }
.mn-token-idle-details dd { margin: 2px 0 0; font-weight: 650; font-variant-numeric: tabular-nums; }
.mn-token-idle-hero .mn-token-idle-label { font-size: 13px; }
.mn-token-idle-hero .mn-token-idle-sub { font-size: 14px; }
.mn-token-idle-label { margin: 0; color: var(--mn-fg-muted); font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; }
.mn-token-idle-big {
  margin: 2px 0;
  max-width: 100%;
  overflow: visible;
  white-space: nowrap;
  font-size: 48px;
  line-height: 1.55;
  min-height: 1.55em;
  padding: 0.16em 0 0.22em;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
  color: var(--mn-fg);
}
.mn-token-idle-unit { margin: 0; color: var(--mn-fg-muted); font-size: 13px; font-weight: 600; }
.mn-token-idle-sub { margin: 0; color: var(--mn-fg-muted); font-size: 12px; font-variant-numeric: tabular-nums; }
.mn-token-idle-sub strong { color: var(--mn-accent); font-weight: 650; }
.mn-token-idle-kicker { margin: 0 0 -8px; color: var(--mn-fg-muted); font-size: 11px; font-weight: 650; letter-spacing: .04em; text-transform: uppercase; }
.mn-token-idle-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 0; }
.mn-token-idle-stats div {
  padding: 8px 10px;
  border-radius: var(--mn-radius-md, 8px);
  background: var(--mn-surface-1, var(--mn-bg-subtle));
}
.mn-token-idle-stats dt { color: var(--mn-fg-subtle, var(--mn-fg-muted)); font-size: 11px; }
.mn-token-idle-stats dd { margin: 2px 0 0; font-weight: 650; font-variant-numeric: tabular-nums; }
.mn-token-idle-hint {
  margin: 0;
  padding: 10px 12px;
  border: 1px dashed var(--mn-accent-border, var(--mn-border));
  border-radius: var(--mn-radius-md, 8px);
  background: var(--mn-accent-soft);
  color: var(--mn-fg);
  font-size: 12px;
}
.mn-token-idle-tabs {
  position: sticky; top: -16px; z-index: 1; display: flex; gap: 4px; margin: -4px 0 0; padding: 3px;
  border-radius: var(--mn-radius-md, 8px); background: var(--mn-surface-1, var(--mn-bg-subtle));
  box-shadow: 0 -12px 0 var(--mn-bg);
}
.mn-token-idle-tab {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 8px;
  border: 0; border-radius: var(--mn-radius-sm, 6px); background: transparent; color: var(--mn-fg-muted);
  font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; transition: background-color .16s ease, color .16s ease;
}
.mn-token-idle-tab i { display: flex; font-size: 13px; }
.mn-token-idle-tab:hover { color: var(--mn-fg); }
.mn-token-idle-tab[aria-selected="true"] {
  background: var(--mn-surface-3, var(--mn-bg)); color: var(--mn-fg);
  box-shadow: 0 1px 2px color-mix(in srgb, black 15%, transparent);
}
.mn-token-idle-count {
  min-width: 16px; padding: 0 5px; border-radius: 999px; background: var(--mn-accent); color: var(--mn-fg-on-accent, #fff);
  font-size: 10px; line-height: 16px; font-variant-numeric: tabular-nums;
}
.mn-token-idle-count:empty { display: none; }
.mn-token-idle-pane[hidden] { display: none; }
.mn-token-idle-grid { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.mn-token-idle-grid > li { display: flex; }
.mn-token-idle-amounts {
  display: flex; gap: 2px; padding: 2px; margin: 0 0 8px auto; border-radius: 8px;
  background: var(--mn-surface-2, var(--mn-bg-muted)); width: fit-content;
}
.mn-token-idle-amount {
  border: 0; background: transparent; color: var(--mn-fg-muted); font: inherit; font-size: 11.5px; font-weight: 600;
  padding: 3px 10px; border-radius: 6px; cursor: pointer; font-variant-numeric: tabular-nums;
}
.mn-token-idle-amount:hover { color: var(--mn-fg); }
.mn-token-idle-amount[aria-checked="true"] { background: var(--mn-bg, Canvas); color: var(--mn-fg); box-shadow: 0 1px 2px rgb(0 0 0 / .15); }
.mn-token-idle-milestone {
  margin-left: auto; margin-right: 4px; align-self: center; font-size: 10px; font-weight: 600; color: var(--mn-fg-muted);
  padding: 1px 6px; border-radius: 999px; font-variant-numeric: tabular-nums;
  background: linear-gradient(90deg, var(--mn-accent-soft, var(--mn-surface-2)) var(--p, 0%), var(--mn-surface-2, var(--mn-bg-muted)) var(--p, 0%));
}
.mn-token-idle-retrain {
  display: flex; align-items: center; gap: 8px; margin: 10px 0 12px; padding: 8px 10px; border-radius: 10px;
  border: 1px solid var(--mn-border); background: var(--mn-surface-1, transparent);
}
.mn-token-idle-retrain[hidden] { display: none; }
.mn-token-idle-retrain-text { flex: 1; display: grid; gap: 2px; font-size: 12px; }
.mn-token-idle-retrain-text span { color: var(--mn-fg-muted); font-size: 11px; }
.mn-token-idle-retrain button:disabled { opacity: .5; cursor: default; }
.mn-token-idle-tile {
  position: relative; display: flex; flex-direction: column; gap: 6px; width: 100%; min-height: 138px; padding: 12px 12px 14px;
  overflow: hidden; border: 1px solid var(--mn-border-subtle, var(--mn-border)); border-radius: var(--mn-radius-md, 8px);
  background: var(--mn-surface-1, var(--mn-bg-subtle)); color: var(--mn-fg); font: inherit; text-align: left; cursor: pointer;
  transition: border-color .16s ease, background-color .16s ease, transform .12s ease;
}
.mn-token-idle-tile:hover:not(:disabled) { background: var(--mn-surface-2, var(--mn-bg-hover)); }
.mn-token-idle-tile:active:not(:disabled) { transform: scale(.97); }
.mn-token-idle-tile:disabled { cursor: default; }
.mn-token-idle-tile.is-ready { border-color: var(--mn-accent-border, var(--mn-accent)); }
.mn-token-idle-tile.is-locked { border-style: dashed; }
.mn-token-idle-tile:not(.is-ready):not(.is-maxed) .mn-token-idle-icon { filter: grayscale(1) brightness(.7); opacity: .6; }
.mn-token-idle-tile.is-locked .mn-token-idle-name, .mn-token-idle-tile.is-locked .mn-token-idle-effect { color: var(--mn-fg-muted); }
.mn-token-idle-tile.is-bought { animation: mn-ti-bought .5s ease-out; }
.mn-token-idle-tile-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; }
.mn-token-idle-icon {
  display: grid; place-items: center; flex: none; width: 32px; height: 32px; border-radius: var(--mn-radius-md, 8px);
  background: var(--mn-accent-soft); color: var(--mn-accent); font-size: 16px; line-height: 1;
}
.mn-token-idle-icon i { display: flex; }
.mn-token-idle-tile.is-locked .mn-token-idle-icon { background: var(--mn-surface-2, var(--mn-bg-muted)); color: var(--mn-fg-subtle, var(--mn-fg-muted)); }
.mn-token-idle-tile.is-ready .mn-token-idle-icon { background: var(--mn-accent); color: var(--mn-fg-on-accent, #fff); }
.mn-token-idle-name { font-weight: 650; font-size: 14px; line-height: 1.3; }
.mn-token-idle-cost {
  margin-top: auto; display: flex; align-items: center; gap: 5px; color: var(--mn-fg-muted);
  font-size: 12px; font-weight: 650; font-variant-numeric: tabular-nums;
}
.mn-token-idle-cost i { display: flex; font-size: 11px; }
.mn-token-idle-tile.is-ready .mn-token-idle-cost { color: var(--mn-accent); }
.mn-token-idle-goal { margin: 10px 0 0; display: grid; gap: 4px; color: var(--mn-fg-muted); font-size: 11.5px; }
.mn-token-idle-goal[hidden] { display: none; }
.mn-token-idle-goal .mn-token-idle-bar { position: static; height: 4px; background: var(--mn-surface-2, var(--mn-bg-muted)); border-radius: 999px; }
.mn-token-idle-plist { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
.mn-token-idle-prow {
  display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 4px 10px; padding: 10px 12px;
  border: 1px solid var(--mn-border-subtle, var(--mn-border)); border-radius: var(--mn-radius-md, 8px);
  background: var(--mn-surface-1, var(--mn-bg-subtle));
}
.mn-token-idle-prow.is-active { border-color: var(--mn-warning, var(--mn-accent)); }
.mn-token-idle-prow.is-rare .mn-token-idle-icon { background: linear-gradient(135deg, #ff5f6d, #ffc371, #47e891, #4facfe, #b06ab3); color: #fff; }
.mn-token-idle-prow .mn-token-idle-blurb { grid-column: 2 / 3; }
.mn-token-idle-prow .mn-token-idle-icon { grid-row: span 2; }
.mn-token-idle-chance { color: var(--mn-fg-subtle, var(--mn-fg-muted)); font-size: 11px; font-weight: 500; font-variant-numeric: tabular-nums; }
.mn-token-idle-spawn-btn {
  grid-row: span 2; padding: 5px 10px; border: 1px solid var(--mn-border); border-radius: var(--mn-radius-sm, 6px);
  background: var(--mn-surface-2, transparent); color: var(--mn-fg); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
}
.mn-token-idle-spawn-btn:hover { border-color: var(--mn-accent); color: var(--mn-accent); }
.mn-token-idle-note { margin: 0; color: var(--mn-fg-subtle, var(--mn-fg-muted)); font-size: 11.5px; }
@keyframes mn-ti-bought { 0% { box-shadow: 0 0 0 0 var(--mn-accent); } 100% { box-shadow: 0 0 0 12px transparent; } }
.mn-token-idle-badge {
  padding: 0 6px;
  border-radius: 999px;
  background: var(--mn-surface-2, var(--mn-bg-muted));
  color: var(--mn-fg-muted);
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.mn-token-idle-blurb {
  margin: 0; color: var(--mn-fg-muted); font-size: 12.5px; line-height: 1.4;
}
.mn-token-idle-effect { color: var(--mn-accent); font-size: 11.5px; font-weight: 600; }
.mn-token-idle-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; overflow: hidden; }
.mn-token-idle-bar span { display: block; height: 100%; width: 0; border-radius: inherit; background: var(--mn-accent); transition: width .25s linear; }
.mn-token-idle-panel button:focus-visible { outline: 2px solid var(--mn-accent); outline-offset: 2px; }
.mn-token-idle-status { min-height: 1.2em; margin: 0; padding: 0 16px 12px; color: var(--mn-danger, var(--mn-fg-muted)); font-size: 12px; }
.mn-token-idle-rail.is-boosted .mn-token-idle-coin { box-shadow: 0 0 0 2px var(--mn-warning, var(--mn-accent)); }
.mn-token-idle-buffs { display: flex; flex-wrap: wrap; gap: 6px; }
.mn-token-idle-buffs:empty { display: none; }
.mn-token-idle-chip {
  display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px;
  border: 1px solid var(--mn-warning, var(--mn-accent-border)); background: var(--mn-surface-2, var(--mn-accent-soft));
  color: var(--mn-fg); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums;
}
.mn-token-idle-chip span { color: var(--mn-fg-muted); font-weight: 500; }
.mn-token-idle-chip i { display: flex; color: var(--mn-warning, var(--mn-accent)); }
.mn-token-idle-spawn {
  transition: left .55s ease-out, top .55s ease-out;
  position: fixed; z-index: 2147483000; display: grid; justify-items: center; gap: 2px; padding: 4px;
  border: 0; background: transparent; color: var(--mn-fg); cursor: pointer; font: 700 11px/1 var(--mn-font, system-ui, sans-serif);
  animation: mn-ti-spawn-in .35s ease-out;
}
.mn-token-idle-drop {
  position: fixed; z-index: 2147483000; display: grid; place-items: center;
  width: 48px; height: 48px; padding: 0; border-radius: 999px; cursor: pointer;
  border: 2px solid var(--mn-warning, var(--mn-accent));
  background: var(--mn-bg, Canvas); color: var(--mn-accent);
  box-shadow: 0 6px 16px color-mix(in srgb, black 28%, transparent);
  font: 700 16px/1 var(--mn-font, system-ui, sans-serif);
  animation: mn-ti-spawn-in .25s ease-out;
}
.mn-token-idle-drop i { display: flex; font-size: 20px; }
.mn-token-idle-drop:focus-visible { outline: 2px solid var(--mn-accent); outline-offset: 2px; }
.mn-token-idle-spawn.is-leaving { animation: mn-ti-spawn-out .4s ease-in forwards; pointer-events: none; }
.mn-token-idle-spawn:focus-visible { outline: 2px solid var(--mn-accent); outline-offset: 2px; border-radius: var(--mn-radius-md, 8px); }
.mn-token-idle-spawn .mn-token-idle-dude, .mn-token-idle-spawn .mn-token-idle-dude svg { width: 56px; height: 70px; }
.mn-token-idle-spawn .mn-token-idle-dude[data-mood] .sprite { animation: mn-ti-jump .9s cubic-bezier(.3,.7,.3,1) infinite; }
.mn-token-idle-dude.is-golden .body, .mn-token-idle-dude.is-golden .lid { fill: var(--mn-warning, var(--mn-accent)); }
.mn-token-idle-dude.is-chaos .body, .mn-token-idle-dude.is-chaos .lid { fill: #ff5f6d; }
.mn-token-idle-dude.is-chaos { animation: mn-ti-hue .6s linear infinite; }
.mn-token-idle-spawn:popover-open, .mn-token-idle-drop:popover-open, .mn-token-idle-toast:popover-open { inset: auto; margin: 0; overflow: visible; }
.mn-token-idle-spawn::backdrop, .mn-token-idle-drop::backdrop, .mn-token-idle-toast::backdrop { display: none; }
.mn-token-idle-toast > i { display: flex; margin-top: 2px; font-size: 16px; color: var(--mn-warning, var(--mn-accent)); }
@keyframes mn-ti-hue { to { filter: hue-rotate(360deg); } }
.mn-token-idle-toast {
  position: fixed; z-index: 2147483647; right: ${RAIL_WIDTH + 12}px; max-width: 280px; padding: 10px 14px;
  display: flex; align-items: flex-start; gap: 10px; pointer-events: none;
  border: 1px solid var(--mn-warning, var(--mn-border)); border-radius: var(--mn-radius-md, 8px);
  background: linear-gradient(var(--mn-surface-2, transparent), var(--mn-surface-2, transparent)), linear-gradient(var(--mn-bg, Canvas), var(--mn-bg, Canvas)), Canvas;
  color: var(--mn-fg); font: 600 13px/1.4 var(--mn-font, system-ui, sans-serif);
  box-shadow: 0 8px 24px color-mix(in srgb, black 22%, transparent); animation: mn-ti-toast-in .25s ease-out;
}
.mn-token-idle-toast small { display: block; color: var(--mn-fg-muted); font-weight: 500; }
@keyframes mn-ti-spawn-in { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: scale(1); } }
@keyframes mn-ti-spawn-out { to { opacity: 0; transform: scale(.4) translateY(10px); } }
@keyframes mn-ti-toast-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .mn-token-idle-dude *, .mn-token-idle-pop, .mn-token-idle-spawn, .mn-token-idle-drop, .mn-token-idle-toast { animation: none !important; }
  .mn-token-idle-bar span { transition: none; }
}
`;

const HINT_UNTIL = 50_000;
const SPAWN_MIN_MS = 10 * 60_000;
const SPAWN_MAX_MS = 20 * 60_000;
const SPAWN_LIFETIME_MS = 14_000;
const TOAST_MS = 3_500;
const CHAOS_STEP_MS = 200;

const ICONS = {
  inkwell: 'pen-nib', press: 'print', loom: 'layers', cache: 'database', foundry: 'flame',
  refinery: 'filter', forge: 'hammer', quant: 'chart-line-up', cluster: 'network', core: 'sun',
  nightshift: 'moon', compressor: 'compress', beacon: 'signal-alt', fuse: 'hourglass', hammer: 'magic-wand',
  overclock: 'bolt', surge: 'coins', frenzy: 'comments', sale: 'tags', jackpot: 'diamond', chaos: 'shuffle', rain: 'coins',
};

const TABS = [
  { id: 'build', label: 'Build', icon: 'hammer' },
  { id: 'perks', label: 'Perks', icon: 'star' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

const CHAOS_PALETTES = [
  { bg: '#1a0b2e', fg: '#f7e8ff', accent: '#ff4fd8' },
  { bg: '#04221a', fg: '#dcfff2', accent: '#22e58b' },
  { bg: '#fff6d6', fg: '#3a2600', accent: '#ff8a00' },
  { bg: '#071b3a', fg: '#e3f0ff', accent: '#3fa9ff' },
  { bg: '#2b0606', fg: '#ffe4e4', accent: '#ff3b3b' },
  { bg: '#f0fff4', fg: '#08321a', accent: '#00a86b' },
  { bg: '#111111', fg: '#fffb00', accent: '#fffb00' },
  { bg: '#ffe9f6', fg: '#4a0033', accent: '#d6007a' },
];
const CHAOS_VARS = ['--mn-bg', '--mn-fg', '--mn-fg-muted', '--mn-fg-subtle', '--mn-accent', '--mn-accent-soft', '--mn-accent-border',
  '--mn-surface-0', '--mn-surface-1', '--mn-surface-2', '--mn-surface-3', '--mn-border', '--mn-fg-on-accent'];

function icon(name) {
  const el = document.createElement('i');
  el.className = `fi fi-rr-${ICONS[name] ?? name}`;
  el.setAttribute('aria-hidden', 'true');
  return el;
}

function raise(el) {
  el.setAttribute('popover', 'manual');
  document.documentElement.append(el);
  try { el.showPopover(); } catch { /* falls back to the z-index */ }
}

function svg(markup, size = 14) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  el.setAttribute('width', String(size));
  el.setAttribute('height', String(size));
  el.setAttribute('viewBox', '0 0 24 24');
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = markup;
  return el;
}

function coin() {
  return svg('<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7.5v9M9.5 9.5h4a1.8 1.8 0 0 1 0 3.6h-3a1.8 1.8 0 0 0 0 3.6H15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>');
}

function closeIcon() {
  return svg('<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>', 14);
}

function dude(variant) {
  const wrap = document.createElement('div');
  wrap.className = variant ? `mn-token-idle-dude is-${variant}` : 'mn-token-idle-dude';
  wrap.dataset.mood = 'idle';
  const art = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  art.setAttribute('width', '32');
  art.setAttribute('height', '40');
  art.setAttribute('viewBox', '0 0 32 40');
  art.setAttribute('aria-hidden', 'true');
  art.innerHTML = `
    <ellipse class="shadow" cx="16" cy="37.5" rx="9" ry="1.6"/>
    <text class="zz" x="22" y="9">z</text>
    <text class="zz two" x="25" y="5">z</text>
    <g class="sprite">
      <g class="arm">
        <path class="tool" d="M22 22 L28 14"/>
        <rect class="tool-head" x="25.5" y="10" width="6" height="4" rx="1" transform="rotate(-55 28.5 12)"/>
      </g>
      <circle class="body" cx="16" cy="25" r="11"/>
      <ellipse class="shine" cx="12" cy="20" rx="3" ry="2"/>
      <circle class="eye" cx="12.5" cy="25" r="1.7"/>
      <circle class="eye" cx="19.5" cy="25" r="1.7"/>
      <rect class="lid" x="10.5" y="23" width="4" height="3.6"/>
      <rect class="lid" x="17.5" y="23" width="4" height="3.6"/>
      <g class="face">
        <path class="mouth grin" d="M11.2 29.2 Q16 33.2 20.8 29.2"/>
        <ellipse class="mouth wow" cx="16" cy="30.2" rx="2.1" ry="2.5"/>
        <path class="brow" d="M9.2 21.2 L13.6 22.6"/>
        <path class="brow" d="M22.8 21.2 L18.4 22.6"/>
      </g>
    </g>`;
  wrap.append(art);
  return wrap;
}

function formatTokens(value) {
  if (!Number.isFinite(value)) return '0';
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (abs >= 1e18) {
    const exp = Math.floor(Math.log10(abs));
    return `${sign}${(abs / 10 ** exp).toFixed(2)}e${exp}`;
  }
  const units = [[1e15, 'Qa'], [1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e4, 'k']];
  for (const [unit, suffix] of units) {
    if (abs >= unit) {
      const n = abs / unit;
      const digits = n >= 100 ? 0 : n >= 10 ? 1 : 2;
      return `${sign}${n.toFixed(digits)}${suffix}`;
    }
  }
  if (abs >= 100) return String(Math.floor(value));
  return (Math.round(value * 10) / 10).toString();
}

function balanceFontSize(text) {
  if (text.length >= 11) return '26px';
  if (text.length >= 9) return '32px';
  if (text.length >= 7) return '40px';
  return '48px';
}

function parse(result) {
  if (typeof result === 'string') return JSON.parse(result);
  return result;
}

function navBottom() {
  let best = 0;
  const nodes = [
    document.querySelector('.mn-os-window-btn.close'),
    document.querySelector('.mn-os-mb-window-controls'),
    document.querySelector('.mn-os-menubar'),
  ];
  for (const el of nodes) {
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) best = Math.max(best, rect.bottom);
  }
  const overlay = navigator.windowControlsOverlay;
  if (overlay?.visible && typeof overlay.getTitlebarAreaRect === 'function') {
    const rect = overlay.getTitlebarAreaRect();
    best = Math.max(best, rect.y + rect.height);
  }
  const css = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--os-menubar-h'));
  if (Number.isFinite(css) && css > 0) best = Math.max(best, css);
  return Math.ceil(Math.max(best, MENUBAR_FALLBACK));
}

const WALKER_W = 32;
const WALKER_H = 40;
const WALKER_GRAVITY = 1500;
const WALKER_HOP = 150;
export const WALKER_CRUISE = 36;
const WALKER_MAX_SPEED = 1600;
const WALKER_RESTITUTION = 0.42;
const WALKER_AIR_DRAG = 0.01;
const WALKER_GROUND_DRAG = 2;
const RAVE_MIN_SPEED = 280;

export const SAYINGS = [
  'Nice!',
  'Hot off the press.',
  'That one counts.',
  'Keep them coming.',
  'Fresh from the chat.',
  'The forge likes that.',
  'Stack it up.',
  'Look at it glow.',
  'We can work with this.',
  'Minted and proud.',
];
export const EMOTES = ['grin', 'wow', 'focus'];

function clampWalker(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function relaxAbove(value, floor, rate, step, signHint) {
  const sign = Math.sign(value) || (signHint === -1 ? -1 : 1);
  const mag = Math.abs(value);
  if (mag <= floor) return sign * floor;
  return sign * (floor + (mag - floor) * Math.exp(-rate * step));
}

export function walkerBounds({ width, height, left, right, top, dudeW = WALKER_W, dudeH = WALKER_H, pad = 6 }) {
  const minX = Math.max(0, left + pad);
  const maxX = Math.max(minX, right - dudeW - pad);
  const minY = Math.max(0, top + pad);
  const maxY = Math.max(minY, height - dudeH - pad);
  return { minX, maxX, minY, maxY };
}

export function walkerStretch(vx, vy) {
  const ax = Math.abs(Number(vx) || 0);
  const ay = Math.abs(Number(vy) || 0);
  const speed = Math.hypot(ax, ay);
  const amount = Math.min(0.46, speed / 640);
  const horiz = speed > 1 ? ax / speed : 0;
  const scaleX = 1 + amount * (horiz * 1.2 - (1 - horiz) * 0.75);
  const scaleY = 1 + amount * ((1 - horiz) * 1.2 - horiz * 0.75);
  return {
    scaleX: Math.min(1.5, Math.max(0.6, scaleX)),
    scaleY: Math.min(1.5, Math.max(0.6, scaleY)),
  };
}

export function stepWalker(body, bounds, dt, held, options = {}) {
  const step = Math.min(Math.max(Number(dt) || 0, 0), 0.05);
  const rng = typeof options.rng === 'function' ? options.rng : () => 0.5;
  const asleep = Boolean(options.asleep);
  let { x, y, vx, vy } = body;
  let heading = body.heading === -1 ? -1 : 1;
  let targetVx = Number.isFinite(body.targetVx) ? body.targetVx : heading * WALKER_CRUISE;
  let decideAt = Number.isFinite(body.decideAt) ? body.decideAt : 0;
  let age = Number.isFinite(body.age) ? body.age : 0;
  let hop = Number.isFinite(body.hop) ? body.hop : 0;
  let gait = body.gait === 'hop' ? 'hop' : 'walk';
  const pack = (next = {}) => ({ ...body, x, y, vx, vy, heading, targetVx, decideAt, age, hop, gait, ...next });
  if (held) {
    return pack({
      x: clampWalker(x, bounds.minX, bounds.maxX),
      y: clampWalker(y, bounds.minY, bounds.maxY),
    });
  }
  if (step === 0) return pack();
  age += step;
  const onFloor = y >= bounds.maxY - 0.8;
  if (asleep) {
    if (onFloor) return pack({ y: bounds.maxY, vx: 0, vy: 0 });
    vy += WALKER_GRAVITY * step;
    vx *= Math.exp(-WALKER_GROUND_DRAG * step);
    x += vx * step;
    y += vy * step;
    x = clampWalker(x, bounds.minX, bounds.maxX);
    if (y >= bounds.maxY) return pack({ y: bounds.maxY, vx: 0, vy: 0 });
    return pack();
  }
  vx = relaxAbove(vx, WALKER_CRUISE, onFloor ? WALKER_GROUND_DRAG : WALKER_AIR_DRAG, step, heading);
  if (!onFloor) vy *= Math.exp(-WALKER_AIR_DRAG * step);
  const flung = Math.hypot(vx, vy) > WALKER_CRUISE * 3.5;
  if (onFloor && !flung && age >= decideAt) {
    if (rng() < 0.34) heading = -heading;
    const kind = rng();
    if (kind < 0.78) {
      gait = 'walk';
      hop = 0;
      targetVx = heading * WALKER_CRUISE * (1 + rng() * 0.7);
    } else {
      gait = 'hop';
      hop = WALKER_HOP * (0.75 + rng() * 0.9);
      targetVx = heading * WALKER_CRUISE;
    }
    decideAt = age + 1.1 + rng() * 2.2;
  }
  if (onFloor && !flung && gait !== 'hop') {
    const sign = Math.sign(targetVx) || heading || Math.sign(vx) || 1;
    const goal = sign * Math.max(WALKER_CRUISE, Math.abs(targetVx));
    vx += (goal - vx) * Math.min(1, 1.6 * step);
    if (Math.abs(vx) < WALKER_CRUISE) vx = sign * WALKER_CRUISE;
    vy = 0;
    y = bounds.maxY;
    x += vx * step;
    if (x <= bounds.minX) {
      x = bounds.minX;
      vx = WALKER_CRUISE;
      heading = 1;
      targetVx = WALKER_CRUISE;
    } else if (x >= bounds.maxX) {
      x = bounds.maxX;
      vx = -WALKER_CRUISE;
      heading = -1;
      targetVx = -WALKER_CRUISE;
    }
    return pack({ gait: 'walk', hop: 0 });
  }
  if (onFloor && gait === 'hop' && !flung) {
    vy = -Math.max(90, hop);
    gait = 'walk';
    hop = 0;
  }
  vy += WALKER_GRAVITY * step;
  vx = clampWalker(vx, -WALKER_MAX_SPEED, WALKER_MAX_SPEED);
  vy = clampWalker(vy, -WALKER_MAX_SPEED, WALKER_MAX_SPEED);
  x += vx * step;
  y += vy * step;
  if (x <= bounds.minX) {
    x = bounds.minX;
    vx = Math.max(WALKER_CRUISE, Math.abs(vx) * 0.45);
    heading = 1;
    targetVx = WALKER_CRUISE;
  } else if (x >= bounds.maxX) {
    x = bounds.maxX;
    vx = -Math.max(WALKER_CRUISE, Math.abs(vx) * 0.45);
    heading = -1;
    targetVx = -WALKER_CRUISE;
  }
  if (y <= bounds.minY) {
    y = bounds.minY;
    vy = Math.abs(vy) * 0.25;
  }
  if (y >= bounds.maxY) {
    y = bounds.maxY;
    vy = vy > 120 ? -vy * WALKER_RESTITUTION : 0;
    gait = 'walk';
  }
  return pack({ gait });
}

export function easeStretch(current, target, dt, outRate = 14, backRate = 7) {
  const step = Math.min(Math.max(Number(dt) || 0, 0), 0.05);
  const from = Number(current);
  const to = Number(target);
  if (!Number.isFinite(from)) return Number.isFinite(to) ? to : 1;
  if (!Number.isFinite(to) || step === 0) return from;
  const towardRest = Math.abs(to - 1) < Math.abs(from - 1) - 0.0001;
  const rate = towardRest ? backRate : outRate;
  return from + (to - from) * (1 - Math.exp(-rate * step));
}

export function stepRave(body, bounds, dt, rng = () => 0.5) {
  const step = Math.min(Math.max(Number(dt) || 0, 0), 0.05);
  let { x, y, vx, vy } = body;
  const roll = typeof rng === 'function' ? rng : () => 0.5;
  if (step === 0) return { ...body, x, y, vx, vy };
  if (!Number.isFinite(vx) || !Number.isFinite(vy) || Math.hypot(vx, vy) < RAVE_MIN_SPEED) {
    const angle = roll() * Math.PI * 2;
    const speed = 420 + roll() * 280;
    vx = Math.cos(angle) * speed;
    vy = Math.sin(angle) * speed;
  } else if (roll() < 0.08) {
    const angle = Math.atan2(vy, vx) + (roll() - 0.5) * 1.4;
    const speed = 420 + roll() * 320;
    vx = Math.cos(angle) * speed;
    vy = Math.sin(angle) * speed;
  }
  x += vx * step;
  y += vy * step;
  if (x <= bounds.minX) {
    x = bounds.minX;
    vx = Math.abs(vx) || RAVE_MIN_SPEED;
  } else if (x >= bounds.maxX) {
    x = bounds.maxX;
    vx = -Math.abs(vx) || -RAVE_MIN_SPEED;
  }
  if (y <= bounds.minY) {
    y = bounds.minY;
    vy = Math.abs(vy) || RAVE_MIN_SPEED;
  } else if (y >= bounds.maxY) {
    y = bounds.maxY;
    vy = -Math.abs(vy) || -RAVE_MIN_SPEED;
  }
  return { ...body, x, y, vx, vy };
}

export function stepCorpse(body, bounds, dt) {
  const step = Math.min(Math.max(Number(dt) || 0, 0), 0.05);
  if (body.phase === 'down') {
    return { ...body, x: clampWalker(body.x, bounds.minX, bounds.maxX), y: bounds.maxY, vx: 0, vy: 0, phase: 'down' };
  }
  let x = body.x;
  let y = body.y;
  let vx = Number(body.vx) || 0;
  let vy = Number(body.vy) || 0;
  if (step === 0) return { ...body, x, y, vx, vy, phase: 'falling' };
  vy += WALKER_GRAVITY * step;
  vx *= Math.exp(-0.6 * step);
  x = clampWalker(x + vx * step, bounds.minX, bounds.maxX);
  y += vy * step;
  if (y >= bounds.maxY) return { ...body, x, y: bounds.maxY, vx: 0, vy: 0, phase: 'down' };
  return { ...body, x, y, vx, vy, phase: 'falling' };
}

export function eatCorpses(hero, corpses, radius = 36) {
  const eaten = [];
  const kept = [];
  for (const corpse of corpses) {
    const pose = corpse.body && Number.isFinite(corpse.body.x) ? corpse.body : corpse;
    const phase = corpse.phase || pose.phase;
    const dx = (hero.x + 16) - (pose.x + 16);
    const dy = (hero.y + 20) - (pose.y + 20);
    const hit = phase === 'down' && Math.hypot(dx, dy) <= radius;
    if (hit) eaten.push(corpse);
    else kept.push(corpse);
  }
  return { eaten, kept };
}

function visibleUpgrades(list) {
  const next = list.filter((upgrade) => upgrade.locked).sort((a, b) => a.unlockAt - b.unlockAt)[0];
  return list.filter((upgrade) => !upgrade.locked || upgrade === next);
}

export default function activate(ctx) {
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.append(style);
    ctx.onCleanup(() => style.remove());
  }

  const rail = document.createElement('button');
  rail.type = 'button';
  rail.className = 'mn-token-idle-rail';
  rail.setAttribute('aria-haspopup', 'dialog');
  rail.setAttribute('aria-pressed', 'false');
  rail.setAttribute('aria-expanded', 'false');
  const coinBadge = document.createElement('span');
  coinBadge.className = 'mn-token-idle-coin';
  coinBadge.append(coin());
  const railBalance = document.createElement('span');
  railBalance.className = 'mn-token-idle-balance';
  railBalance.textContent = '0';
  const spacerTop = document.createElement('span');
  spacerTop.className = 'mn-token-idle-spacer';
  const railRate = document.createElement('span');
  railRate.className = 'mn-token-idle-rate';
  railRate.textContent = '0/s';
  rail.append(coinBadge, railBalance, spacerTop, railRate);
  document.documentElement.append(rail);
  ctx.onCleanup(() => rail.remove());

  const walker = document.createElement('button');
  walker.type = 'button';
  walker.className = 'mn-token-idle-walker';
  walker.setAttribute('aria-haspopup', 'dialog');
  walker.setAttribute('aria-expanded', 'false');
  walker.setAttribute('aria-label', 'Open Token Foundry');
  const sprite = dude();
  walker.append(sprite);
  document.documentElement.append(walker);
  const walkerArt = sprite.querySelector('svg');
  ctx.onCleanup(() => walker.remove());
  let walkerBody = { x: 120, y: 0, vx: WALKER_CRUISE, vy: 0 };
  let walkerHeld = false;
  let walkerPointer = null;
  let walkerGrabX = 0;
  let walkerGrabY = 0;
  let walkerSample = null;
  let suppressWalkerClick = false;
  let walkerFrame = 0;
  let walkerLast = 0;
  let shownScaleX = 1;
  let shownScaleY = 1;
  let ravers = [];
  let lastRaveSpawn = 0;
  let crowd = null;
  let crowdCtx = null;
  let crowdStamp = 0;
  let crowdInk = '#7c6af7';
  let crowdEye = '#ffffff';
  let cheerLine = SAYINGS[0];
  let cheerReady = false;
  let emoteIndex = 0;
  let emoteUntil = 0;

  const panel = document.createElement('section');
  panel.className = 'mn-token-idle-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'mn-token-idle-title');
  panel.innerHTML = `
    <header class="mn-token-idle-head">
      <h2 id="mn-token-idle-title">Token Foundry</h2>
      <button type="button" class="mn-token-idle-close" data-close aria-label="Close Token Foundry"></button>
    </header>
    <div class="mn-token-idle-scroll">
      <div class="mn-token-idle-hero">
        <div class="mn-token-idle-hero-pal" data-hero-dude><button type="button" class="mn-token-idle-rave" data-rave hidden>Rave</button></div>
        <p class="mn-token-idle-label" data-hero-say>On hand</p>
        <p class="mn-token-idle-big" aria-live="off"><span data-balance>0</span></p>
        <p class="mn-token-idle-unit">tokens</p>
        <p class="mn-token-idle-sub"><strong data-rate>0/s</strong> idle income <span data-multi></span></p>
        <p class="mn-token-idle-sub"><strong data-lifetime>0</strong> total earned</p>
        <div class="mn-token-idle-goal" data-goal hidden>
          <span data-goal-text></span>
          <div class="mn-token-idle-bar" aria-hidden="true"><span data-goal-fill></span></div>
        </div>
      </div>
      <div class="mn-token-idle-buffs" data-buffs aria-label="Active power-ups"></div>
      <p class="mn-token-idle-kicker">This run</p>
      <dl class="mn-token-idle-stats">
        <div><dt>From chat</dt><dd data-chat>0</dd></div>
        <div><dt>Idle</dt><dd data-idle>0</dd></div>
        <div><dt>Spent</dt><dd data-spent>0</dd></div>
      </dl>
      <details class="mn-token-idle-details">
        <summary>Details</summary>
        <dl>
          <div><dt>All-time earned</dt><dd data-life-earned>0</dd></div>
          <div><dt>This run</dt><dd data-run-earned>0</dd></div>
          <div><dt>All-time from chat</dt><dd data-life-chat>0</dd></div>
          <div><dt>All-time idle</dt><dd data-life-idle>0</dd></div>
          <div><dt>All-time spent</dt><dd data-life-spent>0</dd></div>
          <div><dt>Retrains</dt><dd data-prestiges>0</dd></div>
        </dl>
      </details>
      <p class="mn-token-idle-hint" data-hint>Chat to mint. Every token this workspace uses in chat lands in your balance.</p>
      <div class="mn-token-idle-retrain" data-retrain>
        <span class="mn-token-idle-retrain-text"><strong data-insight>0 insight</strong><span data-insight-sub></span></span>
        <button type="button" class="mn-token-idle-spawn-btn" data-retrain-btn>Retrain</button>
      </div>
      <div class="mn-token-idle-tabs" role="tablist" aria-label="Foundry sections" data-tabs></div>
      <div class="mn-token-idle-pane" role="tabpanel" data-pane="build">
        <div class="mn-token-idle-amounts" role="radiogroup" aria-label="Buy amount" data-amounts></div>
        <ul class="mn-token-idle-grid" data-list></ul>
      </div>
      <div class="mn-token-idle-pane" role="tabpanel" data-pane="perks" hidden><ul class="mn-token-idle-grid" data-perks></ul></div>
      <div class="mn-token-idle-pane" role="tabpanel" data-pane="settings" hidden>
        <p class="mn-token-idle-note">Saved in this browser. Turning one off stops it right away.</p>
        <ul class="mn-token-idle-settings" data-setting-list></ul>
      </div>
    </div>
    <p class="mn-token-idle-status" role="status" data-status></p>
  `;
  panel.querySelector('[data-close]').append(closeIcon());
  document.documentElement.append(panel);
  ctx.onCleanup(() => panel.remove());

  const $ = (sel) => panel.querySelector(sel);
  let snapshot = { balance: 0, baseRate: 0, buffs: [], at: Date.now() };
  let state = null;
  let busy = false;
  let open = false;
  let cheerUntil = 0;
  let lastChatAt = 0;
  let cards = [];
  let spawnEl = null;
  let spawnTimer = null;
  let toastEl = null;
  let tab = 'build';
  let boughtId = null;
  let chaosTimer = null;
  let raveOn = false;
  let chaosStep = 0;
  let chaosSaved = new Map();
  let buyMode = 1;
  const insetTargets = new Map();
  const SETTINGS = [
    ['rave', 'magic-wand', 'Rave', 'Click him to step aside, and click him again to come back. Every 20 seconds there is also a 10% chance he steps aside on his own.'],
    ['sprites', 'flame', 'Power-up sprites', 'Golden sprites can appear on screen. Token rain comes from those sprites.'],
    ['chaosColors', 'shuffle', 'Theme changes', 'Rave and Token Chaos can recolour Minnow.'],
  ];
  function loadPrefs() {
    try {
      const saved = JSON.parse(localStorage.getItem('mn-token-idle-settings') || '{}');
      return {
        rave: saved.rave !== false,
        sprites: saved.sprites !== false,
        chaosColors: saved.chaosColors !== false,
      };
    } catch {
      return { rave: true, sprites: true, chaosColors: true };
    }
  }
  let prefs = loadPrefs();
  function savePrefs() {
    try { localStorage.setItem('mn-token-idle-settings', JSON.stringify(prefs)); } catch { /* private mode */ }
  }
  const heroDude = dude();
  const heroPal = $('[data-hero-dude]');
  heroPal.append(heroDude);
  let ravePeekUntil = 0;
  function toggleRave() {
    raveOn = !raveOn;
    const chaosBuff = (state?.buffs ?? []).some((buff) => (buff.chaos || buff.id === 'chaos') && buff.expiresAt > Date.now());
    setChaos(raveOn || chaosBuff);
    if (!raveOn) ravePeekUntil = 0;
    paintRave();
  }
  function paintRave() {
    const button = $('[data-rave]');
    const show = prefs.rave && (raveOn || Date.now() < ravePeekUntil);
    heroPal.classList.toggle('is-aside', show);
    button.hidden = !show;
    button.textContent = raveOn ? 'Stop' : 'Rave';
    button.setAttribute('aria-pressed', raveOn ? 'true' : 'false');
  }
  function rollRave() {
    if (!prefs.rave || !open || raveOn || Date.now() < ravePeekUntil) return;
    if (Math.random() < 0.10) ravePeekUntil = Date.now() + 8_000;
    paintRave();
  }
  function stepAside() {
    if (!prefs.rave) return;
    ravePeekUntil = Date.now() + 8_000;
    paintRave();
  }
  function comeBack() {
    const wasRave = raveOn;
    raveOn = false;
    ravePeekUntil = 0;
    if (wasRave) {
      const chaosBuff = (state?.buffs ?? []).some((buff) => (buff.chaos || buff.id === 'chaos') && buff.expiresAt > Date.now());
      setChaos(prefs.chaosColors && chaosBuff);
    }
    paintRave();
  }
  function isAside() {
    return prefs.rave && (raveOn || Date.now() < ravePeekUntil);
  }
  function applyPrefs() {
    if (!prefs.rave) {
      raveOn = false;
      ravePeekUntil = 0;
    }
    paintRave();
    const chaosBuff = (state?.buffs ?? []).some((buff) => (buff.chaos || buff.id === 'chaos') && buff.expiresAt > Date.now());
    setChaos(prefs.chaosColors && (raveOn || chaosBuff));
    if (!prefs.sprites) {
      clearTimeout(spawnTimer);
      spawnTimer = null;
      despawn();
      stopRain();
    } else if (!spawnTimer) {
      scheduleSpawn();
    }
  }
  heroPal.addEventListener('click', (event) => {
    if (event.target.closest('[data-rave]')) return;
    if (isAside()) comeBack();
    else if (prefs.rave) stepAside();
    else {
      pickSaying();
      cheerUntil = Date.now() + 1800;
      paintLive();
    }
  });
  $('[data-rave]').addEventListener('click', toggleRave);
  for (const [id, glyph, label, detail] of SETTINGS) {
    const row = document.createElement('li');
    const labelEl = document.createElement('label');
    labelEl.className = 'mn-token-idle-setting';
    const badge = document.createElement('span');
    badge.className = 'mn-token-idle-icon';
    badge.append(icon(glyph));
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = prefs[id];
    input.setAttribute('aria-label', label);
    const sync = () => labelEl.classList.toggle('is-on', input.checked);
    sync();
    input.addEventListener('change', () => {
      prefs[id] = input.checked;
      sync();
      savePrefs();
      applyPrefs();
    });
    const text = document.createElement('span');
    const strong = document.createElement('strong');
    strong.textContent = label;
    const small = document.createElement('small');
    small.textContent = detail;
    text.append(strong, small);
    labelEl.append(badge, text, input);
    row.append(labelEl);
    $('[data-setting-list]').append(row);
  }
  const QUIPS = { idle: 'On hand', work: 'Forging…', sleep: 'Zzz… on hand' };
  function pickSaying() {
    cheerLine = SAYINGS[Math.floor(Math.random() * SAYINGS.length)];
    cheerReady = true;
    return cheerLine;
  }
  function showSaying(line) {
    const pop = document.createElement('span');
    pop.className = 'mn-token-idle-pop';
    pop.textContent = line;
    sprite.append(pop);
    setTimeout(() => pop.remove(), 1700);
  }

  const amountButtons = [1, 10, 100, 'max'].map((mode) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mn-token-idle-amount';
    button.setAttribute('role', 'radio');
    button.textContent = mode === 'max' ? 'Max' : `\u00d7${mode}`;
    button.addEventListener('click', () => {
      buyMode = mode;
      for (const b of amountButtons) b.setAttribute('aria-checked', b === button ? 'true' : 'false');
      paintLive();
    });
    button.setAttribute('aria-checked', mode === buyMode ? 'true' : 'false');
    return button;
  });
  $('[data-amounts]').append(...amountButtons);

  let retrainArmedUntil = 0;
  let retrainTimer;
  $('[data-retrain-btn]').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    if (!state || !(state.insightOnReset >= 1)) return;
    if (Date.now() > retrainArmedUntil) {
      retrainArmedUntil = Date.now() + 4000;
      button.textContent = `Confirm: +${state.insightOnReset} insight?`;
      clearTimeout(retrainTimer);
      retrainTimer = setTimeout(() => { retrainArmedUntil = 0; button.textContent = 'Retrain'; }, 4000);
      return;
    }
    retrainArmedUntil = 0;
    clearTimeout(retrainTimer);
    button.textContent = 'Retrain';
    const result = await call('prestige', {});
    if (result?.gained) toast('brain', 'Foundry retrained', `+${result.gained} insight \u00b7 ${result.insight * 5}% permanent income`);
    else toast('brain', 'Retrain failed', $('[data-status]').textContent || 'The foundry could not retrain.');
  });

  function bulkCost(card, count) {
    if (count <= 0) return 0;
    const g = card.growth;
    return Math.floor(card.baseCost * g ** card.owned * ((g ** count - 1) / (g - 1)) * (1 - card.discount));
  }

  function maxAffordable(card, balance) {
    const room = card.maxOwned != null ? Math.max(0, card.maxOwned - card.owned) : Infinity;
    const first = card.baseCost * card.growth ** card.owned * (1 - card.discount);
    if (balance < first) return 0;
    let n = Math.min(room, Math.floor(Math.log(1 + (balance * (card.growth - 1)) / first) / Math.log(card.growth)));
    while (n > 0 && bulkCost(card, n) > balance) n -= 1;
    return n;
  }

  function quote(card, balance) {
    if (card.perk || buyMode === 1) return { count: 1, cost: card.cost };
    if (buyMode === 'max') {
      const count = maxAffordable(card, balance);
      return count ? { count, cost: bulkCost(card, count) } : { count: 1, cost: card.cost };
    }
    const room = card.maxOwned != null ? card.maxOwned - card.owned : buyMode;
    const count = Math.max(1, Math.min(buyMode, room));
    return { count, cost: bulkCost(card, count) };
  }

  const tabButtons = new Map();
  for (const entry of TABS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mn-token-idle-tab';
    button.setAttribute('role', 'tab');
    const count = document.createElement('span');
    count.className = 'mn-token-idle-count';
    button.append(icon(entry.icon), entry.label, count);
    button.addEventListener('click', () => setTab(entry.id));
    $('[data-tabs]').append(button);
    tabButtons.set(entry.id, { button, count });
  }

  function setTab(next) {
    tab = next;
    for (const [id, { button }] of tabButtons) button.setAttribute('aria-selected', id === tab ? 'true' : 'false');
    for (const pane of panel.querySelectorAll('[data-pane]')) pane.hidden = pane.dataset.pane !== tab;
  }
  setTab(tab);

  function setChaos(on) {
    if (!prefs.chaosColors) on = false;
    if (on === Boolean(chaosTimer)) return;
    const root = document.documentElement.style;
    if (!on) {
      clearInterval(chaosTimer);
      chaosTimer = null;
      for (const [name, value] of chaosSaved) value ? root.setProperty(name, value) : root.removeProperty(name);
      chaosSaved = new Map();
      sprite.classList.remove('is-chaos');
      return;
    }
    chaosSaved = new Map(CHAOS_VARS.map((name) => [name, root.getPropertyValue(name)]));
    sprite.classList.add('is-chaos');
    const paint = () => {
      const p = CHAOS_PALETTES[chaosStep++ % CHAOS_PALETTES.length];
      const mix = (pct) => `color-mix(in srgb, ${p.fg} ${pct}%, ${p.bg})`;
      const values = {
        '--mn-bg': p.bg, '--mn-fg': p.fg, '--mn-fg-muted': mix(70), '--mn-fg-subtle': mix(50),
        '--mn-accent': p.accent, '--mn-accent-soft': `color-mix(in srgb, ${p.accent} 18%, ${p.bg})`,
        '--mn-accent-border': `color-mix(in srgb, ${p.accent} 50%, ${p.bg})`, '--mn-fg-on-accent': p.bg,
        '--mn-surface-0': p.bg, '--mn-surface-1': mix(6), '--mn-surface-2': mix(11), '--mn-surface-3': mix(16), '--mn-border': mix(20),
      };
      for (const [name, value] of Object.entries(values)) root.setProperty(name, value);
    };
    paint();
    chaosTimer = setInterval(paint, CHAOS_STEP_MS);
  }

  function multiplierAt(at) {
    return snapshot.buffs.reduce((m, buff) => (buff.expiresAt > at ? m * (buff.idleMultiplier || 1) : m), 1);
  }

  function currentRate() {
    return snapshot.baseRate * multiplierAt(Date.now());
  }

  function displayed() {
    const now = Date.now();
    const ends = snapshot.buffs.map((buff) => buff.expiresAt).filter((at) => at > snapshot.at && at < now).sort((a, b) => a - b);
    let total = snapshot.balance;
    let from = snapshot.at;
    for (const to of [...ends, now]) {
      total += snapshot.baseRate * multiplierAt(from) * ((to - from) / 1000);
      from = to;
    }
    return total;
  }

  function mood() {
    const now = Date.now();
    if (now < cheerUntil) return 'cheer';
    if (snapshot.baseRate > 0) return 'work';
    if (now - lastChatAt > SLEEP_AFTER_MS) return 'sleep';
    return 'idle';
  }

  function paintLive() {
    const value = displayed();
    const text = formatTokens(value);
    railBalance.textContent = text;
    const rate = currentRate();
    railRate.textContent = `${formatTokens(rate)}/s`;
    rail.setAttribute('aria-label', `Token Foundry, ${text} tokens, ${formatTokens(rate)} per second`);
    rail.title = `${value.toFixed(1)} tokens`;
    const now = Date.now();
    const live = snapshot.buffs.filter((buff) => buff.expiresAt > now);
    rail.classList.toggle('is-boosted', live.length > 0);
    setChaos(raveOn || live.some((buff) => buff.chaos || buff.id === 'chaos'));
    const next = mood();
    if (sprite.dataset.mood !== next) sprite.dataset.mood = next;
    const emoteNow = Date.now();
    if (next === 'sleep') sprite.dataset.emote = '';
    else if (next === 'cheer') sprite.dataset.emote = 'wow';
    else {
      if (emoteNow >= emoteUntil) {
        emoteIndex = (emoteIndex + 1) % EMOTES.length;
        emoteUntil = emoteNow + 2600 + Math.random() * 2400;
      }
      sprite.dataset.emote = EMOTES[emoteIndex];
    }
    if (!open || !state) return;
    if (heroDude.dataset.mood !== next) {
      if (next === 'cheer' && !cheerReady) pickSaying();
      cheerReady = false;
      heroDude.dataset.mood = next;
      heroDude.dataset.emote = sprite.dataset.emote;
      $('[data-hero-say]').textContent = next === 'cheer' ? cheerLine : (QUIPS[next] ?? 'On hand');
    }
    if (heroDude.dataset.emote !== sprite.dataset.emote) heroDude.dataset.emote = sprite.dataset.emote;
    heroDude.classList.toggle('is-chaos', sprite.classList.contains('is-chaos'));
    const balanceEl = $('[data-balance]');
    balanceEl.textContent = text;
    balanceEl.parentElement.style.fontSize = balanceFontSize(text);
    const earned = (state.lifetime ?? 0) + (value - state.balance);
    const runEarned = (state.runLifetime ?? 0) + (value - state.balance);
    $('[data-lifetime]').textContent = formatTokens(earned);
    $('[data-life-earned]').textContent = formatTokens(earned);
    $('[data-run-earned]').textContent = formatTokens(runEarned);
    $('[data-life-chat]').textContent = formatTokens(state.careerFromUsage ?? 0);
    const pendingIdle = Math.max(0, value - state.balance);
    $('[data-life-idle]').textContent = formatTokens((state.careerFromIdle ?? 0) + pendingIdle);
    $('[data-life-spent]').textContent = formatTokens(state.careerSpent ?? 0);
    $('[data-prestiges]').textContent = String(state.prestiges ?? 0);
    $('[data-chat]').textContent = formatTokens(state.gainedFromUsage ?? 0);
    $('[data-idle]').textContent = formatTokens((state.gainedFromIdle ?? 0) + pendingIdle);
    $('[data-spent]').textContent = formatTokens(state.spent ?? 0);
    paintRave();
    $('[data-rate]').textContent = `${formatTokens(rate)}/s`;
    $('[data-buffs]').replaceChildren(...live.map((buff) => {
      const chip = document.createElement('span');
      chip.className = 'mn-token-idle-chip';
      const left = document.createElement('span');
      left.textContent = `${Math.ceil((buff.expiresAt - now) / 1000)}s`;
      chip.append(icon(buff.id), buff.name, left);
      return chip;
    }));
    const ready = { build: 0, perks: 0 };
    for (const card of cards) {
      const q = card.locked || card.maxed ? { count: 1, cost: card.cost } : quote(card, value);
      card.quote = q;
      const ratio = card.maxed ? 1 : Math.max(0, Math.min(1, value / q.cost));
      card.fill.style.width = `${(ratio * 100).toFixed(1)}%`;
      const canBuy = !card.locked && !card.maxed && value >= q.cost;
      if (!card.locked && !card.maxed) {
        const label = `${formatTokens(q.cost)}${q.count > 1 ? ` \u00b7 \u00d7${q.count}` : ''}`;
        if (card.costText.textContent !== label) card.costText.textContent = label;
      }
      if (canBuy) ready[card.perk ? 'perks' : 'build'] += 1;
      card.item.classList.toggle('is-ready', canBuy);
      card.item.disabled = !canBuy;
    }
    tabButtons.get('build').count.textContent = ready.build ? String(ready.build) : '';
    tabButtons.get('perks').count.textContent = ready.perks ? String(ready.perks) : '';
    const run = state.runLifetime + (value - state.balance);
    const PRESTIGE_UNIT = state.prestigeUnit || 100_000_000;
    const gain = Math.floor(Math.sqrt(Math.max(0, run) / PRESTIGE_UNIT));
    $('[data-insight-sub]').textContent = gain > 0
      ? `Retrain for +${gain}`
      : `${formatTokens(run)} / ${formatTokens(PRESTIGE_UNIT)} earned this run`;
    $('[data-retrain-btn]').disabled = !(gain >= 1);
    $('[data-retrain]').hidden = state.insight === 0 && run < PRESTIGE_UNIT / 10;
    const goal = state.upgrades.filter((u) => u.locked).sort((a, b) => a.unlockAt - b.unlockAt)[0];
    $('[data-goal]').hidden = !goal;
    if (goal) {
      const lifetime = state.lifetime + (value - state.balance);
      $('[data-goal-text]').textContent = `Next: ${goal.name} at ${formatTokens(goal.unlockAt)}`;
      $('[data-goal-fill]').style.width = `${Math.min(100, (lifetime / goal.unlockAt) * 100).toFixed(1)}%`;
    }
  }

  function buildPanel() {
    if (!state) return;
    $('[data-rate]').textContent = `${formatTokens(state.ratePerSecond)}/s`;
    const totalMulti = state.multiplier * (state.insightMultiplier || 1);
    $('[data-multi]').textContent = totalMulti > 1 ? `\u00b7 \u00d7${totalMulti.toFixed(2)} bonus` : '';
    $('[data-insight]').textContent = `${state.insight} insight \u00b7 +${Math.round(state.insight * 5)}% income`;
    $('[data-retrain-btn]').disabled = state.insightOnReset < 1;
    $('[data-hint]').hidden = state.lifetime > HINT_UNTIL;
    const generators = state.upgrades.filter((upgrade) => upgrade.kind !== 'perk');
    const perks = state.upgrades.filter((upgrade) => upgrade.kind === 'perk');
    cards = [...visibleUpgrades(generators), ...visibleUpgrades(perks)].map((upgrade) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = upgrade.locked ? 'mn-token-idle-tile is-locked' : 'mn-token-idle-tile';
      if (upgrade.id === boughtId) item.classList.add('is-bought');
      if (upgrade.maxed) item.classList.add('is-maxed');
      item.title = upgrade.blurb;
      item.setAttribute('aria-label', upgrade.maxed
        ? `${upgrade.name}, owned. ${upgrade.effect}`
        : upgrade.locked
          ? `${upgrade.name} unlocks at ${formatTokens(upgrade.unlockAt)} lifetime tokens`
          : `Buy ${upgrade.name} for ${formatTokens(upgrade.cost)} tokens. ${upgrade.effect}. ${upgrade.owned} owned`);
      const top = document.createElement('div');
      top.className = 'mn-token-idle-tile-top';
      const badgeIcon = document.createElement('span');
      badgeIcon.className = 'mn-token-idle-icon';
      badgeIcon.append(icon(upgrade.id));
      top.append(badgeIcon);
      if (upgrade.owned) {
        const badge = document.createElement('span');
        badge.className = 'mn-token-idle-badge';
        badge.textContent = upgrade.maxed && upgrade.maxOwned === 1 ? 'Owned' : `\u00d7${upgrade.owned}`;
        top.append(badge);
      }
      if (upgrade.kind !== 'perk' && !upgrade.locked && upgrade.nextMilestone) {
        const ms = document.createElement('span');
        ms.className = 'mn-token-idle-milestone';
        const prev = [0, ...state.milestones].filter((at) => at <= upgrade.owned).pop();
        ms.title = `Output doubles at ${upgrade.nextMilestone} owned`;
        ms.style.setProperty('--p', `${(((upgrade.owned - prev) / (upgrade.nextMilestone - prev)) * 100).toFixed(1)}%`);
        ms.textContent = `\u00d72 at ${upgrade.nextMilestone}`;
        top.append(ms);
      }
      const name = document.createElement('span');
      name.className = 'mn-token-idle-name';
      name.textContent = upgrade.name;
      const effect = document.createElement('span');
      effect.className = 'mn-token-idle-effect';
      effect.textContent = upgrade.locked ? 'Locked'
        : upgrade.milestoneMultiplier > 1 ? `${upgrade.effect} \u00b7 \u00d7${upgrade.milestoneMultiplier}` : upgrade.effect;
      const blurb = document.createElement('p');
      blurb.className = 'mn-token-idle-blurb';
      blurb.textContent = upgrade.locked ? `Unlocks at ${formatTokens(upgrade.unlockAt)} earned` : upgrade.blurb;
      const cost = document.createElement('span');
      cost.className = 'mn-token-idle-cost';
      const costText = document.createElement('span');
      if (upgrade.maxed && upgrade.kind === 'perk') cost.append(icon('check'), `Owned \u00b7 ${formatTokens(upgrade.baseCost ?? upgrade.cost)}`);
      else if (upgrade.maxed) cost.append(icon('check'), 'Maxed');
      else if (upgrade.locked) cost.append(icon('lock'), formatTokens(upgrade.unlockAt));
      else { costText.textContent = formatTokens(upgrade.cost); cost.append(icon('coins'), costText); }
      const bar = document.createElement('div');
      bar.className = 'mn-token-idle-bar';
      bar.setAttribute('aria-hidden', 'true');
      const fill = document.createElement('span');
      bar.append(fill);
      item.append(top, name, effect, blurb, cost, bar);
      const li = document.createElement('li');
      li.append(item);
      const card = {
        li, item, fill, costText, cost: upgrade.cost, locked: upgrade.locked, maxed: upgrade.maxed, perk: upgrade.kind === 'perk',
        owned: upgrade.owned, maxOwned: upgrade.maxOwned, growth: upgrade.growth, baseCost: upgrade.baseCost, discount: upgrade.discount ?? 0,
      };
      item.addEventListener('click', async () => {
        const count = card.perk ? 1 : buyMode === 'max' ? 'max' : (card.quote?.count ?? 1);
        const result = await call('buy', { upgrade_id: upgrade.id, count });
        if (result?.bought) { boughtId = upgrade.id; buildPanel(); boughtId = null; }
      });
      return card;
    });
    $('[data-list]').replaceChildren(...cards.filter((card) => !card.perk).map((card) => card.li));
    $('[data-perks]').replaceChildren(...cards.filter((card) => card.perk).map((card) => card.li));
    paintLive();
  }

  function pickPowerup() {
    const pool = state?.powerups ?? [];
    const total = pool.reduce((sum, powerup) => sum + powerup.weight, 0);
    let roll = Math.random() * total;
    for (const powerup of pool) {
      roll -= powerup.weight;
      if (roll < 0) return powerup.id;
    }
    return pool[0]?.id;
  }

  function despawn() {
    if (!spawnEl) return;
    const el = spawnEl;
    spawnEl = null;
    clearTimeout(el.expireTimer);
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 400);
  }

  const rainDrops = new Set();
  let rainTimer = null;
  let rainUntil = 0;

  function removeDrop(el) {
    if (!el) return;
    clearTimeout(el.expireTimer);
    rainDrops.delete(el);
    el.remove();
  }

  function stopRain() {
    clearTimeout(rainTimer);
    rainTimer = null;
    rainUntil = 0;
    for (const el of [...rainDrops]) removeDrop(el);
  }

  function spawnDrop() {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'mn-token-idle-drop';
    el.setAttribute('aria-label', 'Catch this token for a Token Surge');
    el.append(icon('coins'));
    const top = navBottom() + 24;
    const gutter = RAIL_WIDTH + (open ? PANEL_WIDTH : 0);
    el.style.left = `${Math.round(24 + Math.random() * Math.max(0, window.innerWidth - gutter - 80))}px`;
    el.style.top = `${Math.round(top + Math.random() * Math.max(0, window.innerHeight - top - 90))}px`;
    el.addEventListener('click', () => claim('surge', el));
    el.expireTimer = setTimeout(() => removeDrop(el), 3_000);
    raise(el);
    rainDrops.add(el);
  }

  function startRain(durationMs) {
    rainUntil = Math.max(rainUntil, Date.now() + durationMs);
    if (rainTimer) return;
    const tick = () => {
      if (Date.now() >= rainUntil) {
        rainTimer = null;
        return;
      }
      spawnDrop();
      rainTimer = setTimeout(tick, 500);
    };
    tick();
  }

  function spawn(id) {
    const powerup = state?.powerups?.find((entry) => entry.id === id);
    if (!powerup) return;
    despawn();
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'mn-token-idle-spawn';
    el.setAttribute('aria-label', `Catch the foundry sprite for a power-up: ${powerup.name}`);
    const art = dude(id === 'chaos' ? 'chaos' : 'golden');
    art.dataset.mood = 'spawn';
    el.append(art);
    const top = navBottom() + 24;
    const gutter = RAIL_WIDTH + (open ? PANEL_WIDTH : 0);
    const fromX = Math.round(walkerBody.x);
    const fromY = Math.round(walkerBody.y);
    const toX = Math.round(Math.min(window.innerWidth - gutter - 80, Math.max(24, fromX + (Math.random() * 280 - 140))));
    const toY = Math.round(Math.min(window.innerHeight - 90, Math.max(top, fromY + (Math.random() * 220 - 160))));
    el.style.left = `${fromX}px`;
    el.style.top = `${fromY}px`;
    el.addEventListener('click', () => claim(powerup.id));
    raise(el);
    requestAnimationFrame(() => {
      el.style.left = `${toX}px`;
      el.style.top = `${toY}px`;
    });
    el.expireTimer = setTimeout(despawn, SPAWN_LIFETIME_MS);
    spawnEl = el;
  }

  function scheduleSpawn() {
    clearTimeout(spawnTimer);
    spawnTimer = null;
    if (!prefs.sprites) return;
    const speed = 1 + (state?.perks?.spawnRate ?? 0);
    const delay = (SPAWN_MIN_MS + Math.random() * (SPAWN_MAX_MS - SPAWN_MIN_MS)) / speed;
    spawnTimer = setTimeout(() => {
      if (!document.hidden && !spawnEl) spawn(pickPowerup());
      scheduleSpawn();
    }, delay);
  }

  function toast(id, title, detail) {
    toastEl?.remove();
    const el = document.createElement('div');
    el.className = 'mn-token-idle-toast';
    el.setAttribute('role', 'status');
    el.style.top = `${navBottom() + 12}px`;
    el.style.right = `${RAIL_WIDTH + (open ? Math.min(PANEL_WIDTH, window.innerWidth - RAIL_WIDTH) : 0) + 12}px`;
    const body = document.createElement('div');
    const small = document.createElement('small');
    small.textContent = detail;
    body.append(title, small);
    el.append(icon(id), body);
    raise(el);
    toastEl = el;
    setTimeout(() => { if (toastEl === el) { el.remove(); toastEl = null; } }, TOAST_MS);
  }

  async function claim(id, drop) {
    if (drop) removeDrop(drop);
    else despawn();
    while (busy) await new Promise((resolve) => setTimeout(resolve, 50));
    const result = await call('claim_powerup', { powerup_id: id });
    if (!result?.claimed) return;
    if (result.claimed.rain) startRain(result.claimed.durationMs);
    cheerUntil = Date.now() + CHEER_MS;
    toast(id, result.claimed.name, result.claimed.message);
  }

  function celebrate(amount) {
    lastChatAt = Date.now();
    cheerUntil = Date.now() + CHEER_MS;
    const line = pickSaying();
    showSaying(`${line} +${formatTokens(amount)}`);
    $('[data-hero-say]').textContent = line;
  }

  function apply(next) {
    const hadState = state !== null;
    state = next;
    snapshot = { balance: next.balance, baseRate: next.baseRatePerSecond ?? next.ratePerSecond, buffs: next.buffs ?? [], at: Date.now() };
    if (hadState && next.usageAdded > 0) celebrate(next.usageAdded);
    if (!hadState && next.gainedFromUsage > 0) lastChatAt = Date.now();
    if (!hadState) scheduleSpawn();
    buildPanel();
    paintLive();
  }

  async function call(tool, args) {
    while (busy) await new Promise((resolve) => setTimeout(resolve, 50));
    busy = true;
    try {
      const result = parse(await ctx.callTool(tool, args));
      apply(result);
      $('[data-status]').textContent = '';
      return result;
    } catch (error) {
      $('[data-status]').textContent = error?.message || 'The foundry could not update.';
      return undefined;
    } finally {
      busy = false;
    }
  }

  function observed() {
    const usage = ctx.getWorkspaceUsage?.();
    const total = usage?.totals?.totalTokens;
    if (typeof total !== 'number' || !Number.isFinite(total) || total < 0) return undefined;
    return Math.round(total);
  }

  function sync() {
    const tokens = observed();
    return call('tick', tokens === undefined ? {} : { observed_tokens: tokens });
  }

  function layout() {
    const top = navBottom();
    const gutter = RAIL_WIDTH + (open ? Math.min(PANEL_WIDTH, window.innerWidth - RAIL_WIDTH) : 0);
    rail.style.top = `${top}px`;
    panel.style.top = `${top}px`;
    const bar = document.querySelector('.mn-os-menubar');
    const targets = bar?.parentElement
      ? [...bar.parentElement.children].filter((el) => el !== bar && el !== rail && el !== panel && el.tagName !== 'STYLE' && el.tagName !== 'SCRIPT')
      : [document.body];
    for (const [el, previous] of insetTargets) {
      if (targets.includes(el)) continue;
      Object.assign(el.style, previous);
      insetTargets.delete(el);
    }
    for (const el of targets) {
      if (!insetTargets.has(el)) {
        insetTargets.set(el, {
          width: el.style.width,
          maxWidth: el.style.maxWidth,
          transform: el.style.transform,
          height: el.style.height,
        });
      }
      el.style.width = `calc(100% - ${gutter}px)`;
      el.style.maxWidth = `calc(100% - ${gutter}px)`;
      el.style.transform = 'translateZ(0)';
    }
  }

  function setOpen(next) {
    open = next;
    panel.classList.toggle('is-open', open);
    rail.setAttribute('aria-pressed', open ? 'true' : 'false');
    rail.setAttribute('aria-expanded', open ? 'true' : 'false');
    walker.setAttribute('aria-expanded', open ? 'true' : 'false');
    walker.setAttribute('aria-label', open ? 'Close Token Foundry' : 'Open Token Foundry');
    layout();
    if (open) {
      buildPanel();
      rollRave();
      $('[data-close]').focus();
    } else {
      rail.focus();
    }
  }

  rail.addEventListener('click', () => setOpen(!open));
  function laneBox() {
    const key = `${open}:${window.innerWidth}x${window.innerHeight}`;
    const now = performance.now();
    if (laneBox.cache && laneBox.key === key && now - laneBox.at < 300) return laneBox.cache;
    laneBox.key = key;
    laneBox.at = now;
    let left = 0;
    const main = document.getElementById('mainColumn');
    if (main) {
      const rect = main.getBoundingClientRect();
      if (rect.width > 80) left = Math.max(left, rect.left);
    }
    for (const sel of ['.mn-sidebar', '.mn-os-sidebar', '.sidebar']) {
      const el = document.querySelector(sel);
      if (!el || el === rail || el === panel || el === walker) continue;
      const rect = el.getBoundingClientRect();
      if (rect.left <= 8 && rect.width >= 40 && rect.width < window.innerWidth * 0.45 && rect.height > 120) {
        left = Math.max(left, rect.right);
      }
    }
    let right = rail.getBoundingClientRect().left || (window.innerWidth - RAIL_WIDTH);
    if (open) {
      const panelRect = panel.getBoundingClientRect();
      if (panelRect.width > 0) right = panelRect.left;
    }
    laneBox.cache = walkerBounds({
      width: window.innerWidth,
      height: window.innerHeight,
      left,
      right,
      top: navBottom(),
    });
    return laneBox.cache;
  }
  function placeWalker(dt) {
    walker.style.left = `${Math.round(walkerBody.x)}px`;
    walker.style.top = `${Math.round(walkerBody.y)}px`;
    const asleep = sprite.dataset.mood === 'sleep' && !raveOn;
    walker.classList.toggle('is-asleep', asleep);
    walker.classList.toggle('is-raving', raveOn && !walkerHeld);
    if (asleep) {
      shownScaleX = 1;
      shownScaleY = 1;
      sprite.style.transform = '';
      if (walkerArt) walkerArt.style.transform = '';
      return;
    }
    const target = walkerStretch(walkerBody.vx, walkerBody.vy);
    shownScaleX = easeStretch(shownScaleX, target.scaleX, dt);
    shownScaleY = easeStretch(shownScaleY, target.scaleY, dt);
    const flip = walkerBody.vx < -8 ? -1 : 1;
    sprite.style.transform = '';
    if (walkerArt) walkerArt.style.transform = `scale(${(flip * shownScaleX).toFixed(3)}, ${shownScaleY.toFixed(3)})`;
  }
  function paintCrowd(box) {
    if (!crowd) {
      crowd = document.createElement('canvas');
      crowd.className = 'mn-token-idle-crowd';
      crowd.hidden = true;
      crowd.setAttribute('aria-hidden', 'true');
      document.documentElement.append(crowd);
    }
    if (!ravers.length) {
      crowd.hidden = true;
      return;
    }
    crowd.hidden = false;
    const width = Math.max(1, Math.ceil(box.maxX - box.minX + WALKER_W));
    const height = Math.max(1, Math.ceil(box.maxY - box.minY + WALKER_H));
    const place = `${Math.round(box.minX)},${Math.round(box.minY)},${width},${height}`;
    if (crowd.dataset.place !== place) {
      crowd.dataset.place = place;
      crowd.style.left = `${Math.round(box.minX)}px`;
      crowd.style.top = `${Math.round(box.minY)}px`;
      crowd.style.width = `${width}px`;
      crowd.style.height = `${height}px`;
    }
    if (crowd.width !== width || crowd.height !== height) {
      crowd.width = width;
      crowd.height = height;
      crowdCtx = null;
    }
    if (!crowdCtx) crowdCtx = crowd.getContext('2d', { alpha: true, desynchronized: true });
    const g = crowdCtx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, width, height);
    if (performance.now() - crowdStamp > 500) {
      const root = getComputedStyle(walker);
      crowdInk = root.getPropertyValue('--mn-accent').trim() || crowdInk;
      crowdEye = root.getPropertyValue('--mn-fg-on-accent').trim() || crowdEye;
      crowdStamp = performance.now();
    }
    g.fillStyle = crowdInk;
    g.beginPath();
    for (const raver of ravers) {
      const x = raver.body.x - box.minX + 16;
      const y = raver.body.y - box.minY + 25;
      g.moveTo(x + 11, y);
      g.arc(x, y, 11, 0, Math.PI * 2);
    }
    g.fill();
    g.fillStyle = crowdEye;
    g.beginPath();
    for (const raver of ravers) {
      if (raver.phase === 'down') continue;
      const x = raver.body.x - box.minX;
      const y = raver.body.y - box.minY + 25;
      g.moveTo(x + 14.2, y);
      g.arc(x + 12.5, y, 1.7, 0, Math.PI * 2);
      g.moveTo(x + 21.2, y);
      g.arc(x + 19.5, y, 1.7, 0, Math.PI * 2);
    }
    g.fill();
    for (const raver of ravers) {
      if (raver.phase !== 'down') continue;
      const x = raver.body.x - box.minX;
      const y = raver.body.y - box.minY + 24;
      g.fillRect(x + 10.5, y, 4, 1.6);
      g.fillRect(x + 17.5, y, 4, 1.6);
    }
  }
  function spawnRaver(box) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 420 + Math.random() * 280;
    ravers.push({
      phase: 'rave',
      scaleX: 1,
      scaleY: 1,
      body: {
        x: walkerBody.x,
        y: walkerBody.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      },
    });
  }
  function syncRavers(dt, box, now) {
    if (raveOn && ravers.length < 24 && now - lastRaveSpawn >= 1000) {
      lastRaveSpawn = now;
      spawnRaver(box);
    }
    for (const raver of ravers) {
      if (raveOn && raver.phase === 'rave') raver.body = stepRave(raver.body, box, dt, Math.random);
      else {
        raver.body = stepCorpse({ ...raver.body, phase: raver.phase === 'rave' ? 'falling' : raver.phase }, box, dt);
        raver.phase = raver.body.phase;
      }
    }
    if (!raveOn) {
      const { eaten, kept } = eatCorpses(walkerBody, ravers);
      ravers = kept;
    }
    paintCrowd(box);
  }
  function animateWalker(now) {
    const dt = walkerLast ? (now - walkerLast) / 1000 : 0;
    walkerLast = now;
    const box = laneBox();
    if (raveOn && !walkerHeld) walkerBody = stepRave(walkerBody, box, dt, Math.random);
    else walkerBody = stepWalker(walkerBody, box, dt, walkerHeld, {
      asleep: !raveOn && sprite.dataset.mood === 'sleep',
      rng: Math.random,
    });
    placeWalker(dt);
    syncRavers(dt, box, now);
    walkerFrame = requestAnimationFrame(animateWalker);
  }
  walker.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    walkerPointer = event.pointerId;
    walker.setPointerCapture(event.pointerId);
    walkerHeld = true;
    walker.classList.add('is-held');
    walkerGrabX = event.clientX - walkerBody.x;
    walkerGrabY = event.clientY - walkerBody.y;
    walkerSample = { x: event.clientX, y: event.clientY, ox: event.clientX, oy: event.clientY, t: performance.now(), moved: false };
  });
  walker.addEventListener('pointermove', (event) => {
    if (walkerPointer !== event.pointerId || !walkerSample) return;
    if (Math.hypot(event.clientX - walkerSample.ox, event.clientY - walkerSample.oy) > 6) walkerSample.moved = true;
    const box = laneBox();
    const now = performance.now();
    const dt = Math.max(16, now - walkerSample.t);
    walkerBody = {
      x: clampWalker(event.clientX - walkerGrabX, box.minX, box.maxX),
      y: clampWalker(event.clientY - walkerGrabY, box.minY, box.maxY),
      vx: ((event.clientX - walkerSample.x) / dt) * 1000,
      vy: ((event.clientY - walkerSample.y) / dt) * 1000,
    };
    walkerSample = { x: event.clientX, y: event.clientY, ox: walkerSample.ox, oy: walkerSample.oy, t: now, moved: walkerSample.moved };
    placeWalker();
  });
  function releaseWalker(event) {
    if (walkerPointer !== event.pointerId) return;
    walkerPointer = null;
    walkerHeld = false;
    walker.classList.remove('is-held');
    const moved = Boolean(walkerSample?.moved);
    walkerSample = null;
    if (!moved) {
      if (!raveOn && sprite.dataset.mood !== 'sleep') {
        walkerBody.vx = walkerBody.vx < 0 ? -WALKER_CRUISE : WALKER_CRUISE;
        walkerBody.vy = 0;
      }
      return;
    }
    if (!raveOn && sprite.dataset.mood === 'sleep') {
      walkerBody.vx = 0;
      walkerBody.vy = 0;
      if (event.type !== 'pointercancel') suppressWalkerClick = true;
      return;
    }
    if (event.type !== 'pointercancel') suppressWalkerClick = true;
    walkerBody.vx = clampWalker(walkerBody.vx, -WALKER_MAX_SPEED, WALKER_MAX_SPEED);
    walkerBody.vy = clampWalker(walkerBody.vy, -WALKER_MAX_SPEED, WALKER_MAX_SPEED);
  }
  walker.addEventListener('pointerup', releaseWalker);
  walker.addEventListener('pointercancel', releaseWalker);
  walker.addEventListener('click', () => {
    if (suppressWalkerClick) {
      suppressWalkerClick = false;
      return;
    }
    setOpen(!open);
  });
  $('[data-close]').addEventListener('click', () => setOpen(false));
  const onKey = (event) => {
    if (event.key === 'Escape' && open) setOpen(false);
  };
  document.addEventListener('keydown', onKey);
  window.addEventListener('resize', layout);
  ctx.onCleanup(() => {
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', layout);
    for (const [el, previous] of insetTargets) Object.assign(el.style, previous);
  });

  const paintTimer = setInterval(() => { layout(); paintLive(); }, 250);
  const syncTimer = setInterval(() => { if (!busy && !document.hidden) sync(); }, 2000);
  const raveTimer = setInterval(rollRave, 20_000);
  ctx.onCleanup(() => {
    clearInterval(paintTimer);
    clearInterval(syncTimer);
    clearInterval(raveTimer);
    cancelAnimationFrame(walkerFrame);
    ravers = [];
    crowd?.remove();
    crowd = null;
    crowdCtx = null;
    clearTimeout(spawnTimer);
    spawnEl?.remove();
    toastEl?.remove();
    stopRain();
    raveOn = false;
    setChaos(false);
  });
  ctx.onWorkspaceUsage?.(() => { if (!busy) sync(); });

  try {
    ctx.registerCommand({
      id: 'toggle-foundry',
      title: 'Toggle Token Foundry',
      group: 'Plugins',
      run: () => setOpen(!open),
    });
    ctx.registerSlashCommand({
      id: 'foundry',
      alias: 'foundry',
      label: 'Token Foundry',
      description: 'Open the token idle panel',
      run: () => setOpen(true),
    });
  } catch (error) {
    $('[data-status]').textContent = error?.message || 'The foundry command could not be registered.';
  }

  layout();
  paintLive();
  walkerBody = stepWalker({ ...walkerBody, y: window.innerHeight }, laneBox(), 0.05, false);
  placeWalker();
  walkerFrame = requestAnimationFrame(animateWalker);
  sync();
}
