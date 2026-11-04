
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

require('./utils/MongooseUtil');
const Models = require('./models/Models');

const products = [
  { name: 'Apple Watch Series 8', file: 'apple-watch-8' },
  { name: 'Apple Watch Series 9', file: 'apple-watch-9' },
  { name: 'Apple Watch Ultra 2', file: 'apple-watch-ultra-2' },
  { name: 'Samsung Galaxy Watch 6', file: 'samsung-watch-6' },
  { name: 'Samsung Galaxy Watch 7', file: 'samsung-watch-7' },
  { name: 'Samsung Galaxy Watch Ultra', file: 'samsung-watch-ultra' },
  { name: 'Garmin Forerunner 265', file: 'garmin-265' },
  { name: 'Huawei Watch GT 4', file: 'huawei-gt4' },
  { name: 'Xiaomi Watch S3', file: 'xiaomi-s3' },
  { name: 'Amazfit GTR 4', file: 'amazfit-gtr4' }
];

async function updateProductImages() {
  try {
    await mongoose.connection.asPromise();

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      const extensions = ['.jpg', '.jpeg', '.png', '.webp'];

      let imagePath = null;

      for (const ext of extensions) {
        const possiblePath = path.join(
          __dirname,
          'product-images',
          product.file + ext
        );

        if (fs.existsSync(possiblePath)) {
          imagePath = possiblePath;
          break;
        }
      }

      if (!imagePath) {
        console.log('Không tìm thấy ảnh:', product.name);
        skipped++;
        continue;
      }

      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      const result = await Models.Product.updateOne(
        { name: product.name },
        { $set: { image: imageBase64 } }
      );

      if (result.matchedCount === 0) {
        console.log('Không tìm thấy sản phẩm:', product.name);
        skipped++;
        continue;
      }

      console.log('Đã cập nhật ảnh:', product.name);
      updated++;
    }

    console.log('---------------------------');
    console.log('Cập nhật thành công:', updated, 'sản phẩm');
    console.log('Bỏ qua:', skipped, 'sản phẩm');
    console.log('Không xóa dữ liệu sản phẩm cũ.');
  } catch (error) {
    console.error('Lỗi cập nhật hình ảnh:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateProductImages();
