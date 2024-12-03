const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const orderUserInfoService = require('../services/order_user_info.service');
const OrderUserInfo = require('../models/order_user_info.model');

async function createOrderUserInfo(data) {
    try { 
        const userInfo = new OrderUserInfo(data);
        userInfo.save();
        return userInfo;
    } catch(e) {
        console.log(e);
        throw e;
    }
}
module.exports = {
    createOrderUserInfo
}