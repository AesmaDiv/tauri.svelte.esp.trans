<script lang="ts">
  import TestChart from "./TestChart.svelte";
  import { HDR_PROTOCOL, HDR_HIPOT, HDR_ROHMS, HDR_XX } from "../configs/cfg_localization";
  import { COMBOS, transliterate, HDR_RESULT } from "../configs/cfg_localization";
  import { DATA, NAMES } from "../stores/results";
  import { RECORD, POINTS_HIPOT } from "../stores/database";
  import { AXIES } from "../testing/testing_hipot";
  import { decimal2time } from "../shared/funcs";
  import Logo from "./svg/SVGLogo.svelte";


  let eng = false

  const hdrs = {...HDR_PROTOCOL[eng], ...HDR_RESULT[eng], ...HDR_ROHMS[eng], ...HDR_HIPOT[eng], ...HDR_XX[eng]};
  const hipot_names = {x: 'time', y1: 'resist', y2: ''};
  
  const cmbVal = (name: string, index: number) => {
    return (typeof index === 'number') && COMBOS[eng][name][index - 1].name;
  }
  const trans = (text: string) => (eng ? transliterate(text) : text) || "";
  /** значения комбобоксов */
  $: [combos, verdict] = (() => {
    return [
      {
        connection: cmbVal('connection', $RECORD['n_connection']),
        oil_admix:  cmbVal('presence',   $RECORD['n_oil_admix']),
      },
      `${hdrs.res_verdict} ${hdrs.res_valid[$DATA.results.verdict]}`
    ]
  })();
</script>

<div id="Protocol" class="protocol">
  <div class="body">
    <header>
      <div class="header_pump_type">№ { $RECORD['id'] }</div>
      <div class="header_title">
        <div class="header_logo"><Logo size={40}/></div>
        <p class="header_name">{hdrs.title}</p>
        <p class="header_town">{hdrs.town}</p>
      </div>
      <div class="header_test_time">{ $RECORD['datetest'] }</div>
    </header>
    <main>
      <p style="margin-top: 0.5em;">{hdrs.title_info}</p>
      <hr/>
      <div class="info">
        <span>{hdrs.datetest}</span>
        <span>{hdrs.customer}</span>
        <span>{hdrs.owner}</span>
        <span>{hdrs.ordernum}</span>
        <span>{hdrs.field}</span>
        <span>{hdrs.lease}</span>
        <span>{hdrs.well}</span>
        <span/>

        <span>{$RECORD['datetest'] || ""}</span>
        <span>{$RECORD['customer'] || ""}</span>
        <span>{$RECORD['owner'] || ""}</span>
        <span>{$RECORD['ordernum'] || ""}</span>
        <span>{trans($RECORD['field'])}</span>
        <span>{trans($RECORD['lease'])}</span>
        <span>{trans($RECORD['well'])}</span>
        <span/>

        <span>{hdrs.serial}</span>
        <span>{hdrs.trans_type}</span>
        <span>{hdrs.nom_u_lo}</span>
        <span>{hdrs.nom_u_hi}</span>
        <span>{hdrs.nom_i_lo}</span>
        <span>{hdrs.nom_i_hi}</span>
        <span>{hdrs.power}</span>
        <span>{hdrs.eds}</span>
        
        <span>{$RECORD['serial'] || ""}</span>
        <span>{trans($RECORD['name'])}</span>
        <span>{$RECORD['f_nom_u_lo']}</span>
        <span>{$RECORD['f_nom_u_hi']}</span>
        <span>{$RECORD['f_nom_i_lo']}</span>
        <span>{$RECORD['f_nom_i_hi']}</span>
        <span>{$RECORD['f_power']}</span>
        <span>{$RECORD['f_eds']}</span>
        
        <span>{hdrs.connect}</span>
        <span>{hdrs.temperature}</span>
        <span>{hdrs.humidity}</span>
        <span/>
        <span>{hdrs.oil_level}</span>
        <span>{hdrs.oil_color}</span>
        <span>{hdrs.oil_kvolt}</span>
        <span>{hdrs.oil_admix}</span>

        <span>{combos.connection}</span>
        <span>{$RECORD['f_t_trans']}</span>
        <span>{$RECORD['f_humidity']}</span>
        <span/>
        <span>{$RECORD['oil_level'] || ""}</span>
        <span>{$RECORD['oil_color'] || ""}</span>
        <span>{$RECORD['oil_kvolt'] || ""}</span>
        <span>{combos.oil_admix}</span>

      </div>
      <br/>
      <p style="margin-top: -1em;">{hdrs.title_result}</p>
      <hr/>
      <div class="tests">
        <div class="test-column1">
          <table class="table-ixx">
            <tr><th class="table-title" colspan="4">{hdrs.xx_title}</th></tr>
            {#each [0,1,2,3] as i}
            <tr>
              <td class="aligned-right">{hdrs.xx_u[i]}</td>
              <td>{$DATA.results.u_xx[i]?.toFixed(3) || "-.-"}</td>
              <td class="aligned-right">{hdrs.xx_i[i]}</td>
              <td>{$DATA.results.i_xx[i]?.toFixed(3) || "-.-"}</td>
            </tr>
            {/each}
            <tr>
              <td colspan="3" class="aligned-right">{hdrs.res_idle}</td>
              <td>{$DATA.validity.idle.value?.toFixed(3) || "-.-"}</td>
            </tr>
            <tr>
              <td colspan="3" class="aligned-right">{hdrs.res_power}</td>
              <td>{$DATA.validity.power.value?.toFixed(1) || "-.-"}</td>
            </tr>
          </table>
          <div class="test-charts">
            <TestChart titles={hdrs.hipot_chart_title} axies={$AXIES}
              logchart points={$DATA.chart} names={hipot_names}/>
          </div>
          <table class="table-hipot">
            <thead>
              <th class="table-title" colspan="4">{hdrs.hipot_header}</th>
              <tr>
                <!-- <th style="width: 50px; padding: 0;">№</th> -->
                <th>{hdrs.hipot_time}</th>
                <th>{hdrs.hipot_volt}</th>
                <th>{hdrs.hipot_amps}</th>
                <th>{hdrs.hipot_ohms}</th>
              </tr>
            </thead>
            <tbody>
              {#each Object.keys($POINTS_HIPOT) as name}
              {@const points = $POINTS_HIPOT[name].filter(point => [0, 15, 30, 60].includes(point.time))}
              <tr><td colspan="4" style="text-align: left;">{hdrs[`hipot_${name}`]}</td></tr>
                {#each points as point}
                  <tr>
                    <td>{point ? decimal2time({seconds: point.time}) : "-.-"}</td>
                    <td>{point?.voltage.toFixed(1) || "-.-"}</td>
                    <td>{point?.current.toFixed(3) || "-.-"}</td>
                    <td>{point?.resist.toFixed(1) || "-.-"}</td>
                  </tr>
                {/each}
                <tr>
                  <td class="aligned-right" colspan="3">
                    {hdrs.res_absorp} 
                  </td>
                  <td>{$DATA.validity[`absorp_${[name]}`].value.toFixed(3) || "-.-"}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <div class="test-column2">
          <table class="table-coef">
            <tr><th class="table-title" colspan="4">{hdrs.coef_title}</th></tr>
            {#each [0,1,2,3] as i}
            <tr>
              <td class="aligned-right">{hdrs.xx_u_hi[i]}</td><td>{$DATA.results.u_hi[0]?.toFixed(3) || "-.-"}</td>
              <td class="aligned-right">{hdrs.xx_u_lo[i]}</td><td>{$DATA.results.u_lo[0]?.toFixed(3) || "-.-"}</td>
            </tr>
            {/each}
            {#each ['coef_tabl', 'coef_real'] as name}
            <tr>
              <td colspan="3" class="aligned-right">{hdrs[name]}</td>
              <td>{$DATA.results[name]?.toFixed(3) || "-.-"}</td>
            </tr>
            {/each}
          </table>
          <table class="table-rohms">
            <thead>
              <th class="table-title" colspan="5">{hdrs.rohm_header}</th>
              <tr>
                <th>{hdrs.rohm_switch}</th>
                <th>{hdrs.rohm_a}</th>
                <th>{hdrs.rohm_b}</th>
                <th>{hdrs.rohm_c}</th>
                <th>{hdrs.rohm_imbal}</th>
              </tr>
            </thead>
            <tbody>
              {#each Array(25) as _, i}
              {@const rohm = $DATA.results.rohms[i]}
              <!-- {#each $DATA.results.rohms as rohm} -->
              <tr>
                {#if rohm}
                <td>{rohm?.name}</td>
                <td>{rohm.point?.phase_a ? rohm.point.phase_a.toFixed(4) : ""}</td>
                <td>{rohm.point?.phase_b ? rohm.point.phase_b.toFixed(4) : ""}</td>
                <td>{rohm.point?.phase_c ? rohm.point.phase_c.toFixed(4) : ""}</td>
                <td>{isNaN(rohm?.delta) ? "" : rohm.delta.toFixed(2)}</td>
                {:else}
                <td>-</td><td/><td/><td/><td/>
                {/if}
              </tr>
              {/each}
            </tbody>
          </table>
          <table class="table-results">
            <thead>
              <tr>
                <th style="width: auto;"></th>
                <th style="width: 8ch;">{hdrs.res_tab[0]}</th>
                <th style="width: 7ch;">{hdrs.res_tab[1]}</th>
                <th style="width: 7ch;">{hdrs.res_tab[2]}</th>
              </tr>
            </thead>
            <tbody>
              {#each NAMES as name}
                <tr>
                <th class="aligned-right">{hdrs[`res_${[name]}`]}</th>
                <td>{$DATA.validity[name].value.toFixed(2)}</td>
                <td>{$DATA.validity[name].condition} {$DATA.validity[name].limit}</td>
                <td>{$DATA.validity[name].state ? '+' : '-'}</td>
              </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
      <p style="text-decoration: underline;">{verdict}</p>
      <div class="footer">
        <div class="comments">
          <p>{hdrs.comments}</p>
          <div style="margin-left: 1em;">{$RECORD['comments']}</div>
        </div>
        <div class="signatures">
          <p>{hdrs.operator}</p>
          <p>{hdrs.foreman}</p>
          <p>_________________ | _________________</p>
          <p>_________________ | _________________</p>
        </div>
      </div>
    </main>
  </div>
</div>

<style>
.protocol {
  width: 215mm;
  height: 290mm;
  display: inline-flex;
  height: 100%;
  flex-direction: column;
  overflow-y: scroll;
  font-size: 10px;
}
.body {
  width: 210mm;
  height: 285mm;
  color: black;
  background-color: rgb(255,255,255);
  --border-style: 1px solid black;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
p, hr {
  /* margin: 2px; */
  margin: 0em 1em 0em 1em;
  padding: 0;
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
  margin-bottom: 1em;
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
}
.header_test_time {
  justify-self: stretch;
  text-align: end;
}
/* СОДЕРЖАНИЕ */
main {
  width: 100%;
  flex-grow: 2;
  text-align: left;
  font-size: 10px;
}
.info {
  display: grid;
  grid-auto-flow: column;
  text-align: left;
  margin: 0.5em 1em -0.5em 1em;
  grid-template-columns: 18% 15% 18% 15% 18% 17%;
  grid-template-rows: repeat(8, auto);
}
.tests {
  display: grid;
  grid-template-rows: auto;
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
  grid-column: 2;
}
.test-charts {
  margin-top: 1px;
  margin-left: 1px;
  width: calc(100% - 2px);
  height: 21em;
  display: grid;
}
.table-hipot, .table-results {
  width: 100%;
  text-align: center;
}
.table-results {
  margin-top: auto;
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
  font-size: 10px;
}
.table-title {
  text-align: center;
  padding: 2px 0;
}
/* ОСНОВАНИЕ */
.footer {
  width: 100%;
  height: 7em;
  display: flex;
  flex-direction: row;
  margin-top: 0.5em;
  font-size: 10px;
}
.comments {
  width: 60%;
  display: flex;
  flex-direction: column;
  text-align: left;
  gap: 0.5em;
}
.signatures {
  width: 40%;
  display: grid;
  grid-template-rows: repeat(2, 50%);
  grid-template-columns: 30% auto;
  grid-auto-flow: column;
  row-gap: 2em;
  margin-right: 1em;
}
</style>