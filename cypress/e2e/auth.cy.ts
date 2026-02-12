
/// <reference types="cypress" />

describe('Authentication Flow', () => {

    // Reset session before each test to ensure clean state
    beforeEach(() => {
        cy.session('clear', () => {
            cy.clearCookies();
            cy.clearLocalStorage();
        });
    });

    it('should redirect to login page when accessing protected route', () => {
        cy.visit('/dashboard');
        cy.url().should('include', '/login');
    });

    it('should display error for invalid credentials', () => {
        cy.visit('/login');
        cy.get('input[name="email"]').type('invalid@user.com');
        cy.get('input[name="password"]').type('wrongpassword');
        cy.get('button[type="submit"]').click();

        // Asumiendo que Toaster muestra un mensaje de error
        cy.contains('Invalid login credentials').should('be.visible');
        // O alternativamente verificar que seguimos en /login
        cy.url().should('include', '/login');
    });

    it('should allow Admin to login and redirect to dashboard', () => {
        // Usando el comando custom cy.login
        const email = 'admin@virtudgym.com'; // Credencial de prueba
        const password = 'password123';

        cy.login(email, password);

        cy.visit('/dashboard');
        cy.url().should('include', '/dashboard');
        // Verificar que el sidebar muestra opciones de admin si es posible
        // cy.contains('Panel de Control').should('be.visible');
    });

    it('should allow Student to login', () => {
        const email = 'student@test.com'; // Credencial de prueba
        const password = 'password123';

        cy.login(email, password);
        cy.visit('/dashboard');
        cy.url().should('include', '/dashboard');
        cy.contains('Mis Pagos').should('exist'); // Elemento típico de estudiante
    });
});
