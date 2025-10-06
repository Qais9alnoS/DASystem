#!/usr/bin/env python3
"""
Comprehensive Test Runner for School Management System
This script runs all tests and generates a detailed report.
"""

import subprocess
import sys
import os
from datetime import datetime

def run_tests():
    """Run all tests and generate report"""
    print("🚀 Starting Comprehensive Test Suite for School Management System")
    print("=" * 70)
    print(f"🕒 Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    # Change to the backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), "..")
    os.chdir(backend_dir)
    
    # Test files to run
    test_files = [
        "tests/test_database_models.py",
        "tests/test_authentication_security.py",
        "tests/test_student_management.py",
        "tests/test_teacher_management.py",
        "tests/test_academic_management.py",
        "tests/test_financial_system.py",
        "tests/test_activity_management.py",
        "tests/test_scheduling_system.py",
        "tests/test_search.py",
        "tests/test_director_dashboard.py",
        "tests/test_complete_system.py"
    ]
    
    results = []
    total_tests = 0
    total_passed = 0
    total_failed = 0
    
    for test_file in test_files:
        print(f"\n🧪 Running tests in {test_file}")
        print("-" * 50)
        
        try:
            # Run pytest on the specific file
            result = subprocess.run([
                sys.executable, "-m", "pytest", 
                test_file, 
                "-v", 
                "--tb=short"
            ], capture_output=True, text=True, timeout=300)
            
            # Parse the results
            output = result.stdout
            error_output = result.stderr
            
            # Count tests
            passed = output.count("PASSED")
            failed = output.count("FAILED")
            errors = output.count("ERROR")
            
            total_tests += passed + failed + errors
            total_passed += passed
            total_failed += failed + errors
            
            # Store results
            results.append({
                "file": test_file,
                "passed": passed,
                "failed": failed,
                "errors": errors,
                "return_code": result.returncode,
                "output": output,
                "error_output": error_output
            })
            
            # Print summary
            status = "✅ PASS" if result.returncode == 0 else "❌ FAIL"
            print(f"   Status: {status}")
            print(f"   Passed: {passed}, Failed: {failed}, Errors: {errors}")
            
            if result.returncode != 0:
                print(f"   Error: {error_output[:200]}..." if len(error_output) > 200 else f"   Error: {error_output}")
                
        except subprocess.TimeoutExpired:
            print("   ❌ TIMEOUT - Test took too long to complete")
            results.append({
                "file": test_file,
                "passed": 0,
                "failed": 0,
                "errors": 1,
                "return_code": -1,
                "output": "",
                "error_output": "Test timeout"
            })
            total_failed += 1
            
        except Exception as e:
            print(f"   ❌ ERROR - {str(e)}")
            results.append({
                "file": test_file,
                "passed": 0,
                "failed": 0,
                "errors": 1,
                "return_code": -1,
                "output": "",
                "error_output": str(e)
            })
            total_failed += 1
    
    # Print final summary
    print("\n" + "=" * 70)
    print("📊 FINAL TEST RESULTS SUMMARY")
    print("=" * 70)
    print(f"🕒 End time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📈 Total test files: {len(test_files)}")
    print(f"✅ Total tests passed: {total_passed}")
    print(f"❌ Total tests failed: {total_failed}")
    print(f"📋 Total tests executed: {total_tests}")
    
    if total_tests > 0:
        success_rate = (total_passed / total_tests) * 100
        print(f"🎯 Success rate: {success_rate:.1f}%")
    
    # Overall status
    if total_failed == 0:
        print("\n🎉 ALL TESTS PASSED! The system is ready for production.")
        print("✅ School Management System backend is fully functional and tested.")
        return True
    else:
        print(f"\n⚠️  {total_failed} test(s) failed. Please review the errors above.")
        print("❌ System requires fixes before production deployment.")
        return False

def generate_detailed_report(results):
    """Generate a detailed test report"""
    report_file = os.path.join(os.path.dirname(__file__), "test_results_report.md")
    
    with open(report_file, "w", encoding="utf-8") as f:
        f.write("# School Management System - Test Results Report\n")
        f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("## Summary\n")
        f.write("| Test File | Status | Passed | Failed | Errors |\n")
        f.write("|-----------|--------|--------|--------|--------|\n")
        
        for result in results:
            status = "✅ PASS" if result["return_code"] == 0 else "❌ FAIL"
            f.write(f"| {result['file']} | {status} | {result['passed']} | {result['failed']} | {result['errors']} |\n")
        
        f.write("\n## Detailed Results\n")
        for result in results:
            f.write(f"\n### {result['file']}\n")
            f.write(f"- **Status**: {'✅ PASS' if result['return_code'] == 0 else '❌ FAIL'}\n")
            f.write(f"- **Passed**: {result['passed']}\n")
            f.write(f"- **Failed**: {result['failed']}\n")
            f.write(f"- **Errors**: {result['errors']}\n")
            
            if result["error_output"]:
                f.write(f"- **Errors**: \n```\n{result['error_output']}\n```\n")
    
    print(f"\n📄 Detailed report saved to: {report_file}")

if __name__ == "__main__":
    try:
        success = run_tests()
        if success:
            sys.exit(0)
        else:
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Test execution interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {str(e)}")
        sys.exit(1)