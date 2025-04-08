import { Transform } from 'vega-dataflow';
import { inherits } from 'vega-util';

export default function Custom(params) {
  // Inizializziamo lo stato (null in questo caso)
  Transform.call(this, null, params);
  // Assicuriamoci che Vega trovi la funzione di update bindata all'istanza
  this._update = Custom.prototype.transform.bind(this);
}

Custom.Definition = {
  type: 'Custom',
  metadata: { source: true },
  // Definiamo un parametro 'factor' (default a 2) per moltiplicare il valore
  params: [
    { name: 'factor', type: 'number', default: 2 }
  ]
};

inherits(Custom, Transform, {
  transform(_, pulse) {
    // Creiamo un fork del pulse per avere tutti i dati
    const out = pulse.fork(pulse.ALL);

    // Applichiamo la trasformazione: per ogni tuple aggiunta,
    // calcoliamo customValue = value * factor.
    out.visit(pulse.ADD, function (t) {
      t.customValue = t.value * (_.factor || 2);
    });

    // Assegniamo lo stato (non serve creare una nuova array, basta propagare il pulse)
    this.value = out.source;
    return out;
  }
});
