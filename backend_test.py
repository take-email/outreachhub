#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class FounderOutreachAPITester:
    def __init__(self, base_url="https://founder-outreach-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            'tools': [],
            'founders': [], 
            'profiles': [],
            'templates': [],
            'outreach': []
        }

    def log(self, message: str, level: str = "INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict[Any, Any]] = None, params: Optional[Dict[str, Any]] = None) -> tuple:
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        self.log(f"Testing {name} - {method} {endpoint}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                self.log(f"Unsupported method: {method}", "ERROR")
                return False, {}

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json() if response.content else {}
                except json.JSONDecodeError:
                    response_data = {"text": response.text}
                return True, response_data
            else:
                self.log(f"❌ FAILED - Expected {expected_status}, got {response.status_code}", "ERROR")
                self.log(f"Response: {response.text[:200]}", "ERROR")
                return False, {}

        except requests.RequestException as e:
            self.log(f"❌ FAILED - Network Error: {str(e)}", "ERROR")
            return False, {}
        except Exception as e:
            self.log(f"❌ FAILED - Unexpected Error: {str(e)}", "ERROR")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        self.log("=== TESTING ROOT ENDPOINT ===")
        return self.run_test("Root API", "GET", "/", 200)

    def test_stats_endpoint(self):
        """Test dashboard stats endpoint"""
        self.log("=== TESTING STATS ENDPOINT ===")
        success, data = self.run_test("Dashboard Stats", "GET", "/stats", 200)
        if success:
            required_fields = ['total_founders', 'total_messages_sent', 'total_replies', 'reply_rate']
            for field in required_fields:
                if field not in data:
                    self.log(f"❌ Missing field in stats: {field}", "ERROR")
                    return False
            self.log(f"Stats: {data}")
        return success

    def test_tools_crud(self):
        """Test Tools CRUD operations"""
        self.log("=== TESTING TOOLS CRUD ===")
        
        # Get all tools (initial)
        success, _ = self.run_test("Get All Tools (Initial)", "GET", "/tools", 200)
        if not success:
            return False

        # Create tool
        tool_data = {
            "tool_name": "TestTool",
            "tool_description": "A test tool for outreach",
            "website_url": "https://testtool.com"
        }
        success, created_tool = self.run_test("Create Tool", "POST", "/tools", 200, tool_data)
        if not success or 'id' not in created_tool:
            return False
        
        tool_id = created_tool['id']
        self.created_resources['tools'].append(tool_id)
        self.log(f"Created tool with ID: {tool_id}")

        # Get specific tool
        success, tool = self.run_test("Get Tool by ID", "GET", f"/tools/{tool_id}", 200)
        if not success or tool.get('tool_name') != 'TestTool':
            return False

        # Update tool
        update_data = {"tool_name": "UpdatedTestTool"}
        success, updated_tool = self.run_test("Update Tool", "PUT", f"/tools/{tool_id}", 200, update_data)
        if not success or updated_tool.get('tool_name') != 'UpdatedTestTool':
            return False

        return True

    def test_templates_crud(self):
        """Test Templates CRUD operations"""
        self.log("=== TESTING TEMPLATES CRUD ===")
        
        # Get all templates (initial)
        success, _ = self.run_test("Get All Templates (Initial)", "GET", "/templates", 200)
        if not success:
            return False

        # Create template
        template_data = {
            "template_name": "Test Template",
            "template_content": "Hi {founder_name}, I saw your tool {tool_name} and {tool_description}. Let's connect!"
        }
        success, created_template = self.run_test("Create Template", "POST", "/templates", 200, template_data)
        if not success or 'id' not in created_template:
            return False
        
        template_id = created_template['id']
        self.created_resources['templates'].append(template_id)
        self.log(f"Created template with ID: {template_id}")

        # Get specific template
        success, template = self.run_test("Get Template by ID", "GET", f"/templates/{template_id}", 200)
        if not success or template.get('template_name') != 'Test Template':
            return False

        # Update template
        update_data = {"template_name": "Updated Test Template"}
        success, updated_template = self.run_test("Update Template", "PUT", f"/templates/{template_id}", 200, update_data)
        if not success or updated_template.get('template_name') != 'Updated Test Template':
            return False

        return True

    def test_founders_crud(self):
        """Test Founders CRUD operations"""
        self.log("=== TESTING FOUNDERS CRUD ===")
        
        if not self.created_resources['tools']:
            self.log("❌ Need tools to test founders", "ERROR")
            return False

        # Get all founders (initial)
        success, _ = self.run_test("Get All Founders (Initial)", "GET", "/founders", 200)
        if not success:
            return False

        # Create founder
        tool_id = self.created_resources['tools'][0]
        founder_data = {
            "founder_name": "John Test Founder",
            "social_profile_url": "https://facebook.com/johnfounder",
            "tool_id": tool_id
        }
        success, created_founder = self.run_test("Create Founder", "POST", "/founders", 200, founder_data)
        if not success or 'id' not in created_founder:
            return False
        
        founder_id = created_founder['id']
        self.created_resources['founders'].append(founder_id)
        self.log(f"Created founder with ID: {founder_id}")

        # Get specific founder
        success, founder = self.run_test("Get Founder by ID", "GET", f"/founders/{founder_id}", 200)
        if not success or founder.get('founder_name') != 'John Test Founder':
            return False

        # Update founder
        update_data = {"founder_name": "Updated John Founder"}
        success, updated_founder = self.run_test("Update Founder", "PUT", f"/founders/{founder_id}", 200, update_data)
        if not success or updated_founder.get('founder_name') != 'Updated John Founder':
            return False

        return True

    def test_profiles_crud(self):
        """Test FB Profiles CRUD operations"""
        self.log("=== TESTING FB PROFILES CRUD ===")
        
        if not self.created_resources['templates']:
            self.log("❌ Need templates to test profiles", "ERROR")
            return False

        # Get all profiles (initial)
        success, _ = self.run_test("Get All Profiles (Initial)", "GET", "/profiles", 200)
        if not success:
            return False

        # Create profile
        template_id = self.created_resources['templates'][0]
        profile_data = {
            "profile_name": "Test FB Profile",
            "template_id": template_id
        }
        success, created_profile = self.run_test("Create Profile", "POST", "/profiles", 200, profile_data)
        if not success or 'id' not in created_profile:
            return False
        
        profile_id = created_profile['id']
        self.created_resources['profiles'].append(profile_id)
        self.log(f"Created profile with ID: {profile_id}")

        # Get specific profile
        success, profile = self.run_test("Get Profile by ID", "GET", f"/profiles/{profile_id}", 200)
        if not success or profile.get('profile_name') != 'Test FB Profile':
            return False

        # Update profile
        update_data = {"profile_name": "Updated Test FB Profile"}
        success, updated_profile = self.run_test("Update Profile", "PUT", f"/profiles/{profile_id}", 200, update_data)
        if not success or updated_profile.get('profile_name') != 'Updated Test FB Profile':
            return False

        return True

    def test_message_generation(self):
        """Test message generation functionality"""
        self.log("=== TESTING MESSAGE GENERATION ===")
        
        if not self.created_resources['founders'] or not self.created_resources['profiles']:
            self.log("❌ Need founders and profiles to test message generation", "ERROR")
            return False

        # Generate message
        generate_data = {
            "founder_id": self.created_resources['founders'][0],
            "fb_profile_id": self.created_resources['profiles'][0]
        }
        success, outreach_record = self.run_test("Generate Message", "POST", "/outreach/generate", 200, generate_data)
        if not success or 'id' not in outreach_record:
            return False
        
        outreach_id = outreach_record['id']
        self.created_resources['outreach'].append(outreach_id)
        self.log(f"Generated outreach with ID: {outreach_id}")

        # Check if message contains replaced placeholders
        generated_message = outreach_record.get('generated_message', '')
        if '{founder_name}' in generated_message or '{tool_name}' in generated_message:
            self.log("❌ Placeholders not replaced in generated message", "ERROR")
            return False

        self.log(f"Generated message: {generated_message[:100]}...")
        return True

    def test_outreach_status_management(self):
        """Test outreach status management"""
        self.log("=== TESTING OUTREACH STATUS MANAGEMENT ===")
        
        if not self.created_resources['outreach']:
            self.log("❌ Need outreach records to test status management", "ERROR")
            return False

        outreach_id = self.created_resources['outreach'][0]
        
        # Update status to message_sent
        update_data = {"status": "message_sent"}
        success, updated_record = self.run_test("Update Status to message_sent", "PUT", f"/outreach/{outreach_id}", 200, update_data)
        if not success or updated_record.get('status') != 'message_sent':
            return False

        # Update status to replied
        update_data = {"status": "replied"}
        success, updated_record = self.run_test("Update Status to replied", "PUT", f"/outreach/{outreach_id}", 200, update_data)
        if not success or updated_record.get('status') != 'replied':
            return False

        return True

    def test_outreach_filters(self):
        """Test outreach filtering"""
        self.log("=== TESTING OUTREACH FILTERS ===")
        
        # Get all outreach records
        success, _ = self.run_test("Get All Outreach Records", "GET", "/outreach", 200)
        if not success:
            return False

        if self.created_resources['tools']:
            # Filter by tool
            params = {'tool_id': self.created_resources['tools'][0]}
            success, _ = self.run_test("Filter Outreach by Tool", "GET", "/outreach", 200, params=params)
            if not success:
                return False

        if self.created_resources['founders']:
            # Filter by founder
            params = {'founder_id': self.created_resources['founders'][0]}
            success, _ = self.run_test("Filter Outreach by Founder", "GET", "/outreach", 200, params=params)
            if not success:
                return False

        # Filter by status
        params = {'status': 'REPLIED'}
        success, _ = self.run_test("Filter Outreach by Status", "GET", "/outreach", 200, params=params)
        if not success:
            return False

        return True

    def cleanup_resources(self):
        """Clean up test resources"""
        self.log("=== CLEANING UP TEST RESOURCES ===")
        
        # Delete outreach records
        for outreach_id in self.created_resources['outreach']:
            self.run_test(f"Delete Outreach {outreach_id}", "DELETE", f"/outreach/{outreach_id}", 200)

        # Delete profiles
        for profile_id in self.created_resources['profiles']:
            self.run_test(f"Delete Profile {profile_id}", "DELETE", f"/profiles/{profile_id}", 200)

        # Delete founders
        for founder_id in self.created_resources['founders']:
            self.run_test(f"Delete Founder {founder_id}", "DELETE", f"/founders/{founder_id}", 200)

        # Delete templates
        for template_id in self.created_resources['templates']:
            self.run_test(f"Delete Template {template_id}", "DELETE", f"/templates/{template_id}", 200)

        # Delete tools
        for tool_id in self.created_resources['tools']:
            self.run_test(f"Delete Tool {tool_id}", "DELETE", f"/tools/{tool_id}", 200)

    def run_all_tests(self):
        """Run all backend API tests"""
        self.log("=" * 50)
        self.log("STARTING FOUNDER OUTREACH API TESTS")
        self.log("=" * 50)

        try:
            # Test basic endpoints
            if not self.test_root_endpoint():
                self.log("Root endpoint test failed - stopping", "ERROR")
                return False

            if not self.test_stats_endpoint():
                self.log("Stats endpoint test failed", "WARNING")

            # Test CRUD operations in dependency order
            if not self.test_tools_crud():
                self.log("Tools CRUD test failed - stopping", "ERROR")
                return False

            if not self.test_templates_crud():
                self.log("Templates CRUD test failed - stopping", "ERROR")
                return False

            if not self.test_founders_crud():
                self.log("Founders CRUD test failed - stopping", "ERROR")
                return False

            if not self.test_profiles_crud():
                self.log("Profiles CRUD test failed - stopping", "ERROR")
                return False

            # Test message generation and outreach management
            if not self.test_message_generation():
                self.log("Message generation test failed", "ERROR")
                return False

            if not self.test_outreach_status_management():
                self.log("Status management test failed", "ERROR")
                return False

            if not self.test_outreach_filters():
                self.log("Outreach filters test failed", "ERROR")
                return False

            return True

        except Exception as e:
            self.log(f"Unexpected error during testing: {str(e)}", "ERROR")
            return False
        
        finally:
            self.cleanup_resources()

    def print_results(self):
        """Print test results summary"""
        self.log("=" * 50)
        self.log("TEST RESULTS SUMMARY")
        self.log("=" * 50)
        self.log(f"Tests Run: {self.tests_run}")
        self.log(f"Tests Passed: {self.tests_passed}")
        self.log(f"Tests Failed: {self.tests_run - self.tests_passed}")
        self.log(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%" if self.tests_run > 0 else "0%")
        return self.tests_passed == self.tests_run


def main():
    tester = FounderOutreachAPITester()
    
    try:
        success = tester.run_all_tests()
        tester.print_results()
        return 0 if success else 1
    except KeyboardInterrupt:
        tester.log("Testing interrupted by user", "WARNING")
        return 1
    except Exception as e:
        tester.log(f"Fatal error: {str(e)}", "ERROR")
        return 1

if __name__ == "__main__":
    sys.exit(main())