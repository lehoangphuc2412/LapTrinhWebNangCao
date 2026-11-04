
const mongoose = require('mongoose');
require('./utils/MongooseUtil');

const Models = require('./models/Models');

// Chỉ cập nhật các khách hàng DEMO đã tạo.
// Active = 1, Inactive = 0.

const customers = [
  {
    index: 1,
    name: 'Nguyễn Minh Anh',
    username: 'minhanh.nguyen',
    phone: '0937634101',
    active: 1
  },
  {
    index: 2,
    name: 'Trần Gia Huy',
    username: 'giahuy.tran',
    phone: '0961273102',
    active: 1
  },
  {
    index: 3,
    name: 'Lê Hoàng Nam',
    username: 'hoangnam.le',
    phone: '0701234103',
    active: 0
  },
  {
    index: 4,
    name: 'Phạm Ngọc Linh',
    username: 'ngoclinh.pham',
    phone: '0973645104',
    active: 1
  },
  {
    index: 5,
    name: 'Võ Tuấn Kiệt',
    username: 'tuankiet.vo',
    phone: '09927356105',
    active: 0
  },
  {
    index: 6,
    name: 'Đặng Thảo Vy',
    username: 'thaovy.dang',
    phone: '0964521106',
    active: 1
  },
  {
    index: 7,
    name: 'Bùi Quốc Bảo',
    username: 'quocbao.bui',
    phone: '090986523107',
    active: 0
  },
  {
    index: 8,
    name: 'Đỗ Khánh Ngân',
    username: 'khanhngan.do',
    phone: '0998635108',
    active: 1
  },
  {
    index: 9,
    name: 'Huỳnh Đức Anh',
    username: 'ducanh.huynh',
    phone: '0984526109',
    active: 0
  },
  {
    index: 10,
    name: 'Mai Thanh Trúc',
    username: 'thanhtruc.mai',
    phone: '0994625110',
    active: 0
  }
];

async function updateDemoCustomers() {
  try {
    await mongoose.connection.asPromise();

    let updated = 0;
    let skipped = 0;

    for (const item of customers) {
      const email =
        `demo.customer.${item.index}@example.com`;

      const newEmail =
        `${item.username}@example.com`;

      // Tìm đúng DEMO theo email gốc hoặc email đã đổi.
      const customer = await Models.Customer.findOne({
        $or: [
          {
            username: `demo_customer_${String(item.index).padStart(2, '0')}`,
            email: email
          },
          {
            username: item.username,
            email: newEmail
          }
        ]
      });

      if (!customer) {
        console.log('Bỏ qua:', item.name);
        skipped++;
        continue;
      }

      // Kiểm tra trùng username/email ở tài khoản khác.
      const duplicate = await Models.Customer.findOne({
        _id: { $ne: customer._id },
        $or: [
          { username: item.username },
          { email: newEmail }
        ]
      });

      if (duplicate) {
        console.log('Trùng Username hoặc Email:', item.name);
        skipped++;
        continue;
      }

      await Models.Customer.updateOne(
        { _id: customer._id },
        {
          $set: {
            username: item.username,
            email: newEmail,
            phone: item.phone,
            active: item.active
          }
        }
      );

      console.log(
        `Đã cập nhật: ${item.name} | ${item.phone} | ` +
        (item.active === 1 ? 'Active' : 'Inactive')
      );

      updated++;
    }

    console.log('-----------------------------');
    console.log('Đã cập nhật:', updated, 'khách hàng DEMO');
    console.log('Bỏ qua:', skipped);
    console.log('Không thay đổi khách hàng thật.');
  } catch (error) {
    console.error('Update DEMO customers error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateDemoCustomers();
