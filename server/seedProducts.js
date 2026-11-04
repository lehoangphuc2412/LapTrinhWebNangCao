
const mongoose = require('mongoose');
require('./utils/MongooseUtil');

const Models = require('./models/Models');

async function seedProducts() {
  try {
    await mongoose.connection.asPromise();

    // Lấy sản phẩm mẫu đang có trong MongoDB
    const sample = await Models.Product.findOne({
      name: 'iWatch S7'
    });

    if (!sample) {
      console.log('Không tìm thấy sản phẩm mẫu iWatch S7.');
      return;
    }

    const products = [
      { name: 'Apple Watch Series 8', price: 180 },
      { name: 'Apple Watch Series 9', price: 220 },
      { name: 'Apple Watch Ultra 2', price: 350 },
      { name: 'Samsung Galaxy Watch 6', price: 170 },
      { name: 'Samsung Galaxy Watch 7', price: 210 },
      { name: 'Samsung Galaxy Watch Ultra', price: 320 },
      { name: 'Garmin Forerunner 265', price: 280 },
      { name: 'Huawei Watch GT 4', price: 160 },
      { name: 'Xiaomi Watch S3', price: 110 },
      { name: 'Amazfit GTR 4', price: 140 }
    ];

    let added = 0;

    for (const item of products) {
      const exists = await Models.Product.findOne({
        name: item.name
      });

      if (exists) {
        console.log('Đã tồn tại:', item.name);
        continue;
      }

      await Models.Product.create({
        _id: new mongoose.Types.ObjectId(),
        name: item.name,
        price: item.price,
        image: sample.image,
        cdate: Date.now() + added * 1000,
        category: {
          _id: sample.category._id,
          name: sample.category.name
        }
      });

      console.log('Đã thêm:', item.name);
      added++;
    }

    console.log('--------------------------');
    console.log('Thêm thành công:', added, 'sản phẩm');
    console.log('Không xóa sản phẩm cũ.');
  } catch (error) {
    console.error('Lỗi thêm sản phẩm:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
