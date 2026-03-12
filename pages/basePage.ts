import { Page, Locator } from '@playwright/test';
import { MenuTab } from '../data-objects/dataEnums';

export abstract class BasePage {
    protected readonly page: Page;
    private readonly allDepartmentsMenu: Locator;
    private readonly dismissCookiesNoticeButton: Locator;
    private readonly dismissNoticeButton: Locator;
    private readonly myAccountLink: Locator;
    private readonly cartLink: Locator;

    protected constructor(page: Page) {
        this.page = page;
        this.dismissNoticeButton = page.getByRole('link', { name: 'Dismiss' });
        this.dismissCookiesNoticeButton = page.getByRole('link', { name: 'Ok', exact: true });
        this.allDepartmentsMenu = page.getByText('All departments', { exact: true });
        this.myAccountLink = page.locator("//div[@class='header-top']//a[contains(@href,'/my-account/')]");
        this.cartLink = page.locator("(//div[contains(@class,'header-cart') and a[contains(@href,'/cart/')]])[1]");
    }

    protected async dismissDataResetNotice(): Promise<void> {
        if (await this.dismissNoticeButton.isVisible()) {
            await this.dismissNoticeButton.click();
        }
    }

    protected async dismissCookiesNotice(): Promise<void> {
        if (await this.dismissCookiesNoticeButton.isVisible()) {
            await this.dismissCookiesNoticeButton.click();
        }
    }

    async navigateToTestSite(dismissDataResetNotice: boolean = true, dismissCookiesNotice: boolean = true): Promise<void> {
        await this.page.goto('', { waitUntil: 'networkidle' });

        if (dismissDataResetNotice) {
            await this.dismissDataResetNotice();
        }

        if (dismissCookiesNotice) {
            await this.dismissCookiesNotice();
        }
    }

    async clickMenuTab(tabName: MenuTab): Promise<void> {
        await this.page.locator(`xpath=//ul[@id='menu-main-menu-1']/li/a[text()='${tabName.getFullName()}']`).click();
        await this.page.waitForLoadState('networkidle');
    }

    async clickMyCartLink(): Promise<void> {
        await this.cartLink.scrollIntoViewIfNeeded();
        await this.cartLink.hover();
        await this.cartLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    async clickMyAccountLink(): Promise<void> {
        await this.myAccountLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    protected async expandAllDepartmentsMenu(): Promise<void> {
        await this.allDepartmentsMenu.hover();
        await this.page.waitForTimeout(250);
    }

    async selectDepartment(departmentName: string): Promise<void> {
        await this.expandAllDepartmentsMenu();
        const departmentLink = this.page.getByRole('link', { name: departmentName }).first();
        await departmentLink.click();
    }
}