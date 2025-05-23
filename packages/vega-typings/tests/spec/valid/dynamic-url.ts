import { Spec } from 'vega';

export const spec: Spec = {
  $schema: 'https://vega.github.io/schema/vega/v6.json',
  width: 300,
  height: 300,
  padding: 5,

  signals: [
    {
      name: 'url',
      value: 'data/normal-2d.json',
      bind: {
        input: 'select',
        options: ['data/normal-2d.json', 'data/uniform-2d.json']
      }
    },
    {
      name: 'async',
      value: false,
      bind: { input: 'checkbox' }
    }
  ],

  data: [
    {
      name: 'table',
      url: { signal: 'url' },
      async: { signal: 'async' }
    }
  ],

  scales: [
    {
      name: 'xscale',
      type: 'linear',
      range: 'width',
      domain: [-0.7, 0.7]
    },
    {
      name: 'yscale',
      type: 'linear',
      range: 'height',
      domain: [-0.7, 0.7]
    }
  ],

  axes: [
    { orient: 'bottom', scale: 'xscale', tickCount: 5, zindex: 1 },
    { orient: 'left', scale: 'yscale', tickCount: 5, zindex: 1 }
  ],

  marks: [
    {
      type: 'symbol',
      from: { data: 'table' },
      encode: {
        enter: {
          x: { scale: 'xscale', field: 'u' },
          y: { scale: 'yscale', field: 'v' },
          fillOpacity: { value: 0.8 }
        },
        update: {
          fill: { value: 'steelblue' }
        },
        hover: {
          fill: { value: 'red' }
        }
      }
    }
  ]
};
