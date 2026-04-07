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
  deleteAccount,
  createPaymentIntent,
  GetSemiGoodsTypeById,
} from "../../controller/AuthController/auth.controller.js";
import upload from "../../middleware/imageUpload.js";
import {
  AddGoodsType,
  addPage,
  AddSemiGoodsType,
  addVehicleType,
  adminLogin,
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
  AddUserDitails
);

router.get("/profile", getProfile);

router.post("/update_profile", upload.single("image"), updateProfile);

router.get("/get_offer_booking", GetOfferBooking);

router.get("/get_notification", GetNotification);

router.post("/delete_account", deleteAccount);

// ===================== USer side api =============================

router.post("/send_request", upload.array("images", 5), sendRequest);

router.get("/get_semi_goods_type", GetSemiGoodsTypeById);

router.get("/get_user_request", getRequest);

router.post("/view_offers", ViewOffer);

router.post("/delete_user_request", DeleteRequest);

router.post("/create-payment-intent", createPaymentIntent);
router.post("/confirm_offer", ConfirmOffer);

router.post("/cancel_ride", cancelRide);

router.post("/send_rating", SendRating);

// ===================== driver side api =============================

router.post("/change_driver_status", DriverStatus);

router.get("/get_vehicles", getVehicles);

router.post(
  "/update_vehicle",
  upload.fields([
    { name: "vehicle_image", maxCount: 10 },
    { name: "driving_licence_image", maxCount: 5 },
    { name: "vehicle_registration_image", maxCount: 5 },
    { name: "national_image", maxCount: 5 },
  ]),
  updateVehicle
);

router.post("/delete_vehicle_image", deleteVehicleImage);

router.get("/get_driver_request", getAllRequestsForDriver);

router.post("/decline_request", declineRequest);

router.post("/send_offer", SendOffer);

router.post("/change_status", ChangeStatus);

router.get("/get_rating", GetRating);

// ===================== admin side api =============================

router.post("/admin_login", adminLogin);

router.get("/get_all_user", getUsers);

router.post("/add_vehicle_type", upload.single("image"), addVehicleType);

router.get("/get_vehicle_type", getVehicleTypes);

router.post("/update_vehicle_type", upload.single("image"), updateVehicleType);

router.post("/delete_vehicle_type", deleteVehicleType);

router.post("/add_goods_type", upload.single("image"), AddGoodsType);

router.post("/add_semi_goods_type", upload.single("image"), AddSemiGoodsType);

router.get("/get_goods_type", GetGoodsType);

router.post("/update_goods_type", UpdateGoodsType);

router.delete("/delete_goods_type", DeleteGoodsType);

router.get("/get_pending_requests", AllPendingRequest);

router.get("/get_booking_offers", getAllBookingOffers);

router.post("/add_pages", addPage);

router.get("/get_pages", getPages);

router.put("/update_update", updatePages);

router.post("/send_mail", sendMail);

router.get("/get_all_driver_vehicles", getAllVehicles);

router.post("/approved_user", Approval);

router.post("/block_user", BlockUnblobk);

// ===================== chat route api =============================

router.post("/send_message", upload.single("image"), sendMessage);

router.get("/chat_history", getChatHistory);

router.get("/chat_list", getChatList);

router.get("/single-chat", getSingleChat);

// ===================== check new api =============================

export default router;
