import { getPanels } from '../support/po';

describe('workspace-project App', () => {
  it('should display welcome message', () => {
    cy.visit('/')
    getPanels().should('have.length', 3)
  });
})
