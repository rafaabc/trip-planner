@US-01 @web
Feature: Sign Up
  As a traveler
  I want to create an account with my details
  So that I can keep my trip budgets private and come back to them later

  Background:
    Given I am on the Sign up page

  # ── Success scenarios ───────────────────────────────────────────────

  @TC-01-06
  Scenario: Sign up with valid data
    When I sign up with valid new account details
    Then I am taken to the dashboard
    And I am logged in

  Scenario: Sign up with a password of exactly 6 characters
    When I sign up with a password of exactly 6 characters
    Then I am taken to the dashboard
    And I am logged in

  # ── Failure scenarios: server-side rules ────────────────────────────

  Scenario: Sign up with an email that is already registered
    Given an account already exists
    When I sign up using the email of that account
    Then the error "Email already registered" is shown
    And I stay on the Sign up page

  Scenario: Sign up with a name made only of spaces
    When I sign up with a name made only of spaces
    Then the error "Name is required" is shown
    And I stay on the Sign up page

  # ── Failure scenarios: validation done by the browser ───────────────

  Scenario Outline: Sign up is blocked when a field is invalid
    When I try to sign up with "<problem>"
    Then the "<field>" field is flagged as invalid
    And I stay on the Sign up page

    Examples:
      | problem                    | field    |
      | no name                    | Name     |
      | no email                   | Email    |
      | an email without an @      | Email    |
      | no password                | Password |
      | a password of 5 characters | Password |
