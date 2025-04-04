import SortedList from './util/SortedList.js';
import {Transform, stableCompare, tupleid} from 'vega-dataflow';
import {inherits} from 'vega-util';

/**
 * Collects all data tuples that pass through this operator.
 * @constructor
 * @param {object} params - The parameters for this operator.
 * @param {function(*,*): number} [params.sort] - An optional
 *   comparator function for additionally sorting the collected tuples.
 */
export default function Custom(params) {
  Transform.call(this, [], params);
}

Custom.Definition = {
  'type': 'Custom',
  'metadata': {'source': true},
  'params': [
    { 'name': 'sort', 'type': 'compare' }
  ]
};

inherits(Custom, Transform, {
  transform(_, pulse) {
    const out = pulse.fork(pulse.ALL),
          list = SortedList(tupleid, this.value, out.materialize(out.ADD).add),
          sort = _.sort,
          mod = pulse.changed() || (sort &&
                (_.modified('sort') || pulse.modified(sort.fields)));

    out.visit(out.REM, list.remove);

    this.modified(mod);
    this.value = out.source = list.data(stableCompare(sort), mod);

    // propagate tree root if defined
    if (pulse.source && pulse.source.root) {
      this.value.root = pulse.source.root;
    }

    console.log(out);

    return out;
  }
});
