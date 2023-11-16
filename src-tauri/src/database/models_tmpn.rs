/*
  МОДУЛЬ ОПИСАНИЯ ИСПОЛЬЗУЕМЫХ СТРУКТУР
*/

#![allow(non_snake_case)]
extern crate rusqlite_helper;
use rusqlite_helper::dbtable;

dbtable!(
  struct Dictionary {
    id        : i32,
    name      : String
  }
);
dbtable!(
  struct TLRow {
    id        : i32,
    datetest  : String,
    ordernum  : String,
    serial    : String
  }
);
dbtable!(
  struct Records {
    id           : i32, 
    datetest     : String,
    customer     : String,
    owner        : String,
    ordernum     : String,
    field        : String,
    cluster      : String,
    well         : String,
    serial       : String,
    name         : String,
    switches     : String,
    n_connection : i32,
    f_power      : f64,
    f_nom_u_hi   : f64,
    f_nom_u_lo   : f64,
    f_nom_i_hi   : f64,
    f_nom_i_lo   : f64,
    f_eds        : f64,
    f_ixx        : f64,
    f_t_trans    : f64,
    f_t_air      : f64,
    f_humidity   : f64,
    f_hl         : f64,
    f_ll         : f64,
    f_coef_tabl  : f64,
    f_coef_real  : f64,
    n_oil_admix  : i32,
    oil_level    : String,
    oil_color    : String,
    oil_kvolt    : String,
    rohms        : String,
    f_i_pr       : f64,
    f_i_avr      : f64,
    f_i_xx_a     : f64,
    f_i_xx_b     : f64,
    f_i_xx_c     : f64,
    f_u_xx_a     : f64,
    f_u_xx_b     : f64,
    f_u_xx_c     : f64,
    f_u_lo_a     : f64,
    f_u_lo_b     : f64,
    f_u_lo_c     : f64,
    f_u_hi_a     : f64,
    f_u_hi_b     : f64,
    f_u_hi_c     : f64,
    master       : String,
    operator     : String,
    result       : String,
    comments     : String,
    test_rohms   : String,
    test_hipot   : String,
    rawdata      : Vec<u8>
  }
);
