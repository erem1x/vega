import { Transform } from 'vega-dataflow';
import { inherits } from 'vega-util';

export default function ProgressiveCI(params) {
    // Stato: per ciascuna categoria accumuliamo count, media e M2 (per la varianza)
    Transform.call(this, {}, params);
    this._update = ProgressiveCI.prototype.transform.bind(this);
    this.state = {}; // struttura: { [categoria]: { count, mean, M2 } }
}

ProgressiveCI.Definition = {
    type: 'progressive_ci',
    metadata: { source: true },
    params: [
        { name: 'z', type: 'number', default: 1.96 }
    ]
};

inherits(ProgressiveCI, Transform, {
    transform(_, pulse) {
        const z = _.z || 1.96;
        pulse.visit(pulse.ADD, (t) => {
            const cat = t.category;
            const x = t.value;
            if (!this.state[cat]) {
                this.state[cat] = { count: 0, mean: 0, M2: 0 };
            }
            const acc = this.state[cat];
            acc.count++;
            const delta = x - acc.mean;
            acc.mean += delta / acc.count;
            const delta2 = x - acc.mean;
            acc.M2 += delta * delta2;
            const variance = (acc.count > 1) ? (acc.M2 / (acc.count - 1)) : 0;
            const se = (acc.count > 0) ? Math.sqrt(variance / acc.count) : 0;
            t.ci_lower = acc.mean - z * se;
            t.ci_upper = acc.mean + z * se;
            t.ci_start = t.ci_lower;
            t.ci_end = t.ci_upper;
        });
        pulse.modifies('ci_lower');
        pulse.modifies('ci_upper');
        pulse.modifies('ci_start');
        pulse.modifies('ci_end');
        return pulse;
    }
});
