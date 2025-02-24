use std::cell::OnceCell;
use std::collections::HashMap;
use tauri::{Manager, State};
use usearch::{new_index, Index, IndexOptions, MetricKind, ScalarKind};

const COLOR_INDEX: OnceCell<Index> = OnceCell::new();

fn load_similar_colors(path: &str) -> Index {
    let options = IndexOptions {
        dimensions: 3,
        metric: MetricKind::L2sq,
        quantization: ScalarKind::F16,
        connectivity: 0,
        expansion_add: 0,
        expansion_search: 0,
        multi: false,
    };
    let index = new_index(&options).unwrap();
    index.load(path).unwrap();
    index
}

struct AppData {
    colors: HashMap<u64, Vec<i32>>,
}

#[tauri::command]
fn similar_colors(
    state: State<'_, AppData>,
    handle: tauri::AppHandle,
    query: Vec<f64>,
) -> Vec<String> {
    let res = COLOR_INDEX
        .get_or_init(|| {
            let resource_path = handle
                .path()
                .resolve(
                    "resources/index.usearch.colors.mini",
                    tauri::path::BaseDirectory::Resource,
                )
                .unwrap();
            load_similar_colors(resource_path.to_str().unwrap())
        })
        .search(&query, 48)
        .unwrap();

    let mut similar = Vec::new();
    for id in res.keys {
        let color = state.colors.get(&id).unwrap().to_owned();
        let rgb = "rgb(".to_owned()
            + &color[0].to_string()
            + ","
            + &color[1].to_string()
            + ","
            + &color[2].to_string()
            + ")";
        similar.push(rgb);
    }
    similar
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let resource_path = app.path().resolve(
                "resources/color_codes",
                tauri::path::BaseDirectory::Resource,
            )?;

            let data = std::fs::read(resource_path).unwrap();
            let colors: HashMap<u64, Vec<i32>> = bincode::deserialize(&data).unwrap();
            app.manage(AppData { colors });
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![similar_colors])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
