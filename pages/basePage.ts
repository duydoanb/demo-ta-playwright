import { Page, Locator, expect } from '@playwright/test';
import { MenuTab, ProductDepartment, ScrollDirection } from '../data-objects/dataEnums';
import { Logger } from '../utils/logger';

export abstract class BasePage {
    protected readonly page: Page;
    private readonly loginLink: Locator;
    private readonly allDepartmentsMenu: Locator;
    private readonly departmentLinkByName: (department: ProductDepartment) => Locator;
    private readonly menuTabByName: (tab: MenuTab) => Locator;
    private readonly dismissCookiesNoticeButton: Locator;
    private readonly dismissNoticeButton: Locator;
    private readonly myAccountLink: Locator;
    private readonly cartLink: Locator;
    private readonly backToTopButton: Locator;


    protected constructor(page: Page) {
        this.page = page;
        this.loginLink = page.getByRole('link', { name: 'Log in / Sign up' });
        this.dismissNoticeButton = page.getByRole('link', { name: 'Dismiss' });
        this.dismissCookiesNoticeButton = page.getByRole('link', { name: 'Ok', exact: true });
        this.allDepartmentsMenu = page.getByText('All departments', { exact: true });
        this.myAccountLink = page.locator('.header-top').locator("a[href*='my-account']");
        this.cartLink = page.locator("[class='header-main-wrapper ']").locator("a[href*='cart']:has(bdi)");
        this.departmentLinkByName = (_department: ProductDepartment): Locator => page.getByRole('link', { name: _department.getFullName() }).first();
        this.menuTabByName = (_tab: MenuTab): Locator => page.locator("#menu-main-menu-1").locator(`a:has-text('${_tab.getFullName()}')`);
        this.backToTopButton = page.locator("#back-top");
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

    async clickLoginLink(): Promise<void> {
        await this.loginLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    async isLoginLinkVisible(): Promise<boolean> {
        await this.page.waitForLoadState('networkidle');
        return await this.loginLink.isVisible() && await this.loginLink.isEnabled();
    }

    async verifyLoginLinkVisible(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await expect(this.loginLink).toBeVisible();
        await expect(this.loginLink).toBeEnabled();
    }

    async verifyLoginLinkHidden(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await expect(this.loginLink).toBeHidden();
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

    async verifyIsAtTopOfThePage(): Promise<void> {
        const _scrollY = await this.page.evaluate(() => window.scrollY);
        await expect(_scrollY).toBeLessThanOrEqual(0);
    }

    async clickBackToTopButton(): Promise<void> {
        await expect(this.backToTopButton).toBeVisible();
        await this.backToTopButton.click();
    }

    async verifyBackToTopBtnIsVisible(): Promise<void> {
        await expect(this.backToTopButton).toBeVisible();
    }

    async verifyBackToTopBtnIsHidden(): Promise<void> {
        await expect(this.backToTopButton).toBeHidden();
    }

    async verifyBackToTopBtnInBottomRight(maxOffsetPx: number = 80): Promise<void> {
        await this.verifyBackToTopBtnIsVisible();
        const box = await this.backToTopButton.boundingBox();
        expect(box).not.toBeNull();
        if (!box) {
            throw new Error("Back-to-top button bounding box is null.");
        }
        const viewport = await this.page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
        expect(box.x + box.width).toBeGreaterThanOrEqual(viewport.w - maxOffsetPx);
        expect(box.y + box.height).toBeGreaterThanOrEqual(viewport.h - maxOffsetPx);
    }

    // Scroll down by defaut
    async scrollByAmount(amount: number, direction: ScrollDirection = ScrollDirection.DOWN): Promise<void> {
        switch (direction) {
            case ScrollDirection.UP:
                await this.page.mouse.wheel(0, -amount);
                return;
            case ScrollDirection.LEFT:
                await this.page.evaluate((amt) => window.scrollBy(-amt, 0), amount);
                return;
            case ScrollDirection.RIGHT:
                await this.page.evaluate((amt) => window.scrollBy(amt, 0), amount);
                return;
            default:
                await this.page.mouse.wheel(0, amount);
                return;
        }
    }

    async scrollDownByViewportHeight(): Promise<void> {
        const height = await this.page.evaluate(() => window.innerHeight);
        await this.scrollByAmount(height, ScrollDirection.DOWN)
    }

    async scrollToBottom(): Promise<void> {
        const height = await this.page.evaluate(() => document.body.scrollHeight);
        await this.scrollByAmount(height, ScrollDirection.DOWN)
    }
}
