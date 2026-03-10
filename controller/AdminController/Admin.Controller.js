import { db } from "../../util/db.js";
import fs from "fs";
import path from "path";

export const getUsers = async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({
        status: 0,
        message: "type is required (USER or DRIVER)",
      });
    }

    const query = `SELECT * FROM users WHERE type = ?`;
    const [rows] = await db.query(query, [type]);

    return res.status(200).json({
      status: 1,
      total: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Get users by type error:", error);
    return res.status(500).json({
      status: 0,
      message: "Server error",
    });
  }
};

export const addVehicleType = async (req, res) => {
  try {
    const { title, over_view, example, max_load } = req.body;

    if (!title) {
      return res.status(400).json({
        status: 0,
        message: "Title is required",
      });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      `INSERT INTO vehicle_type 
      (image, title, over_view, example, max_load) 
      VALUES (?, ?, ?, ?, ?)`,
      [image, title, over_view, example, max_load],
    );

    return res.status(201).json({
      status: 1,
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

    return res.status(200).json({
      status: 1,
      message: "Vehicle types fetched successfully",
      result: result,
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

