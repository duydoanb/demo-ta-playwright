import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './basePage';
import { DataUtils } from '../utils/utilities';
import { Logger } from '../utils/logger';

export class ProductDetailsPage extends BasePage {
    private readonly reviewsTabLink: Locator;
    private readonly reviewsTabPanel: Locator;
    private readonly dynamicRatingStarsOption: Locator;
    private readonly reviewTextarea: Locator;
    private readonly submitReviewButton: Locator;

    constructor(page: Page) {
        super(page);
        this.reviewsTabLink = page.getByRole('link', { name: /Reviews/i }).first();
        this.reviewsTabPanel = page.locator('#reviews');
        this.dynamicRatingStarsOption = page.locator("p.stars").getByRole('link');
        this.reviewTextarea = page.getByLabel(/Your review/);
        this.submitReviewButton = page.getByRole('button', { name: 'Submit' });
    }

    async openReviewsTab(): Promise<void> {
        await this.reviewsTabLink.scrollIntoViewIfNeeded();
        await this.reviewsTabLink.click();
        await expect(this.reviewTextarea).toBeVisible();
    }

    private async selectRating(rating: number): Promise<void> {
        if (rating < 1 || rating > 5) {
            throw new Error(`Rating must be between 1 and 5. Received: ${rating}`);
        }
        const targetStar = this.dynamicRatingStarsOption.nth(Math.floor(rating) - 1);
        await expect(targetStar).toBeVisible();
        await targetStar.click();
    }

    async verifyReviewDisplayed(reviewText: string): Promise<void> {
        await this.openReviewsTab();
        const parts = reviewText.split(' - ');
        const timestamp = parts.length > 1 ? parts.pop() : reviewText;
        await expect(this.reviewsTabPanel).toContainText(timestamp as string);
        Logger.info(`verifyReviewDisplayed(): PASSED - The review [${reviewText}] is displayed`)
    }

    async addReview(reviewText: string, rating: number = 5, timeStamp?: string): Promise<string> {
        timeStamp = timeStamp ?? DataUtils.generateDatetimeStampMicrosecondPrecision();
        reviewText = `${reviewText} Commented at ${timeStamp}!`
        await this.openReviewsTab();
        await this.selectRating(rating);
        await this.reviewTextarea.fill(reviewText);
        await this.submitReviewButton.click();
        await this.page.waitForLoadState('networkidle');
        Logger.info(`addReview(): Added the review [${reviewText}] for the product!`);
        return reviewText;
    }

}
