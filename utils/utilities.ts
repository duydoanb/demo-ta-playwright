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

    static addProductDataIntoProductsDataRecord(currentProductsRecord: Record<string, ProductData>, productDataToAdd: ProductData): void {
        const _productToAddTitle = productDataToAdd.title;
        if (currentProductsRecord[_productToAddTitle]) {
            currentProductsRecord[_productToAddTitle].quantity++;
        } else {
            currentProductsRecord[_productToAddTitle] = productDataToAdd;
        }
    }
}
