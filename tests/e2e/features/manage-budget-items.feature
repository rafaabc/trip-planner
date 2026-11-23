@US-04 @web
Feature: Manage Budget Items
  As a traveler
  I want to add, list, update and delete budget items inside a trip
  So that I can record what I expect to spend in each category

  Background:
    Given an account already exists
    And I am logged in with that account
    And I have a trip
    And I am on the page of that trip

  @TC-04-14
  Scenario: Create a budget item through the website
    When I add a budget item in the category "Food" with the amount "250" and the description "Dinner in Lisbon"
    Then the budget item "Dinner in Lisbon" is listed
    And the budget item is shown with the category "Food" and the amount "250,00 kr."
