const express = require("express");
const cors = require("cors");
const app = express();
const { Server } = require("socket.io");
const { createServer } = require("node:http");
const server = createServer(app);
const io = new Server(server);
const Message = require("./models/message.js");
const conversationService = require("./services/conversation.service.js");
require("dotenv").config();

const userRoutes = require("./routes/user.routes"); // Import route user
const conversationRoutes = require("./routes/conversation.routes");

const tableRouter = require("./routes/table.routes.js");
const orderRouter = require("./routes/order.routes.js");
const itemRouter = require("./routes/item.routes.js");

const sequelize = require("./config/db.config.js");

app.use(cors());
app.use(express.json()); // Parse các request có nội dung dạng JSON
app.use(express.urlencoded({ extended: true })); // Parse các request có nội dung dạng URL-encoded

app.use("/api/auth", userRoutes);
app.use("/api/conversation", conversationRoutes);

// app.use("/api/message", messageRoutes);
app.use("/tables", tableRouter);
app.use("/orders", orderRouter);
app.use("/item", itemRouter);

// chat through socket
let users = {};

io.on("connection", (socket) => {
  socket.on("join", (userData) => {
    users[socket.id] = userData; // user_id
  });
  socket.on("send_message", async (messageData) => {
    const { sender_id, receiver_id, conversation_id, message } = messageData;

    const recipientSocketId = Object.keys(users).find(
      (id) => users[id].id === receiver_id
    );
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receive_message", {
        from: sender_id,
        message: message,
      });
    } else {
      console.log("Recipient not found");
    }
    await Message.create({
      sender_id: sender_id,
      conversation_id: conversation_id,
      content: message,
    });
  });
  socket.on("disconect", () => {
    console.log("User disconnected", socket.id);
    delete users[socket.id];
  });
});

// Kết nối database và chạy server
const PORT = process.env.PORT || 8080;

sequelize
  .sync()
  // nếu muốn đồng bộ db bỏ comment dòng này
  // .sync({alter: true})
  .then(() => {
    console.log("Database & tables created!");
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}/`);
    });
  })
  .catch((err) => console.error("Unable to connect to the database:", err));
