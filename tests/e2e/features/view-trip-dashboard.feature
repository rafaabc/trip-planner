@US-05 @web
Feature: View Trip Dashboard
  As a traveler
  I want to see the totals and the daily budget of a trip
  So that I know how much the trip costs and how much I can spend per day

  Background:
    Given an account already exists
    And I am logged in with that account
    And I have a trip

  @TC-05-09
  Scenario: View the dashboard of a trip on the website
    Given the trip has a budget item in the category "Flights" with the amount "1000"
    And the trip has a budget item in the category "Food" with the amount "300"
    When I open the page of that trip
    Then the grand total is "1.300,00 kr."
    And the total of the category "Flights" is "1.000,00 kr."
    And the total of the category "Food" is "300,00 kr."
    And the daily budget is "50,00 kr." per day, "300,00 kr." over 6 days
