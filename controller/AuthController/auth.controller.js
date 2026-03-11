import bcrypt from "bcryptjs";
import { db } from "../../util/db.js";

// ===================== Common api =============================

// export const sendOtp = async (req, res) => {
//   try {
//     const { mobile } = req.body;

//     if (!mobile) {
//       return res.status(400).json({
//         status: "0",
//         message: "Mobile required",
//       });
//     }
//     const otp = 1234;
//     await db.query("UPDATE userdata SET otp=? WHERE mobile=?", [otp, mobile]);
//     const [users] = await db.query("SELECT * FROM userdata WHERE mobile=?", [
//       mobile,
//     ]);

//     if (users.length === 0) {
//       await db.query("INSERT INTO userdata (mobile, otp) VALUES (?,?)", [
//         mobile,
//         otp,
//       ]);
//     }
//     return res.json({
//       status: "1",
//       message: "OTP sent successfully",
//       otp: `${otp}`,
//     });
//   } catch (error) {
//     return res.json({
//       status: "0",
//       message: "Server error",
//     });
//   }
// };

// export const sendOtp = async (req, res) => {
//   try {
//     const { mobile } = req.body;

//     if (!mobile) {
//       return res.status(400).json({
//         status: "0",
//         message: "Mobile required",
//       });
//     }

//     const otp = 1234;

//     const [users] = await db.query("SELECT * FROM userdata WHERE mobile=?", [
//       mobile,
//     ]);

//     let user;

//     if (users.length > 0) {
//       user = users[0];
//     } else {
//       const [insertResult] = await db.query(
//         "INSERT INTO userdata (mobile) VALUES (?)",
//         [mobile],
//       );
//       const [newUser] = await db.query("SELECT * FROM userdata WHERE id=?", [
//         insertResult.insertId,
//       ]);
//       user = newUser[0];
//     }
//     const formattedUser = Object.fromEntries(
//       Object.entries(user).map(([key, value]) => [
//         key,
//         value === null ? "" : value,
//       ]),
//     );

//     console.log(formattedUser.id);
//     return res.json({
//       status: "1",
//       message: "OTP sent successfully",
//       otp: `${otp}`,
//       result: formattedUser,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.json({
//       status: "0",
//       message: "Server error",
//     });
//   }
// };

export const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        status: "0",
        message: "Mobile required",
        result: {},
      });
    }

    const otp = 1234;

    const [users] = await db.query("SELECT * FROM userdata WHERE mobile=?", [
      mobile,
    ]);

    let user;

    if (users.length > 0) {
      user = users[0];
    } else {
      const [insertResult] = await db.query(
        "INSERT INTO userdata (mobile) VALUES (?)",
        [mobile],
      );

      const [newUser] = await db.query("SELECT * FROM userdata WHERE id=?", [
        insertResult.insertId,
      ]);

      user = newUser[0];
    }

    const formattedUser = Object.fromEntries(
      Object.entries(user).map(([key, value]) => [
        key,
        value === null ? "" : value,
      ]),
    );
    // Vehicle find
    const [vehicles] = await db.query(
      "SELECT * FROM vehicles WHERE driver_id=?",
      [formattedUser.id],
    );

    let vehicle = null;

    if (vehicles.length > 0) {
      vehicle = vehicles[0];

      // null to ""
      vehicle = Object.fromEntries(
        Object.entries(vehicle).map(([key, value]) => [
          key,
          value === null ? "" : value,
        ]),
      );

      // JSON parse
      vehicle.vehicle_images = vehicle.vehicle_images
        ? JSON.parse(vehicle.vehicle_images)
        : [];

      vehicle.driving_licence_images = vehicle.driving_licence_images
        ? JSON.parse(vehicle.driving_licence_images)
        : [];

      vehicle.vehicle_registration_images = vehicle.vehicle_registration_images
        ? JSON.parse(vehicle.vehicle_registration_images)
        : [];

      vehicle.national_image = vehicle.national_image
        ? JSON.parse(vehicle.national_image)
        : [];
    }

    return res.json({
      status: "1",
      message: "OTP sent successfully",
      otp: `${otp}`,
      result: {
        ...formattedUser,
        ...(vehicle && { vehicle }),
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: "0",
      message: "Server error",
    });
  }
};

export const signin = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.json({
        status: "0",
        message: "mobile and otp required",
        result: {},
      });
    }

    const [users] = await db.query(
      "SELECT * FROM userdata WHERE mobile=? AND otp=?",
      [mobile, otp],
    );

    if (users.length === 0) {
      return res.status(400).json({
        status: "0",
        message: "Invalid OTP",
        result: {},
      });
    }

    const userData = users[0];

    return res.json({
      status: "1",
      message: "Login success",
      result: userData,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: "0",
      message: "Server error",
    });
  }
};

export const AddUserDitails = async (req, res) => {
  try {
    const {
      user_id,
      type,
      full_name,
      email,
      lat,
      lng,
      vehicle_type,
      vehicle_number,
      vehicle_capacity,
    } = req.body;

    const profileImage = req.files?.image
      ? `/uploads/${req.files.image[0].filename}`
      : null;

    // update user
    await db.query(
      `UPDATE userdata 
       SET image=?, type=?, full_name=?, email=?, lat=?, lng=? 
       WHERE id=?`,
      [profileImage, type, full_name, email, lat, lng, user_id],
    );

    const [user] = await db.query("SELECT * FROM userdata WHERE id=?", [
      user_id,
    ]);

    // null → "" convert
    const formattedUser = Object.fromEntries(
      Object.entries(user[0]).map(([key, value]) => [
        key,
        value === null ? "" : value,
      ]),
    );

    // agar USER hai to yahi response return
    if (type === "USER") {
      return res.json({
        status: "1",
        message: "User Ditails Add successfully",
        result: {
          user: formattedUser,
        },
      });
    }

    // DRIVER ke liye vehicle images
    const vehicleImages = req.files?.vehicle_image
      ? req.files.vehicle_image.map((file, index) => ({
          id: index + 1,
          url: `/uploads/${file.filename}`,
        }))
      : [];

    const licenceImages = req.files?.driving_licence_image
      ? req.files.driving_licence_image.map((file, index) => ({
          id: index + 1,
          url: `/uploads/${file.filename}`,
        }))
      : [];

    const registrationImages = req.files?.vehicle_registration_image
      ? req.files.vehicle_registration_image.map((file, index) => ({
          id: index + 1,
          url: `/uploads/${file.filename}`,
        }))
      : [];

    const nationalImages = req.files?.national_image
      ? req.files.national_image.map((file, index) => ({
          id: index + 1,
          url: `/uploads/${file.filename}`,
        }))
      : [];

    // vehicle insert National
    const [insertVehicle] = await db.query(
      `INSERT INTO vehicles 
       (driver_id, vehicle_type, vehicle_number, vehicle_capacity, vehicle_images, driving_licence_images, vehicle_registration_images, national_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        vehicle_type,
        vehicle_number,
        vehicle_capacity,
        JSON.stringify(vehicleImages),
        JSON.stringify(licenceImages),
        JSON.stringify(registrationImages),
        JSON.stringify(nationalImages),
      ],
    );

    const [vehicle] = await db.query("SELECT * FROM vehicles WHERE id=?", [
      insertVehicle.insertId,
    ]);

    let vehicleData = vehicle[0];

    vehicleData.vehicle_images = JSON.parse(vehicleData.vehicle_images || "[]");
    vehicleData.driving_licence_images = JSON.parse(
      vehicleData.driving_licence_images || "[]",
    );
    vehicleData.vehicle_registration_images = JSON.parse(
      vehicleData.vehicle_registration_images || "[]",
    );
    vehicleData.national_image = JSON.parse(vehicleData.national_image || "[]");

    return res.json({
      status: "1",
      message: "Driver Ditails Add successfully",
      result: {
        user: formattedUser,
        vehicle: vehicleData,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: "0",
      message: "Server error",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        status: "0",
        message: "User id is required",
        result: {},
      });
    }

    const [userdata] = await db.query(
      `SELECT
      id,
      full_name,
      type,
      mobile,
      email,
      lat,
      lng,
      image
      FROM userdata
      WHERE id = ?`,
      [id],
    );

    if (userdata.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "User not found",
        result: {},
      });
    }

    const user = userdata[0];

    // null → "" convert
    const formattedUser = Object.fromEntries(
      Object.entries(user).map(([key, value]) => [
        key,
        value === null ? "" : value,
      ]),
    );

    let vehicleData = {};

    if (user.type === "DRIVER") {
      const [vehicles] = await db.query(
        "SELECT * FROM vehicles WHERE driver_id = ?",
        [id],
      );

      if (vehicles.length > 0) {
        const v = vehicles[0];

        const attachPathToObjects = (arr) =>
          arr
            ? arr.map((obj) => ({
                ...obj,
                url: `${process.env.IMAGE_PATH}${obj.url}`,
              }))
            : [];

        vehicleData = {
          ...v,
          vehicle_images: attachPathToObjects(
            v.vehicle_images ? JSON.parse(v.vehicle_images) : [],
          ),
          national_image: attachPathToObjects(
            v.national_image ? JSON.parse(v.national_image) : [],
          ),
          driving_licence_images: attachPathToObjects(
            v.driving_licence_images
              ? JSON.parse(v.driving_licence_images)
              : [],
          ),
          vehicle_registration_images: attachPathToObjects(
            v.vehicle_registration_images
              ? JSON.parse(v.vehicle_registration_images)
              : [],
          ),
        };
      }
    }

    // let vehicleData = {};
    // if (user.type === "DRIVER") {
    //   const [vehicles] = await db.query(
    //     "SELECT * FROM vehicles WHERE driver_id = ?",
    //     [id],
    //   );
    //   if (vehicles.length > 0) {
    //     const v = vehicles[0];
    //     vehicleData = {
    //       ...v,
    //       vehicle_images: v.vehicle_images ? JSON.parse(v.vehicle_images) : [],
    //       national_image: v.national_image ? JSON.parse(v.national_image) : [],
    //       driving_licence_images: v.driving_licence_images
    //         ? JSON.parse(v.driving_licence_images)
    //         : [],
    //       vehicle_registration_images: v.vehicle_registration_images
    //         ? JSON.parse(v.vehicle_registration_images)
    //         : [],
    //     };
    //   }
    // }

    // Attach IMAGE_PATH to image
    if (formattedUser.image) {
      formattedUser.image = `${process.env.IMAGE_PATH}${formattedUser.image}`;
    }

    return res.status(200).json({
      status: "1",
      message: "Profile fetched successfully",
      result: {
        user: formattedUser,
        vehicle: vehicleData,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.query;
    const { full_name, mobile, email, lat, lng } = req.body;

    if (!id) {
      return res.status(400).json({
        status: "0",
        message: "User id is required",
        result: {},
      });
    }

    // Check user exists
    const [existingUser] = await db.query(
      "SELECT * FROM userdata WHERE id = ?",
      [id],
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "User not found",
      });
    }

    // Check duplicate email/mobile
    if (email || mobile) {
      const [duplicate] = await db.query(
        "SELECT id FROM userdata WHERE (email = ? OR mobile = ?) AND id != ?",
        [email || "", mobile || "", id],
      );

      if (duplicate.length > 0) {
        return res.status(400).json({
          status: "0",
          message: "Email or mobile already in use",
          result: {},
        });
      }
    }

    // Handle image upload (if using multer)
    const profileImage = req.file
      ? `/uploads/${req.file.filename}`
      : existingUser[0].image;

    await db.query(
      `UPDATE userdata SET
        full_name = ?,
        mobile = ?,
        email = ?,
        lat = ?,
        lng = ?,
        image = ?
       WHERE id = ?`,
      [
        full_name || existingUser[0].full_name,
        mobile || existingUser[0].mobile,
        email ? email.toLowerCase() : existingUser[0].email,
        lat || existingUser[0].lat,
        lng || existingUser[0].lng,
        profileImage,
        id,
      ],
    );

    // Fetch updated user
    const [updatedUser] = await db.query(
      "SELECT * FROM userdata WHERE id = ?",
      [id],
    );

    const { password, ...userData } = updatedUser[0];

    // null → "" convert
    const formattedUser = Object.fromEntries(
      Object.entries(userData).map(([key, value]) => [
        key,
        value === null ? "" : value,
      ]),
    );

    return res.status(200).json({
      status: 1,
      message: "Profile updated successfully",
      result: formattedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const GetOfferBooking = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id) {
      return res.status(400).json({
        status: "0",
        message: "Id is required",
        result: {},
      });
    }

    let statusCondition = "";

    if (status === "SCHEDULED") {
      statusCondition = "bo.status = 'SCHEDULED'";
    } else if (status === "ONGOING") {
      statusCondition = "bo.status IN ('START','PICKUP')";
    } else if (status === "HISTORY") {
      statusCondition = "bo.status IN ('COMPLETE','CANCEL')";
    }

    // const [bookings] = await db.query(
    //   `SELECT
    //    bo.*,

    //    -- user
    //    u.id AS user_id,
    //    u.full_name AS user_name,
    //    u.mobile AS user_mobile,
    //    u.email AS user_email,
    //    u.image AS user_image,
    //    u.lat AS user_lat,
    //    u.lng AS user_lng,

    //    -- driver
    //    d.id AS driver_id,
    //    d.full_name AS driver_name,
    //    d.mobile AS driver_mobile,
    //    d.email AS driver_email,
    //    d.image AS driver_image,
    //    d.lat AS driver_lat,
    //    d.lng AS driver_lng,
    //    d.rating AS driver_rating,

    //    -- request details
    //    r.vehicle_type,
    //    r.drop_address,
    //    r.drop_lat,
    //    r.drop_lng,
    //    r.pick_address,
    //    r.pick_lat,
    //    r.pick_lng,
    //    r.price,
    //    r.goods_type,
    //    r.number_of_items,
    //    r.extra_service,
    //    r.image AS request_image,
    //    r.notes,
    //    r.date,
    //    r.time,
    //    r.temperature,

    //     -- vehicle
    //    v.vehicle_type,
    //    v.vehicle_number,
    //    v.vehicle_capacity

    //    FROM booking_offer bo

    //    LEFT JOIN userdata u ON bo.user_id = u.id
    //    LEFT JOIN userdata d ON bo.driver_id = d.id
    //    LEFT JOIN vehicles v ON d.id = v.driver_id
    //    LEFT JOIN requests r ON bo.request_id = r.id

    //    WHERE ${statusCondition}
    //    AND (bo.driver_id = ? OR bo.user_id = ?)

    //    ORDER BY bo.id DESC`,
    //   [id, id],
    // );

    // const result = bookings.map((item) => ({
    //   offer_data: {
    //     id: item.id,
    //     offer_price: item.offer_price,
    //     estimate_time: item.estimate_time,
    //     message: item.message,
    //     status: item.status,
    //     created_at: item.created_at,
    //   },

    //   request: {
    //     request_id: item.request_id,
    //     vehicle_type: item.vehicle_type,
    //     drop_address: item.drop_address,
    //     drop_lat: item.drop_lat,
    //     drop_lng: item.drop_lng,
    //     pick_address: item.pick_address,
    //     pick_lat: item.pick_lat,
    //     pick_lng: item.pick_lng,
    //     price: item.price,
    //     goods_type: item.goods_type,
    //     number_of_items: item.number_of_items,
    //     extra_service: item.extra_service,
    //     image: item.request_image,
    //     notes: item.notes,
    //     date: item.date,
    //     time: item.time,
    //     temperature: item.temperature,
    //   },

    //   userDetails: {
    //     id: item.user_id,
    //     full_name: item.user_name,
    //     mobile: item.user_mobile,
    //     email: item.user_email,
    //     image: item.user_image,
    //     lat: item.user_lat,
    //     lng: item.user_lng,
    //   },

    //   driverDetails: {
    //     id: item.driver_id,
    //     full_name: item.driver_name,
    //     mobile: item.driver_mobile,
    //     email: item.driver_email,
    //     image: item.driver_image,
    //     lat: item.driver_lat,
    //     lng: item.driver_lng,
    //     rating: item.driver_rating,
    //   },

    //   vehiclesDetails: {
    //     vehicle_type: item.vehicle_type,
    //     vehicle_number: item.vehicle_number,
    //     vehicle_capacity: item.vehicle_capacity
    //   },
    // }));

    const [bookings] = await db.query(
      `SELECT 
       bo.*,

       -- user
       u.id AS user_id,
       u.full_name AS user_name,
       u.mobile AS user_mobile,
       u.email AS user_email,
       u.image AS user_image,
       u.lat AS user_lat,
       u.lng AS user_lng,

       -- driver
       d.id AS driver_id,
       d.full_name AS driver_name,
       d.mobile AS driver_mobile,
       d.email AS driver_email,
       d.image AS driver_image,
       d.lat AS driver_lat,
       d.lng AS driver_lng,
       d.rating AS driver_rating,

       -- request details
       r.vehicle_type,
       r.drop_address,
       r.drop_lat,
       r.drop_lng,
       r.pick_address,
       r.pick_lat,
       r.pick_lng,
       r.price,
       r.goods_type,
       r.number_of_items,
       r.extra_service,
       r.image AS request_image,
       r.notes,
       r.date,
       r.time,
       r.temperature

       

       FROM booking_offer bo

       LEFT JOIN userdata u ON bo.user_id = u.id
       LEFT JOIN userdata d ON bo.driver_id = d.id
       LEFT JOIN requests r ON bo.request_id = r.id

       WHERE ${statusCondition}
       AND (bo.driver_id = ? OR bo.user_id = ?)

       ORDER BY bo.id DESC`,
      [id, id],
    );

    const result = bookings.map((item) => ({
      offer_data: {
        id: item.id,
        offer_price: item.offer_price,
        estimate_time: item.estimate_time,
        message: item.message,
        status: item.status,
        created_at: item.created_at,
      },

      request: {
        request_id: item.request_id,
        vehicle_type: item.vehicle_type,
        drop_address: item.drop_address,
        drop_lat: item.drop_lat,
        drop_lng: item.drop_lng,
        pick_address: item.pick_address,
        pick_lat: item.pick_lat,
        pick_lng: item.pick_lng,
        price: item.price,
        goods_type: item.goods_type,
        number_of_items: item.number_of_items,
        extra_service: item.extra_service,
        image: item.request_image,
        notes: item.notes,
        date: item.date,
        time: item.time,
        temperature: item.temperature,
      },

      userDetails: {
        id: item.user_id,
        full_name: item.user_name,
        mobile: item.user_mobile,
        email: item.user_email,
        image: item.user_image,
        lat: item.user_lat,
        lng: item.user_lng,
      },

      driverDetails: {
        id: item.driver_id,
        full_name: item.driver_name,
        mobile: item.driver_mobile,
        email: item.driver_email,
        image: item.driver_image,
        lat: item.driver_lat,
        lng: item.driver_lng,
        rating: item.driver_rating,
      },
    }));

    return res.status(200).json({
      status: "1",
      message: "bookings fetched successfully",
      result: result,
    });
  } catch (error) {
    console.error("Get scheduled booking error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

// ===================== USER side api =============================

export const sendRequest = async (req, res) => {
  try {
    const {
      userId,
      vehicle_type,
      drop_address,
      drop_lat,
      drop_lng,
      pick_address,
      pick_lat,
      pick_lng,
      price,
      goods_type,
      total_weight,
      number_of_items,
      extra_service,
      notes,
      date,
      time,
      temperature,
    } = req.body;

    const getDistanceKm = (lat1, lng1, lat2, lng2) => {
      const toRad = (value) => (value * Math.PI) / 180;
      const R = 6371;
      lat1 = parseFloat(lat1);
      lng1 = parseFloat(lng1);
      lat2 = parseFloat(lat2);
      lng2 = parseFloat(lng2);
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return (R * c).toFixed(2);
    };

    const distance = getDistanceKm(pick_lat, pick_lng, drop_lat, drop_lng);

    console.log(distance);

    const Image = req.file ? `/uploads/${req.file.filename}` : null;
    const [result] = await db.query(
      `INSERT INTO requests
       (user_id, vehicle_type, drop_address, drop_lat, drop_lng,
        pick_address, pick_lat, pick_lng, total_km, price,
        goods_type, total_weight, number_of_items, extra_service, image, notes, date, time, temperature)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        vehicle_type,
        drop_address,
        drop_lat,
        drop_lng,
        pick_address,
        pick_lat,
        pick_lng,
        distance,
        price,
        goods_type,
        total_weight,
        number_of_items,
        extra_service,
        Image,
        notes,
        date,
        time,
        temperature,
      ],
    );

    // Insert ke baad data fetch karo
    const [requestData] = await db.query(
      "SELECT * FROM requests WHERE id = ?",
      [result.insertId],
    );

    // null → "" convert
    const formattedRequest = Object.fromEntries(
      Object.entries(requestData[0]).map(([key, value]) => [
        key,
        value === null ? "" : value,
      ]),
    );

    return res.status(201).json({
      status: "1",
      message: "Request sent successfully",
      request_id: result.insertId,
      result: formattedRequest,
    });
  } catch (error) {
    console.error("Send request error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

// export const getRequest = async (req, res) => {
//   try {
//     const { userId } = req.query;

//     if (!userId) {
//       return res.status(400).json({
//         status: "0",
//         message: "User id is required",
//         result: {},
//       });
//     }

//     const [requests] = await db.query(
//       "SELECT * FROM requests WHERE user_id = ? ORDER BY id DESC",
//       [userId],
//     );

//     return res.status(200).json({
//       status: "1",
//       message: "Requests fetched successfully",
//       result: requests,
//     });
//   } catch (error) {
//     console.error("Get request error:", error);
//     return res.status(500).json({
//       status: "0",
//       message: "Server error",
//     });
//   }
// };

export const getRequest = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        status: "0",
        message: "User id is required",
        result: {},
      });
    }

    // Fetch all requests for this user
    const [requests] = await db.query(
      "SELECT * FROM requests WHERE user_id = ? ORDER BY id DESC",
      [userId],
    );

    // Loop through requests and add 'pending_offers_count'
    const requestsWithCount = await Promise.all(
      requests.map(async (reqItem) => {
        const [[{ count }]] = await db.query(
          "SELECT COUNT(*) as count FROM booking_offer WHERE request_id = ? AND status = 'PENDING'",
          [reqItem.id],
        );

        return {
          ...reqItem,
          offers_count: count,
          is_offer_available: count > 0 ? 1 : 0,
          image: reqItem.image
            ? `${process.env.IMAGE_PATH}${reqItem.image}`
            : "",
        };
      }),
    );

    return res.status(200).json({
      status: "1",
      message: "Requests fetched successfully",
      result: requestsWithCount,
    });
  } catch (error) {
    console.error("Get request error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

// export const ViewOffer = async (req, res) => {
//   try {
//     const { request_id, user_id } = req.body;

//     if (!request_id || !user_id) {
//       return res.status(400).json({
//         status: "1",
//         message: "request_id and user_id are required",
//         result: {},
//       });
//     }

//     const [offers] = await db.query(
//       `
//       SELECT
//         bo.*,
//         u.full_name AS driver_full_name,
//         u.mobile AS driver_mobile,
//         u.image AS driver_image,
//         u.rating AS driver_rating
//         FROM booking_offer bo
//         JOIN userdata u ON bo.driver_id = u.id
//         WHERE
//         bo.request_id = ?
//         AND bo.user_id = ?
//         AND bo.status = 'PENDING'
//       ORDER BY bo.id DESC
//       `,
//       [request_id, user_id],
//     );

//     return res.status(200).json({
//       status: "1",
//       message:
//         offers.length > 0
//           ? "Offers fetched successfully"
//           : "No pending offers found",
//       result: offers,
//     });
//   } catch (error) {
//     console.error("ViewOffer error:", error);
//     return res.status(500).json({
//       status: "0",
//       message: "Server error",
//     });
//   }
// };

export const ViewOffer = async (req, res) => {
  try {
    const { request_id, user_id } = req.body;

    if (!request_id || !user_id) {
      return res.status(400).json({
        status: "0",
        message: "request_id and user_id are required",
        result: {},
      });
    }

    const [offers] = await db.query(
      `
      SELECT 
        bo.*,
        u.full_name AS driver_full_name,
        u.mobile AS driver_mobile,
        u.image AS driver_image,
        u.rating AS driver_rating,
        u.id AS driver_id
      FROM booking_offer bo
      JOIN userdata u ON bo.driver_id = u.id
      WHERE 
        bo.request_id = ?
        AND bo.user_id = ?
        AND bo.status = 'PENDING'
      ORDER BY bo.id DESC
      `,
      [request_id, user_id],
    );

    if (offers.length === 0) {
      return res.status(200).json({
        status: "1",
        message: "No pending offers found",
        result: [],
      });
    }

    // Function to attach IMAGE_PATH to array of objects
    const attachPathToObjects = (arr) =>
      arr
        ? arr.map((obj) => ({
            ...obj,
            url: `${process.env.IMAGE_PATH}${obj.url}`,
          }))
        : [];

    // Loop through offers and attach vehicle data
    const offersWithVehicle = await Promise.all(
      offers.map(async (offer) => {
        // Get vehicle for this driver
        const [vehicles] = await db.query(
          "SELECT * FROM vehicles WHERE driver_id = ? LIMIT 1",
          [offer.driver_id],
        );

        let vehicleData = {};
        if (vehicles.length > 0) {
          const v = vehicles[0];
          vehicleData = {
            ...v,
            vehicle_images: attachPathToObjects(
              v.vehicle_images ? JSON.parse(v.vehicle_images) : [],
            ),
            national_image: attachPathToObjects(
              v.national_image ? JSON.parse(v.national_image) : [],
            ),
            driving_licence_images: attachPathToObjects(
              v.driving_licence_images
                ? JSON.parse(v.driving_licence_images)
                : [],
            ),
            vehicle_registration_images: attachPathToObjects(
              v.vehicle_registration_images
                ? JSON.parse(v.vehicle_registration_images)
                : [],
            ),
          };
        }

        // null → "" convert
        const formattedRequest = Object.fromEntries(
          Object.entries(offer).map(([key, value]) => [
            key,
            value === null ? "" : value,
          ]),
        );

        // Attach vehicle object to offer
        return {
          ...formattedRequest,
          driver_image: offer.driver_image
            ? `${process.env.IMAGE_PATH}${offer.driver_image}`
            : "",
          vehicle: vehicleData,
        };
      }),
    );

    return res.status(200).json({
      status: "1",
      message: "Offers fetched successfully",
      result: offersWithVehicle,
    });
  } catch (error) {
    console.error("ViewOffer error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const DeleteRequest = async (req, res) => {
  try {
    const { userid, request_id } = req.body;

    if (!userid || !request_id) {
      return res.status(400).json({
        status: "0",
        message: "userid and request_id are required",
        result: {},
      });
    }

    //Check request exists and belongs to user
    const [requestData] = await db.query(
      "SELECT id FROM requests WHERE id = ? AND user_id = ?",
      [request_id, userid],
    );

    if (requestData.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Request not found or unauthorized",
        result: {},
      });
    }

    //  Delete only PENDING offers
    await db.query(
      "DELETE FROM booking_offer WHERE request_id = ? AND status = 'PENDING'",
      [request_id],
    );

    // Delete request
    await db.query("DELETE FROM requests WHERE id = ?", [request_id]);

    return res.status(200).json({
      status: "1",
      message: "Request and pending offers deleted successfully",
    });
  } catch (error) {
    console.error("Delete request error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const ConfirmOffer = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { userid, driver_id, offer_id, request_id } = req.body;

    if (!userid || !request_id || !driver_id || !offer_id) {
      return res.status(400).json({
        status: "0",
        message: "All fields are required",
        result: {},
      });
    }

    await connection.beginTransaction();

    //  Check request belongs to user
    const [requestData] = await connection.query(
      "SELECT id FROM requests WHERE id = ? AND user_id = ?",
      [request_id, userid],
    );
    if (requestData.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: "0",
        message: "Request not found or unauthorized",
        result: {},
      });
    }
    //  Update selected offer to SCHEDULED
    const [updateResult] = await connection.query(
      `UPDATE booking_offer 
       SET status = 'SCHEDULED' 
       WHERE id = ? AND request_id = ? AND driver_id = ?`,
      [offer_id, request_id, driver_id],
    );
    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(400).json({
        status: "0",
        message: "Offer not found",
        result: {},
      });
    }
    //  Delete other PENDING offers
    await connection.query(
      `DELETE FROM booking_offer
       WHERE request_id = ?
       AND status = 'PENDING'`,
      [request_id],
    );

    await connection.query("DELETE FROM requests WHERE id = ?", [request_id]);
    await connection.commit();

    return res.status(200).json({
      status: "1",
      message: "Offer confirmed successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("ConfirmOffer error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  } finally {
    connection.release();
  }
};

export const cancelRide = async (req, res) => {
  try {
    const { offer_id, userid } = req.query;

    if (!offer_id || !userid) {
      return res.status(400).json({
        status: "0",
        message: "offer_id and userid are required",
        result: {},
      });
    }

    // Check booking offer
    const [offer] = await db.query(
      "SELECT * FROM booking_offer WHERE id = ? AND user_id = ?",
      [offer_id, userid],
    );

    if (offer.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Booking offer not found",
        result: {},
      });
    }

    // Update status to CANCEL
    await db.query("UPDATE booking_offer SET status = 'CANCEL' WHERE id = ?", [
      offer_id,
    ]);

    return res.status(200).json({
      status: 1,
      message: "Ride cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel ride error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const SendRating = async (req, res) => {
  try {
    const { fromid, toid, request_id, feedback, stars } = req.query;

    if (!fromid || !toid || !request_id || !stars) {
      return res.json({
        status: "0",
        message: "Required fields missing",
        result: {},
      });
    }

    // rating insert
    await db.query(
      `INSERT INTO ratings 
      (from_id, to_id, request_id, stars, feedback) 
      VALUES (?, ?, ?, ?, ?)`,
      [fromid, toid, request_id, stars, feedback],
    );

    // driver rating calculate
    const [ratingData] = await db.query(
      `SELECT AVG(stars) as rating, COUNT(id) as total 
       FROM ratings 
       WHERE to_id = ?`,
      [toid],
    );

    const rating = ratingData[0].rating;
    const total = ratingData[0].total;

    // update users table
    await db.query(
      `UPDATE userdata 
       SET rating = ?, total_ratings = ? 
       WHERE id = ?`,
      [rating, total, toid],
    );

    return res.json({
      status: 1,
      message: "Rating submitted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: "0",
      message: "Server error",
    });
  }
};

// ===================== driver side api =============================

export const DriverStatus = async (req, res) => {
  try {
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({
        status: "0",
        message: "driverId is required",
        result: {},
      });
    }

    // Find driver
    const [users] = await db.query(
      "SELECT id, status FROM userdata WHERE id = ?",
      [driverId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Driver not found",
        result: {},
      });
    }

    const currentStatus = users[0].status;
    const newStatus = currentStatus === "ACTIVE" ? "DACTIVE" : "ACTIVE";

    // Update status
    await db.query("UPDATE userdata SET status = ? WHERE id = ?", [
      newStatus,
      driverId,
    ]);

    return res.status(200).json({
      status: "1",
      message: `Driver status updated to ${newStatus}`,
      result: { driverId, status: newStatus },
    });
  } catch (error) {
    console.error("toggleDriverStatus error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const getVehicles = async (req, res) => {
  try {
    const { driverId } = req.query;

    if (!driverId) {
      return res.status(400).json({
        status: "0",
        message: "Driver id required",
        result: {},
      });
    }

    const [vehicles] = await db.query(
      "SELECT * FROM vehicles WHERE driver_id = ?",
      [driverId],
    );

    const formattedVehicles = vehicles.map((vehicle) => ({
      ...vehicle,
      vehicle_images: JSON.parse(vehicle.vehicle_images || "[]"),
      driving_licence_images: JSON.parse(
        vehicle.driving_licence_images || "[]",
      ),
      vehicle_registration_images: JSON.parse(
        vehicle.vehicle_registration_images || "[]",
      ),
    }));

    return res.status(200).json({
      status: 1,
      message: "Vehicles fetched successfully",
      result: formattedVehicles,
    });
  } catch (error) {
    console.error("Get vehicle error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { vehicle_id } = req.query;
    const { vehicle_type, vehicle_number, vehicle_capacity } = req.body;

    if (!vehicle_id) {
      return res.status(400).json({
        status: "0",
        message: "vehicle_id is required",
        result: {},
      });
    }

    // vehicle find
    const [vehicleData] = await db.query(
      "SELECT * FROM vehicles WHERE id = ?",
      [vehicle_id],
    );

    if (vehicleData.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Vehicle not found",
        result: {},
      });
    }

    await db.query(
      `UPDATE vehicles 
       SET vehicle_type = ?, 
           vehicle_number = ?, 
           vehicle_capacity = ?
       WHERE id = ?`,
      [vehicle_type, vehicle_number, vehicle_capacity, vehicle_id],
    );

    return res.status(200).json({
      status: 1,
      message: "Vehicle updated successfully",
    });
  } catch (error) {
    console.error("Update vehicle error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const deleteVehicleImage = async (req, res) => {
  try {
    const { vehicle_id, type, image_id } = req.query;

    if (!vehicle_id || !type || !image_id) {
      return res.status(400).json({
        status: "0",
        message: "vehicle_id, type and image_id are required",
        result: {},
      });
    }

    // vehicle find
    const [vehicleData] = await db.query(
      "SELECT * FROM vehicles WHERE id = ?",
      [vehicle_id],
    );

    if (vehicleData.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Vehicle not found",
        result: {},
      });
    }

    const vehicle = vehicleData[0];
    let images = [];
    let columnName = "";

    // type check
    if (type === "vehicle") {
      images = JSON.parse(vehicle.vehicle_images || "[]");
      columnName = "vehicle_images";
    }

    if (type === "licence") {
      images = JSON.parse(vehicle.driving_licence_images || "[]");
      columnName = "driving_licence_images";
    }

    if (type === "registration") {
      images = JSON.parse(vehicle.vehicle_registration_images || "[]");
      columnName = "vehicle_registration_images";
    }

    if (type === "national_image") {
      images = JSON.parse(vehicle.national_image || "[]");
      columnName = "national_image";
    }

    if (!columnName) {
      return res.status(400).json({
        status: "0",
        message: "Invalid type",
        result: {},
      });
    }

    // image remove
    const updatedImages = images.filter((img) => img.id !== Number(image_id));

    await db.query(`UPDATE vehicles SET ${columnName} = ? WHERE id = ?`, [
      JSON.stringify(updatedImages),
      vehicle_id,
    ]);

    return res.status(200).json({
      status: "1",
      message: "Image deleted successfully",
      result: updatedImages,
    });
  } catch (error) {
    console.error("Delete vehicle image error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

// export const getAllRequestsForDriver = async (req, res) => {
//   try {
//     const { driverId } = req.query;

//     if (!driverId) {
//       return res.status(400).json({
//         status: "0",
//         message: "Driver id is required",
//       });
//     }

//     const [requests] = await db.query(
//       `
//       SELECT
//         r.*,
//         u.full_name,
//         u.image,
//         u.mobile,
//         v.vehicle_type
//         FROM requests r
//         JOIN userdata u ON r.user_id = u.id
//         JOIN vehicles v ON v.driver_id = ?
//         WHERE r.vehicle_type = v.vehicle_type
//         AND r.id NOT IN (
//         SELECT request_id
//         FROM request_declines
//         WHERE driver_id = ?
//       )
//       ORDER BY r.id DESC
//       `,
//       [driverId, driverId],
//     );

//     return res.status(200).json({
//       status: "1",
//       message: "Requests fetched successfully",
//       result: requests,
//     });
//   } catch (error) {
//     console.error("Get all requests error:", error);
//     return res.status(500).json({
//       status: "0",
//       message: "Server error",
//     });
//   }
// };

export const getAllRequestsForDriver = async (req, res) => {
  try {
    const { driverId } = req.query;

    if (!driverId) {
      return res.status(400).json({
        status: "0",
        message: "Driver id is required",
        result: {},
      });
    }

    const [requests] = await db.query(
      `
      SELECT 
        r.*,
        u.full_name,
        u.image,
        u.mobile,
        v.vehicle_type
      FROM requests r
      JOIN userdata u ON r.user_id = u.id
      JOIN vehicles v ON v.driver_id = ?
      WHERE r.vehicle_type = v.vehicle_type
      AND r.status = 'PENDING'
      AND r.id NOT IN (
        SELECT request_id 
        FROM request_declines 
        WHERE driver_id = ?
      )
      ORDER BY r.id DESC
      `,
      [driverId, driverId],
    );

    // null → "" convert
    const formattedRequest = Object.fromEntries(
      Object.entries(requests).map(([key, value]) => [
        key,
        value === null ? "" : value,
      ]),
    );

    return res.status(200).json({
      status: "1",
      message: "Requests fetched successfully",
      result: requests,
    });
  } catch (error) {
    console.error("Get all requests error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const declineRequest = async (req, res) => {
  try {
    const { requestId, driverId } = req.query;

    if (!requestId || !driverId) {
      return res.status(400).json({
        status: "0",
        message: "Request id and Driver id are required",
        result: {},
      });
    }

    // Insert decline record
    await db.query(
      "INSERT INTO request_declines (request_id, driver_id) VALUES (?, ?)",
      [requestId, driverId],
    );

    return res.status(200).json({
      status: "1",
      message: "Request declined successfully",
    });
  } catch (error) {
    console.error("Decline request error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const SendOffer = async (req, res) => {
  try {
    const { requestId, driverId, offer_price, estimate_time, message } =
      req.query;

    if (!requestId || !driverId || !offer_price) {
      return res.status(400).json({
        status: "0",
        message: "requestId, driverId and offer_price are required",
        result: {},
      });
    }

    //  Find request & get user_id
    const [requestData] = await db.query(
      "SELECT user_id FROM requests WHERE id = ?",
      [requestId],
    );

    if (requestData.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Request not found",
        result: {},
      });
    }

    const userId = requestData[0].user_id;

    //  Check duplicate offer
    const [existingOffer] = await db.query(
      "SELECT id FROM booking_offer WHERE request_id = ? AND driver_id = ?",
      [requestId, driverId],
    );

    if (existingOffer.length > 0) {
      return res.status(400).json({
        status: "0",
        message: "You have already sent an offer for this request",
        result: {},
      });
    }

    //  Insert offer
    await db.query(
      `INSERT INTO booking_offer 
      (request_id, driver_id, user_id, offer_price, estimate_time, message, status)
      VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
      [requestId, driverId, userId, offer_price, estimate_time, message],
    );

    // //  Update is_offer_available to true
    // await db.query(
    //   "UPDATE requests SET is_offer_available = TRUE WHERE id = ?",
    //   [requestId],
    // );

    return res.status(200).json({
      status: "1",
      message: "Offer sent successfully",
    });
  } catch (error) {
    console.error("Send offer error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const ChangeStatus = async (req, res) => {
  try {
    const { offer_id, driverId } = req.query;

    if (!offer_id || !driverId) {
      return res.status(400).json({
        status: "0",
        message: "offer_id and driverId are required",
      });
    }

    // Check booking offer
    const [offer] = await db.query(
      "SELECT status FROM booking_offer WHERE id = ? AND driver_id = ?",
      [offer_id, driverId],
    );

    if (offer.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Booking offer not found",
      });
    }

    let currentStatus = offer[0].status;
    let newStatus = "";

    if (currentStatus === "SCHEDULED") {
      newStatus = "START";
    } else if (currentStatus === "START") {
      newStatus = "PICKUP";
    } else if (currentStatus === "PICKUP") {
      newStatus = "COMPLETE";
    } else {
      return res.status(400).json({
        status: "0",
        message: "Status cannot be changed",
      });
    }

    // Update status
    await db.query("UPDATE booking_offer SET status = ? WHERE id = ?", [
      newStatus,
      offer_id,
    ]);

    return res.status(200).json({
      status: 1,
      message: `Ride status updated to ${newStatus}`,
    });
  } catch (error) {
    console.error("Change status error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const GetRating = async (req, res) => {
  try {
    const { driver_id } = req.query;

    if (!driver_id) {
      return res.status(400).json({
        status: "0",
        message: "Driver id is required",
      });
    }

    // Get average rating
    const [avgRating] = await db.query(
      `SELECT 
       ROUND(AVG(stars),1) AS average_rating,
       COUNT(id) AS total_ratings
       FROM ratings
       WHERE to_id = ?`,
      [driver_id],
    );

    // Get all rating list with user details
    const [ratings] = await db.query(
      `SELECT 
        r.id,
        r.stars,
        r.feedback,
        r.created_at,
        u.full_name,
        u.image
       FROM ratings r
       JOIN userdata u ON r.from_id = u.id
       WHERE r.to_id = ?
       ORDER BY r.id DESC`,
      [driver_id],
    );

    return res.status(200).json({
      status: 1,
      message: "Driver rating fetched successfully",
      average_rating: avgRating[0].average_rating || 0,
      total_ratings: avgRating[0].total_ratings || 0,
      result: ratings,
    });
  } catch (error) {
    console.error("Get rating error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

// ===================== check new api =============================

// export const sendOtpTwilio = async (req, res) => {
//   try {
//     const { mobile } = req.body;

//     if (!mobile) {
//       return res.json({
//         status: "0",
//         message: "Mobile required",
//       });
//     }

//     await client.verify.v2.services(serviceSid).verifications.create({
//       to: `+91${mobile}`,
//       channel: "sms",
//     });

//     return res.json({
//       status: 1,
//       message: "OTP sent successfully",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.json({
//       status: "0",
//       message: "Failed to send OTP",
//     });
//   }
// };

// export const signUserTwilio = async (req, res) => {
//   try {
//     const { mobile, otp } = req.body;

//     const verification = await client.verify.v2
//       .services(serviceSid)
//       .verificationChecks.create({
//         to: `+91${mobile}`,
//         code: otp,
//       });

//     if (verification.status !== "approved") {
//       return res.json({
//         status: "0",
//         message: "Invalid OTP",
//       });
//     }

//     const [users] = await db.query("SELECT * FROM userdata WHERE mobile=?", [
//       mobile,
//     ]);

//     let userData;

//     if (users.length === 0) {
//       const [insert] = await db.query(
//         "INSERT INTO userdata (mobile) VALUES (?)",
//         [mobile],
//       );

//       const [newUser] = await db.query("SELECT * FROM userdata WHERE id=?", [
//         insert.insertId,
//       ]);

//       userData = newUser[0];
//     } else {
//       userData = users[0];
//     }

//     return res.json({
//       status: 1,
//       message: "Login success",
//       result: userData,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.json({
//       status: "0",
//       message: "Server error",
//     });
//   }
// };

// export const signinUser = async (req, res) => {
//   try {
//     const { mobile, otp } = req.query;

//     if (!mobile || !otp) {
//       return res.json({
//         status: "0",
//         message: "mobile and otp required",
//       });
//     }

//     if (otp !== "1234") {
//       return res.json({
//         status: "0",
//         message: "Invalid OTP",
//       });
//     }

//     const [users] = await db.query("SELECT * FROM userdata WHERE mobile=?", [
//       mobile,
//     ]);

//     let userData;

//     if (users.length === 0) {
//       const [insert] = await db.query(
//         "INSERT INTO userdata (mobile) VALUES (?)",
//         [mobile],
//       );

//       const [newUser] = await db.query("SELECT * FROM userdata WHERE id=?", [
//         insert.insertId,
//       ]);

//       userData = newUser[0];
//     } else {
//       userData = users[0];
//     }

//     return res.json({
//       status: 1,
//       message: "Login success",
//       result: userData,
//     });
//   } catch (error) {
//     console.log("ERROR:", error);
//     return res.json({
//       status: "0",
//       message: error.message,
//     });
//   }
// };
