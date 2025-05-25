<?php
namespace Tests;

use PHPUnit\Framework\TestCase;
use PDO;

class LoginTest extends TestCase 
{
    private PDO $pdo;
    private string $dbName = 'scoring_system_test';
    
    protected function setUp(): void 
    {
        // Start output buffering
        ob_start();
        
        // Create test database
        $rootPdo = new PDO("mysql:host=localhost", "root", "1234");
        $rootPdo->exec("DROP DATABASE IF EXISTS {$this->dbName}");
        $rootPdo->exec("CREATE DATABASE {$this->dbName}");
        
        // Connect to test database
        $this->pdo = new PDO("mysql:host=localhost;dbname={$this->dbName}", "root", "1234");
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Create schema and test data
        $this->createSchema();
        $this->setupTestData();

        // Reset request data
        $_SERVER = [];
        $_POST = [];
        $_GET = [];
    }

    private function createSchema(): void 
    {
        $this->pdo->exec("
            CREATE TABLE roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE
            );
            
            CREATE TABLE judges (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                display_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role_id INT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (role_id) REFERENCES roles(id)
            );
            
            CREATE TABLE tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                judge_id INT NOT NULL,
                token VARCHAR(255) NOT NULL UNIQUE,
                refresh_token VARCHAR(255) UNIQUE,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (judge_id) REFERENCES judges(id)
            );
        ");
    }

    private function setupTestData(): void 
    {
        $password_hash = password_hash('test123', PASSWORD_DEFAULT);
        $this->pdo->exec("
            INSERT INTO roles (id, name) VALUES 
            (1, 'admin'),
            (2, 'judge');

            INSERT INTO judges (email, username, display_name, password_hash, role_id, is_active) VALUES 
            ('admin@example.com', 'admin', 'Admin User', '$password_hash', 1, true),
            ('test@example.com', 'testjudge', 'Test Judge', '$password_hash', 2, true),
            ('inactive@example.com', 'inactive', 'Inactive Judge', '$password_hash', 2, false)
        ");
    }

    public function testOptionsRequest(): void 
    {
        $_SERVER['REQUEST_METHOD'] = 'OPTIONS';
        require __DIR__ . '/../api/login.php';
        $headers = xdebug_get_headers();
        ob_clean();
        
        $this->assertEquals(200, http_response_code());
        $this->assertContains('Access-Control-Allow-Origin: http://localhost:3000', $headers);
        $this->assertContains('Access-Control-Allow-Methods: POST, OPTIONS', $headers);
    }

    public function testInvalidMethod(): void 
    {
        $_SERVER['REQUEST_METHOD'] = 'GET';
        require __DIR__ . '/../api/login.php';
        $response = json_decode(ob_get_clean(), true);
        
        $this->assertEquals(405, http_response_code());
        $this->assertEquals('Method not allowed', $response['error']);
    }

    public function testMissingCredentials(): void 
    {
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['CONTENT_TYPE'] = 'application/json';
        
        require __DIR__ . '/../api/login.php';
        $response = json_decode(ob_get_clean(), true);
        
        $this->assertEquals(400, http_response_code());
        $this->assertEquals('Email and password are required', $response['error']);
    }

    public function testInvalidCredentials(): void 
    {
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['CONTENT_TYPE'] = 'application/json';
        
        file_put_contents('php://input', json_encode([
            'email' => 'test@example.com',
            'password' => 'wrongpass'
        ]));
        
        require __DIR__ . '/../api/login.php';
        $response = json_decode(ob_get_clean(), true);
        
        $this->assertEquals(401, http_response_code());
        $this->assertEquals('Invalid credentials', $response['error']);
    }

    public function testInactiveUser(): void 
    {
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['CONTENT_TYPE'] = 'application/json';
        
        file_put_contents('php://input', json_encode([
            'email' => 'inactive@example.com',
            'password' => 'test123'
        ]));
        
        require __DIR__ . '/../api/login.php';
        $response = json_decode(ob_get_clean(), true);
        
        $this->assertEquals(401, http_response_code());
        $this->assertEquals('Account is inactive', $response['error']);
    }

    public function testSuccessfulLogin(): void 
    {
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['CONTENT_TYPE'] = 'application/json';
        
        file_put_contents('php://input', json_encode([
            'email' => 'test@example.com',
            'password' => 'test123'
        ]));
        
        require __DIR__ . '/../api/login.php';
        $response = json_decode(ob_get_clean(), true);
        
        $this->assertEquals(200, http_response_code());
        $this->assertTrue($response['success']);
        $this->assertArrayHasKey('token', $response);
        $this->assertArrayHasKey('refresh_token', $response);
        $this->assertEquals('judge', $response['user']['role']);
        
        // Verify token was stored in database
        $stmt = $this->pdo->prepare('SELECT * FROM tokens WHERE judge_id = ?');
        $stmt->execute([$response['user']['id']]);
        $token = $stmt->fetch();
        
        $this->assertNotEmpty($token);
        $this->assertEquals($response['token'], $token['token']);
    }

    protected function tearDown(): void 
    {
        if ($this->pdo) {
            // Clean up test data
            $this->pdo->exec("DROP DATABASE IF EXISTS {$this->dbName}");
            $this->pdo = null;
        }
        
        // Clean output buffer
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
    }
}