import { db } from "../../util/db.js";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "0",
        message: "Email and password are required",
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM admin WHERE email = ? AND password = ?",
      [email, password],
    );

    if (rows.length === 0) {
      return res.status(401).json({
        status: "0",
        message: "Invalid email or password",
      });
    }

    const admin = rows[0];

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      `${process.env.JWT_SECRET}`,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      status: "1",
      message: "Login successful",
      token: token,
      data: admin,
    });
  } catch (error) {
    console.log("Login Error:", error);
    return res.status(500).json({
      status: "0",
      message: "Internal server error",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    let { type, page = 1, limit = 10, search = "" } = req.query;

    if (!type) {
      return res.status(400).json({
        status: 0,
        message: "type is required (USER or DRIVER)",
      });
    }

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let searchQuery = "";
    let values = [type];

    if (search) {
      searchQuery = `AND (full_name LIKE ? OR id LIKE ? OR mobile LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // total count
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM userdata WHERE type = ? ${searchQuery}`,
      values,
    );

    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    // data fetch
    const [rows] = await db.query(
      `SELECT * FROM userdata 
       WHERE type = ? ${searchQuery}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset],
    );

    return res.status(200).json({
      status: 1,
      total,
      totalPages,
      currentPage: page,
      data: rows,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      status: 0,
      message: "Server error",
    });
  }
};

export const addVehicleType = async (req, res) => {
  try {
    const { name, title, over_view, example, max_load } = req.body;

    if (!title) {
      return res.status(400).json({
        status: "0",
        message: "Title is required",
      });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      `INSERT INTO vehicle_type 
      (image, name, title, over_view, example, max_load) 
      VALUES (?, ?, ?, ?, ?)`,
      [image, name, title, over_view, example, max_load],
    );

    return res.status(201).json({
      status: "1",
      message: "Vehicle type added successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Add vehicle type error:", error);
    return res.status(500).json({
      status: 0,
      message: "Server error",
    });
  }
};

export const getVehicleTypes = async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT * FROM vehicle_type ORDER BY id DESC",
    );

    const formattedResult = result.map((item) => ({
      ...item,
      image: item.image ? `${process.env.IMAGE_PATH}${item.image}` : "",
    }));

    return res.status(200).json({
      status: "1",
      message: "Vehicle types fetched successfully",
      result: formattedResult.reverse(),
    });
  } catch (error) {
    console.error("Get vehicle types error:", error);
    return res.status(500).json({
      status: 0,
      message: "Server error",
    });
  }
};

export const updateVehicleType = async (req, res) => {
  try {
    const { vehicle_id, title, over_view, example, max_load } = req.body;

    if (!vehicle_id) {
      return res.status(400).json({
        status: 0,
        message: "Vehicle id is required",
      });
    }

    if (!title) {
      return res.status(400).json({
        status: 0,
        message: "Title is required",
      });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    let query = "";
    let values = [];

    if (image) {
      query = `UPDATE vehicle_type 
               SET image=?, title=?, over_view=?, example=?, max_load=? 
               WHERE id=?`;

      values = [image, title, over_view, example, max_load, vehicle_id];
    } else {
      query = `UPDATE vehicle_type 
               SET title=?, over_view=?, example=?, max_load=? 
               WHERE id=?`;

      values = [title, over_view, example, max_load, vehicle_id];
    }

    const [result] = await db.query(query, values);

    return res.status(200).json({
      status: 1,
      message: "Vehicle type updated successfully",
    });
  } catch (error) {
    console.error("Update vehicle type error:", error);
    return res.status(500).json({
      status: 0,
      message: "Server error",
    });
  }
};

export const deleteVehicleType = async (req, res) => {
  try {
    const { vehicle_id } = req.body;

    if (!vehicle_id) {
      return res.status(400).json({
        status: 0,
        message: "Vehicle id is required",
      });
    }

    const [vehicle] = await db.query(
      "SELECT image FROM vehicle_type WHERE id=?",
      [vehicle_id],
    );

    if (vehicle.length === 0) {
      return res.status(404).json({
        status: 0,
        message: "Vehicle not found",
      });
    }

    const image = vehicle[0].image;

    if (image) {
      const imagePath = path.join("uploads", image.replace("/uploads/", ""));

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // record delete
    await db.query("DELETE FROM vehicle_type WHERE id=?", [vehicle_id]);

    return res.status(200).json({
      status: 1,
      message: "Vehicle type deleted successfully",
    });
  } catch (error) {
    console.error("Delete vehicle type error:", error);

    return res.status(500).json({
      status: 0,
      message: "Server error",
    });
  }
};

export const AddGoodsType = async (req, res) => {
  try {
    const { goods_type } = req.body;

    if (!goods_type) {
      return res.status(400).json({
        status: "0",
        message: "goods_type is required",
        result: {},
      });
    }

    const [result] = await db.query(
      "INSERT INTO goods_type (goods_type) VALUES (?)",
      [goods_type],
    );

    return res.status(200).json({
      status: "1",
      message: "Goods type added successfully",
      result: {
        id: result.insertId,
        goods_type,
      },
    });
  } catch (error) {
    console.log("Add goods type error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const GetGoodsType = async (req, res) => {
  try {
    const [goods] = await db.query("SELECT * FROM goods_type ORDER BY id DESC");

    return res.status(200).json({
      status: "1",
      message: "Goods type fetched successfully",
      result: goods,
    });
  } catch (error) {
    console.log("Get goods type error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const UpdateGoodsType = async (req, res) => {
  try {
    const { id, goods_type } = req.body;

    if (!id || !goods_type) {
      return res.status(400).json({
        status: "0",
        message: "id and goods_type are required",
      });
    }

    const [result] = await db.query(
      "UPDATE goods_type SET goods_type=? WHERE id=?",
      [goods_type, id],
    );

    if (result.affectedRows === 0) {
      return res.json({
        status: "0",
        message: "Goods type not found",
      });
    }

    return res.json({
      status: "1",
      message: "Goods type updated successfully",
    });
  } catch (error) {
    console.log("Update goods type error:", error);
    return res.json({
      status: "0",
      message: "Server error",
    });
  }
};

export const DeleteGoodsType = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.json({
        status: "0",
        message: "id is required",
      });
    }

    const [result] = await db.query("DELETE FROM goods_type WHERE id=?", [id]);

    if (result.affectedRows === 0) {
      return res.json({
        status: "0",
        message: "Goods type not found",
      });
    }

    return res.json({
      status: "1",
      message: "Goods type deleted successfully",
    });
  } catch (error) {
    console.log("Delete goods type error:", error);
    return res.json({
      status: "0",
      message: "Server error",
    });
  }
};

export const AllPendingRequest = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let searchQuery = "";
    let values = [];

    if (search) {
      searchQuery = `AND (vehicle_type LIKE ? OR goods_type LIKE ? OR id LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // total count
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM requests 
       WHERE status = 'PENDING' ${searchQuery}`,
      values,
    );

    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    // data fetch
    const [rows] = await db.query(
      `SELECT * FROM requests 
       WHERE status = 'PENDING' ${searchQuery}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset],
    );

    return res.status(200).json({
      status: 1,
      total,
      totalPages,
      currentPage: page,
      result: rows,
    });
  } catch (error) {
    console.error("Get pending requests error:", error);
    return res.status(500).json({
      status: 0,
      message: "Server error",
      result: [],
    });
  }
};

export const getAllBookingOffers = async (req, res) => {
  try {
    let { status, page = 1, limit = 10, search = "" } = req.query;

    if (!status) {
      return res.status(400).json({
        status: "0",
        message: "Status is required",
      });
    }

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let searchQuery = "";
    let values = [status];

    if (search) {
      searchQuery = `
        AND (
          u.full_name LIKE ?
          OR d.full_name LIKE ?
          OR u.mobile LIKE ?
          OR d.mobile LIKE ?
          OR bo.vehicle_type LIKE ?
          OR bo.goods_type LIKE ?
          OR CAST(bo.id AS CHAR) LIKE ?
        )
      `;

      values.push(
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
      );
    }

    const [rows] = await db.query(
      `SELECT 
        -- offer
        bo.id,
        bo.offer_price,
        bo.estimate_time,
        bo.message,
        bo.status,
        bo.created_at,

        -- request details (booking_offer se)
        bo.request_id,
        bo.vehicle_type,
        bo.drop_address,
        bo.drop_lat,
        bo.drop_lng,
        bo.pick_address,
        bo.pick_lat,
        bo.pick_lng,
        bo.price,
        bo.goods_type,
        bo.total_weight,
        bo.number_of_items,
        bo.extra_service,
        bo.notes,
        bo.date,
        bo.time,
        bo.temperature,
        bo.distance,

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
        d.rating AS driver_rating

      FROM booking_offer bo
      LEFT JOIN userdata u ON bo.user_id = u.id
      LEFT JOIN userdata d ON bo.driver_id = d.id

      WHERE bo.status = ? ${searchQuery}

      ORDER BY bo.id DESC
      LIMIT ? OFFSET ?`,
      [...values, limit, offset],
    );

    const [count] = await db.query(
      `SELECT COUNT(*) AS total
       FROM booking_offer bo
       LEFT JOIN userdata u ON bo.user_id = u.id
       LEFT JOIN userdata d ON bo.driver_id = d.id
       WHERE bo.status = ? ${searchQuery}`,
      values,
    );

    const total = count[0].total;
    const totalPages = Math.ceil(total / limit);

    const result = rows.map((item) => ({
      id: item.id,
      offer_price: item.offer_price,
      estimate_time: item.estimate_time,
      message: item.message,
      status: item.status,
      created_at: item.created_at,
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
      total_weight: item.total_weight,
      number_of_items: item.number_of_items,
      extra_service: item.extra_service,
      notes: item.notes,
      date: item.date,
      time: item.time,
      temperature: item.temperature,
      distance: item.distance,
      userDetails: {
        id: item.user_id,
        full_name: item.user_name,
        mobile: item.user_mobile,
        email: item.user_email,
        image: `${process.env.IMAGE_PATH}${item.user_image}`,
        lat: item.user_lat,
        lng: item.user_lng,
      },
      driverDetails: {
        id: item.driver_id,
        full_name: item.driver_name,
        mobile: item.driver_mobile,
        email: item.driver_email,
        image: `${process.env.IMAGE_PATH}${item.driver_image}`,
        lat: item.driver_lat,
        lng: item.driver_lng,
        rating: item.driver_rating,
      },
    }));

    return res.status(200).json({
      status: "1",
      message: "Bookings fetched successfully",
      result,
      totalPages,
      total,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const addPage = async (req, res) => {
  try {
    const { pageType, content } = req.body;

    if (!pageType) {
      return res.status(400).json({
        status: "0",
        message: "Page type is required",
      });
    }

    // check already exist
    const [existing] = await db.query(
      "SELECT * FROM pages WHERE page_type = ?",
      [pageType],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        status: "0",
        message: "Page already exists",
      });
    }

    // insert page
    await db.query("INSERT INTO pages (page_type, content) VALUES (?, ?)", [
      pageType,
      content || "",
    ]);

    return res.status(200).json({
      status: "1",
      message: "Page added successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const getPages = async (req, res) => {
  try {
    const { pageType } = req.query;

    const [rows] = await db.query("SELECT * FROM pages");

    let response = {
      HelpSupport: {},
      PrivacyPolicy: {},
      TermsCondition: {},
    };

    rows.forEach((item) => {
      if (item.page_type === "HELP_SUPPORT") {
        response.HelpSupport = item;
      }

      if (item.page_type === "PRIVACY_POLICY") {
        response.PrivacyPolicy = item;
      }

      if (item.page_type === "TERMS_CONDITION") {
        response.TermsCondition = item;
      }
    });

    if (pageType) {
      if (pageType === "HELP_SUPPORT") {
        return res.json({ pageList: response.HelpSupport });
      }

      if (pageType === "PRIVACY_POLICY") {
        return res.json({ pageList: response.PrivacyPolicy });
      }

      if (pageType === "TERMS_CONDITION") {
        return res.json({ pageList: response.TermsCondition });
      }
    }

    return res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "0",
      message: "Server Error",
    });
  }
};

export const updatePages = async (req, res) => {
  try {
    const { pageType } = req.query;
    const { content } = req.body;

    if (!pageType) {
      return res.json({
        status: "0",
        message: "Page type required",
      });
    }

    await db.query("UPDATE pages SET content=? WHERE page_type=?", [
      content,
      pageType,
    ]);

    return res.json({
      status: "1",
      message: "Page updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "0",
      message: "Server Error",
    });
  }
};

export const sendMail = async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: `<p>${message}</p>`,
    });

    return res.json({
      status: "1",
      message: "Mail sent successfully",
    });
  } catch (error) {
    console.log("MAIL ERROR:", error);
    return res.status(500).json({
      status: "0",
      message: error.message,
    });
  }
};

export const getAllVehicles = async (req, res) => {
  try {
    const [vehicles] = await db.query(`
  SELECT 
    v.*, 
    u.id AS user_id,
    u.full_name AS driver_name,
    u.email AS driver_email,
    u.mobile AS driver_mobile,
    u.image AS driver_image
  FROM vehicles v
  LEFT JOIN userdata u ON v.driver_id = u.id
  ORDER BY v.id DESC
`);

    const formattedVehicles = vehicles.map((vehicle) => {
      let vehicle_images = [];
      let driving_licence_images = [];
      let vehicle_registration_images = [];
      let national_image = [];

      try {
        vehicle_images = JSON.parse(vehicle.vehicle_images || "[]");
      } catch (e) {}

      try {
        driving_licence_images = JSON.parse(
          vehicle.driving_licence_images || "[]",
        );
      } catch (e) {}

      try {
        vehicle_registration_images = JSON.parse(
          vehicle.vehicle_registration_images || "[]",
        );
      } catch (e) {}
      try {
        national_image = JSON.parse(vehicle.national_image || "[]");
      } catch (e) {}

      return {
        id: vehicle.id,
        driver_id: vehicle.driver_id,
        vehicle_type: vehicle.vehicle_type,
        vehicle_number: vehicle.vehicle_number,
        vehicle_capacity: vehicle.vehicle_capacity,
        driver: {
          id: vehicle.user_id,
          name: vehicle.driver_name,
          email: vehicle.driver_email,
          mobile: vehicle.driver_mobile,
          image: vehicle.driver_image,
        },
        vehicle_images,
        driving_licence_images,
        vehicle_registration_images,
        national_image,
      };
    });

    return res.status(200).json({
      status: 1,
      message: "All vehicles fetched successfully",
      result: formattedVehicles,
    });
  } catch (error) {
    console.error("Get all vehicles error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const Approval = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        status: "0",
        message: "userId is required",
      });
    }

    const [rows] = await db.query(
      "SELECT approved FROM userdata WHERE id = ?",
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "User not found",
      });
    }

    const newStatus = rows[0].approved === "YES" ? "NO" : "YES";

    await db.query("UPDATE userdata SET approved = ? WHERE id = ?", [
      newStatus,
      userId,
    ]);

    return res.status(200).json({
      status: "1",
      message: `User approval changed to ${newStatus}`,
    });
  } catch (error) {
    console.error("Toggle approval error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};

export const BlockUnblobk = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        status: "0",
        message: "userId is required",
      });
    }

    const [rows] = await db.query(
      "SELECT block_unblock FROM userdata WHERE id = ?",
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "User not found",
      });
    }

    const newStatus = rows[0].block_unblock === "BLOCK" ? "UNBLOCK" : "BLOCK";

    await db.query("UPDATE userdata SET block_unblock = ? WHERE id = ?", [
      newStatus,
      userId,
    ]);

    return res.status(200).json({
      status: "1",
      message: `User is now ${newStatus}`,
    });
  } catch (error) {
    console.error("Toggle block error:", error);
    return res.status(500).json({
      status: "0",
      message: "Server error",
    });
  }
};
