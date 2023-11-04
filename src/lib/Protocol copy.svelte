<script lang="ts">
  import { RECORD, POINTS_HIPOT, POINTS_ROHMS, LIMITS_PRESS } from "../stores/database";
  import { AXIES } from "../testing/testing_hipot";

  import { HDR_PROTOCOL, HEADERS_CHART, HDR_PRESS, HDR_POWER } from "../configs/cfg_localization";
  import { COMBOS, transliterate, HDR_RESULT} from "../configs/cfg_localization";
  import { roundValue, decimal2time } from "../shared/funcs";
  import Logo from "./svg/SVGLogo.svelte";
  import TestChart from "./TestChart.svelte";


  let eng = false
  let [record, sealtype, points] = [{}, {} as ISealtype, []];
  /** значения комбобоксов */
  const combos = {
    head       : "",
    base       : "",
    coupling   : "",
    rotation   : "",
    connection : "",
    oil_water  : "",
    oil_shavs  : "",
    oil_color  : "",
  }

  const headers = HDR_PROTOCOL[eng]
  const chart_titles = HEADERS_CHART[eng];
  const headers_results = {...HDR_PRESS[eng], ...HDR_POWER[eng], ...HDR_RESULT[eng]};
  const press_names = {x: 'time', y1: 'press_top', y2: 'press_btm'};
  const power_names = {x: 'time', y1: 'power', y2: 'temper'};


  const cmbVal = (name: string, index: number) => {
    return typeof index === 'number' && COMBOS[eng][name][index - 1].name;
  }
  const trans = (text: string) => (eng ? transliterate(text) : text) || "";

  POINTS_HIPOT.subscribe(pnts => points = pnts);
  RECORD.subscribe(rec => {
    record = rec;
    combos.head        = cmbVal('state',       record['head']);
    combos.base        = cmbVal('state',       record['base']);
    combos.coupling    = cmbVal('presence',    record['coupling']);
    combos.rotation    = cmbVal('rotation',    record['shaft_rotation']);
    combos.connection  = cmbVal('connection',  record['shaft_connection']);
    combos.oil_water   = cmbVal('presence',    record['oil_water']);
    combos.oil_shavs   = cmbVal('presence',    record['oil_shavs']);
    combos.oil_color   = eng  ?  'Amber'   :   record['oil_color'];
  });

  $: result = (() => {
    const lim_top = sealtype.limit_top.split(";");
    const lim_btm = sealtype.limit_btm.split(";");
    const lim_pwr = sealtype.limit_pwr;
    const lim_tmp = sealtype.limit_tmp;
    const press_top = $POINTS_ROHMS.every(point => point.press_top < +lim_top[1]);
    const press_btm = $POINTS_ROHMS.every(point => point.press_btm < +lim_btm[1]);
    const power     = points.every(point => point.power < lim_pwr);
    const temper    = points.every(point => point.temper < lim_tmp);
    return {
      press_top,
      press_btm,
      power,
      temper,
      overall : press_top && press_btm && power && temper,
    }
  })();
</script>

<div id="Protocol" class="protocol">
  <div class="body">
    <header>
      <div class="header_pump_type">№ { record['id'] }</div>
      <div class="header_title">
        <div class="header_logo"><Logo size={40}/></div>
        <p class="header_name">{headers.title}</p>
        <p class="header_town">{headers.town}</p>
      </div>
      <div class="header_test_time">{ record['datetest'] }</div>
    </header>
    <main>
      <p style="margin-top: 40;">{headers.title_info}</p>
      <hr/>
      <div class="info_block">
        <span>{headers.producer}</span>
        <span>{headers.sealtype}</span>
        <span>{headers.serial}</span>
        <br/>
        <span>{headers.lmt_pwr}</span>
        <span>{headers.lmt_tmp}</span>
        <span>{headers.lmt_thr}</span>
        <span>{headers.connect}</span>
        <span>{headers.rotation}</span>

        <span>{trans(sealtype['producer'])}</span>
        <span>{trans(sealtype['name'])}</span>
        <span>{record['serial'] || ""}</span>
        <br/>
        <span>{sealtype['limit_pwr']}</span>
        <span>{sealtype['limit_tmp']}</span>
        <span>{record['limit_thr'] || ""}</span>
        <span>{combos.connection}</span>
        <span>{combos.rotation}</span>
        
        <span>{headers.exten_top}</span>
        <span>{headers.exten_btm}</span>
        <span>{headers.shaft_yeild}</span>
        <span>{headers.shaft_diam}</span>
        <br/>
        <span>{headers.runout_rad}</span>
        <span>{headers.runout_end}</span>
        <span>{headers.axial_play}</span>
        <span>{headers.momentum}</span>

      
        <span>{record['exten_top'] || ""}</span>
        <span>{record['exten_btm'] || ""}</span>
        <span>{record['shaft_yield'] || ""}</span>
        <span>{record['shaft_diam'] || ""}</span>
        <br/>
        <span>{record['runout_rad'] || ""}</span>
        <span>{record['runout_end'] || ""}</span>
        <span>{record['axial_play'] || ""}</span>
        <span>{record['momentum'] || ""}</span>

        <span/>
        <span/>
        <span/>
        <span/>
        <span/>
        <span>&#8804; 0.16 {headers.mms}</span>
        <span>&#8804; 0.10 {headers.mms}</span>
        <span>0.25 .. 1.2 {headers.mms}</span>
        <span>&#8804; 0.40 {headers.kgf}</span>
      </div>
      <br/>
      <p>{headers.title_test}</p>
      <hr/>
      <div class="info_block">
        <span>{headers.datetest}</span>
        <span>{headers.daterecv}</span>
        <span>{headers.customer}</span>
        <span>{headers.ordernum}</span>
        <br/>
        <span>{headers.field}</span>
        <span>{headers.lease}</span>
        <span>{headers.well}</span>
        <span>{headers.daysrun}</span>

        <span>{record['datetest'] || ""}</span>
        <span>{record['daterecv'] || ""}</span>
        <span>{record['customer'] || ""}</span>
        <span>{record['ordernum'] || ""}</span>
        <br/>
        <span>{trans(record['field'])}</span>
        <span>{trans(record['lease'])}</span>
        <span>{trans(record['well'])}</span>
        <span>{record['daysrun'] || ""}</span>

        <span>{headers.head}</span>
        <span>{headers.base}</span>
        <span>{headers.coupling}</span>
        <span>{headers.pressure}</span>
        <br/>
        <span>{headers.oil_color}</span>
        <span>{headers.oil_water}</span>
        <span>{headers.oil_shavs}</span>
        <span>{headers.oil_kvolt}</span>

        <span>{combos.head}</span>
        <span>{combos.base}</span>
        <span>{combos.coupling}</span>
        <span>{record['pressure'] || ""}</span>
        <br/>
        <span>{combos.oil_color}</span>
        <span>{combos.oil_water}</span>
        <span>{combos.oil_shavs}</span>
        <span>{record['oil_kvolt'] || ""}</span>
      </div>
      <br/>
      <p>{headers.title_result}</p>
      <hr/>
      <div class="test">
        <div class="test_charts">
          <TestChart bichart titles={chart_titles.power} axies={$AXIES} points={$POINTS_HIPOT} names={power_names}/>
          <TestChart titles={chart_titles.press} axies={$AXIS_PRESS} limits={$LIMITS_PRESS} points={$POINTS_ROHMS} names={press_names}/>
        </div>
        <div class="tables">
          <!-- {@html buildPointsTable(points, headers)} -->
          <table class="table-power">
            <thead>
              <tr>
                <th scope="col">№</th>
                <th scope="col">{headers.table_axial}</th>
                <th scope="col">{headers.table_power}</th>
                <th scope="col">{headers.table_temp}</th>
                <th scope="col">{headers.table_time}</th>
              </tr>
            </thead>
            <tbody>
              {#each Array(11) as _, i}
              <tr>
                <th scope="row">{i + 1}</th>
                <td>{roundValue(points[i]?.thrust, 3) || "-.-"}</td>
                <td>{roundValue(points[i]?.power, 3) || "-.-"}</td>
                <td>{roundValue(points[i]?.temper, 1) || "-.-"}</td>
                <td>{points[i] ? decimal2time(points[i].time) : "-.-"}</td>
              </tr>
              {/each}
              <!-- {#each points as pnt, i}
              {#if i < 20}
              <tr>
                <th scope="row">{i + 1}</th>
                <td>{roundValue(pnt.thrust, 3) || "-.-"}</td>
                <td>{roundValue(pnt.power, 3)}</td>
                <td>{roundValue(pnt.temper, 1)}</td>
                <td>{decimal2time(pnt.time)}</td>
              </tr>
              {/if}
              {/each} -->
            </tbody>
          </table>
          <p style="align-self: left; font-weight: normal;">*{headers.note}</p>
          <table class="table-results">
            <thead>
              <tr>
                <th>параметр</th>
                <th>результат</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="results-headers">{headers_results.top}</td>
                <td>{headers_results.passed[result.press_top ? 0 : 1]}</td>
              </tr>
              <tr>
                <td class="results-headers">{headers_results.btm}</td>
                <td>{headers_results.passed[result.press_btm ? 0 : 1]}</td>
              </tr>
              <tr>
                <td class="results-headers">{headers_results.power}</td>
                <td>{headers_results.passed[result.power ? 0 : 1]}</td>
              </tr>
              <tr>
                <td class="results-headers">{headers_results.temper}</td>
                <td>{headers_results.passed[result.temper ? 0 : 1]}</td>
              </tr>
            </tbody>
          </table>
          <p style="align-self: left;">{headers_results.verdict} {headers_results.valid[result.overall ? 0 : 1]}</p>
        </div>
      </div>
    </main>
    <footer>
      <div class="comments">
        <p>{headers.comments}</p>
        <div>{record['comments']}</div>
      </div>
      <div class="signatures">
        <p>{headers.operator}</p>
        <p>{headers.foreman}</p>
        <p>_________________________</p>
        <p>_________________________</p>
      </div>
    </footer>
  </div>
</div>

<style>
.protocol {
  width: 215mm;
  height: 290mm;
  display: inline-flex;
  height: 100%;
  flex-direction: column;
  /* justify-content: center; */
  /* align-items: center; */
  overflow-y: scroll;
}
.body {
  width: 210mm;
  height: 285mm;
  color: black;
  background-color: rgb(255,255,255);
  --border-style: 1px solid black;
  font-size: small;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
p {
  /* margin: 2px; */
  margin: 2px 0px;
  font-weight: 600;
}
/* ЗАГОЛОВОК */
header {
  width: 100%;
  height: 2em;
  display: grid;
  grid-template-columns: 30% 40% 30%;
  grid-template-rows: 100%;
  align-items: flex-start;
}
.header_pump_type {
  justify-self: stretch;
  text-align: start;
}
.header_title {
  width: 100%;
  display: grid;
  grid-template-columns: 0px 1fr;
  grid-template-rows: 1fr 1fr;
  column-gap: 0px;
  row-gap: 0px;
}
.header_logo {
  grid-row-start: 1;
  grid-row-end: 3;
}
.header_name, .header_town {
  grid-column-start: 2;
  grid-column-end: 4;
  
}
.header_name {
  grid-row: 1;
}
.header_town {
  grid-row: 2;
}
.header_title p {
  display: inline;
  font-weight: 800;
  font-size: 16px;
  text-align: center;
  margin: 0;
}
.header_test_time {
  justify-self: stretch;
  text-align: end;
}
/* СОДЕРЖАНИЕ */
main {
  width: 100%;
  flex-grow: 2;
  font-size: smaller;
  text-align: left;
}
main p {
  margin-left: 1em;
}
.info_block {
  display: grid;
  grid-auto-flow: column;
  text-align: left;
  margin: 0em 1em;
  grid-template-columns: 30% 20% 30% 10% 10%;
  grid-template-rows: repeat(9, auto);
}
/* .test_results {
  width: 100%;
  height: 600px;
  display: flex;
  flex-direction: row;
} */
.test {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.test p {
  margin: 0;
}
.test_charts {
  grid-column: 1;
  width: 100%;
  display: grid;
  grid-template-rows: 110px 220px;
}
.tables {
  width: 100%;
  grid-column: 2;
  display: flex;
  flex-direction: column;
  margin-top: 9px;
}
.table-power, .table-results {
  width: 100%;
  height: auto;
  text-align: center;
  font-size: inherit;
  border-collapse: collapse;
  margin: 0.5em 0em;
}
.table-results {
  height: fit-content;
  align-self: flex-end;
}
.table-results .results-headers {
  text-indent: 1em;
  text-align: start;
}
.tables th,
.tables tr, 
.tables td {
  border: 1px solid grey;
}
/* ОСНОВАНИЕ */
footer {
  width: 100%;
  height: 7em;
  display: flex;
  flex-direction: row;
  font-size: smaller;
  margin-top: 0.5em;
}
.comments {
  width: 60%;
  display: flex;
  flex-direction: column;
  text-align: left;
  gap: 0.5em;
  margin-left: 1em;
}
.signatures {
  width: 40%;
  display: grid;
  grid-template-rows: repeat(2, 50%);
  grid-template-columns: 50% 50%;
  grid-auto-flow: column;
  row-gap: 2em;
  margin-right: 1em;
}
</style>