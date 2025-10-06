import pytest
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import *
from app.config import settings

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

# Test database configuration - Use the same database as the app for testing
# This ensures the test client and tests use the same database
TEST_DATABASE_URL = "sqlite:///./school_management.db"

# Mock the security service and rate limiter to disable rate limiting during tests
@pytest.fixture(scope="session")
def mock_security_service():
    """Mock security service and rate limiter to disable rate limiting during tests"""
    from app.services.security_service import SecurityService
    from app.core.rate_limiting import AdvancedRateLimiter
    
    # Store original methods
    original_check_brute_force = SecurityService.check_brute_force
    original_is_ip_blocked = AdvancedRateLimiter.is_ip_blocked
    original_record_failed_attempt = AdvancedRateLimiter.record_failed_attempt
    
    # Override check_brute_force to always return not blocked
    def mock_check_brute_force(self, username: str, ip_address: str):
        return {
            "is_blocked": False,
            "ip_attempts": 0,
            "user_attempts": 0,
            "max_attempts": 1000,  # High number to avoid blocking
            "lockout_duration": 0
        }
    
    # Override is_ip_blocked to always return False
    def mock_is_ip_blocked(self, ip_address: str):
        return False
    
    # Override record_failed_attempt to do nothing
    def mock_record_failed_attempt(self, ip_address: str, username: str = None):
        pass  # Do nothing during tests
    
    # Apply the mocks
    SecurityService.check_brute_force = mock_check_brute_force
    AdvancedRateLimiter.is_ip_blocked = mock_is_ip_blocked
    AdvancedRateLimiter.record_failed_attempt = mock_record_failed_attempt
    
    yield
    
    # Restore original methods after tests
    SecurityService.check_brute_force = original_check_brute_force
    AdvancedRateLimiter.is_ip_blocked = original_is_ip_blocked
    AdvancedRateLimiter.record_failed_attempt = original_record_failed_attempt

@pytest.fixture(scope="session")
def test_engine():
    """Create test database engine"""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )
    # Create all tables
    Base.metadata.create_all(bind=engine)
    yield engine
    # Clean up after tests
    Base.metadata.drop_all(bind=engine)
    engine.dispose()

@pytest.fixture(scope="function")
def test_db(test_engine):
    """Create a new database session for each test"""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    test_session = session()
    
    yield test_session
    
    test_session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def test_client(mock_security_service):
    """Create a test client for API testing"""
    from app.main import app
    from fastapi.testclient import TestClient
    
    with TestClient(app) as client:
        yield client

@pytest.fixture(scope="function", autouse=True)
def clean_database(test_db):
    """Clean up database between tests"""
    # This will ensure each test starts with a clean database
    yield
    # Rollback is handled by the test_db fixture