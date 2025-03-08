use libsql::Builder;

#[tokio::main]
async fn main() {
    let db = Builder::new_local("data/local33.db").build().await.unwrap();
    let conn = db.connect().unwrap();
    // Create the setting table if it doesn't exist
    match conn.execute("CREATE TABLE IF NOT EXISTS setting (id INTEGER PRIMARY KEY, key TEXT NOT NULL, value TEXT NOT NULL)", ()).await {
        Ok(_) => println!("Table created or already exists"),
        Err(e) => {
            eprintln!("Error creating table: {}", e);
            return;
        }
    };

    // Insert some example rows
    match conn.execute("INSERT INTO setting (key, value) VALUES ('theme', 'dark'), ('language', 'en'), ('notifications', 'enabled')", ()).await {
        Ok(_) => println!("Rows inserted successfully"),
        Err(e) => {
            eprintln!("Error inserting rows: {}", e);
            return;
        }
    };
    // Get list of SQLite modules and print them
    let mut modules = match conn.query("SELECT * FROM pragma_module_list", ()).await {
        Ok(res) => res,
        Err(e) => {
            eprintln!("Error fetching modules: {}", e);
            return;
        }
    };
    // Get list of SQLite modules and print them
    let mut stmt = match conn.prepare("SELECT * FROM pragma_module_list").await {
        Ok(stmt) => stmt,
        Err(e) => {
            eprintln!("Error preparing statement: {}", e);
            return;
        }
    };

    // Execute the prepared statement and fetch the results
    let mut modules_result = match stmt.query(()).await {
        Ok(res) => res,
        Err(e) => {
            eprintln!("Error executing query: {}", e);
            return;
        }
    };

    println!("SQLite modules from prepared statement:");
    while let Ok(Some(row)) = modules_result.next().await {
        let module_name: String = row.get(0).unwrap_or_default();
        println!("- {}", module_name);
    }

    let mut modules = match stmt.query(()).await {
        Ok(res) => res,
        Err(e) => {
            eprintln!("Error fetching modules: {}", e);
            return;
        }
    };

    println!("Available SQLite modules:");
    loop {
        match modules.next().await {
            Ok(Some(row)) => {
                let module_name: String = row.get(0).unwrap_or_default();
                println!("- {}", module_name);
            }
            Ok(None) => break, // No more rows
            Err(e) => {
                eprintln!("Error iterating rows: {}", e);
                break;
            }
        }
    }
}
