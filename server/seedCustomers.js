
const mongoose = require('mongoose');
const crypto = require('crypto');

require('./utils/MongooseUtil');
const Models = require('./models/Models');

// Dữ liệu giả lập dành riêng cho đồ án
const demoCustomers = [
  { username: 'demo_customer_01', name: 'Nguyễn Minh Anh' },
  { username: 'demo_customer_02', name: 'Trần Gia Huy' },
  { username: 'demo_customer_03', name: 'Lê Hoàng Nam' },
  { username: 'demo_customer_04', name: 'Phạm Ngọc Linh' },
  { username: 'demo_customer_05', name: 'Võ Tuấn Kiệt' },
  { username: 'demo_customer_06', name: 'Đặng Thảo Vy' },
  { username: 'demo_customer_07', name: 'Bùi Quốc Bảo' },
  { username: 'demo_customer_08', name: 'Đỗ Khánh Ngân' },
  { username: 'demo_customer_09', name: 'Huỳnh Đức Anh' },
  { username: 'demo_customer_10', name: 'Mai Thanh Trúc' }
];

async function seedCustomers() {
  try {
    await mongoose.connection.asPromise();

    let added = 0;
    let skipped = 0;

    for (let i = 0; i < demoCustomers.length; i++) {
      const demo = demoCustomers[i];

      const exists = await Models.Customer.findOne({
        username: demo.username
      });

      if (exists) {
        console.log('Đã tồn tại:', demo.username);
        skipped++;
        continue;
      }

      // Mật khẩu ngẫu nhiên, không dùng để đăng nhập thử.
      // Các tài khoản DEMO để inactive.
      const password = crypto.randomBytes(32).toString('hex');

      await Models.Customer.create({
        _id: new mongoose.Types.ObjectId(),
        username: demo.username,
        password: password,
        name: demo.name,
        phone: '',
        email: `demo.customer.${i + 1}@example.com`,
        active: 0,
        token: ''
      });

      console.log('Đã thêm:', demo.username);
      added++;
    }

    console.log('-----------------------------');
    console.log('Thêm thành công:', added, 'khách hàng DEMO');
    console.log('Đã tồn tại:', skipped);
    console.log('Không xóa khách hàng cũ.');
  } catch (error) {
    console.error('Lỗi tạo khách hàng:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedCustomers();
