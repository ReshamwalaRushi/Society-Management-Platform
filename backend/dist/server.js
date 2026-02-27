"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/society_management')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('join-society', (societyId) => {
        socket.join(societyId);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
app.set('io', io);
const auth_1 = __importDefault(require("./routes/auth"));
const residents_1 = __importDefault(require("./routes/residents"));
const units_1 = __importDefault(require("./routes/units"));
const bills_1 = __importDefault(require("./routes/bills"));
const payments_1 = __importDefault(require("./routes/payments"));
const facilities_1 = __importDefault(require("./routes/facilities"));
const visitors_1 = __importDefault(require("./routes/visitors"));
const complaints_1 = __importDefault(require("./routes/complaints"));
const announcements_1 = __importDefault(require("./routes/announcements"));
const security_1 = __importDefault(require("./routes/security"));
const vehicles_1 = __importDefault(require("./routes/vehicles"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
app.use('/api/auth', auth_1.default);
app.use('/api/residents', residents_1.default);
app.use('/api/units', units_1.default);
app.use('/api/bills', bills_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/facilities', facilities_1.default);
app.use('/api/visitors', visitors_1.default);
app.use('/api/complaints', complaints_1.default);
app.use('/api/announcements', announcements_1.default);
app.use('/api/security', security_1.default);
app.use('/api/vehicles', vehicles_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
