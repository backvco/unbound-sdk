// Shared journey step-list layout (journeys-plan.md §7.3). Pure function,
// no DOM/Svelte — consumed by the API compiler (positions written into
// workflowItems.position) and the client's step-list / read-only canvas
// preview, so geometry never drifts between the two.
//
// Node width = max(240, pad + portCount * portWidth) so a step with more
// outcome ports (e.g. journeySms with several expected-reply rows) renders
// wide enough for all of them. Main path sits in column 0, top to bottom in
// doc order. A side path (one outcome's target.kind === 'side') renders as
// a linear vertical stack in the next column to the right, in outcome
// order; the row the branch step occupies grows tall enough to hold the
// tallest concurrent side path. Forward jumps (an outcome's target.kind ===
// 'step' pointing at a later main-path step) get a lane in a left-gutter
// reserved for wire routing, bounded by MAX_LANES — the same bound
// app1-client's wireLayout.js uses for the advanced canvas, kept in sync
// here as a literal with this comment rather than a cross-package import.
export const MAX_LANES = 6;

const DEFAULTS = {
  portWidth: 56,
  pad: 48,
  nodeHeight: 90,
  rowGap: 40,
  colGap: 80,
};

function portCount(step) {
  return Math.max(1, (step?.outcomes || []).length);
}

function widthForStep(step, { pad, portWidth }) {
  return Math.max(240, pad + portCount(step) * portWidth);
}

// Depth-first walk collecting every step (main + nested side-path steps) so
// widths can be computed for all of them in one pass.
function collectAllSteps(steps, opts, widths, acc = []) {
  for (const step of steps || []) {
    if (!step?.stepKey) continue;
    acc.push(step);
    widths[step.stepKey] = widthForStep(step, opts);
    for (const outcome of step.outcomes || []) {
      if (outcome?.target?.kind === 'side' && Array.isArray(outcome.target.steps)) {
        collectAllSteps(outcome.target.steps, opts, widths, acc);
      }
    }
  }
  return acc;
}

export function layoutJourney(doc, opts = {}) {
  const options = { ...DEFAULTS, ...opts };
  const { pad, nodeHeight, rowGap, colGap } = options;
  const steps = Array.isArray(doc?.steps) ? doc.steps : [];

  const widths = {};
  const positions = {};
  const lanes = {};

  collectAllSteps(steps, options, widths);

  const mainIndex = new Map();
  steps.forEach((step, i) => mainIndex.set(step.stepKey, i));

  // --- positions: main path column 0, side paths to the right ---
  const colWidths = [];
  colWidths[0] = Math.max(240, ...steps.map((s) => widths[s.stepKey] || 240));

  let y = pad;
  for (const step of steps) {
    positions[step.stepKey] = { x: pad, y };
    let rowHeight = nodeHeight;
    let col = 1;

    for (const outcome of step.outcomes || []) {
      if (outcome?.target?.kind === 'side' && Array.isArray(outcome.target.steps)) {
        const sideSteps = outcome.target.steps.filter((s) => s?.stepKey);
        if (!sideSteps.length) {
          col += 1;
          continue;
        }
        colWidths[col] = Math.max(
          colWidths[col] || 240,
          ...sideSteps.map((s) => widths[s.stepKey] || 240),
        );
        const xOffset =
          pad + colWidths.slice(0, col).reduce((sum, w) => sum + w + colGap, 0);
        let sideY = y;
        sideSteps.forEach((sideStep) => {
          positions[sideStep.stepKey] = { x: xOffset, y: sideY };
          sideY += nodeHeight + rowGap;
        });
        const sideHeight =
          sideSteps.length * nodeHeight + (sideSteps.length - 1) * rowGap;
        rowHeight = Math.max(rowHeight, sideHeight);
        col += 1;
      }
    }

    y += rowHeight + rowGap;
  }

  // --- lanes: forward-jump wires (target.kind === 'step', later index) ---
  const forwardJumps = [];
  steps.forEach((step, i) => {
    for (const outcome of step.outcomes || []) {
      if (outcome?.target?.kind === 'step') {
        const j = mainIndex.get(outcome.target.stepKey);
        if (j != null && j > i) {
          forwardJumps.push({ from: i, to: j, stepKey: step.stepKey, port: outcome.port });
        }
      }
    }
  });
  forwardJumps.sort((a, b) => a.from - b.from || a.to - b.to);

  const laneEndsAt = [];
  for (const jump of forwardJumps) {
    let lane = laneEndsAt.findIndex(
      (endsAt) => endsAt === undefined || endsAt <= jump.from,
    );
    if (lane === -1) {
      lane = Math.min(laneEndsAt.length, MAX_LANES - 1);
    }
    laneEndsAt[lane] = jump.to;
    lanes[`${jump.stepKey}:${jump.port}`] = lane;
  }

  return { positions, widths, lanes };
}

export default { layoutJourney, MAX_LANES };
