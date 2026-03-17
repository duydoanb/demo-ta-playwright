import { ProductData } from "../data-objects/productData";

export class DataUtils {

    static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static convertToNumber(stringOrNumber: number | string): number {
        if (typeof stringOrNumber === 'string') {
            stringOrNumber = Number(stringOrNumber);
        }
        return stringOrNumber;
    }

    static addProductDataIntoProductsDataRecord(currentProductsRecord: Record<string, ProductData>, productDataToAdd: ProductData, newQty?: number): void {
        const _productToAddTitle = productDataToAdd.title;
        if (currentProductsRecord[_productToAddTitle]) {
            currentProductsRecord[_productToAddTitle].quantity = newQty ?? currentProductsRecord[_productToAddTitle].quantity + 1;
        } else {
            currentProductsRecord[_productToAddTitle] = productDataToAdd;
        }
    }

    static getTotalCostOfOrderedProducts(currentProductsRecord: Record<string, ProductData>): number {
        let totalCost: number = 0;
        for (const [_productName, _productData] of Object.entries(currentProductsRecord)) {
            totalCost += _productData.totalCost;
        }
        return totalCost;
    }

    static getTotalCostOfOrderedProductsAsPriceString(currentProductsRecord: Record<string, ProductData>): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.getTotalCostOfOrderedProducts(currentProductsRecord));
    }
}
