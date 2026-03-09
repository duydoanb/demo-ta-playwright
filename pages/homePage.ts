import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class HomePage extends BasePage {
    private readonly loginLink: Locator;

    constructor(page: Page) {
        super(page);
        this.loginLink = page.getByRole('link', { name: 'Log in / Sign up' });
    }

    async clickLoginLink(): Promise<void> {
        await this.loginLink.click();
        await this.page.waitForLoadState('networkidle');
    }

}