const sequelize = require("../config/db.config");
// const User = require("./user.model");
// const TableInfo = require("./table_info.model");
// const OrderDetail = require("./order_detail.model");
// const ReservationTable = require("./reservation_table.model");

// const defineAssociations = () => {
//   // User - OrderDetail
//   User.hasMany(OrderDetail, { foreignKey: "customer_id", onDelete: "CASCADE" });
//   OrderDetail.belongsTo(User, { foreignKey: "customer_id" });

//   // OrderDetail - ReservationTable
//   OrderDetail.hasMany(ReservationTable, {
//     foreignKey: "reservation_id",
//     onDelete: "CASCADE",
//   });
//   ReservationTable.belongsTo(OrderDetail, { foreignKey: "reservation_id" });

//   // TableInfo - ReservationTable
//   TableInfo.hasMany(ReservationTable, {
//     foreignKey: "table_id",
//     onDelete: "CASCADE",
//   });
//   ReservationTable.belongsTo(TableInfo, { foreignKey: "table_id" });
// };

const initModels = async () => {
  try {
    // Gọi hàm định nghĩa quan hệ
    // defineAssociations();
    // Đồng bộ cơ sở dữ liệu
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully.");
  } catch (err) {
    console.error("Error syncing database:", err.message);
    process.exit(1); // Dừng ứng dụng nếu lỗi nghiêm trọng
  }
};

module.exports = {
  initModels,
  //   User,
  //   TableInfo,
  //   OrderDetail,
  //   ReservationTable,
};
