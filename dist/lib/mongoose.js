"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let isConnected = false;
const connectToDB = async () => {
    mongoose_1.default.set('strictQuery', true);
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is not defined');
        throw new Error('MONGODB_URI is not defined');
    }
    if (isConnected && mongoose_1.default.connection.readyState === 1) {
        console.log('Using existing database connection');
        return;
    }
    try {
        console.log('Connecting to MongoDB...');
        await mongoose_1.default.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        isConnected = true;
        console.log('MongoDB Connected');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        isConnected = false;
        throw error; // Re-throw to let caller handle it
    }
};
exports.connectToDB = connectToDB;
