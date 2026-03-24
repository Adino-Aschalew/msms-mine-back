<?php
// Database configuration for XAMPP
$host = 'localhost';
$username = 'root';
$password = ''; // XAMPP default is empty password
$database = 'microfinance_system';

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "🔄 Creating performance tables...\n";

// Read and execute the performance schema
$sqlFile = 'performance-schema.sql';
$sql = file_get_contents($sqlFile);

// Split into individual statements and execute
$statements = explode(";", $sql);

foreach ($statements as $index => $statement) {
    $statement = trim($statement);
    if (empty($statement) || strpos($statement, '--') === 0) {
        continue;
    }
    
    echo "Executing statement " . ($index + 1) . "...\n";
    
    if ($conn->query($statement)) {
        echo "✅ Statement " . ($index + 1) . " executed successfully\n";
    } else {
        echo "❌ Error in statement " . ($index + 1) . ": " . $conn->error . "\n";
    }
}

echo "\n🎉 Performance schema creation completed!\n";

// Verify tables were created
echo "\n🔍 Verifying created tables...\n";
$result = $conn->query("SHOW TABLES LIKE 'performance_%'");
$tables = $result->fetch_all(MYSQLI_ASSOC);
echo "Created tables:\n";
foreach ($tables as $table) {
    echo "- " . $table['Tables_in_microfinance_system'] . "\n";
}

// Verify criteria were inserted
$result = $conn->query("SELECT COUNT(*) as count FROM performance_criteria");
$criteria = $result->fetch_assoc();
echo "\nPerformance criteria inserted: " . $criteria['count'] . "\n";

$conn->close();
echo "\n✅ All done!\n";
?>
