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
    ordernum     : String,
    field        : String,
    cluster      : String,
    well         : String,
    serial       : String,
    name         : String,
    switches     : String,
    n_connection : i32,
    f_power      : f64,
    f_u_high     : f64,
    f_u_low      : f64,
    f_i_high     : f64,
    f_i_low      : f64,
    f_eds        : f64,
    f_ixx        : f64,
    f_t_trans    : f64,
    f_t_air      : f64,
    f_humidity   : f64,
    f_hl         : f64,
    f_ll         : f64,
    f_coef_real  : f64,
    f_coef_tab   : f64,
    oil_level    : String,
    oil_color    : String,
    oil_admix    : String,
    oil_kvolt    : String,
    rohms        : String,
    f_uab        : f64,
    f_ubc        : f64,
    f_uca        : f64,
    f_u_ab       : f64,
    f_u_bc       : f64,
    f_u_ca       : f64,
    f_i_a        : f64,
    f_i_b        : f64,
    f_i_c        : f64,
    f_i_avr      : f64,
    f_i_pr       : f64,
    master       : String,
    operator     : String,
    result       : String,
    comments     : String,
    test_rohms   : String,
    test_hipot   : String,
    rawdata      : Vec<u8>
  }
);
