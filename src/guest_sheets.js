// guest_sheets.js: model sheets for the guest characters and the extra emotions, as standalone loops (reference only).
//   node render.mjs --loop=guests --sheet=1 --cols=1 --w=1920 --out=docs/guests.jpg
//   node render.mjs --loop=emotions_extra --sheet=1 --cols=1 --w=1920 --out=docs/emotions_extra.jpg
(() => {
  const label = (txt, x, y, size = 20) => letter(txt, x, y, size, PAL.ink, { ink: false, alpha: .8 });
  const floor = y => inkLine([[40, y + 6], [W / 2, y + 4], [W - 40, y + 7]], .6, mixCol(PAL.paper, PAL.ink, .35), 'inkfine', .5);
  LOOPS.guests = t => {
    ['neutral', 'happy', 'surprised', 'sad', 'cheer', 'awe'].forEach((n, i) => { const x = 190 + i * 308; doubao(x, 420, 16, { ...feel(n, t, { seed: i }) }); label('doubao · ' + n, x, 458, 20); });
    floor(420);
    ['neutral', 'happy', 'surprised', 'scared', 'cheer', 'dizzy'].forEach((n, i) => { const x = 190 + i * 308; whale(x, 700, 15, { ...feel(n, t, { seed: i }), spout: n === 'cheer' ? 1 : 0, shadow: true }); label('whale · ' + n, x, 738, 20); });
    floor(700);
    clawd(330, 1000, 20, feel('happy', t)); label('clawd', 330, 1036, 20);
    doubao(700, 1000, 13, feel('happy', t)); whale(1010, 985, 15, feel('happy', t));
    ['#E8A86A', '#8FC47A', '#9AB8E8', '#E79AB0', '#C9A6E8'].forEach((col, i) => wisp(1320 + i * 120, 945 + (i % 2) * 14, 38 - i * 3, { col, seed: i, float: false, flip: i % 2 === 1 }));
    label('wisp (passers-by)', 1560, 1036, 20);
    floor(1000);
  };
  LOOPS.guests.len = 4;
  LOOPS.emotions_extra = t => {
    const names = ['singing', 'groove', 'cheer', 'wink', 'deadpan', 'awe', 'firelit', 'breathe', 'reboot', 'amnesia', 'wired'];
    names.forEach((name, i) => { const cx = 200 + (i % 6) * 304, gy = 420 + Math.floor(i / 6) * 420; clawd(cx, gy, 18, feel(name, t, { seed: i })); label(name, cx, gy + 44, 24); });
    floor(420); floor(840);
  };
  LOOPS.emotions_extra.len = 4;
})();
