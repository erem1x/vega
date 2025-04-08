import { Transform } from 'vega-dataflow';
import { inherits } from 'vega-util';

export default function ProgressiveMean(params) {
    // Stato: per ciascuna categoria accumuliamo count e media
    Transform.call(this, {}, params);
    this._update = ProgressiveMean.prototype.transform.bind(this);
    this.state = {}; // struttura: { [categoria]: { count, mean } }
}

ProgressiveMean.Definition = {
    type: 'progressive_mean',
    metadata: { source: true },
    params: []
};

inherits(ProgressiveMean, Transform, {
    transform(_, pulse) {
        pulse.visit(pulse.ADD, (t) => {
            const cat = t.category;
            const x = t.value;
            if (!this.state[cat]) {
                // Inizializziamo lo stato per la categoria
                this.state[cat] = { count: 0, mean: 0 };
            }
            const acc = this.state[cat];
            acc.count++;
            // Calcolo incrementale della media
            acc.mean += (x - acc.mean) / acc.count;
            // Assegniamo i nuovi valori al dato
            t.mean = acc.mean;
            t.mean_start = acc.mean;
            t.mean_end = acc.mean;
        });
        // Segnala che i campi 'mean', 'mean_start' e 'mean_end' sono stati modificati
        pulse.modifies('mean');
        pulse.modifies('mean_start');
        pulse.modifies('mean_end');
        return pulse;
    }
});
