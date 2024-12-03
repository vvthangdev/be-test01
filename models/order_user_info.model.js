const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config"); 
const OrderDetail = require("./order_detail.model");

const OrderUserInfo = sequelize.define (
    'OrderUserInfo',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        order_detail_id: {
            type: DataTypes.INTEGER,
            unique: true,
            references: {
                model: OrderDetail,
                key: 'id'
            },
            onDelete: "CASCADE"
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: false,
        }
    },
    {
        tableName: 'order_user_info', // Tên bảng trong cơ sở dữ liệu
        timestamps: false, // Nếu không muốn sử dụng `createdAt` và `updatedAt`
    }
);
module.exports = OrderUserInfo;