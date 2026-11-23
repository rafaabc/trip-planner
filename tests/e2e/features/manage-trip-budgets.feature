@US-03 @web
Feature: Manage Trip Budgets
  As a traveler
  I want to create, list, update and delete my trip budgets
  So that I can plan the budget of each trip separately

  Background:
    Given an account already exists
    And I am logged in with that account
    And I am on the Trips page

  @TC-03-14
  Scenario: Create a trip through the website
    When I create a trip from "Copenhagen" to "Lisbon" from "2027-03-10" to "2027-03-15"
    Then the trip "Trip budget - Copenhagen - Lisbon" is listed
    And the trip is shown with the dates "2027-03-10 to 2027-03-15"
