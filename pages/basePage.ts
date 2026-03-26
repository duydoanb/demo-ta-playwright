import { Page, Locator, expect } from '@playwright/test';
import { MenuTab, ProductDepartment } from '../data-objects/dataEnums';

export abstract class BasePage {
    protected readonly page: Page;
    private readonly allDepartmentsMenu: Locator;
    private readonly departmentLinkByName: (department: ProductDepartment) => Locator;
    private readonly menuTabByName: (tab: MenuTab) => Locator;
    private readonly dismissCookiesNoticeButton: Locator;
    private readonly dismissNoticeButton: Locator;
    private readonly myAccountLink: Locator;
    private readonly cartLink: Locator;

    protected constructor(page: Page) {
        this.page = page;
        this.dismissNoticeButton = page.getByRole('link', { name: 'Dismiss' });
        this.dismissCookiesNoticeButton = page.getByRole('link', { name: 'Ok', exact: true });
        this.allDepartmentsMenu = page.getByText('All departments', { exact: true });
        this.myAccountLink = page.locator('.header-top').locator("a[href*='my-account']");
        this.cartLink = page.locator("[class='header-main-wrapper ']").locator("a[href*='cart']:has(bdi)");
        this.departmentLinkByName = (_department: ProductDepartment): Locator => page.getByRole('link', { name: _department.getFullName() }).first();
        this.menuTabByName = (_tab: MenuTab): Locator => page.locator("#menu-main-menu-1").locator(`a:has-text('${_tab.getFullName()}')`);
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
        await this.page.goto('');
        await expect(this.allDepartmentsMenu).toBeVisible();
        await expect(this.myAccountLink).toBeVisible();
        await expect(this.cartLink).toBeVisible();

        if (dismissDataResetNotice) {
            await this.dismissDataResetNotice();
        }

        if (dismissCookiesNotice) {
            await this.dismissCookiesNotice();
        }
    }

    async clickMenuTab(tabName: MenuTab): Promise<void> {
        await this.menuTabByName(tabName).click();
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

    async selectDepartment(departmentName: ProductDepartment): Promise<void> {
        await this.expandAllDepartmentsMenu();
        await this.departmentLinkByName(departmentName).click();
    }
}
