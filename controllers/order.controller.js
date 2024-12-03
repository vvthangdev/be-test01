const OrderDetail = require("../models/order_detail.model");
const orderService = require("../services/order.service");
const userService = require("../services/user.service");
const sequelize = require("../config/db.config"); // Đảm bảo import sequelize để sử dụng transaction
const { createOrderUserInfo } = require("../services/order_user_info.service");

const getAllOrders = async (req, res) => {
  try {
    const orderDetail = await OrderDetail.findAll();
    res.json(orderDetail);
  } catch (error) {
    res.status(500).json({ error: "Error fetching orders" });
  }
};

const getAllOrdersOfCustomer = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const orders = await OrderDetail.findAll({customer_id});
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching orders" });
  }
};


const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction(); // Khởi tạo transaction
  try {
    let { start_time, num_people, items, ...orderData } = req.body; // Số lượng khách và danh sách các món hàng

    // Tạo order mới trong transaction
    const newOrder = await orderService.createOrder(
      {
        customer_id: req.user.id,
        time: start_time,
        num_people, // Lưu số lượng khách vào order
        ...orderData,
      },
      { transaction } // Pass transaction vào trong service
    );

    // Lấy thời gian bắt đầu từ orderData
    const startTime = newOrder.time; // Giả sử thời gian bắt đầu là time trong orderData

    // Cộng thêm thời gian từ biến môi trường (mặc định là 120 phút nếu không có giá trị trong ENV)
    const offsetMinutes = parseInt(process.env.END_TIME_OFFSET_MINUTES) || 120; 
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + offsetMinutes);

    // Chuyển startTime và endTime thành dạng chuỗi ISO chuẩn
    const startTimeFormatted = startTime.toISOString();
    const endTimeFormatted = endTime.toISOString();

    // Kiểm tra bàn trống trong khoảng thời gian người dùng chọn và sử dụng lock
    const availableTables = await orderService.checkAvailableTables(startTimeFormatted, endTimeFormatted, { transaction });

    if (availableTables && availableTables.length > 0) {
      // Tính toán số bàn cần thiết để phục vụ tất cả khách
      let remainingPeople = num_people;
      let reservedTables = [];
      let totalCapacity = 0;

      // Duyệt qua các bàn có sẵn và tính tổng sức chứa
      for (let table of availableTables) {
        totalCapacity += table.capacity;

        if (remainingPeople > 0) {
          const peopleAssignedToTable = Math.min(
            remainingPeople,
            table.capacity
          );
          remainingPeople -= peopleAssignedToTable;
          reservedTables.push({
            reservation_id: newOrder.id,
            table_id: table.table_number,
            people_assigned: peopleAssignedToTable,
            start_time: startTime,
            end_time: endTime,
          });
        }

        if (remainingPeople <= 0) {
          break;
        }
      }

      // Kiểm tra nếu tổng sức chứa không đủ cho tất cả khách
      if (remainingPeople > 0) {
        // Không đủ bàn
        await transaction.rollback(); // Rollback transaction nếu không đủ bàn
        res
          .status(400)
          .json({ error: "Not enough available tables to seat all guests." });
        return; // Không lưu vào DB
      }

      // Nếu đủ bàn, lưu thông tin reservation vào DB
      await orderService.createReservations(reservedTables, { transaction });

      // Nếu có món hàng, tạo item orders (mối quan hệ giữa món hàng và đơn hàng)
      if (items && items.length > 0) {
        let itemOrders = items.map((item) => ({
          item_id: item.id,
          quantity: item.quantity,
          order_id: newOrder.id,
        }));

        // Lưu thông tin vào bảng item_order
        await orderService.createItemOrders(itemOrders, { transaction });
      }

      // Commit transaction khi tất cả các thao tác thành công
      await transaction.commit();

      // Trả về kết quả order đã tạo
      res.status(201).json(newOrder);
    } else {
      // Nếu không có bàn trống
      await transaction.rollback(); // Rollback transaction nếu không có bàn trống
      res
        .status(400)
        .json({ error: "No available tables for the selected time" });
    }
  } catch (error) {
    // Xử lý lỗi và rollback transaction
    console.error("Error creating order:", error);
    await transaction.rollback(); // Rollback transaction nếu có lỗi
    res.status(500).json({ error: "Error creating order" });
  }
};


const updateOrder = async (req, res) => {
  try {
    const { id, ...otherFields } = req.body; // Adjust as needed to accept relevant fields
    const {status} = req.body;
    if (!id) {
      return res.status(400).send("Order number required.");
    }
    if (!otherFields || Object.keys(otherFields).length === 0 && !status) {
      return res.status(400).send("No fields to update.");
    }
    // Update the user information in the database
    const updatedOrder = await orderService.updateOrder(id, {
      ...otherFields, // Spread other fields if there are additional updates
    });

    if (!updatedOrder) {
      return res.status(404).send("Order not found!");
    }
    res.json({
      status: "SUCCESS",
      message: "Order updated successfully!",
      Order: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating order" });
  }
};

const updateEvaluate = async (req, res) => { 
  try { 
    const orderId = req.params.orderId;
    const {star, comment} = req.body;
    const updatedOrder = await orderService.updateOrder(orderId, {star, comment});
    if (!updatedOrder) {
      return res.status(404).send("Order not found");
    }
    return res.status(200).json({
      status: "SUCCESS",
      updatedOrder
    });
  } catch(e) { 
    console.log(e);
    return res.status(500).json({error: "Error when update evaluate"});
  }
};

const createShipOrder = async (req, res) => {
  try { 
    const {userInfo, status, type, orderItems} = req.body;
    const customerId = req.user.id;
    // create order_detail for ship
    const newOrder = await orderService.createOrder({status, type, 'customer_id': customerId});
    try {
      // create orderuserinfo
      await createOrderUserInfo({...userInfo, 'order_detail_id': customerId});
      //create itemOrders
      await orderService.createItemOrders(orderItems.map( (item) => (
        {
          'item_id': item.item_id,
          'customer_id': customerId,
          'quantity': item.quantity,
          'order_id': newOrder.id
        })
      ));
    } catch(error) {
      newOrder.destroy();
      res.status(500).json({ error: "Error happend when create ship order 1"});
    }
    res.json({
      status: "Success",
      message: "Create ship order successfully",
      data: newOrder
    });
  } catch(e) {
      console.log(e);
      res.status(500).json({ error: "Error happend when create ship order 2"});
  }
};

module.exports = {
  getAllOrders,
  createOrder,
  updateOrder,
  createShipOrder,
  updateEvaluate,
  getAllOrdersOfCustomer
};