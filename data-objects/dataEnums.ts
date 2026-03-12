export class PaymentMethod {
    static readonly BANK_TRANSFER = new PaymentMethod('Direct bank transfer');
    static readonly CHECK = new PaymentMethod('Check payments');
    static readonly COD = new PaymentMethod('Cash on delivery');

    private constructor(
        private readonly fullName: string,
    ) { }

    static fromName(name: string): PaymentMethod {
        return Object.values(this).find(
            (method) => method instanceof PaymentMethod && method.fullName.toUpperCase() === name.toUpperCase()
        );
    }

    getFullName(): string {
        return this.fullName;
    }
}

export class ProductSortMode {
    static readonly DEFAULT = new ProductSortMode('Default sorting');
    static readonly BY_POPULARITY = new ProductSortMode('Sort by popularity');
    static readonly BY_AVG_RATING = new ProductSortMode('Sort by average rating');
    static readonly BY_LATEST = new ProductSortMode('Sort by latest');
    static readonly BY_PRICE_LOW_TO_HIGH = new ProductSortMode('Sort by price: low to high');
    static readonly BY_PRICE_HIGH_TO_LOW = new ProductSortMode('Sort by price: high to low');

    private constructor(
        private readonly fullName: string,
    ) { }

    static fromName(name: string): ProductSortMode {
        return Object.values(this).find(
            (method) => method instanceof ProductSortMode && method.fullName.toUpperCase() === name.toUpperCase()
        );
    }

    getFullName(): string {
        return this.fullName;
    }
}

export class MenuTab {
    static readonly HOME = new MenuTab('Home');
    static readonly ABOUT_US = new MenuTab('About Us');
    static readonly SHOP = new MenuTab('Shop');
    static readonly OFFERS = new MenuTab('Offers');
    static readonly BLOG = new MenuTab('Blog');
    static readonly CONTACT_US = new MenuTab('Contact Us');

    private constructor(
        private readonly fullName: string,
    ) { }

    static fromName(name: string): MenuTab {
        return Object.values(this).find(
            (tabName) => tabName instanceof MenuTab && tabName.fullName.toUpperCase() === name.toUpperCase()
        );
    }

    getFullName(): string {
        return this.fullName;
    }
}

export class ProductViewMode {
    static readonly GRID = new ProductViewMode('grid');
    static readonly LIST = new ProductViewMode('list');

    private constructor(
        private readonly fullName: string,
    ) { }

    static fromName(name: string): ProductViewMode {
        return Object.values(this).find(
            (mode) => mode instanceof ProductViewMode && mode.fullName.toUpperCase() === name.toUpperCase()
        );
    }

    getFullName(): string {
        return this.fullName;
    }
}

export class ProductShowLimit {
    static readonly 1_2 = new ProductShowLimit('12');
    static readonly 2_4 = new ProductShowLimit('24');
    static readonly 3_6 = new ProductShowLimit('36');
    static readonly All = new ProductShowLimit('All');

    private constructor(
        private readonly fullName: string,
    ) { }

    static fromName(name: string): ProductShowLimit {
        return Object.values(this).find(
            (limit) => limit instanceof ProductShowLimit && limit.fullName.toUpperCase() === name.toUpperCase()
        );
    }

    getFullName(): string {
        return this.fullName;
    }

    toString(): string { return this.getFullName(); }
}
