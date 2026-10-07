import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { layoutJourney, MAX_LANES } from '../lib/journeyLayout.js';

function step(stepKey, { outcomes = [], type = 'journeyEmail' } = {}) {
  return { stepKey, type, settings: {}, outcomes };
}

describe('journeyLayout', () => {
  test('20-step cadence: main path strictly increasing y, journeySms width from port count', () => {
    const steps = [];
    for (let i = 0; i < 19; i += 1) {
      const isLast = i === 18;
      const stepKey = `s${i}`;
      if (i === 10) {
        // the journeySms step with 8 dynamic reply-keyword ports
        const outcomes = [];
        for (let r = 0; r < 8; r += 1) {
          outcomes.push({ port: `reply_${r}`, target: { kind: 'next' } });
        }
        outcomes.push({ port: 'noReply', target: { kind: 'next' } });
        outcomes.push({ port: 'failed', target: { kind: 'end' } });
        steps.push(step(stepKey, { type: 'journeySms', outcomes }));
      } else {
        steps.push(
          step(stepKey, {
            outcomes: [
              {
                port: 'continue',
                target: isLast ? { kind: 'end' } : { kind: 'next' },
              },
            ],
          }),
        );
      }
    }
    steps.push(step('end0', { type: 'end', outcomes: [] }));

    const doc = { version: 1, steps };
    const { positions, widths } = layoutJourney(doc, { pad: 24, portWidth: 32 });

    // main-path y strictly increasing in doc order
    const ys = steps.map((s) => positions[s.stepKey].y);
    for (let i = 1; i < ys.length; i += 1) {
      assert.ok(ys[i] > ys[i - 1], `y[${i}] should be greater than y[${i - 1}]`);
    }

    // journeySms step (10 outcomes) width == max(240, pad + 10*portWidth)
    assert.equal(widths.s10, Math.max(240, 24 + 10 * 32));
  });

  test('side paths + forward jump: lanes bounded by MAX_LANES, side steps placed right of main column', () => {
    const sideA = [step('a1', { outcomes: [{ port: 'continue', target: { kind: 'end' } }] })];
    const sideB = [step('b1', { outcomes: [{ port: 'continue', target: { kind: 'end' } }] })];

    const doc = {
      version: 1,
      steps: [
        step('m0', {
          outcomes: [
            { port: 'replied', target: { kind: 'side', steps: sideA } },
            { port: 'bounced', target: { kind: 'side', steps: sideB } },
            { port: 'continue', target: { kind: 'step', stepKey: 'm2' } },
          ],
        }),
        step('m1', { outcomes: [{ port: 'continue', target: { kind: 'next' } }] }),
        step('m2', { outcomes: [{ port: 'continue', target: { kind: 'end' } }] }),
      ],
    };

    const { positions, lanes } = layoutJourney(doc);

    // side steps land to the right of the main column
    assert.ok(positions.a1.x > positions.m0.x);
    assert.ok(positions.b1.x > positions.a1.x);

    // the single forward jump (m0 -> m2) gets a lane, bounded by MAX_LANES
    const laneKey = 'm0:continue';
    assert.ok(laneKey in lanes);
    assert.ok(lanes[laneKey] >= 0 && lanes[laneKey] < MAX_LANES);
  });
});
