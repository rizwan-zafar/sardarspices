-- MariaDB driver adapter: store product image lists as LONGTEXT JSON strings.
ALTER TABLE `products` MODIFY `images` LONGTEXT NULL;
