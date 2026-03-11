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
} from "../../controller/AuthController/auth.controller.js";
import upload from "../../middleware/imageUpload.js";
import {
  addVehicleType,
  deleteVehicleType,
  getUsers,
  getVehicleTypes,
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

// ===================== check new api =============================

export default router;
