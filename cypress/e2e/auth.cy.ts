describe('Authentication Flow', () => {
    it('should redirect to login page when not authenticated', () => {
        cy.visit('/dashboard');
        cy.url().should('include', '/login');
    });

    it('should allow user to login', () => {
        cy.visit('/login');
        // Asumiendo que tenemos estos selectores en el Login Page
        cy.get('input[type="email"]').type('coach@virtudgym.com');
        cy.get('input[type="password"]').type('password123');
        cy.get('button[type="submit"]').click();

        // Nota: Esto fallará si no tenemos un servidor corriendo o usuarios reales
        // En un entorno de CI real, usaríamos una base de datos de tests seedada.
    });
});
