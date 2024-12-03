const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Tạo đơn hàng
/*
    {
        'userinfo': {
            'name': "Thanh",
            'address': "abc",
            'phone': "0979545288" 
        },
        'status': 'confirmed',
        'type': 'ship'
        'order': [ 
            {
                'item_id': 123, 
                'quantity': 10
            }
        ]
    }
    order_detail -> userorderin4 -> order_item
*/
router.post('/create', authMiddleware.authenticateToken, orderController.createShipOrder); // tạo đơn hàng với menu order và thông tin người dùng, status là confirmed, nếu trong vòng 10p người dùng hủy thì có thể hủy

// Cập nhật trạng thái đơn hàng
router.put('/update-status/', authMiddleware.authenticateToken, orderController.updateOrder); // hủy đơn hàng


// router.get('/get', auth)
// Cập nhật trạng thái info người dùng của đơn hàng, tạm thời bỏ qua
// router.put('/update-user-info/:orderId', authMiddleware.authenticateToken, orderUserInfoController.updateInfo);

module.exports = router;
