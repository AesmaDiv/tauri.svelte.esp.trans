<!-- // TODO: доработать компонент для динамического добавления точек, чтоб не пересчитывал координаты для каждой точки -->
<script lang="ts">
  import { svgPath, bezierCommand, fit } from "./chart";
  import type { Limits, AxisInfo, Point } from "./chart";

  export let title : string = "";
  export let axis_x : AxisInfo = { minimum: 0, maximum: 10, ticks: 10 };
  export let axis_y : AxisInfo = { minimum: 1, maximum: 10000000, ticks: 5 };
  export let marker : Point = undefined;
  export let limits : Limits = undefined;
  export let data: {[name: string]: Point[]} = {};

  let width : number = 0;
  let height : number = 0;
  
  const logarithmic = (() => {
    let result = [];
    let i = 1
    while (i <= axis_y.maximum) {
      result.push(i);
      i += 1 * 10 ** Math.floor(Math.log10(i));
    }
    return result;
  })();
  console.log("log divs %o", logarithmic);

  $: [points, coefs] = (() => {
    let coefs : Point = {
      x: width / (axis_x.maximum - axis_x.minimum),
      y: height / Math.log10(axis_y.maximum),
    };
    
    let points = Object.entries(data).reduce((obj, [key, value]) => {
      obj[key] = value.map(point => { 
        return { 
          x: 60 * fit(point.x, axis_x.minimum, axis_x.maximum) * coefs.x,
          y: height - fit(Math.log10(point.y), 0, axis_y.maximum) * coefs.y
        }
      });
      return obj;
     }, {});
    console.log(data, coefs, points);
    return [points, coefs]
  })();

</script>

<div class="root">
  <div class="title" style="{title !== "" && 'margin: 0em 0em;'}">{title}</div>
  <div class="container" bind:clientWidth={width} bind:clientHeight={height}
    style="left: 4ch; top: {!!title ? 1.4 : 1}em">
  {#if width && height}
    {@const pix_x = width / axis_x.ticks}
    {@const val_x = (axis_x.maximum - axis_x.minimum) / axis_x.ticks}
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
        {#each logarithmic as div}
          {@const y = height - Math.log10(div) * coefs.y}
          <line x1={0} x2={width} y1={y} y2={y}></line>
          <text y={y} dominant-baseline="middle">
            {#if (Math.log10(div) % 1 === 0)}
              10<tspan baseline-shift="super">{Math.log10(div)}</tspan> 
            {/if}
          </text>
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
      {#if marker }
        {@const mx = fit(marker.x, axis_x.minimum, axis_x.maximum) * coefs.x}
        {@const my = height - fit(Math.log10(marker.y), 0, axis_y.maximum) * coefs.y}
        <path transform="translate(0,{my})" d="M 0,0 l -5,5 v -10 z"/>
        <path transform="translate({mx},{height})" d="M 0,0 l 5,5 h -10 z"/>
        <path transform="translate({mx},{my})" d="M -5,0 h 10 M 0,-5 v 10" stroke='red'/>
      {/if}
      <!-- data -->
      {#if points }
        <svg style="overflow: hidden" {width} {height}>
          {@html svgPath(points['h0'], bezierCommand, "fill='none' stroke='red'")}
          {@html svgPath(points['l0'], bezierCommand, "fill='none' stroke='green'")}
          {@html svgPath(points['hl'], bezierCommand, "fill='none' stroke='blue'")}
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
    outline: 1px dashed grey;
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
    right: 1em;
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