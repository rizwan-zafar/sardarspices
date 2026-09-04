-- CreateTable
CREATE TABLE `product_variants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `productId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `product_variants_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Copy current product price/stock into a Standard variation
INSERT INTO `product_variants` (`name`, `price`, `stock`, `productId`, `createdAt`, `updatedAt`)
SELECT 'Standard', `price`, `stock`, `id`, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3) FROM `products`;

-- AlterTable
ALTER TABLE `order_items` ADD COLUMN `variantId` INTEGER NULL;
ALTER TABLE `order_items` ADD COLUMN `variantName` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX `order_items_variantId_idx` ON `order_items`(`variantId`);

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
