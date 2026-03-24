import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './basePage';
import { DataUtils } from '../utils/utilities';
import { Logger } from '../utils/logger';

export class ProductDetailsPage extends BasePage {
    private readonly reviewsTabLink: Locator;
    private readonly reviewsTabPanel: Locator;
    private readonly ratingStars: Locator;
    private readonly reviewTextarea: Locator;
    private readonly submitReviewButton: Locator;
    private readonly reviewListItems: Locator;

    constructor(page: Page) {
        super(page);
        this.reviewsTabLink = page.getByRole('link', { name: /Reviews/i }).first();
        this.reviewsTabPanel = page.locator('#reviews');
        this.ratingStars = page.locator('#review_form p.stars a, #reviews p.stars a, p.stars a');
        this.reviewTextarea = page.locator('#review_form textarea#comment, textarea#comment');
        this.submitReviewButton = page.locator('#review_form [type="submit"], #review_form button:has-text("Submit"), input#submit');
        this.reviewListItems = page.locator('#reviews ol.commentlist li, ol.commentlist li');
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
        const targetStar = this.ratingStars.nth(Math.floor(rating) - 1);
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
