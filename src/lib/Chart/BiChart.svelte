<!-- // TODO: доработать компонент для динамического добавления точек, чтоб не пересчитывал координаты для каждой точки -->
<script lang="ts">
  import { svgPath, bezierCommand, fit } from "./chart";
  import type { Limits, AxisInfo, Point } from "./chart";

  export let title : string = "";
  export let axis_x : AxisInfo = { minimum: 0, maximum: 10, ticks: 10 };
  export let axis_y : AxisInfo = { minimum: 0, maximum: 50, ticks: 5  };
  export let axis_z : AxisInfo = { minimum: 0, maximum: 50, ticks: 5  };
  export let marker_y : Point = undefined;
  export let marker_z : Point = undefined;
  export let limits : Limits = undefined;
  export let data : {[name: string]: Point[]} = {};

  let width : number = 0;
  let height : number = 0;
  let chart_styles = [`
    stroke=${$$props.stroke1 || 'black'}
    stroke-width=${$$props.stroke-width || '2'} 
    fill='none'
  `,`
    stroke=${$$props.stroke2 || 'black'}
    stroke-width=${$$props.stroke-width || '2'} 
    fill='none'
  `];

  const closest = (value: number, divider: number) =>
    (value % divider) ? divider * (Math.floor(value / divider) + 1): value;

  $: [points, coefs] = (() => {
    axis_z.ticks = axis_y.ticks;
    axis_z.maximum = closest(axis_z.maximum, axis_z.ticks);
    let coefs : {[name: string]: number } = {
      x: width / (axis_x.maximum - axis_x.minimum),
      y: height / (axis_y.maximum - axis_y.minimum),
      z: height / (axis_z.maximum - axis_z.minimum),
    };
    let points : {[name: string]: Point[]} = {
      power: data['power'].map(point => { 
        return { 
          x: fit(point.x, axis_x.minimum, axis_x.maximum) * coefs.x,
          y: height - fit(point.y, axis_y.minimum, axis_y.maximum) * coefs.y
        }
      }),
      temper: data['temper'].map(point => { 
        return { 
          x: fit(point.x, axis_x.minimum, axis_x.maximum) * coefs.x,
          y: height - fit(point.y, axis_z.minimum, axis_z.maximum) * coefs.z
        }
      }),
    }
    

    return [points, coefs]
  })();

</script>

<div class="root">
  <div class="title" style="{title !== "" && 'margin: 0em 0em;'}">{title}</div>
  <div class="container" bind:clientWidth={width} bind:clientHeight={height}
    style="left: {axis_y.maximum.toString().length + 0.2}ch; top: {!!title ? 1.4 : 1}em">
  {#if width && height}
    {@const pix_x = width / axis_x.ticks}
    {@const pix_y = height / axis_y.ticks}
    {@const pix_z = height / axis_z.ticks}
    {@const val_x = (axis_x.maximum - axis_x.minimum) / axis_x.ticks}
    {@const val_y = (axis_y.maximum - axis_y.minimum) / axis_y.ticks}
    {@const val_z = (axis_z.maximum - axis_z.minimum) / axis_z.ticks}
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg">
      <!-- x axis -->
      <g class="x">
        {#each Array(axis_x.ticks + 1) as _, div}
          {@const x = pix_x * div}
          {@const v = val_x * div * (axis_x.coef ?? 1)}
          <line x1={x} x2={x} y1={0} y2={height}></line>
          <text x={x} y={height}>{axis_x.round ? v.toFixed(axis_x.round) : v}</text>
        {/each}
      </g>
      <!-- y axis -->
      <g class="y">
        {#each Array(axis_y.ticks + 1) as _, div}
          {@const y = height - pix_y * div}
          {@const v = val_y * div * (axis_y.coef ?? 1)}
          <line x1={0} x2={width} y1={y} y2={y}></line>
          <text y={y} dominant-baseline="middle">{axis_y.round ? v.toFixed(axis_y.round) : v}</text>
        {/each}
      </g>
      <!-- z axis -->
      <g class="z">
        {#each Array(axis_y.ticks + 1) as _, div}
          {@const z = height - pix_z * div}
          {@const v = val_z * div * (axis_z.coef ?? 1)}
          <line x1={0} x2={width} y1={z} y2={z}></line>
          <text x={width + 5} y={z} dominant-baseline="middle">{axis_z.round ? v.toFixed(axis_z.round) : v}</text>
        {/each}
      </g>
      <!-- limits -->
      {#if limits}
        <g class="limits" transform="translate(0, {height}) scale(1,-1)">
        {#if limits.lo}
          {@const lim_lo = limits.lo * coefs.y}
          <rect x={0} y={0} {width} height={lim_lo} fill='yellow' fill-opacity='25%'/>
        {/if}
        {#if limits.hi}
          {@const lim_hi = limits.hi * coefs.y}
          <rect x={0} y={lim_hi} {width} height={height - lim_hi} fill='yellow' fill-opacity='25%'/>
        {/if}
        </g>
      {/if}
      <!-- marker -->
      {#if marker_y }
        {@const mx = fit(marker_y.x, axis_x.minimum, axis_x.maximum) * coefs.x}
        {@const my = height - fit(marker_y.y, axis_y.minimum, axis_y.maximum) * coefs.y}
        <path transform="translate(0,{my})" d="M 0,0 l -5,5 v -10 z"/>
        <path transform="translate({mx},{height})" d="M 0,0 l 5,5 h -10 z"/>
        <path transform="translate({mx},{my})" d="M -5,0 h 10 M 0,-5 v 10" stroke='red'/>
      {/if}
      {#if marker_z }
        {@const mx = fit(marker_z.x, axis_x.minimum, axis_x.maximum) * coefs.x}
        {@const mz = height - fit(marker_z.y, axis_z.minimum, axis_z.maximum) * coefs.z}
        <path transform="translate({width},{mz})" d="M 0,0 l 5,5 v -10 z"/>
        <path transform="translate({mx},{mz})" d="M -5,0 h 10 M 0,-5 v 10" stroke='red'/>
      {/if}
      <!-- data -->
      {#if points.power.length }
        <svg style="overflow: hidden" {width} {height}>
          {@html svgPath(points.power, bezierCommand, chart_styles[0])}
        </svg>
        <svg style="overflow: hidden" {width} {height}>
          {@html svgPath(points.temper, bezierCommand, chart_styles[1])}
        </svg>
      {/if}
    </svg>
  {/if}
  </div>
</div>

<style>
  .root {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    /* outline: 1px dashed grey; */
    position: relative;
  }
  .title {
    font-size: 1.1em;
    font-weight: 500;
    max-height: 0.45em;
    text-align: center;
  }
  .container {
    display: block;
    position: absolute;
    bottom: 1.2em;
    left: 0;
    right: 3em;
    outline: 1px solid black;
  }
  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .x text {
		text-anchor: middle;
    transform: translateY(1em);
	}
	.y text {
		text-anchor: end;
    transform: translateX(-0.2em);
	}
  line {
		fill: none;
		stroke: black;
    stroke-width: 1px;
    stroke-dasharray: 2;
	}
</style>