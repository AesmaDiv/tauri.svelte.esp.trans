/** НАСТРОЙКИ ПРИЛОЖЕНИЯ */
export const CONFIG = {
  db: {
    path: "D:\\Projects\\Tauri\\tauri.svelte.esp.trans\\resources\\trans.sqlite"
  },
  test: {
    test_press  : { duration: 180,  pulling_rate: 250 , points_count: 10 },
    test_power  : { duration: 1500, pulling_rate: 1000, points_count: 10 }
  },
  adam: {
    ip: "0.0.0.0",
    pulling_rate: 250,
    digital: {
      lamp      : { slot: 1, channel: 0 },
      rohm_ab   : { slot: 1, channel: 1 },
      rohm_bc   : { slot: 1, channel: 2 },
      rohm_ca   : { slot: 1, channel: 3 },
      start     : { slot: 1, channel: 4 },
      print     : { slot: 1, channel: 5 },
    },
    analog: {
      press_sys : { slot: 0, channel: 1, d_range: 0xffff, offset: 0, v_range: 10, coeff: 1.1 },
      press_top : { slot: 0, channel: 3, d_range: 0xffff, offset: 0, v_range: 10, coeff: 3.3 },
      press_btm : { slot: 0, channel: 2, d_range: 0xffff, offset: 0, v_range: 10, coeff: 2.2 },
      torque    : { slot: 0, channel: 5, d_range: 0xffff, offset: 0, v_range: 10, coeff: 5.5 },
      temper    : { slot: 0, channel: 6, d_range: 0xffff, offset: 0, v_range: 10, coeff: 6.6 },
      speed     : { slot: 0, channel: 4, d_range: 0xffff, offset: 0, v_range: 10, coeff: 4.4 },
    }
  },
}