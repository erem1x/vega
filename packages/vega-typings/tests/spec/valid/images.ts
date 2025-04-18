import { Spec } from 'vega';

export const spec: Spec = {
  $schema: 'https://vega.github.io/schema/vega/v6.json',
  width: 200,
  height: 200,
  padding: 5,

  data: [
    {
      name: 'data',
      values: [
        { x: 0.5, y: 0.5, img: 'data/ffox.png' },
        { x: 0.5, y: 1.5, img: 'data/gimp.png' },
        { x: 0.5, y: 2.5, img: 'data/7zip.png' }
      ]
    }
  ],

  scales: [
    {
      name: 'x',
      type: 'linear',
      domain: [0, 4],
      range: 'width'
    },
    {
      name: 'y',
      type: 'linear',
      domain: [0, 3],
      range: 'height'
    }
  ],

  axes: [
    { orient: 'bottom', scale: 'x', tickCount: 5 },
    { orient: 'left', scale: 'y', tickCount: 5 }
  ],

  marks: [
    {
      type: 'image',
      from: { data: 'data' },
      encode: {
        enter: {
          url: { field: 'img' },
          width: { value: 50 },
          height: { value: 50 },
          x: { scale: 'x', field: 'x' },
          y: { scale: 'y', field: 'y' },
          align: { value: 'center' },
          baseline: { value: 'middle' }
        },
        update: {
          opacity: { value: 1.0 }
        },
        hover: {
          opacity: { value: 0.5 }
        }
      }
    },
    {
      type: 'image',
      from: { data: 'data' },
      encode: {
        enter: {
          url: { field: 'img' },
          width: { value: 25 },
          height: { value: 50 },
          aspect: { value: false },
          x: { scale: 'x', signal: 'datum.x + 1' },
          y: { scale: 'y', field: 'y' },
          align: { value: 'center' },
          baseline: { value: 'middle' }
        },
        update: {
          opacity: { value: 1.0 }
        },
        hover: {
          opacity: { value: 0.5 }
        }
      }
    },
    {
      type: 'image',
      from: { data: 'data' },
      encode: {
        enter: {
          url: { field: 'img' },
          width: { value: 50 },
          height: { value: 30 },
          aspect: { value: true },
          x: { scale: 'x', signal: 'datum.x + 2' },
          y: { scale: 'y', field: 'y' },
          align: { value: 'center' },
          baseline: { value: 'middle' }
        },
        update: {
          opacity: { value: 1.0 }
        },
        hover: {
          opacity: { value: 0.5 }
        }
      }
    },
    {
      type: 'image',
      from: { data: 'data' },
      encode: {
        enter: {
          url: { field: 'img' },
          width: { value: 25 },
          x: { scale: 'x', signal: 'datum.x + 3' },
          y: { scale: 'y', field: 'y' },
          align: { value: 'center' },
          baseline: { value: 'middle' }
        },
        update: {
          opacity: { value: 1.0 }
        },
        hover: {
          opacity: { value: 0.5 }
        }
      }
    }
  ]
};
