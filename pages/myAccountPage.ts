import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';
import { HomePage } from './homePage';
import { expect } from '../fixtures/beforeAndAfterTest';

export class MyAccountPage extends BasePage {
    private readonly recentOrdersButton: Locator;
    private readonly addressesButton: Locator;
    private readonly accountDetailsButton: Locator;
    private readonly logoutButton: Locator;

    private readonly nextOrdersPageButton: Locator;
    private readonly previousOrdersPageButton: Locator;
    private readonly orderIdInOrdersTable: Locator;

    constructor(page: Page) {
        super(page);
        this.recentOrdersButton = page.getByRole('link', { name: /.*Recent orders/ });
        this.addressesButton = page.getByRole('link', { name: /.*Addresses/ });
        this.accountDetailsButton = page.getByRole('link', { name: /.*Account details/ });
        this.logoutButton = page.getByRole('link', { name: /.*Logout/ });

        this.nextOrdersPageButton = page.getByRole('link', { name: 'NEXT' });
        this.previousOrdersPageButton = page.getByRole('link', { name: 'PREVIOUS' });
        this.orderIdInOrdersTable = page.locator("//tbody/tr/td[1]/a");
    }

    async logout(): Promise<void> {
        await this.logoutButton.click();
        await this.page.waitForLoadState('networkidle');
        await expect(await new HomePage(this.page).isLoginLinkVisible()).toStrictEqual(true);
    }

    async clickRecentOrdersButton(): Promise<void> {
        await this.recentOrdersButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async clickAddressesButton(): Promise<void> {
        await this.addressesButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async clickAccountDetailsButton(): Promise<void> {
        await this.accountDetailsButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async goToTheLastPageOfMyOrders(maxPages: number = 50): Promise<void> {
        for (let i = 0; i < maxPages; i++) {
            if (await this.nextOrdersPageButton.isVisible()) {
                await this.nextOrdersPageButton.click();
                await this.page.waitForLoadState('domcontentloaded');
            } else {
                break;
            }
        }
    }

    async getCurrentOrderIdsList(): Promise<number[]> {
        const orderIds: number[] = [];
        for (const idCell of await this.orderIdInOrdersTable.all()) {
            const tempOrderId: string | null = await idCell.textContent();
            if (tempOrderId) {
                orderIds.push(Number(tempOrderId.replace(/\D/g, '').trim()));
            }
        }
        return orderIds;
    }

    async extractAllOrderIdsFromTheFirstPage(): Promise<number[]> {
        const allOrderIds: number[] = [];
        let hasNextPage = true;
        const maxCheckCount = 20;
        let checkCount = 0;

        while (hasNextPage) {
            if (checkCount >= maxCheckCount) {
                break;
            }
            const currentPageOrderIds = await this.getCurrentOrderIdsList();
            allOrderIds.push(...currentPageOrderIds);
            if (await this.nextOrdersPageButton.isVisible()) {
                await this.nextOrdersPageButton.click();
                await this.page.waitForLoadState('domcontentloaded');
            } else {
                hasNextPage = false;
            }
            checkCount++;
        }
        console.log('Actual order IDs (as numbers): ' + allOrderIds.join(', '));
        return allOrderIds;
    }

}