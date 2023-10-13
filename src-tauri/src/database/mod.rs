extern crate rusqlite_helper;
pub mod models_tmpn;

use std::fmt::Debug;

use rusqlite_helper::reading::{read_where, read_table, read_table_where};
use rusqlite_helper::writing::{write, write_table};
use rusqlite_helper::deleting::{delete, delete_table};
use models_tmpn::{Records, TLRow, Dictionary};


#[tauri::command]
pub fn read_testlist(db_path: &str, condition: &str) -> Vec<TLRow> {
  let result = read_table_where::<TLRow>(db_path, "Records", condition);
  _check_vec::<TLRow>(result, "RecordList")
}

#[tauri::command]
pub fn read_record(db_path: &str, rec_id: i32) -> Vec<Records> {
  let cond = format!("ID={}", rec_id);
  let result = read_where::<Records>(db_path, cond.as_str());
  _check_vec::<Records>(result, format!("Record {}", &rec_id).as_str())
}
#[tauri::command]
pub fn write_record(db_path: &str, record: Records) -> usize {
  let mut result = write(db_path, &record);
  if let Some(recid) = record.id {
    result = Ok(recid as usize);
  }
  _check_usize(result, ["Record","write"])
}
#[tauri::command]
pub fn delete_record(db_path: &str, record: Records) -> usize {
  let result = delete(db_path, &record);
  _check_usize(result, ["Record","delete"])
}

#[tauri::command]
pub fn read_dictionary(db_path: &str, table: &str) -> Vec<Dictionary> {
  let result = read_table::<Dictionary>(db_path, &table);
  _check_vec::<Dictionary>(result, format!("dictionary {}", &table).as_str())
}
#[tauri::command]
pub fn write_dictionary(db_path: &str, table: &str, dict: Dictionary) -> usize {
  let result = write_table::<Dictionary>(db_path, table, &dict);
  _check_usize(result, ["Dictionary","write"])
}
#[tauri::command]
pub fn delete_dictionary(db_path: &str, table: &str, dict: Dictionary) -> usize {
  let result = delete_table::<Dictionary>(db_path, table, &dict);
  _check_usize(result, ["Dictionary","delete"])
}


fn _check_usize(result_to_check: Result<usize, rusqlite::Error>, message: [&str;2]) -> usize {
  match result_to_check {
    Ok(result) => {
      println!("{} {} {} {}",
        message[0],
        result,
        message[1],
        if result > 0 { "successfully" } else { "failed" }
      ); 
      return result;
    },
    Err(err) => {
      println!("Error executing query >> {:?}", err);
      return 0;
    }
  }
}
fn _check_vec<T: Debug>(result_to_check: Result<Vec<T>, rusqlite::Error>, message: &str) -> Vec<T> {
  if result_to_check.is_ok() {
    println!("Loading {} successfully", message);
    result_to_check.unwrap()
  } else {
    println!("Loading {} failed: {:?}", message, result_to_check.unwrap_err());
    Vec::new()
  }
}