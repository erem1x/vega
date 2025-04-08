import { Transform, ingest } from 'vega-dataflow';
import { inherits, accessor, field } from 'vega-util';

/**
 * Simplified Aggregate Transform: Calculates the mean of a field per group.
 * (Explicit change handling for recalculation)
 * @constructor
 * @param {object} params - The parameters for this operator.
 * @param {function(object): *} params.groupby - An accessor for the field to group by.
 * @param {function(object): *} params.field - An accessor for the field to calculate the mean of.
 * @param {string} [params.as] - The output field name for the calculated mean.
 *                                Defaults to 'mean_' + field name.
 */
export default function Custom(params) {
  Transform.call(this, null, params);
  this._aggregates = null; // Stores the computed aggregate tuples from the *previous* run
  console.log('[Custom] Initialized');
}

// --- Definition --- (Keep this the same)
Custom.Definition = {
  "type": "Custom",
  "metadata": {"generates": true, "changes": true},
  "params": [
    { "name": "groupby", "type": "string", "required": true },
    { "name": "field", "type": "string", "required": true },
    { "name": "as", "type": "string" }
  ]
};

// --- Prototype ---
// Inherit from Vega's Transform and define the transform method
// Inherit from Vega's Transform and define the transform method
inherits(Custom, Transform, {
  transform: function(params, pulse) {
    // --- Logging ---
    console.log(`[GroupMean] Transform called. Stamp: ${pulse.stamp}, Reflow: ${pulse.reflow}`);
    let sourceTupleCount = 0;
    pulse.visit(pulse.SOURCE, () => sourceTupleCount++);
    console.log(`[GroupMean] Input Pulse: SourceTupleCount=${sourceTupleCount}, Add=${pulse.add.length}, Rem=${pulse.rem.length}, Mod=${pulse.mod.length}, Changed: ${pulse.changed()}`);

    // --- Parameters ---
    const groupbyFieldName = params.groupby;
    const valueFieldName = params.field;
    // *** USE field() HERE ***
    const groupbyAccessor = field(groupbyFieldName); // Correct function for strings
    const valueAccessor = field(valueFieldName);     // Correct function for strings
    const asFieldName = params.as || `mean_${valueFieldName}`;

    // Log the actual field names being used
    console.log(`[GroupMean] Groupby Field Name: '${groupbyFieldName}'`);
    console.log(`[GroupMean] Value Field Name: '${valueFieldName}'`);
    console.log(`[GroupMean] AS Field Name: '${asFieldName}'`);


    let currentAggregates;
    const previousAggregates = this._aggregates;

    // --- Recalculation Decision ---
    const shouldRecalculate = pulse.reflow || pulse.changed() || !previousAggregates;
    console.log(`[GroupMean] Should Recalculate? ${shouldRecalculate} (Reflow: ${pulse.reflow}, PulseChanged: ${pulse.changed()}, FirstRun: ${!previousAggregates})`);

    // --- Output Pulse Initialization ---
    const out = pulse.fork(pulse.NO_SOURCE | pulse.NO_FIELDS);

    if (shouldRecalculate) {
      console.log('[GroupMean] Recalculating aggregates...');
      const groups = {};
      const results = [];

      pulse.visit(pulse.SOURCE, t => {
        // Use the accessors created with field()
        const key = groupbyAccessor(t);
        const value = +valueAccessor(t); // Coerce to number

        if (key === null || key === undefined || isNaN(value)) return;

        let g = groups[key];
        if (!g) {
          g = groups[key] = { sum: 0, count: 0, firstKey: key };
        }
        g.sum += value;
        g.count += 1;
      });

      console.log('[GroupMean] Intermediate groups:', JSON.stringify(groups));

      for (const key in groups) {
        const g = groups[key];
        if (g.count > 0) {
          const outputTuple = {};
          // Use the field name strings as keys
          outputTuple[groupbyFieldName] = g.firstKey;
          outputTuple[asFieldName] = g.sum / g.count;
          results.push(ingest(outputTuple));
        }
      }
      currentAggregates = results;
      console.log('[GroupMean] Recalculation complete. Result count:', currentAggregates.length);

      // --- Explicit Change Handling ---
      if (previousAggregates) {
          out.rem = previousAggregates;
          console.log(`[GroupMean] Manually setting ${out.rem.length} tuples for removal.`);
      }
      out.add = currentAggregates;
      console.log(`[GroupMean] Manually setting ${out.add.length} tuples for addition.`);

    } else {
      console.log('[GroupMean] Reusing previous aggregates. No changes.');
      currentAggregates = previousAggregates;
    }

    // --- Final State ---
    out.source = currentAggregates;
    console.log('[GroupMean] Output pulse source set. Count:', out.source ? out.source.length : 0);

    this._aggregates = currentAggregates;
    console.log('[GroupMean] Stored current aggregates for next run.');

    console.log('[GroupMean] FINAL Output Pulse Changes (Add/Rem/Mod):', out.add.length, out.rem.length, out.mod.length);

    return out;
  }
});