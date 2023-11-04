<script lang="ts">
  import TestChart from "./TestChart.svelte";
  import { RECORD, POINTS_HIPOT, POINTS_ROHMS } from "../stores/database";
  import { HDR_PROTOCOL, HDR_CHARTS, HDR_HIPOT, HDR_ROHMS, HDR_IXX } from "../configs/cfg_localization";
  import { COMBOS, transliterate, HDR_RESULT } from "../configs/cfg_localization";
  import { AXIES } from "../testing/testing_hipot";
  import { decimal2time, isEmpty, getAverage, getDisbalance, getDelta, compare } from "../shared/funcs";
  import { HipotModes, HipotPoint } from "../shared/types";
  import Logo from "./svg/SVGLogo.svelte";


  let eng = false
  let record = {}
  let verdict = "";
  /** значения комбобоксов */
  const combos = {
    connection : "",
    oil_admix  : "",
  }

  const headers = HDR_PROTOCOL[eng]
  const chart_titles = HDR_CHARTS[eng];
  const headers_tab = { ...HDR_ROHMS[eng], ...HDR_HIPOT[eng], ...HDR_IXX[eng]}
  const headers_results = {...HDR_RESULT[eng]};
  const hipot_names = {x: 'time', y1: 'resist', y2: ''};
  const results = {
    // омическое
    rohms: [],
    // ток ХХ
    u_xx:[0,0,0], i_xx:[0,0,0], u_xx_avr: 0, i_xx_avr: 0, i_xx_bal: 0, i_xx_pow: 0,
    // коэф.трансформации
    u_hi:[0,0,0], u_lo:[0,0,0], u_hi_avr: 0, u_lo_avr: 0, coef_tabl: 1, coef_real: 1,
  };

  const validity = {
    hipot:  {
      h0:   {value: 0, condition: "≥", limit:  10, state: true},
      l0:   {value: 0, condition: "≥", limit:   5, state: true},
      hl:   {value: 0, condition: "≥", limit: 100, state: true},
    },                                 
    absorb: {                          
      h0:   {value: 0, condition: "≥", limit: 1.3, state: true},
      l0:   {value: 0, condition: "≥", limit: 1.3, state: true},
      hl:   {value: 0, condition: "≥", limit: 1.3, state: true},
      xx:   {value: 0, condition: "≥", limit: 1.3, state: true},
    },
    rohms:  {limit:   3, condition: "<", value: 0, state: true},
    i_xx:   {limit:   2, condition: "<", value: 0, state: true},
    coef:   {limit:   2, condition: "<", value: 0, state: true}
    // polarize: [ 2, ">", '-'],
  }

  const cmbVal = (name: string, index: number) => {
    return typeof index === 'number' && COMBOS[eng][name][index - 1].name;
  }
  const trans = (text: string) => (eng ? transliterate(text) : text) || "";

  /** Заполнение данных о высоковольтном испытании */
  function fillHipot() {
    const result = {h0:[], l0:[], hl:[]};
    (!isEmpty($POINTS_HIPOT)) &&
    Object.values(HipotModes).forEach((mode: string) => {
      result[mode] = $POINTS_HIPOT[mode]
        .map(point => { return { x: point.time, y: point.resist }});

      let points_15_60  = $POINTS_HIPOT[mode].filter(point => [15, 60].includes(point.time));

      let absorb = validity.absorb[mode];
      absorb.value = points_15_60[1]?.resist / points_15_60[0]?.resist;
      absorb.state = compare[absorb.condition](absorb.value, absorb.limit);

      let hipot = validity.hipot[mode];
      hipot.value = points_15_60[1]?.resist;
      hipot.state = compare[hipot.condition](hipot.value, hipot.limit);
    });
    // если одно правило для всех подключений
    // для определения годности используем наименьшее из всех
    let absorb = validity.absorb.xx;
    absorb.value = Math.min(
      ...Object.values(HipotModes)
      .map(mode => validity.absorb[mode].value)
    );
    absorb.state = compare[absorb.condition](absorb.value, absorb.limit);

    return result;
  }
  function fillROhms() {
    results.rohms = Object.entries($POINTS_ROHMS).map(point => {
      return { name: point[0], point: point[1], delta: getDelta(Object.values(point[1])) }
    });
    let rohm = validity.rohms;
    // для определения годности используем наибольшее отклонение
    rohm.value = Math.max(
      ...results.rohms
      .filter(p => !isNaN(p.delta))
      .map(p => p.delta)
    );
    rohm.state = compare[rohm.condition](rohm.value, rohm.limit);
  }
  /** Заполнение данных об измерении тока холостого хода */
  function fillIxx(record: any) {
    results.u_xx = [record['f_u_xx_a'], record['f_u_xx_b'], record['f_u_xx_c']];
    results.i_xx = [record['f_i_xx_a'], record['f_i_xx_b'], record['f_i_xx_c']];
    results.u_xx.push(getAverage(results.u_xx));
    results.i_xx.push(getAverage(results.i_xx));
    results.i_xx.push(getDisbalance(results.i_xx));
    results.i_xx.push(results.u_xx_avr + results.i_xx_avr);
  }
  /** Заполнение данных об измерении коэф.трансформации */
  function fillCoef(record: any) {
    results.u_hi = [record['f_u_hi_a'], record['f_u_hi_b'], record['f_u_hi_c']];
    results.u_lo = [record['f_u_lo_a'], record['f_u_lo_b'], record['f_u_lo_c']];
    results.u_hi.push(getAverage(results.u_hi));
    results.u_lo.push(getAverage(results.u_lo));
    results.coef_tabl = record['f_coef_tab'];
    results.coef_real = getAverage(results.u_hi) / getAverage(results.u_lo);
  }
  /** Проверка на годность */
  function checkValidity() {
  }

  $: hipot_chart = (() => {
    const record = $RECORD;
    combos.connection  = cmbVal('connection',  record['n_connection']);
    combos.oil_admix   = cmbVal('presence',    record['oil_admix']);
  
    let points = fillHipot();

    fillROhms();
    fillIxx(record);
    fillCoef(record);
  
    checkValidity();
    verdict = headers_results.verdict + " " + headers_results.valid[0];

    return points;
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
      <div class="info-block">
        <span>{headers.datetest}</span>
        <span>{headers.customer}</span>
        <span>{headers.ordernum}</span>
        <span/>
        <span>{headers.field}</span>
        <span>{headers.lease}</span>
        <span>{headers.well}</span>
        <span/>

        <span>{record['datetest'] || ""}</span>
        <span>{record['customer'] || ""}</span>
        <span>{record['ordernum'] || ""}</span>
        <span/>
        <span>{trans(record['field'])}</span>
        <span>{trans(record['lease'])}</span>
        <span>{trans(record['well'])}</span>
        <span/>

        <span>{headers.serial}</span>
        <span>{headers.trans_type}</span>
        <span/>
        <span>{headers.nom_u_hi}</span>
        <span>{headers.nom_u_lo}</span>
        <span>{headers.nom_i_hi}</span>
        <span>{headers.nom_i_lo}</span>
        <span/>

        <span>{record['serial'] || ""}</span>
        <span>{trans(record['name'])}</span>
        <span/>
        <span>{record['f_nom_u_hi']}</span>
        <span>{record['f_nom_u_lo']}</span>
        <span>{record['f_nom_i_hi']}</span>
        <span>{record['f_nom_i_lo']}</span>
        <span/>

        <span>{headers.connect}</span>
        <span>{headers.power}</span>
        <span>{headers.eds}</span>
        <span/>
        <span>{headers.oil_level}</span>
        <span>{headers.oil_color}</span>
        <span>{headers.oil_kvolt}</span>
        <span>{headers.oil_admix}</span>

        <span>{combos.connection}</span>
        <span>{record['f_power']}</span>
        <span>{record['f_eds']}</span>
        <span/>
        <span>{record['oil_level'] || ""}</span>
        <span>{record['oil_color'] || ""}</span>
        <span>{record['oil_kvolt'] || ""}</span>
        <span>{combos.oil_admix}</span>

      </div>
      <br/>
      <p>{headers.title_result}</p>
      <hr/>
      <div class="tests">
        <div class="test-column1">
          <table class="table-ixx">
            <tr><th class="table-title" colspan="4">Измерение тока холостого хода</th></tr>
            {#each [0,1,2,3] as i}
            <tr>
              <td class="aligned-right">{headers_tab.tab_u_xx[i]}</td>
              <td>{results.u_xx[i]?.toFixed(3) || "-.-"}</td>
              <td class="aligned-right">{headers_tab.tab_i_xx[i]}</td>
              <td>{results.i_xx[i]?.toFixed(3) || "-.-"}</td>
            </tr>
            {/each}
            {#each [4,5] as i}
            <tr>
              <td colspan="3" class="aligned-right">{headers_tab.tab_i_xx[i]}</td>
              <td>{results.i_xx[i]?.toFixed(3) || "-.-"}</td>
            </tr>
            {/each}
          </table>
          <div class="test-charts">
            <TestChart titles={chart_titles.hipot} axies={$AXIES}
              logchart points={hipot_chart} names={hipot_names}/>
          </div>
          <table class="table-hipot">
            <thead>
              <th class="table-title" colspan="4">{headers_tab.tab_hipot_header}</th>
              <tr>
                <!-- <th style="width: 50px; padding: 0;">№</th> -->
                <th>{headers_tab.tab_time}</th>
                <th>{headers_tab.tab_volt}</th>
                <th>{headers_tab.tab_amps}</th>
                <th>{headers_tab.tab_ohms}</th>
              </tr>
            </thead>
            <tbody>
              {#each Object.keys($POINTS_HIPOT) as name}
              {@const points = $POINTS_HIPOT[name].filter(point => [0, 15, 30, 60].includes(point.time))}
              <span>{headers_tab[name]}</span>
                {#each points as point}
                  <tr>
                    <!-- <td>{i + 1}</td> -->
                    <td>{point ? decimal2time({seconds: point.time}) : "-.-"}</td>
                    <td>{point?.voltage.toFixed(1) || "-.-"}</td>
                    <td>{point?.current.toFixed(3) || "-.-"}</td>
                    <td>{point?.resist.toFixed(1) || "-.-"}</td>
                  </tr>
                {/each}
                <!-- <tr><td class="aligned-right" colspan="4">{headers_tab.polarize}</td><td>0</td></tr> -->
                <tr>
                  <td class="aligned-right" colspan="3">{headers_tab.absorb}</td>
                  <td>{validity.absorb[name].value.toFixed(3) || "-.-"}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <div class="test-column2">
          <table class="table-coef">
            <tr><th class="table-title" colspan="4">Измерение коэффициента трансформации</th></tr>
            {#each [0,1,2,3] as i}
            <tr>
              <td class="aligned-right">{headers_tab.tab_u_hi[i]}</td><td>{results.u_hi[0]?.toFixed(3) || "-.-"}</td>
              <td class="aligned-right">{headers_tab.tab_u_lo[i]}</td><td>{results.u_lo[0]?.toFixed(3) || "-.-"}</td>
            </tr>
            {/each}
            {#each ['coef_tabl', 'coef_real'] as name}
            <tr>
              <td colspan="3" class="aligned-right">{headers_tab[`tab_${name}`]}</td>
              <td>{results[name]?.toFixed(3) || "-.-"}</td>
            </tr>
            {/each}
          </table>
          <table class="table-rohms">
            <thead>
              <th class="table-title" colspan="5">{headers_tab.tab_rohm_header}</th>
              <tr>
                <th>{headers_tab.tab_switch}</th>
                <th>{headers_tab.tab_rohm_a}</th>
                <th>{headers_tab.tab_rohm_b}</th>
                <th>{headers_tab.tab_rohm_c}</th>
                <th>{headers_tab.tab_disbal}</th>
              </tr>
            </thead>
            <tbody>
              <!-- {#each Array(25) as _, i}
              {@const [name, rohm] = Object.entries($POINTS_ROHMS)?[i]} -->
              {#each results.rohms as rohm}
              <tr>
                <td>{rohm.name}</td>
                <td>{rohm.point?.phase_a ? rohm.point.phase_a.toFixed(4) : ""}</td>
                <td>{rohm.point?.phase_b ? rohm.point.phase_b.toFixed(4) : ""}</td>
                <td>{rohm.point?.phase_c ? rohm.point.phase_c.toFixed(4) : ""}</td>
                <td>{isNaN(rohm.delta) ? "" : rohm.delta.toFixed(2)}</td>
              </tr>
              {/each}
            </tbody>
          </table>
          <table class="table-results">
            <thead>
              <tr>
                <th style="width: auto;"></th>
                <th style="width: 9ch;">значение</th>
                <th style="width: 8ch;">допуск</th>
                <th style="width: 8ch;">вердикт</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th class="aligned-right">{headers_results['hipot_h0']}</th>
                <td>{validity.hipot.h0.value.toFixed(1)}</td>
                <td>{validity.hipot.h0.condition} {validity.hipot.h0.limit}</td>
                <td>{validity.hipot.h0.state ? '+' : '-'}</td>
              </tr>
              <tr>
                <th class="aligned-right">{headers_results['hipot_l0']}</th>
                <td>{validity.hipot.l0.value.toFixed(1)}</td>
                <td>{validity.hipot.l0.condition} {validity.hipot.l0.limit}</td>
                <td>{validity.hipot.l0.state ? '+' : '-'}</td>
              </tr>
              <tr>
                <th class="aligned-right">{headers_results['hipot_hl']}</th>
                <td>{validity.hipot.hl.value.toFixed(1)}</td>
                <td>{validity.hipot.hl.condition} {validity.hipot.hl.limit}</td>
                <td>{validity.hipot.hl.state ? '+' : '-'}</td>
              </tr>
              <tr>
                <th class="aligned-right">{headers_results['absorb']}</th>
                <td>{validity.absorb.xx.value.toFixed(3)}</td>
                <td>{validity.absorb.xx.condition} {validity.absorb.xx.limit}</td>
                <td>{validity.absorb.xx.state ? '+' : '-'}</td>
              </tr>
              <tr>
                <th class="aligned-right">{headers_results['rohms']}</th>
                <td>{validity.rohms.value.toFixed(3)}</td>
                <td>{validity.rohms.condition} {validity.rohms.limit}</td>
                <td>{validity.rohms.state ? '+' : '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p>{verdict}</p>
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
.info-block {
  display: grid;
  grid-auto-flow: column;
  text-align: left;
  margin: 0em 1em;
  grid-template-columns: repeat(6, 17%);
  grid-template-rows: repeat(8, auto);
}
/* .test_results {
  width: 100%;
  height: 600px;
  display: flex;
  flex-direction: row;
} */
.tests {
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 10px;
}
.test-column1, .test-column2 {
  grid-row: 1;
  grid-column: 1;
  display: flex;
  flex-direction: column;
  gap: 1em;
}
.test-column2 {
  grid-row: 1;
  grid-column: 2;
}
.test-charts {
  margin-top: 1px;
  width: 100%;
  height: 19.75em;
  display: grid;
}
.test-results {
  /* grid-row: 2;
  grid-column-start: 2;
  grid-column-end: 3; */
  width: 100%;
  text-align: center;
  font-size: inherit;
}

.aligned-right {
  text-align: end;
    padding-right: 1ch;
}
table, td, th {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  border: 1px solid grey;
  overflow: hidden;
  padding-left: 5px;
  text-align: center;
}
.table-title {
  text-align: center;
  padding: 5px 0;
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