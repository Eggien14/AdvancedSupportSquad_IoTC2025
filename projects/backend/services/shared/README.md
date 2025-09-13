# Shared Services Architecture Documentation

## Overview

This document describes the shared services architecture for the Smart Shopping Cart System developed by Advanced Support Squad team for IoT Challenge 2025 "Edge AI for smart retail", co-organized by FPT Software and Silicon Labs. The shared services layer provides the foundational infrastructure for database access, business logic, and configuration management across all system components.

## Architecture Design

The shared services implement a layered architecture pattern with clear separation of concerns and dependency injection principles. The architecture consists of four primary layers working in coordination to provide robust, scalable, and maintainable system foundation.

### Layer Structure

```
API Layer (FastAPI Endpoints)
         ↓
Business Logic Layer (services.py)
         ↓  
Repository Layer (repos.py)
         ↓
Data Access Layer (db.py)
         ↓
Configuration Layer (settings.py)
```

## Core Components

### Configuration Management (settings.py)

**Purpose**: Centralized configuration management with environment-based settings and dependency injection support.

**Key Features**:
- `DatabaseConfig`: Database connection parameters with environment variable support
- `Settings`: Application-wide configuration using Pydantic BaseSettings
- Environment variable integration for Docker deployment
- Secure password handling with secret value wrapper
- Global settings instance management

**Configuration Parameters**:
- Database connectivity: host, port, user, password, database name
- API service configuration: port settings, cache enablement
- Character set enforcement: UTF8MB4 for international support
- Connection timeout and reliability settings

### Data Access Layer (db.py)

**Purpose**: Database connection management with transaction control and error handling.

**Key Features**:
- `get_conn()`: Context manager for database connections with automatic transaction management
- `test_connection()`: Database connectivity validation
- `get_database_info()`: System information retrieval
- PyMySQL integration with UTF8MB4 character set enforcement
- Automatic transaction commit/rollback handling
- Connection pooling and timeout management

**Transaction Management**:
- Automatic commit on successful operations
- Automatic rollback on exceptions
- Connection cleanup in finally blocks
- Error logging and propagation
- SQL mode enforcement for data integrity

### Repository Layer (repos.py)

**Purpose**: Data access abstraction with CRUD operations and domain-specific queries.

**Repository Classes**:

#### ProductRepo
- Product catalog management with comprehensive CRUD operations
- Search functionality: by name, area, type
- Inventory management with decimal precision support
- Stock validation and update operations
- Support for both unit-based and weight-based products

#### CartRepo
- Cart content management with real-time inventory updates
- Multiple update modes: replace, merge, delta operations
- JOIN operations for price calculation and product details
- Inventory synchronization with automatic stock adjustments
- Decimal precision support for weight-based transactions

#### CartConfigRepo
- BLE device configuration management
- Camera streaming endpoint configuration
- MAC address and UUID management for hardware identification
- UPSERT operations for configuration updates

#### MapBeaconRepo
- Indoor positioning system configuration
- Beacon coordinate and calibration management
- RSSI signal strength configuration
- Environmental coefficient settings for positioning accuracy

#### MapRepo
- Grid-based spatial mapping system
- 10x10 coordinate system management
- Area classification and zone management
- Bulk operations for map data updates

### Business Logic Layer (services.py)

**Purpose**: Domain logic implementation with validation, business rules, and error handling.

**Service Classes**:

#### ProductService
- Product lifecycle management with business validation
- Search algorithms with parameter validation
- Inventory business rules and stock management
- Product creation and update with data integrity enforcement

#### CartService
- Shopping cart business logic with discount calculations
- Multi-mode cart operations (replace, merge, delta)
- Real-time total calculation with business rules
- Inventory validation and stock checking

#### CartConfigService
- Hardware configuration management
- BLE service UUID validation and management
- Camera stream endpoint validation

#### MapBeaconService
- Positioning system configuration management
- Beacon calibration and coordinate validation
- Signal strength optimization algorithms

#### MapService
- Spatial data management with grid validation
- Area classification business rules
- Bulk update operations with transaction integrity

## Data Flow Architecture

### Request Processing Flow
1. **API Endpoint** receives HTTP request
2. **Service Layer** validates parameters and applies business rules
3. **Repository Layer** executes database operations
4. **Data Access Layer** manages connections and transactions
5. **Response** returns processed data to client

### Transaction Management
- Connection context managers ensure proper resource cleanup
- Automatic transaction boundaries with commit/rollback handling
- Error propagation with detailed logging
- Connection pooling for performance optimization

### Error Handling Strategy
- Layered exception handling with appropriate HTTP status codes
- Database error recovery with connection retry logic
- Business rule validation with user-friendly error messages
- Logging integration for debugging and monitoring

## Environment Integration

### Docker Compose Integration
The shared services integrate seamlessly with Docker Compose orchestration:

**Environment Variables**:
- `DB_HOST`: Database server hostname
- `DB_PORT`: Database server port (default: 3306)
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `API_PORT`: API service port (default: 8136)
- `CACHE_ENABLED`: Cache enablement flag

**Service Dependencies**:
- Database service health checks
- Network connectivity validation
- Volume mounting for persistent data
- Inter-service communication protocols

### Production Deployment
- Environment-specific configuration management
- Secure credential handling
- Performance optimization settings
- Monitoring and health check endpoints

## Performance Optimizations

### Database Performance
- Connection pooling with configurable timeout settings
- Query optimization with proper indexing strategy
- Transaction batching for bulk operations
- Prepared statement usage for security and performance

### Memory Management
- Context manager pattern for automatic resource cleanup
- Decimal precision handling for financial calculations
- Efficient data serialization for API responses
- Connection lifecycle management

### Scalability Considerations
- Stateless service design for horizontal scaling
- Database connection management for concurrent access
- Caching strategy integration points
- Load balancing compatibility

## Security Implementation

### Data Protection
- SQL injection prevention through parameterized queries
- Input validation at service layer boundaries
- Password security with secret value wrappers
- Character set enforcement for data integrity

### Connection Security
- Secure credential management through environment variables
- Database connection encryption support
- Network-level security through Docker networking
- Access control through service boundaries

## Integration Patterns

### Service Communication
- Clear service boundaries with well-defined interfaces
- Dependency injection for testability and maintainability
- Error handling contracts between layers
- Data transformation consistency across services

### External System Integration
- Database vendor abstraction through PyMySQL
- Configuration management for multiple environments
- Monitoring and health check integration points
- Logging infrastructure compatibility

## Deployment Architecture

The shared services layer supports multiple deployment scenarios:

### Development Environment
- Local database connectivity
- Debug logging configuration
- Hot reload compatibility
- Test data initialization support

### Production Environment
- Container orchestration through Docker Compose
- Environment variable configuration
- Health monitoring integration
- Backup and recovery support

### Testing Environment
- Mock service integration
- Test database isolation
- Automated testing support
- Performance benchmarking capabilities

## Input/Output Specifications

### Service Interface Contracts

The shared services layer exposes well-defined interfaces for data exchange between system components. All operations follow consistent patterns for error handling, data validation, and response formatting.

### Data Access Layer Interfaces

#### Database Connection Context
**Input Parameters**:
- Connection configuration from environment variables
- Transaction isolation requirements
- Query timeout specifications

**Output Format**:
- PyMySQL connection object with UTF8MB4 character set
- Automatic transaction management (commit/rollback)
- Error propagation with detailed logging

### Repository Layer Data Formats

#### Product Operations
**Input Specifications**:
```python
# Product creation/update
{
    "product_name": "string",
    "product_type": "string", 
    "area": "string",
    "price": "decimal(10,2)",
    "quantity": "decimal(10,3)",
    "weight_kg": "decimal(8,3)"
}
```

**Output Specifications**:
```python
# Product response
{
    "product_id": "integer",
    "name": "string",
    "type": "string",
    "area": "string", 
    "price": "decimal",
    "quantity": "decimal",
    "weight_kg": "decimal"
}
```

#### Cart Operations
**Input Specifications**:
```python
# Cart item updates
{
    "mode": "replace|merge|delta",
    "items": [
        {
            "product_id": "integer",
            "quantity": "decimal(10,3)"
        }
    ]
}
```

**Output Specifications**:
```python
# Cart response with totals
{
    "cart_id": "integer",
    "items": [
        {
            "product_id": "integer",
            "name": "string",
            "quantity": "decimal",
            "price": "decimal",
            "subtotal": "decimal"
        }
    ],
    "total": "decimal",
    "final_total": "decimal",
    "total_items": "integer"
}
```

### Service Layer Response Formats

#### Success Response Pattern
```python
{
    "status": "success",
    "data": {},  # Service-specific data
    "message": "Operation completed successfully"
}
```

#### Error Response Pattern
```python
{
    "status": "error",
    "error_code": "string",
    "message": "string",
    "details": {}  # Optional error context
}
```

### Configuration Data Formats

#### Database Configuration
**Environment Variables**:
- `DB_HOST`: Database hostname (string)
- `DB_PORT`: Database port (integer, default: 3306)
- `DB_USER`: Database username (string)
- `DB_PASSWORD`: Database password (string)
- `DB_NAME`: Database name (string)

#### API Configuration
**Environment Variables**:
- `API_PORT`: API service port (integer, default: 8136)
- `CACHE_ENABLED`: Cache enablement (boolean, default: false)

### Data Validation Standards

#### Decimal Precision Requirements
- Price fields: DECIMAL(10,2) - supports up to 99,999,999.99
- Quantity fields: DECIMAL(10,3) - supports fractional quantities for weight-based items
- Weight fields: DECIMAL(8,3) - supports precise weight measurements

#### Character Set Requirements
- All text fields: UTF8MB4 encoding for international character support
- Database collation: utf8mb4_unicode_ci for proper sorting and comparison
- API responses: UTF-8 encoding with proper Content-Type headers

This shared services architecture provides the robust foundation necessary for the Smart Shopping Cart System's advanced IoT and AI capabilities while maintaining high standards of code quality, performance, and maintainability.
