import express from "express";
import {
  getProfile,
  updateProfile,
  getVehicles,
  sendRequest,
  getRequest,
  getAllRequestsForDriver,
  declineRequest,
  SendOffer,
  ViewOffer,
  DeleteRequest,
  ConfirmOffer,
  SendRating,
  GetRating,
  GetOfferBooking,
  deleteVehicleImage,
  updateVehicle,
  cancelRide,
  AddUserDitails,
  sendOtp,
  signin,
  ChangeStatus,
  DriverStatus,
  GetNotification,
  sendMessage,
  getChatHistory,
  getSingleChat,
  getChatList,
} from "../../controller/AuthController/auth.controller.js";
import upload from "../../middleware/imageUpload.js";
import {
  AddGoodsType,
  addPage,
  addVehicleType,
  AllPendingRequest,
  Approval,
  BlockUnblobk,
  DeleteGoodsType,
  deleteVehicleType,
  getAllBookingOffers,
  getAllVehicles,
  GetGoodsType,
  getPages,
  getUsers,
  getVehicleTypes,
  sendMail,
  UpdateGoodsType,
  updatePages,
  updateVehicleType,
} from "../../controller/AdminController/Admin.Controller.js";

const router = express.Router();

// ===================== Common side api  =============================

router.post("/send_otp", sendOtp);

router.post("/sign_in", signin);

router.post(
  "/add_user_ditails",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "vehicle_image", maxCount: 5 },
    { name: "driving_licence_image", maxCount: 5 },
    { name: "vehicle_registration_image", maxCount: 5 },
    { name: "national_image", maxCount: 5 },
  ]),
  AddUserDitails,
);

router.get("/profile", getProfile);

router.post("/update_profile", upload.single("image"), updateProfile);

router.get("/get_offer_booking", GetOfferBooking);

router.get("/get_notification", GetNotification);

// ===================== USer side api =============================

router.post("/send_request", upload.single("image"), sendRequest);

router.get("/get_user_request", getRequest);

router.post("/view_offers", ViewOffer);

router.post("/delete_user_request", DeleteRequest);

router.post("/confirm_offer", ConfirmOffer);

router.post("/cancel_ride", cancelRide);

router.post("/send_rating", SendRating);

// ===================== driver side api =============================

router.post("/change_driver_status", DriverStatus);

router.get("/get_vehicles", getVehicles);

router.post("/update_vehicle", updateVehicle);

router.post("/delete_vehicle_image", deleteVehicleImage);

router.get("/get_driver_request", getAllRequestsForDriver);

router.post("/decline_request", declineRequest);

router.post("/send_offer", SendOffer);

router.post("/change_status", ChangeStatus);

router.get("/get_rating", GetRating);

// ===================== admin side api =============================

router.get("/get_all_user", getUsers);

router.post("/add_vehicle_type", upload.single("image"), addVehicleType);

router.get("/get_vehicle_type", getVehicleTypes);

router.post("/update_vehicle_type", upload.single("image"), updateVehicleType);

router.post("/delete_vehicle_type", deleteVehicleType);

router.post("/add_goods_type", AddGoodsType);

router.get("/get_goods_type", GetGoodsType);

router.post("/update_goods_type", UpdateGoodsType);

router.delete("/delete_goods_type", DeleteGoodsType);

router.get("/get_pending_requests", AllPendingRequest);

router.get("/get_booking_offers", getAllBookingOffers);

router.post("/add_pages", addPage);

router.get("/get_pages", getPages);

router.put("/update_update", updatePages);

router.post("/send_mail", sendMail);

router.get("/get_all_driver_vehicles", getAllVehicles)

router.post("/approved_user", Approval);

router.post("/block_user", BlockUnblobk);


// ===================== check new api =============================


// ✅ 1. Send Message (text + image)
router.post("/send-message", upload.single("image"), sendMessage);

// ✅ 2. Get Chat History (offer wise)
router.get("/chat-history", getChatHistory);

// ✅ 4. Get Chat List (latest chats)
router.get("/chat-list", getChatList);

// ✅ 3. Get Single Chat (2 users)
router.get("/single-chat", getSingleChat);


export default router;
