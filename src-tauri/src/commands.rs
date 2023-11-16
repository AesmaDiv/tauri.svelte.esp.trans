#[tauri::command]
/// логирование - вывод строки в консоль
pub fn logging(message: String) {
  let msg = format!("Logging:: {}", message);
  println!("{}", msg);
}
#[tauri::command]
/// проверка существования файла
pub fn file_exists(path: String) -> bool {
  let result = std::path::Path::new(&path).exists();
  println!("File {} {}exists", &path, if result {""} else {"not "});

  return result;
}