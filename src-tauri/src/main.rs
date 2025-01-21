#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Serialize, Deserialize};
use walkdir::WalkDir;
use std::{ffi::OsStr, path::{Path, PathBuf}, time::{SystemTime, UNIX_EPOCH}};
use tauri::Manager;
use std::fs;
use std::sync::Arc;
use tokio::sync::Mutex;
use tron::{TronTemplate, TronRef, TronAssembler};
use std::collections::HashMap;

// Existing file system structs
#[derive(Debug, Serialize, Deserialize)]
pub struct FileEntry {
    name: String,
    path: String,
    entry_type: String,
}

#[derive(Debug, Serialize)]
pub struct FileContent {
    content: String,
    language: String,
}

#[derive(Debug, Serialize)]
pub struct FileError {
    message: String,
    code: String,
}

// Blueprint structs
#[derive(Debug, Serialize, Deserialize)]
pub struct NodeType {
    pub type_name: String,
    pub title: String,
    pub color: String,
    pub inputs: Vec<String>,
    pub outputs: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Node {
    pub id: String,
    pub node_type: String,
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Connection {
    pub id: String,
    pub source_id: String,
    pub source_port: String,
    pub target_id: String,
    pub target_port: String,
}

// Blueprint runtime structure
#[derive(Debug)]
pub struct Blueprint {
    nodes: HashMap<String, Node>,
    connections: HashMap<String, Connection>,
    templates: HashMap<String, TronRef>,
    output_path: PathBuf,
}

// Existing commands
#[tauri::command]
async fn execute_command(command: String) -> Result<String, String> {
    let output = std::process::Command::new("sh")
        .arg("-c")
        .arg(&command)
        .output()
        .map_err(|e| e.to_string())?;
    
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn on_button_clicked() -> String {
    let start = SystemTime::now();
    let since_the_epoch = start
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_millis();
    format!("on_button_clicked called from Rust! (timestamp: {since_the_epoch}ms)")
}

// File system commands
#[tauri::command]
fn get_directory_structure(path: &str) -> Result<Vec<FileEntry>, String> {
    let root = Path::new(path);
    if !root.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    let mut entries = Vec::new();

    for entry in WalkDir::new(root).min_depth(1).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        let file_name = path.file_name().unwrap_or_default().to_string_lossy();

        // Skip hidden files and directories
        if file_name.starts_with('.') {
            continue;
        }

        let relative_path = path.strip_prefix(root).unwrap_or(path);
        let entry_type = if path.is_dir() { "directory" } else { "file" };

        entries.push(FileEntry {
            name: file_name.into_owned(),
            path: relative_path.to_string_lossy().into_owned(),
            entry_type: entry_type.to_string(),
        });
    }

    Ok(entries)
}

#[tauri::command]
async fn read_file_content(path: String) -> Result<FileContent, String> {
    let path = PathBuf::from(path);
    
    // Read file extension
    let extension = path
        .extension()
        .and_then(OsStr::to_str)
        .unwrap_or("")
        .to_lowercase();

    // Determine if this is a binary file that needs base64 encoding
    let is_binary = matches!(
        extension.as_str(),
        "png" | "jpg" | "jpeg" | "gif" | "webp" | "bmp" |
        "glb" | "gltf" | "obj" | "fbx" | "stl"
    );

    if is_binary {
        // Read binary content and encode as base64
        let content = fs::read(&path)
            .map_err(|e| e.to_string())?;
        let base64_content = base64::encode(content);
        
        Ok(FileContent {
            content: base64_content,
            language: String::from("binary"),
        })
    } else {
        // Handle text files as before
        let content = fs::read_to_string(&path)
            .map_err(|e| e.to_string())?;
            
        // Determine language based on extension
        let language = match extension.as_str() {
            "js" | "jsx" => "javascript",
            "ts" | "tsx" => "typescript",
            "rs" => "rust",
            // ... add other mappings
            _ => "plaintext",
        };

        Ok(FileContent {
            content,
            language: String::from(language),
        })
    }
}

#[tauri::command]
async fn save_file_content(path: String, content: String) -> Result<(), FileError> {
    match fs::write(&path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(FileError {
            message: e.to_string(),
            code: "WRITE_ERROR".to_string(),
        })
    }
}

#[tauri::command]
async fn create_file(path: String) -> Result<(), FileError> {
    match fs::File::create(&path) {
        Ok(_) => Ok(()),
        Err(e) => Err(FileError {
            message: e.to_string(),
            code: "CREATE_ERROR".to_string(),
        })
    }
}

#[tauri::command]
async fn create_directory(path: String) -> Result<(), FileError> {
    match fs::create_dir_all(&path) {
        Ok(_) => Ok(()),
        Err(e) => Err(FileError {
            message: e.to_string(),
            code: "CREATE_DIR_ERROR".to_string(),
        })
    }
}

#[tauri::command]
async fn delete_path(path: String) -> Result<(), FileError> {
    let path = Path::new(&path);
    if path.is_dir() {
        match fs::remove_dir_all(path) {
            Ok(_) => Ok(()),
            Err(e) => Err(FileError {
                message: e.to_string(),
                code: "DELETE_ERROR".to_string(),
            })
        }
    } else {
        match fs::remove_file(path) {
            Ok(_) => Ok(()),
            Err(e) => Err(FileError {
                message: e.to_string(),
                code: "DELETE_ERROR".to_string(),
            })
        }
    }
}

// Helper functions
fn get_file_language(path: &str) -> String {
    let extension = Path::new(path)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("");

    match extension.to_lowercase().as_str() {
        "rs" => "rust",
        "js" => "javascript",
        "jsx" => "javascript",
        "ts" => "typescript",
        "tsx" => "typescript",
        "py" => "python",
        "json" => "json",
        "md" => "markdown",
        "css" => "css",
        "html" => "html",
        "xml" => "xml",
        "yaml" | "yml" => "yaml",
        _ => "plaintext",
    }.to_string()
}

fn is_hidden(path: &Path) -> bool {
    path.file_name()
        .and_then(|name| name.to_str())
        .map(|name| name.starts_with('.'))
        .unwrap_or(false)
}

impl Blueprint {
    pub fn new(output_path: PathBuf) -> Self {
        let mut bp = Blueprint {
            nodes: HashMap::new(),
            connections: HashMap::new(),
            templates: HashMap::new(),
            output_path,
        };
        bp.initialize_templates();
        bp
    }

    fn initialize_templates(&mut self) {
        // Event template
        let event_template = TronTemplate::new(r#"
            #[tauri::command]
            pub async fn @[event_name]@(state: tauri::State<'_, BlueprintState>) -> Result<(), String> {
                @[next_node]@
                Ok(())
            }
        "#).unwrap();
        self.templates.insert("EVENT".to_string(), TronRef::new(event_template));

        // Branch template
        let branch_template = TronTemplate::new(r#"
            if @[condition]@ {
                @[true_branch]@
            } else {
                @[false_branch]@
            }
        "#).unwrap();
        self.templates.insert("BRANCH".to_string(), TronRef::new(branch_template));

        // Print template
        let print_template = TronTemplate::new(r#"
            println!("{}", @[message]@);
            @[next_node]@
        "#).unwrap();
        self.templates.insert("PRINT".to_string(), TronRef::new(print_template));

        // Variable template
        let variable_template = TronTemplate::new(r#"
            state.variables.lock().await.get("@[variable_name]@").cloned().unwrap_or_default()
        "#).unwrap();
        self.templates.insert("VARIABLE".to_string(), TronRef::new(variable_template));

        // Math template
        let math_template = TronTemplate::new(r#"
            (@[operand_a]@ @[operator]@ @[operand_b]@)
        "#).unwrap();
        self.templates.insert("MATH".to_string(), TronRef::new(math_template));

        // Delay template
        let delay_template = TronTemplate::new(r#"
            tokio::time::sleep(tokio::time::Duration::from_secs_f64(@[duration]@)).await;
            @[next_node]@
        "#).unwrap();
        self.templates.insert("DELAY".to_string(), TronRef::new(delay_template));
    }

    pub fn add_node(&mut self, node: Node) {
        self.nodes.insert(node.id.clone(), node);
    }

    pub fn add_connection(&mut self, connection: Connection) {
        self.connections.insert(connection.id.clone(), connection);
    }

    pub fn generate_code(&self) -> Result<String, Box<dyn std::error::Error>> {
        let mut assembler = TronAssembler::new();
        
        // Generate imports and state structure
        // Generate the complete module structure with imports and state management
        let imports_template = TronTemplate::new(r#"
            use tauri;
            use tokio;
            use serde::{Serialize, Deserialize};
            use std::sync::Arc;
            use tokio::sync::Mutex;
            use std::collections::HashMap;
            use std::time::Duration;

            // State management for blueprint execution
            #[derive(Debug, Clone, Serialize, Deserialize)]
            pub struct Variable {
                name: String,
                value: String,
                var_type: String,
            }

            pub struct BlueprintState {
                variables: Arc<Mutex<HashMap<String, Variable>>>,
                execution_context: Arc<Mutex<ExecutionContext>>,
            }

            pub struct ExecutionContext {
                running: bool,
                paused: bool,
                current_node: Option<String>,
                error: Option<String>,
            }

            impl ExecutionContext {
                pub fn new() -> Self {
                    Self {
                        running: false,
                        paused: false,
                        current_node: None,
                        error: None,
                    }
                }

                pub fn start(&mut self) {
                    self.running = true;
                    self.paused = false;
                    self.error = None;
                }

                pub fn pause(&mut self) {
                    self.paused = true;
                }

                pub fn resume(&mut self) {
                    self.paused = false;
                }

                pub fn stop(&mut self) {
                    self.running = false;
                    self.paused = false;
                    self.current_node = None;
                }

                pub fn set_error(&mut self, error: String) {
                    self.error = Some(error);
                    self.stop();
                }
            }

            impl BlueprintState {
                pub fn new() -> Self {
                    Self {
                        variables: Arc::new(Mutex::new(HashMap::new())),
                        execution_context: Arc::new(Mutex::new(ExecutionContext::new())),
                    }
                }

                pub async fn set_variable(&self, name: &str, value: Variable) {
                    let mut vars = self.variables.lock().await;
                    vars.insert(name.to_string(), value);
                }

                pub async fn get_variable(&self, name: &str) -> Option<Variable> {
                    let vars = self.variables.lock().await;
                    vars.get(name).cloned()
                }

                pub async fn start_execution(&self) -> Result<(), String> {
                    let mut context = self.execution_context.lock().await;
                    context.start();
                    Ok(())
                }

                pub async fn pause_execution(&self) -> Result<(), String> {
                    let mut context = self.execution_context.lock().await;
                    context.pause();
                    Ok(())
                }

                pub async fn stop_execution(&self) -> Result<(), String> {
                    let mut context = self.execution_context.lock().await;
                    context.stop();
                    Ok(())
                }
            }

            // Error handling for blueprint execution
            #[derive(Debug, Serialize)]
            pub struct BlueprintError {
                message: String,
                node_id: Option<String>,
                error_type: String,
            }

            impl BlueprintError {
                pub fn new(message: &str, node_id: Option<String>, error_type: &str) -> Self {
                    Self {
                        message: message.to_string(),
                        node_id,
                        error_type: error_type.to_string(),
                    }
                }
            }
        "#)?;
        assembler.add_template(TronRef::new(imports_template));

        // Generate code for each node
        for (node_id, node) in &self.nodes {
            let template = self.templates.get(&node.node_type).ok_or("Unknown node type")?;
            let mut node_ref = template.clone();

            match node.node_type.as_str() {
                "EVENT" => {
                    node_ref.set("event_name", &format!("event_{}", node_id))?;
                    if let Some(next_node) = self.find_connected_node(node_id, "Exec") {
                        node_ref.set("next_node", &self.generate_node_code(&next_node)?)?;
                    }
                }
                "BRANCH" => {
                    if let Some(condition_node) = self.find_input_node(node_id, "Condition") {
                        node_ref.set("condition", &self.generate_node_code(&condition_node)?)?;
                    }
                    if let Some(true_node) = self.find_connected_node(node_id, "True") {
                        node_ref.set("true_branch", &self.generate_node_code(&true_node)?)?;
                    }
                    if let Some(false_node) = self.find_connected_node(node_id, "False") {
                        node_ref.set("false_branch", &self.generate_node_code(&false_node)?)?;
                    }
                }
                "PRINT" => {
                    let mut node_ref = template.clone();
                    if let Some(message_node) = self.find_input_node(node_id, "String") {
                        node_ref.set("message", &self.generate_node_code(&message_node)?)?;
                    }
                    if let Some(next_node) = self.find_connected_node(node_id, "Exec") {
                        node_ref.set("next_node", &self.generate_node_code(&next_node)?)?;
                    }
                },
                "VARIABLE" => {
                    let mut node_ref = template.clone();
                    node_ref.set("variable_name", &format!("var_{}", node_id))?;
                },
                "MATH" => {
                    let mut node_ref = template.clone();
                    if let Some(a_node) = self.find_input_node(node_id, "A") {
                        node_ref.set("operand_a", &self.generate_node_code(&a_node)?)?;
                    }
                    if let Some(b_node) = self.find_input_node(node_id, "B") {
                        node_ref.set("operand_b", &self.generate_node_code(&b_node)?)?;
                    }
                    node_ref.set("operator", "+")?;
                },
                "DELAY" => {
                    let mut node_ref = template.clone();
                    if let Some(duration_node) = self.find_input_node(node_id, "Duration") {
                        node_ref.set("duration", &self.generate_node_code(&duration_node)?)?;
                    }
                    if let Some(next_node) = self.find_connected_node(node_id, "Exec") {
                        node_ref.set("next_node", &self.generate_node_code(&next_node)?)?;
                    }
                },
                _ => {}
            }

            assembler.add_template(node_ref);
        }

        Ok(assembler.render_all()?)
    }

    fn find_connected_node(&self, node_id: &str, port: &str) -> Option<String> {
        self.connections.values()
            .find(|conn| conn.source_id == node_id && conn.source_port == port)
            .map(|conn| conn.target_id.clone())
    }

    fn find_input_node(&self, node_id: &str, port: &str) -> Option<String> {
        self.connections.values()
            .find(|conn| conn.target_id == node_id && conn.target_port == port)
            .map(|conn| conn.source_id.clone())
    }

    fn generate_node_code(&self, node_id: &str) -> Result<String, Box<dyn std::error::Error>> {
        let node = self.nodes.get(node_id).ok_or("Node not found")?;
        let template = self.templates.get(&node.node_type).ok_or("Template not found")?;
        
        match node.node_type.as_str() {
            "PRINT" => {
                let mut node_ref = template.clone();
                if let Some(message_node) = self.find_input_node(node_id, "String") {
                    node_ref.set("message", &self.generate_node_code(&message_node)?)?;
                }
                if let Some(next_node) = self.find_connected_node(node_id, "Exec") {
                    node_ref.set("next_node", &self.generate_node_code(&next_node)?)?;
                }
                Ok(node_ref.render()?)
            }
            "VARIABLE" => {
                let mut node_ref = template.clone();
                node_ref.set("variable_name", &format!("var_{}", node_id))?;
                Ok(node_ref.render()?)
            }
            "MATH" => {
                let mut node_ref = template.clone();
                let mut expression = String::new();
                
                if let Some(a_node) = self.find_input_node(node_id, "A") {
                    expression.push_str(&self.generate_node_code(&a_node)?);
                } else {
                    expression.push_str("0.0");
                }
                
                expression.push_str(" + "); // Default to addition
                
                if let Some(b_node) = self.find_input_node(node_id, "B") {
                    expression.push_str(&self.generate_node_code(&b_node)?);
                } else {
                    expression.push_str("0.0");
                }
                
                node_ref.set("expression", &expression)?;
                Ok(node_ref.render()?)
            }
            "DELAY" => {
                let mut node_ref = template.clone();
                if let Some(duration_node) = self.find_input_node(node_id, "Duration") {
                    node_ref.set("duration", &self.generate_node_code(&duration_node)?)?;
                } else {
                    node_ref.set("duration", "1.0")?; // Default delay of 1 second
                }
                if let Some(next_node) = self.find_connected_node(node_id, "Exec") {
                    node_ref.set("next_node", &self.generate_node_code(&next_node)?)?;
                }
                Ok(node_ref.render()?)
            }
            _ => Ok(String::new())
        }
    }

    pub fn save_generated_code(&self) -> Result<(), Box<dyn std::error::Error>> {
        let code = self.generate_code()?;
        fs::write(&self.output_path, code)?;
        Ok(())
    }
}

// Blueprint state management
pub struct BlueprintState {
    blueprint: Arc<Mutex<Blueprint>>,
}

// Blueprint commands
#[tauri::command]
async fn create_blueprint(state: tauri::State<'_, BlueprintState>, output_path: String) -> Result<(), String> {
    let mut blueprint = Blueprint::new(PathBuf::from(output_path));
    *state.blueprint.lock().await = blueprint;
    Ok(())
}

#[tauri::command]
async fn add_blueprint_node(state: tauri::State<'_, BlueprintState>, node: Node) -> Result<(), String> {
    state.blueprint.lock().await.add_node(node);
    Ok(())
}

#[tauri::command]
async fn add_blueprint_connection(state: tauri::State<'_, BlueprintState>, connection: Connection) -> Result<(), String> {
    state.blueprint.lock().await.add_connection(connection);
    Ok(())
}

#[tauri::command]
async fn generate_blueprint_code(state: tauri::State<'_, BlueprintState>) -> Result<String, String> {
    state.blueprint.lock().await
        .generate_code()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_blueprint(state: tauri::State<'_, BlueprintState>) -> Result<(), String> {
    state.blueprint.lock().await
        .save_generated_code()
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
fn main() {
    let blueprint_state = BlueprintState {
        blueprint: Arc::new(Mutex::new(Blueprint::new(PathBuf::from("output.rs")))),
    };

    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            window.set_decorations(false).unwrap();
            Ok(())
        })
        .manage(blueprint_state)
        .invoke_handler(tauri::generate_handler![
            // Existing commands
            execute_command,
            on_button_clicked,
            get_directory_structure,
            read_file_content,
            save_file_content,
            create_file,
            create_directory,
            delete_path,
            // Blueprint commands
            create_blueprint,
            add_blueprint_node,
            add_blueprint_connection,
            generate_blueprint_code,
            save_blueprint
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}