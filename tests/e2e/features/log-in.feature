@US-02 @web
Feature: Log In
  As a registered traveler
  I want to log in with my email and password
  So that I can securely access my trip budgets

  Background:
    Given I am on the Log in page

  @TC-02-06
  Scenario: Log in with valid credentials
    Given an account already exists
    When I log in with that account
    Then I am taken to the dashboard
    And I am logged in
