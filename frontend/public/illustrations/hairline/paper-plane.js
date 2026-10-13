const { Cam, clamp, fit, proj, fillet, poly, open, spring, stepS, mk, pointer, register, disposer } = HL;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.82);
  fit(C, [[-95, -95, -20], [95, 95, 75]], 200, 166);
  const P = proj(C);
  const bank = spring(-0.16), lift = spring(12), turn = spring(-0.15);
  const leftFlex = spring(5), rightFlex = spring(11);
  let reach = value, over = null, drawn = "";
  const g = mk("g", {}, svg);
  const far = mk("path", { class: "sil" }, g);
  const farFold = mk("path", { class: "nf lo" }, g);
  const keel = mk("path", { class: "sil" }, g);
  const keelFold = mk("path", { class: "nf lo" }, g);
  const near = mk("path", { class: "sil hi" }, g);
  const nearFold = mk("path", { class: "nf lo" }, g);
  const edge = mk("path", { class: "nf lo" }, g);

  function point(u, v, z) {
    const roll = bank.x, yaw = turn.x - Math.PI / 4;
    const across = v * Math.cos(roll) - z * Math.sin(roll);
    const height = v * Math.sin(roll) + z * Math.cos(roll) + lift.x;
    return P(u * Math.cos(yaw) - across * Math.sin(yaw),
      u * Math.sin(yaw) + across * Math.cos(yaw), height);
  }
  const rounded = (points) => poly(fillet(points, points.map(() => 1.4), 5));
  function draw() {
    const state = [bank.x, lift.x, turn.x, leftFlex.x, rightFlex.x].join(",");
    if (state === drawn) return;
    drawn = state;
    const nose = point(78, 0, 17), fold = point(-32, 0, 0);
    const left = point(-58, -52, leftFlex.x);
    const right = point(-58, 52, rightFlex.x);
    const bottom = point(-52, 0, -13);
    far.setAttribute("d", rounded([nose, left, fold]));
    farFold.setAttribute("d", open([point(-49, -44, leftFlex.x), point(61, -3, 15)]));
    keel.setAttribute("d", rounded([nose, fold, bottom]));
    keelFold.setAttribute("d", open([point(-44, 0, -9), point(61, 0, 13)]));
    near.setAttribute("d", rounded([nose, fold, right]));
    nearFold.setAttribute("d", open([point(61, 3, 15), point(-49, 44, rightFlex.x)]));
    edge.setAttribute("d", open([point(-56, 50, rightFlex.x - 1.5), point(-33, 2, -1.5)]));
  }
  const motion = register(stage, (dt) => {
    let moving = false;
    for (const sp of [bank, lift, turn, leftFlex, rightFlex]) {
      if (stepS(sp, dt)) moving = true;
    }
    draw();
    return moving;
  });
  bag.add(motion.unregister);

  function retarget() {
    const dx = over ? clamp((over[0] - 200) / 145, -1, 1) : 0;
    const dy = over ? clamp((over[1] - 166) / 100, -1, 1) : 0;
    bank.t = over ? dx * reach : -0.16;
    lift.t = over ? 22 - dy * 13 : 12;
    turn.t = over ? -0.15 + dy * 0.16 : -0.15;
    leftFlex.t = over ? 5 + Math.max(0, -dx) * reach * 22 : 5;
    rightFlex.t = over ? 11 + Math.max(0, dx) * reach * 22 : 11;
    const leftActive = over && dx < 0;
    far.classList.toggle("hi", Boolean(leftActive));
    near.classList.toggle("hi", !leftActive);
    read.textContent = over ? (leftActive ? "port wing" : "starboard wing") : "rest";
    motion.wake();
  }
  bag.add(pointer(stage, {
    move: (p) => { over = p; retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());
  draw();
  return {
    set: (v) => { reach = v; retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "paper-plane",
  means: "A folded paper plane banks toward the pointer, its wings flexing gently into the next conversation.",
  rules: [1, 3, 4, 5, 7, 8, 9],
  range: [0.12, 0.28, 0.44],
  tour: [[115, 170], [260, 120], [275, 195], null],
  mount,
});
